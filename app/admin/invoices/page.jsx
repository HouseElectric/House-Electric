"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { avatarGradient } from "@/components/admin/CustomerPicker";
import { STATUS_META } from "@/components/admin/InvoicePayment";
import { supabase } from "@/lib/supabase";
import {
  ArrowRightIcon,
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

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState([]);

  const fetchAll = async () => {
    const { data } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
    setInvoices(data ?? []);
  };
  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <AdminGuard>
      <AdminLayout title="Invoices">
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-ink px-6 py-7 sm:px-8 sm:py-8">
          <span className="glow-blob -right-14 -top-20 h-56 w-56 bg-yellow/25" />
          <span className="glow-blob -bottom-24 -left-10 h-48 w-48 bg-yellow/10" style={{ animationDelay: "2.2s" }} />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow/30 bg-yellow/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-yellow">
              <SparklesIcon className="h-3 w-3" /> Billing
            </span>
            <h2 className="mt-3 text-[21px] font-extrabold text-white sm:text-[25px]">Invoices</h2>
            <p className="mt-1.5 max-w-[56ch] text-[13.5px] text-white/55">Generate, track and reconcile every invoice raised to customers.</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total Invoices"
            value={invoices.length}
            icon={ReportIcon}
            cls="bg-ink text-yellow"
            glow="bg-yellow"
            accent="from-yellow to-amber-500"
            delay={0}
          />
          <StatCard
            label="Paid"
            value={invoices.filter((i) => i.payment_status === "paid").length}
            icon={CheckCircle}
            cls="bg-emerald-50 text-emerald-600"
            glow="bg-emerald-400"
            accent="from-emerald-400 to-teal-500"
            delay={0.06}
          />
          <StatCard
            label="Pending"
            value={invoices.filter((i) => ["pending", "payment_initiated", "partially_paid"].includes(i.payment_status)).length}
            icon={ClockIcon}
            cls="bg-amber-50 text-amber-600"
            glow="bg-amber-400"
            accent="from-amber-400 to-orange-500"
            delay={0.12}
          />
          <StatCard
            label="Total Collected"
            value={invoices.reduce((s, i) => s + Number(i.paid_amount || 0), 0)}
            format={(v) => `₹${v.toLocaleString("en-IN")}`}
            icon={WalletIcon}
            cls="bg-blue-50 text-blue-600"
            glow="bg-blue-400"
            accent="from-blue-400 to-indigo-500"
            delay={0.18}
          />
        </div>

        <Link
          href="/admin/invoices/new"
          className="mb-5 flex w-fit items-center gap-1.5 rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md"
        >
          <PlusIcon className="h-4 w-4" />
          Generate Invoice
        </Link>

        <div className="grid grid-cols-1 gap-5">
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="border-b border-line bg-cream/40 px-5 py-3">
              <span className="text-[12px] font-bold uppercase tracking-wide text-body">
                {invoices.length} Invoice{invoices.length === 1 ? "" : "s"}
              </span>
            </div>
            {invoices.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-body">
                <ReportIcon className="h-6 w-6 text-body/40" />
                No invoices yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13.5px]">
                  <thead>
                    <tr className="border-b border-line bg-cream/40">
                      {["Invoice #", "Customer", "Total", "Paid", "Status", ""].map((h) => (
                        <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => {
                      const meta = STATUS_META[inv.payment_status] ?? STATUS_META.pending;
                      const name = inv.customer_name || "—";
                      return (
                        <tr
                          key={inv.id}
                          className="group border-t border-line transition-colors hover:bg-cream/40"
                        >
                          <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-ink">{inv.invoice_number}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-ink">
                            <div className="flex items-center gap-2.5">
                              <span className={`grid h-7 w-7 flex-none place-items-center rounded-full bg-gradient-to-br text-[11px] font-extrabold text-white shadow-sm ${avatarGradient(name)}`}>
                                {name.charAt(0).toUpperCase()}
                              </span>
                              {name}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-bold text-ink">₹{Number(inv.total_amount).toLocaleString("en-IN")}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-body">₹{Number(inv.paid_amount).toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.cls}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                              {meta.label}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <Link
                              href={`/admin/invoices/${inv.id}`}
                              className="flex items-center gap-1 text-[12px] font-bold text-ink"
                            >
                              Update
                              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
