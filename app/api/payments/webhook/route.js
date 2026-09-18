import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyCashfreeWebhookSignature } from "@/lib/cashfree";
import { fulfillInvoicePayment, fulfillQuotationPayment, fulfillAmcPayment } from "@/lib/paymentFulfillment";

// Server-to-server confirmation from Cashfree — the safety net for cases where the
// customer's browser closes before the client-side /api/payments/verify call fires.
// Every fulfill* call here is idempotent, so it's safe even if verify already ran.
export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature");
  const timestamp = request.headers.get("x-webhook-timestamp");

  // Always acknowledge with 200 so Cashfree's delivery monitoring never flags/disables
  // this endpoint (their own dashboard "Test" ping has no real signature and would
  // otherwise permanently show as failing). Security is unaffected — nothing below
  // ever touches the database unless the signature genuinely checks out.
  if (!verifyCashfreeWebhookSignature({ rawBody, timestamp, signature })) {
    console.warn("Cashfree webhook: signature check failed (expected for dashboard test pings).");
    return NextResponse.json({ ok: true, received: true });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: true, received: true });
  }

  if (payload.type !== "PAYMENT_SUCCESS_WEBHOOK") {
    console.log("Cashfree webhook: ignoring event type", payload.type, JSON.stringify(payload).slice(0, 500));
    return NextResponse.json({ ok: true, ignored: true });
  }

  const orderId = payload.data?.order?.order_id;
  const paymentId = payload.data?.payment?.cf_payment_id ? String(payload.data.payment.cf_payment_id) : null;
  if (!orderId || !supabaseAdmin) {
    return NextResponse.json({ ok: true, received: true });
  }

  try {
    const { data: invoice } = await supabaseAdmin.from("invoices").select("id").eq("cashfree_order_id", orderId).maybeSingle();
    if (invoice) {
      await fulfillInvoicePayment({ invoiceId: invoice.id, orderId, paymentId });
      return NextResponse.json({ ok: true });
    }

    const { data: quotation } = await supabaseAdmin
      .from("quotations")
      .select("id")
      .eq("cashfree_order_id", orderId)
      .maybeSingle();
    if (quotation) {
      await fulfillQuotationPayment({ quotationId: quotation.id, orderId, paymentId });
      return NextResponse.json({ ok: true });
    }

    const { data: intent } = await supabaseAdmin
      .from("amc_purchase_intents")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle();
    if (intent) {
      await fulfillAmcPayment({
        planId: intent.plan_id,
        renewFromId: intent.renew_from_id,
        orderId,
        paymentId,
        customerId: intent.customer_id,
      });
      await supabaseAdmin.from("amc_purchase_intents").update({ consumed: true }).eq("id", intent.id);
      return NextResponse.json({ ok: true });
    }

    console.warn("Cashfree webhook: no matching order found for", orderId);
    return NextResponse.json({ ok: true, unmatched: true });
  } catch (err) {
    console.error("Cashfree webhook processing error:", err);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
}
