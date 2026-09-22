"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage, imagekitConfigured } from "@/lib/imagekit";
import {
  ArrowLeftIcon,
  CameraIcon,
  CheckCircle,
  CopyIcon,
  EditIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
  WhatsAppIcon,
  WrenchIcon,
  XIcon,
} from "@/components/icons";

function CountUp({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (typeof value !== "number") return;
    let frame;
    const duration = 700;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return typeof value === "number" ? display : value;
}

function StatCard({ label, value, icon: Icon, cls, glow, accent, delay = 0 }) {
  return (
    <div
      style={{ animationDelay: `${delay}s` }}
      className="card-hover group relative isolate overflow-hidden rounded-2xl border border-line bg-white p-4 opacity-0 animate-fade-up"
    >
      <span className={`absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r ${accent} transition-transform duration-300 ease-out group-hover:scale-x-100`} />
      <span className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${glow}`} />
      <div className="relative flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <p className="text-[11.5px] font-semibold text-body">{label}</p>
          <b className="mt-1 block text-[17px] font-black leading-none tabular-nums text-ink sm:text-[24px]">
            <CountUp value={value} />
          </b>
        </div>
        <span className={`grid h-9 w-9 flex-none place-items-center rounded-xl shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${cls}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

const EMPTY = { name: "", phone: "", email: "", specialization: "", active: true, photo_url: "" };

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
  const [loginFor, setLoginFor] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [creatingLogin, setCreatingLogin] = useState(false);
  const [createdLogin, setCreatedLogin] = useState(null);

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

  const openLoginPrompt = (t) => {
    setLoginFor(t);
    setLoginForm({ email: t.email || "", password: "" });
    setCreatedLogin(null);
  };

  const closeLoginModal = () => {
    setLoginFor(null);
    setCreatedLogin(null);
  };

  const createLogin = async (e) => {
    e.preventDefault();
    setCreatingLogin(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/create-technician-login", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ technicianId: loginFor.id, email: loginForm.email, password: loginForm.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create login.");
      toast.success(`Login created for ${loginFor.name}`);
      setCreatedLogin({
        name: loginFor.name,
        phone: loginFor.phone,
        email: loginForm.email,
        password: loginForm.password,
        url: `${window.location.origin}/technician/login`,
      });
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to create login.");
    } finally {
      setCreatingLogin(false);
    }
  };

  const shareText = (l) =>
    `Hi ${l.name}, here are your House Electric technician login details:\n\nLogin: ${l.url}\nEmail: ${l.email}\nPassword: ${l.password}`;

  const copyLoginDetails = async (l) => {
    try {
      await navigator.clipboard.writeText(shareText(l));
      toast.success("Login details copied");
    } catch {
      toast.error("Could not copy — please copy manually.");
    }
  };

  return (
    <AdminGuard>
      <AdminLayout title="Technicians">
        {form ? (
          <>
            <button
              onClick={() => setForm(null)}
              className="mb-4 flex items-center gap-1.5 text-[13px] font-semibold text-body hover:text-ink"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              Back to Technicians
            </button>

            <form onSubmit={save} className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-line bg-white shadow-[0_20px_60px_-25px_rgba(20,20,20,0.25)]">
              <div className="relative overflow-hidden bg-gradient-to-br from-ink to-[#2a2a2a] p-7 text-white">
                <span className="glow-blob -right-10 -top-14 h-40 w-40 bg-yellow/20" />
                <span className="glow-blob -bottom-16 left-1/3 h-32 w-32 bg-white/10" />
                <div className="relative flex items-center gap-4">
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
                    className="group relative grid h-16 w-16 flex-none place-items-center overflow-hidden rounded-full bg-white/15 shadow-lg ring-2 ring-white/30 transition-transform hover:scale-105"
                  >
                    {form.photo_url ? (
                      <img src={form.photo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-7 w-7" />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <CameraIcon className="h-5 w-5" />
                    </span>
                  </button>
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow/30 bg-yellow/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow">
                      <SparklesIcon className="h-2.5 w-2.5" />
                      {form.id ? "Edit" : "New"}
                    </span>
                    <p className="mt-1.5 text-[18px] font-extrabold">{form.id ? "Edit Technician" : "Add Technician"}</p>
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
                {!imagekitConfigured && <p className="relative mt-3 text-[11px] font-bold text-red-300">⚠ ImageKit not configured</p>}
              </div>
              <div className="space-y-4 p-7">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                      <UserIcon className="h-3.5 w-3.5 text-body/60" />
                      Name *
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full rounded-xl border border-line/90 px-3.5 py-2.5 text-[13.5px] outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15"
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
                      className="w-full rounded-xl border border-line/90 px-3.5 py-2.5 text-[13.5px] outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                    <MailIcon className="h-3.5 w-3.5 text-body/60" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email || ""}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="Used for their technician portal login"
                    className="w-full rounded-xl border border-line/90 px-3.5 py-2.5 text-[13.5px] outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15"
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
                    className="w-full rounded-xl border border-line/90 px-3.5 py-2.5 text-[13.5px] outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                  className="flex w-full items-center justify-between rounded-xl border border-line/90 bg-cream/40 px-4 py-3.5 transition-colors hover:border-ink/30"
                >
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                    <CheckCircle className={`h-4 w-4 ${form.active ? "text-emerald-500" : "text-body/30"}`} />
                    Available for assignment
                  </span>
                  <span className={`relative inline-flex h-5 w-9 flex-none items-center rounded-full transition-colors ${form.active ? "bg-emerald-500" : "bg-line"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${form.active ? "translate-x-4" : "translate-x-0.5"}`} />
                  </span>
                </button>
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-yellow py-3 text-[13.5px] font-extrabold text-ink shadow-[0_10px_28px_-8px_rgba(242,176,30,0.7)] transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_14px_32px_-8px_rgba(242,176,30,0.85)] disabled:translate-y-0 disabled:opacity-60"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {saving ? "Saving…" : "Save Technician"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(null)}
                    className="rounded-xl border border-line px-6 py-3 text-[13.5px] font-semibold text-body transition-colors hover:border-ink/40"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="relative mb-6 overflow-hidden rounded-2xl bg-ink px-6 py-7 sm:px-8 sm:py-8">
              <span className="glow-blob -right-14 -top-20 h-56 w-56 bg-yellow/25" />
              <span className="glow-blob -bottom-24 -left-10 h-48 w-48 bg-yellow/10" style={{ animationDelay: "2.2s" }} />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow/30 bg-yellow/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-yellow">
                  <SparklesIcon className="h-3 w-3" /> Team
                </span>
                <h2 className="mt-3 text-[21px] font-extrabold text-white sm:text-[25px]">Technicians</h2>
                <p className="mt-1.5 max-w-[56ch] text-[13.5px] text-white/55">Manage your field team, their availability and portal access.</p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Total Technicians"
                value={technicians.length}
                icon={UsersIcon}
                cls="bg-ink text-yellow"
                glow="bg-yellow"
                accent="from-yellow to-amber-500"
                delay={0}
              />
              <StatCard
                label="Available"
                value={technicians.filter((t) => t.active).length}
                icon={CheckCircle}
                cls="bg-emerald-50 text-emerald-600"
                glow="bg-emerald-400"
                accent="from-emerald-400 to-teal-500"
                delay={0.06}
              />
              <StatCard
                label="Unavailable"
                value={technicians.filter((t) => !t.active).length}
                icon={XIcon}
                cls="bg-gray-100 text-gray-500"
                glow="bg-gray-300"
                accent="from-gray-400 to-gray-500"
                delay={0.12}
              />
              <StatCard
                label="Portal Login Active"
                value={technicians.filter((t) => t.user_id).length}
                icon={LockIcon}
                cls="bg-blue-50 text-blue-600"
                glow="bg-blue-400"
                accent="from-blue-400 to-indigo-500"
                delay={0.18}
              />
            </div>

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
                        {t.user_id ? (
                          <span className="flex items-center gap-1 text-[12px] font-bold text-emerald-600">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Portal Login Active
                          </span>
                        ) : (
                          <button
                            onClick={() => openLoginPrompt(t)}
                            className="flex items-center gap-1 text-[13px] font-semibold text-yellow-dark hover:underline"
                          >
                            <LockIcon className="h-3.5 w-3.5" />
                            Create Login
                          </button>
                        )}
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

        {loginFor && !createdLogin && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4" onClick={closeLoginModal}>
            <form
              onSubmit={createLogin}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-line bg-cream/40 px-5 py-4">
                <p className="text-[14px] font-extrabold text-ink">Create Login for {loginFor.name}</p>
                <button type="button" onClick={closeLoginModal} className="text-body hover:text-ink">
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                    <MailIcon className="h-3.5 w-3.5 text-body/60" />
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                    <LockIcon className="h-3.5 w-3.5 text-body/60" />
                    Password *
                  </label>
                  <input
                    required
                    minLength={6}
                    type="text"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="At least 6 characters"
                    className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                  />
                  <p className="mt-1 text-[11px] text-body">Share this password with the technician — they'll use it to sign in at /technician/login.</p>
                </div>
                <button
                  type="submit"
                  disabled={creatingLogin}
                  className="w-full rounded-md bg-yellow py-3 text-[13.5px] font-extrabold text-ink transition-all hover:bg-yellow-dark disabled:opacity-60"
                >
                  {creatingLogin ? "Creating…" : "Create Login"}
                </button>
              </div>
            </form>
          </div>
        )}

        {createdLogin && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4" onClick={closeLoginModal}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-line bg-emerald-50 px-5 py-4">
                <p className="flex items-center gap-2 text-[14px] font-extrabold text-emerald-800">
                  <CheckCircle className="h-4.5 w-4.5" />
                  Login Ready
                </p>
                <button type="button" onClick={closeLoginModal} className="text-body hover:text-ink">
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4 p-5">
                <p className="text-[12.5px] text-body">
                  Send these details to <b className="text-ink">{createdLogin.name}</b> so they can sign in.
                </p>
                <div className="space-y-2.5 rounded-xl border border-line bg-cream/40 p-4 text-[13px]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-body">Login URL</p>
                    <p className="break-all font-semibold text-ink">{createdLogin.url}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-body">Email</p>
                    <p className="font-semibold text-ink">{createdLogin.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-body">Password</p>
                    <p className="font-semibold text-ink">{createdLogin.password}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {createdLogin.phone ? (
                    <a
                      href={`https://wa.me/91${createdLogin.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(shareText(createdLogin))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-md bg-emerald-500 py-3 text-[13px] font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      WhatsApp
                    </a>
                  ) : (
                    <span className="flex items-center justify-center rounded-md border border-line py-3 text-[12px] font-semibold text-body/50">
                      No phone on file
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => copyLoginDetails(createdLogin)}
                    className="flex items-center justify-center gap-2 rounded-md border border-line py-3 text-[13px] font-extrabold text-ink transition-colors hover:border-ink/40"
                  >
                    <CopyIcon className="h-4 w-4" />
                    Copy
                  </button>
                </div>

                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="w-full rounded-md bg-yellow py-3 text-[13.5px] font-extrabold text-ink transition-all hover:bg-yellow-dark"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
