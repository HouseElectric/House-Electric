import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendAmcReminderEmail } from "@/lib/brevo";

// Multi-stage renewal reminders — spec calls for a touchpoint at each of these
// days-before-expiry milestones, not just a single one-time reminder.
const MILESTONES = [60, 30, 15, 7, 1];
const WIDEST_WINDOW_DAYS = Math.max(...MILESTONES);

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") || "";
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server is not configured." }, { status: 500 });
  }

  const today = new Date();
  const windowEnd = new Date(today);
  windowEnd.setDate(windowEnd.getDate() + WIDEST_WINDOW_DAYS);
  const todayStr = today.toISOString().slice(0, 10);
  const windowEndStr = windowEnd.toISOString().slice(0, 10);

  const { data: subs, error } = await supabaseAdmin
    .from("amc_subscriptions")
    .select("id, amc_number, plan_name_snapshot, expiry_date, customer_id, reminder_stages_sent, profiles(name, email)")
    .eq("status", "active")
    .gte("expiry_date", todayStr)
    .lte("expiry_date", windowEndStr);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const sub of subs ?? []) {
    const daysRemaining = Math.ceil((new Date(sub.expiry_date) - today) / (1000 * 60 * 60 * 24));

    const stagesSent = Array.isArray(sub.reminder_stages_sent) ? sub.reminder_stages_sent : [];
    // A milestone is "reached" once daysRemaining drops to or below it. Take the closest
    // (smallest) reached-but-unsent milestone — this self-heals if a daily cron run is ever
    // missed, instead of silently skipping that touchpoint forever (the old exact-day match did).
    const reached = MILESTONES.filter((m) => m >= daysRemaining && !stagesSent.includes(m));
    if (reached.length === 0) {
      skipped++;
      continue;
    }
    const milestone = Math.min(...reached);

    const email = sub.profiles?.email;
    if (!email) continue;

    try {
      await sendAmcReminderEmail({
        to: email,
        name: sub.profiles?.name,
        amcNumber: sub.amc_number,
        planName: sub.plan_name_snapshot,
        expiryDate: sub.expiry_date,
        daysRemaining: milestone,
      });
      await supabaseAdmin
        .from("amc_subscriptions")
        .update({ reminder_stages_sent: [...stagesSent, milestone], reminder_sent_at: new Date().toISOString() })
        .eq("id", sub.id);
      await supabaseAdmin.from("notifications").insert([
        {
          customer_id: sub.customer_id,
          title: "AMC expiring soon",
          message: `Your AMC ${sub.amc_number} expires on ${sub.expiry_date} (${milestone} day${milestone === 1 ? "" : "s"} left). Renew now to avoid a coverage gap.`,
        },
      ]);
      sent++;
    } catch (err) {
      console.error(`Failed to send AMC reminder for ${sub.id}:`, err);
      failed++;
    }
  }

  return NextResponse.json({ checked: subs?.length ?? 0, sent, skipped, failed });
}
