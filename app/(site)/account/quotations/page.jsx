"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import Reveal from "@/components/Reveal";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckCircle,
  ClockIcon,
  PlusIcon,
  ReportIcon,
  ShieldIcon,
  SparklesIcon,
  WalletIcon,
  XIcon,
} from "@/components/icons";

const STATUS_META = {
  draft: {
    label: "Draft",
    cls: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
    iconCls: "bg-slate-100 text-slate-600 border-slate-200",
  },
  sent: {
    label: "Action Needed",
    cls: "bg-amber-50 text-amber-800 border-amber-200/90",
    dot: "bg-amber-500",
    iconCls: "bg-amber-50 text-yellow-dark border-amber-200/80",
    actionRequired: true,
  },
  viewed: {
    label: "Under Consideration",
    cls: "bg-indigo-50 text-indigo-700 border-indigo-200/90",
    dot: "bg-indigo-500",
    iconCls: "bg-indigo-50 text-indigo-600 border-indigo-200",
    actionRequired: true,
  },
  accepted: {
    label: "Accepted",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200/90",
    dot: "bg-emerald-500",
    iconCls: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  rejected: {
    label: "Declined",
    cls: "bg-red-50 text-red-700 border-red-200/90",
    dot: "bg-red-500",
    iconCls: "bg-red-50 text-red-600 border-red-200",
  },
  expired: {
    label: "Expired",
    cls: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
    iconCls: "bg-slate-100 text-slate-500 border-slate-200",
  },
  paid: {
    label: "Paid & Confirmed",
    cls: "bg-emerald-100 text-emerald-900 border-emerald-300",
    dot: "bg-emerald-600",
    iconCls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

export default function MyQuotationsPage() {
  const { user } = useCustomerAuth();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("quotations")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      setQuotations(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  const pendingQuotes = quotations.filter((q) => ["sent", "viewed"].includes(q.status));
  const approvedQuotes = quotations.filter((q) => ["accepted", "paid"].includes(q.status));
  const closedQuotes = quotations.filter((q) => ["rejected", "expired"].includes(q.status));
  const totalValue = quotations.reduce((acc, q) => acc + (Number(q.total) || 0), 0);
  const pendingValue = pendingQuotes.reduce((acc, q) => acc + (Number(q.total) || 0), 0);

  const filteredQuotations = quotations.filter((q) => {
    if (filter === "action") return ["sent", "viewed"].includes(q.status);
    if (filter === "approved") return ["accepted", "paid"].includes(q.status);
    if (filter === "closed") return ["rejected", "expired"].includes(q.status);
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Executive Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <span className="grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl bg-amber-50 border border-amber-200/80 text-yellow-dark shadow-2xs">
            <ReportIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-ink">
                Quotations & Proposals
              </h2>
              {pendingQuotes.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-800 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>{pendingQuotes.length} Action Needed</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-[13px] text-body mt-0.5">
              Review formal electrical estimates, corporate contracts, and scope approvals
            </p>
          </div>
        </div>

        <Link
          href="/account/requests/new"
          className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow px-5 py-3 text-xs font-black text-ink shadow-sm transition-all hover:bg-yellow-dark hover:shadow-md active:scale-[0.99] w-full sm:w-auto"
        >
          <PlusIcon className="h-4 w-4 transition-transform group-hover:rotate-90" />
          <span>Request New Estimate</span>
        </Link>
      </div>

      {/* KPI Metric Summary Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Quotes */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted">Total Quotes</p>
            <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-slate-100 text-slate-600">
              <ReportIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-black text-ink [font-variant-numeric:tabular-nums]">
            {quotations.length}
          </p>
          <p className="text-[10.5px] sm:text-[11px] text-muted mt-0.5">₹{totalValue.toLocaleString("en-IN")} total volume</p>
        </div>

        {/* Action Needed */}
        <div className={`rounded-2xl sm:rounded-3xl border p-3.5 sm:p-4 shadow-2xs transition-all ${
          pendingQuotes.length > 0
            ? "border-amber-300/80 bg-amber-50/40"
            : "border-slate-200/80 bg-white"
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-900">Awaiting Response</p>
            <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-amber-100 text-amber-800">
              <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-black text-ink [font-variant-numeric:tabular-nums]">
            {pendingQuotes.length}
          </p>
          <p className="text-[10.5px] sm:text-[11px] text-muted mt-0.5">
            {pendingQuotes.length > 0 ? `₹${pendingValue.toLocaleString("en-IN")} pending approval` : "All caught up"}
          </p>
        </div>

        {/* Approved & Paid */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted">Approved & Paid</p>
            <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-black text-ink [font-variant-numeric:tabular-nums]">
            {approvedQuotes.length}
          </p>
          <p className="text-[10.5px] sm:text-[11px] text-muted mt-0.5">Projects confirmed</p>
        </div>

        {/* Corporate / Support Badge */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted">Price Guarantee</p>
            <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-sky-50 text-sky-600">
              <ShieldIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-black text-ink">100% Fixed</p>
          <p className="text-[10.5px] sm:text-[11px] text-muted mt-0.5">No hidden site surcharges</p>
        </div>
      </div>

      {/* Segmented Filter Pills */}
      <div className="flex items-center overflow-x-auto pb-1 scrollbar-none">
        <div className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 p-1.5">
          {[
            { key: "all", label: "All Proposals", count: quotations.length },
            { key: "action", label: "Action Needed", count: pendingQuotes.length },
            { key: "approved", label: "Approved & Paid", count: approvedQuotes.length },
            { key: "closed", label: "Closed / Expired", count: closedQuotes.length },
          ].map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 sm:px-4 py-2 text-xs font-black transition-all ${
                  active
                    ? "bg-ink text-white shadow-xs"
                    : "text-slate-600 hover:text-ink hover:bg-white/70"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    active ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading & Empty States */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center text-sm font-medium text-body shadow-2xs">
          Loading quotations & proposals…
        </div>
      ) : filteredQuotations.length === 0 ? (
        <div className="flex flex-col items-center gap-3.5 rounded-3xl border border-slate-200/80 bg-white p-10 sm:p-14 text-center shadow-xs">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 border border-amber-200/80 text-yellow-dark shadow-2xs">
            <ReportIcon className="h-8 w-8" />
          </span>
          <div className="max-w-sm space-y-1">
            <p className="text-base sm:text-lg font-black text-ink">No Quotations Found</p>
            <p className="text-xs text-body leading-relaxed">
              {filter === "all"
                ? "Custom project quotes and Corporate AMC proposals prepared for your properties will be listed here."
                : "No quotations matching this filter status."}
            </p>
          </div>
          {filter === "all" && (
            <Link
              href="/account/requests/new"
              className="mt-1 inline-flex items-center gap-2 rounded-2xl bg-yellow px-6 py-3 text-xs font-black text-ink shadow-sm hover:bg-yellow-dark transition-all"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Request an Estimate</span>
            </Link>
          )}
        </div>
      ) : (
        /* Quotation Dossier Cards List */
        <div className="space-y-4">
          {filteredQuotations.map((q, i) => {
            const meta = STATUS_META[q.status] ?? STATUS_META.draft;
            const items = Array.isArray(q.items) ? q.items : [];
            const isPending = ["sent", "viewed"].includes(q.status);
            const isCorporateAmc = q.quotation_type === "corporate_amc";

            const issuedDate = q.created_at
              ? new Date(q.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "—";

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i, 4) * 0.05 }}
                className={`group relative overflow-hidden rounded-3xl border bg-white p-5 sm:p-6 transition-all shadow-xs hover:shadow-md ${
                  isPending
                    ? "border-amber-300/80 ring-2 ring-yellow/15"
                    : "border-slate-200/90 hover:border-slate-300"
                }`}
              >
                {/* Left Accent Stripe */}
                <span className={`absolute inset-y-0 left-0 w-1.5 ${meta.dot}`} />

                <div className="flex flex-col gap-4">
                  {/* Top Row: Meta, Type, Status & Price */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/60 pb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-11 w-11 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl border shadow-2xs transition-transform group-hover:scale-105 ${meta.iconCls}`}
                      >
                        {isCorporateAmc ? (
                          <ShieldIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        ) : (
                          <ReportIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        )}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <b className="font-mono text-sm sm:text-base font-black text-ink tracking-tight">
                            {q.quotation_number}
                          </b>
                          {isCorporateAmc ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/80 border border-amber-300 px-2.5 py-0.5 text-[10.5px] font-black text-amber-950">
                              <ShieldIcon className="h-3 w-3 text-yellow-dark" />
                              <span>Corporate AMC</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 text-[10.5px] font-bold text-slate-700">
                              Project Estimate
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${meta.cls}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${isPending ? "animate-ping" : ""}`} />
                            <span>{meta.label}</span>
                          </span>
                        </div>

                        <p className="mt-1 flex items-center gap-2 text-[11px] sm:text-xs text-muted font-medium">
                          <span>Issued {issuedDate}</span>
                          {q.valid_until && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                                <CalendarIcon className="h-3 w-3 text-muted" />
                                Valid until {q.valid_until}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Total Quotation Amount */}
                    <div className="flex sm:flex-col items-baseline sm:items-end justify-between gap-1 pt-1 sm:pt-0">
                      <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-muted">
                        Total Estimate
                      </span>
                      <b className="text-xl sm:text-2xl font-black text-ink [font-variant-numeric:tabular-nums]">
                        ₹{Number(q.total).toLocaleString("en-IN")}
                      </b>
                    </div>
                  </div>

                  {/* Middle: Scope / Items Overview */}
                  <div className="space-y-2">
                    {isCorporateAmc && q.scope_of_work ? (
                      <p className="text-xs sm:text-[13px] text-body line-clamp-2 leading-relaxed bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
                        <strong className="text-ink font-bold">Scope: </strong>
                        {q.scope_of_work}
                      </p>
                    ) : items.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider mr-1">
                          Includes:
                        </span>
                        {items.slice(0, 3).map((it, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 truncate max-w-[200px]"
                          >
                            {it.description || it.title || `Item ${idx + 1}`}
                          </span>
                        ))}
                        {items.length > 3 && (
                          <span className="text-[11px] font-bold text-muted">
                            +{items.length - 3} more items
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted italic">
                        Detailed materials & labor breakdown available in formal proposal.
                      </p>
                    )}
                  </div>

                  {/* Footer Action Row */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-line/60">
                    <div className="flex items-center gap-2 text-xs text-muted font-medium">
                      {isPending ? (
                        <span className="text-amber-800 font-bold flex items-center gap-1.5">
                          <SparklesIcon className="h-3.5 w-3.5 text-yellow-dark" />
                          <span>Awaiting your review & formal approval</span>
                        </span>
                      ) : q.status === "accepted" ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Approved by you · Ready for payment</span>
                        </span>
                      ) : q.status === "paid" ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Paid & Confirmed</span>
                        </span>
                      ) : (
                        <span>Standard Terms & GST applicable</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      {isPending ? (
                        <Link
                          href={`/account/quotations/${q.id}`}
                          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-yellow px-5 py-2.5 text-xs font-black text-ink shadow-sm transition-all hover:bg-yellow-dark hover:shadow-md active:scale-[0.99]"
                        >
                          <span>Review & Respond</span>
                          <ArrowRightIcon className="h-3.5 w-3.5" />
                        </Link>
                      ) : q.status === "accepted" ? (
                        <Link
                          href={`/account/quotations/${q.id}`}
                          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.99]"
                        >
                          <WalletIcon className="h-3.5 w-3.5" />
                          <span>Pay ₹{Number(q.total).toLocaleString("en-IN")}</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/account/quotations/${q.id}`}
                          className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-2xs transition-all hover:border-ink hover:text-ink"
                        >
                          <span>View Quotation</span>
                          <ArrowRightIcon className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
