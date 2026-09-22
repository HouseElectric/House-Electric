import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendServiceRequestStatusEmail } from "@/lib/brevo";

async function getAuthedUser(request) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !supabaseAdmin) return null;
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);
  if (!user) return null;
  const { data: profile } = await supabaseAdmin.from("profiles").select("is_admin, is_technician").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin && !profile?.is_technician) return null;
  return { user, ...profile };
}

export async function POST(request) {
  const authed = await getAuthedUser(request);
  if (!authed) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const { requestId } = await request.json().catch(() => ({}));
  if (!requestId) return NextResponse.json({ error: "Missing request id." }, { status: 400 });

  const { data: req } = await supabaseAdmin
    .from("service_requests")
    .select("*, profiles(name, email)")
    .eq("id", requestId)
    .maybeSingle();
  if (!req) return NextResponse.json({ error: "Service request not found." }, { status: 404 });

  if (!authed.is_admin) {
    const { data: tech } = await supabaseAdmin.from("technicians").select("id").eq("user_id", authed.user.id).maybeSingle();
    if (!tech || tech.id !== req.technician_id) {
      return NextResponse.json({ error: "Not authorized for this request." }, { status: 403 });
    }
  }

  const customerEmail = req.profiles?.email;
  if (!customerEmail) return NextResponse.json({ ok: true, skipped: "No customer email on file." });

  try {
    await sendServiceRequestStatusEmail({
      to: customerEmail,
      name: req.profiles?.name,
      ticketNumber: req.ticket_number,
      serviceType: req.service_type,
      status: req.status,
      technicianName: req.technician_name,
      technicianPhone: req.technician_phone,
    });
  } catch (err) {
    console.error("Service-request status email failed:", err.message);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
