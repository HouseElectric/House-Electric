"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { startPayment } from "@/lib/payments";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { AmcBadge, CheckCircle, CalendarIcon, AlertIcon, WrenchIcon, ClockIcon } from "@/components/icons";

function daysRemaining(expiry) {
  return Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
}

export default function MyAmcPage() {
  const { user, profile } = useCustomerAuth();
  const [subs, setSubs] = useState([]);
  const [visitsBySub, setVisitsBySub] = useState({});
  const [plansById, setPlansById] = useState({});
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState(null);
  const [renewError, setRenewError] = useState("");

  const fetchAll = async () => {
    if (!user) return;
    const { data: subsData } = await supabase
      .from("amc_subscriptions")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });
    setSubs(subsData ?? []);

    if (subsData && subsData.length > 0) {
      const subIds = subsData.map((s) => s.id);
      const planIds = [...new Set(subsData.map((s) => s.plan_id).filter(Boolean))];

      const [{ data: visits }, { data: plans }] = await Promise.all([
        supabase.from("amc_visits").select("*").in("subscription_id", subIds).order("scheduled_date", { ascending: true }),
        planIds.length > 0 ? supabase.from("amc_plans").select("id, price, duration_months").in("id", planIds) : Promise.resolve({ data: [] }),
      ]);

      const grouped = {};
      (visits ?? []).forEach((v) => {
        grouped[v.subscription_id] = grouped[v.subscription_id] || [];
        grouped[v.subscription_id].push(v);
      });
      setVisitsBySub(grouped);
      setPlansById(Object.fromEntries((plans ?? []).map((p) => [p.id, p])));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-ink">My AMC Memberships</h2>
          <p className="text-xs text-body">Track maintenance visits, active coverage, and renewals</p>
        </div>
        <Link
          href="/amc/plans#plans"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow px-5 py-3 text-xs font-black text-ink shadow-md transition-all hover:bg-yellow-dark"
        >
          <AmcBadge className="h-4 w-4" />
          Explore AMC Plans
        </Link>
      </div>

      {renewError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-extrabold text-red-700">
          {renewError}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body">
          Loading AMC details…
        </div>
      ) : subs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-line/80 bg-white p-12 text-center shadow-xs">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-amber-50 text-yellow-dark">
            <AmcBadge className="h-8 w-8" />
          </span>
          <div className="space-y-1">
            <p className="text-base font-extrabold text-ink">No Active AMC Membership</p>
            <p className="max-w-md text-xs text-body">
              Annual Maintenance Contracts protect your home or commercial building with scheduled maintenance, priority dispatches, and free labor.
            </p>
          </div>
          <Link
            href="/amc/plans#plans"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-yellow px-6 py-3 text-xs font-black text-ink shadow-sm hover:bg-yellow-dark"
          >
            Get AMC Proposal
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {subs.map((s) => {
            const remaining = daysRemaining(s.expiry_date);
            const coverage = Array.isArray(s.coverage_snapshot) ? s.coverage_snapshot : [];
            const visits = visitsBySub[s.id] || [];
            const canRenewOnline = s.status !== "cancelled" && !!plansById[s.plan_id]?.price;

            return (
              <div key={s.id} className="overflow-hidden rounded-3xl border border-line/80 bg-white shadow-sm transition-all hover:shadow-lg">
                {/* Membership-card style header */}
                <div className="relative overflow-hidden bg-[#141414] p-6">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.07]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 20% 20%, #F2B01E 0%, transparent 45%), radial-gradient(circle at 85% 80%, #F2B01E 0%, transparent 40%)",
                    }}
                  />
                  <div className="glow-blob right-[-8%] top-[-60%] h-[180px] w-[180px] bg-yellow/25 opacity-50 blur-[80px]" />
                  <div className="glow-blob left-[20%] bottom-[-70%] h-[140px] w-[140px] bg-emerald-500/20 opacity-40 blur-[70px]" />
                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3.5 sm:items-center">
                      <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-yellow text-ink shadow-[0_8px_20px_-6px_rgba(242,176,30,0.7)]">
                        <AmcBadge className="h-6 w-6" />
                      </span>
                      <div className="min-w-0">
                        <b className="block text-lg font-black text-white">{s.plan_name_snapshot}</b>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-yellow/90 bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-md">
                            {s.amc_number}
                          </span>
                          {s.duration_months && (
                            <span className="text-[11px] font-bold text-white/60 bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-md">
                              {s.duration_months} Months
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/50 mt-1.5">Annual Maintenance Contract</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit flex-none items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-black ${
                        s.status === "active"
                          ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300"
                          : "bg-white/10 border-white/15 text-white/60"
                      }`}
                    >
                      <span className={`h-2 w-2 flex-none rounded-full ${s.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-white/40"}`} />
                      {s.status === "active" ? "Active Plan" : s.status === "expired" ? "Expired" : "Cancelled"}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Stat tiles */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="group rounded-2xl border border-line/70 bg-slate-50 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-sm">
                      <span className="mb-2 grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-105">
                        <CalendarIcon className="h-4 w-4" />
                      </span>
                      <span className="block text-[10.5px] font-extrabold uppercase tracking-wider text-muted">Start Date</span>
                      <b className="mt-0.5 block text-sm font-extrabold text-ink">{s.start_date}</b>
                    </div>
                    <div className="group rounded-2xl border border-line/70 bg-slate-50 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-sm">
                      <span className="mb-2 grid h-8 w-8 place-items-center rounded-xl bg-purple-50 text-purple-600 transition-transform group-hover:scale-105">
                        <CalendarIcon className="h-4 w-4" />
                      </span>
                      <span className="block text-[10.5px] font-extrabold uppercase tracking-wider text-muted">Expiry Date</span>
                      <b className="mt-0.5 block text-sm font-extrabold text-ink">{s.expiry_date}</b>
                    </div>
                    <div
                      className={`group rounded-2xl border p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                        remaining <= 30 && remaining >= 0
                          ? "border-red-200 bg-red-50"
                          : "border-amber-200/70 bg-amber-50/60"
                      }`}
                    >
                      <span className={`mb-2 grid h-8 w-8 place-items-center rounded-xl transition-transform group-hover:scale-105 ${remaining <= 30 && remaining >= 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                        <ClockIcon className="h-4 w-4" />
                      </span>
                      <span className="block text-[10.5px] font-extrabold uppercase tracking-wider text-muted">Days Remaining</span>
                      <b className={`mt-0.5 block text-sm font-black ${remaining <= 30 && remaining >= 0 ? "text-red-600" : "text-amber-800"}`}>
                        {remaining >= 0 ? `${remaining} Days` : "Expired"}
                      </b>
                    </div>
                    <div className="group rounded-2xl border border-line/70 bg-slate-50 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-sm">
                      <span className="mb-2 grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-105">
                        <WrenchIcon className="h-4 w-4" />
                      </span>
                      <span className="block text-[10.5px] font-extrabold uppercase tracking-wider text-muted">Next Visit</span>
                      <b className="mt-0.5 block text-sm font-extrabold text-ink">{s.next_visit_date || "—"}</b>
                    </div>
                  </div>

                  {s.status === "active" && remaining >= 0 && (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-muted">
                        <span>Contract Duration Used</span>
                        <span>
                          {Math.min(
                            100,
                            Math.max(
                              0,
                              Math.round(
                                100 -
                                  (remaining /
                                    Math.max(1, Math.ceil((new Date(s.expiry_date) - new Date(s.start_date)) / (1000 * 60 * 60 * 24)))) *
                                    100
                              )
                            )
                          )}
                          %
                        </span>
                      </div>
                      <div className="relative h-3 w-full overflow-visible rounded-full bg-slate-100 shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(100, Math.max(0, 100 - (remaining / Math.max(1, Math.ceil((new Date(s.expiry_date) - new Date(s.start_date)) / (1000 * 60 * 60 * 24)))) * 100))}%`,
                          }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          className={`relative h-full overflow-hidden rounded-full ${
                            remaining <= 30 ? "bg-gradient-to-r from-red-400 to-rose-500" : "bg-gradient-to-r from-yellow via-amber-400 to-yellow-dark"
                          }`}
                        >
                          <span
                            className={`absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-white shadow-md ${
                              remaining <= 30 ? "bg-rose-500" : "bg-yellow-dark"
                            }`}
                          />
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {/* Coverage details */}
                  {coverage.length > 0 && (
                    <div className="space-y-2.5 border-t border-line/70 pt-5">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted">Included Coverage</p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {coverage.map((c) => (
                          <span
                            key={c}
                            className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs font-extrabold text-ink shadow-2xs transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                          >
                            <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-emerald-50 text-emerald-600">
                              <CheckCircle className="h-3.5 w-3.5" />
                            </span>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Maintenance Visit Schedule */}
                  {visits.length > 0 && (
                    <div className="space-y-3 border-t border-line/70 pt-5">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted">Scheduled Maintenance Visits</p>
                      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scrollbar-none sm:grid sm:grid-cols-4 sm:overflow-visible">
                        {visits.map((v, i) => {
                          const done = v.status === "completed";
                          return (
                            <div
                              key={v.id}
                              className={`group relative flex-none w-[130px] rounded-2xl border px-3.5 py-3 text-center transition-all hover:-translate-y-0.5 sm:w-auto ${
                                done ? "border-emerald-200 bg-emerald-50 hover:shadow-md" : "border-line bg-white shadow-2xs hover:border-indigo-200 hover:shadow-md"
                              }`}
                            >
                              <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-muted">
                                Visit {i + 1}
                              </span>
                              <span
                                className={`mx-auto grid h-9 w-9 place-items-center rounded-full shadow-sm transition-transform group-hover:scale-105 ${
                                  done ? "bg-emerald-500 text-white" : "bg-indigo-50 text-indigo-500"
                                }`}
                              >
                                {done ? <CheckCircle className="h-4 w-4" /> : <CalendarIcon className="h-4 w-4" />}
                              </span>
                              <b className="mt-1.5 block text-[12.5px] font-extrabold text-ink">{v.scheduled_date}</b>
                              <span className={`text-[10.5px] font-bold ${done ? "text-emerald-700" : "text-indigo-500"}`}>
                                {done ? "Completed" : "Pending"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Renewal Prompt Banner */}
                  {remaining <= 30 && s.status !== "cancelled" && (
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-yellow/10 to-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-amber-100 text-amber-700">
                          <AlertIcon className="h-4 w-4" />
                        </span>
                        <div className="space-y-0.5">
                          <span className="block text-xs font-black text-amber-900">
                            {remaining >= 0 ? `Subscription expires in ${remaining} days` : "This AMC plan has expired"}
                          </span>
                          <p className="text-[11.5px] text-amber-800">Renew now to maintain continuous electrical warranty coverage.</p>
                        </div>
                      </div>
                      {canRenewOnline ? (
                        <button
                          onClick={() => handleRenew(s)}
                          disabled={renewingId === s.id}
                          className="rounded-xl bg-yellow px-5 py-2.5 text-xs font-black text-ink shadow-md transition-all hover:bg-yellow-dark hover:shadow-lg disabled:opacity-60"
                        >
                          {renewingId === s.id ? "Processing Renewal…" : "Renew AMC Online"}
                        </button>
                      ) : (
                        <Link href="/amc/plans#enquiry" className="text-xs font-black text-ink underline underline-offset-4">
                          Contact Support to Renew
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Raise request shortcut */}
                  <div className="border-t border-line/70 pt-4 flex justify-end">
                    <Link
                      href="/account/requests/new"
                      className="group inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-2.5 text-xs font-black text-ink shadow-2xs transition-all hover:-translate-y-0.5 hover:border-yellow hover:bg-yellow hover:shadow-md"
                    >
                      <WrenchIcon className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
                      Raise AMC Service Request
                    </Link>
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

