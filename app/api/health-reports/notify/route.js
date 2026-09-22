import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendHealthReportReadyEmail } from "@/lib/brevo";

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

  const { reportId } = await request.json().catch(() => ({}));
  if (!reportId) return NextResponse.json({ error: "Missing report id." }, { status: 400 });

  const { data: report } = await supabaseAdmin.from("health_reports").select("*, amc_plans(name)").eq("id", reportId).maybeSingle();
  if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });

  const { data: healthCheck } = report.health_check_id
    ? await supabaseAdmin.from("health_checks").select("email, name").eq("id", report.health_check_id).maybeSingle()
    : { data: null };

  const to = healthCheck?.email;
  if (!to) return NextResponse.json({ ok: true, skipped: "No customer email on file." });

  try {
    await sendHealthReportReadyEmail({
      to,
      name: report.customer_name || healthCheck?.name,
      reportNumber: report.report_number,
      reportId: report.id,
      recommendedPlanName: report.amc_plans?.name,
    });
  } catch (err) {
    console.error("Health report email failed:", err.message);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
