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

  const { technicianId, email, password } = await request.json().catch(() => ({}));
  if (!technicianId || !email || !password) {
    return NextResponse.json({ error: "Missing technician, email or password." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const { data: technician } = await supabaseAdmin.from("technicians").select("*").eq("id", technicianId).maybeSingle();
  if (!technician) return NextResponse.json({ error: "Technician not found." }, { status: 404 });
  if (technician.user_id) return NextResponse.json({ error: "This technician already has a login." }, { status: 400 });

  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr) {
    return NextResponse.json({ error: createErr.message || "Failed to create login." }, { status: 500 });
  }

  await supabaseAdmin
    .from("profiles")
    .update({ is_technician: true, name: technician.name, mobile: technician.phone })
    .eq("id", created.user.id);

  await supabaseAdmin.from("technicians").update({ user_id: created.user.id, email }).eq("id", technicianId);

  return NextResponse.json({ ok: true });
}
