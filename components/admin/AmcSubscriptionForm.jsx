"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import CustomerPicker from "@/components/admin/CustomerPicker";
import { AmcBadge, ArrowLeftIcon, CalendarIcon, ClipboardIcon, UserIcon } from "@/components/icons";

const FREQUENCIES = [
  { value: "monthly", label: "Monthly", months: 1 },
  { value: "quarterly", label: "Quarterly", months: 3 },
  { value: "half_yearly", label: "Half-Yearly", months: 6 },
  { value: "yearly", label: "Yearly", months: 12 },
];
const FREQUENCY_MONTHS = Object.fromEntries(FREQUENCIES.map((f) => [f.value, f.months]));

function addMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}
function generateVisitDates(startDate, durationMonths, frequency) {
  const interval = FREQUENCY_MONTHS[frequency] || 3;
  const count = Math.max(1, Math.floor(durationMonths / interval));
  const dates = [];
  for (let i = 1; i <= count; i++) dates.push(addMonths(startDate, interval * i));
  return dates;
}

const EMPTY_SUB = { customer_id: "", plan_id: "", start_date: new Date().toISOString().slice(0, 10), expiry_date: "", duration_months: 12 };

export default function AmcSubscriptionForm() {
  const router = useRouter();

  const [plans, setPlans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [subForm, setSubForm] = useState(EMPTY_SUB);
  const [savingSub, setSavingSub] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("amc_plans").select("*").order("display_order", { ascending: true });
      setPlans(data ?? []);
    })();
    (async () => {
      const { data } = await supabase.from("profiles").select("id, name, email, mobile, avatar_url").eq("is_admin", false);
      setCustomers(data ?? []);
    })();
  }, []);

  const goBack = () => router.push("/admin/amc?tab=subscriptions");

  const onPlanSelectForSub = (planId, current) => {
    const plan = plans.find((p) => p.id === planId);
    const start = current.start_date || new Date().toISOString().slice(0, 10);
    const durationMonths = plan?.duration_months || 12;
    return {
      ...current,
      plan_id: planId,
      duration_months: durationMonths,
      expiry_date: addMonths(start, durationMonths),
    };
  };

  const saveSub = async (e) => {
    e.preventDefault();
    if (!subForm.customer_id) {
      toast.error("Please select a customer.");
      return;
    }
    setSavingSub(true);
    const plan = plans.find((p) => p.id === subForm.plan_id);
    const durationMonths = Number(subForm.duration_months) || plan?.duration_months || 12;
    const visitDates = generateVisitDates(subForm.start_date, durationMonths, plan?.visit_frequency || "quarterly");

    const payload = {
      customer_id: subForm.customer_id,
      plan_id: subForm.plan_id,
      plan_name_snapshot: plan?.name,
      coverage_snapshot: plan?.coverage || [],
      start_date: subForm.start_date,
      expiry_date: subForm.expiry_date,
      duration_months: durationMonths,
      next_visit_date: visitDates[0] || null,
      status: "active",
    };
    const { data: created } = await supabase.from("amc_subscriptions").insert([payload]).select().single();
    if (created) {
      if (visitDates.length > 0) {
        await supabase.from("amc_visits").insert(
          visitDates.map((d) => ({ subscription_id: created.id, scheduled_date: d }))
        );
      }
      await supabase.from("notifications").insert([
        {
          customer_id: subForm.customer_id,
          title: "AMC Activated",
          message: `Your AMC ${created.amc_number} (${plan?.name}) is now active until ${subForm.expiry_date}.`,
        },
      ]);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      fetch("/api/amc/notify-activated", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ subscriptionId: created.id }),
      }).catch((err) => console.error("AMC activation email trigger failed:", err));
    }
    setSavingSub(false);
    toast.success("AMC subscription activated");
    goBack();
  };

  return (
    <AdminLayout title="AMC Management">
      <button onClick={goBack} className="mb-4 flex items-center gap-1.5 text-[13px] font-semibold text-body hover:text-ink">
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to AMC Management
      </button>
        <form onSubmit={saveSub} className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <div className="relative overflow-hidden bg-gradient-to-br from-ink to-[#2a2a2a] p-6 text-white">
            <span className="glow-blob -right-8 -top-10 h-32 w-32 bg-yellow/20" />
            <div className="relative flex items-center gap-3">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-white/15 ring-2 ring-white/30">
                <AmcBadge className="h-5 w-5" />
              </span>
              <p className="text-[16px] font-extrabold">Activate New AMC</p>
            </div>
          </div>
          <div className="space-y-4 p-6">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                <UserIcon className="h-3.5 w-3.5 text-body/60" />
                Customer *
              </label>
              <CustomerPicker
                customers={customers}
                value={subForm.customer_id}
                onChange={(id) => setSubForm((f) => ({ ...f, customer_id: id }))}
              />
              {!subForm.customer_id && <p className="mt-1 text-[11px] text-red-400">Please select a customer.</p>}
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                <AmcBadge className="h-3.5 w-3.5 text-body/60" />
                Plan *
              </label>
              <select
                required
                value={subForm.plan_id}
                onChange={(e) => setSubForm((f) => onPlanSelectForSub(e.target.value, f))}
                className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
              >
                <option value="" disabled>
                  Select plan
                </option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                  <CalendarIcon className="h-3.5 w-3.5 text-body/60" />
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={subForm.start_date}
                  onChange={(e) =>
                    setSubForm((f) => ({
                      ...f,
                      start_date: e.target.value,
                      expiry_date: f.duration_months ? addMonths(e.target.value, f.duration_months) : f.expiry_date,
                    }))
                  }
                  className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                  <CalendarIcon className="h-3.5 w-3.5 text-body/60" />
                  Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={subForm.expiry_date}
                  onChange={(e) => setSubForm((f) => ({ ...f, expiry_date: e.target.value }))}
                  className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                />
              </div>
            </div>
            <p className="flex items-start gap-1.5 rounded-lg bg-cream/40 p-3 text-[12px] text-body">
              <ClipboardIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-body/60" />
              Visit dates will be auto-generated based on the selected plan's visit frequency once activated.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={savingSub}
                className="rounded-md bg-yellow px-6 py-3 text-[13.5px] font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:opacity-60"
              >
                {savingSub ? "Activating…" : "Activate AMC"}
              </button>
              <button
                type="button"
                onClick={goBack}
                className="rounded-md border border-line px-6 py-3 text-[13.5px] font-semibold text-body hover:border-ink/40"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </AdminLayout>
  );
}
