"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage, imagekitConfigured } from "@/lib/imagekit";
import {
  AlertBadge,
  AmcBadge,
  ArrowLeftIcon,
  BoltBadge,
  CheckCircle,
  EditIcon,
  ExternalLinkIcon,
  GearIcon,
  InstallBadge,
  PlusIcon,
  ReportIcon,
  TrashIcon,
  WrenchIcon,
} from "@/components/icons";

const ICON_OPTIONS = [
  { value: "repair", label: "Repair", icon: BoltBadge },
  { value: "install", label: "Installation", icon: InstallBadge },
  { value: "maintenance", label: "Maintenance", icon: GearIcon },
  { value: "health", label: "Health Check", icon: ReportIcon },
  { value: "amc", label: "AMC", icon: AmcBadge },
  { value: "emergency", label: "Emergency", icon: AlertBadge },
  { value: "bolt", label: "Generic", icon: BoltBadge },
];

const ICON_MAP = Object.fromEntries(ICON_OPTIONS.map((o) => [o.value, o.icon]));

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
};

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

function FormSection({ title, hint, children }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <h4 className="text-[14px] font-extrabold text-ink">{title}</h4>
      {hint && <p className="mt-0.5 text-[12.5px] text-body">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
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

export default function AdminServicesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // "list" | "form"
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [slugLock, setSlugLock] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("services").select("*").order("display_order", { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleTitle = (v) => {
    set("title", v);
    if (!slugLock) set("slug", slugify(v));
  };

  const openNew = () => {
    const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order)) + 1 : 1;
    setForm({ ...EMPTY, display_order: nextOrder });
    setEditingId(null);
    setSlugLock(false);
    setView("form");
  };

  const openEdit = (item) => {
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
    });
    setEditingId(item.id);
    setSlugLock(true);
    setView("form");
  };

  const backToList = () => setView("list");

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
    };

    const { error } = editingId
      ? await supabase.from("services").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editingId)
      : await supabase.from("services").insert([payload]);

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Service updated" : "Service added");
    await fetchItems();
    setView("list");
  };

  const remove = async (id) => {
    if (!confirm("Delete this service? It will disappear from the website (and its page, if auto-generated).")) return;
    await supabase.from("services").delete().eq("id", id);
    toast.success("Service deleted");
    fetchItems();
  };

  const toggleActive = async (item) => {
    await supabase.from("services").update({ active: !item.active }).eq("id", item.id);
    toast.success(item.active ? "Service hidden" : "Service activated");
    fetchItems();
  };

  // ==================== FORM (full page) ====================
  if (view === "form") {
    return (
      <AdminGuard>
        <AdminLayout title="Services & Pricing">
          <form onSubmit={save} className="pb-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <button
                  type="button"
                  onClick={backToList}
                  className="mb-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-body hover:text-ink"
                >
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                  Back to Services
                </button>
                <h3 className="text-[19px] font-extrabold text-ink">
                  {editingId ? `Edit — ${form.title || "Service"}` : "Add New Service"}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={backToList}
                  className="rounded-md border border-line px-5 py-3 text-[13.5px] font-semibold text-body hover:border-ink/40 hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="whitespace-nowrap rounded-md bg-yellow px-7 py-3 text-[14px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-60"
                >
                  {saving ? "Saving…" : editingId ? "Update Service" : "Create Service"}
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

                <FormSection
                  title="SLA Stats Strip"
                  hint="Up to 4 quick stats shown right under the hero photo (e.g. 30 / Mins / Average Arrival SLA). Leave empty to hide this strip."
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

                <FormSection
                  title="Why Choose Us Cards"
                  hint="An optional advantages section further down the page. Leave the cards empty to hide this section."
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

                <FormSection
                  title="Process Steps"
                  hint="An optional step-by-step workflow section, numbered automatically (01, 02…). Leave empty to hide this section."
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

                <FormSection
                  title="FAQs"
                  hint="Shown in a Frequently Asked Questions section on this service's page."
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
      </AdminGuard>
    );
  }

  // ==================== LIST ====================
  return (
    <AdminGuard>
      <AdminLayout title="Services & Pricing">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-[65ch] text-[13.5px] leading-relaxed text-body">
            Add, edit or remove services shown on the homepage and the{" "}
            <a href="/services" target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline">
              Services page
            </a>
            . Leave <b className="text-ink">Custom Link</b> blank and a dedicated page is created automatically.
          </p>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md"
          >
            <PlusIcon className="h-4 w-4" />
            Add Service
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "Total Services", value: items.length, icon: WrenchIcon, cls: "bg-ink text-yellow" },
            { label: "Live", value: items.filter((i) => i.active).length, icon: CheckCircle, cls: "bg-emerald-50 text-emerald-600" },
            { label: "Hidden", value: items.filter((i) => !i.active).length, icon: EditIcon, cls: "bg-gray-100 text-gray-500" },
          ].map((c, i) => (
            <div key={c.label} style={{ animationDelay: `${i * 0.06}s` }} className="card-hover rounded-2xl border border-line bg-white p-4 opacity-0 animate-fade-up">
              <div className={`mb-2.5 grid h-9 w-9 place-items-center rounded-lg ${c.cls}`}>
                <c.icon className="h-4 w-4" />
              </div>
              <div className="text-[11.5px] font-semibold text-body">{c.label}</div>
              <div className="mt-0.5 text-[22px] font-extrabold tabular-nums text-ink">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_0_rgba(20,20,20,0.02)]">
          <div className="border-b border-line bg-cream/40 px-5 py-3">
            <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-body">
              <WrenchIcon className="h-3.5 w-3.5 text-yellow-dark" />
              {items.length} Service{items.length === 1 ? "" : "s"}
            </span>
          </div>
          {loading ? (
            <div className="p-12 text-center text-[13.5px] text-body">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-[13.5px] text-body">
              No services yet —{" "}
              <button onClick={openNew} className="font-semibold text-ink underline">
                add your first one
              </button>
              .
            </div>
          ) : (
            <div className="divide-y divide-line">
              {items.map((item) => {
                const link = item.href || `/services/${item.slug}`;
                const isAutoPage = !item.href || item.href === `/services/${item.slug}`;
                const Icon = ICON_MAP[item.icon_key] || BoltBadge;
                const checklistCount = item.checklist_items?.length || 0;
                return (
                  <div key={item.id} className="group flex flex-col gap-4 p-5 transition-colors hover:bg-cream/30 sm:flex-row sm:items-center">
                    <div className="relative h-20 w-28 flex-none overflow-hidden rounded-lg border border-line bg-cream/30">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-body/40">
                          <Icon className="h-6 w-6" />
                        </div>
                      )}
                      <span className="absolute -bottom-1 -left-1 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-yellow text-ink shadow-sm transition-transform duration-200 group-hover:scale-110">
                        <Icon className="h-3 w-3" />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <b className="text-[15px] text-ink">{item.title}</b>
                        {item.price_label && (
                          <span className="whitespace-nowrap rounded-full bg-cream px-2 py-0.5 text-[11px] font-bold text-ink">
                            {item.price_label}
                          </span>
                        )}
                        {checklistCount > 0 && (
                          <span className="whitespace-nowrap rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                            {checklistCount} checklist item{checklistCount === 1 ? "" : "s"}
                          </span>
                        )}
                        <button
                          onClick={() => toggleActive(item)}
                          className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-colors ${
                            item.active ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-cream text-body hover:bg-line"
                          }`}
                        >
                          {item.active ? "Live" : "Hidden"}
                        </button>
                      </div>
                      <p className="mt-1 line-clamp-1 text-[12.5px] text-body">{item.description}</p>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-semibold text-ink underline decoration-line underline-offset-2 hover:decoration-ink"
                      >
                        {isAutoPage ? "Auto-generated page" : "Custom page"}: {link}
                        <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                    </div>

                    <div className="flex flex-none items-center gap-4">
                      <button onClick={() => openEdit(item)} className="flex items-center gap-1 text-[13px] font-semibold text-ink hover:underline">
                        <EditIcon className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button onClick={() => remove(item.id)} className="flex items-center gap-1 text-[13px] font-semibold text-red-400 hover:text-red-600">
                        <TrashIcon className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
