"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { uploadImage } from "@/lib/imagekit";
import { AlertIcon, CalendarIcon, CameraIcon, ChevronDown, ClockIcon, InboxIcon, PinIcon, PlusIcon, WrenchIcon, XIcon } from "@/components/icons";

const SERVICE_OPTIONS = [
  "Electrical Repair",
  "Electrical Installation",
  "Electrical Maintenance",
  "Electrical Health Check",
  "Electrical AMC",
  "Emergency Electrical Service",
  "Other",
];

const inputClass =
  "w-full rounded-2xl border border-line/90 bg-white px-4 py-3 pl-11 text-[14.5px] text-ink outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15";
const plainInputClass =
  "w-full rounded-2xl border border-line/90 bg-white px-4 py-3 text-[14.5px] text-ink outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15";

function Field({ icon: Icon, label, required, select, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-extrabold text-ink">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />}
        {children}
        {select && <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body/50" />}
      </div>
    </div>
  );
}

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="sm:col-span-2 mt-1 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-muted">
      <Icon className="h-3.5 w-3.5 text-yellow-dark" />
      {children}
    </div>
  );
}

export default function NewServiceRequestPage() {
  const { user, profile } = useCustomerAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    service_type: "",
    description: "",
    preferred_date: "",
    preferred_time: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState([]); // [{ file, preview }]
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const MAX_PHOTOS = 5;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      toast.error(`You can attach up to ${MAX_PHOTOS} photos.`);
      e.target.value = "";
      return;
    }
    const next = files.slice(0, room).map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setPhotos((p) => [...p, ...next]);
    if (files.length > room) toast.error(`Only ${MAX_PHOTOS} photos allowed — added the first ${room}.`);
    e.target.value = "";
  };

  const removePhoto = (index) => {
    setPhotos((p) => p.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      let photo_urls = [];
      if (photos.length > 0) {
        setUploadingPhoto(true);
        photo_urls = await Promise.all(
          photos.map((p) => uploadImage(p.file, "house-electric/service-requests"))
        );
        setUploadingPhoto(false);
      }

      const { data, error: insertError } = await supabase
        .from("service_requests")
        .insert([{ ...form, photo_url: photo_urls[0] || null, photo_urls, customer_id: user.id }])
        .select()
        .single();
      if (insertError) throw insertError;

      await supabase.from("notifications").insert([
        {
          customer_id: user.id,
          title: "Service request received",
          message: `Your request ${data.ticket_number} has been received. We'll be in touch shortly.`,
        },
      ]);

      toast.success("Service request submitted");
      router.replace("/account/requests");
    } catch (err) {
      setError(err.message || "Failed to submit request.");
      toast.error(err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-black text-ink">Raise a New Service Request</h2>
        <p className="text-xs text-body">We'll assign a technician and keep you updated at every step.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border border-line/80 bg-white p-6 shadow-sm md:p-8"
      >
        <div className="mb-6 flex items-center gap-3 border-b border-line/70 pb-5">
          <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm ring-4 ring-white">
            <InboxIcon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-extrabold text-ink">Request Details</h3>
            <p className="text-xs text-body">Tell us what's wrong and when you'd like us to visit</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            <AlertIcon className="mt-0.5 h-4 w-4 flex-none" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field icon={WrenchIcon} label="Service Type" required select>
              <select
                required
                value={form.service_type}
                onChange={set("service_type")}
                className={`${inputClass} cursor-pointer appearance-none pr-10`}
              >
                <option value="" disabled>
                  Select a service
                </option>
                {SERVICE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-extrabold text-ink">Problem / Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={set("description")}
              placeholder="Briefly describe the issue you're facing…"
              className={plainInputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <Field icon={PinIcon} label="Location">
              <input
                value={form.location}
                onChange={set("location")}
                placeholder={profile?.address || "Where should the technician visit?"}
                className={inputClass}
              />
            </Field>
          </div>

          <SectionLabel icon={CalendarIcon}>Schedule Preferred Visit</SectionLabel>

          <Field icon={CalendarIcon} label="Preferred Date">
            <input type="date" value={form.preferred_date} onChange={set("preferred_date")} className={inputClass} />
          </Field>
          <Field icon={ClockIcon} label="Preferred Time">
            <input type="time" value={form.preferred_time} onChange={set("preferred_time")} className={inputClass} />
          </Field>

          <SectionLabel icon={CameraIcon}>Attach Photos</SectionLabel>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-extrabold text-ink">
              Photos <span className="font-normal text-body">(optional, up to {MAX_PHOTOS})</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {photos.map((p, i) => (
                <div key={p.preview} className="relative">
                  <img
                    src={p.preview}
                    alt={`Selected upload preview ${i + 1}`}
                    className="h-28 w-28 rounded-2xl border border-line object-cover shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label="Remove photo"
                    className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-ink text-white shadow-md transition-transform hover:scale-110"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line bg-slate-50 text-body transition-all hover:border-ink hover:bg-slate-100 hover:text-ink">
                  <CameraIcon className="h-5 w-5" />
                  <span className="text-[11px] font-bold">{photos.length > 0 ? "Add More" : "Add Photo"}</span>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow px-7 py-3.5 text-sm font-black text-ink shadow-md transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-lg disabled:translate-y-0 disabled:opacity-60 sm:w-auto"
            >
              {!submitting && <PlusIcon className="h-4 w-4" />}
              {uploadingPhoto ? "Uploading photo…" : submitting ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
