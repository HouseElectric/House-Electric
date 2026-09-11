import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendAmcActivatedEmail } from "@/lib/brevo";

async function getAuthedUser(request) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !supabaseAdmin) return null;
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);
  return user;
}

const FREQUENCY_MONTHS = { monthly: 1, quarterly: 3, half_yearly: 6, yearly: 12 };

function addMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function generateVisitDates(startDate, durationMonths, frequency) {
  const interval = FREQUENCY_MONTHS[frequency] || 3;
  const count = Math.max(1, Math.floor(durationMonths / interval));
  const dates = [];
  for (let i = 1; i <= count; i++) dates.push(addMonths(startDate, interval * i));
  return dates;
}

export async function POST(request) {
  const user = await getAuthedUser(request);
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }

  // Never trust the client's "payment succeeded" claim on its own — verify the
  // signature Razorpay generated with the key secret before touching any records.
  const valid = verifyRazorpaySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  if (!valid) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  try {
    if (type === "invoice") {
      const { invoiceId } = body;
      const { data: invoice } = await supabaseAdmin.from("invoices").select("*").eq("id", invoiceId).maybeSingle();
      if (!invoice || invoice.customer_id !== user.id) {
        return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
      }

      await supabaseAdmin
        .from("invoices")
        .update({
          payment_status: "paid",
          paid_amount: invoice.total_amount,
          razorpay_order_id,
          razorpay_payment_id,
          payment_reference: razorpay_payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoiceId);

      await supabaseAdmin.from("notifications").insert([
        {
          customer_id: user.id,
          title: "Payment successful",
          message: `Your payment for invoice ${invoice.invoice_number} was received. Thank you!`,
        },
      ]);

      return NextResponse.json({ ok: true });
    }

    if (type === "amc") {
      const { planId, renewFromId } = body;
      const { data: plan } = await supabaseAdmin.from("amc_plans").select("*").eq("id", planId).maybeSingle();
      if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

      let startDate = new Date().toISOString().slice(0, 10);
      if (renewFromId) {
        const { data: oldSub } = await supabaseAdmin
          .from("amc_subscriptions")
          .select("expiry_date")
          .eq("id", renewFromId)
          .eq("customer_id", user.id)
          .maybeSingle();
        if (oldSub && new Date(oldSub.expiry_date) > new Date()) startDate = oldSub.expiry_date;
      }

      const durationMonths = plan.duration_months || 12;
      const expiryDate = addMonths(startDate, durationMonths);
      const visitDates = generateVisitDates(startDate, durationMonths, plan.visit_frequency || "quarterly");

      const { data: created } = await supabaseAdmin
        .from("amc_subscriptions")
        .insert([
          {
            customer_id: user.id,
            plan_id: plan.id,
            plan_name_snapshot: plan.name,
            coverage_snapshot: plan.coverage || [],
            start_date: startDate,
            expiry_date: expiryDate,
            duration_months: durationMonths,
            next_visit_date: visitDates[0] || null,
            amount_paid: plan.price,
            razorpay_order_id,
            razorpay_payment_id,
            renewed_from: renewFromId || null,
            status: "active",
          },
        ])
        .select()
        .single();

      if (created) {
        if (visitDates.length > 0) {
          await supabaseAdmin
            .from("amc_visits")
            .insert(visitDates.map((d) => ({ subscription_id: created.id, scheduled_date: d })));
        }
        if (renewFromId) {
          await supabaseAdmin.from("amc_subscriptions").update({ status: "expired" }).eq("id", renewFromId);
        }
        await supabaseAdmin.from("notifications").insert([
          {
            customer_id: user.id,
            title: renewFromId ? "AMC Renewed" : "AMC Activated",
            message: `Your AMC ${created.amc_number} (${plan.name}) is now active until ${expiryDate}.`,
          },
        ]);

        // Email confirmation — failure here must never fail the payment response,
        // the payment itself already succeeded and is recorded above.
        try {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("name, email")
            .eq("id", user.id)
            .maybeSingle();
          const to = profile?.email || user.email;
          if (to) {
            await sendAmcActivatedEmail({
              to,
              name: profile?.name,
              amcNumber: created.amc_number,
              planName: plan.name,
              startDate,
              expiryDate,
              amountPaid: `₹${Number(plan.price).toLocaleString("en-IN")}`,
              isRenewal: !!renewFromId,
            });
          }
        } catch (emailErr) {
          console.error("AMC activation email failed:", emailErr.message);
        }
      }

      return NextResponse.json({ ok: true, subscriptionId: created?.id });
    }

    return NextResponse.json({ error: "Invalid payment type." }, { status: 400 });
  } catch (err) {
    console.error("payment verify error:", err);
    return NextResponse.json({ error: err.message || "Failed to confirm payment." }, { status: 500 });
  }
}
