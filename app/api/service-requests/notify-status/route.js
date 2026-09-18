import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendServiceRequestStatusEmail } from "@/lib/brevo";

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

  const { requestId } = await request.json().catch(() => ({}));
  if (!requestId) return NextResponse.json({ error: "Missing request id." }, { status: 400 });

  const { data: req } = await supabaseAdmin
    .from("service_requests")
    .select("*, profiles(name, email)")
    .eq("id", requestId)
    .maybeSingle();
  if (!req) return NextResponse.json({ error: "Service request not found." }, { status: 404 });

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
    });
  } catch (err) {
    console.error("Service-request status email failed:", err.message);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
