import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getContactSettings } from "@/lib/getContactSettings";
import { sendAdminAlertEmail, sendServiceRequestStatusEmail } from "@/lib/brevo";

async function getAuthedUser(request) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !supabaseAdmin) return null;
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);
  return user;
}

export async function POST(request) {
  const user = await getAuthedUser(request);
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { service_type, description, preferred_date, preferred_time, location, photo_url, photo_urls } = body;
  if (!service_type) return NextResponse.json({ error: "Service type is required." }, { status: 400 });

  const { data: created, error } = await supabaseAdmin
    .from("service_requests")
    .insert([
      {
        service_type,
        description: description || null,
        preferred_date: preferred_date || null,
        preferred_time: preferred_time || null,
        location: location || null,
        photo_url: photo_url || null,
        photo_urls: photo_urls || [],
        customer_id: user.id,
      },
    ])
    .select()
    .single();
  if (error) {
    console.error("Failed to create service request:", error.message);
    return NextResponse.json({ error: "Failed to submit your request." }, { status: 500 });
  }

  await supabaseAdmin.from("notifications").insert([
    {
      customer_id: user.id,
      title: "Service request received",
      message: `Your request ${created.ticket_number} has been received. We'll be in touch shortly.`,
    },
  ]);

  const { data: profile } = await supabaseAdmin.from("profiles").select("name, email, mobile").eq("id", user.id).maybeSingle();
  const customerEmail = profile?.email || user.email;
  const customerName = profile?.name;

  // Email failures must never fail the booking itself — the request is already saved.
  try {
    if (customerEmail) {
      await sendServiceRequestStatusEmail({
        to: customerEmail,
        name: customerName,
        ticketNumber: created.ticket_number,
        serviceType: service_type,
        status: "requested",
      });
    }
  } catch (err) {
    console.error("Customer service-request confirmation email failed:", err.message);
  }

  try {
    const { email: adminEmail } = await getContactSettings();
    if (adminEmail) {
      await sendAdminAlertEmail({
        to: adminEmail,
        subject: `New service request ${created.ticket_number}`,
        badgePill: "NEW BOOKING",
        headingPlain: "New Service ",
        headingHighlight: "Request",
        lines: [
          { label: "Ticket", value: created.ticket_number },
          { label: "Customer", value: customerName || customerEmail },
          { label: "Mobile", value: profile?.mobile },
          { label: "Service Type", value: service_type },
          { label: "Location", value: location },
          { label: "Preferred Date", value: preferred_date },
          { label: "Description", value: description },
        ],
        ctaLabel: "View in Admin Panel",
        ctaHref: `${process.env.NEXT_PUBLIC_SITE_URL || "https://houseelectric.in"}/admin/service-requests`,
      });
    }
  } catch (err) {
    console.error("Admin service-request alert email failed:", err.message);
  }

  return NextResponse.json({ ok: true, request: created });
}
