"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { startPayment } from "@/lib/payments";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  AlertIcon,
  AmcBadge,
  ArrowRightIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircle,
  ClockIcon,
  CopyIcon,
  DownloadIcon,
  HomeIcon,
  PinIcon,
  PlusIcon,
  ShieldIcon,
  SparklesIcon,
  WrenchIcon,
} from "@/components/icons";
import TermsCheckbox from "@/components/TermsCheckbox";

function daysRemaining(expiry) {
  return Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
}

export default function MyAmcPage() {
  const { user, profile } = useCustomerAuth();
  const [subs, setSubs] = useState([]);
  const [visitsBySub, setVisitsBySub] = useState({});
  const [plansById, setPlansById] = useState({});
  const [propertiesById, setPropertiesById] = useState({});
  const [userProperties, setUserProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState(null);
  const [renewError, setRenewError] = useState("");
  const [agreedRenewals, setAgreedRenewals] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const fetchAll = async () => {
    if (!user) return;
    const [{ data: subsData }, { data: propsData }] = await Promise.all([
      supabase
        .from("amc_subscriptions")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("properties")
        .select("id, label, address, property_type")
        .eq("customer_id", user.id),
    ]);

    setSubs(subsData ?? []);
    setUserProperties(propsData ?? []);

    if (subsData && subsData.length > 0) {
      const subIds = subsData.map((s) => s.id);
      const planIds = [...new Set(subsData.map((s) => s.plan_id).filter(Boolean))];
      const propertyIds = [...new Set(subsData.map((s) => s.property_id).filter(Boolean))];

      const [{ data: visits }, { data: plans }, { data: props }] = await Promise.all([
        supabase
          .from("amc_visits")
          .select("*")
          .in("subscription_id", subIds)
          .order("scheduled_date", { ascending: true }),
        planIds.length > 0
          ? supabase.from("amc_plans").select("id, price, duration_months").in("id", planIds)
          : Promise.resolve({ data: [] }),
        propertyIds.length > 0
          ? supabase.from("properties").select("id, label, address, property_type").in("id", propertyIds)
          : Promise.resolve({ data: [] }),
      ]);

      const grouped = {};
      (visits ?? []).forEach((v) => {
        grouped[v.subscription_id] = grouped[v.subscription_id] || [];
        grouped[v.subscription_id].push(v);
      });
      setVisitsBySub(grouped);
      setPlansById(Object.fromEntries((plans ?? []).map((p) => [p.id, p])));
      setPropertiesById(Object.fromEntries((props ?? []).map((p) => [p.id, p])));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("AMC number copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRenew = async (sub) => {
    setRenewError("");
    setRenewingId(sub.id);
    try {
      await startPayment({
        type: "amc",
        planId: sub.plan_id,
        renewFromId: sub.id,
        name: profile?.name,
        email: user?.email,
        contact: profile?.mobile,
        description: `AMC Renewal — ${sub.plan_name_snapshot}`,
      });
      await fetchAll();
      toast.success("AMC renewed successfully");
    } catch (err) {
      setRenewError(err.message || "Renewal failed.");
      toast.error(err.message || "Renewal failed");
    } finally {
      setRenewingId(null);
    }
  };

  const activeSubs = subs.filter((s) => s.status === "active");
  const allVisits = Object.values(visitsBySub).flat();
  const totalVisitsCount = allVisits.length;
  const completedVisitsCount = allVisits.filter((v) => v.status === "completed").length;
  const pendingVisitsCount = totalVisitsCount - completedVisitsCount;
  const coveredPropertiesCount = new Set(subs.map((s) => s.property_id).filter(Boolean)).size;

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Executive Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <span className="grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl bg-amber-50 border border-amber-200/80 text-yellow-dark shadow-2xs">
            <AmcBadge className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-ink">
                Annual Maintenance Contracts (AMC)
              </h2>
              {activeSubs.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>VIP Protected</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-[13px] text-body mt-0.5">
              Comprehensive maintenance schedules, preventive electrical audits, and priority VIP coverage
            </p>
          </div>
        </div>

        <Link
          href="/amc/plans#plans"
          className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow px-5 py-3 text-xs font-black text-ink shadow-sm transition-all hover:bg-yellow-dark hover:shadow-md active:scale-[0.99] w-full sm:w-auto"
        >
          <SparklesIcon className="h-4 w-4" />
          <span>Explore All AMC Plans</span>
        </Link>
      </div>

      {renewError && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-extrabold text-red-700 shadow-2xs">
          <AlertIcon className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{renewError}</span>
        </div>
      )}

      {/* KPI Overview Tiles when customer has subscriptions */}
      {!loading && subs.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Active Memberships */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted">Active Contracts</p>
              <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-black text-ink [font-variant-numeric:tabular-nums]">
              {activeSubs.length}
            </p>
            <p className="text-[10.5px] sm:text-[11px] text-muted mt-0.5">
              {activeSubs.length === 1 ? "Active property plan" : "Active property plans"}
            </p>
          </div>

          {/* Properties Protected */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted">Covered Estates</p>
              <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-slate-100 text-slate-700">
                <BuildingIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-black text-ink [font-variant-numeric:tabular-nums]">
              {coveredPropertiesCount}
            </p>
            <p className="text-[10.5px] sm:text-[11px] text-muted mt-0.5">Locations protected</p>
          </div>

          {/* Maintenance Visits Track */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted">Preventive Audits</p>
              <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-amber-50 text-yellow-dark">
                <WrenchIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-black text-ink [font-variant-numeric:tabular-nums]">
              {completedVisitsCount} / {totalVisitsCount}
            </p>
            <p className="text-[10.5px] sm:text-[11px] text-muted mt-0.5">
              {pendingVisitsCount > 0 ? `${pendingVisitsCount} remaining this cycle` : "All audits completed"}
            </p>
          </div>

          {/* Priority Emergency SLA */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted">Breakdown SLA</p>
              <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-sky-50 text-sky-600">
                <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-black text-ink">2 – 4 Hours</p>
            <p className="text-[10.5px] sm:text-[11px] text-muted mt-0.5">Priority emergency dispatch</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center text-sm font-medium text-body shadow-2xs">
          Loading AMC details…
        </div>
      ) : subs.length === 0 ? (
        /* Executive Empty State Showcase */
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <span className="grid h-14 w-14 sm:h-16 sm:w-16 shrink-0 place-items-center rounded-3xl bg-amber-50 border border-amber-200/80 text-yellow-dark shadow-2xs">
                <AmcBadge className="h-7 w-7 sm:h-8 sm:w-8" />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-ink">
                  No Active AMC Contract on File
                </h3>
                <p className="text-xs sm:text-[13px] text-body mt-0.5 max-w-2xl leading-relaxed">
                  Protect your home, luxury villa, or commercial building with scheduled maintenance audits, guaranteed 2–4 hr emergency technician dispatches, and 100% free labor on all callouts.
                </p>
              </div>
            </div>

            {/* 3 VIP Protection Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-line/70">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-1.5 shadow-2xs">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-100 text-amber-900">
                  <WrenchIcon className="h-4 w-4" />
                </span>
                <p className="text-xs sm:text-[13px] font-black text-ink">Periodic Preventive Audits</p>
                <p className="text-[11px] text-muted leading-relaxed">
                  Quarterly inspections covering distribution boards, main MCBs, earthing pit resistance, and load balancing.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-1.5 shadow-2xs">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-100 text-emerald-900">
                  <ShieldIcon className="h-4 w-4" />
                </span>
                <p className="text-xs sm:text-[13px] font-black text-ink">₹0 Visit & Labor Charges</p>
                <p className="text-[11px] text-muted leading-relaxed">
                  Zero callout fees, zero diagnostic charges, and unlimited breakdown repairs with all labor covered.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-1.5 shadow-2xs">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-sky-100 text-sky-900">
                  <ClockIcon className="h-4 w-4" />
                </span>
                <p className="text-xs sm:text-[13px] font-black text-ink">VIP Priority Dispatch SLA</p>
                <p className="text-[11px] text-muted leading-relaxed">
                  Skip the standard queue with a certified crew dispatched to your premises within 2 to 4 hours.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-line/70">
              <Link
                href="/amc/plans#plans"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow px-6 py-3 text-xs sm:text-sm font-black text-ink shadow-sm transition-all hover:bg-yellow-dark hover:shadow-md"
              >
                <SparklesIcon className="h-4 w-4" />
                <span>Explore Residential & Commercial Plans</span>
              </Link>
              <Link
                href="/amc/plans#enquiry"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs hover:border-ink hover:text-ink transition-colors"
              >
                <span>Request Custom Corporate Proposal</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Property status note if properties registered */}
          {userProperties.length > 0 && (
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/40 p-4 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-950 font-bold">
                <HomeIcon className="h-4 w-4 text-yellow-dark shrink-0" />
                <span>
                  You have {userProperties.length} registered {userProperties.length === 1 ? "property" : "properties"} without active AMC coverage.
                </span>
              </div>
              <Link
                href="/amc/plans#plans"
                className="text-[11.5px] font-extrabold text-amber-800 hover:text-amber-950 underline underline-offset-2 shrink-0"
              >
                Get Protected
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* Active Subscriptions Dossier List */
        <div className="space-y-6">
          {subs.map((s) => {
            const remaining = daysRemaining(s.expiry_date);
            const coverage = Array.isArray(s.coverage_snapshot) ? s.coverage_snapshot : [];
            const visits = visitsBySub[s.id] || [];
            const canRenewOnline = s.status !== "cancelled" && !!plansById[s.plan_id]?.price;
            const prop = propertiesById[s.property_id];

            const totalDurationDays = Math.max(
              1,
              Math.ceil((new Date(s.expiry_date) - new Date(s.start_date)) / (1000 * 60 * 60 * 24))
            );
            const durationPercent = Math.min(
              100,
              Math.max(0, Math.round((1 - remaining / totalDurationDays) * 100))
            );

            return (
              <div
                key={s.id}
                className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs transition-all hover:shadow-md"
              >
                {/* Executive Header */}
                <div className="border-b border-line/80 bg-gradient-to-r from-amber-50/60 via-slate-50/40 to-white p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3.5 sm:items-center">
                      <span className="grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl bg-amber-50 border border-amber-200/80 text-yellow-dark shadow-2xs">
                        <AmcBadge className="h-6 w-6 sm:h-7 sm:w-7" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg sm:text-xl font-black text-ink break-words">
                            {s.plan_name_snapshot}
                          </h3>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {/* 1-Click Copyable AMC ID */}
                          <button
                            type="button"
                            onClick={() => handleCopy(s.amc_number, s.id)}
                            title="Click to copy AMC Number"
                            className="group/copy inline-flex items-center gap-1.5 font-mono text-[11px] sm:text-xs font-black text-slate-800 bg-white/95 border border-slate-300/80 px-2.5 py-0.5 rounded-lg shadow-2xs transition-colors hover:border-amber-400 hover:bg-white"
                          >
                            <span>{s.amc_number}</span>
                            <CopyIcon className="h-3 w-3 text-slate-400 group-hover/copy:text-amber-600 transition-colors" />
                            {copiedId === s.id && (
                              <span className="text-[10px] font-sans font-bold text-emerald-600">Copied!</span>
                            )}
                          </button>

                          {s.duration_months && (
                            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-700 bg-white/90 border border-slate-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                              <CalendarIcon className="h-3 w-3 text-slate-400" />
                              <span>{s.duration_months} Months</span>
                            </span>
                          )}

                          <span className="text-[11.5px] font-semibold text-slate-600 hidden sm:inline">
                            Annual Maintenance Contract
                          </span>
                        </div>

                        {prop && (
                          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-white/90 border border-slate-200/90 px-3 py-1 text-xs font-bold text-ink shadow-2xs">
                            <PinIcon className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            <span className="break-words font-black">{prop.label}</span>
                            {prop.address && <span className="text-muted font-normal truncate max-w-xs">({prop.address})</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Pill & Top Action */}
                    <div className="flex flex-wrap items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2.5">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black shadow-2xs ${
                          s.status === "active"
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                            : s.status === "expired"
                            ? "bg-slate-100 border-slate-200 text-slate-600"
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}
                      >
                        <span className="relative flex h-2 w-2">
                          {s.status === "active" && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          )}
                          <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${
                              s.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                        </span>
                        <span>
                          {s.status === "active"
                            ? "Active Plan"
                            : s.status === "expired"
                            ? "Expired"
                            : "Cancelled"}
                        </span>
                      </span>

                      <Link
                        href={`/account/amc/${s.id}/certificate`}
                        className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-300/80 bg-white/95 px-3.5 py-1.5 text-xs font-black text-ink shadow-2xs backdrop-blur-xs transition-all hover:border-ink hover:bg-white hover:shadow-xs"
                      >
                        <DownloadIcon className="h-3.5 w-3.5 text-slate-600 transition-transform group-hover:-translate-y-0.5 group-hover:text-ink" />
                        <span>Certificate</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-7 space-y-6">
                  {/* 4 Metric Tiles with Micro-Elevation */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                    <div className="group rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70 p-4 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xs">
                      <div className="mb-2.5 flex items-center justify-between">
                        <span className="grid h-8.5 w-8.5 place-items-center rounded-xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-105">
                          <CalendarIcon className="h-4 w-4" />
                        </span>
                      </div>
                      <span className="block text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted">
                        Start Date
                      </span>
                      <b className="mt-1 block text-xs sm:text-sm font-black text-ink break-words">
                        {s.start_date}
                      </b>
                    </div>

                    <div className="group rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70 p-4 transition-all hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-xs">
                      <div className="mb-2.5 flex items-center justify-between">
                        <span className="grid h-8.5 w-8.5 place-items-center rounded-xl bg-purple-50 text-purple-600 transition-transform group-hover:scale-105">
                          <CalendarIcon className="h-4 w-4" />
                        </span>
                      </div>
                      <span className="block text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted">
                        Expiry Date
                      </span>
                      <b className="mt-1 block text-xs sm:text-sm font-black text-ink break-words">
                        {s.expiry_date}
                      </b>
                    </div>

                    <div
                      className={`group rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-xs ${
                        remaining <= 30 && remaining >= 0
                          ? "border-red-200 bg-gradient-to-b from-white to-red-50/70 text-red-900 hover:border-red-300"
                          : "border-amber-200/90 bg-gradient-to-b from-white to-amber-50/50 text-amber-900 hover:border-amber-300"
                      }`}
                    >
                      <div className="mb-2.5 flex items-center justify-between">
                        <span
                          className={`grid h-8.5 w-8.5 place-items-center rounded-xl transition-transform group-hover:scale-105 ${
                            remaining <= 30 && remaining >= 0
                              ? "bg-red-100 text-red-600"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          <ClockIcon className="h-4 w-4" />
                        </span>
                      </div>
                      <span className="block text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted">
                        Days Remaining
                      </span>
                      <b
                        className={`mt-1 block text-xs sm:text-sm font-black ${
                          remaining <= 30 && remaining >= 0 ? "text-red-600" : "text-amber-800"
                        }`}
                      >
                        {remaining >= 0 ? `${remaining} Days` : "Expired"}
                      </b>
                    </div>

                    <div className="group rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70 p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-xs">
                      <div className="mb-2.5 flex items-center justify-between">
                        <span className="grid h-8.5 w-8.5 place-items-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-105">
                          <WrenchIcon className="h-4 w-4" />
                        </span>
                      </div>
                      <span className="block text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted">
                        Next Visit
                      </span>
                      <b className="mt-1 block text-xs sm:text-sm font-black text-ink break-words">
                        {s.next_visit_date || "—"}
                      </b>
                    </div>
                  </div>

                  {/* Contract Duration Timeline */}
                  {s.status === "active" && remaining >= 0 && (
                    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 via-white to-amber-50/20 p-4 sm:p-5">
                      <div className="mb-2.5 flex items-center justify-between text-[11.5px] sm:text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-ink">Contract Duration Used</span>
                          <span className="text-[11px] font-semibold text-muted">
                            ({s.start_date} – {s.expiry_date})
                          </span>
                        </div>
                        <span className="font-mono text-xs font-black text-amber-900 bg-amber-100/70 border border-amber-200/70 px-2 py-0.5 rounded-md">
                          {durationPercent}%
                        </span>
                      </div>
                      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80 shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(durationPercent, 2)}%` }}
                          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                          className={`h-full min-w-[12px] rounded-full shadow-sm ${
                            remaining <= 30
                              ? "bg-red-500 bg-gradient-to-r from-red-500 to-rose-600"
                              : "bg-amber-500 bg-gradient-to-r from-amber-400 via-yellow to-yellow-dark"
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Included Coverage Dossier */}
                  {coverage.length > 0 && (
                    <div className="space-y-3.5 border-t border-line/70 pt-5">
                      <div className="flex items-center gap-2">
                        <ShieldIcon className="h-4 w-4 text-emerald-600" />
                        <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-muted">
                          Included Coverage Benefits
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {coverage.map((c) => (
                          <div
                            key={c}
                            className="group/cov flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 text-xs font-extrabold text-ink shadow-2xs transition-all hover:border-emerald-300 hover:bg-emerald-50/20 hover:shadow-xs"
                          >
                            <span className="grid h-6.5 w-6.5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-2 ring-emerald-100/60 transition-transform group-hover/cov:scale-110">
                              <CheckCircle className="h-4 w-4" />
                            </span>
                            <span className="break-words leading-tight">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scheduled Maintenance Visits - Corporate Timeline Ledger */}
                  {visits.length > 0 && (
                    <div className="space-y-3.5 border-t border-line/70 pt-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <WrenchIcon className="h-4 w-4 text-amber-600 shrink-0" />
                          <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-muted">
                            Scheduled Maintenance Visits
                          </p>
                        </div>
                        <span className="w-fit inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10.5px] sm:text-[11px] font-extrabold text-slate-700 shadow-2xs">
                          {visits.filter((v) => v.status === "completed").length} of {visits.length} Completed
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {visits.map((v, i) => {
                          const done = v.status === "completed";
                          return (
                            <div
                              key={v.id}
                              className={`group/visit rounded-2xl border p-4 transition-all hover:shadow-xs ${
                                done
                                  ? "border-emerald-200 bg-gradient-to-b from-white to-emerald-50/40 hover:border-emerald-300"
                                  : "border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2.5">
                                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-muted">
                                  Visit {i + 1}
                                </span>
                                <span
                                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                    done
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-slate-200/90 text-slate-700"
                                  }`}
                                >
                                  {done ? "Completed" : "Pending"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`grid h-8.5 w-8.5 shrink-0 place-items-center rounded-full shadow-2xs transition-transform group-hover/visit:scale-105 ${
                                    done
                                      ? "bg-emerald-500 text-white"
                                      : "bg-white border border-slate-200 text-slate-500"
                                  }`}
                                >
                                  {done ? <CheckCircle className="h-4 w-4" /> : <CalendarIcon className="h-4 w-4" />}
                                </span>
                                <div className="min-w-0">
                                  <b className="block text-xs sm:text-[13px] font-extrabold text-ink break-words">
                                    {v.scheduled_date}
                                  </b>
                                  {!done && (
                                    <Link
                                      href={`/account/requests/new?property=${s.property_id || ""}`}
                                      className="text-[10.5px] font-bold text-amber-700 hover:text-amber-800 underline underline-offset-2 mt-0.5 inline-block"
                                    >
                                      Request Dispatch
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Renewal Prompt Banner */}
                  {remaining <= 30 && s.status !== "cancelled" && (
                    <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-yellow/10 to-amber-50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                      <div className="flex items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700 mt-0.5 shadow-2xs">
                          <AlertIcon className="h-5 w-5" />
                        </span>
                        <div className="space-y-0.5">
                          <span className="block text-xs sm:text-sm font-black text-amber-950">
                            {remaining >= 0
                              ? `Subscription expires in ${remaining} days`
                              : "This AMC plan has expired"}
                          </span>
                          <p className="text-xs text-amber-800 leading-relaxed">
                            Renew now to maintain continuous electrical warranty coverage and free emergency dispatches.
                          </p>
                        </div>
                      </div>
                      {canRenewOnline ? (
                        <div className="flex flex-col items-stretch sm:items-end gap-2.5 w-full sm:w-auto shrink-0">
                          <TermsCheckbox
                            checked={!!agreedRenewals[s.id]}
                            onChange={(v) => setAgreedRenewals((a) => ({ ...a, [s.id]: v }))}
                          />
                          <button
                            onClick={() => handleRenew(s)}
                            disabled={renewingId === s.id || !agreedRenewals[s.id]}
                            className="w-full sm:w-auto rounded-xl bg-yellow px-5 py-2.5 text-xs font-black text-ink shadow-sm transition-all hover:bg-yellow-dark hover:shadow-md disabled:opacity-60"
                          >
                            {renewingId === s.id ? "Processing Renewal…" : "Renew AMC Online"}
                          </button>
                        </div>
                      ) : (
                        <Link
                          href="/amc/plans#enquiry"
                          className="text-xs font-black text-ink underline underline-offset-4 hover:text-amber-800"
                        >
                          Contact Support to Renew
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Priority AMC Actions Row */}
                  <div className="border-t border-line/70 pt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                      <SparklesIcon className="h-4 w-4 text-yellow-dark shrink-0" />
                      <span>Zero visit & labor charges applied automatically on all your requests</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 justify-end">
                      <Link
                        href={`/account/amc/${s.id}/certificate`}
                        className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-300/90 bg-white px-5 py-2.5 text-xs font-extrabold text-ink shadow-2xs transition-all hover:border-ink hover:shadow-xs"
                      >
                        <DownloadIcon className="h-3.5 w-3.5 text-slate-600 transition-transform group-hover:-translate-y-0.5 group-hover:text-ink" />
                        <span>Download Certificate</span>
                      </Link>
                      <Link
                        href={`/account/requests/new?property=${s.property_id || ""}`}
                        className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-yellow px-5 py-2.5 text-xs font-black text-ink shadow-sm transition-all hover:bg-yellow-dark hover:shadow-md active:scale-[0.99]"
                      >
                        <WrenchIcon className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
                        <span>Raise ₹0 AMC Request</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
