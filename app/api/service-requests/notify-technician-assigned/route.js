import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendTechnicianJobAssignedEmail } from "@/lib/brevo";

async function getAuthedAdmin(request) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !supabaseAdmin) return null;
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);
  if (!user) return null;
  const { data: profile } = await supabaseAdmin.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) return null;
  return user;
}

export async function POST(request) {
  const admin = await getAuthedAdmin(request);
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const { requestId } = await request.json().catch(() => ({}));
  if (!requestId) return NextResponse.json({ error: "Missing request id." }, { status: 400 });

  const { data: req } = await supabaseAdmin
    .from("service_requests")
    .select("*, profiles(name, mobile), properties(label, address)")
    .eq("id", requestId)
    .maybeSingle();
  if (!req) return NextResponse.json({ error: "Service request not found." }, { status: 404 });
  if (!req.technician_id) return NextResponse.json({ ok: true, skipped: "No technician assigned." });

  const { data: technician } = await supabaseAdmin.from("technicians").select("name, email").eq("id", req.technician_id).maybeSingle();
  if (!technician?.email) return NextResponse.json({ ok: true, skipped: "No technician email on file." });

  try {
    await sendTechnicianJobAssignedEmail({
      to: technician.email,
      name: technician.name,
      ticketNumber: req.ticket_number,
      serviceType: req.service_type,
      customerName: req.profiles?.name,
      customerMobile: req.profiles?.mobile,
      address: req.properties ? `${req.properties.label} — ${req.properties.address}` : req.location,
      scheduledDate: req.scheduled_date,
      scheduledTime: req.scheduled_time,
    });
  } catch (err) {
    console.error("Technician job-assigned email failed:", err.message);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
