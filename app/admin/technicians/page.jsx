"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage, imagekitConfigured } from "@/lib/imagekit";
import { CameraIcon, EditIcon, PhoneIcon, PlusIcon, TrashIcon, UserIcon, UsersIcon, WrenchIcon } from "@/components/icons";

const EMPTY = { name: "", phone: "", specialization: "", active: true, photo_url: "" };

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

export default function AdminTechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "house-electric/technicians");
      setForm((f) => ({ ...f, photo_url: url }));
    } catch (err) {
      toast.error(err.message);
    }
    setUploading(false);
  };

  const fetchAll = async () => {
    const { data } = await supabase.from("technicians").select("*").order("created_at", { ascending: false });
    setTechnicians(data ?? []);
  };
  useEffect(() => {
    fetchAll();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (form.id) {
      await supabase.from("technicians").update(form).eq("id", form.id);
    } else {
      await supabase.from("technicians").insert([form]);
    }
    setSaving(false);
    toast.success(form.id ? "Technician updated" : "Technician added");
    setForm(null);
    fetchAll();
  };

  const remove = async (id) => {
    if (!confirm("Remove this technician?")) return;
    await supabase.from("technicians").delete().eq("id", id);
    toast.success("Technician removed");
    fetchAll();
  };

  return (
    <AdminGuard>
      <AdminLayout title="Technicians">
        {form ? (
          <form onSubmit={save} className="max-w-md overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            <div className="relative overflow-hidden bg-gradient-to-br from-ink to-[#2a2a2a] p-6 text-white">
              <span className="glow-blob -right-8 -top-10 h-32 w-32 bg-yellow/20" />
              <div className="relative flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e.target.files[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="group relative grid h-14 w-14 flex-none place-items-center overflow-hidden rounded-full bg-white/15 ring-2 ring-white/30"
                >
                  {form.photo_url ? (
                    <img src={form.photo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-6 w-6" />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <CameraIcon className="h-4 w-4" />
                  </span>
                </button>
                <div>
                  <p className="text-[16px] font-extrabold">{form.id ? "Edit Technician" : "Add Technician"}</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-[11.5px] font-semibold text-white/60 hover:text-white/90"
                  >
                    {uploading ? "Uploading…" : form.photo_url ? "Change photo" : "Upload photo"}
                  </button>
                </div>
              </div>
              {!imagekitConfigured && <p className="relative mt-2 text-[11px] font-bold text-red-300">⚠ ImageKit not configured</p>}
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                  <UserIcon className="h-3.5 w-3.5 text-body/60" />
                  Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                  <PhoneIcon className="h-3.5 w-3.5 text-body/60" />
                  Phone
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                  <WrenchIcon className="h-3.5 w-3.5 text-body/60" />
                  Specialization
                </label>
                <input
                  value={form.specialization}
                  onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
                  placeholder="e.g. Wiring, Panel work, AMC visits"
                  className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                />
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                className="flex w-full items-center justify-between rounded-lg border border-line bg-cream/40 px-3.5 py-3"
              >
                <span className="text-[13px] font-semibold text-ink">Available for assignment</span>
                <span className={`relative inline-flex h-5 w-9 flex-none items-center rounded-full transition-colors ${form.active ? "bg-emerald-500" : "bg-line"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${form.active ? "translate-x-4" : "translate-x-0.5"}`} />
                </span>
              </button>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-md bg-yellow py-3 text-[13.5px] font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save Technician"}
                </button>
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="rounded-md border border-line px-6 py-3 text-[13.5px] font-semibold text-body hover:border-ink/40"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        ) : (
          <>
            <button
              onClick={() => setForm({ ...EMPTY })}
              className="mb-5 flex items-center gap-1.5 rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md"
            >
              <PlusIcon className="h-4 w-4" />
              Add Technician
            </button>

            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              <div className="border-b border-line bg-cream/40 px-5 py-3">
                <span className="text-[12px] font-bold uppercase tracking-wide text-body">
                  {technicians.length} Technician{technicians.length === 1 ? "" : "s"}
                </span>
              </div>
              {technicians.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-body">
                  <UsersIcon className="h-6 w-6 text-body/40" />
                  No technicians added yet.
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {technicians.map((t) => (
                    <div key={t.id} className="group flex flex-wrap items-center justify-between gap-3 p-5 transition-colors hover:bg-cream/30">
                      <div className="flex items-center gap-3.5">
                        {t.photo_url ? (
                          <img
                            src={t.photo_url}
                            alt={t.name}
                            className="h-11 w-11 flex-none rounded-full object-cover shadow-sm ring-4 ring-white transition-transform duration-200 group-hover:scale-105"
                          />
                        ) : (
                          <span className={`grid h-11 w-11 flex-none place-items-center rounded-full bg-gradient-to-br text-[14px] font-extrabold text-white shadow-sm ring-4 ring-white transition-transform duration-200 group-hover:scale-105 ${avatarGradient(t.name)}`}>
                            {t.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <b className="text-[15px] text-ink">{t.name}</b>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${t.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${t.active ? "bg-emerald-500" : "bg-gray-400"}`} />
                              {t.active ? "Available" : "Unavailable"}
                            </span>
                          </div>
                          <p className="flex flex-wrap items-center gap-x-3 text-[12.5px] text-body">
                            {t.phone && (
                              <span className="flex items-center gap-1">
                                <PhoneIcon className="h-3 w-3 text-body/50" />
                                {t.phone}
                              </span>
                            )}
                            {t.specialization && (
                              <span className="flex items-center gap-1">
                                <WrenchIcon className="h-3 w-3 text-body/50" />
                                {t.specialization}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button onClick={() => setForm(t)} className="flex items-center gap-1 text-[13px] font-semibold text-ink hover:underline">
                          <EditIcon className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button onClick={() => remove(t.id)} className="flex items-center gap-1 text-[13px] font-semibold text-red-400 hover:text-red-600">
                          <TrashIcon className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
