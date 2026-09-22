"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import TechnicianGuard from "@/components/TechnicianGuard";
import TechnicianLayout from "@/components/TechnicianLayout";
import { useTechnicianAuth } from "@/contexts/TechnicianAuthContext";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/imagekit";
import { STATUS_META } from "@/lib/serviceRequestMeta";
import { ArrowLeftIcon, CalendarIcon, CheckCircle, MailIcon, PhoneIcon, PinIcon, UploadIcon, XIcon } from "@/components/icons";

const TECHNICIAN_STATUS_OPTIONS = ["assigned", "scheduled", "on_the_way", "in_progress", "material_required", "completed"];

function JobDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const { technician } = useTechnicianAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [amc, setAmc] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    status: "",
    diagnosis: "",
    work_performed: "",
    material_used: "",
    before_photos: [],
    after_photos: [],
  });

  const fetchJob = async () => {
    if (!technician) return;
    const { data } = await supabase
      .from("service_requests")
      .select("*, profiles(name, email, mobile), properties(label, address, city, state)")
      .eq("id", id)
      .eq("technician_id", technician.id)
      .maybeSingle();
    setJob(data);
    if (data) {
      setForm({
        status: data.status,
        diagnosis: data.diagnosis || "",
        work_performed: data.work_performed || "",
        material_used: data.material_used || "",
        before_photos: Array.isArray(data.before_photos) ? data.before_photos : [],
        after_photos: Array.isArray(data.after_photos) ? data.after_photos : [],
      });

      if (data.property_id) {
        const [{ data: amcData }, { data: historyData }] = await Promise.all([
          supabase
            .from("amc_subscriptions")
            .select("plan_name_snapshot, amc_number, status, expiry_date, coverage_snapshot")
            .eq("property_id", data.property_id)
            .eq("status", "active")
            .maybeSingle(),
          supabase
            .from("service_requests")
            .select("ticket_number, service_type, status, created_at")
            .eq("property_id", data.property_id)
            .neq("id", id)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);
        setAmc(amcData || null);
        setHistory(historyData ?? []);
      } else {
        setAmc(null);
        setHistory([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, technician]);

  const uploadPhoto = async (slot, file) => {
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

  const removePhoto = (slot, url) => setForm((f) => ({ ...f, [slot]: f[slot].filter((u) => u !== url) }));

  const save = async () => {
    setSaving(true);
    const statusChanged = form.status !== job.status;
    await supabase
      .from("service_requests")
      .update({
        status: form.status,
        diagnosis: form.diagnosis || null,
        work_performed: form.work_performed || null,
        material_used: form.material_used || null,
        before_photos: form.before_photos,
        after_photos: form.after_photos,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (statusChanged) {
      if (job.customer_id) {
        await supabase.from("notifications").insert([
          {
            customer_id: job.customer_id,
            title: `Service request ${job.ticket_number} updated`,
            message: `Your request status is now "${STATUS_META[form.status]?.label ?? form.status}".`,
          },
        ]);
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      fetch("/api/service-requests/notify-status", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ requestId: id }),
      }).catch((err) => console.error("Status email trigger failed:", err));
    }

    setSaving(false);
    toast.success("Job updated");
    fetchJob();
  };

  if (loading) {
    return <div className="p-10 text-center text-[13.5px] text-body">Loading job…</div>;
  }
  if (!job) {
    return <div className="p-10 text-center text-[13.5px] text-body">Job not found or not assigned to you.</div>;
  }

  const photos = Array.isArray(job.photo_urls) && job.photo_urls.length > 0 ? job.photo_urls : job.photo_url ? [job.photo_url] : [];
  const meta = STATUS_META[job.status] ?? STATUS_META.requested;

  return (
    <div className="max-w-2xl space-y-4">
      <button onClick={() => router.push("/technician")} className="flex items-center gap-1.5 text-[13px] font-bold text-ink hover:text-yellow-dark">
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to Jobs
      </button>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className={`flex items-center justify-between border-b px-5 py-3 ${meta.cls}`}>
          <span className="font-mono text-[12.5px] font-extrabold">{job.ticket_number}</span>
          <span className="text-[11px] font-black uppercase tracking-wider">{meta.label}</span>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <p className="text-[16px] font-extrabold text-ink">{job.service_type}</p>
            {job.description && <p className="mt-1 text-[13.5px] text-body">{job.description}</p>}
          </div>

          <div className="rounded-xl bg-cream/40 p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-body">Customer</p>
            <p className="text-[14px] font-bold text-ink">{job.profiles?.name || "—"}</p>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-body">
              {job.profiles?.mobile && (
                <a href={`tel:${job.profiles.mobile}`} className="flex items-center gap-1.5 hover:text-ink">
                  <PhoneIcon className="h-3.5 w-3.5" />
                  {job.profiles.mobile}
                </a>
              )}
              {job.profiles?.email && (
                <span className="flex items-center gap-1.5">
                  <MailIcon className="h-3.5 w-3.5" />
                  {job.profiles.email}
                </span>
              )}
            </div>
            {(job.properties?.address || job.location) && (
              <p className="mt-2 flex items-start gap-1.5 text-[12.5px] text-body">
                <PinIcon className="mt-0.5 h-3.5 w-3.5 flex-none" />
                {job.properties ? `${job.properties.label} — ${job.properties.address}` : job.location}
              </p>
            )}
            {job.scheduled_date && (
              <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
                <CalendarIcon className="h-3.5 w-3.5" />
                Visit: {job.scheduled_date} {job.scheduled_time || ""}
              </p>
            )}
          </div>

          {amc && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <p className="mb-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                AMC Coverage — Active
              </p>
              <p className="text-[13.5px] font-bold text-ink">{amc.plan_name_snapshot}</p>
              <p className="text-[12px] text-body">
                {amc.amc_number} · valid till {amc.expiry_date}
              </p>
              {Array.isArray(amc.coverage_snapshot) && amc.coverage_snapshot.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {amc.coverage_snapshot.map((c) => (
                    <li key={c} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {history.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-body">Previous Service History</p>
              <div className="space-y-1.5">
                {history.map((h) => (
                  <div key={h.ticket_number} className="rounded-lg border border-line px-3 py-2 text-[12px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-ink">{h.ticket_number}</span>
                      <span className="text-[10.5px] font-bold uppercase text-body">{h.status.replace(/_/g, " ")}</span>
                    </div>
                    <p className="text-body/80">
                      {h.service_type} · {h.created_at.slice(0, 10)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {photos.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-body">Customer Photos</p>
              <div className="flex flex-wrap gap-2">
                {photos.map((url, i) => (
                  <a key={url + i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt="" className="h-20 w-20 rounded-lg border border-line object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-line/70 pt-4">
            <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-body">Update Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
            >
              {TECHNICIAN_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-body">Diagnosis</label>
            <textarea
              rows={2}
              value={form.diagnosis}
              onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))}
              className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-body">Work Performed</label>
            <textarea
              rows={2}
              value={form.work_performed}
              onChange={(e) => setForm((f) => ({ ...f, work_performed: e.target.value }))}
              className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-body">Material Used</label>
            <textarea
              rows={2}
              value={form.material_used}
              onChange={(e) => setForm((f) => ({ ...f, material_used: e.target.value }))}
              className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {["before_photos", "after_photos"].map((slot) => (
              <div key={slot}>
                <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-body">
                  {slot === "before_photos" ? "Before Photos" : "After Photos"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {form[slot].map((url) => (
                    <div key={url} className="group relative">
                      <img src={url} alt="" className="h-16 w-16 rounded-md border border-line object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(slot, url)}
                        className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-md border border-dashed border-line text-body hover:border-yellow hover:text-ink">
                    {uploadingSlot === slot ? <span className="text-[9px] font-bold">…</span> : <UploadIcon className="h-4 w-4" />}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadPhoto(slot, e.target.files[0])} />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-yellow py-3 text-[13.5px] font-extrabold text-ink transition-all hover:bg-yellow-dark disabled:opacity-60"
          >
            <CheckCircle className="h-4 w-4" />
            {saving ? "Saving…" : "Save Job Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TechnicianJobDetailPage() {
  return (
    <TechnicianGuard>
      <TechnicianLayout title="Job Details">
        <JobDetailContent />
      </TechnicianLayout>
    </TechnicianGuard>
  );
}
