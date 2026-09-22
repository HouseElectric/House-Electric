"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import Reveal from "@/components/Reveal";
import { ReportIcon } from "@/components/icons";

export default function MyHealthReportsPage() {
  const { user } = useCustomerAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("health_reports")
        .select("*")
        .eq("customer_id", user.id)
        .eq("status", "published")
        .order("created_at", { ascending: false });
      setReports(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-ink">My Health Reports</h2>
        <p className="text-xs text-body">Electrical health check reports prepared by our engineers</p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body">Loading reports…</div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-line/80 bg-white p-12 text-center shadow-xs">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-muted">
            <ReportIcon className="h-7 w-7" />
          </span>
          <div className="space-y-1">
            <p className="text-base font-extrabold text-ink">No Health Reports Yet</p>
            <p className="text-xs text-body">
              Book an{" "}
              <Link href="/health-check" className="font-bold text-ink underline underline-offset-2">
                Electrical Health Check
              </Link>{" "}
              and your report will appear here once our engineer completes the inspection.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r, i) => (
            <Reveal key={r.id} delay={Math.min(i, 4) * 0.06} y={12}>
              <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-line/80 bg-white p-4 sm:p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-line hover:shadow-xl">
                <span className="absolute inset-y-0 left-0 w-1.5 bg-yellow" />
                <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start sm:items-center gap-3 sm:gap-3.5">
                    <span className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-xl sm:rounded-2xl bg-yellow/15 text-yellow-dark shadow-sm ring-2 sm:ring-4 ring-white mt-0.5 sm:mt-0">
                      <ReportIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <b className="font-mono text-xs sm:text-sm font-extrabold text-ink">{r.report_number}</b>
                      <p className="mt-1 text-[11px] sm:text-[12px] font-semibold text-body">
                        {r.property_name || r.property_address || "Property"} · Inspected{" "}
                        {r.inspection_date ? new Date(r.inspection_date).toLocaleDateString("en-GB") : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-end pt-2.5 sm:pt-0 border-t border-slate-100 sm:border-0">
                    <Link
                      href={`/account/health-reports/${r.id}`}
                      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-line bg-white px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-black text-ink shadow-2xs transition-all group-hover:border-ink group-hover:bg-ink group-hover:text-white hover:shadow-md"
                    >
                      View Report
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
