"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import TechnicianGuard from "@/components/TechnicianGuard";
import TechnicianLayout from "@/components/TechnicianLayout";
import { useTechnicianAuth } from "@/contexts/TechnicianAuthContext";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/imagekit";
import {
  CameraIcon,
  CheckCircle,
  ClockIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  StarIcon,
  UserIcon,
  WrenchIcon,
} from "@/components/icons";

const DONE_STATUSES = ["completed", "confirmed", "closed", "cancelled"];

function StatCard({ label, value, icon: Icon, cls }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-3.5 shadow-sm">
      <div className={`mb-2 grid h-8 w-8 place-items-center rounded-lg ${cls}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[19px] font-black leading-none text-ink">{value}</p>
      <p className="mt-1 text-[10.5px] font-semibold text-body">{label}</p>
    </div>
  );
}

function ProfileContent() {
  const { technician, refreshTechnician } = useTechnicianAuth();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ name: "", phone: "", specialization: "", active: true, photo_url: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ active: 0, completedThisMonth: 0, rating: null });

  const [pw, setPw] = useState({ password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (technician) {
      setForm({
        name: technician.name || "",
        phone: technician.phone || "",
        specialization: technician.specialization || "",
        active: !!technician.active,
        photo_url: technician.photo_url || "",
      });
    }
  }, [technician]);

  useEffect(() => {
    if (!technician) return;
    (async () => {
      const { data } = await supabase.from("service_requests").select("id, status, updated_at, created_at").eq("technician_id", technician.id);
      const requests = data ?? [];
      const monthStart = new Date().toISOString().slice(0, 7);
      const active = requests.filter((j) => !DONE_STATUSES.includes(j.status)).length;
      const completedThisMonth = requests.filter(
        (j) => DONE_STATUSES.includes(j.status) && (j.updated_at || j.created_at || "").slice(0, 7) === monthStart
      ).length;

      const ids = requests.map((j) => j.id);
      let rating = null;
      if (ids.length > 0) {
        const { data: reviews } = await supabase.from("testimonials").select("rating").in("service_request_id", ids).not("rating", "is", null);
        if (reviews?.length > 0) {
          rating = (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1);
        }
      }
      setStats({ active, completedThisMonth, rating });
    })();
  }, [technician]);

  const handlePhotoUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "house-electric/technicians");
      setForm((f) => ({ ...f, photo_url: url }));
    } catch (err) {
      toast.error(err.message || "Photo upload failed.");
    }
    setUploading(false);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!technician) return;
    setSaving(true);
    const { error } = await supabase
      .from("technicians")
      .update({
        name: form.name,
        phone: form.phone,
        specialization: form.specialization,
        active: form.active,
        photo_url: form.photo_url,
      })
      .eq("id", technician.id);
    setSaving(false);
    if (error) {
      toast.error(error.message || "Could not update profile.");
      return;
    }
    toast.success("Profile updated");
    refreshTechnician();
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (pw.password !== pw.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: pw.password });
    setChangingPw(false);
    if (error) {
      toast.error(error.message || "Could not change password.");
      return;
    }
    toast.success("Password updated");
    setPw({ password: "", confirm: "" });
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-black text-ink">My Profile</h1>
        <p className="text-[13px] text-body">Manage your details, availability and login.</p>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <StatCard label="Active Jobs" value={stats.active} icon={WrenchIcon} cls="bg-blue-50 text-blue-600" />
        <StatCard label="Completed This Month" value={stats.completedThisMonth} icon={ClockIcon} cls="bg-emerald-50 text-emerald-600" />
        <StatCard label="Your Rating" value={stats.rating ? `${stats.rating} ★` : "—"} icon={StarIcon} cls="bg-yellow/15 text-yellow-dark" />
      </div>

      <form onSubmit={saveProfile} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="relative overflow-hidden bg-gradient-to-br from-ink to-[#2a2a2a] p-6 text-white">
          <span className="glow-blob -right-8 -top-10 h-32 w-32 bg-yellow/20" />
          <div className="relative flex items-center gap-3">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e.target.files[0])} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="group relative grid h-16 w-16 flex-none place-items-center overflow-hidden rounded-full bg-white/15 ring-2 ring-white/30"
            >
              {form.photo_url ? <img src={form.photo_url} alt="" className="h-full w-full object-cover" /> : <UserIcon className="h-6 w-6" />}
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <CameraIcon className="h-4 w-4" />
              </span>
            </button>
            <div>
              <p className="text-[16px] font-extrabold">{form.name || "Technician"}</p>
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
              <MailIcon className="h-3.5 w-3.5 text-body/60" />
              Email
            </label>
            <input
              disabled
              value={technician?.email || ""}
              className="w-full rounded-md border border-line bg-cream/40 px-3 py-2.5 text-[13.5px] text-body outline-none"
            />
            <p className="mt-1 text-[11px] text-body">Contact admin to change your login email.</p>
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
            <span className="text-[13px] font-semibold text-ink">Available for new job assignments</span>
            <span className={`relative inline-flex h-5 w-9 flex-none items-center rounded-full transition-colors ${form.active ? "bg-emerald-500" : "bg-line"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${form.active ? "translate-x-4" : "translate-x-0.5"}`} />
            </span>
          </button>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-md bg-yellow px-8 py-3 text-[13.5px] font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:opacity-60"
            >
              <CheckCircle className="h-4 w-4" />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      <form onSubmit={changePassword} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="border-b border-line bg-cream/40 px-6 py-3.5">
          <p className="flex items-center gap-1.5 text-[13.5px] font-extrabold text-ink">
            <LockIcon className="h-4 w-4 text-body/60" />
            Change Password
          </p>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-body">New Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={pw.password}
                onChange={(e) => setPw((f) => ({ ...f, password: e.target.value }))}
                placeholder="At least 6 characters"
                className="w-full rounded-md border border-line px-3 py-2.5 pr-10 text-[13.5px] outline-none focus:border-ink"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-body/60 hover:text-ink"
              >
                {showPw ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-body">Confirm New Password</label>
            <input
              type={showPw ? "text" : "password"}
              value={pw.confirm}
              onChange={(e) => setPw((f) => ({ ...f, confirm: e.target.value }))}
              className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={changingPw || !pw.password}
              className="flex items-center justify-center gap-2 rounded-md border border-line px-8 py-3 text-[13.5px] font-extrabold text-ink transition-colors hover:border-ink/40 disabled:opacity-60"
            >
              {changingPw ? "Updating…" : "Update Password"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function TechnicianProfilePage() {
  return (
    <TechnicianGuard>
      <TechnicianLayout title="My Profile">
        <ProfileContent />
      </TechnicianLayout>
    </TechnicianGuard>
  );
}
