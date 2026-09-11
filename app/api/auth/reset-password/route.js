import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token || !supabaseAdmin) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
  const { data: reset } = await supabaseAdmin
    .from("otp_codes")
    .select("expires_at")
    .eq("code", token)
    .eq("purpose", "reset")
    .maybeSingle();

  const valid = !!reset && new Date(reset.expires_at) > new Date();
  return NextResponse.json({ valid });
}

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
    }
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server is not configured." }, { status: 500 });
    }

    const { data: reset } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("code", token)
      .eq("purpose", "reset")
      .maybeSingle();

    if (!reset) {
      return NextResponse.json({ error: "This reset link is invalid. Please request a new one." }, { status: 400 });
    }
    if (new Date(reset.expires_at) < new Date()) {
      await supabaseAdmin.from("otp_codes").delete().eq("id", reset.id);
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    const { data: profile } = await supabaseAdmin.from("profiles").select("id").eq("email", reset.email).maybeSingle();
    if (!profile) {
      return NextResponse.json({ error: "No account found with this email address." }, { status: 404 });
    }

    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(profile.id, { password: newPassword });
    if (updateErr) throw updateErr;

    await supabaseAdmin.from("otp_codes").delete().eq("id", reset.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("reset-password error:", err);
    return NextResponse.json({ error: err.message || "Failed to reset password." }, { status: 500 });
  }
}
