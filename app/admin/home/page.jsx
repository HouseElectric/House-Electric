"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { FormSection, Field, inputClass, ImageUploadField } from "@/components/admin/FormKit";
import { supabase } from "@/lib/supabase";
import { uploadImage, cloudinaryConfigured } from "@/lib/cloudinary";
import { DEFAULT_HOME, deepMerge } from "@/contexts/HomeContentContext";
import {
  AwardIcon,
  BuildingIcon,
  CheckCircle,
  ExternalLinkIcon,
  UsersIcon,
} from "@/components/icons";

const ICON_OPTIONS = [
  { value: "users", label: "Users", icon: UsersIcon },
  { value: "check", label: "Check", icon: CheckCircle },
  { value: "building", label: "Building", icon: BuildingIcon },
  { value: "award", label: "Award", icon: AwardIcon },
];

const TABS = [
  { key: "hero", label: "1. Hero" },
  { key: "services", label: "2. Services" },
  { key: "stats", label: "3. Stats" },
  { key: "process", label: "4. Process" },
  { key: "healthCheck", label: "5. Health Check" },
  { key: "whyChoose", label: "6. Why Choose" },
  { key: "customers", label: "7. Customers" },
  { key: "testimonials", label: "8. Testimonials" },
];

function LinkOutTab({ title, desc, href, label }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-8 text-center">
      <h4 className="mb-2 text-[15px] font-extrabold text-ink">{title}</h4>
      <p className="mx-auto mb-5 max-w-[50ch] text-[13.5px] text-body">{desc}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-md bg-yellow px-5 py-3 text-[13.5px] font-bold text-ink hover:bg-yellow-dark"
      >
        {label}
        <ExternalLinkIcon className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export default function AdminHomePage() {
  const [tab, setTab] = useState("hero");
  const [data, setData] = useState(DEFAULT_HOME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingSlide, setUploadingSlide] = useState(null);
  const [uploadingField, setUploadingField] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: row } = await supabase.from("site_settings").select("data").eq("key", "home").maybeSingle();
      if (row?.data) setData((d) => deepMerge(d, row.data));
      setLoading(false);
    })();
  }, []);

  const set = (section, next) => setData((d) => ({ ...d, [section]: next }));
  const setField = (section, key, value) => setData((d) => ({ ...d, [section]: { ...d[section], [key]: value } }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert([{ key: "home", data, updated_at: new Date().toISOString() }]);
    setSaving(false);
    if (error) alert(error.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  // ---------- Hero slide helpers ----------
  const updateSlide = (index, next) =>
    set("heroSlides", data.heroSlides.map((s, i) => (i === index ? next : s)));

  const uploadSlideImage = async (index, file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploadingSlide(index);
    try {
      const url = await uploadImage(file, "house-electric/home");
      updateSlide(index, { ...data.heroSlides[index], image: url });
    } catch (err) {
      alert(err.message);
    }
    setUploadingSlide(null);
  };

  // ---------- single section-image helpers ----------
  const uploadStatsImage = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploadingField("statsImage");
    try {
      const url = await uploadImage(file, "house-electric/home");
      set("statsImage", url);
    } catch (err) {
      alert(err.message);
    }
    setUploadingField(null);
  };

  const uploadSectionImage = async (section, key, file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const fieldId = `${section}.${key}`;
    setUploadingField(fieldId);
    try {
      const url = await uploadImage(file, "house-electric/home");
      setField(section, key, url);
    } catch (err) {
      alert(err.message);
    }
    setUploadingField(null);
  };

  const uploadSpaceImage = async (index, file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const fieldId = `space.${index}`;
    setUploadingField(fieldId);
    try {
      const url = await uploadImage(file, "house-electric/home");
      updateItem("customers", "spaces", index, "image", url);
    } catch (err) {
      alert(err.message);
    }
    setUploadingField(null);
  };

  // ---------- list-item helpers (steps / trust / features / spaces) ----------
  const updateItem = (section, listKey, index, key, value) =>
    setData((d) => ({
      ...d,
      [section]: {
        ...d[section],
        [listKey]: d[section][listKey].map((item, i) => (i === index ? { ...item, [key]: value } : item)),
      },
    }));

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout title="Home Page">
          <div className="rounded-2xl border border-line bg-white p-12 text-center text-[13.5px] text-body">
            Loading...
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminLayout title="Home Page">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-[65ch] text-[13.5px] text-body">
            Every section of{" "}
            <a href="/" target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline">
              the homepage
            </a>
            , in the order it appears on the page. Switch tabs, edit, then save.
          </p>
          <div className="flex items-center gap-3">
            {saved && <span className="text-[13px] font-semibold text-emerald-600">Saved!</span>}
            <button
              onClick={save}
              disabled={saving}
              className="whitespace-nowrap rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink hover:bg-yellow-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-1.5 overflow-x-auto rounded-xl border border-line bg-white p-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                tab === t.key ? "bg-ink text-white" : "text-body hover:bg-cream"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {!cloudinaryConfigured && (
          <p className="mb-4 text-[12px] font-bold text-red-500">⚠ Cloudinary not configured — photo uploads will fail</p>
        )}

        {/* ---------------- HERO ---------------- */}
        {tab === "hero" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {data.heroSlides.map((slide, i) => (
              <FormSection key={i} title={`Slide ${i + 1}`}>
                <SlideFields
                  slide={slide}
                  index={i}
                  onChange={updateSlide}
                  onUpload={uploadSlideImage}
                  uploading={uploadingSlide === i}
                />
              </FormSection>
            ))}
          </div>
        )}

        {/* ---------------- SERVICES (link out) ---------------- */}
        {tab === "services" && (
          <LinkOutTab
            title="Services Grid"
            desc="The 6 service cards (with photos & pricing) shown right after the hero are managed from their own dedicated page — add, edit, reorder or hide services there."
            href="/admin/services"
            label="Go to Services & Pricing"
          />
        )}

        {/* ---------------- STATS ---------------- */}
        {tab === "stats" && (
          <div className="space-y-5">
            <FormSection title="Background Photo" hint="Shown behind the stats counter band.">
              <ImageUploadField
                value={data.statsImage}
                uploading={uploadingField === "statsImage"}
                onUpload={uploadStatsImage}
                aspect="aspect-[21/9]"
              />
            </FormSection>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.stats.map((stat, i) => (
              <FormSection key={i} title={`Stat ${i + 1}`}>
                <Field label="Icon">
                  <div className="grid grid-cols-4 gap-2">
                    {ICON_OPTIONS.map((o) => {
                      const OptIcon = o.icon;
                      const active = stat.icon === o.value;
                      return (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => set("stats", data.stats.map((s, idx) => (idx === i ? { ...s, icon: o.value } : s)))}
                          className={`grid place-items-center rounded-lg border py-2 transition-colors ${
                            active ? "border-ink bg-cream text-ink" : "border-line text-body hover:border-ink/40"
                          }`}
                        >
                          <OptIcon className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <Field label="Value">
                  <input
                    type="number"
                    value={stat.to}
                    onChange={(e) =>
                      set("stats", data.stats.map((s, idx) => (idx === i ? { ...s, to: Number(e.target.value) } : s)))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Suffix (e.g. + or %)">
                  <input
                    value={stat.suffix}
                    onChange={(e) => set("stats", data.stats.map((s, idx) => (idx === i ? { ...s, suffix: e.target.value } : s)))}
                    className={inputClass}
                  />
                </Field>
                <Field label="Label">
                  <input
                    value={stat.label}
                    onChange={(e) => set("stats", data.stats.map((s, idx) => (idx === i ? { ...s, label: e.target.value } : s)))}
                    className={inputClass}
                  />
                </Field>
              </FormSection>
            ))}
            </div>
          </div>
        )}

        {/* ---------------- PROCESS ---------------- */}
        {tab === "process" && (
          <div className="space-y-5">
            <FormSection title="Section Heading">
              <ImageUploadField
                label="Section Photo"
                value={data.process.image}
                uploading={uploadingField === "process.image"}
                onUpload={(file) => uploadSectionImage("process", "image", file)}
                aspect="aspect-[4/4.2]"
              />
              <Field label="Eyebrow">
                <input value={data.process.eyebrow} onChange={(e) => setField("process", "eyebrow", e.target.value)} className={inputClass} />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Title — Line 1">
                  <input value={data.process.title1} onChange={(e) => setField("process", "title1", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Title — Line 2">
                  <input value={data.process.title2} onChange={(e) => setField("process", "title2", e.target.value)} className={inputClass} />
                </Field>
              </div>
              <Field label="Subtitle">
                <textarea value={data.process.subtitle} onChange={(e) => setField("process", "subtitle", e.target.value)} rows={2} className={inputClass} />
              </Field>
            </FormSection>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {data.process.steps.map((step, i) => (
                <FormSection key={i} title={`Step ${i + 1}`}>
                  <Field label="Title">
                    <input value={step.title} onChange={(e) => updateItem("process", "steps", i, "title", e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Description">
                    <textarea value={step.desc} onChange={(e) => updateItem("process", "steps", i, "desc", e.target.value)} rows={2} className={inputClass} />
                  </Field>
                </FormSection>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- HEALTH CHECK ---------------- */}
        {tab === "healthCheck" && (
          <div className="space-y-5">
            <FormSection title="Section Content">
              <ImageUploadField
                label="Section Photo"
                value={data.healthCheck.image}
                uploading={uploadingField === "healthCheck.image"}
                onUpload={(file) => uploadSectionImage("healthCheck", "image", file)}
                aspect="aspect-[4/3.4]"
              />
              <Field label="Eyebrow">
                <input value={data.healthCheck.eyebrow} onChange={(e) => setField("healthCheck", "eyebrow", e.target.value)} className={inputClass} />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Title (plain part)">
                  <input value={data.healthCheck.titlePlain} onChange={(e) => setField("healthCheck", "titlePlain", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Title (highlighted part)">
                  <input value={data.healthCheck.titleHighlight} onChange={(e) => setField("healthCheck", "titleHighlight", e.target.value)} className={inputClass} />
                </Field>
              </div>
              <Field label="Subtitle">
                <textarea value={data.healthCheck.subtitle} onChange={(e) => setField("healthCheck", "subtitle", e.target.value)} rows={2} className={inputClass} />
              </Field>
              <Field label="Button Label">
                <input value={data.healthCheck.buttonLabel} onChange={(e) => setField("healthCheck", "buttonLabel", e.target.value)} className={inputClass} />
              </Field>
            </FormSection>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {data.healthCheck.trust.map((t, i) => (
                <FormSection key={i} title={`Trust Badge ${i + 1}`}>
                  <Field label="Label">
                    <input value={t.label} onChange={(e) => updateItem("healthCheck", "trust", i, "label", e.target.value)} className={inputClass} />
                  </Field>
                </FormSection>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- WHY CHOOSE ---------------- */}
        {tab === "whyChoose" && (
          <div className="space-y-5">
            <FormSection title="Section Heading">
              <Field label="Eyebrow">
                <input value={data.whyChoose.eyebrow} onChange={(e) => setField("whyChoose", "eyebrow", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Title">
                <input value={data.whyChoose.title} onChange={(e) => setField("whyChoose", "title", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Subtitle">
                <textarea value={data.whyChoose.subtitle} onChange={(e) => setField("whyChoose", "subtitle", e.target.value)} rows={2} className={inputClass} />
              </Field>
            </FormSection>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {data.whyChoose.features.map((f, i) => (
                <FormSection key={i} title={`Feature ${i + 1}`}>
                  <Field label="Title">
                    <input value={f.title} onChange={(e) => updateItem("whyChoose", "features", i, "title", e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Description">
                    <textarea value={f.desc} onChange={(e) => updateItem("whyChoose", "features", i, "desc", e.target.value)} rows={2} className={inputClass} />
                  </Field>
                </FormSection>
              ))}
            </div>

            <FormSection title="Promo Card (right side image card)">
              <ImageUploadField
                label="Promo Photo"
                value={data.whyChoose.promoImage}
                uploading={uploadingField === "whyChoose.promoImage"}
                onUpload={(file) => uploadSectionImage("whyChoose", "promoImage", file)}
                aspect="aspect-[4/3]"
              />
              <Field label="Title">
                <input value={data.whyChoose.promoTitle} onChange={(e) => setField("whyChoose", "promoTitle", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Button Label">
                <input value={data.whyChoose.promoButtonLabel} onChange={(e) => setField("whyChoose", "promoButtonLabel", e.target.value)} className={inputClass} />
              </Field>
            </FormSection>
          </div>
        )}

        {/* ---------------- CUSTOMERS ---------------- */}
        {tab === "customers" && (
          <div className="space-y-5">
            <FormSection title="Section Heading">
              <Field label="Eyebrow">
                <input value={data.customers.eyebrow} onChange={(e) => setField("customers", "eyebrow", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Title">
                <input value={data.customers.title} onChange={(e) => setField("customers", "title", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Subtitle">
                <textarea value={data.customers.subtitle} onChange={(e) => setField("customers", "subtitle", e.target.value)} rows={2} className={inputClass} />
              </Field>
            </FormSection>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {data.customers.spaces.map((s, i) => (
                <FormSection key={i} title={["Residential", "Commercial", "Corporate"][i] || `Space ${i + 1}`}>
                  <ImageUploadField
                    label="Photo"
                    value={s.image}
                    uploading={uploadingField === `space.${i}`}
                    onUpload={(file) => uploadSpaceImage(i, file)}
                    aspect="aspect-[16/10]"
                  />
                  <Field label="Title">
                    <input value={s.title} onChange={(e) => updateItem("customers", "spaces", i, "title", e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Description">
                    <textarea value={s.desc} onChange={(e) => updateItem("customers", "spaces", i, "desc", e.target.value)} rows={2} className={inputClass} />
                  </Field>
                </FormSection>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- TESTIMONIALS (link out) ---------------- */}
        {tab === "testimonials" && (
          <LinkOutTab
            title="Testimonials Carousel"
            desc="Customer reviews shown near the bottom of the homepage are managed from their own dedicated page — add, edit, publish/hide or delete testimonials there."
            href="/admin/testimonials"
            label="Go to Testimonials"
          />
        )}

        <button
          onClick={save}
          disabled={saving}
          className="mt-6 w-full rounded-md bg-yellow py-3.5 text-[14.5px] font-bold text-ink hover:bg-yellow-dark disabled:opacity-60 lg:w-auto lg:px-10"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </AdminLayout>
    </AdminGuard>
  );
}

function SlideFields({ slide, index, onChange, onUpload, uploading }) {
  const fileInputRef = useRef(null);
  const set = (k, v) => onChange(index, { ...slide, [k]: v });

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onUpload(index, e.target.files[0])}
      />
      <div className="relative">
        <img src={slide.image} alt="" className="aspect-square w-full rounded-lg border border-line object-cover" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute right-2 top-2 rounded-md bg-black/70 px-2.5 py-1.5 text-[11px] font-bold text-white"
        >
          {uploading ? "Uploading…" : "Replace Photo"}
        </button>
      </div>

      <Field label="Eyebrow">
        <input value={slide.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} className={inputClass} />
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Title — Line 1">
          <input value={slide.titleLine1} onChange={(e) => set("titleLine1", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Title — Line 2">
          <input value={slide.titleLine2} onChange={(e) => set("titleLine2", e.target.value)} className={inputClass} />
        </Field>
      </div>
      <Field label="Title — Highlighted Phrase">
        <input value={slide.titleHighlight} onChange={(e) => set("titleHighlight", e.target.value)} className={inputClass} />
      </Field>

      <Field label="Subtitle">
        <textarea value={slide.subtitle} onChange={(e) => set("subtitle", e.target.value)} rows={2} className={inputClass} />
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Primary Button Label">
          <input value={slide.primaryLabel} onChange={(e) => set("primaryLabel", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Primary Button Link">
          <input value={slide.primaryHref} onChange={(e) => set("primaryHref", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Secondary Button Label">
          <input value={slide.secondaryLabel} onChange={(e) => set("secondaryLabel", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Secondary Button Link">
          <input value={slide.secondaryHref} onChange={(e) => set("secondaryHref", e.target.value)} className={inputClass} />
        </Field>
      </div>
    </>
  );
}
