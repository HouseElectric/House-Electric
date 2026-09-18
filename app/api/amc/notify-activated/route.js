import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendAmcActivatedEmail } from "@/lib/brevo";

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

// Fires when an admin manually activates/renews an AMC subscription — online
// self-purchase already emails via lib/paymentFulfillment.js.
export async function POST(request) {
  const admin = await getAuthedAdmin(request);
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const { subscriptionId, isRenewal } = await request.json().catch(() => ({}));
  if (!subscriptionId) return NextResponse.json({ error: "Missing subscription id." }, { status: 400 });

  const { data: sub } = await supabaseAdmin
    .from("amc_subscriptions")
    .select("*, profiles(name, email)")
    .eq("id", subscriptionId)
    .maybeSingle();
  if (!sub) return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
  if (!sub.profiles?.email) return NextResponse.json({ ok: true, skipped: "No customer email on file." });

  try {
    await sendAmcActivatedEmail({
      to: sub.profiles.email,
      name: sub.profiles.name,
      amcNumber: sub.amc_number,
      planName: sub.plan_name_snapshot,
      startDate: sub.start_date,
      expiryDate: sub.expiry_date,
      amountPaid: sub.amount_paid ? `₹${Number(sub.amount_paid).toLocaleString("en-IN")}` : null,
      isRenewal: !!isRenewal,
    });
  } catch (err) {
    console.error("AMC activation email failed:", err.message);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
