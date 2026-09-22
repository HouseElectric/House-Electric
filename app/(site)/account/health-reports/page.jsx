"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import Reveal from "@/components/Reveal";
import { CalendarIcon, ChevronRightIcon, PinIcon, PlusIcon, ReportIcon } from "@/components/icons";

const STATUS_META = {
  requested: { label: "Requested", cls: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  scheduled: { label: "Scheduled", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

export default function MyHealthReportsPage() {
  const { user } = useCustomerAuth();
  const [bookings, setBookings] = useState([]);
  const [reportByCheckId, setReportByCheckId] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: checks }, { data: reports }] = await Promise.all([
        supabase.from("health_checks").select("*").eq("customer_id", user.id).order("created_at", { ascending: false }),
        supabase.from("health_reports").select("*").eq("customer_id", user.id).eq("status", "published"),
      ]);
      setBookings(checks ?? []);
      const map = {};
      (reports ?? []).forEach((r) => {
        if (r.health_check_id) map[r.health_check_id] = r;
      });
      setReportByCheckId(map);
      setLoading(false);
    })();
  }, [user]);

  const DONE_STATUSES = ["completed", "cancelled"];
  const filtered = bookings.filter((b) => {
    const status = b.status || "requested";
    if (filter === "active") return !DONE_STATUSES.includes(status);
    if (filter === "completed") return status === "completed";
    return true;
  });

  const counts = {
    all: bookings.length,
    active: bookings.filter((b) => !DONE_STATUSES.includes(b.status || "requested")).length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Header Bar */}
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-ink">My Health Reports</h2>
          <p className="text-xs sm:text-[13px] text-body mt-0.5">
            Track your electrical health check bookings and view completed reports
          </p>
        </div>
        <Link
          href="/account/health-reports/new"
          className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-yellow px-5 py-3 text-xs font-black text-ink shadow-sm transition-all hover:bg-yellow-dark hover:shadow-md active:scale-[0.99]"
        >
          <PlusIcon className="h-4 w-4 transition-transform group-hover:rotate-90" />
          <span>Book Health Check</span>
        </Link>
      </div>

      {/* Status Filter Pills */}
      {!loading && bookings.length > 0 && (
        <div className="flex items-center overflow-x-auto pb-1 scrollbar-none">
          <div className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 p-1.5">
            {[
              { key: "all", label: "All Bookings" },
              { key: "active", label: "Active" },
              { key: "completed", label: "Completed" },
            ].map((tab) => {
              const active = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-black transition-all ${
                    active ? "bg-ink text-white shadow-xs" : "text-slate-600 hover:text-ink hover:bg-white/70"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10.5px] font-black ${
                      active ? "bg-white/20 text-white" : "bg-slate-200/90 text-slate-700"
                    }`}
                  >
                    {counts[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body">Loading health checks…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-line/80 bg-white p-12 text-center shadow-xs">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-muted">
            <ReportIcon className="h-7 w-7" />
          </span>
          <div className="space-y-1">
            <p className="text-base font-extrabold text-ink">
              {bookings.length === 0 ? "No Health Checks Yet" : `No ${filter} bookings found`}
            </p>
            {bookings.length === 0 && (
              <p className="text-xs text-body">
                Book an{" "}
                <Link href="/account/health-reports/new" className="font-bold text-ink underline underline-offset-2">
                  Electrical Health Check
                </Link>{" "}
                and your report will appear here once our engineer completes the inspection.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3.5 sm:space-y-4">
          {filtered.map((b, i) => {
            const meta = STATUS_META[b.status] ?? STATUS_META.requested;
            const report = reportByCheckId[b.id];
            const Wrapper = report ? Link : "div";
            const wrapperProps = report ? { href: `/account/health-reports/${report.id}` } : {};

            return (
              <Reveal key={b.id} delay={Math.min(i, 4) * 0.05} y={12}>
                <Wrapper
                  {...wrapperProps}
                  className={`group relative flex flex-col gap-4 sm:gap-5 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all sm:flex-row sm:items-center sm:justify-between ${
                    report ? "hover:-translate-y-1 hover:border-amber-300 hover:shadow-md" : ""
                  }`}
                >
                  <span className={`absolute inset-y-0 left-0 w-1.5 ${meta.dot}`} />

                  <div className="flex min-w-0 items-start sm:items-center gap-3.5 sm:gap-4">
                    <span
                      className={`grid h-12 w-12 sm:h-13 sm:w-13 shrink-0 place-items-center rounded-2xl border ${meta.cls} font-bold shadow-2xs transition-transform duration-300 group-hover:scale-105 mt-0.5 sm:mt-0`}
                    >
                      <ReportIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[15px] sm:text-base font-black text-ink break-words leading-snug transition-colors group-hover:text-amber-800">
                          Electrical Health Check
                        </h3>
                        {b.request_number && (
                          <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-lg border border-slate-200 bg-slate-100/90 px-2.5 py-0.5 font-mono text-[10.5px] sm:text-[11px] font-extrabold tracking-wide text-slate-700 shadow-2xs">
                            {b.request_number}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs font-medium text-slate-500">
                        <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
                          <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span>
                            {new Date(b.created_at || Date.now()).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </span>
                        {b.address && (
                          <span className="flex items-center gap-1.5">
                            <PinIcon className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                            <span className="break-words">{b.address}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 pt-3 sm:pt-0 border-t border-slate-100 sm:border-0 sm:justify-end">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-black shadow-2xs ${meta.cls}`}>
                      <span className={`h-2 w-2 rounded-full ${b.status !== "completed" && b.status !== "cancelled" ? "animate-pulse" : ""} ${meta.dot}`} />
                      <span>{meta.label}</span>
                    </span>
                    {report ? (
                      <>
                        <span className="hidden items-center gap-1.5 rounded-xl border border-slate-300/90 bg-white px-4 py-2 text-xs font-black text-ink shadow-2xs transition-all group-hover:border-ink group-hover:bg-ink group-hover:text-white sm:flex">
                          <span>View Report</span>
                          <ChevronRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                        <span className="flex items-center gap-1 text-xs font-black text-slate-500 group-hover:text-ink sm:hidden">
                          <span>View Report</span>
                          <ChevronRightIcon className="h-3.5 w-3.5 text-slate-400 group-hover:text-ink" />
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] sm:text-xs font-bold text-slate-400">Report not ready yet</span>
                    )}
                  </div>
                </Wrapper>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
