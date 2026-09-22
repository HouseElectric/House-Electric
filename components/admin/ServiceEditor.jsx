"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage, imagekitConfigured } from "@/lib/imagekit";
import {
  AlertBadge,
  AmcBadge,
  ArrowLeftIcon,
  AwardIcon,
  BoltBadge,
  BuildingIcon,
  ExternalLinkIcon,
  GearIcon,
  HomeIcon,
  InstallBadge,
  LightbulbIcon,
  PlusIcon,
  ReportIcon,
  ShieldIcon,
  TrashIcon,
  WrenchIcon,
} from "@/components/icons";

export const ICON_OPTIONS = [
  { value: "repair", label: "Repair", icon: BoltBadge },
  { value: "install", label: "Installation", icon: InstallBadge },
  { value: "maintenance", label: "Maintenance", icon: GearIcon },
  { value: "health", label: "Health Check", icon: ReportIcon },
  { value: "amc", label: "AMC", icon: AmcBadge },
  { value: "emergency", label: "Emergency", icon: AlertBadge },
  { value: "audit", label: "Audit / Certified", icon: AwardIcon },
  { value: "corporate", label: "Corporate / Commercial", icon: BuildingIcon },
  { value: "safety", label: "Safety", icon: ShieldIcon },
  { value: "lighting", label: "Lighting", icon: LightbulbIcon },
  { value: "residential", label: "Residential", icon: HomeIcon },
  { value: "wiring", label: "Wiring", icon: WrenchIcon },
  { value: "bolt", label: "Generic", icon: BoltBadge },
];

export const ICON_MAP = Object.fromEntries(ICON_OPTIONS.map((o) => [o.value, o.icon]));

const SERVICE_FORM_SECTIONS = [
  { key: "content", label: "Page Content" },
  { key: "hero", label: "Hero & Booking" },
  { key: "stats", label: "SLA Stats" },
  { key: "types", label: "Types" },
  { key: "advantages", label: "Why Choose Us" },
  { key: "problem", label: "Without / With Us" },
  { key: "exclusions", label: "Exclusions" },
  { key: "why_he", label: "Why House Electric" },
  { key: "process", label: "Process" },
  { key: "faqs", label: "FAQs" },
];

const EMPTY = {
  title: "",
  slug: "",
  hero_title_plain: "",
  hero_title_highlight: "",
  subtitle: "",
  description: "",
  price_label: "",
  price_cta_label: "",
  icon_key: "bolt",
  image_url: "",
  href: "",
  checklist: "",
  display_order: 0,
  active: true,
  hero_eyebrow: "Our Services",
  primary_cta_label: "Book This Service",
  primary_cta_href: "#booking",
  secondary_cta_label: "Get a Quote",
  secondary_cta_href: "/contact",
  booking_subtitle: "Fill in your details and our team will confirm your booking shortly.",
  faqs: [],
  types_eyebrow: "",
  types_heading: "",
  types_subtitle: "",
  types_items: [],
  checklist_eyebrow: "",
  checklist_heading: "",
  checklist_subtitle: "",
  sla_stats: [],
  advantages_eyebrow: "",
  advantages_heading: "",
  advantages_subtitle: "",
  advantages_items: [],
  process_eyebrow: "",
  process_heading: "",
  process_subtitle: "",
  process_items: [],
  problem_eyebrow: "",
  problem_heading: "",
  problem_subtitle: "",
  problem_without: "",
  problem_with: "",
  exclusions_eyebrow: "",
  exclusions_heading: "",
  exclusions_subtitle: "",
  exclusions_items: "",
  why_he_eyebrow: "",
  why_he_heading: "",
  why_he_subtitle: "",
  why_he_items: [],
  hidden_sections: [],
};

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

function FormSection({ title, hint, right, children }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-[14px] font-extrabold text-ink">{title}</h4>
          {hint && <p className="mt-0.5 text-[12.5px] text-body">{hint}</p>}
        </div>
        {right}
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

// A checkbox for sections that only render on the public page when they have content — this
// lets an admin keep the content drafted but pull it off the live page without deleting it.
function VisibilitySwitch({ hidden, onChange }) {
  return (
    <label className="flex flex-none cursor-pointer items-center gap-2 rounded-lg bg-cream/70 px-2.5 py-1.5 text-[11.5px] font-bold text-ink">
      <input
        type="checkbox"
        checked={!hidden}
        onChange={(e) => onChange(!e.target.checked)}
        className="h-3.5 w-3.5 accent-yellow-dark"
      />
      {hidden ? "Hidden" : "Visible"}
    </label>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-semibold text-body">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-ink";

// Generic add/edit/remove list editor shared by the SLA Stats, Why Choose Us and
// Process Steps sections below — each is an optional array of small objects that
// only renders on the public page once it has at least one item.
function ListEditor({ items, onChange, fields, addLabel, emptyItem, max }) {
  const update = (i, key, val) => onChange(items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, emptyItem]);
  const atMax = max && items.length >= max;

  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="relative space-y-2 rounded-lg border border-line p-3.5 pr-9">
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remove"
            className="absolute right-2.5 top-2.5 text-red-400 transition-colors hover:text-red-600"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
          {fields.map((f) => (
            <Field key={f.key} label={f.label}>
              {f.type === "textarea" ? (
                <textarea
                  rows={2}
                  value={it[f.key] || ""}
                  onChange={(e) => update(i, f.key, e.target.value)}
                  className={inputClass}
                />
              ) : (
                <input value={it[f.key] || ""} onChange={(e) => update(i, f.key, e.target.value)} className={inputClass} />
              )}
            </Field>
          ))}
        </div>
      ))}
      {!atMax && (
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 text-[12.5px] font-bold text-ink transition-colors hover:underline"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      )}
    </div>
  );
}

export default function ServiceEditor({ serviceId }) {
  const router = useRouter();
  const isEdit = !!serviceId;

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [slugLock, setSlugLock] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formSection, setFormSection] = useState("content");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data: item } = await supabase.from("services").select("*").eq("id", serviceId).single();
      // The AMC row has its own dedicated editor (AMC Management → Plans Page Content), which also
      // manages hero content that lives outside this `services` row entirely — bounce here instead
      // of opening a second, partially-overlapping editor for the same data.
      if (item?.slug === "annual-maintenance-contract-amc") {
        router.replace("/admin/amc?tab=page");
        return;
      }
      if (item) {
        setForm({
          title: item.title,
          slug: item.slug || "",
          hero_title_plain: item.hero_title_plain || "",
          hero_title_highlight: item.hero_title_highlight || "",
          subtitle: item.subtitle || "",
          description: item.description || "",
          price_label: item.price_label || "",
          price_cta_label: item.price_cta_label || "",
          icon_key: item.icon_key,
          image_url: item.image_url || "",
          href: item.href || "",
          checklist: (item.checklist_items || []).join("\n"),
          display_order: item.display_order,
          active: item.active,
          hero_eyebrow: item.hero_eyebrow || "Our Services",
          primary_cta_label: item.primary_cta_label || "Book This Service",
          primary_cta_href: item.primary_cta_href || "#booking",
          secondary_cta_label: item.secondary_cta_label || "Get a Quote",
          secondary_cta_href: item.secondary_cta_href || "/contact",
          booking_subtitle: item.booking_subtitle || "Fill in your details and our team will confirm your booking shortly.",
          faqs: item.faqs || [],
          types_eyebrow: item.types_section?.eyebrow || "",
          types_heading: item.types_section?.heading || "",
          types_subtitle: item.types_section?.subtitle || "",
          types_items: (item.types_section?.items || []).map((t) => ({ ...t, tags: (t.tags || []).join(", ") })),
          checklist_eyebrow: item.checklist_section?.eyebrow || "",
          checklist_heading: item.checklist_section?.heading || "",
          checklist_subtitle: item.checklist_section?.subtitle || "",
          sla_stats: item.sla_stats || [],
          advantages_eyebrow: item.advantages_section?.eyebrow || "",
          advantages_heading: item.advantages_section?.heading || "",
          advantages_subtitle: item.advantages_section?.subtitle || "",
          advantages_items: item.advantages_section?.items || [],
          process_eyebrow: item.process_section?.eyebrow || "",
          process_heading: item.process_section?.heading || "",
          process_subtitle: item.process_section?.subtitle || "",
          process_items: item.process_section?.items || [],
          problem_eyebrow: item.problem_section?.eyebrow || "",
          problem_heading: item.problem_section?.heading || "",
          problem_subtitle: item.problem_section?.subtitle || "",
          problem_without: (item.problem_section?.without_items || []).join("\n"),
          problem_with: (item.problem_section?.with_items || []).join("\n"),
          exclusions_eyebrow: item.exclusions_section?.eyebrow || "",
          exclusions_heading: item.exclusions_section?.heading || "",
          exclusions_subtitle: item.exclusions_section?.subtitle || "",
          exclusions_items: (item.exclusions_section?.items || []).join("\n"),
          why_he_eyebrow: item.why_house_electric_section?.eyebrow || "",
          why_he_heading: item.why_house_electric_section?.heading || "",
          why_he_subtitle: item.why_house_electric_section?.subtitle || "",
          why_he_items: item.why_house_electric_section?.items || [],
          hidden_sections: item.hidden_sections || [],
        });
        setSlugLock(true);
      }
      setLoading(false);
    })();
  }, [serviceId, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isSectionHidden = (key) => form.hidden_sections.includes(key);
  const setSectionHidden = (key, hide) =>
    setForm((f) => ({
      ...f,
      hidden_sections: hide ? Array.from(new Set([...f.hidden_sections, key])) : f.hidden_sections.filter((k) => k !== key),
    }));

  const handleTitle = (v) => {
    set("title", v);
    if (!slugLock) set("slug", slugify(v));
  };

  const handleUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "house-electric/services");
      set("image_url", url);
    } catch (err) {
      toast.error(err.message);
    }
    setUploading(false);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) return;
    setSaving(true);

    const payload = {
      title: form.title,
      slug: form.slug,
      hero_title_plain: form.hero_title_plain.trim() || null,
      hero_title_highlight: form.hero_title_highlight.trim() || null,
      subtitle: form.subtitle,
      description: form.description,
      price_label: form.price_label,
      price_cta_label: form.price_cta_label.trim() || null,
      icon_key: form.icon_key,
      image_url: form.image_url,
      href: form.href.trim() || `/services/${form.slug}`,
      checklist_items: form.checklist
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      display_order: form.display_order,
      active: form.active,
      hero_eyebrow: form.hero_eyebrow.trim() || "Our Services",
      primary_cta_label: form.primary_cta_label.trim() || "Book This Service",
      primary_cta_href: form.primary_cta_href.trim() || "#booking",
      secondary_cta_label: form.secondary_cta_label.trim() || "Get a Quote",
      secondary_cta_href: form.secondary_cta_href.trim() || "/contact",
      booking_subtitle:
        form.booking_subtitle.trim() || "Fill in your details and our team will confirm your booking shortly.",
      faqs: form.faqs.filter((f) => f.q?.trim() || f.a?.trim()),
      types_section:
        form.types_items.filter((it) => it.title || it.desc).length > 0
          ? {
              eyebrow: form.types_eyebrow.trim(),
              heading: form.types_heading.trim(),
              subtitle: form.types_subtitle.trim(),
              items: form.types_items
                .filter((it) => it.title || it.desc)
                .map((it) => ({
                  title: it.title,
                  desc: it.desc,
                  tags: (it.tags || "")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })),
            }
          : {},
      checklist_section: {
        eyebrow: form.checklist_eyebrow.trim(),
        heading: form.checklist_heading.trim(),
        subtitle: form.checklist_subtitle.trim(),
      },
      sla_stats: form.sla_stats.filter((s) => s.value || s.suffix || s.label),
      advantages_section:
        form.advantages_items.filter((it) => it.title || it.desc).length > 0
          ? {
              eyebrow: form.advantages_eyebrow.trim(),
              heading: form.advantages_heading.trim(),
              subtitle: form.advantages_subtitle.trim(),
              items: form.advantages_items.filter((it) => it.title || it.desc),
            }
          : {},
      process_section:
        form.process_items.filter((it) => it.title || it.desc).length > 0
          ? {
              eyebrow: form.process_eyebrow.trim(),
              heading: form.process_heading.trim(),
              subtitle: form.process_subtitle.trim(),
              items: form.process_items.filter((it) => it.title || it.desc),
            }
          : {},
      problem_section:
        form.problem_without.trim() || form.problem_with.trim()
          ? {
              eyebrow: form.problem_eyebrow.trim(),
              heading: form.problem_heading.trim(),
              subtitle: form.problem_subtitle.trim(),
              without_items: form.problem_without.split("\n").map((s) => s.trim()).filter(Boolean),
              with_items: form.problem_with.split("\n").map((s) => s.trim()).filter(Boolean),
            }
          : {},
      exclusions_section: form.exclusions_items.trim()
        ? {
            eyebrow: form.exclusions_eyebrow.trim(),
            heading: form.exclusions_heading.trim(),
            subtitle: form.exclusions_subtitle.trim(),
            items: form.exclusions_items.split("\n").map((s) => s.trim()).filter(Boolean),
          }
        : {},
      why_house_electric_section:
        form.why_he_items.filter((it) => it.title || it.desc).length > 0
          ? {
              eyebrow: form.why_he_eyebrow.trim(),
              heading: form.why_he_heading.trim(),
              subtitle: form.why_he_subtitle.trim(),
              items: form.why_he_items.filter((it) => it.title || it.desc),
            }
          : {},
      hidden_sections: form.hidden_sections,
    };

    const { error } = isEdit
      ? await supabase.from("services").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", serviceId)
      : await supabase.from("services").insert([payload]);

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(isEdit ? "Service updated" : "Service added");
    router.push("/admin/services");
  };

  if (loading) {
    return (
      <AdminLayout title="Services & Pricing">
        <div className="rounded-2xl border border-line bg-white p-16 text-center text-[13.5px] text-body">
          Loading service...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Services & Pricing">
      <form onSubmit={save} className="pb-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => router.push("/admin/services")}
              className="mb-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-body hover:text-ink"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              Back to Services
            </button>
            <h3 className="text-[19px] font-extrabold text-ink">
              {isEdit ? `Edit — ${form.title || "Service"}` : "Add New Service"}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/services")}
              className="rounded-md border border-line px-5 py-3 text-[13.5px] font-semibold text-body hover:border-ink/40 hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="whitespace-nowrap rounded-md bg-yellow px-7 py-3 text-[14px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-60"
            >
              {saving ? "Saving…" : isEdit ? "Update Service" : "Create Service"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          {/* ---------- Left column ---------- */}
          <div className="space-y-6">
            <FormSection title="Photo">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files[0])}
              />
              {form.image_url ? (
                <div className="relative">
                  <img src={form.image_url} alt="" className="aspect-[4/3] w-full rounded-lg border border-line object-cover" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute right-2 top-2 rounded-md bg-black/70 px-2.5 py-1.5 text-[11px] font-bold text-white"
                  >
                    {uploading ? "Uploading…" : "Replace"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-[4/3] w-full rounded-lg border-2 border-dashed border-line bg-cream/30 text-[13px] font-semibold text-body transition-colors hover:border-ink/30"
                >
                  {uploading ? "Uploading…" : "Click to upload photo"}
                </button>
              )}
              {!imagekitConfigured && <p className="text-[11px] font-bold text-red-500">⚠ ImageKit not configured</p>}
            </FormSection>

            <FormSection title="Title & URL">
              <Field label="Title *">
                <input value={form.title} onChange={(e) => handleTitle(e.target.value)} required className={inputClass} />
              </Field>
              <Field label="URL Slug *">
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap text-[12.5px] text-body">/services/</span>
                  <input
                    value={form.slug}
                    onChange={(e) => {
                      set("slug", slugify(e.target.value));
                      setSlugLock(true);
                    }}
                    required
                    className={inputClass}
                  />
                </div>
              </Field>
              <Field label="Custom Link (optional)">
                <input
                  value={form.href}
                  onChange={(e) => set("href", e.target.value)}
                  placeholder="Leave blank to auto-generate the page above"
                  className={inputClass}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Hero Headline"
              hint="The large heading on this service's page — separate from the short Title above. Leave both blank to keep this page's existing headline."
            >
              <Field label="Plain Part">
                <input
                  value={form.hero_title_plain}
                  onChange={(e) => set("hero_title_plain", e.target.value)}
                  placeholder="e.g. Proactive, Zero-Downtime"
                  className={inputClass}
                />
              </Field>
              <Field label="Highlighted Part (shown in gold)">
                <input
                  value={form.hero_title_highlight}
                  onChange={(e) => set("hero_title_highlight", e.target.value)}
                  placeholder="e.g. Electrical Maintenance"
                  className={inputClass}
                />
              </Field>
              {(form.hero_title_plain || form.hero_title_highlight) && (
                <p className="rounded-lg bg-cream/60 px-3 py-2.5 text-[15px] font-extrabold leading-snug text-ink">
                  {form.hero_title_plain} <span className="text-yellow">{form.hero_title_highlight}</span>
                </p>
              )}
            </FormSection>

            <FormSection title="Icon">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ICON_OPTIONS.map((o) => {
                  const OptIcon = o.icon;
                  const active = form.icon_key === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => set("icon_key", o.value)}
                      className={`flex flex-col items-center gap-1 rounded-lg border py-2.5 text-[10.5px] font-semibold transition-colors ${
                        active ? "border-ink bg-cream text-ink" : "border-line text-body hover:border-ink/40"
                      }`}
                    >
                      <OptIcon className="h-4 w-4" />
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </FormSection>

            <FormSection title="Display">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Price Label">
                  <input
                    value={form.price_label}
                    onChange={(e) => set("price_label", e.target.value)}
                    placeholder="e.g. Starting ₹499"
                    className={inputClass}
                  />
                </Field>
                <Field label="Display Order">
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => set("display_order", Number(e.target.value))}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Pricing Card Headline (optional — overrides Price Label above on the pricing card, e.g. 'See the AMC Plans')">
                <input
                  value={form.price_cta_label}
                  onChange={(e) => set("price_cta_label", e.target.value)}
                  placeholder="Leave blank to just show the Price Label"
                  className={inputClass}
                />
              </Field>
              <label className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
                Live on site
              </label>
            </FormSection>
          </div>

          {/* ---------- Right column ---------- */}
          <div className="space-y-6">
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-line bg-white p-1">
              {SERVICE_FORM_SECTIONS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setFormSection(s.key)}
                  className={`rounded-lg px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
                    formSection === s.key ? "bg-ink text-white shadow-sm" : "text-body hover:bg-cream"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {formSection === "content" && (
            <FormSection title="Service Detail Page Content" hint="Everything shown on the public service detail page.">
              <Field label="Short Description (shown on the homepage/services card)">
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={2}
                  className={inputClass}
                />
              </Field>

              <Field label="Page Subtitle (banner intro text — defaults to description if left blank)">
                <textarea
                  value={form.subtitle}
                  onChange={(e) => set("subtitle", e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </Field>

              <Field label="What's Included (one item per line — shown as a checklist grid on the page)">
                <textarea
                  value={form.checklist}
                  onChange={(e) => set("checklist", e.target.value)}
                  rows={10}
                  placeholder={"Fault finding\nSwitch & socket replacement\nMCB replacement\nSafety testing"}
                  className={`${inputClass} font-mono`}
                />
                <div className="mt-1.5">
                  <VisibilitySwitch hidden={isSectionHidden("checklist")} onChange={(h) => setSectionHidden("checklist", h)} />
                </div>
              </Field>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Checklist Eyebrow (optional)">
                  <input
                    value={form.checklist_eyebrow}
                    onChange={(e) => set("checklist_eyebrow", e.target.value)}
                    placeholder="What's included"
                    className={inputClass}
                  />
                </Field>
                <Field label="Checklist Heading (optional)">
                  <input
                    value={form.checklist_heading}
                    onChange={(e) => set("checklist_heading", e.target.value)}
                    placeholder={`${form.title || "Service"} — What We Cover`}
                    className={inputClass}
                  />
                </Field>
                <Field label="Checklist Subtitle (optional)">
                  <input
                    value={form.checklist_subtitle}
                    onChange={(e) => set("checklist_subtitle", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </FormSection>
            )}

            {formSection === "hero" && (
            <FormSection title="Hero Buttons & Booking Text" hint="The eyebrow tag, both hero buttons, and the booking-form subtitle on this service's page.">
              <Field label="Hero Eyebrow (small tag above the title)">
                <input value={form.hero_eyebrow} onChange={(e) => set("hero_eyebrow", e.target.value)} className={inputClass} />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Primary Button Label">
                  <input value={form.primary_cta_label} onChange={(e) => set("primary_cta_label", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Primary Button Link">
                  <input value={form.primary_cta_href} onChange={(e) => set("primary_cta_href", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Secondary Button Label">
                  <input value={form.secondary_cta_label} onChange={(e) => set("secondary_cta_label", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Secondary Button Link">
                  <input value={form.secondary_cta_href} onChange={(e) => set("secondary_cta_href", e.target.value)} className={inputClass} />
                </Field>
              </div>
              <Field label="Booking Section Subtitle">
                <textarea
                  value={form.booking_subtitle}
                  onChange={(e) => set("booking_subtitle", e.target.value)}
                  rows={2}
                  className={inputClass}
                />
              </Field>
            </FormSection>
            )}

            {formSection === "stats" && (
            <FormSection
              title="SLA Stats Strip"
              hint="Up to 4 quick stats shown right under the hero photo (e.g. 30 / Mins / Average Arrival SLA). Leave empty to hide this strip."
              right={<VisibilitySwitch hidden={isSectionHidden("stats")} onChange={(h) => setSectionHidden("stats", h)} />}
            >
              <ListEditor
                items={form.sla_stats}
                onChange={(v) => set("sla_stats", v)}
                fields={[
                  { key: "value", label: "Value (e.g. 30, 100, 24/7)" },
                  { key: "suffix", label: "Suffix (e.g.  Mins,  %,  +)" },
                  { key: "label", label: "Label" },
                ]}
                emptyItem={{ value: "", suffix: "", label: "" }}
                addLabel="Add Stat"
                max={4}
              />
            </FormSection>
            )}

            {formSection === "types" && (
            <FormSection
              title="Types / Who It's For"
              hint="An optional section listing the categories or property types this service covers (e.g. AMC's Residential / Office / Commercial / Corporate). Leave empty to hide."
              right={<VisibilitySwitch hidden={isSectionHidden("types")} onChange={(h) => setSectionHidden("types", h)} />}
            >
              <Field label="Eyebrow">
                <input value={form.types_eyebrow} onChange={(e) => set("types_eyebrow", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Heading">
                <input value={form.types_heading} onChange={(e) => set("types_heading", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Subtitle">
                <textarea rows={2} value={form.types_subtitle} onChange={(e) => set("types_subtitle", e.target.value)} className={inputClass} />
              </Field>
              <ListEditor
                items={form.types_items}
                onChange={(v) => set("types_items", v)}
                fields={[
                  { key: "title", label: "Type Title (e.g. Residential AMC)" },
                  { key: "desc", label: "Short Description", type: "textarea" },
                  { key: "tags", label: "Applies To (comma-separated, e.g. Homes, Apartments, Villas)" },
                ]}
                emptyItem={{ title: "", desc: "", tags: "" }}
                addLabel="Add Type"
                max={4}
              />
            </FormSection>
            )}

            {formSection === "advantages" && (
            <FormSection
              title="Why Choose Us Cards"
              hint="An optional advantages section further down the page. Leave the cards empty to hide this section."
              right={<VisibilitySwitch hidden={isSectionHidden("advantages")} onChange={(h) => setSectionHidden("advantages", h)} />}
            >
              <Field label="Eyebrow">
                <input value={form.advantages_eyebrow} onChange={(e) => set("advantages_eyebrow", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Heading">
                <input value={form.advantages_heading} onChange={(e) => set("advantages_heading", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Subtitle">
                <textarea rows={2} value={form.advantages_subtitle} onChange={(e) => set("advantages_subtitle", e.target.value)} className={inputClass} />
              </Field>
              <ListEditor
                items={form.advantages_items}
                onChange={(v) => set("advantages_items", v)}
                fields={[
                  { key: "title", label: "Card Title" },
                  { key: "desc", label: "Card Description", type: "textarea" },
                ]}
                emptyItem={{ title: "", desc: "" }}
                addLabel="Add Card"
                max={8}
              />
            </FormSection>
            )}

            {formSection === "problem" && (
            <FormSection
              title="Without Us / With Us"
              hint="The two-column before/after comparison shown on this service's page. Leave both lists empty to hide this section."
              right={<VisibilitySwitch hidden={isSectionHidden("problem")} onChange={(h) => setSectionHidden("problem", h)} />}
            >
              <Field label="Eyebrow">
                <input value={form.problem_eyebrow} onChange={(e) => set("problem_eyebrow", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Heading">
                <input value={form.problem_heading} onChange={(e) => set("problem_heading", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Subtitle">
                <textarea rows={2} value={form.problem_subtitle} onChange={(e) => set("problem_subtitle", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Without Us (one step per line)">
                <textarea rows={4} value={form.problem_without} onChange={(e) => set("problem_without", e.target.value)} className={`${inputClass} font-mono`} />
              </Field>
              <Field label="With House Electric (one step per line)">
                <textarea rows={4} value={form.problem_with} onChange={(e) => set("problem_with", e.target.value)} className={`${inputClass} font-mono`} />
              </Field>
            </FormSection>
            )}

            {formSection === "exclusions" && (
            <FormSection
              title="What's Chargeable Separately"
              hint="The list of exclusions shown on this service's page (materials, new work, major repairs). Leave items empty to hide this section."
              right={<VisibilitySwitch hidden={isSectionHidden("exclusions")} onChange={(h) => setSectionHidden("exclusions", h)} />}
            >
              <Field label="Eyebrow">
                <input value={form.exclusions_eyebrow} onChange={(e) => set("exclusions_eyebrow", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Heading">
                <input value={form.exclusions_heading} onChange={(e) => set("exclusions_heading", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Subtitle">
                <textarea rows={2} value={form.exclusions_subtitle} onChange={(e) => set("exclusions_subtitle", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Chargeable Items (one per line)">
                <textarea rows={6} value={form.exclusions_items} onChange={(e) => set("exclusions_items", e.target.value)} className={`${inputClass} font-mono`} />
              </Field>
            </FormSection>
            )}

            {formSection === "why_he" && (
            <FormSection
              title="Why House Electric"
              hint="Why choose House Electric specifically for this service (not the service in general). Leave the cards empty to hide this section."
              right={<VisibilitySwitch hidden={isSectionHidden("why_he")} onChange={(h) => setSectionHidden("why_he", h)} />}
            >
              <Field label="Eyebrow">
                <input value={form.why_he_eyebrow} onChange={(e) => set("why_he_eyebrow", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Heading">
                <input value={form.why_he_heading} onChange={(e) => set("why_he_heading", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Subtitle">
                <textarea rows={2} value={form.why_he_subtitle} onChange={(e) => set("why_he_subtitle", e.target.value)} className={inputClass} />
              </Field>
              <ListEditor
                items={form.why_he_items}
                onChange={(v) => set("why_he_items", v)}
                fields={[
                  { key: "title", label: "Card Title" },
                  { key: "desc", label: "Card Description", type: "textarea" },
                ]}
                emptyItem={{ title: "", desc: "" }}
                addLabel="Add Card"
                max={8}
              />
            </FormSection>
            )}

            {formSection === "process" && (
            <FormSection
              title="Process Steps"
              hint="An optional step-by-step workflow section, numbered automatically (01, 02…). Leave empty to hide this section."
              right={<VisibilitySwitch hidden={isSectionHidden("process")} onChange={(h) => setSectionHidden("process", h)} />}
            >
              <Field label="Eyebrow">
                <input value={form.process_eyebrow} onChange={(e) => set("process_eyebrow", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Heading">
                <input value={form.process_heading} onChange={(e) => set("process_heading", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Subtitle">
                <textarea rows={2} value={form.process_subtitle} onChange={(e) => set("process_subtitle", e.target.value)} className={inputClass} />
              </Field>
              <ListEditor
                items={form.process_items}
                onChange={(v) => set("process_items", v)}
                fields={[
                  { key: "title", label: "Step Title" },
                  { key: "desc", label: "Step Description", type: "textarea" },
                ]}
                emptyItem={{ title: "", desc: "" }}
                addLabel="Add Step"
                max={4}
              />
            </FormSection>
            )}

            {formSection === "faqs" && (
            <FormSection
              title="FAQs"
              hint="Shown in a Frequently Asked Questions section on this service's page."
              right={<VisibilitySwitch hidden={isSectionHidden("faqs")} onChange={(h) => setSectionHidden("faqs", h)} />}
            >
              <ListEditor
                items={form.faqs}
                onChange={(v) => set("faqs", v)}
                fields={[
                  { key: "q", label: "Question" },
                  { key: "a", label: "Answer", type: "textarea" },
                ]}
                emptyItem={{ q: "", a: "" }}
                addLabel="Add Question"
              />
            </FormSection>
            )}

            {form.slug && (
              <a
                href={form.href.trim() || `/services/${form.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink underline decoration-line underline-offset-2 hover:decoration-ink"
              >
                Preview page: {form.href.trim() || `/services/${form.slug}`}
                <ExternalLinkIcon className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
