"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { CalendarIcon, ClockIcon, WrenchIcon } from "@/components/icons";

const STATUS_META = {
  requested: { label: "Requested", cls: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  assigned: { label: "Assigned", cls: "bg-purple-50 text-purple-700", dot: "bg-purple-500" },
  scheduled: { label: "Scheduled", cls: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
  in_progress: { label: "In Progress", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

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

  return (
    <AdminGuard>
      <AdminLayout title="Appointments">
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
