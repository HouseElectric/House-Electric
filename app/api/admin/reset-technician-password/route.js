import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

  const { technicianId, password } = await request.json().catch(() => ({}));
  if (!technicianId || !password) {
    return NextResponse.json({ error: "Missing technician or password." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const { data: technician } = await supabaseAdmin.from("technicians").select("id, user_id, email").eq("id", technicianId).maybeSingle();
  if (!technician) return NextResponse.json({ error: "Technician not found." }, { status: 404 });
  if (!technician.user_id) return NextResponse.json({ error: "This technician doesn't have a login yet." }, { status: 400 });

  const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(technician.user_id, { password });
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message || "Failed to reset password." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email: technician.email });
}
