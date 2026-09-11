import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createRazorpayOrder, razorpayConfigured } from "@/lib/razorpay";

async function getAuthedUser(request) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !supabaseAdmin) return null;
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);
  return user;
}

export async function POST(request) {
  const user = await getAuthedUser(request);
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  if (!razorpayConfigured()) {
    return NextResponse.json({ error: "Online payments are not configured yet." }, { status: 500 });
  }

  const { type, invoiceId, planId } = await request.json().catch(() => ({}));

  try {
    if (type === "invoice") {
      const { data: invoice } = await supabaseAdmin.from("invoices").select("*").eq("id", invoiceId).maybeSingle();
      if (!invoice || invoice.customer_id !== user.id) {
        return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
      }
      const balance = Number(invoice.total_amount) - Number(invoice.paid_amount);
      if (balance <= 0) {
        return NextResponse.json({ error: "This invoice is already paid." }, { status: 400 });
      }

      const order = await createRazorpayOrder({
        amountRupees: balance,
        receipt: `inv_${invoice.invoice_number}`,
        notes: { type: "invoice", invoice_id: invoice.id, customer_id: user.id },
      });
      return NextResponse.json({ orderId: order.id, amount: order.amount, keyId: process.env.RAZORPAY_KEY_ID });
    }

    if (type === "amc") {
      const { data: plan } = await supabaseAdmin.from("amc_plans").select("*").eq("id", planId).maybeSingle();
      if (!plan || !plan.price) {
        return NextResponse.json({ error: "This plan is not available for online purchase." }, { status: 400 });
      }

      const order = await createRazorpayOrder({
        amountRupees: plan.price,
        receipt: `amc_${plan.id}_${Date.now()}`,
        notes: { type: "amc", plan_id: plan.id, customer_id: user.id },
      });
      return NextResponse.json({ orderId: order.id, amount: order.amount, keyId: process.env.RAZORPAY_KEY_ID });
    }

    return NextResponse.json({ error: "Invalid payment type." }, { status: 400 });
  } catch (err) {
    console.error("create-order error:", err);
    return NextResponse.json({ error: err.message || "Failed to create payment order." }, { status: 500 });
  }
}
