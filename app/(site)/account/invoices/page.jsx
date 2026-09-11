"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import Reveal from "@/components/Reveal";
import { ReportIcon } from "@/components/icons";

const STATUS_META = {
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", iconCls: "bg-amber-50 text-amber-600" },
  payment_initiated: { label: "Processing", cls: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500", iconCls: "bg-blue-50 text-blue-600" },
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", iconCls: "bg-emerald-50 text-emerald-600" },
  failed: { label: "Failed", cls: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", iconCls: "bg-red-50 text-red-600" },
  cancelled: { label: "Cancelled", cls: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400", iconCls: "bg-slate-100 text-slate-600" },
  refunded: { label: "Refunded", cls: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500", iconCls: "bg-purple-50 text-purple-600" },
  partially_paid: { label: "Partially Paid", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", iconCls: "bg-amber-50 text-amber-600" },
};

export default function MyInvoicesPage() {
  const { user } = useCustomerAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const totalDue = invoices.reduce((sum, inv) => sum + Math.max(0, Number(inv.total_amount) - Number(inv.paid_amount)), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-ink">My Invoices & Receipts</h2>
          <p className="text-xs text-body">View payment history, download GST invoices, or settle balances</p>
        </div>
        {totalDue > 0 && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-extrabold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            ₹{totalDue.toLocaleString("en-IN")} total balance due
          </span>
        )}
      </div>

      {loading ? (
        <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body">
          Loading invoices…
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-line/80 bg-white p-12 text-center shadow-xs">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-muted">
            <ReportIcon className="h-7 w-7" />
          </span>
          <div className="space-y-1">
            <p className="text-base font-extrabold text-ink">No Invoices Found</p>
            <p className="text-xs text-body">Invoices generated for your completed jobs and subscriptions will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv, i) => {
            const meta = STATUS_META[inv.payment_status] ?? STATUS_META.pending;
            const balance = Number(inv.total_amount) - Number(inv.paid_amount);
            const paidPct = Number(inv.total_amount) > 0 ? Math.min(100, (Number(inv.paid_amount) / Number(inv.total_amount)) * 100) : 0;

            return (
              <Reveal key={inv.id} delay={Math.min(i, 4) * 0.06} y={12}>
                <div className="group relative overflow-hidden rounded-3xl border border-line/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-line hover:shadow-xl">
                  <span className={`absolute inset-y-0 left-0 w-1.5 ${meta.dot}`} />

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span className={`grid h-12 w-12 flex-none place-items-center rounded-2xl shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-105 ${meta.iconCls}`}>
                        <ReportIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <b className="font-mono text-sm font-extrabold text-ink">{inv.invoice_number}</b>
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${meta.cls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                        </div>
                        <p className="mt-1 text-[12px] font-semibold text-body">
                          ₹{Number(inv.paid_amount).toLocaleString("en-IN")} paid of ₹{Number(inv.total_amount).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-none items-center justify-between gap-4 sm:justify-end">
                      <div className="text-right">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                          {balance > 0 ? "Balance Due" : "Total"}
                        </p>
                        <b className={`text-lg font-black [font-variant-numeric:tabular-nums] ${balance > 0 ? "text-amber-600" : "text-ink"}`}>
                          ₹{(balance > 0 ? balance : Number(inv.total_amount)).toLocaleString("en-IN")}
                        </b>
                      </div>
                      <Link
                        href={`/account/invoices/${inv.id}`}
                        className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-black text-ink shadow-2xs transition-all group-hover:border-ink group-hover:bg-ink group-hover:text-white hover:shadow-md"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>

                  {balance > 0 && (
                    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${paidPct}%` }} />
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
