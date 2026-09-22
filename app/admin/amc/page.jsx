"use client";

import { Fragment, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage, imagekitConfigured } from "@/lib/imagekit";
import { avatarGradient } from "@/components/admin/CustomerPicker";
import { FormSection, Field, inputClass, ImageUploadField, ListEditor } from "@/components/admin/FormKit";
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
  XIcon,
} from "@/components/icons";

function CountUp({ value, format = (v) => v }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (typeof value !== "number") return;
    let frame;
    const duration = 700;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return typeof value === "number" ? format(display) : value;
}

function StatCard({ label, value, format, icon: Icon, cls, glow, accent, delay = 0 }) {
  return (
    <div
      style={{ animationDelay: `${delay}s` }}
      className="card-hover group relative isolate overflow-hidden rounded-2xl border border-line bg-white p-4 opacity-0 animate-fade-up"
    >
      <span className={`absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r ${accent} transition-transform duration-300 ease-out group-hover:scale-x-100`} />
      <span className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${glow}`} />
      <div className="relative flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <p className="text-[11.5px] font-semibold text-body">{label}</p>
          <b className="mt-1 block truncate text-[17px] font-black leading-none tabular-nums text-ink sm:text-[24px]">
            <CountUp value={value} format={format} />
          </b>
        </div>
        <span className={`grid h-9 w-9 flex-none place-items-center rounded-xl shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${cls}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

const DEFAULT_PLANS_PAGE = {
  eyebrow: "AMC Plans",
  title_plain: "Electrical Problem? Just Inform Us.",
  title_highlight: "We'll Take Care of the Rest.",
  subtitle: "With House Electric AMC, you don't have to search for an electrician every time an electrical problem occurs.",
  trust_badges:
    "No Electrician Searching\nNo Service-Charge Negotiation\nProfessional Service Support\nEasy Service Request\nCustomer Dashboard\nWhatsApp & Phone Support",
  primary_cta_label: "Get Your AMC",
  secondary_cta_label: "Book Electrical Health Check",
  whatsapp_cta_label: "WhatsApp Us",
  image_url: "",
};

// The rest of the public /amc/plans page (problem section, SLA stats, types,
// checklist, exclusions, advantages, process, why-house-electric, FAQs) is
// stored on this row of the generic `services` table, reused as-is instead
// of duplicated — see app/(site)/amc/plans/page.jsx's getServiceDetail().
const AMC_SERVICE_SLUG = "annual-maintenance-contract-amc";

const DEFAULT_SERVICE_CONTENT = {
  problem_eyebrow: "",
  problem_heading: "",
  problem_subtitle: "",
  problem_without: "",
  problem_with: "",
  sla_stats: [],
  types_eyebrow: "",
  types_heading: "",
  types_subtitle: "",
  types_items: [],
  checklist_eyebrow: "",
  checklist_heading: "",
  checklist_subtitle: "",
  checklist: "",
  exclusions_eyebrow: "",
  exclusions_heading: "",
  exclusions_subtitle: "",
  exclusions_items: "",
  advantages_eyebrow: "",
  advantages_heading: "",
  advantages_subtitle: "",
  advantages_items: [],
  process_eyebrow: "",
  process_heading: "",
  process_subtitle: "",
  process_items: [],
  why_he_eyebrow: "",
  why_he_heading: "",
  why_he_subtitle: "",
  why_he_items: [],
  faqs: [],
};

const CATEGORY_META = {
  residential: { cls: "bg-blue-50 text-blue-700", accent: "from-blue-500 to-indigo-600" },
  office: { cls: "bg-violet-50 text-violet-700", accent: "from-violet-500 to-purple-600" },
  commercial: { cls: "bg-amber-50 text-amber-700", accent: "from-amber-500 to-orange-600" },
  corporate: { cls: "bg-emerald-50 text-emerald-700", accent: "from-emerald-600 to-teal-700" },
};

const FREQUENCIES = [
  { value: "monthly", label: "Monthly", months: 1 },
  { value: "quarterly", label: "Quarterly", months: 3 },
  { value: "half_yearly", label: "Half-Yearly", months: 6 },
  { value: "yearly", label: "Yearly", months: 12 },
];

const PAGE_SECTIONS = [
  { key: "hero", label: "Hero" },
  { key: "problem", label: "Without / With AMC" },
  { key: "stats", label: "SLA Stats" },
  { key: "types", label: "Plan Types" },
  { key: "checklist", label: "Checklist" },
  { key: "exclusions", label: "Exclusions" },
  { key: "advantages", label: "Why Choose Us" },
  { key: "process", label: "Process" },
  { key: "why_us", label: "Why House Electric" },
  { key: "faqs", label: "FAQs" },
];

function textToList(text) {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}
function daysLeft(expiry) {
  return Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
}

function AdminAmcPageInner() {
  const searchParams = useSearchParams();
  const initialTab = ["plans", "subscriptions", "page"].includes(searchParams.get("tab")) ? searchParams.get("tab") : "plans";
  const [tab, setTab] = useState(initialTab); // "plans" | "subscriptions" | "page"

  const [plans, setPlans] = useState([]);

  const [subs, setSubs] = useState([]);
  const [expandedSub, setExpandedSub] = useState(null);
  const [visits, setVisits] = useState([]);

  const [pageContent, setPageContent] = useState(DEFAULT_PLANS_PAGE);
  const [savingPage, setSavingPage] = useState(false);
  const [uploadingPageImage, setUploadingPageImage] = useState(false);

  const [serviceRowId, setServiceRowId] = useState(null);
  const [serviceForm, setServiceForm] = useState(DEFAULT_SERVICE_CONTENT);
  const [savingServiceContent, setSavingServiceContent] = useState(false);
  const [pageSection, setPageSection] = useState("hero");

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
  const fetchPageContent = async () => {
    const { data } = await supabase.from("site_settings").select("data").eq("key", "amc_plans_page").maybeSingle();
    if (data?.data) setPageContent({ ...DEFAULT_PLANS_PAGE, ...data.data });
  };

  const fetchServiceContent = async () => {
    const { data: item } = await supabase.from("services").select("*").eq("slug", AMC_SERVICE_SLUG).maybeSingle();
    if (!item) return;
    setServiceRowId(item.id);
    setServiceForm({
      problem_eyebrow: item.problem_section?.eyebrow || "",
      problem_heading: item.problem_section?.heading || "",
      problem_subtitle: item.problem_section?.subtitle || "",
      problem_without: (item.problem_section?.without_items || []).join("\n"),
      problem_with: (item.problem_section?.with_items || []).join("\n"),
      sla_stats: item.sla_stats || [],
      types_eyebrow: item.types_section?.eyebrow || "",
      types_heading: item.types_section?.heading || "",
      types_subtitle: item.types_section?.subtitle || "",
      types_items: (item.types_section?.items || []).map((t) => ({ ...t, tags: (t.tags || []).join(", ") })),
      checklist_eyebrow: item.checklist_section?.eyebrow || "",
      checklist_heading: item.checklist_section?.heading || "",
      checklist_subtitle: item.checklist_section?.subtitle || "",
      checklist: (item.checklist_items || []).join("\n"),
      exclusions_eyebrow: item.exclusions_section?.eyebrow || "",
      exclusions_heading: item.exclusions_section?.heading || "",
      exclusions_subtitle: item.exclusions_section?.subtitle || "",
      exclusions_items: (item.exclusions_section?.items || []).join("\n"),
      advantages_eyebrow: item.advantages_section?.eyebrow || "",
      advantages_heading: item.advantages_section?.heading || "",
      advantages_subtitle: item.advantages_section?.subtitle || "",
      advantages_items: item.advantages_section?.items || [],
      process_eyebrow: item.process_section?.eyebrow || "",
      process_heading: item.process_section?.heading || "",
      process_subtitle: item.process_section?.subtitle || "",
      process_items: item.process_section?.items || [],
      why_he_eyebrow: item.why_house_electric_section?.eyebrow || "",
      why_he_heading: item.why_house_electric_section?.heading || "",
      why_he_subtitle: item.why_house_electric_section?.subtitle || "",
      why_he_items: item.why_house_electric_section?.items || [],
      faqs: item.faqs || [],
    });
  };

  useEffect(() => {
    fetchPlans();
    fetchSubs();
    fetchPageContent();
    fetchServiceContent();
  }, []);

  const setPageField = (k, v) => setPageContent((c) => ({ ...c, [k]: v }));
  const setServiceField = (k, v) => setServiceForm((c) => ({ ...c, [k]: v }));

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

  const saveServiceContent = async (e) => {
    e.preventDefault();
    setSavingServiceContent(true);

    const payload = {
      problem_section:
        serviceForm.problem_without.trim() || serviceForm.problem_with.trim()
          ? {
              eyebrow: serviceForm.problem_eyebrow.trim(),
              heading: serviceForm.problem_heading.trim(),
              subtitle: serviceForm.problem_subtitle.trim(),
              without_items: textToList(serviceForm.problem_without),
              with_items: textToList(serviceForm.problem_with),
            }
          : {},
      sla_stats: serviceForm.sla_stats.filter((s) => s.value || s.suffix || s.label),
      types_section:
        serviceForm.types_items.filter((it) => it.title || it.desc).length > 0
          ? {
              eyebrow: serviceForm.types_eyebrow.trim(),
              heading: serviceForm.types_heading.trim(),
              subtitle: serviceForm.types_subtitle.trim(),
              items: serviceForm.types_items
                .filter((it) => it.title || it.desc)
                .map((it) => ({ title: it.title, desc: it.desc, tags: textToList((it.tags || "").replace(/,/g, "\n")) })),
            }
          : {},
      checklist_section: {
        eyebrow: serviceForm.checklist_eyebrow.trim(),
        heading: serviceForm.checklist_heading.trim(),
        subtitle: serviceForm.checklist_subtitle.trim(),
      },
      checklist_items: textToList(serviceForm.checklist),
      exclusions_section: serviceForm.exclusions_items.trim()
        ? {
            eyebrow: serviceForm.exclusions_eyebrow.trim(),
            heading: serviceForm.exclusions_heading.trim(),
            subtitle: serviceForm.exclusions_subtitle.trim(),
            items: textToList(serviceForm.exclusions_items),
          }
        : {},
      advantages_section:
        serviceForm.advantages_items.filter((it) => it.title || it.desc).length > 0
          ? {
              eyebrow: serviceForm.advantages_eyebrow.trim(),
              heading: serviceForm.advantages_heading.trim(),
              subtitle: serviceForm.advantages_subtitle.trim(),
              items: serviceForm.advantages_items.filter((it) => it.title || it.desc),
            }
          : {},
      process_section:
        serviceForm.process_items.filter((it) => it.title || it.desc).length > 0
          ? {
              eyebrow: serviceForm.process_eyebrow.trim(),
              heading: serviceForm.process_heading.trim(),
              subtitle: serviceForm.process_subtitle.trim(),
              items: serviceForm.process_items.filter((it) => it.title || it.desc),
            }
          : {},
      why_house_electric_section:
        serviceForm.why_he_items.filter((it) => it.title || it.desc).length > 0
          ? {
              eyebrow: serviceForm.why_he_eyebrow.trim(),
              heading: serviceForm.why_he_heading.trim(),
              subtitle: serviceForm.why_he_subtitle.trim(),
              items: serviceForm.why_he_items.filter((it) => it.title || it.desc),
            }
          : {},
      faqs: serviceForm.faqs.filter((f) => f.q?.trim() || f.a?.trim()),
    };

    const { error } = serviceRowId
      ? await supabase.from("services").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", serviceRowId)
      : await supabase
          .from("services")
          .insert([{ title: "Annual Maintenance Contract (AMC)", slug: AMC_SERVICE_SLUG, icon_key: "amc", active: true, ...payload }])
          .select()
          .single()
          .then(({ data, error }) => {
            if (data) setServiceRowId(data.id);
            return { error };
          });

    setSavingServiceContent(false);
    if (error) toast.error(error.message);
    else toast.success("AMC Plans page updated");
  };

  const deletePlan = async (id) => {
    if (!confirm("Delete this AMC plan?")) return;
    await supabase.from("amc_plans").delete().eq("id", id);
    toast.success("AMC plan deleted");
    fetchPlans();
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

  const activeSubsCount = subs.filter((s) => s.status === "active").length;
  const expiringSoonCount = subs.filter((s) => {
    if (s.status !== "active" || !s.expiry_date) return false;
    const days = (new Date(s.expiry_date) - new Date()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 30;
  }).length;
  const amcRevenue = subs.reduce((s, sub) => s + Number(sub.amount_paid || 0), 0);

  return (
    <AdminGuard>
      <AdminLayout title="AMC Management">
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-ink px-6 py-7 sm:px-8 sm:py-8">
              <span className="glow-blob -right-14 -top-20 h-56 w-56 bg-yellow/25" />
              <span className="glow-blob -bottom-24 -left-10 h-48 w-48 bg-yellow/10" style={{ animationDelay: "2.2s" }} />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow/30 bg-yellow/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-yellow">
                  <SparklesIcon className="h-3 w-3" /> Coverage
                </span>
                <h2 className="mt-3 text-[21px] font-extrabold text-white sm:text-[25px]">AMC Management</h2>
                <p className="mt-1.5 max-w-[56ch] text-[13.5px] text-white/55">Plans, active subscriptions and renewals — all in one place.</p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Active Subscriptions"
                value={activeSubsCount}
                icon={AmcBadge}
                cls="bg-ink text-yellow"
                glow="bg-yellow"
                accent="from-yellow to-amber-500"
                delay={0}
              />
              <StatCard
                label="Expiring in 30 Days"
                value={expiringSoonCount}
                icon={CalendarIcon}
                cls="bg-amber-50 text-amber-600"
                glow="bg-amber-400"
                accent="from-amber-400 to-orange-500"
                delay={0.06}
              />
              <StatCard
                label="Total Plans"
                value={plans.length}
                icon={ClipboardIcon}
                cls="bg-blue-50 text-blue-600"
                glow="bg-blue-400"
                accent="from-blue-400 to-indigo-500"
                delay={0.12}
              />
              <StatCard
                label="AMC Revenue"
                value={amcRevenue}
                format={(v) => `₹${v.toLocaleString("en-IN")}`}
                icon={ReportIcon}
                cls="bg-emerald-50 text-emerald-600"
                glow="bg-emerald-400"
                accent="from-emerald-400 to-teal-500"
                delay={0.18}
              />
            </div>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex w-fit flex-wrap gap-1 rounded-xl border border-line bg-white p-1">
                {["plans", "subscriptions", "page"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`rounded-lg px-5 py-2.5 text-[13.5px] font-bold capitalize transition-colors ${
                      tab === t ? "bg-ink text-white shadow-sm" : "text-body hover:bg-cream"
                    }`}
                  >
                    {t === "plans" ? "Pricing Plans" : t === "subscriptions" ? "Customer AMCs" : "Public Page Content"}
                  </button>
                ))}
              </div>

              {tab === "plans" && (
                <Link
                  href="/admin/amc/plans/new"
                  className="flex items-center gap-1.5 rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add AMC Plan
                </Link>
              )}
              {tab === "subscriptions" && (
                <Link
                  href="/admin/amc/subscriptions/new"
                  className="flex items-center gap-1.5 rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md"
                >
                  <PlusIcon className="h-4 w-4" />
                  Activate New AMC
                </Link>
              )}
            </div>

            <p className="mb-6 max-w-[70ch] rounded-xl bg-cream/60 px-4 py-2.5 text-[12.5px] text-body">
              {tab === "plans" && (
                <>
                  The pricing cards themselves — Basic, Standard, Premium — shown on the AMC Plans page. For everything
                  <em className="not-italic font-semibold text-ink"> else</em> on that page (hero banner, FAQs, comparison
                  sections), see <b className="font-semibold text-ink">Public Page Content</b>.
                </>
              )}
              {tab === "subscriptions" && "Every customer's active or past AMC subscription — activate new ones, manage visits, and track renewals."}
              {tab === "page" && (
                <>
                  Everything on the public AMC Plans page <em className="not-italic font-semibold text-ink">except</em> the
                  pricing cards themselves — hero banner, comparison sections, FAQs and more. To edit the Basic / Standard /
                  Premium cards, see <b className="font-semibold text-ink">Pricing Plans</b>.
                </>
              )}
            </p>

        {tab === "plans" ? (
          <>
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
                      <p className="mb-1 text-[11.5px] text-body">
                        {p.price ? "Online purchase enabled" : "Proposal only — no online purchase"} ·{" "}
                        {FREQUENCIES.find((f) => f.value === p.visit_frequency)?.label || "Quarterly"} visits
                      </p>
                      <p className="mb-3 text-[11.5px] text-body">
                        {p.visit_limit_type === "defined"
                          ? `${p.visit_limit_count || "—"} covered visits`
                          : p.visit_limit_type === "fair_use"
                          ? "Fair-use visits"
                          : "Unlimited covered visits"}
                        {p.response_time_sla ? ` · ${p.response_time_sla}` : ""}
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
                        <Link
                          href={`/admin/amc/plans/${p.id}`}
                          className="flex items-center gap-1 text-[12.5px] font-semibold text-ink hover:underline"
                        >
                          <EditIcon className="h-3.5 w-3.5" />
                          Edit
                        </Link>
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
        ) : tab === "subscriptions" ? (
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
                      <div className="mt-0.5 text-[16px] font-extrabold tabular-nums text-ink sm:text-[22px]">{c.value}</div>
                    </div>
                  ))}
                </div>
              );
            })()}

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
        ) : (
          <div className="max-w-4xl">
            <div className="mb-6 flex flex-wrap gap-1.5 border-b border-line pb-4">
              {PAGE_SECTIONS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setPageSection(s.key)}
                  className={`rounded-lg px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
                    pageSection === s.key ? "bg-ink text-white shadow-sm" : "bg-cream/60 text-body hover:bg-cream"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {pageSection === "hero" && (
              <form onSubmit={savePageContent} className="space-y-6">
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Field label="Main CTA Label">
                      <input value={pageContent.primary_cta_label} onChange={(e) => setPageField("primary_cta_label", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Secondary CTA Label">
                      <input value={pageContent.secondary_cta_label} onChange={(e) => setPageField("secondary_cta_label", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="WhatsApp CTA Label">
                      <input value={pageContent.whatsapp_cta_label} onChange={(e) => setPageField("whatsapp_cta_label", e.target.value)} className={inputClass} />
                    </Field>
                  </div>
                </FormSection>

                <FormSection
                  title="Hero Photo"
                  hint="Shown on the right side of the hero, same as the other service pages. Leave blank to use the default AMC photo."
                >
                  <ImageUploadField value={pageContent.image_url} uploading={uploadingPageImage} onUpload={uploadPageImage} aspect="aspect-[4/3.3]" />
                  {!imagekitConfigured && <p className="text-[11px] font-bold text-red-500">⚠ ImageKit not configured</p>}
                </FormSection>

                <div className="flex items-center gap-4 pb-10">
                  <button
                    type="submit"
                    disabled={savingPage}
                    className="rounded-md bg-yellow px-6 py-3 text-[13.5px] font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-60"
                  >
                    {savingPage ? "Saving…" : "Save Hero Content"}
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

            {pageSection !== "hero" && (
              <form onSubmit={saveServiceContent} className="space-y-6">
                {pageSection === "problem" && (
                  <FormSection
                    title="Without AMC / With AMC"
                    hint="The two-column comparison section right under the SLA stats strip. Leave both lists empty to hide it."
                  >
                    <Field label="Eyebrow">
                      <input value={serviceForm.problem_eyebrow} onChange={(e) => setServiceField("problem_eyebrow", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Heading">
                      <input value={serviceForm.problem_heading} onChange={(e) => setServiceField("problem_heading", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Subtitle">
                      <textarea rows={2} value={serviceForm.problem_subtitle} onChange={(e) => setServiceField("problem_subtitle", e.target.value)} className={inputClass} />
                    </Field>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Without AMC (one step per line)">
                        <textarea rows={5} value={serviceForm.problem_without} onChange={(e) => setServiceField("problem_without", e.target.value)} className={`${inputClass} font-mono`} />
                      </Field>
                      <Field label="With House Electric AMC (one step per line)">
                        <textarea rows={5} value={serviceForm.problem_with} onChange={(e) => setServiceField("problem_with", e.target.value)} className={`${inputClass} font-mono`} />
                      </Field>
                    </div>
                  </FormSection>
                )}

                {pageSection === "stats" && (
                  <FormSection
                    title="SLA Stats Strip"
                    hint="Up to 4 quick stats shown under the hero (e.g. 30 / Mins / Average Arrival SLA). Leave empty to hide."
                  >
                    <ListEditor
                      items={serviceForm.sla_stats}
                      onChange={(v) => setServiceField("sla_stats", v)}
                      fields={[
                        { key: "value", label: "Value (e.g. 30, 100, 24/7)" },
                        { key: "suffix", label: "Suffix (e.g.  Mins,  %,  +)" },
                        { key: "label", label: "Label" },
                      ]}
                      emptyItem={{ value: "", suffix: "", label: "" }}
                      addLabel="Add Stat"
                      max={4}
                    />
                  </FormSection>
                )}

                {pageSection === "types" && (
                  <FormSection
                    title="Plan Types"
                    hint="The Residential / Office / Commercial / Corporate cards. Leave empty to hide."
                  >
                    <Field label="Eyebrow">
                      <input value={serviceForm.types_eyebrow} onChange={(e) => setServiceField("types_eyebrow", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Heading">
                      <input value={serviceForm.types_heading} onChange={(e) => setServiceField("types_heading", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Subtitle">
                      <textarea rows={2} value={serviceForm.types_subtitle} onChange={(e) => setServiceField("types_subtitle", e.target.value)} className={inputClass} />
                    </Field>
                    <ListEditor
                      items={serviceForm.types_items}
                      onChange={(v) => setServiceField("types_items", v)}
                      fields={[
                        { key: "title", label: "Type Title (e.g. Residential AMC)" },
                        { key: "desc", label: "Short Description", type: "textarea" },
                        { key: "tags", label: "Applies To (comma-separated, e.g. Homes, Apartments, Villas)" },
                      ]}
                      emptyItem={{ title: "", desc: "", tags: "" }}
                      addLabel="Add Type"
                      max={4}
                    />
                  </FormSection>
                )}

                {pageSection === "checklist" && (
                  <FormSection
                    title="What's Covered Checklist"
                    hint="The grid of covered items shown further down the page."
                  >
                    <Field label="Items (one per line)">
                      <textarea
                        rows={8}
                        value={serviceForm.checklist}
                        onChange={(e) => setServiceField("checklist", e.target.value)}
                        placeholder={"Fault finding\nSwitch & socket replacement\nMCB replacement\nSafety testing"}
                        className={`${inputClass} font-mono`}
                      />
                    </Field>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <Field label="Eyebrow (optional)">
                        <input value={serviceForm.checklist_eyebrow} onChange={(e) => setServiceField("checklist_eyebrow", e.target.value)} placeholder="What's included" className={inputClass} />
                      </Field>
                      <Field label="Heading (optional)">
                        <input value={serviceForm.checklist_heading} onChange={(e) => setServiceField("checklist_heading", e.target.value)} placeholder="What's Covered in Every AMC Visit" className={inputClass} />
                      </Field>
                      <Field label="Subtitle (optional)">
                        <input value={serviceForm.checklist_subtitle} onChange={(e) => setServiceField("checklist_subtitle", e.target.value)} className={inputClass} />
                      </Field>
                    </div>
                  </FormSection>
                )}

                {pageSection === "exclusions" && (
                  <FormSection
                    title="Chargeable Separately"
                    hint="Materials, new work, major repairs — the exclusions list. Leave items empty to hide."
                  >
                    <Field label="Eyebrow">
                      <input value={serviceForm.exclusions_eyebrow} onChange={(e) => setServiceField("exclusions_eyebrow", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Heading">
                      <input value={serviceForm.exclusions_heading} onChange={(e) => setServiceField("exclusions_heading", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Subtitle">
                      <textarea rows={2} value={serviceForm.exclusions_subtitle} onChange={(e) => setServiceField("exclusions_subtitle", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Chargeable Items (one per line)">
                      <textarea rows={6} value={serviceForm.exclusions_items} onChange={(e) => setServiceField("exclusions_items", e.target.value)} className={`${inputClass} font-mono`} />
                    </Field>
                  </FormSection>
                )}

                {pageSection === "advantages" && (
                  <FormSection title="Why Choose Us Cards" hint="Advantages section. Leave the cards empty to hide.">
                    <Field label="Eyebrow">
                      <input value={serviceForm.advantages_eyebrow} onChange={(e) => setServiceField("advantages_eyebrow", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Heading">
                      <input value={serviceForm.advantages_heading} onChange={(e) => setServiceField("advantages_heading", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Subtitle">
                      <textarea rows={2} value={serviceForm.advantages_subtitle} onChange={(e) => setServiceField("advantages_subtitle", e.target.value)} className={inputClass} />
                    </Field>
                    <ListEditor
                      items={serviceForm.advantages_items}
                      onChange={(v) => setServiceField("advantages_items", v)}
                      fields={[
                        { key: "title", label: "Card Title" },
                        { key: "desc", label: "Card Description", type: "textarea" },
                      ]}
                      emptyItem={{ title: "", desc: "" }}
                      addLabel="Add Card"
                      max={8}
                    />
                  </FormSection>
                )}

                {pageSection === "process" && (
                  <FormSection title="Process Steps" hint="Numbered step-by-step workflow. Leave empty to hide.">
                    <Field label="Eyebrow">
                      <input value={serviceForm.process_eyebrow} onChange={(e) => setServiceField("process_eyebrow", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Heading">
                      <input value={serviceForm.process_heading} onChange={(e) => setServiceField("process_heading", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Subtitle">
                      <textarea rows={2} value={serviceForm.process_subtitle} onChange={(e) => setServiceField("process_subtitle", e.target.value)} className={inputClass} />
                    </Field>
                    <ListEditor
                      items={serviceForm.process_items}
                      onChange={(v) => setServiceField("process_items", v)}
                      fields={[
                        { key: "title", label: "Step Title" },
                        { key: "desc", label: "Step Description", type: "textarea" },
                      ]}
                      emptyItem={{ title: "", desc: "" }}
                      addLabel="Add Step"
                      max={4}
                    />
                  </FormSection>
                )}

                {pageSection === "why_us" && (
                  <FormSection title="Why House Electric" hint="Why choose House Electric specifically. Leave the cards empty to hide.">
                    <Field label="Eyebrow">
                      <input value={serviceForm.why_he_eyebrow} onChange={(e) => setServiceField("why_he_eyebrow", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Heading">
                      <input value={serviceForm.why_he_heading} onChange={(e) => setServiceField("why_he_heading", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Subtitle">
                      <textarea rows={2} value={serviceForm.why_he_subtitle} onChange={(e) => setServiceField("why_he_subtitle", e.target.value)} className={inputClass} />
                    </Field>
                    <ListEditor
                      items={serviceForm.why_he_items}
                      onChange={(v) => setServiceField("why_he_items", v)}
                      fields={[
                        { key: "title", label: "Card Title" },
                        { key: "desc", label: "Card Description", type: "textarea" },
                      ]}
                      emptyItem={{ title: "", desc: "" }}
                      addLabel="Add Card"
                      max={8}
                    />
                  </FormSection>
                )}

                {pageSection === "faqs" && (
                  <FormSection title="FAQs" hint="Shown in the Frequently Asked Questions section near the bottom.">
                    <ListEditor
                      items={serviceForm.faqs}
                      onChange={(v) => setServiceField("faqs", v)}
                      fields={[
                        { key: "q", label: "Question" },
                        { key: "a", label: "Answer", type: "textarea" },
                      ]}
                      emptyItem={{ q: "", a: "" }}
                      addLabel="Add Question"
                    />
                  </FormSection>
                )}

                <div className="flex items-center gap-4 pb-10">
                  <button
                    type="submit"
                    disabled={savingServiceContent}
                    className="rounded-md bg-yellow px-6 py-3 text-[13.5px] font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-60"
                  >
                    {savingServiceContent ? "Saving…" : "Save Changes"}
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
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}

export default function AdminAmcPage() {
  return (
    <Suspense fallback={null}>
      <AdminAmcPageInner />
    </Suspense>
  );
}
