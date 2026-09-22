"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { uploadImage } from "@/lib/imagekit";
import {
  AlertIcon,
  ArrowLeftIcon,
  BoltBadge,
  BuildingIcon,
  CalendarIcon,
  CameraIcon,
  CheckCircle,
  ChevronDown,
  ClockIcon,
  HomeIcon,
  InstallBadge,
  LightbulbIcon,
  PinIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  ShieldIcon,
  SparklesIcon,
  UploadIcon,
  WrenchIcon,
  XIcon,
} from "@/components/icons";

const DEFAULT_SERVICE_OPTIONS = [
  "Power Failure",
  "MCB Tripping",
  "Switch Problem",
  "Socket Problem",
  "Lighting",
  "Fan",
  "DB",
  "Wiring",
  "Earthing",
  "Other",
];

const SERVICE_DETAILS = {
  "Power Failure": "Complete blackout, phase drop, or main supply fault",
  "MCB Tripping": "Breaker trips repeatedly or won't stay ON",
  "Switch Problem": "Broken switch, sparking, or loose contact",
  "Socket Problem": "Burned pins, 16A power point, geyser/AC socket",
  "Lighting": "LED downlights, chandeliers, tube fixtures",
  "Fan": "Slow speed, regulator fault, or rattling noise",
  "DB": "Distribution board, isolator, main changeover switch",
  "Wiring": "Short circuits, burnt wire odor, concealed conduit wiring",
  "Earthing": "Mild current shocks on taps, body earthing, ground pit",
  "Other": "Custom electrical fittings, meters, or specialized work",
};

const TIME_SLOTS = [
  { label: "Morning", time: "10:00", range: "9 AM – 12 PM" },
  { label: "Afternoon", time: "14:00", range: "12 PM – 4 PM" },
  { label: "Evening", time: "17:00", range: "4 PM – 8 PM" },
];

function getServiceIcon(name) {
  const lower = (name || "").toLowerCase();
  if (lower.includes("power") || lower.includes("mcb") || lower.includes("tripping")) return BoltBadge;
  if (lower.includes("switch") || lower.includes("socket") || lower.includes("plug")) return InstallBadge;
  if (lower.includes("light")) return LightbulbIcon;
  if (lower.includes("fan")) return RefreshIcon;
  if (lower.includes("earth") || lower.includes("safety")) return ShieldIcon;
  if (lower.includes("db") || lower.includes("board")) return BuildingIcon;
  if (lower.includes("wire") || lower.includes("wiring")) return WrenchIcon;
  return SparklesIcon;
}

const inputClass =
  "w-full rounded-2xl border border-slate-200/90 bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 pl-10 sm:pl-11 text-xs sm:text-sm text-ink outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-yellow/15 shadow-2xs";
const plainInputClass =
  "w-full rounded-2xl border border-slate-200/90 bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-ink outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-yellow/15 shadow-2xs";

function Field({ icon: Icon, label, required, children }) {
  return (
    <div>
      <label className="mb-1 sm:mb-1.5 block text-[11px] sm:text-xs font-extrabold text-ink">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-slate-400" />}
        {children}
      </div>
    </div>
  );
}

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="sm:col-span-2 mt-1 sm:mt-2 flex items-center gap-2 border-t border-line/70 pt-3.5 sm:pt-4 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-muted">
      <Icon className="h-3.5 w-3.5 text-yellow-dark" />
      <span>{children}</span>
    </div>
  );
}

function SexyServiceSelect({ value, onChange, options, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const SelectedIcon = value ? getServiceIcon(value) : WrenchIcon;
  const selectedDesc = SERVICE_DETAILS[value] || "Standard dispatch available";

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group w-full rounded-2xl border bg-white p-2.5 sm:p-3.5 text-left transition-all shadow-2xs flex items-center justify-between gap-2.5 sm:gap-3 ${
          isOpen
            ? "border-amber-400 ring-4 ring-yellow/15 shadow-sm"
            : error
            ? "border-red-300 ring-4 ring-red-500/10"
            : "border-slate-200/90 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <span
            className={`grid h-9 w-9 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-xl transition-colors ${
              value
                ? "bg-yellow text-ink shadow-2xs font-bold"
                : "bg-amber-50 text-yellow-dark border border-amber-200/70"
            }`}
          >
            <SelectedIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <div className="min-w-0 flex-1">
            {value ? (
              <>
                <p className="text-xs sm:text-sm font-black text-ink leading-tight truncate">
                  {value}
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted truncate mt-0.5">{selectedDesc}</p>
              </>
            ) : (
              <>
                <p className="text-xs sm:text-sm font-bold text-slate-500">
                  Select a service category…
                </p>
                <p className="text-[10px] sm:text-[10.5px] text-slate-400 mt-0.5">
                  Choose the electrical fault or work needed
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-lg transition-transform duration-200 ${
              isOpen ? "rotate-180 bg-amber-100 text-amber-900" : "text-slate-400 group-hover:text-ink"
            }`}
          >
            <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
        </div>
      </button>

      {/* Popover Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-50 rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/98 backdrop-blur-xl p-2 sm:p-2.5 shadow-2xl ring-1 ring-black/5"
          >
            {/* Quick Search */}
            <div className="relative mb-1.5 sm:mb-2">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search issues (e.g. MCB, switch, wire, fan)..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 sm:py-2 pl-8 sm:pl-9 pr-3 text-xs text-ink placeholder:text-slate-400 outline-none focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-yellow/20"
              />
            </div>

            {/* Options List */}
            <div className="max-h-60 sm:max-h-72 overflow-y-auto space-y-1 pr-0.5 scrollbar-thin">
              {filteredOptions.length === 0 ? (
                <div className="p-3 sm:p-4 text-center text-xs text-muted">
                  No matching category found. Select <strong>Other</strong> below.
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const active = value === opt;
                  const Icon = getServiceIcon(opt);
                  const desc = SERVICE_DETAILS[opt];
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => {
                        onChange(opt);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`flex w-full items-center justify-between gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl p-2 sm:p-3 text-left transition-all ${
                        active
                          ? "bg-amber-50/90 border border-amber-300/80 text-amber-950 shadow-2xs"
                          : "hover:bg-slate-100/70 border border-transparent text-ink"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <span
                          className={`grid h-7 w-7 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-lg sm:rounded-xl transition-colors ${
                            active
                              ? "bg-yellow text-ink font-bold shadow-2xs"
                              : "bg-slate-100 text-slate-600 border border-slate-200/80"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-[13px] font-black leading-tight truncate">
                            {opt}
                          </p>
                          {desc && (
                            <p className="text-[9.5px] sm:text-[10.5px] text-muted truncate mt-0.5">{desc}</p>
                          )}
                        </div>
                      </div>
                      {active && (
                        <CheckCircle className="h-4 w-4 text-yellow-dark shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NewServiceRequestForm() {
  const { user, profile } = useCustomerAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPropertyId = searchParams.get("property");

  const [form, setForm] = useState({
    service_type: "",
    description: "",
    preferred_date: "",
    preferred_time: "",
    location: "",
    property_id: "",
  });

  const [customService, setCustomService] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState([]); // [{ file, preview, isVideo }]
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [properties, setProperties] = useState([]);
  const [serviceOptions, setServiceOptions] = useState(DEFAULT_SERVICE_OPTIONS);
  const [hasActiveAmc, setHasActiveAmc] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_PHOTOS = 5;
  const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: true });
      setProperties(data ?? []);

      const preselected = data?.find((p) => p.id === preselectedPropertyId);
      const def = preselected || data?.find((p) => p.is_default) || data?.[0];
      if (def) {
        setForm((f) => ({
          ...f,
          property_id: def.id,
          location: `${def.label} – ${def.address}${def.city ? `, ${def.city}` : ""}`,
        }));
      }

      const { data: amc } = await supabase
        .from("customer_amc")
        .select("id")
        .eq("customer_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      if (amc) setHasActiveAmc(true);
    })();
  }, [user, preselectedPropertyId]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("data")
        .eq("key", "service_categories")
        .maybeSingle();
      if (data?.data?.categories?.length > 0) {
        setServiceOptions(data.data.categories);
      }
    })();
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePropertySelect = (property) => {
    setForm((f) => ({
      ...f,
      property_id: property.id,
      location: `${property.label} – ${property.address}${property.city ? `, ${property.city}` : ""}`,
    }));
  };

  const handlePhotoFiles = (incomingFiles) => {
    const files = Array.from(incomingFiles || []);
    if (files.length === 0) return;
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      toast.error(`You can attach up to ${MAX_PHOTOS} files.`);
      return;
    }

    const oversized = [];
    const accepted = [];
    for (const file of files.slice(0, room)) {
      const isVideo = file.type.startsWith("video/");
      const limit = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > limit) {
        oversized.push(`${file.name} (max ${isVideo ? "50MB for videos" : "15MB for photos"})`);
      } else {
        accepted.push({ file, isVideo, preview: URL.createObjectURL(file) });
      }
    }

    if (accepted.length > 0) setPhotos((p) => [...p, ...accepted]);
    if (oversized.length > 0) toast.error(`Too large, skipped: ${oversized.join(", ")}`);
    if (files.length > room) toast.error(`Only ${MAX_PHOTOS} files allowed — considered the first ${room}.`);
  };

  const handlePhotoChange = (e) => {
    handlePhotoFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      handlePhotoFiles(e.dataTransfer.files);
    }
  };

  const removePhoto = (index) => {
    setPhotos((p) => p.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.service_type) {
      setError("Please select a service category.");
      toast.error("Please select a service category.");
      return;
    }

    if (form.service_type === "Other" && !customService.trim()) {
      setError("Please specify your custom problem or requirement.");
      toast.error("Please specify your custom problem.");
      return;
    }

    const finalServiceType =
      form.service_type === "Other" && customService.trim()
        ? customService.trim()
        : form.service_type;

    setError("");
    setSubmitting(true);
    try {
      let photo_urls = [];
      let video_urls = [];
      if (photos.length > 0) {
        setUploadingPhoto(true);
        const uploaded = await Promise.all(
          photos.map(async (p) => ({
            url: await uploadImage(p.file, "house-electric/service-requests"),
            isVideo: p.isVideo,
          }))
        );
        photo_urls = uploaded.filter((u) => !u.isVideo).map((u) => u.url);
        video_urls = uploaded.filter((u) => u.isVideo).map((u) => u.url);
        setUploadingPhoto(false);
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          ...form,
          service_type: finalServiceType,
          property_id: form.property_id || null,
          photo_url: photo_urls[0] || null,
          photo_urls,
          video_urls,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request.");

      toast.success("Service request submitted successfully!");
      router.replace("/account/requests");
    } catch (err) {
      setError(err.message || "Failed to submit request.");
      toast.error(err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
      setUploadingPhoto(false);
    }
  };

  const categoriesToRender = Array.from(
    new Set([
      ...serviceOptions.filter((c) => c !== "Other"),
      ...DEFAULT_SERVICE_OPTIONS.filter((c) => c !== "Other"),
      "Other",
    ])
  );

  return (
    <div className="max-w-3xl space-y-4 sm:space-y-6">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/account/requests"
          className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-black text-slate-700 shadow-2xs transition-all hover:border-ink hover:text-ink hover:shadow-xs mb-3"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Service Requests</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-3.5">
          <span className="grid h-11 w-11 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl bg-amber-50 border border-amber-200/80 text-yellow-dark shadow-2xs">
            <WrenchIcon className="h-5 w-5 sm:h-7 sm:w-7" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-ink">Raise a New Service Request</h2>
            <p className="text-[11.5px] sm:text-[13px] text-body mt-0.5 truncate">
              We'll assign a certified technician and keep you updated.
            </p>
          </div>
        </div>
      </div>

      {/* Assurance Status Bar (3-column responsive ribbon on mobile) */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-2 sm:p-3 shadow-2xs">
          <span className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-xl bg-amber-50 text-yellow-dark">
            <BoltBadge className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10.5px] sm:text-xs font-black text-ink leading-tight truncate">Rapid Dispatch</p>
            <p className="text-[9.5px] sm:text-[10.5px] text-muted hidden sm:block">Same-day for critical faults</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-2 sm:p-3 shadow-2xs">
          <span className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10.5px] sm:text-xs font-black text-ink leading-tight truncate">Certified Crew</p>
            <p className="text-[9.5px] sm:text-[10.5px] text-muted hidden sm:block">Background-checked</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-2 sm:p-3 shadow-2xs">
          <span className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600">
            <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10.5px] sm:text-xs font-black text-ink leading-tight truncate">Live Tracking</p>
            <p className="text-[9.5px] sm:text-[10.5px] text-muted hidden sm:block">Real-time SMS updates</p>
          </div>
        </div>
      </div>

      {/* Main Request Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-7 md:p-8 shadow-xs space-y-5 sm:space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line/70 pb-3 sm:pb-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 text-yellow-dark" />
            <h3 className="text-sm sm:text-base font-black text-ink">Request Details</h3>
          </div>
          {hasActiveAmc ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10.5px] sm:text-[11px] font-black text-emerald-800 shadow-2xs w-fit">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span>Active AMC · Free Visit Dispatch</span>
            </span>
          ) : (
            <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full w-fit">
              Standard Dispatch
            </span>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-700 shadow-2xs">
            <AlertIcon className="mt-0.5 h-4 w-4 flex-none" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3.5 sm:gap-4 sm:grid-cols-2">
          {/* Sexy Service Category Dropdown */}
          <div className="sm:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-muted">
                Service Category <span className="text-red-500">*</span>
              </label>
              <span className="text-[10.5px] sm:text-[11px] text-muted font-medium">Choose an issue below</span>
            </div>

            {/* Custom Luxury Dropdown */}
            <SexyServiceSelect
              value={form.service_type}
              onChange={(val) => {
                setForm((prev) => ({ ...prev, service_type: val }));
                setError("");
              }}
              options={categoriesToRender}
              error={Boolean(error && !form.service_type)}
            />

            {/* 1-Tap Quick Suggestion Pills */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-1">
              <span className="text-[10px] sm:text-[10.5px] font-extrabold uppercase text-muted tracking-wide mr-0.5">Popular:</span>
              {["Power Failure", "MCB Tripping", "Switch Problem", "Socket Problem", "Lighting"].map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => {
                    setForm((prev) => ({ ...prev, service_type: opt }));
                    setError("");
                  }}
                  className={`rounded-lg px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10.5px] sm:text-[11px] font-bold transition-all ${
                    form.service_type === opt
                      ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs font-extrabold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Custom problem input when "Other" is chosen */}
            {form.service_type === "Other" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-1.5"
              >
                <label className="mb-1 sm:mb-1.5 block text-[11px] sm:text-xs font-extrabold text-ink">
                  Specify Custom Problem / Requirement <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <WrenchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    value={customService}
                    onChange={(e) => setCustomService(e.target.value)}
                    placeholder="e.g. Inverter battery setup, Sub-meter, Chandelier..."
                    className={inputClass}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Problem / Description */}
          <div className="sm:col-span-2">
            <div className="mb-1 sm:mb-1.5 flex items-center justify-between">
              <label className="text-[11px] sm:text-xs font-extrabold text-ink">Problem / Description</label>
              <span className="text-[10px] sm:text-[10.5px] font-bold text-muted">Helps assign right tools</span>
            </div>
            <textarea
              rows={3}
              value={form.description}
              onChange={set("description")}
              placeholder="Briefly describe the issue (e.g. MCB tripping repeatedly in bedroom, switch sparking, inverter not charging)..."
              className={plainInputClass}
            />
          </div>

          {/* Property Selection or Location */}
          {properties.length > 0 ? (
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-muted">
                  Service Property / Location <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/account/properties/new"
                    className="text-[11px] sm:text-[11.5px] font-bold text-amber-700 hover:text-amber-800 underline underline-offset-2"
                  >
                    + Add new
                  </Link>
                  <Link
                    href="/account/properties"
                    className="text-[11px] sm:text-[11.5px] font-semibold text-muted hover:text-ink"
                  >
                    Manage
                  </Link>
                </div>
              </div>

              {/* Selectable Property Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {properties.map((p) => {
                  const isSelected = form.property_id === p.id;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => handlePropertySelect(p)}
                      className={`flex items-start gap-2.5 sm:gap-3 rounded-2xl border p-3 sm:p-3.5 text-left transition-all ${
                        isSelected
                          ? "border-amber-400 bg-amber-50/60 shadow-xs ring-2 ring-yellow/30"
                          : "border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl transition-colors ${
                          isSelected
                            ? "bg-yellow text-ink font-bold shadow-2xs"
                            : "bg-white text-slate-500 border border-slate-200"
                        }`}
                      >
                        {p.property_type === "Residential" ? (
                          <HomeIcon className="h-4 w-4" />
                        ) : (
                          <BuildingIcon className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-ink truncate">{p.label}</p>
                          {p.is_default && (
                            <span className="text-[9px] sm:text-[9.5px] font-black uppercase tracking-wider bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-md">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] sm:text-[11px] text-muted line-clamp-1 mt-0.5">{p.address}</p>
                      </div>
                      {isSelected && <CheckCircle className="h-4 w-4 text-yellow-dark shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="sm:col-span-2 space-y-1.5">
              <Field icon={PinIcon} label="Service Location" required>
                <input
                  required
                  value={form.location}
                  onChange={set("location")}
                  placeholder={profile?.address || "Where should the electrician visit? (Flat, Building, Street)"}
                  className={inputClass}
                />
              </Field>
              <Link
                href="/account/properties/new"
                className="inline-block text-[11px] sm:text-[11.5px] font-bold text-amber-700 hover:text-amber-800 underline underline-offset-2"
              >
                + Save this address as a property for 1-click booking
              </Link>
            </div>
          )}

          {/* Visit Scheduling */}
          <SectionLabel icon={CalendarIcon}>Schedule Preferred Visit Window</SectionLabel>

          <div>
            <Field icon={CalendarIcon} label="Preferred Date">
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={form.preferred_date}
                onChange={set("preferred_date")}
                className={inputClass}
              />
            </Field>
          </div>

          <div>
            <Field icon={ClockIcon} label="Preferred Time">
              <input
                type="time"
                value={form.preferred_time}
                onChange={set("preferred_time")}
                className={inputClass}
              />
            </Field>
          </div>

          {/* Quick slot chips */}
          <div className="sm:col-span-2 -mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-[10.5px] font-extrabold uppercase text-muted tracking-wide mr-0.5">Quick Slots:</span>
            {TIME_SLOTS.map((slot) => {
              const active = form.preferred_time === slot.time;
              return (
                <button
                  type="button"
                  key={slot.label}
                  onClick={() => setForm((prev) => ({ ...prev, preferred_time: slot.time }))}
                  className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                    active
                      ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs font-extrabold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                  }`}
                >
                  <span>{slot.label}</span>
                  <span className="hidden sm:inline font-normal text-slate-500"> ({slot.range})</span>
                </button>
              );
            })}
          </div>

          {/* Media Attachments */}
          <SectionLabel icon={CameraIcon}>Attach Photos / Videos</SectionLabel>

          <div className="sm:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] sm:text-xs font-extrabold text-ink">
                Inspection Evidence{" "}
                <span className="font-normal text-muted">
                  (optional, up to {MAX_PHOTOS} files · max 15MB/50MB)
                </span>
              </label>
              {photos.length > 0 && (
                <span className="text-[10.5px] sm:text-[11px] font-bold text-muted">
                  {photos.length} of {MAX_PHOTOS} attached
                </span>
              )}
            </div>

            {/* If no photos yet, show inviting dropzone */}
            {photos.length === 0 ? (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl sm:rounded-3xl border-2 border-dashed p-4 sm:p-6 text-center transition-all ${
                  isDragging
                    ? "border-amber-400 bg-amber-50/50"
                    : "border-slate-200/90 bg-slate-50/60 hover:border-amber-400 hover:bg-amber-50/30"
                }`}
              >
                <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-2xl bg-white border border-slate-200/90 text-yellow-dark shadow-2xs mb-1.5 sm:mb-2">
                  <CameraIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <p className="text-xs font-black text-ink">Upload Photos or Short Video Clips</p>
                <p className="text-[10px] sm:text-[11px] text-muted mt-0.5 max-w-sm">
                  Attach photos of your switchboard or fault area for instant diagnosis.
                </p>
                <span className="mt-2.5 sm:mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
                  <UploadIcon className="h-3.5 w-3.5 text-yellow-dark" />
                  <span>Browse Files</span>
                </span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            ) : (
              /* Thumbnails preview responsive grid (3-column on mobile) */
              <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                {photos.map((p, i) => (
                  <div key={p.preview} className="relative group/thumb aspect-square sm:aspect-auto sm:h-28 sm:w-28">
                    {p.isVideo ? (
                      <div className="relative h-full w-full rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-2xs bg-black">
                        <video src={p.preview} className="h-full w-full object-cover" muted />
                        <span className="absolute bottom-1 left-1 rounded bg-ink/80 px-1 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white">
                          Video
                        </span>
                      </div>
                    ) : (
                      <img
                        src={p.preview}
                        alt={`Selected upload preview ${i + 1}`}
                        className="h-full w-full rounded-xl sm:rounded-2xl border border-slate-200 object-cover shadow-2xs"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      aria-label="Remove file"
                      className="absolute -right-1.5 -top-1.5 sm:-right-2 sm:-top-2 grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-full bg-ink text-white shadow-md transition-transform hover:scale-110 active:scale-95"
                    >
                      <XIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={handleDrop}
                    className="flex aspect-square sm:aspect-auto sm:h-28 sm:w-28 cursor-pointer flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 text-slate-500 transition-all hover:border-amber-400 hover:bg-amber-50/30 hover:text-amber-900 shadow-2xs"
                  >
                    <CameraIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-[10px] sm:text-[11px] font-extrabold">Add More</span>
                    <span className="text-[8.5px] sm:text-[9.5px] text-muted">({MAX_PHOTOS - photos.length} left)</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Safety & Emergency Callout */}
          <div className="sm:col-span-2 rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3 sm:p-4 text-xs">
            <div className="flex items-start gap-2 sm:gap-2.5">
              <AlertIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] sm:text-[11.5px] leading-relaxed text-amber-950">
                <strong className="font-extrabold text-amber-950">Safety Notice: </strong>
                If you notice continuous sparking, smoke, or a burning smell, immediately switch off your Main Distribution Board (DB) breaker.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sm:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-line/70">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow px-6 py-3 sm:px-8 sm:py-3.5 text-xs sm:text-sm font-black text-ink shadow-sm transition-all hover:bg-yellow-dark hover:shadow-md active:scale-[0.99] disabled:opacity-60"
            >
              {!submitting && <PlusIcon className="h-4 w-4" />}
              <span>
                {uploadingPhoto
                  ? "Uploading Media…"
                  : submitting
                  ? "Submitting Request…"
                  : "Submit Service Request"}
              </span>
            </button>
            <Link
              href="/account/requests"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300/90 bg-white px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-bold text-body hover:border-ink hover:text-ink transition-colors shadow-2xs text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function NewServiceRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body shadow-2xs">
          Loading service request form…
        </div>
      }
    >
      <NewServiceRequestForm />
    </Suspense>
  );
}
