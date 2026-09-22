"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { uploadImage } from "@/lib/imagekit";
import {
  UsersIcon,
  CheckCircle,
  CameraIcon,
  AlertIcon,
} from "@/components/icons";

function initials(name, email) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }
  return email?.[0]?.toUpperCase() || "U";
}

const inputClass =
  "w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-yellow/15 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed shadow-2xs";

const EMPTY = {
  name: "",
  mobile: "",
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
    <div className="max-w-2xl space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-ink">Account Settings & Profile</h2>
          </div>
          <p className="text-xs sm:text-[13px] text-body mt-0.5">
            Manage your name and mobile number. Addresses and electrical setup details for each property
            are managed under{" "}
            <Link href="/account/properties" className="font-bold text-ink underline underline-offset-2">
              My Properties
            </Link>
            .
          </p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-300 bg-emerald-50/90 px-4 py-3 text-xs font-black text-emerald-900 shadow-2xs">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Your account profile has been saved successfully.</span>
        </div>
      )}

      {/* Profile Photo Card */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-r from-amber-500/[0.08] via-amber-100/[0.25] to-slate-50/60 p-5 sm:p-7 shadow-xs">
        {/* Subtle ambient lighting accent */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-amber-400/15 blur-2xl" />

        <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
          <div className="relative flex-none">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile?.name || "Profile photo"}
                className="h-20 w-20 sm:h-22 sm:w-22 rounded-3xl border-2 border-white object-cover shadow-md ring-4 ring-yellow/30"
              />
            ) : (
              <span className="grid h-20 w-20 sm:h-22 sm:w-22 place-items-center rounded-3xl bg-gradient-to-br from-yellow via-amber-400 to-yellow-dark text-2xl sm:text-3xl font-black text-ink shadow-md ring-4 ring-yellow/30">
                {initials(profile?.name, user?.email)}
              </span>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              aria-label="Change profile photo"
              className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-ink text-white shadow-md ring-2 ring-white transition-all hover:scale-110 hover:bg-slate-800 disabled:opacity-60"
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
            <h3 className="text-base sm:text-lg font-black text-ink">Profile Photo</h3>
            <p className="mt-1 text-xs text-body">
              Visible to your assigned technician and our support team. JPG or PNG, up to a few MB.
            </p>
            <div className="mt-3.5 flex flex-wrap justify-center gap-2.5 sm:justify-start">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300/90 bg-white px-4 py-2 text-xs font-black text-ink shadow-2xs transition-all hover:-translate-y-0.5 hover:border-ink hover:shadow-xs disabled:translate-y-0 disabled:opacity-60"
              >
                <CameraIcon className="h-3.5 w-3.5 text-slate-600" />
                <span>{uploadingPhoto ? "Uploading…" : "Change Photo"}</span>
              </button>
              {profile?.avatar_url && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:shadow-xs"
                >
                  Remove
                </button>
              )}
            </div>
            {photoError && (
              <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11.5px] font-semibold text-red-600 sm:justify-start">
                <AlertIcon className="h-3.5 w-3.5 flex-none" />
                <span>{photoError}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Info Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 md:p-8 shadow-xs space-y-6">
        <div className="flex items-start gap-3.5 border-b border-line/70 pb-4.5 sm:items-center">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-blue-50 text-blue-600 font-bold shadow-2xs ring-4 ring-blue-50/50">
            <UsersIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-base sm:text-[17px] font-black text-ink">Personal Contact Info</h3>
            <p className="text-xs text-body mt-0.5">Used for technician appointments and service invoices</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-extrabold text-ink">Full Name</label>
            <input value={form.name} onChange={set("name")} placeholder="Your full name" className={inputClass} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-extrabold text-ink">Email Address (Read-only)</label>
              <span className="text-[10.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                Account ID
              </span>
            </div>
            <input value={user?.email || ""} disabled className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-extrabold text-ink">Mobile / WhatsApp Contact</label>
            <input value={form.mobile} onChange={set("mobile")} placeholder="+91 98765 43210" className={inputClass} />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-yellow px-7 py-3 text-xs font-black text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md active:scale-[0.99] disabled:translate-y-0 disabled:opacity-60"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{saving ? "Saving Changes…" : "Save Personal Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
