"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { CheckCircle, ClipboardIcon, ClockIcon, InboxIcon, ReportIcon, SearchIcon, SparklesIcon } from "@/components/icons";

function CountUp({ value }) {
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
  return typeof value === "number" ? display : value;
}

function StatCard({ label, value, icon: Icon, cls, glow, accent, delay = 0 }) {
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
          <b className="mt-1 block text-[17px] font-black leading-none tabular-nums text-ink sm:text-[24px]">
            <CountUp value={value} />
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
  requested: { label: "Requested", cls: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  scheduled: { label: "Scheduled", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

function Badge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.requested;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-bold ${m.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

export default function AdminHealthChecksPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchBookings = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    let q = supabase.from("health_checks").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setBookings(data ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filtered = bookings.filter(
    (b) => !search || [b.name, b.mobile, b.email, b.request_number].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const fmt = (iso) =>
    iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  // ==================== LIST VIEW ====================
  const requestedCount = bookings.filter((b) => (b.status || "requested") === "requested").length;
  const scheduledCount = bookings.filter((b) => b.status === "scheduled").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  return (
    <AdminGuard>
      <AdminLayout title="Health Checks">
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-ink px-6 py-7 sm:px-8 sm:py-8">
          <span className="glow-blob -right-14 -top-20 h-56 w-56 bg-yellow/25" />
          <span className="glow-blob -bottom-24 -left-10 h-48 w-48 bg-yellow/10" style={{ animationDelay: "2.2s" }} />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow/30 bg-yellow/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-yellow">
              <SparklesIcon className="h-3 w-3" /> Operations
            </span>
            <h2 className="mt-3 text-[21px] font-extrabold text-white sm:text-[25px]">Health Checks</h2>
            <p className="mt-1.5 max-w-[56ch] text-[13.5px] text-white/55">
              Every Electrical Health Check booked from the public site — customers request one from the{" "}
              <a href="/health-check" target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline decoration-white/40 underline-offset-2 hover:decoration-white">
                Health Check
              </a>{" "}
              page, and it lands here for you to schedule, assign and track.
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total Bookings"
            value={bookings.length}
            icon={InboxIcon}
            cls="bg-ink text-yellow"
            glow="bg-yellow"
            accent="from-yellow to-amber-500"
            delay={0}
          />
          <StatCard
            label="Requested"
            value={requestedCount}
            icon={ClockIcon}
            cls="bg-blue-50 text-blue-600"
            glow="bg-blue-400"
            accent="from-blue-400 to-indigo-500"
            delay={0.06}
          />
          <StatCard
            label="Scheduled"
            value={scheduledCount}
            icon={ReportIcon}
            cls="bg-amber-50 text-amber-600"
            glow="bg-amber-400"
            accent="from-amber-400 to-orange-500"
            delay={0.12}
          />
          <StatCard
            label="Completed"
            value={completedCount}
            icon={CheckCircle}
            cls="bg-emerald-50 text-emerald-600"
            glow="bg-emerald-400"
            accent="from-emerald-400 to-teal-500"
            delay={0.18}
          />
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, mobile, request no…"
              className="w-full rounded-md border border-line py-2.5 pl-9 pr-3.5 text-[13.5px] outline-none focus:border-ink"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-line px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-ink"
          >
            <option value="all">All Status ({bookings.length})</option>
            <option value="requested">Requested</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="border-b border-line bg-cream/40 px-5 py-3">
            <span className="text-[12px] font-bold uppercase tracking-wide text-body">
              {filtered.length} Booking{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
          {loading ? (
            <div className="p-12 text-center text-[13.5px] text-body">Loading bookings...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-body">
              <InboxIcon className="h-6 w-6 text-body/40" />
              {bookings.length === 0 ? (
                <>
                  No health check bookings yet — this list fills up automatically once a customer
                  books one from the public site.
                </>
              ) : (
                <>No bookings match your search or filter.</>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13.5px]">
                <thead>
                  <tr className="border-b border-line bg-cream/40">
                    {["Request #", "Name", "Contact", "Preferred Date", "Status", "Booked", ""].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => router.push(`/admin/health-checks/${b.id}`)}
                      className="group cursor-pointer border-t border-line bg-white transition-colors hover:bg-cream/40"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-body">
                        <span className="inline-flex items-center gap-1.5">
                          <ClipboardIcon className="h-3.5 w-3.5" />
                          {b.request_number}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-ink">{b.name}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-body">{b.mobile || b.email || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-body">{b.preferred_date || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge status={b.status || "requested"} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[12px] text-body">{fmt(b.created_at)}</td>
                      <td className="px-4 py-3 text-[12px] font-semibold text-ink">See Details</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
