import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendPaymentReceivedEmail } from "@/lib/brevo";

async function getAuthedAdmin(request) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !supabaseAdmin) return null;
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);
  if (!user) return null;
  const { data: profile } = await supabaseAdmin.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  return profile?.is_admin ? user : null;
}

// Fires when an admin manually marks an invoice "paid" (e.g. cash/offline payment) —
// online payments already email via lib/paymentFulfillment.js.
export async function POST(request) {
  const admin = await getAuthedAdmin(request);
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const { invoiceId } = await request.json().catch(() => ({}));
  if (!invoiceId) return NextResponse.json({ error: "Missing invoice id." }, { status: 400 });

  const { data: invoice } = await supabaseAdmin.from("invoices").select("*").eq("id", invoiceId).maybeSingle();
  if (!invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  if (invoice.payment_status !== "paid" || !invoice.customer_email) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    await sendPaymentReceivedEmail({
      to: invoice.customer_email,
      name: invoice.customer_name,
      refNumber: invoice.invoice_number,
      amount: invoice.paid_amount,
      viewLabel: "View Invoice",
      viewHref: `${process.env.NEXT_PUBLIC_SITE_URL || "https://houseelectric.in"}/account/invoices/${invoice.id}`,
    });
  } catch (err) {
    console.error("Invoice payment-status email failed:", err.message);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
