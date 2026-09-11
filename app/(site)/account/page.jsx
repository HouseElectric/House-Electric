"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import Reveal from "@/components/Reveal";
import {
  AmcBadge,
  ArrowRightIcon,
  InboxIcon,
  ReportIcon,
  CheckCircle,
  SparklesIcon,
  PlusIcon,
  WrenchIcon,
  UsersIcon,
  ClockIcon,
  ChevronRightIcon,
  PinIcon,
  BoltBadge,
} from "@/components/icons";

const STATUS_META = {
  requested: { label: "Requested", cls: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  assigned: { label: "Assigned", cls: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  scheduled: { label: "Scheduled", cls: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  in_progress: { label: "In Progress", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

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

function StatCard({ icon: Icon, label, value, subtext, href, accent, iconCls, glowCls, bgTint, delay = 0 }) {
  return (
    <Reveal delay={delay} y={16}>
      <Link
        href={href}
        className={`group relative block overflow-hidden rounded-3xl border border-line/80 bg-gradient-to-br ${bgTint} p-5 shadow-sm transition-all hover:-translate-y-1.5 hover:border-yellow/60 hover:shadow-xl`}
      >
        <span className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
        <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${glowCls}`} />
        <div className="relative flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">{label}</span>
            <b className="block text-3xl font-black leading-none text-ink [font-variant-numeric:tabular-nums]">
              <CountUp value={value} />
            </b>
          </div>
          <span className={`grid h-12 w-12 flex-none place-items-center rounded-2xl shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${iconCls}`}>
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <div className="relative mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-[12px] font-bold text-body">
          <span className="truncate">{subtext}</span>
          <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-slate-100 transition-all group-hover:bg-ink">
            <ArrowRightIcon className="h-3.5 w-3.5 flex-none text-muted transition-all group-hover:translate-x-0.5 group-hover:text-white" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

function daysRemaining(expiry) {
  return Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
}

export default function AccountOverviewPage() {
  const { user, profile } = useCustomerAuth();
  const [stats, setStats] = useState({ open: 0, completed: 0, pending: 0, amc: 0 });
  const [activeAmc, setActiveAmc] = useState(null);
  const [amcDuration, setAmcDuration] = useState(365);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [reqs, invs, amcs] = await Promise.all([
        supabase.from("service_requests").select("*").eq("customer_id", user.id).order("created_at", { ascending: false }),
        supabase.from("invoices").select("payment_status").eq("customer_id", user.id),
        supabase
          .from("amc_subscriptions")
          .select("*")
          .eq("customer_id", user.id)
          .eq("status", "active")
          .order("expiry_date", { ascending: true })
          .limit(1),
      ]);
      const requests = reqs.data ?? [];
      const invoices = invs.data ?? [];
      setStats({
        open: requests.filter((r) => !["completed", "cancelled"].includes(r.status)).length,
        completed: requests.filter((r) => r.status === "completed").length,
        pending: invoices.filter((i) => i.payment_status !== "paid").length,
        amc: (amcs.data ?? []).length,
      });
      setRecentRequests(requests.slice(0, 4));
      const amc = amcs.data?.[0] || null;
      setActiveAmc(amc);
      if (amc) {
        const total = Math.max(1, Math.ceil((new Date(amc.expiry_date) - new Date(amc.start_date)) / (1000 * 60 * 60 * 24)));
        setAmcDuration(total);
      }
      setLoading(false);
    })();
  }, [user]);

  const amcRemaining = activeAmc ? daysRemaining(activeAmc.expiry_date) : 0;
  const amcProgress = activeAmc ? Math.min(100, Math.max(0, 100 - (amcRemaining / amcDuration) * 100)) : 0;
  const firstName = profile?.name ? profile.name.trim().split(/\s+/)[0] : "Valued Member";

  return (
    <div className="space-y-8">
      {/* Hero Welcome Card */}
      <Reveal delay={0} y={10}>
        <div className="relative overflow-hidden rounded-3xl border border-line/80 bg-gradient-to-br from-[#121214] via-[#1A1A1E] to-[#25252B] p-6 text-white shadow-xl md:p-8">
          <div className="glow-blob right-[-10%] top-[-40%] h-[260px] w-[260px] bg-yellow/25 opacity-50 blur-[90px]" />
          <div className="glow-blob left-[30%] bottom-[-50%] h-[200px] w-[200px] bg-amber-500/20 opacity-40 blur-[80px]" />
          <BoltBadge className="pointer-events-none absolute -right-6 -bottom-10 h-48 w-48 text-white/[0.04] sm:h-56 sm:w-56" strokeWidth={1} />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow/40 bg-yellow/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-yellow">
                  <SparklesIcon className="h-4 w-4 text-yellow" />
                  {getGreeting()}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/70">
                  {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Welcome back, {firstName}! 👋
              </h2>
              <p className="max-w-xl text-xs sm:text-sm text-white/70 leading-relaxed">
                Manage your electrical services, view live request statuses, download invoices, or upgrade your Annual Maintenance Contract.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/account/requests/new"
                className="group relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-yellow px-6 py-3.5 text-sm font-black text-ink shadow-lg shadow-yellow/20 transition-all hover:bg-yellow-dark hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusIcon className="h-4 w-4 transition-transform group-hover:rotate-90" />
                <span>Book Service Now</span>
              </Link>
              <Link
                href="/account/amc"
                className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/15"
              >
                <AmcBadge className="h-4 w-4 text-yellow" />
                <span>My AMC Plan</span>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={InboxIcon}
          label="Open Requests"
          value={loading ? "…" : stats.open}
          subtext={stats.open > 0 ? `${stats.open} active service ticket` : "No active tickets"}
          href="/account/requests"
          accent="bg-gradient-to-r from-blue-500 to-indigo-500"
          iconCls="bg-blue-50 text-blue-600"
          glowCls="bg-blue-400"
          bgTint="from-blue-50/50 via-white to-white"
          delay={0.05}
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={loading ? "…" : stats.completed}
          subtext="Resolved jobs count"
          href="/account/requests"
          accent="bg-gradient-to-r from-emerald-500 to-teal-500"
          iconCls="bg-emerald-50 text-emerald-600"
          glowCls="bg-emerald-400"
          bgTint="from-emerald-50/50 via-white to-white"
          delay={0.1}
        />
        <StatCard
          icon={ReportIcon}
          label="Pending Invoices"
          value={loading ? "…" : stats.pending}
          subtext={stats.pending > 0 ? "Action required" : "All payments cleared"}
          href="/account/invoices"
          accent="bg-gradient-to-r from-amber-500 to-yellow"
          iconCls="bg-amber-50 text-amber-600"
          glowCls="bg-amber-400"
          bgTint="from-amber-50/50 via-white to-white"
          delay={0.15}
        />
        <StatCard
          icon={AmcBadge}
          label="Active AMC"
          value={loading ? "…" : stats.amc}
          subtext={activeAmc ? `${amcRemaining} days left` : "No active subscription"}
          href="/account/amc"
          accent="bg-gradient-to-r from-yellow via-amber-400 to-yellow-dark"
          iconCls="bg-yellow/15 text-yellow-dark"
          glowCls="bg-yellow"
          bgTint="from-yellow/10 via-white to-white"
          delay={0.2}
        />
      </div>

      {/* Quick Launch Command Hub */}
      <Reveal delay={0.2} y={14}>
        <div className="rounded-3xl border border-line/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3">
            <h3 className="text-base font-extrabold text-ink flex items-center gap-2 whitespace-nowrap">
              <SparklesIcon className="h-5 w-5 text-yellow-dark flex-none" />
              <span>Quick Action Hub</span>
            </h3>
            <span className="text-[12px] font-semibold text-muted">Frequently used shortcuts</span>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/account/requests/new"
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-2xl border border-line/80 bg-gradient-to-br from-amber-50/70 via-white to-white p-3 transition-all hover:-translate-y-1 hover:border-yellow hover:shadow-lg"
            >
              <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-yellow/25 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative grid h-10 w-10 flex-none place-items-center rounded-2xl bg-yellow text-ink font-bold shadow-[0_6px_16px_-4px_rgba(242,176,30,0.6)] ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <WrenchIcon className="h-4 w-4" />
              </span>
              <div className="relative min-w-0 flex-1">
                <span className="block whitespace-nowrap text-[13px] font-extrabold text-ink">New Request</span>
                <span className="text-[11.5px] font-medium text-body truncate">Book technician</span>
              </div>
              <span className="relative grid h-6 w-6 flex-none place-items-center rounded-full bg-white text-muted shadow-2xs transition-all group-hover:bg-ink group-hover:text-white">
                <ChevronRightIcon className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/account/amc"
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-2xl border border-line/80 bg-gradient-to-br from-amber-50/70 via-white to-white p-3 transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
            >
              <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-amber-300/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative grid h-10 w-10 flex-none place-items-center rounded-2xl bg-amber-100 text-amber-700 font-bold shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <AmcBadge className="h-4 w-4" />
              </span>
              <div className="relative min-w-0 flex-1">
                <span className="block whitespace-nowrap text-[13px] font-extrabold text-ink">My AMC Plan</span>
                <span className="text-[11.5px] font-medium text-body truncate">Visits & coverage</span>
              </div>
              <span className="relative grid h-6 w-6 flex-none place-items-center rounded-full bg-white text-muted shadow-2xs transition-all group-hover:bg-ink group-hover:text-white">
                <ChevronRightIcon className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/account/invoices"
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-2xl border border-line/80 bg-gradient-to-br from-emerald-50/70 via-white to-white p-3 transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
            >
              <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-emerald-300/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative grid h-10 w-10 flex-none place-items-center rounded-2xl bg-emerald-100 text-emerald-700 font-bold shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <ReportIcon className="h-4 w-4" />
              </span>
              <div className="relative min-w-0 flex-1">
                <span className="block whitespace-nowrap text-[13px] font-extrabold text-ink">Invoices</span>
                <span className="text-[11.5px] font-medium text-body truncate">Pay or download</span>
              </div>
              <span className="relative grid h-6 w-6 flex-none place-items-center rounded-full bg-white text-muted shadow-2xs transition-all group-hover:bg-ink group-hover:text-white">
                <ChevronRightIcon className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/account/profile"
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-2xl border border-line/80 bg-gradient-to-br from-rose-50/70 via-white to-white p-3 transition-all hover:-translate-y-1 hover:border-rose-300 hover:shadow-lg"
            >
              <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-rose-300/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative grid h-10 w-10 flex-none place-items-center rounded-2xl bg-rose-100 text-rose-600 font-bold shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <UsersIcon className="h-4 w-4" />
              </span>
              <div className="relative min-w-0 flex-1">
                <span className="block whitespace-nowrap text-[13px] font-extrabold text-ink">My Profile</span>
                <span className="text-[11.5px] font-medium text-body truncate">Address & details</span>
              </div>
              <span className="relative grid h-6 w-6 flex-none place-items-center rounded-full bg-white text-muted shadow-2xs transition-all group-hover:bg-ink group-hover:text-white">
                <ChevronRightIcon className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Main Grid: Recent Activity & AMC Card */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        {/* Recent Service Requests Timeline Feed */}
        <Reveal delay={0.25} className="self-start rounded-3xl border border-line/80 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-line/80 px-6 py-6 bg-slate-50/50">
            <div>
              <h3 className="text-base font-extrabold text-ink">Recent Service Requests</h3>
              <p className="text-[12px] text-body">Track status of your electrical tickets</p>
            </div>
            <Link
              href="/account/requests"
              className="flex items-center gap-1 text-[12.5px] font-extrabold text-ink transition-colors hover:text-yellow-dark"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm font-medium text-body">Loading service history…</div>
          ) : recentRequests.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-yellow-dark">
                <InboxIcon className="h-7 w-7" />
              </span>
              <div className="space-y-1">
                <p className="text-base font-extrabold text-ink">No Service Requests Found</p>
                <p className="text-[13px] text-body">You haven't requested any electrical services yet.</p>
              </div>
              <Link
                href="/account/requests/new"
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-yellow px-5 py-2.5 text-xs font-black text-ink shadow-sm hover:bg-yellow-dark"
              >
                <PlusIcon className="h-4 w-4" />
                Raise First Request
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-line/70 pb-6">
              {recentRequests.map((r) => {
                const meta = STATUS_META[r.status] ?? STATUS_META.requested;
                return (
                  <div key={r.id} className="group flex flex-wrap items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-amber-50/20">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className={`grid h-11 w-11 flex-none place-items-center rounded-2xl border ${meta.cls} font-bold shadow-2xs`}>
                        <WrenchIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-extrabold text-ink transition-colors group-hover:text-amber-800">{r.service_type}</p>
                          <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100/90 px-2.5 py-0.5 font-mono text-[11px] font-extrabold tracking-wide text-slate-600 leading-normal shadow-2xs">
                            {r.ticket_number}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-[12px] font-medium text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <ClockIcon className="h-3.5 w-3.5 text-slate-400 flex-none" />
                            {new Date(r.created_at || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </span>
                          {r.location && (
                            <span className="flex items-center gap-1 max-w-[180px] truncate">
                              <PinIcon className="h-3.5 w-3.5 text-rose-500 flex-none" />
                              <span className="truncate">{r.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-extrabold shadow-2xs ${meta.cls}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                      <Link
                        href="/account/requests"
                        className="grid h-8 w-8 place-items-center rounded-xl border border-line bg-white text-slate-400 shadow-2xs transition-all group-hover:border-ink group-hover:bg-slate-900 group-hover:text-white"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Reveal>

        {/* Right Column: AMC Executive Card & Emergency Dispatch */}
        <div className="space-y-6">
          {/* AMC Card */}
          {activeAmc ? (
            <Reveal delay={0.3} className="overflow-hidden rounded-3xl border border-yellow/40 bg-gradient-to-b from-white via-amber-50/20 to-white shadow-lg">
              <div className="border-b border-yellow/20 bg-gradient-to-r from-yellow/20 via-amber-100/30 to-transparent p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="flex flex-none items-center gap-1.5 whitespace-nowrap text-[11px] font-black uppercase tracking-wider text-yellow-dark bg-yellow/20 px-3 py-1 rounded-full border border-yellow/40">
                    <AmcBadge className="h-4 w-4 flex-none" />
                    AMC Membership
                  </span>
                  <span className="flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-[11px] font-extrabold text-emerald-800">
                    <span className="h-1.5 w-1.5 flex-none rounded-full bg-emerald-500 animate-pulse" />
                    Active Plan
                  </span>
                </div>
                <h4 className="text-lg font-black text-ink">{activeAmc.plan_name_snapshot}</h4>
                <p className="mt-1 font-mono text-[12px] font-bold text-muted">AMC ID: {activeAmc.amc_number}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px] font-extrabold text-ink">
                    <span>Plan Duration</span>
                    <span className={amcRemaining <= 30 ? "text-red-600 font-black" : "text-amber-700"}>
                      {amcRemaining} days remaining
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-line/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${amcProgress}%` }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      className={`h-full rounded-full ${
                        amcRemaining <= 30 ? "bg-gradient-to-r from-red-500 to-rose-600" : "bg-gradient-to-r from-yellow to-amber-500"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-3.5 border border-line/80 text-[12px]">
                  <div>
                    <span className="block text-muted text-[11px]">Valid Until</span>
                    <b className="text-ink">{activeAmc.expiry_date}</b>
                  </div>
                  <div>
                    <span className="block text-muted text-[11px]">Next Visit</span>
                    <b className="text-ink">{activeAmc.next_visit_date || "To be scheduled"}</b>
                  </div>
                </div>

                <Link
                  href="/account/amc"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white py-3 text-xs font-black text-ink shadow-2xs transition-all hover:bg-yellow hover:border-yellow"
                >
                  Manage AMC Subscription
                </Link>
              </div>
            </Reveal>
          ) : (
            <Reveal delay={0.3} className="overflow-hidden rounded-3xl border border-line/80 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-amber-50 text-amber-600 font-bold">
                  <AmcBadge className="h-6 w-6" />
                </span>
                <div>
                  <h4 className="text-base font-extrabold text-ink">No Active AMC Subscription</h4>
                  <p className="text-[12.5px] text-body">Protect your property with zero-breakdown maintenance.</p>
                </div>
              </div>
              <Link
                href="/amc/plans#plans"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow px-4 py-3 text-xs font-black text-ink shadow-sm hover:bg-yellow-dark"
              >
                Explore AMC Plans
              </Link>
            </Reveal>
          )}

        </div>
      </div>
    </div>
  );
}



