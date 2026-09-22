"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { AmcBadge, ArrowLeftIcon, PlusIcon, XIcon } from "@/components/icons";
import { COVERAGE_STATUSES, deriveLegacyLists, getCoverageItems } from "@/lib/amcCoverage";

const CATEGORIES = ["residential", "office", "commercial", "corporate"];
const FREQUENCIES = [
  { value: "monthly", label: "Monthly", months: 1 },
  { value: "quarterly", label: "Quarterly", months: 3 },
  { value: "half_yearly", label: "Half-Yearly", months: 6 },
  { value: "yearly", label: "Yearly", months: 12 },
];

const VISIT_LIMIT_TYPES = [
  { value: "unlimited", label: "Unlimited covered visits" },
  { value: "defined", label: "Defined number of visits" },
  { value: "fair_use", label: "Fair-use / service limits" },
];

const EMPTY_PLAN = {
  name: "",
  category: "residential",
  price_label: "",
  price: "",
  duration_label: "Per Year",
  duration_months: 12,
  visit_frequency: "quarterly",
  coverage_items: [],
  benefits: "",
  display_order: 0,
  active: true,
  featured: false,
  suitable_for: "",
  visit_limit_type: "unlimited",
  visit_limit_count: "",
  response_time_sla: "",
};

function listToText(arr) {
  return Array.isArray(arr) ? arr.join("\n") : "";
}
function textToList(text) {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}

export default function AmcPlanForm({ planId }) {
  const router = useRouter();
  const isEdit = !!planId;

  const [planForm, setPlanForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState(false);

  useEffect(() => {
    if (isEdit) {
      (async () => {
        const { data } = await supabase.from("amc_plans").select("*").eq("id", planId).single();
        if (data) {
          setPlanForm({
            ...data,
            coverage_items: getCoverageItems(data),
            benefits: listToText(data.benefits),
            suitable_for: listToText(data.suitable_for),
            price_label: data.price_label || "",
            price: data.price ?? "",
            duration_months: data.duration_months || 12,
            visit_frequency: data.visit_frequency || "quarterly",
            visit_limit_type: data.visit_limit_type || "unlimited",
            visit_limit_count: data.visit_limit_count ?? "",
            response_time_sla: data.response_time_sla || "",
          });
        }
        setLoading(false);
      })();
    } else {
      (async () => {
        const { data } = await supabase.from("amc_plans").select("id");
        setPlanForm({ ...EMPTY_PLAN, coverage_items: [], benefits: "", display_order: (data ?? []).length });
        setLoading(false);
      })();
    }
  }, [planId, isEdit]);

  const goBack = () => router.push("/admin/amc?tab=plans");

  const savePlan = async (e) => {
    e.preventDefault();
    setSavingPlan(true);
    const coverageItems = (planForm.coverage_items || []).filter((i) => i.name.trim());
    const { coverage, exclusions } = deriveLegacyLists(coverageItems);
    const payload = {
      name: planForm.name,
      category: planForm.category,
      price_label: planForm.price_label.trim() || null,
      price: planForm.price === "" ? null : Number(planForm.price),
      duration_label: planForm.duration_label,
      duration_months: Number(planForm.duration_months) || 12,
      visit_frequency: planForm.visit_frequency,
      coverage_items: coverageItems,
      coverage,
      exclusions,
      benefits: textToList(planForm.benefits),
      suitable_for: textToList(planForm.suitable_for),
      display_order: Number(planForm.display_order) || 0,
      active: planForm.active,
      featured: planForm.featured,
      visit_limit_type: planForm.visit_limit_type,
      visit_limit_count: planForm.visit_limit_type === "defined" ? Number(planForm.visit_limit_count) || null : null,
      response_time_sla: planForm.response_time_sla.trim() || null,
    };
    let savedId = planForm.id;
    if (planForm.id) {
      await supabase.from("amc_plans").update(payload).eq("id", planForm.id);
    } else {
      const { data: created } = await supabase.from("amc_plans").insert([payload]).select().single();
      savedId = created?.id;
    }
    // Only one plan should ever carry the "Most Popular" badge — clear it off every other plan.
    if (payload.featured && savedId) {
      await supabase.from("amc_plans").update({ featured: false }).neq("id", savedId);
    }
    setSavingPlan(false);
    toast.success(planForm.id ? "AMC plan updated" : "AMC plan added");
    goBack();
  };

  if (loading || !planForm) {
    return (
      <AdminLayout title="AMC Management">
        <div className="rounded-2xl border border-line bg-white p-16 text-center text-[13.5px] text-body">Loading plan...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="AMC Management">
      <button onClick={goBack} className="mb-4 flex items-center gap-1.5 text-[13px] font-semibold text-body hover:text-ink">
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to AMC Management
      </button>
        <form onSubmit={savePlan} className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <div className="relative overflow-hidden bg-gradient-to-br from-ink to-[#2a2a2a] p-6 text-white">
            <span className="glow-blob -right-8 -top-10 h-32 w-32 bg-yellow/20" />
            <div className="relative flex items-center gap-3">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-white/15 ring-2 ring-white/30">
                <AmcBadge className="h-5 w-5" />
              </span>
              <p className="text-[16px] font-extrabold">{planForm.id ? "Edit AMC Plan" : "Add AMC Plan"}</p>
            </div>
          </div>
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-body">Plan Name *</label>
                <input
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-body">Category *</label>
                <select
                  value={planForm.category}
                  onChange={(e) => setPlanForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c[0].toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-body">
                  Price (₹) <span className="font-normal text-body/70">(blank = "Request Proposal", no online purchase)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={planForm.price}
                  onChange={(e) => setPlanForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="2499"
                  className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-body">Price Label (display)</label>
                <input
                  value={planForm.price_label}
                  onChange={(e) => setPlanForm((f) => ({ ...f, price_label: e.target.value }))}
                  placeholder="e.g. ₹2,499"
                  className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-body">Duration Label</label>
                <input
                  value={planForm.duration_label}
                  onChange={(e) => setPlanForm((f) => ({ ...f, duration_label: e.target.value }))}
                  className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-body">Duration (months)</label>
                <input
                  type="number"
                  min="1"
                  value={planForm.duration_months}
                  onChange={(e) => setPlanForm((f) => ({ ...f, duration_months: e.target.value }))}
                  className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1.5 block text-[12px] font-semibold text-body">Visit Frequency (for auto-scheduling)</label>
                <select
                  value={planForm.visit_frequency}
                  onChange={(e) => setPlanForm((f) => ({ ...f, visit_frequency: e.target.value }))}
                  className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-body">
                Suitable For <span className="font-normal text-body/70">(one per line — shown on the plan card as "who this is for")</span>
              </label>
              <textarea
                rows={3}
                value={planForm.suitable_for}
                onChange={(e) => setPlanForm((f) => ({ ...f, suitable_for: e.target.value }))}
                className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] font-mono outline-none focus:border-ink"
                placeholder={"Small Houses\n1 BHK\n2 BHK Apartments"}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-body">Visit Limit</label>
                <select
                  value={planForm.visit_limit_type}
                  onChange={(e) => setPlanForm((f) => ({ ...f, visit_limit_type: e.target.value }))}
                  className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                >
                  {VISIT_LIMIT_TYPES.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              {planForm.visit_limit_type === "defined" && (
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-body">Number of Visits</label>
                  <input
                    type="number"
                    min="1"
                    value={planForm.visit_limit_count}
                    onChange={(e) => setPlanForm((f) => ({ ...f, visit_limit_count: e.target.value }))}
                    className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-body">
                Response Time / SLA <span className="font-normal text-body/70">(only publish once operationally confirmed)</span>
              </label>
              <input
                value={planForm.response_time_sla}
                onChange={(e) => setPlanForm((f) => ({ ...f, response_time_sla: e.target.value }))}
                placeholder="e.g. Standard Response / Priority Response"
                className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-body">
                Service Coverage Matrix{" "}
                <span className="font-normal text-body/70">(mark each service item as included, excluded, chargeable, or requiring a quotation)</span>
              </label>
              <div className="space-y-2 rounded-md border border-line p-3">
                {(planForm.coverage_items || []).length === 0 && (
                  <p className="text-[12.5px] text-body/60">No service items yet — add one below.</p>
                )}
                {(planForm.coverage_items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={item.name}
                      onChange={(e) =>
                        setPlanForm((f) => ({
                          ...f,
                          coverage_items: f.coverage_items.map((it, i) => (i === idx ? { ...it, name: e.target.value } : it)),
                        }))
                      }
                      placeholder="e.g. MCB / DB Inspection"
                      className="min-w-0 flex-1 rounded-md border border-line px-2.5 py-2 text-[13px] outline-none focus:border-ink"
                    />
                    <select
                      value={item.status}
                      onChange={(e) =>
                        setPlanForm((f) => ({
                          ...f,
                          coverage_items: f.coverage_items.map((it, i) => (i === idx ? { ...it, status: e.target.value } : it)),
                        }))
                      }
                      className="flex-none rounded-md border border-line px-2 py-2 text-[12px] font-semibold outline-none focus:border-ink"
                    >
                      {COVERAGE_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.short}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setPlanForm((f) => ({ ...f, coverage_items: f.coverage_items.filter((_, i) => i !== idx) }))}
                      className="grid h-8 w-8 flex-none place-items-center rounded-md text-body/50 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setPlanForm((f) => ({ ...f, coverage_items: [...(f.coverage_items || []), { name: "", status: "included" }] }))
                  }
                  className="mt-1 flex items-center gap-1.5 text-[12.5px] font-bold text-ink hover:underline"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  Add Service Item
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-body">Benefits (one per line)</label>
              <textarea
                rows={4}
                value={planForm.benefits}
                onChange={(e) => setPlanForm((f) => ({ ...f, benefits: e.target.value }))}
                className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] font-mono outline-none focus:border-ink"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="mb-1.5 block text-[12px] font-semibold text-body">Display Order</label>
                <input
                  type="number"
                  value={planForm.display_order}
                  onChange={(e) => setPlanForm((f) => ({ ...f, display_order: e.target.value }))}
                  className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                />
              </div>
              <label className="flex items-center gap-2 pt-5 text-[13px] font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={planForm.active}
                  onChange={(e) => setPlanForm((f) => ({ ...f, active: e.target.checked }))}
                />
                Live on site
              </label>
            </div>

            <label className="flex items-center gap-2 text-[13px] font-semibold text-ink">
              <input
                type="checkbox"
                checked={planForm.featured}
                onChange={(e) => setPlanForm((f) => ({ ...f, featured: e.target.checked }))}
              />
              Mark as "Most Popular" (shown highlighted on the public Plans page — automatically unmarks any other plan)
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={savingPlan}
                className="rounded-md bg-yellow px-6 py-3 text-[13.5px] font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:opacity-60"
              >
                {savingPlan ? "Saving…" : "Save Plan"}
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
