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
} from "@/components/icons";

const STATUS_META = {
  pending: {
    label: "Balance Due",
    cls: "bg-amber-50 text-amber-800 border-amber-200/90",
    dot: "bg-amber-500",
    iconCls: "bg-amber-50 text-amber-700 border-amber-200/80",
    actionRequired: true,
  },
  partially_paid: {
    label: "Partially Paid",
    cls: "bg-amber-50 text-amber-800 border-amber-200/90",
    dot: "bg-amber-500",
    iconCls: "bg-amber-50 text-amber-700 border-amber-200/80",
    actionRequired: true,
  },
  payment_initiated: {
    label: "Processing",
    cls: "bg-blue-50 text-blue-700 border-blue-200/90",
    dot: "bg-blue-500",
    iconCls: "bg-blue-50 text-blue-600 border-blue-200",
  },
  paid: {
    label: "Paid & Settled",
    cls: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
    dot: "bg-emerald-500",
    iconCls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  failed: {
    label: "Payment Failed",
    cls: "bg-red-50 text-red-700 border-red-200/90",
    dot: "bg-red-500",
    iconCls: "bg-red-50 text-red-600 border-red-200",
    actionRequired: true,
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
    iconCls: "bg-slate-100 text-slate-500 border-slate-200",
  },
  refunded: {
    label: "Refunded",
    cls: "bg-purple-50 text-purple-700 border-purple-200/90",
    dot: "bg-purple-500",
    iconCls: "bg-purple-50 text-purple-600 border-purple-200",
  },
};

export default function MyInvoicesPage() {
  const { user } = useCustomerAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("invoices")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      setInvoices(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  const totalDue = invoices.reduce(
    (sum, inv) => sum + Math.max(0, Number(inv.total_amount) - Number(inv.paid_amount)),
    0
  );
  const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0);
  const totalBilled = invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

  const dueInvoices = invoices.filter((inv) => Number(inv.total_amount) - Number(inv.paid_amount) > 0);
  const paidInvoices = invoices.filter((inv) => inv.payment_status === "paid");
  const otherInvoices = invoices.filter(
    (inv) => !dueInvoices.includes(inv) && !paidInvoices.includes(inv)
  );

  const filteredInvoices = invoices.filter((inv) => {
    const balance = Number(inv.total_amount) - Number(inv.paid_amount);
    if (filter === "due") return balance > 0;
    if (filter === "paid") return inv.payment_status === "paid";
    if (filter === "other") return balance <= 0 && inv.payment_status !== "paid";
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
                Invoices & Tax Receipts
              </h2>
              {totalDue > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-800 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>₹{totalDue.toLocaleString("en-IN")} Balance Due</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-[13px] text-body mt-0.5">
              Review GST compliant invoices, payment receipts, and settle outstanding balances
            </p>
          </div>
        </div>

        <Link
          href="/account/requests/new"
          className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow px-5 py-3 text-xs font-black text-ink shadow-sm transition-all hover:bg-yellow-dark hover:shadow-md active:scale-[0.99] w-full sm:w-auto"
        >
          <PlusIcon className="h-4 w-4 transition-transform group-hover:rotate-90" />
          <span>Book New Service</span>
        </Link>
      </div>

      {/* KPI Metric Summary Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Invoices */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted">Total Invoices</p>
            <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-slate-100 text-slate-600">
              <ReportIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-black text-ink [font-variant-numeric:tabular-nums]">
            {invoices.length}
          </p>
          <p className="text-[10.5px] sm:text-[11px] text-muted mt-0.5">₹{totalBilled.toLocaleString("en-IN")} total billed</p>
        </div>

        {/* Outstanding Balance */}
        <div
          className={`rounded-2xl sm:rounded-3xl border p-3.5 sm:p-4 shadow-2xs transition-all ${
            totalDue > 0 ? "border-amber-300/80 bg-amber-50/40" : "border-slate-200/80 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-900">
              Balance Due
            </p>
            <span
              className={`grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl ${
                totalDue > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {totalDue > 0 ? (
                <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-black text-ink [font-variant-numeric:tabular-nums]">
            ₹{totalDue.toLocaleString("en-IN")}
          </p>
          <p className="text-[10.5px] sm:text-[11px] text-muted mt-0.5">
            {totalDue > 0 ? "Pending customer settlement" : "All accounts cleared"}
          </p>
        </div>

        {/* Total Settled */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted">Total Paid</p>
            <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <WalletIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-black text-ink [font-variant-numeric:tabular-nums]">
            ₹{totalPaid.toLocaleString("en-IN")}
          </p>
          <p className="text-[10.5px] sm:text-[11px] text-muted mt-0.5">Successfully settled</p>
        </div>

        {/* Tax Compliance Guarantee */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted">GST Invoicing</p>
            <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-sky-50 text-sky-600">
              <ShieldIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-black text-ink">100% Tax ITC</p>
          <p className="text-[10.5px] sm:text-[11px] text-muted mt-0.5">Input tax credit eligible</p>
        </div>
      </div>

      {/* Segmented Filter Pills */}
      <div className="flex items-center overflow-x-auto pb-1 scrollbar-none">
        <div className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 p-1.5">
          {[
            { key: "all", label: "All Invoices", count: invoices.length },
            { key: "due", label: "Balance Due", count: dueInvoices.length },
            { key: "paid", label: "Fully Settled", count: paidInvoices.length },
            { key: "other", label: "Archived / Other", count: otherInvoices.length },
          ].map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 sm:px-4 py-2 text-xs font-black transition-all ${
                  active ? "bg-ink text-white shadow-xs" : "text-slate-600 hover:text-ink hover:bg-white/70"
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
          Loading invoices & tax receipts…
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="flex flex-col items-center gap-3.5 rounded-3xl border border-slate-200/80 bg-white p-10 sm:p-14 text-center shadow-xs">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 border border-amber-200/80 text-yellow-dark shadow-2xs">
            <ReportIcon className="h-8 w-8" />
          </span>
          <div className="max-w-sm space-y-1">
            <p className="text-base sm:text-lg font-black text-ink">No Invoices Found</p>
            <p className="text-xs text-body leading-relaxed">
              {filter === "all"
                ? "Official GST invoices generated for your completed jobs, electrical repairs, and AMC plans will be listed here."
                : "No invoices matching this filter category."}
            </p>
          </div>
          {filter === "all" && (
            <Link
              href="/account/requests/new"
              className="mt-1 inline-flex items-center gap-2 rounded-2xl bg-yellow px-6 py-3 text-xs font-black text-ink shadow-sm hover:bg-yellow-dark transition-all"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Raise a Service Request</span>
            </Link>
          )}
        </div>
      ) : (
        /* Invoice Dossier Cards List */
        <div className="space-y-4">
          {filteredInvoices.map((inv, i) => {
            const meta = STATUS_META[inv.payment_status] ?? STATUS_META.pending;
            const balance = Number(inv.total_amount) - Number(inv.paid_amount);
            const isDue = balance > 0;
            const paidPct =
              Number(inv.total_amount) > 0
                ? Math.min(100, (Number(inv.paid_amount) / Number(inv.total_amount)) * 100)
                : 0;

            const issuedDate = inv.created_at
              ? new Date(inv.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "—";

            const items = Array.isArray(inv.items) ? inv.items : [];

            return (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i, 4) * 0.05 }}
                className={`group relative overflow-hidden rounded-3xl border bg-white p-5 sm:p-6 transition-all shadow-xs hover:shadow-md ${
                  isDue ? "border-amber-300/80 ring-2 ring-yellow/15" : "border-slate-200/90 hover:border-slate-300"
                }`}
              >
                {/* Left Accent Stripe */}
                <span className={`absolute inset-y-0 left-0 w-1.5 ${meta.dot}`} />

                <div className="flex flex-col gap-4">
                  {/* Top Row: Meta, Status & Amounts */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/60 pb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-11 w-11 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl border shadow-2xs transition-transform group-hover:scale-105 ${meta.iconCls}`}
                      >
                        <ReportIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/account/invoices/${inv.id}`} className="hover:text-yellow-dark transition-colors">
                            <b className="font-mono text-sm sm:text-base font-black text-ink tracking-tight">
                              {inv.invoice_number}
                            </b>
                          </Link>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 text-[10.5px] font-bold text-slate-700">
                            GST Tax Invoice
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${meta.cls}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${isDue ? "animate-ping" : ""}`}
                            />
                            <span>{meta.label}</span>
                          </span>
                        </div>

                        <p className="mt-1 flex items-center gap-2 text-[11px] sm:text-xs text-muted font-medium">
                          <span>Issued {issuedDate}</span>
                          {inv.payment_reference && (
                            <>
                              <span>•</span>
                              <span className="text-slate-600 font-mono text-[10.5px]">
                                Ref: {inv.payment_reference}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Amount Block */}
                    <div className="flex sm:flex-col items-baseline sm:items-end justify-between gap-0.5 pt-1 sm:pt-0">
                      <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-muted">
                        {isDue ? "Balance Due" : "Total Paid"}
                      </span>
                      <b
                        className={`text-xl sm:text-2xl font-black [font-variant-numeric:tabular-nums] ${
                          isDue ? "text-amber-600" : "text-ink"
                        }`}
                      >
                        ₹{(isDue ? balance : Number(inv.total_amount)).toLocaleString("en-IN")}
                      </b>
                      {isDue && Number(inv.paid_amount) > 0 && (
                        <span className="text-[10.5px] text-emerald-700 font-bold">
                          ₹{Number(inv.paid_amount).toLocaleString("en-IN")} paid of ₹
                          {Number(inv.total_amount).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Line Items Preview */}
                  {items.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider mr-1">
                        Billed Items:
                      </span>
                      {items.slice(0, 3).map((it, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 truncate max-w-[220px]"
                        >
                          {it.description || it.title || `Item ${idx + 1}`}
                        </span>
                      ))}
                      {items.length > 3 && (
                        <span className="text-[11px] font-bold text-muted">+{items.length - 3} more items</span>
                      )}
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-line/60">
                    <div className="flex items-center gap-2 text-xs text-muted font-medium">
                      {isDue ? (
                        <span className="text-amber-800 font-bold flex items-center gap-1.5">
                          <ClockIcon className="h-3.5 w-3.5 text-amber-600" />
                          <span>Immediate online payment available</span>
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Settled via Cashfree / UPI · Official Receipt</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 justify-end w-full sm:w-auto">
                      <Link
                        href={`/account/invoices/${inv.id}`}
                        className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-2xs transition-all hover:border-ink hover:text-ink"
                      >
                        <span>View Invoice</span>
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Link>

                      {isDue && (
                        <Link
                          href={`/account/invoices/${inv.id}`}
                          className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-2xl bg-yellow px-5 py-2.5 text-xs font-black text-ink shadow-sm transition-all hover:bg-yellow-dark hover:shadow-md active:scale-[0.99]"
                        >
                          <WalletIcon className="h-3.5 w-3.5" />
                          <span>Pay ₹{balance.toLocaleString("en-IN")} Now</span>
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
