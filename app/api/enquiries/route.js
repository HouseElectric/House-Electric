import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getContactSettings } from "@/lib/getContactSettings";
import { sendAdminAlertEmail, sendEnquiryReceivedEmail } from "@/lib/brevo";

const FIELD_LABELS = {
  type: "Enquiry Type",
  name: "Name",
  company: "Company / Property",
  contact_person: "Contact Person",
  mobile: "Mobile",
  email: "Email",
  location: "Location",
  address: "Address",
  property_type: "Property Type",
  area: "Approx. Area",
  service: "Service Required",
  requirement: "Requirement",
  message: "Message",
  system_details: "Electrical Setup",
  preferred_date: "Preferred Date",
  preferred_time: "Preferred Time",
  contact_time: "Preferred Contact Time",
};

export async function POST(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server is not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const { type } = body;
  if (!type || !["booking", "amc", "corporate"].includes(type)) {
    return NextResponse.json({ error: "Invalid enquiry type." }, { status: 400 });
  }

  const payload = { type };
  for (const key of Object.keys(FIELD_LABELS)) {
    if (key !== "type" && body[key]) payload[key] = body[key];
  }

  const { data: enquiry, error } = await supabaseAdmin.from("enquiries").insert([payload]).select().single();
  if (error) {
    console.error("Failed to save enquiry:", error.message);
    return NextResponse.json({ error: "Failed to save your enquiry." }, { status: 500 });
  }

  const lines = Object.entries(FIELD_LABELS)
    .filter(([key]) => key !== "type")
    .map(([key, label]) => ({ label, value: payload[key] }));

  // Email failures must never fail the enquiry submission itself — the DB row is
  // already saved and visible in the admin panel either way.
  try {
    const { email: adminEmail } = await getContactSettings();
    if (adminEmail) {
      await sendAdminAlertEmail({
        to: adminEmail,
        subject: `New ${type} enquiry from ${payload.name || payload.company || "a visitor"}`,
        badgePill: "NEW LEAD",
        headingPlain: "New ",
        headingHighlight: `${type.charAt(0).toUpperCase()}${type.slice(1)} Enquiry`,
        lines,
        ctaLabel: "View in Admin Panel",
        ctaHref: `${process.env.NEXT_PUBLIC_SITE_URL || "https://houseelectric.in"}/admin/enquiries`,
      });
    }
  } catch (err) {
    console.error("Admin enquiry alert email failed:", err.message);
  }

  if (payload.email) {
    try {
      await sendEnquiryReceivedEmail({ to: payload.email, name: payload.name || payload.contact_person, variant: type, lines });
    } catch (err) {
      console.error("Customer enquiry confirmation email failed:", err.message);
    }
  }

  return NextResponse.json({ ok: true, id: enquiry.id });
}
