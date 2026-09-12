import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_ATTEMPTS = 5;

export async function POST(req) {
  try {
    const { email, code, purpose } = await req.json();

    if (!email || !code || !purpose || purpose !== "signup") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server is not configured." }, { status: 500 });
    }

    const { data: otp } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("email", email)
      .eq("purpose", purpose)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otp) {
      return NextResponse.json({ error: "No verification code found. Please request a new one." }, { status: 400 });
    }
    if (new Date(otp.expires_at) < new Date()) {
      return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 });
    }
    if (otp.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Too many incorrect attempts. Please request a new code." }, { status: 429 });
    }
    if (otp.code !== String(code).trim()) {
      await supabaseAdmin.from("otp_codes").update({ attempts: otp.attempts + 1 }).eq("id", otp.id);
      return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
    }

    const { name, mobile, password } = otp.payload || {};
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr) throw createErr;

    await supabaseAdmin.from("profiles").update({ name, mobile }).eq("id", created.user.id);

    await supabaseAdmin.from("notifications").insert([
      {
        customer_id: created.user.id,
        title: "Welcome to House Electric",
        message: `Hi ${name || "there"}, your account is ready. Track service requests, quotations, invoices and your AMC right here.`,
      },
    ]);

    await supabaseAdmin.from("otp_codes").delete().eq("id", otp.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("verify-otp error:", err);
    return NextResponse.json({ error: err.message || "Verification failed." }, { status: 500 });
  }
}
