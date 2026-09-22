"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TechnicianGuard from "@/components/TechnicianGuard";
import TechnicianLayout from "@/components/TechnicianLayout";
import { useTechnicianAuth } from "@/contexts/TechnicianAuthContext";
import { supabase } from "@/lib/supabase";
import { STATUS_META } from "@/lib/serviceRequestMeta";
import {
  AmcBadge,
  CalendarIcon,
  ChevronRightIcon,
  ClockIcon,
  InboxIcon,
  MapIcon,
  PhoneIcon,
  PinIcon,
  StarIcon,
  WrenchIcon,
} from "@/components/icons";

const DONE_STATUSES = ["completed", "confirmed", "closed", "cancelled"];

function StatCard({ label, value, icon: Icon, cls, hint }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[28px] font-black leading-none tabular-nums text-ink">{value}</p>
          <p className="mt-2 text-[12.5px] font-semibold text-body">{label}</p>
        </div>
        <div className={`grid h-11 w-11 flex-none place-items-center rounded-2xl shadow-sm ring-4 ring-white ${cls}`}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
      {hint && <p className="mt-2 text-[10.5px] text-body/70">{hint}</p>}
    </div>
  );
}

function StarRow({ rating, size = "h-3.5 w-3.5" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} className={`${size} ${n <= rating ? "fill-yellow text-yellow-dark" : "fill-none text-slate-300"}`} />
      ))}
    </div>
  );
}

function JobCard({ j, todayStr, hasAmc }) {
  const meta = STATUS_META[j.status] ?? STATUS_META.requested;
  const isToday = j.scheduled_date === todayStr;
  const isOverdue = !DONE_STATUSES.includes(j.status) && j.scheduled_date && j.scheduled_date < todayStr;
  const customerName = j.profiles?.name || "Customer";
  const address = j.properties?.address || j.location;
  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
      <Link href={`/technician/jobs/${j.id}`} className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {isOverdue ? (
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-red-700">Overdue</span>
          ) : isToday ? (
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-red-700">Today</span>
          ) : null}
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-bold ${meta.cls}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
          {hasAmc && (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow/15 px-2.5 py-1 text-[11px] font-bold text-yellow-dark">
              <AmcBadge className="h-3 w-3" />
              AMC
            </span>
          )}
        </div>
        <p className="mt-2 flex items-center gap-2 text-[16px] font-extrabold text-ink">
          <WrenchIcon className="h-4 w-4 text-body/50" />
          {j.service_type}
        </p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-body">
          <span>{customerName}</span>
          {j.profiles?.mobile && (
            <span className="flex items-center gap-1.5">
              <PhoneIcon className="h-3.5 w-3.5" />
              {j.profiles.mobile}
            </span>
          )}
          {(j.properties?.label || j.location) && (
            <span className="flex items-center gap-1.5">
              <PinIcon className="h-3.5 w-3.5" />
              {j.properties?.label || j.location}
            </span>
          )}
          {j.scheduled_date && (
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              {j.scheduled_date} {j.scheduled_time || ""}
            </span>
          )}
        </p>
      </Link>
      <div className="flex flex-none items-center gap-2 border-t border-line/70 pt-3 sm:border-t-0 sm:pt-0">
        {j.profiles?.mobile && (
          <a
            href={`tel:${j.profiles.mobile}`}
            onClick={(e) => e.stopPropagation()}
            aria-label="Call customer"
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-line text-[12.5px] font-bold text-body transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 sm:w-9 sm:flex-none"
          >
            <PhoneIcon className="h-4 w-4" />
            <span className="sm:hidden">Call</span>
          </a>
        )}
        {address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label="Get directions"
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-line text-[12.5px] font-bold text-body transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 sm:w-9 sm:flex-none"
          >
            <MapIcon className="h-4 w-4" />
            <span className="sm:hidden">Directions</span>
          </a>
        )}
        <Link
          href={`/technician/jobs/${j.id}`}
          className="hidden h-9 w-9 flex-none place-items-center text-body/50 transition-transform group-hover:translate-x-0.5 sm:grid"
        >
          <ChevronRightIcon className="h-4.5 w-4.5" />
        </Link>
      </div>
    </div>
  );
}

function JobsContent() {
  const { technician } = useTechnicianAuth();
  const [jobs, setJobs] = useState([]);
  const [amcPropertyIds, setAmcPropertyIds] = useState(new Set());
  const [ratingStats, setRatingStats] = useState({ avg: null, count: 0 });
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");

  useEffect(() => {
    if (!technician) return;
    (async () => {
      const { data } = await supabase
        .from("service_requests")
        .select("*, profiles(name, mobile), properties(label, address)")
        .eq("technician_id", technician.id)
        .order("scheduled_date", { ascending: true, nullsFirst: false });
      const requests = data ?? [];
      setJobs(requests);

      const propertyIds = [...new Set(requests.map((j) => j.property_id).filter(Boolean))];
      if (propertyIds.length > 0) {
        const { data: subs } = await supabase
          .from("amc_subscriptions")
          .select("property_id")
          .in("property_id", propertyIds)
          .eq("status", "active");
        setAmcPropertyIds(new Set((subs ?? []).map((s) => s.property_id)));
      }

      const requestIds = requests.map((j) => j.id);
      if (requestIds.length > 0) {
        const { data: reviews } = await supabase
          .from("testimonials")
          .select("rating, text, created_at, service_request_id")
          .in("service_request_id", requestIds)
          .not("rating", "is", null)
          .order("created_at", { ascending: false });
        if (reviews?.length > 0) {
          const avg = reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length;
          setRatingStats({ avg: avg.toFixed(1), count: reviews.length });
          setRecentReviews(
            reviews.slice(0, 5).map((r) => ({ ...r, job: requests.find((j) => j.id === r.service_request_id) }))
          );
        }
      }

      setLoading(false);
    })();
  }, [technician]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const monthStart = todayStr.slice(0, 7);
  const activeJobs = jobs.filter((j) => !DONE_STATUSES.includes(j.status));
  const doneJobs = jobs.filter((j) => DONE_STATUSES.includes(j.status));
  const todayJobs = activeJobs.filter((j) => j.scheduled_date === todayStr);
  const upcomingJobs = activeJobs.filter((j) => j.scheduled_date !== todayStr);
  const completedThisMonth = doneJobs.filter((j) => (j.updated_at || j.created_at || "").slice(0, 7) === monthStart).length;

  const filtered = filter === "active" ? activeJobs : doneJobs;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[21px] font-extrabold text-ink sm:text-[25px]">
          Hi{technician?.name ? `, ${technician.name.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="mt-1 text-[13.5px] text-body">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} · Here are your assigned jobs
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Today's Jobs" value={todayJobs.length} icon={CalendarIcon} cls="bg-red-50 text-red-600" />
        <StatCard label="Active Jobs" value={activeJobs.length} icon={WrenchIcon} cls="bg-blue-50 text-blue-600" />
        <StatCard label="Completed This Month" value={completedThisMonth} icon={ClockIcon} cls="bg-emerald-50 text-emerald-600" />
        <StatCard
          label="Your Rating"
          value={ratingStats.avg ? `${ratingStats.avg} ★` : "—"}
          icon={StarIcon}
          cls="bg-yellow/15 text-yellow-dark"
          hint={ratingStats.count > 0 ? `From ${ratingStats.count} review${ratingStats.count === 1 ? "" : "s"}` : "No reviews yet"}
        />
      </div>

      <div className="mb-5 flex gap-2">
        {[
          { key: "active", label: `Active (${activeJobs.length})` },
          { key: "done", label: `Completed (${doneJobs.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-xl px-4 py-2.5 text-[13px] font-extrabold transition-all ${
              filter === tab.key ? "bg-ink text-white" : "border border-line bg-white text-body hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-[13.5px] text-body">Loading jobs…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white p-10 text-center text-[13.5px] text-body">
          <InboxIcon className="h-6 w-6 text-body/40" />
          No {filter === "active" ? "active" : "completed"} jobs.
        </div>
      ) : filter === "active" ? (
        <div className="space-y-6">
          {todayJobs.length > 0 && (
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-[11.5px] font-extrabold uppercase tracking-wider text-red-700">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Today
              </p>
              <div className="space-y-3">
                {todayJobs.map((j) => (
                  <JobCard key={j.id} j={j} todayStr={todayStr} hasAmc={amcPropertyIds.has(j.property_id)} />
                ))}
              </div>
            </div>
          )}
          {upcomingJobs.length > 0 && (
            <div>
              <p className="mb-3 text-[11.5px] font-extrabold uppercase tracking-wider text-muted">Upcoming / Unscheduled</p>
              <div className="space-y-3">
                {upcomingJobs.map((j) => (
                  <JobCard key={j.id} j={j} todayStr={todayStr} hasAmc={amcPropertyIds.has(j.property_id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((j) => (
            <JobCard key={j.id} j={j} todayStr={todayStr} hasAmc={amcPropertyIds.has(j.property_id)} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11.5px] font-extrabold uppercase tracking-wider text-muted">Recent Reviews</p>
          {recentReviews.length > 0 && (
            <Link href="/technician/reviews" className="text-[12px] font-bold text-ink hover:text-yellow-dark">
              View all
            </Link>
          )}
        </div>
        {recentReviews.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white p-8 text-center text-[13px] text-body">
            <StarIcon className="h-6 w-6 text-body/40" />
            No reviews yet.
            <span className="text-[12px] text-body/70">A rating shows up here once a customer marks a job completed and reviews it.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {recentReviews.map((r) => (
              <div key={`${r.service_request_id}-${r.created_at}`} className="rounded-2xl border border-line bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <StarRow rating={r.rating} />
                  <span className="text-[11px] font-semibold text-muted">
                    {r.job?.ticket_number || "—"} · {r.job?.service_type || ""}
                  </span>
                </div>
                {r.text && <p className="mt-2 text-[13px] text-body">{r.text}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TechnicianDashboardPage() {
  return (
    <TechnicianGuard>
      <TechnicianLayout title="My Jobs">
        <JobsContent />
      </TechnicianLayout>
    </TechnicianGuard>
  );
}
