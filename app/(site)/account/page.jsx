"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { STATUS_META } from "@/lib/serviceRequestMeta";
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
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/icons";

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

function StatCard({ icon: Icon, label, value, subtext, href, accent, iconCls, delay = 0 }) {
  return (
    <Reveal delay={delay} y={16}>
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-md active:scale-[0.99]"
      >
        <span className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
        <div className="relative flex items-start justify-between gap-2.5 sm:gap-3">
          <div className="space-y-1 min-w-0">
            <span className="block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted leading-tight">
              {label}
            </span>
            <b className="block text-2xl sm:text-3xl font-black leading-none text-ink [font-variant-numeric:tabular-nums]">
              <CountUp value={value} />
            </b>
          </div>
          <span
            className={`grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl shadow-2xs transition-transform duration-300 group-hover:scale-105 ${iconCls}`}
          >
            <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </span>
        </div>
        <div className="relative mt-3 sm:mt-4 flex items-center justify-between border-t border-slate-100 pt-2.5 sm:pt-3 text-[11px] sm:text-[12px] font-bold text-slate-500">
          <span className="leading-tight pr-1 break-words">{subtext}</span>
          <span className="grid h-5.5 w-5.5 sm:h-6 sm:w-6 shrink-0 place-items-center rounded-full bg-slate-100 transition-all group-hover:bg-ink group-hover:text-white">
            <ArrowRightIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
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
  const { phone, whatsapp } = useSiteSettings();
  const [stats, setStats] = useState({ open: 0, completed: 0, pending: 0, amc: 0 });
  const [activeAmc, setActiveAmc] = useState(null);
  const [amcDuration, setAmcDuration] = useState(365);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [reqs, invs, amcs] = await Promise.all([
        supabase
          .from("service_requests")
          .select("*")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false }),
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
      const DONE_STATUSES = ["completed", "confirmed", "closed", "cancelled"];
      setStats({
        open: requests.filter((r) => !DONE_STATUSES.includes(r.status)).length,
        completed: requests.filter((r) => ["completed", "confirmed", "closed"].includes(r.status)).length,
        pending: invoices.filter((i) => i.payment_status !== "paid").length,
        amc: (amcs.data ?? []).length,
      });
      setRecentRequests(requests.slice(0, 4));
      const amc = amcs.data?.[0] || null;
      setActiveAmc(amc);
      if (amc) {
        const total = Math.max(
          1,
          Math.ceil((new Date(amc.expiry_date) - new Date(amc.start_date)) / (1000 * 60 * 60 * 24))
        );
        setAmcDuration(total);
      }
      setLoading(false);
    })();
  }, [user]);

  const amcRemaining = activeAmc ? daysRemaining(activeAmc.expiry_date) : 0;
  const amcProgress = activeAmc
    ? Math.min(100, Math.max(0, 100 - (amcRemaining / amcDuration) * 100))
    : 0;
  const firstName = profile?.name ? profile.name.trim().split(/\s+/)[0] : "Valued Member";

  return (
    <div className="space-y-7 sm:space-y-8">
      {/* Hero Welcome Card - Luxury Executive Header */}
      <Reveal delay={0} y={10}>
        <div className="relative overflow-hidden rounded-3xl border border-amber-400/25 bg-gradient-to-br from-[#14161B] via-[#1A1D24] to-[#121418] p-5 sm:p-7 md:p-8 text-white shadow-[0_10px_35px_-5px_rgba(0,0,0,0.15)]">
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow via-amber-400 to-yellow-dark" />
          <BoltBadge
            className="pointer-events-none absolute -right-6 -bottom-10 h-48 w-48 text-white/[0.04] sm:h-56 sm:w-56"
            strokeWidth={1}
          />

          <div className="relative z-10 flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow/40 bg-yellow/15 px-3 py-1 text-[10.5px] sm:text-[11px] font-black uppercase tracking-wider text-yellow shadow-2xs">
                  <SparklesIcon className="h-3.5 w-3.5 text-yellow" />
                  <span>{getGreeting()}</span>
                </span>
                <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1 text-[10.5px] sm:text-[11px] font-semibold text-white/70">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl md:text-3xl">
                Welcome back, {firstName}! 👋
              </h2>
              <p className="max-w-xl text-xs sm:text-sm text-white/70 leading-relaxed">
                Manage your electrical services, view live request statuses, download invoices, or upgrade your Annual Maintenance Contract.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0 w-full lg:w-auto">
              <Link
                href="/account/requests/new"
                className="group relative inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-yellow px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-black text-ink shadow-lg shadow-yellow/20 transition-all hover:bg-yellow-dark hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusIcon className="h-4 w-4 transition-transform group-hover:rotate-90" />
                <span>Book Service Now</span>
              </Link>
              <Link
                href="/account/amc"
                className="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-white/20 bg-white/10 px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/15"
              >
                <AmcBadge className="h-4 w-4 text-yellow" />
                <span>My AMC Plan</span>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={InboxIcon}
          label="Open Requests"
          value={loading ? "…" : stats.open}
          subtext={stats.open > 0 ? `${stats.open} active service ticket` : "No active tickets"}
          href="/account/requests"
          accent="bg-gradient-to-r from-blue-500 to-indigo-500"
          iconCls="bg-blue-50 text-blue-600 border border-blue-100"
          delay={0.05}
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={loading ? "…" : stats.completed}
          subtext="Resolved jobs count"
          href="/account/requests"
          accent="bg-gradient-to-r from-emerald-500 to-teal-500"
          iconCls="bg-emerald-50 text-emerald-600 border border-emerald-100"
          delay={0.1}
        />
        <StatCard
          icon={ReportIcon}
          label="Pending Invoices"
          value={loading ? "…" : stats.pending}
          subtext={stats.pending > 0 ? "Action required" : "All payments cleared"}
          href="/account/invoices"
          accent="bg-gradient-to-r from-amber-500 to-yellow"
          iconCls="bg-amber-50 text-amber-600 border border-amber-100"
          delay={0.15}
        />
        <StatCard
          icon={AmcBadge}
          label="Active AMC"
          value={loading ? "…" : stats.amc}
          subtext={activeAmc ? `${amcRemaining} days left` : "No active subscription"}
          href="/account/amc"
          accent="bg-gradient-to-r from-yellow via-amber-400 to-yellow-dark"
          iconCls="bg-amber-50 text-yellow-dark border border-amber-200/80"
          delay={0.2}
        />
      </div>

      {/* Quick Launch Command Hub */}
      <Reveal delay={0.2} y={14}>
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line/70 pb-3.5">
            <h3 className="text-sm sm:text-base font-black text-ink flex items-center gap-2 whitespace-nowrap">
              <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-dark flex-none" />
              <span>Quick Action Hub</span>
            </h3>
            <span className="text-[11px] sm:text-[12px] font-semibold text-muted">Frequently used shortcuts</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 xl:grid-cols-4 sm:gap-3.5">
            <Link
              href="/account/requests/new"
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-amber-50/50 via-white to-white p-3 sm:p-3.5 min-h-[68px] sm:min-h-[74px] transition-all hover:-translate-y-0.5 hover:border-yellow hover:shadow-xs active:scale-[0.99]"
            >
              <span className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-yellow to-amber-400 text-ink font-bold shadow-xs transition-transform duration-300 group-hover:scale-105">
                <WrenchIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-xs sm:text-[13px] font-black text-ink leading-tight">New Request</span>
                <span className="mt-0.5 block text-[10.5px] sm:text-[11.5px] font-semibold text-slate-500 leading-tight break-words">
                  Book technician
                </span>
              </div>
              <span className="hidden xs:grid sm:grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400 transition-all group-hover:bg-ink group-hover:text-white">
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </span>
            </Link>

            <Link
              href="/account/amc"
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-amber-50/50 via-white to-white p-3 sm:p-3.5 min-h-[68px] sm:min-h-[74px] transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-xs active:scale-[0.99]"
            >
              <span className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 font-bold shadow-2xs transition-transform duration-300 group-hover:scale-105">
                <AmcBadge className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-xs sm:text-[13px] font-black text-ink leading-tight">My AMC Plan</span>
                <span className="mt-0.5 block text-[10.5px] sm:text-[11.5px] font-semibold text-slate-500 leading-tight break-words">
                  Visits & coverage
                </span>
              </div>
              <span className="hidden xs:grid sm:grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400 transition-all group-hover:bg-ink group-hover:text-white">
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </span>
            </Link>

            <Link
              href="/account/invoices"
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-emerald-50/50 via-white to-white p-3 sm:p-3.5 min-h-[68px] sm:min-h-[74px] transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-xs active:scale-[0.99]"
            >
              <span className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold shadow-2xs transition-transform duration-300 group-hover:scale-105">
                <ReportIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-xs sm:text-[13px] font-black text-ink leading-tight">Invoices</span>
                <span className="mt-0.5 block text-[10.5px] sm:text-[11.5px] font-semibold text-slate-500 leading-tight break-words">
                  Pay or download
                </span>
              </div>
              <span className="hidden xs:grid sm:grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400 transition-all group-hover:bg-ink group-hover:text-white">
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </span>
            </Link>

            <Link
              href="/account/profile"
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-purple-50/50 via-white to-white p-3 sm:p-3.5 min-h-[68px] sm:min-h-[74px] transition-all hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-xs active:scale-[0.99]"
            >
              <span className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 font-bold shadow-2xs transition-transform duration-300 group-hover:scale-105">
                <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-xs sm:text-[13px] font-black text-ink leading-tight">My Profile</span>
                <span className="mt-0.5 block text-[10.5px] sm:text-[11.5px] font-semibold text-slate-500 leading-tight break-words">
                  Address & details
                </span>
              </div>
              <span className="hidden xs:grid sm:grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400 transition-all group-hover:bg-ink group-hover:text-white">
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Main Grid: Recent Activity & AMC Card */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        {/* Recent Service Requests Timeline Feed */}
        <Reveal delay={0.25} className="self-start rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line/80 px-4 py-3.5 sm:px-6 sm:py-4.5 bg-slate-50/60">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-black text-ink">Recent Service Requests</h3>
              <p className="text-[11px] sm:text-[12px] text-body mt-0.5">Track status of your electrical tickets</p>
            </div>
            <Link
              href="/account/requests"
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-black text-ink shadow-2xs transition-all hover:border-yellow hover:bg-yellow hover:text-ink"
            >
              <span>View All</span>
              <ChevronRightIcon className="h-3 w-3 shrink-0" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm font-medium text-body">Loading service history…</div>
          ) : recentRequests.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-8 sm:p-12 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-yellow-dark shadow-2xs">
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
                <span>Raise First Request</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-line/70">
              {recentRequests.map((r) => {
                const meta = STATUS_META[r.status] ?? STATUS_META.requested;
                return (
                  <Link
                    key={r.id}
                    href={`/account/requests/${r.id}`}
                    className="group block border-b border-line/70 last:border-0 px-4 py-3.5 sm:px-6 sm:py-4 transition-colors hover:bg-amber-50/20"
                  >
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                        <span
                          className={`grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-2xl border ${meta.cls} font-bold shadow-2xs mt-0.5 sm:mt-0`}
                        >
                          <WrenchIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <p className="text-[13.5px] sm:text-sm font-extrabold text-ink transition-colors group-hover:text-amber-800 leading-snug break-words">
                              {r.service_type}
                            </p>
                            <span className="inline-flex shrink-0 items-center rounded-md border border-slate-200 bg-slate-100/90 px-2 py-0.5 font-mono text-[10px] sm:text-[11px] font-extrabold tracking-wide text-slate-600 leading-none shadow-2xs">
                              {r.ticket_number}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] sm:text-[12px] font-medium text-slate-500">
                            <span className="flex shrink-0 items-center gap-1">
                              <ClockIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span>
                                {new Date(r.created_at || Date.now()).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </span>
                            {r.location && (
                              <span className="flex items-center gap-1">
                                <PinIcon className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                <span className="break-words">{r.location}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Desktop Status & Arrow */}
                      <div className="hidden sm:flex shrink-0 items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold shadow-2xs ${meta.cls}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          <span className="whitespace-nowrap">{meta.label}</span>
                        </span>
                        <span className="grid h-8 w-8 place-items-center rounded-xl border border-line bg-white text-slate-400 shadow-2xs transition-all group-hover:border-ink group-hover:bg-slate-900 group-hover:text-white">
                          <ChevronRightIcon className="h-4 w-4" />
                        </span>
                      </div>
                    </div>

                    {/* Mobile Bottom Status & Arrow */}
                    <div className="mt-2.5 flex sm:hidden items-center justify-between border-t border-slate-100 pt-2 text-xs">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold shadow-2xs ${meta.cls}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        <span>{meta.label}</span>
                      </span>
                      <span className="flex items-center gap-1 font-bold text-slate-500 group-hover:text-ink text-[11.5px]">
                        <span>View Details</span>
                        <ChevronRightIcon className="h-3.5 w-3.5 text-slate-400 group-hover:text-ink" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Reveal>

        {/* Right Column: AMC Executive Card & Priority Customer Support */}
        <div className="space-y-6">
          {/* AMC Card */}
          {activeAmc ? (
            <Reveal
              delay={0.3}
              className="overflow-hidden rounded-3xl border border-amber-200/90 bg-white shadow-xs"
            >
              <div className="border-b border-line/80 bg-gradient-to-r from-amber-50/70 via-slate-50/40 to-white p-4 sm:p-6">
                <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
                  <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[10.5px] sm:text-[11px] font-black uppercase tracking-wider text-yellow-dark bg-yellow/15 px-2.5 sm:px-3 py-1 rounded-full border border-yellow/30">
                    <AmcBadge className="h-3.5 w-3.5 shrink-0" />
                    <span>AMC Membership</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 border border-emerald-300 px-2.5 sm:px-3 py-1 text-[10.5px] sm:text-[11px] font-extrabold text-emerald-800">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Plan</span>
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-ink break-words">
                  {activeAmc.plan_name_snapshot}
                </h4>
                <p className="mt-1 font-mono text-[11px] sm:text-[12px] font-bold text-muted">
                  AMC ID: {activeAmc.amc_number}
                </p>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11.5px] sm:text-[12px] font-extrabold text-ink">
                    <span>Plan Duration</span>
                    <span className={amcRemaining <= 30 ? "text-red-600 font-black" : "text-amber-800 font-black"}>
                      {amcRemaining} days remaining
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-line/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${amcProgress}%` }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      className={`h-full rounded-full ${
                        amcRemaining <= 30
                          ? "bg-gradient-to-r from-red-500 to-rose-600"
                          : "bg-gradient-to-r from-yellow via-amber-400 to-yellow-dark"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 rounded-2xl bg-slate-50/70 p-3 sm:p-3.5 border border-line/80 text-[11.5px] sm:text-[12px]">
                  <div>
                    <span className="block text-muted text-[10.5px] sm:text-[11px] font-extrabold uppercase">
                      Valid Until
                    </span>
                    <b className="text-ink font-bold">{activeAmc.expiry_date}</b>
                  </div>
                  <div>
                    <span className="block text-muted text-[10.5px] sm:text-[11px] font-extrabold uppercase">
                      Next Visit
                    </span>
                    <b className="text-ink block leading-tight break-words font-bold">
                      {activeAmc.next_visit_date || "To be scheduled"}
                    </b>
                  </div>
                </div>

                <Link
                  href="/account/amc"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow py-3 text-xs font-black text-ink shadow-xs transition-all hover:bg-yellow-dark hover:shadow-sm"
                >
                  <AmcBadge className="h-4 w-4" />
                  <span>Manage AMC Subscription</span>
                </Link>
              </div>
            </Reveal>
          ) : (
            <Reveal
              delay={0.3}
              className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-600 font-bold border border-amber-200/80 shadow-2xs">
                  <AmcBadge className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-ink">No Active AMC Subscription</h4>
                  <p className="text-[11.5px] sm:text-[12.5px] text-body mt-0.5">
                    Protect your property with zero-breakdown maintenance.
                  </p>
                </div>
              </div>
              <Link
                href="/amc/plans#plans"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow px-4 py-3 text-xs font-black text-ink shadow-xs hover:bg-yellow-dark hover:shadow-sm"
              >
                <AmcBadge className="h-4 w-4" />
                <span>Explore AMC Plans</span>
              </Link>
            </Reveal>
          )}

          {/* Priority Support & Dispatch Card */}
          <Reveal
            delay={0.35}
            className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/60 p-5 sm:p-6 shadow-xs space-y-3.5"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-2xs">
                <PhoneIcon className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-sm sm:text-base font-black text-ink">Priority Customer Support</h4>
                <p className="text-[11.5px] text-body">24/7 Electrical Helpline & WhatsApp</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300/90 bg-white py-2.5 px-3 text-xs font-black text-ink shadow-2xs transition-all hover:border-ink hover:bg-slate-50"
                >
                  <PhoneIcon className="h-3.5 w-3.5 text-slate-600" />
                  <span>Call Us</span>
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 py-2.5 px-3 text-xs font-black text-emerald-800 shadow-2xs transition-all hover:bg-emerald-100"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
