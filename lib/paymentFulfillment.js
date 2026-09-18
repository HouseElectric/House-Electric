import { supabaseAdmin } from "./supabaseAdmin";
import { sendAmcActivatedEmail } from "./brevo";

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

// Each fulfill* function is idempotent — safe to call twice for the same order_id
// (e.g. once from the client-side verify call, once from the async webhook).

export async function fulfillInvoicePayment({ invoiceId, orderId, paymentId, customerId }) {
  const { data: invoice } = await supabaseAdmin.from("invoices").select("*").eq("id", invoiceId).maybeSingle();
  if (!invoice) return { ok: false, error: "Invoice not found." };
  if (customerId && invoice.customer_id !== customerId) return { ok: false, error: "Invoice not found." };
  if (invoice.payment_status === "paid") return { ok: true, alreadyProcessed: true };

  await supabaseAdmin
    .from("invoices")
    .update({
      payment_status: "paid",
      paid_amount: invoice.total_amount,
      cashfree_order_id: orderId,
      cashfree_payment_id: paymentId,
      payment_reference: paymentId || orderId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoiceId);

  if (invoice.customer_id) {
    await supabaseAdmin.from("notifications").insert([
      {
        customer_id: invoice.customer_id,
        title: "Payment successful",
        message: `Your payment for invoice ${invoice.invoice_number} was received. Thank you!`,
      },
    ]);
  }

  return { ok: true };
}

export async function fulfillQuotationPayment({ quotationId, orderId, paymentId, customerId }) {
  const { data: quotation } = await supabaseAdmin.from("quotations").select("*").eq("id", quotationId).maybeSingle();
  if (!quotation) return { ok: false, error: "Quotation not found." };
  if (customerId && quotation.customer_id !== customerId) return { ok: false, error: "Quotation not found." };
  if (quotation.status === "paid") return { ok: true, alreadyProcessed: true };
  if (quotation.status !== "accepted") return { ok: false, error: "Please accept the quotation before paying." };

  const { data: invoice, error: invoiceErr } = await supabaseAdmin
    .from("invoices")
    .insert([
      {
        customer_id: quotation.customer_id,
        customer_name: quotation.customer_name,
        customer_email: quotation.customer_email,
        customer_mobile: quotation.customer_mobile,
        quotation_id: quotation.id,
        service_request_id: quotation.service_request_id,
        items: quotation.items,
        gst_percent: quotation.gst_percent,
        total_amount: quotation.total,
        paid_amount: quotation.total,
        payment_status: "paid",
        payment_reference: paymentId || orderId,
        cashfree_order_id: orderId,
        cashfree_payment_id: paymentId,
      },
    ])
    .select()
    .single();
  if (invoiceErr) throw invoiceErr;

  await supabaseAdmin
    .from("quotations")
    .update({ status: "paid", cashfree_order_id: orderId, updated_at: new Date().toISOString() })
    .eq("id", quotationId);

  await supabaseAdmin.from("notifications").insert([
    {
      customer_id: quotation.customer_id,
      title: "Payment successful",
      message: `Your payment for quotation ${quotation.quotation_number} was received. Thank you!`,
    },
    {
      customer_id: quotation.customer_id,
      title: "New invoice generated",
      message: `Invoice ${invoice.invoice_number} for ₹${Number(invoice.total_amount).toLocaleString("en-IN")} has been generated.`,
    },
  ]);

  return { ok: true, invoiceId: invoice.id };
}

export async function fulfillAmcPayment({ planId, renewFromId, orderId, paymentId, customerId }) {
  const { data: existing } = await supabaseAdmin
    .from("amc_subscriptions")
    .select("id")
    .eq("cashfree_order_id", orderId)
    .maybeSingle();
  if (existing) return { ok: true, subscriptionId: existing.id, alreadyProcessed: true };

  const { data: plan } = await supabaseAdmin.from("amc_plans").select("*").eq("id", planId).maybeSingle();
  if (!plan) return { ok: false, error: "Plan not found." };

  let startDate = new Date().toISOString().slice(0, 10);
  if (renewFromId) {
    const { data: oldSub } = await supabaseAdmin
      .from("amc_subscriptions")
      .select("expiry_date, customer_id")
      .eq("id", renewFromId)
      .maybeSingle();
    if (oldSub && (!customerId || oldSub.customer_id === customerId) && new Date(oldSub.expiry_date) > new Date()) {
      startDate = oldSub.expiry_date;
    }
  }

  const durationMonths = plan.duration_months || 12;
  const expiryDate = addMonths(startDate, durationMonths);
  const visitDates = generateVisitDates(startDate, durationMonths, plan.visit_frequency || "quarterly");

  const { data: created, error } = await supabaseAdmin
    .from("amc_subscriptions")
    .insert([
      {
        customer_id: customerId,
        plan_id: plan.id,
        plan_name_snapshot: plan.name,
        coverage_snapshot: plan.coverage || [],
        start_date: startDate,
        expiry_date: expiryDate,
        duration_months: durationMonths,
        next_visit_date: visitDates[0] || null,
        amount_paid: plan.price,
        cashfree_order_id: orderId,
        cashfree_payment_id: paymentId,
        renewed_from: renewFromId || null,
        status: "active",
      },
    ])
    .select()
    .single();
  if (error) throw error;

  if (visitDates.length > 0) {
    await supabaseAdmin.from("amc_visits").insert(visitDates.map((d) => ({ subscription_id: created.id, scheduled_date: d })));
  }
  if (renewFromId) {
    await supabaseAdmin.from("amc_subscriptions").update({ status: "expired" }).eq("id", renewFromId);
  }
  await supabaseAdmin.from("notifications").insert([
    {
      customer_id: customerId,
      title: renewFromId ? "AMC Renewed" : "AMC Activated",
      message: `Your AMC ${created.amc_number} (${plan.name}) is now active until ${expiryDate}.`,
    },
  ]);

  try {
    const { data: profile } = await supabaseAdmin.from("profiles").select("name, email").eq("id", customerId).maybeSingle();
    const to = profile?.email;
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

  return { ok: true, subscriptionId: created.id };
}
