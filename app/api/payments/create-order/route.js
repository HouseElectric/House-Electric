import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createCashfreeOrder, cashfreeConfigured, cashfreeMode } from "@/lib/cashfree";

async function getAuthedUser(request) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !supabaseAdmin) return null;
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);
  return user;
}

function genOrderId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function returnUrlFor(request) {
  const origin = request.headers.get("origin") || new URL(request.url).origin;
  return `${origin}/account?payment=return`;
}

export async function POST(request) {
  const user = await getAuthedUser(request);
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  if (!cashfreeConfigured()) {
    return NextResponse.json({ error: "Online payments are not configured yet." }, { status: 500 });
  }

  const { type, invoiceId, planId, quotationId, renewFromId, propertyId } = await request.json().catch(() => ({}));
  const returnUrl = returnUrlFor(request);
  const customer = { id: user.id, email: user.email };

  const { data: profile } = await supabaseAdmin.from("profiles").select("name, mobile").eq("id", user.id).maybeSingle();
  if (profile) {
    customer.name = profile.name;
    customer.phone = profile.mobile;
  }

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

      const orderId = genOrderId(`inv${invoice.invoice_number.replace(/\W/g, "")}`);
      const order = await createCashfreeOrder({
        orderId,
        amountRupees: balance,
        customer,
        returnUrl,
        notes: `Invoice ${invoice.invoice_number}`,
      });
      await supabaseAdmin.from("invoices").update({ cashfree_order_id: orderId }).eq("id", invoiceId);

      return NextResponse.json({ orderId, paymentSessionId: order.payment_session_id, mode: cashfreeMode() });
    }

    if (type === "quotation") {
      const { data: quotation } = await supabaseAdmin.from("quotations").select("*").eq("id", quotationId).maybeSingle();
      if (!quotation || quotation.customer_id !== user.id) {
        return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
      }
      if (quotation.status !== "accepted") {
        return NextResponse.json({ error: "Please accept the quotation before paying." }, { status: 400 });
      }

      const orderId = genOrderId(`qtn${quotation.quotation_number.replace(/\W/g, "")}`);
      const order = await createCashfreeOrder({
        orderId,
        amountRupees: quotation.total,
        customer,
        returnUrl,
        notes: `Quotation ${quotation.quotation_number}`,
      });
      await supabaseAdmin.from("quotations").update({ cashfree_order_id: orderId }).eq("id", quotationId);

      return NextResponse.json({ orderId, paymentSessionId: order.payment_session_id, mode: cashfreeMode() });
    }

    if (type === "amc") {
      const { data: plan } = await supabaseAdmin.from("amc_plans").select("*").eq("id", planId).maybeSingle();
      if (!plan || !plan.price) {
        return NextResponse.json({ error: "This plan is not available for online purchase." }, { status: 400 });
      }

      let validPropertyId = null;
      if (propertyId) {
        const { data: property } = await supabaseAdmin.from("properties").select("id").eq("id", propertyId).eq("customer_id", user.id).maybeSingle();
        validPropertyId = property?.id || null;
      }

      const orderId = genOrderId("amc");
      const order = await createCashfreeOrder({
        orderId,
        amountRupees: plan.price,
        customer,
        returnUrl,
        notes: `AMC Plan ${plan.name}`,
      });

      await supabaseAdmin.from("amc_purchase_intents").insert([
        { order_id: orderId, customer_id: user.id, plan_id: plan.id, renew_from_id: renewFromId || null, property_id: validPropertyId },
      ]);

      return NextResponse.json({ orderId, paymentSessionId: order.payment_session_id, mode: cashfreeMode() });
    }

    return NextResponse.json({ error: "Invalid payment type." }, { status: 400 });
  } catch (err) {
    console.error("create-order error:", err);
    return NextResponse.json({ error: err.message || "Failed to create payment order." }, { status: 500 });
  }
}
