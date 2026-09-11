import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendOtpEmail, sendPasswordResetEmail } from "@/lib/brevo";

const OTP_TTL_MINUTES = 10;
const RESET_TOKEN_TTL_MINUTES = 30;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(req) {
  try {
    const { email, purpose, name, mobile, password } = await req.json();

    if (!email || !purpose || !["signup", "reset"].includes(purpose)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server is not configured." }, { status: 500 });
    }

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, name")
      .eq("email", email)
      .maybeSingle();

    if (purpose === "signup" && existingProfile) {
      return NextResponse.json({ error: "An account with this email already exists. Please sign in instead." }, { status: 409 });
    }
    if (purpose === "reset" && !existingProfile) {
      return NextResponse.json({ error: "No account found with this email address." }, { status: 404 });
    }
    if (purpose === "signup" && (!name || !mobile || !password)) {
      return NextResponse.json({ error: "Missing registration details." }, { status: 400 });
    }

    await supabaseAdmin.from("otp_codes").delete().eq("email", email).eq("purpose", purpose);

    if (purpose === "reset") {
      const token = generateToken();
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000).toISOString();
      const { error: insertError } = await supabaseAdmin.from("otp_codes").insert([
        { email, code: token, purpose, payload: null, expires_at: expiresAt },
      ]);
      if (insertError) throw insertError;

      await sendPasswordResetEmail({ to: email, name: existingProfile?.name, token });
      return NextResponse.json({ ok: true });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

    const { error: insertError } = await supabaseAdmin.from("otp_codes").insert([
      { email, code, purpose, payload: { name, mobile, password }, expires_at: expiresAt },
    ]);
    if (insertError) throw insertError;

    await sendOtpEmail({ to: email, name, code, purpose });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-otp error:", err);
    return NextResponse.json({ error: err.message || "Failed to send verification code." }, { status: 500 });
  }
}
