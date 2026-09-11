"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { uploadImage } from "@/lib/imagekit";
import { UsersIcon, BuildingIcon, CheckCircle, CameraIcon, AlertIcon } from "@/components/icons";

function initials(name, email) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }
  return email?.[0]?.toUpperCase() || "U";
}

const inputClass =
  "w-full rounded-2xl border border-line/90 bg-white px-4 py-3 text-sm text-ink outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15 disabled:bg-slate-100 disabled:text-muted disabled:hover:border-line/90";

const PROPERTY_TYPES = ["Residential", "Office", "Commercial", "Corporate / Institutional"];

const EMPTY = {
  name: "",
  mobile: "",
  address: "",
  city: "",
  state: "",
  property_type: "",
  property_size: "",
  electrical_setup_notes: "",
};

export default function MyProfilePage() {
  const { user, profile, updateProfile } = useCustomerAuth();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        mobile: profile.mobile || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        property_type: profile.property_type || "",
        property_size: profile.property_size || "",
        electrical_setup_notes: profile.electrical_setup_notes || "",
      });
    }
  }, [profile]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePhotoUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setPhotoError("");
    setUploadingPhoto(true);
    try {
      const url = await uploadImage(file, "house-electric/customer-avatars");
      await updateProfile({ avatar_url: url });
      toast.success("Profile photo updated");
    } catch (err) {
      setPhotoError(err.message || "Failed to upload photo.");
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoError("");
    await updateProfile({ avatar_url: null });
    toast.success("Profile photo removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile(form);
      setSaved(true);
      toast.success("Profile saved successfully");
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-black text-ink">Account Settings & Profile</h2>
        <p className="text-xs text-body">Manage your contact information and electrical setup preferences</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-black text-emerald-800 shadow-xs">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          Your account profile has been saved successfully.
        </div>
      )}

      {/* Profile Photo Card */}
      <div className="relative overflow-hidden rounded-3xl border border-line/80 bg-gradient-to-br from-white via-amber-50/20 to-white p-6 shadow-sm md:p-8">
        <div className="glow-blob right-[-10%] top-[-60%] h-[160px] w-[160px] bg-yellow/20 opacity-50 blur-[70px]" />
        <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
          <div className="relative flex-none">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile?.name || "Profile photo"}
                className="h-20 w-20 rounded-3xl border-2 border-white object-cover shadow-lg ring-2 ring-yellow/40"
              />
            ) : (
              <span className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-yellow to-amber-400 text-2xl font-black text-ink shadow-lg ring-2 ring-yellow/40">
                {initials(profile?.name, user?.email)}
              </span>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              aria-label="Change profile photo"
              className="absolute -bottom-1.5 -right-1.5 grid h-8 w-8 place-items-center rounded-full bg-ink text-white shadow-md ring-2 ring-white transition-transform hover:scale-110 disabled:opacity-60"
            >
              <CameraIcon className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-extrabold text-ink">Profile Photo</h3>
            <p className="text-xs text-body">
              Visible to your assigned technician and our support team. JPG or PNG, up to a few MB.
            </p>
            <div className="mt-2.5 flex flex-wrap justify-center gap-2 sm:justify-start">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="rounded-xl border border-line bg-white px-4 py-2 text-xs font-black text-ink shadow-2xs transition-all hover:-translate-y-0.5 hover:border-ink hover:shadow-md disabled:translate-y-0 disabled:opacity-60"
              >
                {uploadingPhoto ? "Uploading…" : "Change Photo"}
              </button>
              {profile?.avatar_url && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="rounded-xl border border-line bg-white px-4 py-2 text-xs font-bold text-red-500 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:shadow-md"
                >
                  Remove
                </button>
              )}
            </div>
            {photoError && (
              <p className="mt-2 flex items-center justify-center gap-1.5 text-[11.5px] font-semibold text-red-600 sm:justify-start">
                <AlertIcon className="h-3.5 w-3.5 flex-none" />
                {photoError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Info Card */}
      <div className="rounded-3xl border border-line/80 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-start gap-3 border-b border-line/70 pb-4 sm:items-center">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-rose-50 text-rose-600 font-bold shadow-sm ring-4 ring-white">
            <UsersIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-ink">Personal Contact Info</h3>
            <p className="text-xs text-body">Used for technician appointments and service invoices</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-extrabold text-ink">Full Name</label>
            <input value={form.name} onChange={set("name")} placeholder="Your full name" className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-extrabold text-ink">Email Address (Read-only)</label>
            <input value={user?.email || ""} disabled className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-extrabold text-ink">Mobile / WhatsApp Contact</label>
            <input value={form.mobile} onChange={set("mobile")} placeholder="+91 98765 43210" className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-extrabold text-ink">Default Service Address</label>
            <textarea rows={3} value={form.address} onChange={set("address")} placeholder="Flat/House No., Building, Street, Area..." className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-extrabold text-ink">City</label>
              <input value={form.city} onChange={set("city")} placeholder="City" className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-extrabold text-ink">State</label>
              <input value={form.state} onChange={set("state")} placeholder="State" className={inputClass} />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-yellow px-7 py-3 text-xs font-black text-ink shadow-md transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-lg disabled:translate-y-0 disabled:opacity-60"
          >
            <CheckCircle className="h-4 w-4" />
            {saving ? "Saving Changes…" : "Save Personal Profile"}
          </button>
        </form>
      </div>

      {/* Property Setup Details Card */}
      <div className="rounded-3xl border border-line/80 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-start gap-3 border-b border-line/70 pb-4 sm:items-center">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-amber-50 text-amber-600 font-bold shadow-sm ring-4 ring-white">
            <BuildingIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-ink">Property & Electrical Setup</h3>
            <p className="text-xs text-body">Helps electricians arrive with the right tools and materials</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-extrabold text-ink">Property Category</label>
            <select value={form.property_type} onChange={set("property_type")} className={inputClass}>
              <option value="">Select property type</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-extrabold text-ink">Approximate Area / Size</label>
            <input
              value={form.property_size}
              onChange={set("property_size")}
              placeholder="e.g. 1,500 sq. ft., 3BHK Apartment, 4-storey commercial office"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-extrabold text-ink">Electrical Notes & Panel Setup</label>
            <textarea
              rows={3}
              value={form.electrical_setup_notes}
              onChange={set("electrical_setup_notes")}
              placeholder="e.g. 3-phase meter connection, Havells MCB panel outdoors, inverter wiring setup..."
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-yellow px-7 py-3 text-xs font-black text-ink shadow-md transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-lg disabled:translate-y-0 disabled:opacity-60"
          >
            <CheckCircle className="h-4 w-4" />
            {saving ? "Saving Setup…" : "Save Property Details"}
          </button>
        </form>
      </div>
    </div>
  );
}

