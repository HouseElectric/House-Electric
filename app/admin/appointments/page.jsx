"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { STATUS_META } from "@/lib/serviceRequestMeta";
import { AlertIcon, CalendarIcon, CheckCircle, ClockIcon, SparklesIcon, WrenchIcon } from "@/components/icons";

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

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
];

function avatarGradient(seed) {
  const idx = (seed?.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("service_requests")
        .select("*, profiles(name, mobile)")
        .not("preferred_date", "is", null)
        .order("preferred_date", { ascending: true });
      setAppointments(data ?? []);
      setLoading(false);
    })();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const filtered = appointments.filter((a) => showPast || a.preferred_date >= today);
  const todayCount = filtered.filter((a) => a.preferred_date === today).length;
  const unassignedCount = filtered.filter((a) => !a.technician_name).length;
  const completedCount = filtered.filter((a) => ["completed", "confirmed", "closed"].includes(a.status)).length;

  return (
    <AdminGuard>
      <AdminLayout title="Appointments">
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-ink px-6 py-7 sm:px-8 sm:py-8">
          <span className="glow-blob -right-14 -top-20 h-56 w-56 bg-yellow/25" />
          <span className="glow-blob -bottom-24 -left-10 h-48 w-48 bg-yellow/10" style={{ animationDelay: "2.2s" }} />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow/30 bg-yellow/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-yellow">
              <SparklesIcon className="h-3 w-3" /> Operations
            </span>
            <h2 className="mt-3 text-[21px] font-extrabold text-white sm:text-[25px]">Appointments</h2>
            <p className="mt-1.5 max-w-[56ch] text-[13.5px] text-white/55">Every scheduled visit, at a glance — who's booked, who's assigned, and who's next.</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total Appointments"
            value={filtered.length}
            icon={CalendarIcon}
            cls="bg-ink text-yellow"
            glow="bg-yellow"
            accent="from-yellow to-amber-500"
            delay={0}
          />
          <StatCard
            label="Today"
            value={todayCount}
            icon={ClockIcon}
            cls="bg-blue-50 text-blue-600"
            glow="bg-blue-400"
            accent="from-blue-400 to-indigo-500"
            delay={0.06}
          />
          <StatCard
            label="Unassigned"
            value={unassignedCount}
            icon={AlertIcon}
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

        <button
          onClick={() => setShowPast((v) => !v)}
          className={`mb-5 flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
            showPast ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink/40"
          }`}
        >
          <span className={`relative inline-flex h-4 w-7 flex-none items-center rounded-full transition-colors ${showPast ? "bg-yellow" : "bg-line"}`}>
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform ${showPast ? "translate-x-3.5" : "translate-x-0.5"}`} />
          </span>
          Show past appointments
        </button>

        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="border-b border-line bg-cream/40 px-5 py-3">
            <span className="text-[12px] font-bold uppercase tracking-wide text-body">
              {filtered.length} Appointment{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
          {loading ? (
            <div className="p-12 text-center text-[13.5px] text-body">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-body">
              <CalendarIcon className="h-6 w-6 text-body/40" />
              No upcoming appointments scheduled.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13.5px]">
                <thead>
                  <tr className="border-b border-line bg-cream/40">
                    {["Date", "Time", "Customer", "Service", "Technician", "Status"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => {
                    const meta = STATUS_META[a.status] ?? STATUS_META.requested;
                    const name = a.profiles?.name || "—";
                    const d = new Date(a.preferred_date);
                    return (
                      <tr key={a.id} className="border-t border-line transition-colors hover:bg-cream/30">
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-9 w-9 flex-none flex-col place-items-center overflow-hidden rounded-lg border border-line shadow-sm">
                              <span className="flex h-3.5 w-full items-center justify-center bg-ink text-[8px] font-bold uppercase text-white">
                                {d.toLocaleDateString("en-GB", { month: "short" })}
                              </span>
                              <span className="flex flex-1 items-center justify-center text-[12px] font-extrabold text-ink">
                                {d.getDate()}
                              </span>
                            </span>
                            <span className="font-bold text-ink">{d.toLocaleDateString("en-GB", { weekday: "short", year: "numeric" })}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-body">
                          <span className="flex items-center gap-1.5">
                            <ClockIcon className="h-3.5 w-3.5 text-body/50" />
                            {a.preferred_time || "—"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-ink">
                          <div className="flex items-center gap-2.5">
                            <span className={`grid h-7 w-7 flex-none place-items-center rounded-full bg-gradient-to-br text-[11px] font-extrabold text-white shadow-sm ${avatarGradient(name)}`}>
                              {name.charAt(0).toUpperCase()}
                            </span>
                            {name}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-body">{a.service_type}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-body">
                          {a.technician_name ? (
                            <span className="flex items-center gap-1.5">
                              <WrenchIcon className="h-3.5 w-3.5 text-body/50" />
                              {a.technician_name}
                            </span>
                          ) : (
                            <span className="text-body/50">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.cls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                        </td>
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
