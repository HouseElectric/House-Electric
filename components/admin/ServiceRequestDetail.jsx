"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/imagekit";
import { STATUS_META, STATUS_OPTIONS, STEPS, stepIndexFor } from "@/lib/serviceRequestMeta";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircle,
  ClipboardIcon,
  ClockIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  ReportIcon,
  SlidersIcon,
  StarIcon,
  UploadIcon,
  UserIcon,
  WrenchIcon,
  XIcon,
} from "@/components/icons";

function ProgressStepper({ status }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-[11.5px] font-bold text-white/80">
        <XIcon className="h-3.5 w-3.5" />
        This request was cancelled
      </div>
    );
  }
  const idx = stepIndexFor(status);
  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const done = i < idx;
        const current = i === idx;
        return (
          <div key={step.id} className={`flex items-center ${i === STEPS.length - 1 ? "flex-none" : "flex-1"}`}>
            <div className="flex flex-none flex-col items-center gap-1.5">
              <span
                className={`grid h-6 w-6 flex-none place-items-center rounded-full text-[10px] font-extrabold transition-all duration-300 ${
                  done
                    ? "bg-white text-ink shadow-sm"
                    : current
                    ? "bg-white text-ink shadow-md ring-4 ring-white/25"
                    : "bg-white/25 text-white/85"
                }`}
              >
                {done ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={`hidden whitespace-nowrap text-[9px] font-bold uppercase tracking-wide sm:block ${
                  current ? "text-white" : done ? "text-white/75" : "text-white/60"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className={`mx-1 h-px min-w-[10px] flex-1 rounded-full transition-colors duration-300 ${i < idx ? "bg-white/60" : "bg-white/15"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const SECTION_CHIP_CLS = {
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
};

function Section({ icon: Icon, color = "slate", title, right, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-line bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-body">
          <span className={`grid h-6 w-6 flex-none place-items-center rounded-lg ${SECTION_CHIP_CLS[color]}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          {title}
        </p>
        {right}
      </div>
      {children}
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

export default function ServiceRequestDetail({ requestId }) {
  const router = useRouter();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState([]);
  const [form, setForm] = useState({
    status: "",
    technician_id: "",
    technician_name: "",
    technician_phone: "",
    technician_photo: "",
    admin_notes: "",
    scheduled_date: "",
    scheduled_time: "",
    diagnosis: "",
    work_performed: "",
    material_used: "",
    before_photos: [],
    after_photos: [],
  });
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("technicians").select("id, name, phone, photo_url").eq("active", true).order("name");
      setTechnicians(data ?? []);
    })();
  }, []);

  useEffect(() => {
    if (!requestId) return;
    (async () => {
      setLoading(true);
      const { data: r } = await supabase
        .from("service_requests")
        .select("*, profiles(name, email, mobile)")
        .eq("id", requestId)
        .single();

      if (r) {
        setRequest(r);
        setForm({
          status: r.status,
          technician_id: r.technician_id || "",
          technician_name: r.technician_name || "",
          technician_phone: r.technician_phone || "",
          technician_photo: r.technician_photo || "",
          admin_notes: r.admin_notes || "",
          scheduled_date: r.scheduled_date || "",
          scheduled_time: r.scheduled_time || "",
          diagnosis: r.diagnosis || "",
          work_performed: r.work_performed || "",
          material_used: r.material_used || "",
          before_photos: Array.isArray(r.before_photos) ? r.before_photos : [],
          after_photos: Array.isArray(r.after_photos) ? r.after_photos : [],
        });
        setReview(null);
        setReviewLoading(true);
        const [{ data }, { data: history }] = await Promise.all([
          supabase.from("testimonials").select("rating, text, published, created_at").eq("service_request_id", r.id).maybeSingle(),
          supabase.from("service_request_status_history").select("status, changed_at").eq("service_request_id", r.id).order("changed_at", { ascending: true }),
        ]);
        setReview(data || null);
        setStatusHistory(history ?? []);
        setReviewLoading(false);
      }
      setLoading(false);
    })();
  }, [requestId]);

  const uploadReportPhoto = async (slot, file) => {
    if (!file) return;
    setUploadingSlot(slot);
    try {
      const url = await uploadImage(file, "house-electric/service-requests");
      setForm((f) => ({ ...f, [slot]: [...f[slot], url] }));
    } catch (err) {
      toast.error(err.message || "Photo upload failed.");
    } finally {
      setUploadingSlot(null);
    }
  };

  const removeReportPhoto = (slot, url) => {
    setForm((f) => ({ ...f, [slot]: f[slot].filter((u) => u !== url) }));
  };

  const save = async () => {
    setSaving(true);
    await supabase
      .from("service_requests")
      .update({
        status: form.status,
        technician_id: form.technician_id || null,
        technician_name: form.technician_name,
        technician_phone: form.technician_phone || null,
        technician_photo: form.technician_photo || null,
        admin_notes: form.admin_notes,
        scheduled_date: form.scheduled_date || null,
        scheduled_time: form.scheduled_time || null,
        diagnosis: form.diagnosis || null,
        work_performed: form.work_performed || null,
        material_used: form.material_used || null,
        before_photos: form.before_photos,
        after_photos: form.after_photos,
        updated_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    if (form.technician_id && form.technician_id !== request.technician_id) {
      await supabase.from("notifications").insert([
        {
          technician_id: form.technician_id,
          title: `New job assigned: ${request.ticket_number}`,
          message: `${request.service_type}${form.scheduled_date ? ` — scheduled ${form.scheduled_date} ${form.scheduled_time || ""}`.trim() : ""}`,
        },
      ]);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      fetch("/api/service-requests/notify-technician-assigned", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ requestId: request.id }),
      }).catch((err) => console.error("Technician assignment email trigger failed:", err));
    }

    if (form.status !== request.status && request.customer_id) {
      await supabase.from("notifications").insert([
        {
          customer_id: request.customer_id,
          title: `Service request ${request.ticket_number} updated`,
          message: `Your request status is now "${STATUS_META[form.status]?.label ?? form.status}".`,
        },
      ]);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      fetch("/api/service-requests/notify-status", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ requestId: request.id }),
      }).catch((err) => console.error("Status email trigger failed:", err));
    }

    setSaving(false);
    setRequest((r) => ({
      ...r,
      status: form.status,
      technician_id: form.technician_id || null,
      technician_name: form.technician_name,
      technician_phone: form.technician_phone || null,
      technician_photo: form.technician_photo || null,
      admin_notes: form.admin_notes,
      scheduled_date: form.scheduled_date || null,
      scheduled_time: form.scheduled_time || null,
      diagnosis: form.diagnosis || null,
      work_performed: form.work_performed || null,
      material_used: form.material_used || null,
      before_photos: form.before_photos,
      after_photos: form.after_photos,
    }));
    toast.success("Service request updated");
  };

  if (loading || !request) {
    return (
      <AdminLayout title="Service Requests">
        <button
          onClick={() => router.push("/admin/service-requests")}
          className="mb-4 flex items-center gap-1.5 text-[13px] font-semibold text-body hover:text-ink"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to Service Requests
        </button>
        <div className="rounded-2xl border border-line bg-white p-16 text-center text-[13.5px] text-body">
          Loading request...
        </div>
      </AdminLayout>
    );
  }

  const meta = STATUS_META[request.status] ?? STATUS_META.requested;
  const name = request.profiles?.name || request.profiles?.email || "—";
  const photos =
    Array.isArray(request.photo_urls) && request.photo_urls.length > 0
      ? request.photo_urls
      : request.photo_url
      ? [request.photo_url]
      : [];

  return (
    <AdminLayout title="Service Requests">
      <button
        onClick={() => router.push("/admin/service-requests")}
        className="mb-4 flex items-center gap-1.5 text-[13px] font-semibold text-body hover:text-ink"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to Service Requests
      </button>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-lg shadow-ink/5">
        <div className={`relative overflow-hidden bg-gradient-to-br p-6 text-white sm:p-8 ${meta.gradient}`}>
          <span className="glow-blob -right-10 -top-16 h-48 w-48 bg-white/15" />
          <span className="glow-blob -bottom-16 left-1/3 h-40 w-40 bg-white/10" />
          <button
            onClick={() => router.push("/admin/service-requests")}
            aria-label="Close"
            className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white transition-all hover:rotate-90 hover:bg-white/25"
          >
            <XIcon className="h-4 w-4" />
          </button>
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="grid h-16 w-16 flex-none place-items-center rounded-2xl bg-white/15 shadow-inner ring-2 ring-white/30 backdrop-blur-sm">
              <WrenchIcon className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="truncate font-mono text-[22px] font-extrabold tracking-tight">{request.ticket_number}</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ring-white/25">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  {meta.label}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-white/70">
                {request.service_type} · Submitted {new Date(request.created_at).toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>

          <div className="relative mt-7">
            <ProgressStepper status={request.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5">
              <div className="flex items-center gap-3">
                <span className={`grid h-12 w-12 flex-none place-items-center rounded-full bg-gradient-to-br text-[14px] font-extrabold text-white shadow-md ring-4 ring-cream ${avatarGradient(name)}`}>
                  {name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-[10.5px] font-bold uppercase tracking-wide text-body/70">Customer</p>
                  <p className="truncate text-[15px] font-extrabold text-ink">{name}</p>
                </div>
              </div>
              {(request.profiles?.mobile || request.profiles?.email) && (
                <div className="mt-3.5 flex flex-wrap gap-2 border-t border-line/70 pt-3.5">
                  {request.profiles?.mobile && (
                    <a
                      href={`tel:${request.profiles.mobile}`}
                      className="flex items-center gap-1.5 rounded-full bg-cream/60 px-3 py-1.5 text-[12px] font-semibold text-ink transition-colors hover:bg-cream"
                    >
                      <PhoneIcon className="h-3.5 w-3.5 text-body/60" />
                      {request.profiles.mobile}
                    </a>
                  )}
                  {request.profiles?.email && (
                    <a
                      href={`mailto:${request.profiles.email}`}
                      className="flex items-center gap-1.5 rounded-full bg-cream/60 px-3 py-1.5 text-[12px] font-semibold text-ink transition-colors hover:bg-cream"
                    >
                      <MailIcon className="h-3.5 w-3.5 text-body/60" />
                      {request.profiles.email}
                    </a>
                  )}
                </div>
              )}
            </div>

            {request.description && (
              <Section icon={ClipboardIcon} color="violet" title="Problem / Description">
                <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink">{request.description}</p>
              </Section>
            )}

            {photos.length > 0 && (
              <Section icon={PinIcon} color="blue" title={`Attached Photos (${photos.length})`}>
                <div className="flex flex-wrap gap-2.5">
                  {photos.map((url, i) => (
                    <button
                      key={url + i}
                      type="button"
                      onClick={() => setLightboxUrl(url)}
                      className="group block max-w-[200px] overflow-hidden rounded-xl border border-line bg-slate-50 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-md"
                    >
                      <img
                        src={url}
                        alt={`Customer-attached photo ${i + 1}`}
                        className="h-28 w-auto max-w-[200px] object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {Array.isArray(request.video_urls) && request.video_urls.length > 0 && (
              <Section icon={UploadIcon} color="rose" title="Attached Videos">
                <div className="flex flex-wrap gap-2.5">
                  {request.video_urls.map((url, i) => (
                    <video
                      key={url + i}
                      src={url}
                      controls
                      className="h-40 w-auto max-w-full rounded-xl border border-line bg-black object-contain shadow-sm"
                    />
                  ))}
                </div>
              </Section>
            )}

            <Section icon={WrenchIcon} color="amber" title="Service Report">
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-body">Diagnosis</label>
                  <textarea
                    rows={2}
                    value={form.diagnosis}
                    onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/5"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-body">Work Performed</label>
                  <textarea
                    rows={2}
                    value={form.work_performed}
                    onChange={(e) => setForm((f) => ({ ...f, work_performed: e.target.value }))}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/5"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-body">Material Used</label>
                  <textarea
                    rows={2}
                    value={form.material_used}
                    onChange={(e) => setForm((f) => ({ ...f, material_used: e.target.value }))}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/5"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {["before_photos", "after_photos"].map((slot) => (
                    <div key={slot}>
                      <label className="mb-1 block text-[11px] font-semibold text-body">
                        {slot === "before_photos" ? "Before Photos" : "After Photos"}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {form[slot].map((url) => (
                          <div key={url} className="group relative">
                            <img src={url} alt="" className="h-14 w-14 rounded-lg border border-line object-cover shadow-sm" />
                            <button
                              type="button"
                              onClick={() => removeReportPhoto(slot, url)}
                              className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                            >
                              <XIcon className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <label className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-lg border border-dashed border-line text-body transition-colors hover:border-yellow hover:bg-yellow/5 hover:text-ink">
                          {uploadingSlot === slot ? (
                            <span className="text-[9px] font-bold">…</span>
                          ) : (
                            <UploadIcon className="h-4 w-4" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => uploadReportPhoto(slot, e.target.files[0])}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {["completed", "confirmed", "closed"].includes(request.status) && !reviewLoading && (
              <div className="rounded-2xl border border-yellow/30 bg-gradient-to-br from-amber-50/60 to-white p-4 shadow-sm sm:p-5">
                <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-body">
                  <span className="grid h-6 w-6 flex-none place-items-center rounded-lg bg-amber-100 text-yellow-dark">
                    <StarIcon className="h-3.5 w-3.5" />
                  </span>
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

          <div className="space-y-5 rounded-2xl border border-line bg-white p-5 shadow-sm lg:sticky lg:top-6">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-body">
                <span className="grid h-5 w-5 place-items-center rounded-md bg-indigo-50 text-indigo-600">
                  <SlidersIcon className="h-3 w-3" />
                </span>
                Status
              </label>
              <div className="relative">
                <span className={`pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${(STATUS_META[form.status] ?? meta).dot}`} />
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-cream/30 py-2.5 pl-7 pr-3 text-[13.5px] font-semibold text-ink outline-none transition-colors focus:border-ink focus:bg-white focus:ring-2 focus:ring-ink/5"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {statusHistory.length > 0 && (
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-body">
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-amber-50 text-amber-600">
                    <ClockIcon className="h-3 w-3" />
                  </span>
                  Status Timeline
                </label>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-line bg-cream/20 p-3">
                  {statusHistory.map((h, i) => (
                    <div key={`${h.status}-${h.changed_at}`} className="flex items-start gap-2.5">
                      <div className="flex flex-none flex-col items-center pt-0.5">
                        <span className={`h-2 w-2 rounded-full ${i === statusHistory.length - 1 ? "bg-emerald-500 ring-4 ring-emerald-500/15" : "bg-line"}`} />
                        {i < statusHistory.length - 1 && <span className="mt-0.5 h-5 w-px bg-line" />}
                      </div>
                      <div className="min-w-0 flex-1 pb-1">
                        <p className="text-[12.5px] font-bold text-ink">{STATUS_META[h.status]?.label ?? h.status}</p>
                        <p className="text-[11px] text-body/70">
                          {new Date(h.changed_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-body">
                <span className="grid h-5 w-5 place-items-center rounded-md bg-blue-50 text-blue-600">
                  <UserIcon className="h-3 w-3" />
                </span>
                Technician Assigned
              </label>
              <select
                value={form.technician_id}
                onChange={(e) => {
                  const id = e.target.value;
                  const t = technicians.find((tc) => tc.id === id);
                  setForm((f) => ({
                    ...f,
                    technician_id: id,
                    technician_name: t?.name || "",
                    technician_phone: t?.phone || "",
                    technician_photo: t?.photo_url || "",
                  }));
                }}
                className="w-full rounded-lg border border-line bg-cream/30 px-3 py-2.5 text-[13.5px] font-semibold text-ink outline-none transition-colors focus:border-ink focus:bg-white focus:ring-2 focus:ring-ink/5"
              >
                <option value="">Unassigned</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {form.technician_phone && (
                <a
                  href={`tel:${form.technician_phone}`}
                  className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-body hover:text-ink"
                >
                  <PhoneIcon className="h-3 w-3" />
                  {form.technician_phone}
                </a>
              )}
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-body">
                <span className="grid h-5 w-5 place-items-center rounded-md bg-cyan-50 text-cyan-600">
                  <CalendarIcon className="h-3 w-3" />
                </span>
                Visit Date / Time
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={form.scheduled_date}
                  onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-cream/30 px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-ink focus:bg-white focus:ring-2 focus:ring-ink/5"
                />
                <input
                  type="time"
                  value={form.scheduled_time}
                  onChange={(e) => setForm((f) => ({ ...f, scheduled_time: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-cream/30 px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-ink focus:bg-white focus:ring-2 focus:ring-ink/5"
                />
              </div>
            </div>

            <Link
              href={`/admin/quotations/new?serviceRequestId=${request.id}&customerId=${request.customer_id || ""}`}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 py-2.5 text-center text-[13px] font-bold text-orange-700 transition-all hover:-translate-y-0.5 hover:bg-orange-100 hover:shadow-sm"
            >
              <ReportIcon className="h-4 w-4" />
              Request Additional Material / Work
            </Link>

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
                className="w-full rounded-lg border border-line bg-cream/30 px-3 py-2.5 text-[13.5px] outline-none transition-colors focus:border-ink focus:bg-white focus:ring-2 focus:ring-ink/5"
              />
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow py-3 text-[13.5px] font-extrabold text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-lg disabled:translate-y-0 disabled:opacity-60 disabled:shadow-sm"
            >
              <CheckCircle className="h-4 w-4" />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            aria-label="Close"
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <XIcon className="h-5 w-5" />
          </button>
          <img
            src={lightboxUrl}
            alt="Attached photo — full size"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </AdminLayout>
  );
}
