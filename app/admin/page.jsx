"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { STATUS_META as REQUEST_STATUS_META } from "@/lib/serviceRequestMeta";
import {
  AmcBadge,
  ArticleIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  ClockIcon,
  HomeIcon,
  ImageIcon,
  InboxIcon,
  MapIcon,
  SlidersIcon,
  SparklesIcon,
  StarIcon,
  WalletIcon,
  WrenchIcon,
} from "@/components/icons";

function CountUp({ value }) {
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
  return typeof value === "number" ? display : value;
}

const STATUS_META = {
  new: { label: "New", cls: "bg-blue-50 text-blue-700" },
  in_progress: { label: "In Progress", cls: "bg-amber-50 text-amber-700" },
  closed: { label: "Closed", cls: "bg-emerald-50 text-emerald-700" },
};

const REQUEST_STATUS_GROUPS = {
  pending: ["requested", "under_review"],
  assigned: ["assigned", "scheduled", "on_the_way"],
  inProgress: ["in_progress", "material_required", "customer_approval_pending"],
  completed: ["completed", "confirmed", "closed"],
};

const TYPE_LABELS = { booking: "Booking", amc: "AMC", corporate: "Corporate" };

const fmt = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const QUICK_ACTIONS = [
  { label: "Add Service", href: "/admin/services", icon: WrenchIcon, cls: "bg-amber-50 text-amber-600" },
  { label: "Write Blog Post", href: "/admin/blog/new", icon: ArticleIcon, cls: "bg-violet-50 text-violet-600" },
  { label: "Add Testimonial", href: "/admin/testimonials", icon: StarIcon, cls: "bg-yellow/15 text-yellow-dark" },
  { label: "Add Project Photo", href: "/admin/projects", icon: ImageIcon, cls: "bg-rose-50 text-rose-600" },
  { label: "Edit Home Page", href: "/admin/home", icon: HomeIcon, cls: "bg-blue-50 text-blue-600" },
  { label: "Service Areas", href: "/admin/service-areas", icon: MapIcon, cls: "bg-emerald-50 text-emerald-600" },
  { label: "Contact Settings", href: "/admin/settings", icon: SlidersIcon, cls: "bg-indigo-50 text-indigo-600" },
];

function StatCard({ label, value, href, icon: Icon, delay = 0, accent, iconCls, glowCls, bgTint }) {
  return (
    <Link
      href={href}
      style={{ animationDelay: `${delay}s` }}
      className={`card-hover group relative isolate block overflow-hidden rounded-2xl border border-line bg-gradient-to-br ${bgTint} p-5 opacity-0 animate-fade-up`}
    >
      {/* Accent bar that draws in on hover */}
      <span className={`absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r ${accent} transition-transform duration-300 ease-out group-hover:scale-x-100`} />
      {/* Soft glow that blooms on hover */}
      <span className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${glowCls}`} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[12px] font-semibold text-body">{label}</span>
          <b className="block text-[20px] font-black leading-none tabular-nums text-ink sm:text-[30px]">
            <CountUp value={value} />
          </b>
        </div>
        <span className={`grid h-11 w-11 flex-none place-items-center rounded-2xl shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${iconCls}`}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <div className="relative mt-4 flex items-center gap-1 border-t border-line/60 pt-3 text-[11.5px] font-bold text-body">
        View details
        <ChevronRightIcon className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    newEnquiries: 0,
    totalEnquiries: 0,
    posts: 0,
    testimonials: 0,
    projects: 0,
    pendingRequests: 0,
    assignedRequests: 0,
    inProgressRequests: 0,
    completedRequests: 0,
    activeAmcs: 0,
    expiringAmcs: 0,
    pendingPayments: 0,
    newAmcSales: 0,
    amcRenewals: 0,
    chargeableWork: 0,
    pendingHealthChecks: 0,
  });
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [live, setLive] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!supabase) return;
    const todayStr = new Date().toISOString().slice(0, 10);
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    const in30DaysStr = in30Days.toISOString().slice(0, 10);
    const monthStartStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [
      enquiries,
      newEnquiries,
      posts,
      testimonials,
      projects,
      pendingRequests,
      assignedRequests,
      inProgressRequests,
      completedRequests,
      recent,
      recentReq,
      activeAmcs,
      expiringAmcs,
      pendingInvoices,
      newAmcSales,
      amcRenewals,
      chargeableWork,
      pendingHealthChecks,
    ] = await Promise.all([
      supabase.from("enquiries").select("id", { count: "exact", head: true }),
      supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("read", false),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      supabase.from("testimonials").select("id", { count: "exact", head: true }),
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).in("status", REQUEST_STATUS_GROUPS.pending),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).in("status", REQUEST_STATUS_GROUPS.assigned),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).in("status", REQUEST_STATUS_GROUPS.inProgress),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).in("status", REQUEST_STATUS_GROUPS.completed),
      supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("service_requests").select("*, profiles(name, mobile)").order("created_at", { ascending: false }).limit(5),
      supabase.from("amc_subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase
        .from("amc_subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .gte("expiry_date", todayStr)
        .lte("expiry_date", in30DaysStr),
      supabase.from("invoices").select("id", { count: "exact", head: true }).neq("payment_status", "paid"),
      supabase
        .from("amc_subscriptions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", monthStartStr)
        .is("renewed_from", null),
      supabase
        .from("amc_subscriptions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", monthStartStr)
        .not("renewed_from", "is", null),
      supabase.from("quotations").select("id", { count: "exact", head: true }).in("status", ["sent", "viewed", "accepted"]),
      supabase.from("health_checks").select("id", { count: "exact", head: true }).eq("status", "requested"),
    ]);
    setStats({
      totalEnquiries: enquiries.count ?? 0,
      newEnquiries: newEnquiries.count ?? 0,
      posts: posts.count ?? 0,
      testimonials: testimonials.count ?? 0,
      projects: projects.count ?? 0,
      pendingRequests: pendingRequests.count ?? 0,
      assignedRequests: assignedRequests.count ?? 0,
      inProgressRequests: inProgressRequests.count ?? 0,
      completedRequests: completedRequests.count ?? 0,
      activeAmcs: activeAmcs.count ?? 0,
      expiringAmcs: expiringAmcs.count ?? 0,
      pendingPayments: pendingInvoices.count ?? 0,
      newAmcSales: newAmcSales.count ?? 0,
      amcRenewals: amcRenewals.count ?? 0,
      chargeableWork: chargeableWork.count ?? 0,
      pendingHealthChecks: pendingHealthChecks.count ?? 0,
    });
    setRecentEnquiries(recent.data ?? []);
    setRecentRequests(recentReq.data ?? []);
    setLoadingRecent(false);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Live-refresh the moment a new enquiry or service request lands, so counts and
  // the activity lists never go stale without a manual reload. Requires Realtime to
  // be enabled for these two tables in the Supabase dashboard (Database > Replication).
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("admin-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "enquiries" }, fetchDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "service_requests" }, fetchDashboard)
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboard]);

  const todayStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const STAT_CARDS = [
    {
      label: "Active AMCs",
      value: stats.activeAmcs,
      href: "/admin/amc",
      icon: AmcBadge,
      accent: "from-yellow/0 via-yellow to-yellow/0",
      iconCls: "bg-yellow/15 text-yellow-dark",
      glowCls: "bg-yellow",
      bgTint: "from-yellow/10 via-white to-white",
    },
    {
      label: "AMCs Expiring Soon",
      value: stats.expiringAmcs,
      href: "/admin/amc",
      icon: ClockIcon,
      accent: "from-red-500/0 via-red-500 to-red-500/0",
      iconCls: "bg-red-50 text-red-600",
      glowCls: "bg-red-400",
      bgTint: "from-red-50/50 via-white to-white",
    },
    {
      label: "Pending Payments",
      value: stats.pendingPayments,
      href: "/admin/payments",
      icon: WalletIcon,
      accent: "from-emerald-500/0 via-emerald-500 to-emerald-500/0",
      iconCls: "bg-emerald-50 text-emerald-600",
      glowCls: "bg-emerald-400",
      bgTint: "from-emerald-50/50 via-white to-white",
    },
    {
      label: "New Enquiries",
      value: stats.newEnquiries,
      href: "/admin/enquiries",
      icon: InboxIcon,
      accent: "from-blue-500/0 via-blue-500 to-blue-500/0",
      iconCls: "bg-blue-50 text-blue-600",
      glowCls: "bg-blue-400",
      bgTint: "from-blue-50/50 via-white to-white",
    },
    {
      label: "Total Enquiries",
      value: stats.totalEnquiries,
      href: "/admin/enquiries",
      icon: InboxIcon,
      accent: "from-indigo-500/0 via-indigo-500 to-indigo-500/0",
      iconCls: "bg-indigo-50 text-indigo-600",
      glowCls: "bg-indigo-400",
      bgTint: "from-indigo-50/50 via-white to-white",
    },
    {
      label: "Pending Requests",
      value: stats.pendingRequests,
      href: "/admin/service-requests",
      icon: WrenchIcon,
      accent: "from-amber-500/0 via-amber-500 to-amber-500/0",
      iconCls: "bg-amber-50 text-amber-600",
      glowCls: "bg-amber-400",
      bgTint: "from-amber-50/50 via-white to-white",
    },
    {
      label: "Assigned Requests",
      value: stats.assignedRequests,
      href: "/admin/service-requests",
      icon: WrenchIcon,
      accent: "from-cyan-500/0 via-cyan-500 to-cyan-500/0",
      iconCls: "bg-cyan-50 text-cyan-600",
      glowCls: "bg-cyan-400",
      bgTint: "from-cyan-50/50 via-white to-white",
    },
    {
      label: "In-Progress Requests",
      value: stats.inProgressRequests,
      href: "/admin/service-requests",
      icon: WrenchIcon,
      accent: "from-orange-500/0 via-orange-500 to-orange-500/0",
      iconCls: "bg-orange-50 text-orange-600",
      glowCls: "bg-orange-400",
      bgTint: "from-orange-50/50 via-white to-white",
    },
    {
      label: "Completed Requests",
      value: stats.completedRequests,
      href: "/admin/service-requests",
      icon: WrenchIcon,
      accent: "from-emerald-500/0 via-emerald-500 to-emerald-500/0",
      iconCls: "bg-emerald-50 text-emerald-600",
      glowCls: "bg-emerald-400",
      bgTint: "from-emerald-50/50 via-white to-white",
    },
    {
      label: "Blog Posts",
      value: stats.posts,
      href: "/admin/blog",
      icon: ArticleIcon,
      accent: "from-violet-500/0 via-violet-500 to-violet-500/0",
      iconCls: "bg-violet-50 text-violet-600",
      glowCls: "bg-violet-400",
      bgTint: "from-violet-50/50 via-white to-white",
    },
    {
      label: "Testimonials",
      value: stats.testimonials,
      href: "/admin/testimonials",
      icon: StarIcon,
      accent: "from-yellow/0 via-yellow to-yellow/0",
      iconCls: "bg-yellow/15 text-yellow-dark",
      glowCls: "bg-yellow",
      bgTint: "from-yellow/10 via-white to-white",
    },
    {
      label: "Project Photos",
      value: stats.projects,
      href: "/admin/projects",
      icon: ImageIcon,
      accent: "from-rose-500/0 via-rose-500 to-rose-500/0",
      iconCls: "bg-rose-50 text-rose-600",
      glowCls: "bg-rose-400",
      bgTint: "from-rose-50/50 via-white to-white",
    },
    {
      label: "New AMC Sales (This Month)",
      value: stats.newAmcSales,
      href: "/admin/amc",
      icon: AmcBadge,
      accent: "from-teal-500/0 via-teal-500 to-teal-500/0",
      iconCls: "bg-teal-50 text-teal-600",
      glowCls: "bg-teal-400",
      bgTint: "from-teal-50/50 via-white to-white",
    },
    {
      label: "AMC Renewals (This Month)",
      value: stats.amcRenewals,
      href: "/admin/amc",
      icon: SparklesIcon,
      accent: "from-violet-500/0 via-violet-500 to-violet-500/0",
      iconCls: "bg-violet-50 text-violet-600",
      glowCls: "bg-violet-400",
      bgTint: "from-violet-50/50 via-white to-white",
    },
    {
      label: "Chargeable Work Pending",
      value: stats.chargeableWork,
      href: "/admin/quotations",
      icon: WalletIcon,
      accent: "from-orange-500/0 via-orange-500 to-orange-500/0",
      iconCls: "bg-orange-50 text-orange-600",
      glowCls: "bg-orange-400",
      bgTint: "from-orange-50/50 via-white to-white",
    },
    {
      label: "Pending Health Checks",
      value: stats.pendingHealthChecks,
      href: "/admin/health-checks",
      icon: HomeIcon,
      accent: "from-sky-500/0 via-sky-500 to-sky-500/0",
      iconCls: "bg-sky-50 text-sky-600",
      glowCls: "bg-sky-400",
      bgTint: "from-sky-50/50 via-white to-white",
    },
  ];

  return (
    <AdminGuard>
      <AdminLayout title="Dashboard">
        {/* Welcome banner */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-ink px-6 py-7 sm:px-8 sm:py-8">
          <span className="glow-blob -right-14 -top-20 h-56 w-56 bg-yellow/25" />
          <span className="glow-blob -bottom-24 -left-10 h-48 w-48 bg-yellow/10" style={{ animationDelay: "2.2s" }} />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow/30 bg-yellow/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-yellow">
                  <SparklesIcon className="h-3 w-3" /> Overview
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider transition-colors ${
                    live ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-white/10 bg-white/5 text-white/35"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`} />
                  {live ? "Live" : "Connecting…"}
                </span>
              </div>
              <h2 className="mt-3 text-[21px] font-extrabold text-white sm:text-[25px]">Welcome back</h2>
              <p className="mt-1.5 max-w-[56ch] text-[13.5px] text-white/55">
                A quick snapshot of activity across the site. Click any card to jump straight to that section.
              </p>
            </div>
            <p className="whitespace-nowrap text-[12.5px] font-semibold text-white/40">{todayStr}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {STAT_CARDS.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 0.06} />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="flex flex-col gap-5">
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_0_rgba(20,20,20,0.02)]">
            <div className="flex items-center justify-between border-b border-line bg-cream/40 px-5 py-3">
              <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-body">
                <InboxIcon className="h-3.5 w-3.5 text-yellow-dark" /> Recent Enquiries
              </span>
              <Link
                href="/admin/enquiries"
                className="group flex items-center gap-1 text-[12.5px] font-semibold text-ink underline-offset-2 hover:underline"
              >
                View all
                <ArrowRightIcon className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
            {loadingRecent ? (
              <div className="p-10 text-center text-[13.5px] text-body">Loading...</div>
            ) : recentEnquiries.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-center text-[13.5px] text-body">
                <InboxIcon className="h-6 w-6 text-body/40" />
                No enquiries yet.
              </div>
            ) : (
              <div className="divide-y divide-line">
                {recentEnquiries.map((e) => {
                  const meta = STATUS_META[e.status] ?? STATUS_META.new;
                  const name = e.name || e.contact_person || "—";
                  return (
                    <Link
                      key={e.id}
                      href="/admin/enquiries"
                      className="group flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-cream/30"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-gradient-to-br from-ink to-[#2a2a2a] shadow-sm ring-4 ring-white text-[12px] font-extrabold text-yellow transition-transform duration-200 group-hover:scale-105">
                          {name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <b className="text-[13.5px] text-ink">{name}</b>
                            <span className="rounded-full bg-cream px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-body">
                              {TYPE_LABELS[e.type] ?? e.type}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-[12.5px] text-body">{e.mobile || e.email || "—"}</p>
                        </div>
                      </div>
                      <div className="flex flex-none items-center gap-3">
                        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.cls}`}>
                          {meta.label}
                        </span>
                        <span className="whitespace-nowrap text-[11.5px] text-body">{fmt(e.created_at)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_0_rgba(20,20,20,0.02)]">
            <div className="flex items-center justify-between border-b border-line bg-cream/40 px-5 py-3">
              <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-body">
                <WrenchIcon className="h-3.5 w-3.5 text-yellow-dark" /> Recent Service Requests
              </span>
              <Link
                href="/admin/service-requests"
                className="group flex items-center gap-1 text-[12.5px] font-semibold text-ink underline-offset-2 hover:underline"
              >
                View all
                <ArrowRightIcon className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
            {loadingRecent ? (
              <div className="p-10 text-center text-[13.5px] text-body">Loading...</div>
            ) : recentRequests.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-center text-[13.5px] text-body">
                <WrenchIcon className="h-6 w-6 text-body/40" />
                No service requests yet.
              </div>
            ) : (
              <div className="divide-y divide-line">
                {recentRequests.map((r) => {
                  const meta = REQUEST_STATUS_META[r.status] ?? REQUEST_STATUS_META.requested;
                  return (
                    <Link
                      key={r.id}
                      href="/admin/service-requests"
                      className="group flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-cream/30"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-gradient-to-br from-ink to-[#2a2a2a] shadow-sm ring-4 ring-white text-yellow transition-transform duration-200 group-hover:scale-105">
                          <WrenchIcon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <b className="text-[13.5px] text-ink">{r.profiles?.name || "—"}</b>
                            <span className="rounded-full bg-cream px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-body">
                              {r.ticket_number}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-[12.5px] text-body">{r.service_type || "—"}</p>
                        </div>
                      </div>
                      <div className="flex flex-none items-center gap-3">
                        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.cls}`}>
                          {meta.label}
                        </span>
                        <span className="whitespace-nowrap text-[11.5px] text-body">{fmt(r.created_at)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="mb-3 flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-body">
              <SparklesIcon className="h-3.5 w-3.5 text-yellow-dark" /> Quick Actions
            </h2>
            <div className="flex flex-col gap-1">
              {QUICK_ACTIONS.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13.5px] font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-cream/70 hover:shadow-sm"
                >
                  <span
                    className={`grid h-9 w-9 flex-none place-items-center rounded-xl shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${a.cls}`}
                  >
                    <a.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">{a.label}</span>
                  <ArrowRightIcon className="h-3.5 w-3.5 flex-none text-body/0 transition-all duration-200 -translate-x-1 group-hover:translate-x-0 group-hover:text-body/50" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
