"use client";

import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage, imagekitConfigured } from "@/lib/imagekit";
import CustomerPicker, { avatarGradient } from "@/components/admin/CustomerPicker";
import { FormSection, Field, inputClass, ImageUploadField } from "@/components/admin/FormKit";
import {
  AmcBadge,
  CalendarIcon,
  CheckCircle,
  ClipboardIcon,
  EditIcon,
  PlusIcon,
  ReportIcon,
  SlidersIcon,
  SparklesIcon,
  TrashIcon,
  UserIcon,
} from "@/components/icons";

const DEFAULT_PLANS_PAGE = {
  eyebrow: "AMC Plans",
  title_plain: "Choose Your",
  title_highlight: "Coverage",
  subtitle: "Compare our Annual Maintenance Contract plans and subscribe online — or request a custom proposal for larger properties.",
  trust_badges: "No Hidden Fees\nCancel Anytime\nCertified Technicians",
  cta_label: "Request a Custom Quote",
  image_url: "",
};

const CATEGORY_META = {
  residential: { cls: "bg-blue-50 text-blue-700", accent: "from-blue-500 to-indigo-600" },
  office: { cls: "bg-violet-50 text-violet-700", accent: "from-violet-500 to-purple-600" },
  commercial: { cls: "bg-amber-50 text-amber-700", accent: "from-amber-500 to-orange-600" },
  corporate: { cls: "bg-emerald-50 text-emerald-700", accent: "from-emerald-600 to-teal-700" },
};

const CATEGORIES = ["residential", "office", "commercial", "corporate"];
const FREQUENCIES = [
  { value: "monthly", label: "Monthly", months: 1 },
  { value: "quarterly", label: "Quarterly", months: 3 },
  { value: "half_yearly", label: "Half-Yearly", months: 6 },
  { value: "yearly", label: "Yearly", months: 12 },
];
const FREQUENCY_MONTHS = Object.fromEntries(FREQUENCIES.map((f) => [f.value, f.months]));

const EMPTY_PLAN = {
  name: "",
  category: "residential",
  price_label: "",
  price: "",
  duration_label: "Per Year",
  duration_months: 12,
  visit_frequency: "quarterly",
  coverage: "",
  benefits: "",
  display_order: 0,
  active: true,
  featured: false,
};

function listToText(arr) {
  return Array.isArray(arr) ? arr.join("\n") : "";
}
function textToList(text) {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}
function addMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}
function daysLeft(expiry) {
  return Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
}
function generateVisitDates(startDate, durationMonths, frequency) {
  const interval = FREQUENCY_MONTHS[frequency] || 3;
  const count = Math.max(1, Math.floor(durationMonths / interval));
  const dates = [];
  for (let i = 1; i <= count; i++) dates.push(addMonths(startDate, interval * i));
  return dates;
}

export default function AdminAmcPage() {
  const [tab, setTab] = useState("plans"); // "plans" | "subscriptions"

  const [plans, setPlans] = useState([]);
  const [planForm, setPlanForm] = useState(null);
  const [savingPlan, setSavingPlan] = useState(false);

  const [subs, setSubs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [subForm, setSubForm] = useState(null);
  const [savingSub, setSavingSub] = useState(false);
  const [expandedSub, setExpandedSub] = useState(null);
  const [visits, setVisits] = useState([]);

  const [pageContent, setPageContent] = useState(DEFAULT_PLANS_PAGE);
  const [savingPage, setSavingPage] = useState(false);
  const [uploadingPageImage, setUploadingPageImage] = useState(false);

  const fetchPlans = async () => {
    const { data } = await supabase.from("amc_plans").select("*").order("display_order", { ascending: true });
    setPlans(data ?? []);
  };
  const fetchSubs = async () => {
    const { data } = await supabase
      .from("amc_subscriptions")
      .select("*, profiles(name, email, mobile)")
      .order("created_at", { ascending: false });
    setSubs(data ?? []);
  };
  const fetchCustomers = async () => {
    const { data } = await supabase.from("profiles").select("id, name, email, mobile, avatar_url").eq("is_admin", false);
    setCustomers(data ?? []);
  };
  const fetchPageContent = async () => {
    const { data } = await supabase.from("site_settings").select("data").eq("key", "amc_plans_page").maybeSingle();
    if (data?.data) setPageContent({ ...DEFAULT_PLANS_PAGE, ...data.data });
  };

  useEffect(() => {
    fetchPlans();
    fetchSubs();
    fetchCustomers();
    fetchPageContent();
  }, []);

  const setPageField = (k, v) => setPageContent((c) => ({ ...c, [k]: v }));

  const uploadPageImage = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploadingPageImage(true);
    try {
      const url = await uploadImage(file, "house-electric/amc");
      setPageField("image_url", url);
    } catch (err) {
      toast.error(err.message);
    }
    setUploadingPageImage(false);
  };

  const savePageContent = async (e) => {
    e.preventDefault();
    setSavingPage(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert([{ key: "amc_plans_page", data: pageContent, updated_at: new Date().toISOString() }]);
    setSavingPage(false);
    if (error) toast.error(error.message);
    else toast.success("AMC Plans page updated");
  };

  const savePlan = async (e) => {
    e.preventDefault();
    setSavingPlan(true);
    const payload = {
      name: planForm.name,
      category: planForm.category,
      price_label: planForm.price_label.trim() || null,
      price: planForm.price === "" ? null : Number(planForm.price),
      duration_label: planForm.duration_label,
      duration_months: Number(planForm.duration_months) || 12,
      visit_frequency: planForm.visit_frequency,
      coverage: textToList(planForm.coverage),
      benefits: textToList(planForm.benefits),
      display_order: Number(planForm.display_order) || 0,
      active: planForm.active,
      featured: planForm.featured,
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
    setPlanForm(null);
    fetchPlans();
  };

  const deletePlan = async (id) => {
    if (!confirm("Delete this AMC plan?")) return;
    await supabase.from("amc_plans").delete().eq("id", id);
    toast.success("AMC plan deleted");
    fetchPlans();
  };

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
    }
    setSavingSub(false);
    toast.success("AMC subscription activated");
    setSubForm(null);
    fetchSubs();
  };

  const updateSubStatus = async (id, status) => {
    await supabase.from("amc_subscriptions").update({ status }).eq("id", id);
    toast.success(`Subscription marked ${status}`);
    fetchSubs();
  };

  const toggleVisits = async (subId) => {
    if (expandedSub === subId) {
      setExpandedSub(null);
      return;
    }
    setExpandedSub(subId);
    const { data } = await supabase
      .from("amc_visits")
      .select("*")
      .eq("subscription_id", subId)
      .order("scheduled_date", { ascending: true });
    setVisits(data ?? []);
  };

  const markVisitDone = async (visit) => {
    await supabase.from("amc_visits").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", visit.id);
    const { data: remaining } = await supabase
      .from("amc_visits")
      .select("*")
      .eq("subscription_id", visit.subscription_id)
      .order("scheduled_date", { ascending: true });
    setVisits(remaining ?? []);
    const nextPending = (remaining ?? []).find((v) => v.status === "pending");
    await supabase.from("amc_subscriptions").update({ next_visit_date: nextPending?.scheduled_date || null }).eq("id", visit.subscription_id);
    toast.success("Visit marked complete");
    fetchSubs();
  };

  return (
    <AdminGuard>
      <AdminLayout title="AMC Management">
        <div className="mb-6 flex w-fit flex-wrap gap-1 rounded-xl border border-line bg-white p-1">
          {["plans", "subscriptions", "page"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-5 py-2.5 text-[13.5px] font-bold capitalize transition-colors ${
                tab === t ? "bg-ink text-white shadow-sm" : "text-body hover:bg-cream"
              }`}
            >
              {t === "plans" ? "AMC Plans" : t === "subscriptions" ? "Customer AMCs" : "Plans Page Content"}
            </button>
          ))}
        </div>

        {tab === "plans" ? (
          planForm ? (
            <form onSubmit={savePlan} className="max-w-xl overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
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
                <label className="mb-1.5 block text-[12px] font-semibold text-body">Coverage (one per line)</label>
                <textarea
                  rows={5}
                  value={planForm.coverage}
                  onChange={(e) => setPlanForm((f) => ({ ...f, coverage: e.target.value }))}
                  className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] font-mono outline-none focus:border-ink"
                  placeholder={"Preventive Electrical Inspection\nDB / Panel Inspection\nMCB / RCCB Checking"}
                />
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
                  onClick={() => setPlanForm(null)}
                  className="rounded-md border border-line px-6 py-3 text-[13.5px] font-semibold text-body hover:border-ink/40"
                >
                  Cancel
                </button>
              </div>
              </div>
            </form>
          ) : (
            <>
              <button
                onClick={() =>
                  setPlanForm({
                    ...EMPTY_PLAN,
                    coverage: "",
                    benefits: "",
                    display_order: plans.length,
                  })
                }
                className="mb-5 flex items-center gap-1.5 rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md"
              >
                <PlusIcon className="h-4 w-4" />
                Add AMC Plan
              </button>

              {plans.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white p-12 text-center text-[13.5px] text-body">
                  <AmcBadge className="h-6 w-6 text-body/40" />
                  No AMC plans yet — add one above.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {plans.map((p) => {
                    const catMeta = CATEGORY_META[p.category] ?? CATEGORY_META.residential;
                    return (
                    <div key={p.id} className="card-hover group relative overflow-hidden rounded-2xl border border-line bg-white p-5">
                      <span className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${catMeta.accent}`} />
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase ${catMeta.cls}`}>
                            {p.category}
                          </span>
                          {p.featured && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[10.5px] font-bold text-yellow">
                              <SparklesIcon className="h-3 w-3" />
                              Popular
                            </span>
                          )}
                        </div>
                        <span className={`inline-flex flex-none items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${p.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${p.active ? "bg-emerald-500" : "bg-gray-400"}`} />
                          {p.active ? "Live" : "Hidden"}
                        </span>
                      </div>
                      <div className="mb-2 flex items-center gap-2.5">
                        <span className={`grid h-9 w-9 flex-none place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ${catMeta.accent}`}>
                          <AmcBadge className="h-4 w-4" />
                        </span>
                        <b className="text-[16px] text-ink">{p.name}</b>
                      </div>
                      <p className="mb-1 text-[15px] font-extrabold text-ink">
                        {p.price_label || "Request Proposal"}
                        {p.price_label && <span className="text-[11px] font-semibold text-body"> / {p.duration_label}</span>}
                      </p>
                      <p className="mb-3 text-[11.5px] text-body">
                        {p.price ? "Online purchase enabled" : "Proposal only — no online purchase"} ·{" "}
                        {FREQUENCIES.find((f) => f.value === p.visit_frequency)?.label || "Quarterly"} visits
                      </p>
                      <ul className="mb-4 space-y-1.5 text-[12.5px] text-body">
                        {(p.coverage || []).slice(0, 4).map((c) => (
                          <li key={c} className="flex items-start gap-1.5">
                            <CheckCircle className="mt-0.5 h-3 w-3 flex-none text-emerald-500" />
                            {c}
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-4 border-t border-line pt-3">
                        <button
                          onClick={() =>
                            setPlanForm({
                              ...p,
                              coverage: listToText(p.coverage),
                              benefits: listToText(p.benefits),
                              price_label: p.price_label || "",
                              price: p.price ?? "",
                              duration_months: p.duration_months || 12,
                              visit_frequency: p.visit_frequency || "quarterly",
                            })
                          }
                          className="flex items-center gap-1 text-[12.5px] font-semibold text-ink hover:underline"
                        >
                          <EditIcon className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => deletePlan(p.id)}
                          className="flex items-center gap-1 text-[12.5px] font-semibold text-red-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </>
          )
        ) : tab === "subscriptions" ? (
          subForm ? (
          <form onSubmit={saveSub} className="max-w-lg overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
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
                onClick={() => setSubForm(null)}
                className="rounded-md border border-line px-6 py-3 text-[13.5px] font-semibold text-body hover:border-ink/40"
              >
                Cancel
              </button>
            </div>
            </div>
          </form>
        ) : (
          <>
            {(() => {
              const activeCount = subs.filter((s) => s.status === "active").length;
              const expiringSoonCount = subs.filter((s) => s.status === "active" && daysLeft(s.expiry_date) <= 30).length;
              const lapsedCount = subs.filter((s) => s.status !== "active").length;
              const SUMMARY_CARDS = [
                { label: "Total AMCs", value: subs.length, icon: AmcBadge, cls: "bg-ink text-yellow" },
                { label: "Active", value: activeCount, icon: CheckCircle, cls: "bg-emerald-50 text-emerald-600" },
                { label: "Expiring Soon", value: expiringSoonCount, icon: CalendarIcon, cls: "bg-amber-50 text-amber-600" },
                { label: "Expired / Cancelled", value: lapsedCount, icon: ReportIcon, cls: "bg-red-50 text-red-500" },
              ];
              return (
                <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {SUMMARY_CARDS.map((c) => (
                    <div key={c.label} className="card-hover rounded-2xl border border-line bg-white p-4">
                      <div className={`mb-2.5 grid h-9 w-9 place-items-center rounded-lg ${c.cls}`}>
                        <c.icon className="h-4 w-4" />
                      </div>
                      <div className="text-[11.5px] font-semibold text-body">{c.label}</div>
                      <div className="mt-0.5 text-[22px] font-extrabold tabular-nums text-ink">{c.value}</div>
                    </div>
                  ))}
                </div>
              );
            })()}

            <button
              onClick={() =>
                setSubForm({ customer_id: "", plan_id: "", start_date: new Date().toISOString().slice(0, 10), expiry_date: "", duration_months: 12 })
              }
              className="mb-5 flex items-center gap-1.5 rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md"
            >
              <PlusIcon className="h-4 w-4" />
              Activate New AMC
            </button>

            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              <div className="flex items-center justify-between border-b border-line bg-cream/40 px-5 py-3">
                <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-body">
                  <AmcBadge className="h-3.5 w-3.5 text-yellow-dark" />
                  {subs.length} Subscription{subs.length === 1 ? "" : "s"}
                </span>
              </div>
              {subs.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-body">
                  <AmcBadge className="h-6 w-6 text-body/40" />
                  No AMC subscriptions yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[13.5px]">
                    <thead>
                      <tr className="border-b border-line bg-cream/40">
                        {["AMC #", "Customer", "Plan", "Expiry", "Status", "Visits"].map((h) => (
                          <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {subs.map((s) => {
                        const name = s.profiles?.name || s.profiles?.email || "—";
                        return (
                        <Fragment key={s.id}>
                          <tr className="group border-t border-line transition-colors hover:bg-cream/30">
                            <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-ink">{s.amc_number}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-ink">
                              <div className="flex items-center gap-2.5">
                                <span className={`grid h-7 w-7 flex-none place-items-center rounded-full bg-gradient-to-br text-[11px] font-extrabold text-white shadow-sm transition-transform duration-200 group-hover:scale-110 ${avatarGradient(name)}`}>
                                  {name.charAt(0).toUpperCase()}
                                </span>
                                {name}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-body">{s.plan_name_snapshot}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-body">
                              <div className="flex items-center gap-2">
                                {s.expiry_date}
                                {s.status === "active" && (() => {
                                  const d = daysLeft(s.expiry_date);
                                  if (d < 0) return null;
                                  const cls = d <= 15 ? "bg-red-50 text-red-600" : d <= 30 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-600";
                                  return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${cls}`}>{d}d left</span>;
                                })()}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={s.status}
                                onChange={(e) => updateSubStatus(s.id, e.target.value)}
                                className={`rounded-full border-0 px-2.5 py-1 text-[11.5px] font-bold outline-none ${
                                  s.status === "active" ? "bg-emerald-50 text-emerald-700" : s.status === "expired" ? "bg-gray-100 text-gray-500" : "bg-red-50 text-red-700"
                                }`}
                              >
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              <button
                                onClick={() => toggleVisits(s.id)}
                                className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] font-bold text-ink transition-colors hover:border-ink/40 hover:bg-cream"
                              >
                                <CalendarIcon className="h-3.5 w-3.5" />
                                {expandedSub === s.id ? "Hide" : "Manage"}
                              </button>
                            </td>
                          </tr>
                          {expandedSub === s.id && (
                            <tr className="border-t border-line bg-cream/30">
                              <td colSpan={6} className="px-4 py-4">
                                {visits.length === 0 ? (
                                  <p className="text-[12.5px] text-body">No scheduled visits for this AMC.</p>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {visits.map((v) => (
                                      <div
                                        key={v.id}
                                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px] font-semibold shadow-sm ${
                                          v.status === "completed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-line bg-white text-ink"
                                        }`}
                                      >
                                        {v.status === "completed" ? <CheckCircle className="h-3.5 w-3.5" /> : <CalendarIcon className="h-3.5 w-3.5 text-body/50" />}
                                        {v.scheduled_date}
                                        {v.status === "pending" && (
                                          <button
                                            onClick={() => markVisitDone(v)}
                                            className="ml-1 rounded-full bg-ink px-2.5 py-1 text-[10.5px] font-bold text-white transition-colors hover:bg-ink-soft"
                                          >
                                            Mark Done
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
          )
        ) : (
          <form onSubmit={savePageContent} className="max-w-2xl space-y-6">
            <FormSection title="Hero Content" hint="Shown at the top of the public AMC Plans page.">
              <Field label="Eyebrow">
                <input value={pageContent.eyebrow} onChange={(e) => setPageField("eyebrow", e.target.value)} className={inputClass} />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Title — Plain Part">
                  <input value={pageContent.title_plain} onChange={(e) => setPageField("title_plain", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Title — Highlighted Part (shown in gold)">
                  <input value={pageContent.title_highlight} onChange={(e) => setPageField("title_highlight", e.target.value)} className={inputClass} />
                </Field>
              </div>
              <Field label="Subtitle">
                <textarea rows={2} value={pageContent.subtitle} onChange={(e) => setPageField("subtitle", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Trust Badges (one per line — shown as checkmark chips)">
                <textarea
                  rows={3}
                  value={pageContent.trust_badges}
                  onChange={(e) => setPageField("trust_badges", e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </Field>
              <Field label="Button Label">
                <input value={pageContent.cta_label} onChange={(e) => setPageField("cta_label", e.target.value)} className={inputClass} />
              </Field>
            </FormSection>

            <FormSection
              title="Hero Photo"
              hint="Shown on the right side of the hero, same as the other service pages. Leave blank to use the default AMC photo."
            >
              <ImageUploadField value={pageContent.image_url} uploading={uploadingPageImage} onUpload={uploadPageImage} aspect="aspect-[4/3.3]" />
              {!imagekitConfigured && <p className="text-[11px] font-bold text-red-500">⚠ ImageKit not configured</p>}
            </FormSection>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={savingPage}
                className="rounded-md bg-yellow px-6 py-3 text-[13.5px] font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-60"
              >
                {savingPage ? "Saving…" : "Save Page Content"}
              </button>
              <a
                href="/amc/plans"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12.5px] font-semibold text-ink underline decoration-line underline-offset-2 hover:decoration-ink"
              >
                Preview page: /amc/plans
              </a>
            </div>
          </form>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
