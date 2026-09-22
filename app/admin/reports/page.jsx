"use client";

import { useEffect, useMemo, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import {
  AmcBadge,
  BarChartIcon,
  CalendarIcon,
  InboxIcon,
  PercentIcon,
  RefreshIcon,
  SparklesIcon,
  TrendingUpIcon,
  WalletIcon,
  WrenchIcon,
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

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function lastNMonths(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: monthKey(d), label: d.toLocaleDateString("en-GB", { month: "short" }) });
  }
  return out;
}

function BarChart({ series, months, formatValue = (v) => v }) {
  const [hoverKey, setHoverKey] = useState(null);
  const [activeLabel, setActiveLabel] = useState(null);
  const max = Math.max(1, ...months.map((m) => series.reduce((s, ser) => s + (ser.values[m.key] || 0), 0)));
  const allZero = months.every((m) => series.reduce((s, ser) => s + (ser.values[m.key] || 0), 0) === 0);
  const dimSeries = (label) => activeLabel && activeLabel !== label;

  return (
    <div>
      <div className="flex h-44 items-end gap-2.5">
        {months.map((m, idx) => {
          const total = series.reduce((s, ser) => s + (ser.values[m.key] || 0), 0);
          const isHovered = hoverKey === m.key;
          // Centering the tooltip on the hovered bar overflows off-screen for columns near
          // either edge (e.g. the last month), so the last couple of columns anchor their
          // tooltip to the right and the first couple anchor it to the left instead.
          const edge = idx <= 1 ? "left" : idx >= months.length - 2 ? "right" : "center";
          const tooltipPos =
            edge === "left" ? "left-0" : edge === "right" ? "right-0" : "left-1/2 -translate-x-1/2";
          const arrowPos =
            edge === "left" ? "left-4" : edge === "right" ? "right-4" : "left-1/2 -translate-x-1/2";
          return (
            <div
              key={m.key}
              className="group relative flex flex-1 cursor-pointer flex-col items-center gap-1.5"
              onMouseEnter={() => setHoverKey(m.key)}
              onMouseLeave={() => setHoverKey((k) => (k === m.key ? null : k))}
            >
              {isHovered && total > 0 && (
                <div
                  className={`pointer-events-none absolute bottom-full z-20 mb-2.5 w-max min-w-[130px] rounded-xl border border-ink/10 bg-ink px-3 py-2.5 text-left shadow-xl animate-fade-up ${tooltipPos}`}
                  style={{ animationDuration: "0.12s" }}
                >
                  <p className="mb-1.5 text-[11px] font-extrabold text-white/50">{m.label}</p>
                  <div className="space-y-1">
                    {series.map((ser) => {
                      const v = ser.values[m.key] || 0;
                      if (!v) return null;
                      return (
                        <div key={ser.label} className="flex items-center justify-between gap-4 text-[11.5px]">
                          <span className="flex items-center gap-1.5 text-white/75">
                            <span className={`h-2 w-2 flex-none rounded-sm ${ser.cls}`} />
                            {ser.label}
                          </span>
                          <span className="font-bold text-white">{formatValue(v)}</span>
                        </div>
                      );
                    })}
                  </div>
                  {series.length > 1 && (
                    <div className="mt-1.5 flex items-center justify-between gap-4 border-t border-white/15 pt-1.5 text-[11.5px]">
                      <span className="font-semibold text-white/50">Total</span>
                      <span className="font-black text-yellow">{formatValue(total)}</span>
                    </div>
                  )}
                  <span className={`absolute top-full h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-ink ${arrowPos}`} />
                </div>
              )}
              <div
                className={`relative flex h-36 w-full flex-col-reverse overflow-hidden rounded-t-md bg-cream/60 transition-all duration-200 ${
                  isHovered ? "ring-2 ring-yellow/70 ring-offset-1" : ""
                }`}
              >
                {total === 0 ? (
                  <div className="h-[3px] w-full rounded-full bg-line" />
                ) : (
                  series.map((ser) => {
                    const v = ser.values[m.key] || 0;
                    const pct = max ? (v / max) * 100 : 0;
                    return (
                      <div
                        key={ser.label}
                        style={{ height: `${pct}%` }}
                        className={`w-full transition-all duration-300 ${ser.cls} ${dimSeries(ser.label) ? "opacity-25" : "opacity-100"} ${
                          isHovered ? "brightness-110" : ""
                        }`}
                      />
                    );
                  })
                )}
              </div>
              <span className={`text-[10.5px] font-bold transition-colors ${isHovered ? "text-yellow-dark" : "text-body"}`}>{m.label}</span>
              <span className={`text-[10px] font-bold ${total === 0 ? "text-body/40" : isHovered ? "text-ink" : "text-body/70"}`}>{formatValue(total)}</span>
            </div>
          );
        })}
      </div>
      {allZero && (
        <p className="mt-3 text-center text-[12px] text-body/60">No activity recorded in this period yet.</p>
      )}
      {series.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {series.map((ser) => (
            <button
              key={ser.label}
              type="button"
              onMouseEnter={() => setActiveLabel(ser.label)}
              onMouseLeave={() => setActiveLabel(null)}
              className={`flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold transition-colors ${
                dimSeries(ser.label) ? "text-body/40" : "text-body hover:bg-cream/70"
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-sm ${ser.cls}`} />
              {ser.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, rawValue, format, sub, icon: Icon, cls, glow, accent, delay = 0 }) {
  return (
    <div
      style={{ animationDelay: `${delay}s` }}
      className="card-hover group relative isolate overflow-hidden rounded-2xl border border-line bg-white p-5 opacity-0 animate-fade-up"
    >
      <span className={`absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r ${accent} transition-transform duration-300 ease-out group-hover:scale-x-100`} />
      <span className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${glow}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-body">{label}</p>
          <b className="mt-1 block truncate text-[19px] font-black leading-none tabular-nums text-ink sm:text-[28px]">
            {typeof rawValue === "number" ? <CountUp value={rawValue} format={format} /> : value}
          </b>
          {sub && <p className="mt-1.5 truncate text-[11.5px] font-semibold text-body/70">{sub}</p>}
        </div>
        <span className={`grid h-11 w-11 flex-none place-items-center rounded-2xl shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${cls}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ invoices: [], amcSubs: [], requests: [], enquiries: [], healthChecks: [] });

  useEffect(() => {
    (async () => {
      const [{ data: invoices }, { data: amcSubs }, { data: requests }, { data: enquiries }, { data: healthChecks }] = await Promise.all([
        supabase.from("invoices").select("total_amount, paid_amount, payment_status, created_at, updated_at"),
        supabase.from("amc_subscriptions").select("id, amount_paid, status, created_at, expiry_date, renewed_from"),
        supabase.from("service_requests").select("status, created_at"),
        supabase.from("enquiries").select("created_at"),
        supabase.from("health_checks").select("status, created_at"),
      ]);
      setData({
        invoices: invoices ?? [],
        amcSubs: amcSubs ?? [],
        requests: requests ?? [],
        enquiries: enquiries ?? [],
        healthChecks: healthChecks ?? [],
      });
      setLoading(false);
    })();
  }, []);

  const months = useMemo(() => lastNMonths(6), []);

  const stats = useMemo(() => {
    const { invoices, amcSubs, requests, enquiries, healthChecks } = data;
    const now = new Date();
    const thisMonthKey = monthKey(now);
    const lastMonthKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

    const invoiceRevenueByMonth = {};
    const amcRevenueByMonth = {};
    invoices.forEach((i) => {
      const k = monthKey(new Date(i.updated_at || i.created_at));
      invoiceRevenueByMonth[k] = (invoiceRevenueByMonth[k] || 0) + Number(i.paid_amount || 0);
    });
    amcSubs.forEach((s) => {
      if (!s.amount_paid) return;
      const k = monthKey(new Date(s.created_at));
      amcRevenueByMonth[k] = (amcRevenueByMonth[k] || 0) + Number(s.amount_paid);
    });

    const totalRevenue =
      invoices.reduce((s, i) => s + Number(i.paid_amount || 0), 0) + amcSubs.reduce((s, a) => s + Number(a.amount_paid || 0), 0);
    const revenueThisMonth = (invoiceRevenueByMonth[thisMonthKey] || 0) + (amcRevenueByMonth[thisMonthKey] || 0);
    const revenueLastMonth = (invoiceRevenueByMonth[lastMonthKey] || 0) + (amcRevenueByMonth[lastMonthKey] || 0);
    const revenueDelta = revenueLastMonth ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100) : null;

    const newSalesByMonth = {};
    const renewalsByMonth = {};
    amcSubs.forEach((s) => {
      const k = monthKey(new Date(s.created_at));
      if (s.renewed_from) renewalsByMonth[k] = (renewalsByMonth[k] || 0) + 1;
      else newSalesByMonth[k] = (newSalesByMonth[k] || 0) + 1;
    });
    const newSalesThisMonth = newSalesByMonth[thisMonthKey] || 0;

    const dueSubs = amcSubs.filter((s) => new Date(s.expiry_date) < now);
    const renewedIds = new Set(amcSubs.filter((s) => s.renewed_from).map((s) => s.renewed_from));
    const renewedCount = dueSubs.filter((s) => renewedIds.has(s.id)).length;
    const renewalRate = dueSubs.length ? Math.round((renewedCount / dueSubs.length) * 100) : null;

    const requestsByMonth = {};
    requests.forEach((r) => {
      const k = monthKey(new Date(r.created_at));
      requestsByMonth[k] = (requestsByMonth[k] || 0) + 1;
    });
    const closedStatuses = new Set(["completed", "confirmed", "closed"]);
    const completedRequests = requests.filter((r) => closedStatuses.has(r.status)).length;
    const completionRate = requests.length ? Math.round((completedRequests / requests.length) * 100) : null;

    const leadsByMonth = {};
    enquiries.forEach((e) => {
      const k = monthKey(new Date(e.created_at));
      leadsByMonth[k] = (leadsByMonth[k] || 0) + 1;
    });
    const newLeadsThisMonth = leadsByMonth[thisMonthKey] || 0;

    const healthChecksThisMonth = healthChecks.filter((h) => monthKey(new Date(h.created_at)) === thisMonthKey).length;

    return {
      totalRevenue,
      revenueThisMonth,
      revenueDelta,
      invoiceRevenueByMonth,
      amcRevenueByMonth,
      newSalesByMonth,
      renewalsByMonth,
      newSalesThisMonth,
      renewalRate,
      dueSubsCount: dueSubs.length,
      renewedCount,
      requestsByMonth,
      completionRate,
      newLeadsThisMonth,
      healthChecksThisMonth,
    };
  }, [data]);

  return (
    <AdminGuard>
      <AdminLayout title="Reports & Analytics">
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-ink px-6 py-7 sm:px-8 sm:py-8">
          <span className="glow-blob -right-14 -top-20 h-56 w-56 bg-yellow/25" />
          <span className="glow-blob -bottom-24 -left-10 h-48 w-48 bg-yellow/10" style={{ animationDelay: "2.2s" }} />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow/30 bg-yellow/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-yellow">
                <SparklesIcon className="h-3 w-3" /> Analytics
              </span>
              <h2 className="mt-3 text-[21px] font-extrabold text-white sm:text-[25px]">Reports & Analytics</h2>
              <p className="mt-1.5 max-w-[56ch] text-[13.5px] text-white/55">
                Revenue, AMC renewal performance and service-request trends across the last 6 months.
              </p>
            </div>
            <span className="flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-semibold text-white/50">
              <CalendarIcon className="h-3.5 w-3.5" />
              Last 6 months
            </span>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-line bg-white p-12 text-center text-[13.5px] text-body">Loading…</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                label="Total Revenue"
                rawValue={stats.totalRevenue}
                format={(v) => `₹${v.toLocaleString("en-IN")}`}
                sub="All-time, invoices + AMC"
                icon={WalletIcon}
                cls="bg-emerald-50 text-emerald-600"
                glow="bg-emerald-400"
                accent="from-emerald-400 to-teal-500"
                delay={0}
              />
              <StatCard
                label="Revenue This Month"
                rawValue={stats.revenueThisMonth}
                format={(v) => `₹${v.toLocaleString("en-IN")}`}
                sub={stats.revenueDelta === null ? "No data last month" : `${stats.revenueDelta >= 0 ? "+" : ""}${stats.revenueDelta}% vs last month`}
                icon={TrendingUpIcon}
                cls="bg-blue-50 text-blue-600"
                glow="bg-blue-400"
                accent="from-blue-400 to-indigo-500"
                delay={0.06}
              />
              <StatCard
                label="New AMC Sales"
                rawValue={stats.newSalesThisMonth}
                sub="This month, excludes renewals"
                icon={AmcBadge}
                cls="bg-yellow/15 text-yellow-dark"
                glow="bg-yellow"
                accent="from-yellow to-amber-500"
                delay={0.12}
              />
              <StatCard
                label="AMC Renewal Rate"
                value={stats.renewalRate === null ? "—" : `${stats.renewalRate}%`}
                rawValue={stats.renewalRate === null ? null : stats.renewalRate}
                format={(v) => `${v}%`}
                sub={stats.dueSubsCount === 0 ? "No AMCs due for renewal yet" : `${stats.renewedCount} of ${stats.dueSubsCount} due AMCs renewed`}
                icon={RefreshIcon}
                cls="bg-violet-50 text-violet-600"
                glow="bg-violet-400"
                accent="from-violet-400 to-purple-500"
                delay={0.18}
              />
              <StatCard
                label="Service Completion Rate"
                value={stats.completionRate === null ? "—" : `${stats.completionRate}%`}
                rawValue={stats.completionRate === null ? null : stats.completionRate}
                format={(v) => `${v}%`}
                sub="Completed / confirmed / closed"
                icon={WrenchIcon}
                cls="bg-amber-50 text-amber-600"
                glow="bg-amber-400"
                accent="from-amber-400 to-orange-500"
                delay={0.24}
              />
              <StatCard
                label="New Leads This Month"
                rawValue={stats.newLeadsThisMonth}
                sub={`${stats.healthChecksThisMonth} health checks booked`}
                icon={InboxIcon}
                cls="bg-indigo-50 text-indigo-600"
                glow="bg-indigo-400"
                accent="from-indigo-400 to-blue-500"
                delay={0.3}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="card-hover rounded-2xl border border-line bg-white p-5">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-blue-50 text-blue-600 ring-4 ring-white">
                    <BarChartIcon className="h-4 w-4" />
                  </span>
                  <h3 className="text-[14px] font-extrabold text-ink">Revenue by Month</h3>
                </div>
                <BarChart
                  months={months}
                  formatValue={(v) => `₹${v.toLocaleString("en-IN")}`}
                  series={[
                    { label: "Invoice Payments", values: stats.invoiceRevenueByMonth, cls: "bg-blue-400" },
                    { label: "AMC Payments", values: stats.amcRevenueByMonth, cls: "bg-yellow" },
                  ]}
                />
              </div>

              <div className="card-hover rounded-2xl border border-line bg-white p-5">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-emerald-50 text-emerald-600 ring-4 ring-white">
                    <AmcBadge className="h-4 w-4" />
                  </span>
                  <h3 className="text-[14px] font-extrabold text-ink">New Sales vs Renewals</h3>
                </div>
                <BarChart
                  months={months}
                  series={[
                    { label: "New Sales", values: stats.newSalesByMonth, cls: "bg-emerald-400" },
                    { label: "Renewals", values: stats.renewalsByMonth, cls: "bg-violet-400" },
                  ]}
                />
              </div>

              <div className="card-hover rounded-2xl border border-line bg-white p-5 lg:col-span-2">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-amber-50 text-amber-600 ring-4 ring-white">
                    <WrenchIcon className="h-4 w-4" />
                  </span>
                  <h3 className="text-[14px] font-extrabold text-ink">Service Requests Raised per Month</h3>
                </div>
                <BarChart months={months} series={[{ label: "Requests", values: stats.requestsByMonth, cls: "bg-amber-400" }]} />
              </div>
            </div>

            <div className="card-hover rounded-2xl border border-line bg-white p-5">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-violet-50 text-violet-600 ring-4 ring-white">
                  <PercentIcon className="h-4 w-4" />
                </span>
                <h3 className="text-[14px] font-extrabold text-ink">AMC Renewal Funnel</h3>
              </div>
              {stats.dueSubsCount === 0 ? (
                <p className="text-[12.5px] text-body">No AMC subscriptions have reached their expiry date yet — this funnel fills in as renewals come due.</p>
              ) : (
                <>
                  <p className="mb-3 text-[12.5px] text-body">
                    Of the {stats.dueSubsCount} AMC subscription{stats.dueSubsCount === 1 ? "" : "s"} that reached expiry,{" "}
                    <b className="text-ink">{stats.renewedCount}</b> {stats.renewedCount === 1 ? "was" : "were"} renewed.
                  </p>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-cream">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                      style={{ width: `${stats.renewalRate ?? 0}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
