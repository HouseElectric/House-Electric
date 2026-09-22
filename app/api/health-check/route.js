import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getContactSettings } from "@/lib/getContactSettings";
import { sendAdminAlertEmail, sendHealthCheckBookedEmail } from "@/lib/brevo";

async function resolveCustomerId(request) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !supabaseAdmin) return null;
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);
  return user?.id ?? null;
}

export async function POST(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server is not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const { name, mobile, email, address, property_type, preferred_date, preferred_time, notes } = body;

  if (!name || !mobile) {
    return NextResponse.json({ error: "Name and mobile number are required." }, { status: 400 });
  }

  const customerId = await resolveCustomerId(request);

  const payload = { name, mobile, email, address, property_type, preferred_date, preferred_time, notes, customer_id: customerId };
  const { data: booking, error } = await supabaseAdmin.from("health_checks").insert([payload]).select().single();
  if (error) {
    console.error("Failed to save health check booking:", error.message);
    return NextResponse.json({ error: "Failed to save your booking." }, { status: 500 });
  }

  try {
    const { email: adminEmail, notify_new_health_checks } = await getContactSettings();
    if (adminEmail && notify_new_health_checks !== false) {
      await sendAdminAlertEmail({
        to: adminEmail,
        subject: `New Electrical Health Check booking from ${name}`,
        badgePill: "NEW LEAD",
        headingPlain: "New ",
        headingHighlight: "Health Check Booking",
        lines: [
          { label: "Name", value: name },
          { label: "Mobile", value: mobile },
          { label: "Email", value: email },
          { label: "Address", value: address },
          { label: "Property Type", value: property_type },
          { label: "Preferred Date", value: preferred_date },
          { label: "Preferred Time", value: preferred_time },
          { label: "Notes", value: notes },
        ],
        ctaLabel: "View in Admin Panel",
        ctaHref: `${process.env.NEXT_PUBLIC_SITE_URL || "https://houseelectric.in"}/admin/health-checks`,
      });
    }
  } catch (err) {
    console.error("Admin health check alert email failed:", err.message);
  }

  if (email) {
    try {
      await sendHealthCheckBookedEmail({ to: email, name, requestNumber: booking.request_number, preferredDate: preferred_date });
    } catch (err) {
      console.error("Customer health check confirmation email failed:", err.message);
    }
  }

  return NextResponse.json({ ok: true, id: booking.id, requestNumber: booking.request_number });
}
