import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCashfreeOrderStatus, getCashfreeSuccessfulPaymentId } from "@/lib/cashfree";
import { fulfillInvoicePayment, fulfillQuotationPayment, fulfillAmcPayment } from "@/lib/paymentFulfillment";

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

  const body = await request.json().catch(() => ({}));
  const { orderId, type, invoiceId, planId, quotationId, renewFromId } = body;

  if (!orderId) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }

  try {
    // Never trust the client's "payment succeeded" claim on its own — independently
    // confirm the order status with Cashfree's server before touching any records.
    const order = await getCashfreeOrderStatus(orderId);
    if (order.order_status !== "PAID") {
      return NextResponse.json({ error: "Payment not completed yet." }, { status: 400 });
    }
    const paymentId = await getCashfreeSuccessfulPaymentId(orderId);

    if (type === "invoice") {
      const result = await fulfillInvoicePayment({ invoiceId, orderId, paymentId, customerId: user.id });
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 404 });
      return NextResponse.json({ ok: true });
    }

    if (type === "quotation") {
      const result = await fulfillQuotationPayment({ quotationId, orderId, paymentId, customerId: user.id });
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json({ ok: true, invoiceId: result.invoiceId });
    }

    if (type === "amc") {
      const result = await fulfillAmcPayment({ planId, renewFromId, orderId, paymentId, customerId: user.id });
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 404 });
      return NextResponse.json({ ok: true, subscriptionId: result.subscriptionId });
    }

    return NextResponse.json({ error: "Invalid payment type." }, { status: 400 });
  } catch (err) {
    console.error("payment verify error:", err);
    return NextResponse.json({ error: err.message || "Failed to confirm payment." }, { status: 500 });
  }
}
