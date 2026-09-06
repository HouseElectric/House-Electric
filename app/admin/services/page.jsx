"use client";

import { useEffect, useRef, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage, cloudinaryConfigured } from "@/lib/cloudinary";
import {
  AlertBadge,
  AmcBadge,
  ArrowLeftIcon,
  BoltBadge,
  EditIcon,
  ExternalLinkIcon,
  GearIcon,
  InstallBadge,
  PlusIcon,
  ReportIcon,
  TrashIcon,
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
  subtitle: "",
  description: "",
  price_label: "",
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
      subtitle: item.subtitle || "",
      description: item.description || "",
      price_label: item.price_label || "",
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
      alert(err.message);
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
      subtitle: form.subtitle,
      description: form.description,
      price_label: form.price_label,
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
    };

    const { error } = editingId
      ? await supabase.from("services").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editingId)
      : await supabase.from("services").insert([payload]);

    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    await fetchItems();
    setView("list");
  };

  const remove = async (id) => {
    if (!confirm("Delete this service? It will disappear from the website (and its page, if auto-generated).")) return;
    await supabase.from("services").delete().eq("id", id);
    fetchItems();
  };

  const toggleActive = async (item) => {
    await supabase.from("services").update({ active: !item.active }).eq("id", item.id);
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
                  className="whitespace-nowrap rounded-md bg-yellow px-7 py-3 text-[14px] font-bold text-ink hover:bg-yellow-dark disabled:opacity-60"
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
                  {!cloudinaryConfigured && <p className="text-[11px] font-bold text-red-500">⚠ Cloudinary not configured</p>}
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

                <FormSection title="Icon">
                  <div className="grid grid-cols-4 gap-2">
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
                  <div className="grid grid-cols-2 gap-4">
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
            className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink hover:bg-yellow-dark"
          >
            <PlusIcon className="h-4 w-4" />
            Add Service
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="border-b border-line bg-cream/40 px-5 py-3">
            <span className="text-[12px] font-bold uppercase tracking-wide text-body">
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
                  <div key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="relative h-20 w-28 flex-none overflow-hidden rounded-lg border border-line bg-cream/30">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-body/40">
                          <Icon className="h-6 w-6" />
                        </div>
                      )}
                      <span className="absolute -bottom-1 -left-1 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-yellow text-ink">
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
                          className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            item.active ? "bg-emerald-50 text-emerald-700" : "bg-cream text-body"
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
