"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import Reveal from "@/components/Reveal";
import { ReportIcon, CalendarIcon } from "@/components/icons";

const STATUS_META = {
  draft: { label: "Draft", cls: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400", iconCls: "bg-slate-100 text-slate-600" },
  sent: { label: "Sent", cls: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500", iconCls: "bg-blue-50 text-blue-600" },
  viewed: { label: "Viewed", cls: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500", iconCls: "bg-indigo-50 text-indigo-600" },
  accepted: { label: "Accepted", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", iconCls: "bg-emerald-50 text-emerald-600" },
  rejected: { label: "Rejected", cls: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", iconCls: "bg-red-50 text-red-600" },
  expired: { label: "Expired", cls: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400", iconCls: "bg-slate-100 text-slate-600" },
  paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-800 border-emerald-300", dot: "bg-emerald-600", iconCls: "bg-emerald-50 text-emerald-600" },
};

export default function MyQuotationsPage() {
  const { user } = useCustomerAuth();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const pendingCount = quotations.filter((q) => ["sent", "viewed"].includes(q.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-ink">My Quotations & Estimates</h2>
          <p className="text-xs text-body">Review detailed estimates, project quotes, and proposal approvals</p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-extrabold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {pendingCount} awaiting your response
          </span>
        )}
      </div>

      {loading ? (
        <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body">
          Loading quotations…
        </div>
      ) : quotations.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-line/80 bg-white p-12 text-center shadow-xs">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-muted">
            <ReportIcon className="h-7 w-7" />
          </span>
          <div className="space-y-1">
            <p className="text-base font-extrabold text-ink">No Quotations Found</p>
            <p className="text-xs text-body">Custom project quotes generated for your location will be listed here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {quotations.map((q, i) => {
            const meta = STATUS_META[q.status] ?? STATUS_META.draft;
            return (
              <Reveal key={q.id} delay={Math.min(i, 4) * 0.06} y={12}>
                <div className="group relative overflow-hidden rounded-3xl border border-line/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-line hover:shadow-xl">
                  <span className={`absolute inset-y-0 left-0 w-1.5 ${meta.dot}`} />

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span className={`grid h-12 w-12 flex-none place-items-center rounded-2xl shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-105 ${meta.iconCls}`}>
                        <ReportIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <b className="font-mono text-sm font-extrabold text-ink">{q.quotation_number}</b>
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${meta.cls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                        </div>
                        {q.valid_until && (
                          <p className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                            <CalendarIcon className="h-3.5 w-3.5 flex-none text-muted" />
                            Valid until {q.valid_until}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-none items-center justify-between gap-4 sm:justify-end">
                      <div className="text-right">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Total</p>
                        <b className="text-lg font-black text-ink [font-variant-numeric:tabular-nums]">
                          ₹{Number(q.total).toLocaleString("en-IN")}
                        </b>
                      </div>
                      <Link
                        href={`/account/quotations/${q.id}`}
                        className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-black text-ink shadow-2xs transition-all group-hover:border-ink group-hover:bg-ink group-hover:text-white hover:shadow-md"
                      >
                        View Quote
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
