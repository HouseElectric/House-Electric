"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { ArrowLeftIcon, MailIcon, ReportIcon, WhatsAppIcon, XIcon } from "@/components/icons";

const STATUS_META = {
  requested: { label: "Requested" },
  scheduled: { label: "Scheduled" },
  completed: { label: "Completed" },
  cancelled: { label: "Cancelled" },
};

const fmt = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function HealthCheckDetail({ bookingId }) {
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !bookingId) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("health_checks").select("*").eq("id", bookingId).single();
      setBooking(data ?? null);
      setLoading(false);
    })();
  }, [bookingId]);

  const updateField = async (id, patch) => {
    await supabase.from("health_checks").update(patch).eq("id", id);
    setBooking((prev) => ({ ...prev, ...patch }));
  };

  const updateStatus = async (id, status) => {
    await updateField(id, { status });
    toast.success(`Marked as ${STATUS_META[status]?.label ?? status}`);
  };

  if (loading || !booking) {
    return (
      <AdminLayout title="Health Checks">
        <div className="p-12 text-center text-[13.5px] text-body">Loading booking...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Health Checks">
      <button
        onClick={() => router.push("/admin/health-checks")}
        className="mb-4 flex items-center gap-1.5 text-[13px] font-semibold text-body hover:text-ink"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to Health Checks
      </button>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white sm:p-8">
          <span className="glow-blob -right-10 -top-16 h-48 w-48 bg-white/15" />
          <button
            onClick={() => router.push("/admin/health-checks")}
            aria-label="Close"
            className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          >
            <XIcon className="h-4 w-4" />
          </button>
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="grid h-16 w-16 flex-none place-items-center rounded-full bg-white/15 text-[22px] font-extrabold ring-2 ring-white/30">
              {booking.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="truncate text-[20px] font-extrabold">{booking.name}</p>
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                  {booking.request_number}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-white/70">Booked {fmt(booking.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_300px]">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[
              ["Mobile", booking.mobile],
              ["Email", booking.email],
              ["Property Type", booking.property_type],
              ["Address", booking.address],
              ["Preferred Date", booking.preferred_date],
              ["Preferred Time", booking.preferred_time],
              ["Notes", booking.notes],
            ]
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <div key={label} className="border-l-2 border-line pl-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-body">{label}</div>
                  <div className="whitespace-pre-wrap text-[14px] font-medium text-ink">{value}</div>
                </div>
              ))}
          </div>

          <div className="space-y-5 lg:border-l lg:border-line lg:pl-6">
            <div>
              <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-body">Status</label>
              <select
                value={booking.status || "requested"}
                onChange={(e) => updateStatus(booking.id, e.target.value)}
                className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-ink"
              >
                <option value="requested">Requested</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-body">Assigned Engineer</label>
              <input
                defaultValue={booking.engineer_name || ""}
                onBlur={(e) => updateField(booking.id, { engineer_name: e.target.value })}
                placeholder="Engineer name"
                className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-ink"
              />
            </div>

            <Link
              href={`/admin/health-checks/${bookingId}/report`}
              className="flex items-center justify-center gap-1.5 rounded-md bg-yellow py-2.5 text-center text-[13px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md"
            >
              <ReportIcon className="h-4 w-4" />
              Build / View Health Report
            </Link>

            <div className="flex flex-col gap-2">
              {booking.email && (
                <a
                  href={`mailto:${booking.email}`}
                  className="flex items-center justify-center gap-1.5 rounded-md bg-ink py-2.5 text-center text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <MailIcon className="h-4 w-4" />
                  Email
                </a>
              )}
              {booking.mobile && (
                <a
                  href={`https://wa.me/91${booking.mobile.replace(/[^0-9]/g, "").slice(-10)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-md bg-[#25D366] py-2.5 text-center text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
