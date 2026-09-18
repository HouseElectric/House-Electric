import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendQuotationCreatedEmail } from "@/lib/brevo";

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

export async function POST(request) {
  const admin = await getAuthedAdmin(request);
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const { quotationId } = await request.json().catch(() => ({}));
  if (!quotationId) return NextResponse.json({ error: "Missing quotation id." }, { status: 400 });

  const { data: quotation } = await supabaseAdmin.from("quotations").select("*").eq("id", quotationId).maybeSingle();
  if (!quotation) return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
  if (!quotation.customer_email) return NextResponse.json({ ok: true, skipped: "No customer email on file." });

  try {
    await sendQuotationCreatedEmail({
      to: quotation.customer_email,
      name: quotation.customer_name,
      quotationNumber: quotation.quotation_number,
      total: quotation.total,
      validUntil: quotation.valid_until,
      quotationId: quotation.id,
    });
  } catch (err) {
    console.error("Quotation email failed:", err.message);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
