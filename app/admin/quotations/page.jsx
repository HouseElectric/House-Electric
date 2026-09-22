"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { avatarGradient } from "@/components/admin/CustomerPicker";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle,
  ClockIcon,
  PlusIcon,
  ReportIcon,
  SparklesIcon,
  WalletIcon,
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

const STATUS_META = {
  draft: { label: "Draft", cls: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  sent: { label: "Sent", cls: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  viewed: { label: "Viewed", cls: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
  accepted: { label: "Accepted", cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  rejected: { label: "Rejected", cls: "bg-red-50 text-red-700", dot: "bg-red-500" },
  expired: { label: "Expired", cls: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
  paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-600" },
};

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState([]);

  const fetchAll = async () => {
    const { data } = await supabase.from("quotations").select("*").order("created_at", { ascending: false });
    setQuotations(data ?? []);
  };
  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <AdminGuard>
      <AdminLayout title="Quotations">
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-ink px-6 py-7 sm:px-8 sm:py-8">
          <span className="glow-blob -right-14 -top-20 h-56 w-56 bg-yellow/25" />
          <span className="glow-blob -bottom-24 -left-10 h-48 w-48 bg-yellow/10" style={{ animationDelay: "2.2s" }} />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow/30 bg-yellow/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-yellow">
              <SparklesIcon className="h-3 w-3" /> Sales
            </span>
            <h2 className="mt-3 text-[21px] font-extrabold text-white sm:text-[25px]">Quotations</h2>
            <p className="mt-1.5 max-w-[56ch] text-[13.5px] text-white/55">Create, track and follow up on every quotation sent to customers.</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total Quotations"
            value={quotations.length}
            icon={ReportIcon}
            cls="bg-ink text-yellow"
            glow="bg-yellow"
            accent="from-yellow to-amber-500"
            delay={0}
          />
          <StatCard
            label="Pending Response"
            value={quotations.filter((q) => ["draft", "sent", "viewed"].includes(q.status)).length}
            icon={ClockIcon}
            cls="bg-blue-50 text-blue-600"
            glow="bg-blue-400"
            accent="from-blue-400 to-indigo-500"
            delay={0.06}
          />
          <StatCard
            label="Accepted"
            value={quotations.filter((q) => ["accepted", "paid"].includes(q.status)).length}
            icon={CheckCircle}
            cls="bg-emerald-50 text-emerald-600"
            glow="bg-emerald-400"
            accent="from-emerald-400 to-teal-500"
            delay={0.12}
          />
          <StatCard
            label="Total Value"
            value={quotations.reduce((s, q) => s + Number(q.total || 0), 0)}
            format={(v) => `₹${v.toLocaleString("en-IN")}`}
            icon={WalletIcon}
            cls="bg-violet-50 text-violet-600"
            glow="bg-violet-400"
            accent="from-violet-400 to-purple-500"
            delay={0.18}
          />
        </div>

        <Link
          href="/admin/quotations/new"
          className="mb-5 flex w-fit items-center gap-1.5 rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md"
        >
          <PlusIcon className="h-4 w-4" />
          Create Quotation
        </Link>

        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="border-b border-line bg-cream/40 px-5 py-3">
            <span className="text-[12px] font-bold uppercase tracking-wide text-body">
              {quotations.length} Quotation{quotations.length === 1 ? "" : "s"}
            </span>
          </div>
          {quotations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-body">
              <ReportIcon className="h-6 w-6 text-body/40" />
              No quotations yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13.5px]">
                <thead>
                  <tr className="border-b border-line bg-cream/40">
                    {["Quotation #", "Customer", "Total", "Status", "Valid Until"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((q) => {
                    const meta = STATUS_META[q.status] ?? STATUS_META.draft;
                    const name = q.customer_name || "—";
                    return (
                      <tr key={q.id} className="border-t border-line transition-colors hover:bg-cream/30">
                        <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-ink">
                          <div className="flex items-center gap-2">
                            {q.quotation_number}
                            {q.quotation_type === "corporate_amc" && (
                              <span className="rounded-full bg-yellow/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-yellow-dark">
                                Corporate AMC
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-ink">
                          <div className="flex items-center gap-2.5">
                            <span className={`grid h-7 w-7 flex-none place-items-center rounded-full bg-gradient-to-br text-[11px] font-extrabold text-white shadow-sm ${avatarGradient(name)}`}>
                              {name.charAt(0).toUpperCase()}
                            </span>
                            {name}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-bold text-ink">₹{Number(q.total).toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.cls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-body">{q.valid_until || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
