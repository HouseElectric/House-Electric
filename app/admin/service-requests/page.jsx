"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle,
  ClipboardIcon,
  InboxIcon,
  MailIcon,
  PhoneIcon,
  SlidersIcon,
  StarIcon,
  UserIcon,
  WrenchIcon,
  XIcon,
} from "@/components/icons";

const STATUS_OPTIONS = ["requested", "assigned", "scheduled", "in_progress", "completed", "cancelled"];
const STATUS_META = {
  requested: { label: "Requested", cls: "bg-blue-50 text-blue-700", dot: "bg-blue-500", gradient: "from-blue-600 to-indigo-700" },
  assigned: { label: "Assigned", cls: "bg-purple-50 text-purple-700", dot: "bg-purple-500", gradient: "from-purple-600 to-violet-700" },
  scheduled: { label: "Scheduled", cls: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500", gradient: "from-indigo-600 to-blue-700" },
  in_progress: { label: "In Progress", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500", gradient: "from-amber-500 to-orange-600" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", gradient: "from-emerald-600 to-teal-700" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700", dot: "bg-red-500", gradient: "from-red-600 to-rose-700" },
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

export default function AdminServiceRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: "", technician_name: "", admin_notes: "" });
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("technicians").select("name").eq("active", true).order("name");
      setTechnicians(data ?? []);
    })();
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("service_requests").select("*, profiles(name, email, mobile)").order("created_at", { ascending: false });
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    const { data } = await q;
    setRequests(data ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const openRequest = async (r) => {
    setSelected(r);
    setForm({ status: r.status, technician_name: r.technician_name || "", admin_notes: r.admin_notes || "" });
    setReview(null);
    setReviewLoading(true);
    const { data } = await supabase
      .from("testimonials")
      .select("rating, text, published, created_at")
      .eq("service_request_id", r.id)
      .maybeSingle();
    setReview(data || null);
    setReviewLoading(false);
  };

  const save = async () => {
    setSaving(true);
    await supabase
      .from("service_requests")
      .update({ status: form.status, technician_name: form.technician_name, admin_notes: form.admin_notes, updated_at: new Date().toISOString() })
      .eq("id", selected.id);

    if (form.status !== selected.status && selected.customer_id) {
      await supabase.from("notifications").insert([
        {
          customer_id: selected.customer_id,
          title: `Service request ${selected.ticket_number} updated`,
          message: `Your request status is now "${STATUS_META[form.status]?.label ?? form.status}".`,
        },
      ]);
    }

    setSaving(false);
    setSelected(null);
    toast.success("Service request updated");
    fetchRequests();
  };

  // ==================== FULL-PAGE DETAIL VIEW ====================
  if (selected) {
    const meta = STATUS_META[selected.status] ?? STATUS_META.requested;
    const name = selected.profiles?.name || selected.profiles?.email || "—";
    const photos =
      Array.isArray(selected.photo_urls) && selected.photo_urls.length > 0
        ? selected.photo_urls
        : selected.photo_url
        ? [selected.photo_url]
        : [];

    return (
      <AdminGuard>
        <AdminLayout title="Service Requests">
          <button
            onClick={() => setSelected(null)}
            className="mb-4 flex items-center gap-1.5 text-[13px] font-semibold text-body hover:text-ink"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to Service Requests
          </button>

          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            <div className={`relative overflow-hidden bg-gradient-to-br p-6 text-white sm:p-8 ${meta.gradient}`}>
              <span className="glow-blob -right-10 -top-16 h-48 w-48 bg-white/15" />
              <span className="glow-blob -bottom-16 left-1/3 h-40 w-40 bg-white/10" />
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
              >
                <XIcon className="h-4 w-4" />
              </button>
              <div className="relative flex flex-wrap items-center gap-4">
                <span className="grid h-16 w-16 flex-none place-items-center rounded-full bg-white/15 ring-2 ring-white/30">
                  <WrenchIcon className="h-7 w-7" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="truncate font-mono text-[20px] font-extrabold">{selected.ticket_number}</p>
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-white/70">
                    {selected.service_type} · Submitted {new Date(selected.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_320px]">
              <div className="space-y-4">
                <div className="rounded-xl bg-cream/40 p-4">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-11 w-11 flex-none place-items-center rounded-full bg-gradient-to-br text-[13px] font-extrabold text-white shadow-sm ring-4 ring-white ${avatarGradient(name)}`}>
                      {name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-body">Customer</p>
                      <p className="truncate text-[14.5px] font-bold text-ink">{name}</p>
                    </div>
                  </div>
                  {(selected.profiles?.mobile || selected.profiles?.email) && (
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line/60 pt-3 text-[12.5px] text-body">
                      {selected.profiles?.mobile && (
                        <span className="flex items-center gap-1.5">
                          <PhoneIcon className="h-3.5 w-3.5 text-body/60" />
                          {selected.profiles.mobile}
                        </span>
                      )}
                      {selected.profiles?.email && (
                        <span className="flex items-center gap-1.5">
                          <MailIcon className="h-3.5 w-3.5 text-body/60" />
                          {selected.profiles.email}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {selected.description && (
                  <div className="rounded-xl bg-cream/40 p-4">
                    <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-body">
                      <ClipboardIcon className="h-3.5 w-3.5" />
                      Problem / Description
                    </p>
                    <p className="whitespace-pre-wrap text-[14px] text-ink">{selected.description}</p>
                  </div>
                )}

                {photos.length > 0 && (
                  <div className="rounded-xl bg-cream/40 p-4">
                    <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-body">Attached Photos</p>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {photos.map((url, i) => (
                        <a key={url + i} href={url} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-lg border border-line shadow-sm">
                          <img
                            src={url}
                            alt={`Customer-attached photo ${i + 1}`}
                            className="h-24 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selected.status === "completed" && !reviewLoading && (
                  <div className="rounded-xl border border-yellow/30 bg-gradient-to-br from-amber-50/60 to-white p-4">
                    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-body">
                      <StarIcon className="h-3.5 w-3.5 text-yellow-dark" />
                      Customer Review
                    </p>
                    {review ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "fill-yellow-dark text-yellow-dark" : "fill-line text-line"}`}
                              />
                            ))}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${review.published ? "bg-emerald-50 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                            {review.published ? "Published" : "Pending Approval"}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13.5px] text-ink">{review.text}</p>
                      </>
                    ) : (
                      <p className="text-[13px] text-body">Customer hasn't left a review yet.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-5 rounded-2xl border border-line bg-cream/30 p-5 lg:border-l lg:ml-0">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-body">
                    <span className="grid h-5 w-5 place-items-center rounded-md bg-indigo-50 text-indigo-600">
                      <SlidersIcon className="h-3 w-3" />
                    </span>
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_META[s].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-body">
                    <span className="grid h-5 w-5 place-items-center rounded-md bg-blue-50 text-blue-600">
                      <UserIcon className="h-3 w-3" />
                    </span>
                    Technician Assigned
                  </label>
                  <select
                    value={form.technician_name}
                    onChange={(e) => setForm((f) => ({ ...f, technician_name: e.target.value }))}
                    className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                  >
                    <option value="">Unassigned</option>
                    {technicians.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-body">
                    <span className="grid h-5 w-5 place-items-center rounded-md bg-violet-50 text-violet-600">
                      <ClipboardIcon className="h-3 w-3" />
                    </span>
                    Admin Notes
                  </label>
                  <textarea
                    rows={3}
                    value={form.admin_notes}
                    onChange={(e) => setForm((f) => ({ ...f, admin_notes: e.target.value }))}
                    className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                  />
                </div>

                <button
                  onClick={save}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-yellow py-3 text-[13.5px] font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:opacity-60"
                >
                  <CheckCircle className="h-4 w-4" />
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  // ==================== LIST VIEW ====================
  return (
    <AdminGuard>
      <AdminLayout title="Service Requests">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-line px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-ink"
          >
            <option value="all">All Status ({requests.length})</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="border-b border-line bg-cream/40 px-5 py-3">
            <span className="text-[12px] font-bold uppercase tracking-wide text-body">
              {requests.length} Service Request{requests.length === 1 ? "" : "s"}
            </span>
          </div>
          {loading ? (
            <div className="p-12 text-center text-[13.5px] text-body">Loading…</div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-body">
              <InboxIcon className="h-6 w-6 text-body/40" />
              No service requests yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13.5px]">
                <thead>
                  <tr className="border-b border-line bg-cream/40">
                    {["Ticket", "Customer", "Service", "Status", "Date", ""].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => {
                    const meta = STATUS_META[r.status] ?? STATUS_META.requested;
                    const name = r.profiles?.name || r.profiles?.email || "—";
                    return (
                      <tr
                        key={r.id}
                        onClick={() => openRequest(r)}
                        className="group cursor-pointer border-t border-line transition-colors hover:bg-cream/40"
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-ink">{r.ticket_number}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-ink">
                          <div className="flex items-center gap-2.5">
                            <span className={`grid h-7 w-7 flex-none place-items-center rounded-full bg-gradient-to-br text-[11px] font-extrabold text-white shadow-sm transition-transform duration-200 group-hover:scale-105 ${avatarGradient(name)}`}>
                              {name.charAt(0).toUpperCase()}
                            </span>
                            {name}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-body">{r.service_type}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.cls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[12px] text-body">
                          {new Date(r.created_at).toLocaleDateString("en-GB")}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="flex items-center gap-1 text-[12px] font-bold text-ink">
                            Manage
                            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
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
