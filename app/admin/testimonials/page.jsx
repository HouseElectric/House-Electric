"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { ImageUploadField } from "@/components/admin/FormKit";
import { supabase } from "@/lib/supabase";
import { uploadImage, imagekitConfigured } from "@/lib/imagekit";
import { EditIcon, StarIcon, TrashIcon, UsersIcon, CheckCircle, SparklesIcon } from "@/components/icons";

const EMPTY = { name: "", role: "", text: "", rating: 5, avatar_url: "", published: true };
const EMPTY_GOOGLE = { rating: "", reviewCount: "", profileUrl: "" };

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [googleMeta, setGoogleMeta] = useState(EMPTY_GOOGLE);
  const [savingGoogle, setSavingGoogle] = useState(false);
  const [googleSaved, setGoogleSaved] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    const sorted = (data ?? []).sort((a, b) => {
      const aPending = a.source === "customer" && !a.published ? 0 : 1;
      const bPending = b.source === "customer" && !b.published ? 0 : 1;
      return aPending - bPending;
    });
    setItems(sorted);
    setLoading(false);
  };

  const fetchGoogleMeta = async () => {
    const { data } = await supabase.from("site_settings").select("data").eq("key", "google_reviews").maybeSingle();
    if (data?.data) setGoogleMeta({ ...EMPTY_GOOGLE, ...data.data });
  };

  const saveGoogleMeta = async (e) => {
    e.preventDefault();
    setSavingGoogle(true);
    const payload = {
      rating: googleMeta.rating === "" ? null : Number(googleMeta.rating),
      reviewCount: googleMeta.reviewCount === "" ? null : Number(googleMeta.reviewCount),
      profileUrl: googleMeta.profileUrl.trim(),
    };
    const { error } = await supabase
      .from("site_settings")
      .upsert([{ key: "google_reviews", data: payload, updated_at: new Date().toISOString() }]);
    setSavingGoogle(false);
    if (!error) {
      setGoogleSaved(true);
      toast.success("Google Reviews info saved");
      setTimeout(() => setGoogleSaved(false), 2500);
    } else {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchGoogleMeta();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleAvatarUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "house-electric/testimonials");
      set("avatar_url", url);
    } catch (err) {
      toast.error(err.message);
    }
    setUploading(false);
  };

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) return;
    setSaving(true);
    if (editingId) {
      await supabase.from("testimonials").update(form).eq("id", editingId);
    } else {
      await supabase.from("testimonials").insert([form]);
    }
    setSaving(false);
    toast.success(editingId ? "Testimonial updated" : "Testimonial added");
    resetForm();
    fetchItems();
  };

  const edit = (item) => {
    setForm({ name: item.name, role: item.role || "", text: item.text, rating: item.rating, avatar_url: item.avatar_url || "", published: item.published });
    setEditingId(item.id);
  };

  const remove = async (id) => {
    if (!confirm("Delete this testimonial?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    toast.success("Testimonial deleted");
    fetchItems();
  };

  const togglePublished = async (item) => {
    await supabase.from("testimonials").update({ published: !item.published }).eq("id", item.id);
    toast.success(item.published ? "Testimonial hidden" : "Testimonial published");
    fetchItems();
  };

  return (
    <AdminGuard>
      <AdminLayout title="Testimonials">
        <p className="mb-5 max-w-[65ch] text-[13.5px] text-body">
          Customer reviews shown in the "What Our Customers Say" section on the homepage. Add, edit,
          publish/hide or delete them here.
        </p>

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total", value: items.length, icon: StarIcon, cls: "bg-ink text-yellow" },
            { label: "Published", value: items.filter((i) => i.published).length, icon: CheckCircle, cls: "bg-emerald-50 text-emerald-600" },
            { label: "Hidden", value: items.filter((i) => !i.published).length, icon: EditIcon, cls: "bg-gray-100 text-gray-500" },
            { label: "From Customers", value: items.filter((i) => i.source === "customer").length, icon: UsersIcon, cls: "bg-blue-50 text-blue-600" },
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

        <form onSubmit={saveGoogleMeta} className="card-hover mb-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h3 className="mb-1 flex items-center gap-2 text-[14px] font-extrabold text-ink">
            <SparklesIcon className="h-4 w-4 text-yellow-dark" />
            Google Reviews Badge
          </h3>
          <p className="mb-4 text-[12.5px] text-body">
            Shown next to the reviews heading. Only fill this in with your real Google Business Profile
            rating — leave blank to hide the badge.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-body">Google Rating (e.g. 4.8)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={googleMeta.rating}
                onChange={(e) => setGoogleMeta((g) => ({ ...g, rating: e.target.value }))}
                className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-body">Total Google Reviews</label>
              <input
                type="number"
                min="0"
                value={googleMeta.reviewCount}
                onChange={(e) => setGoogleMeta((g) => ({ ...g, reviewCount: e.target.value }))}
                className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-body">Google Business Profile Link</label>
              <input
                type="url"
                value={googleMeta.profileUrl}
                onChange={(e) => setGoogleMeta((g) => ({ ...g, profileUrl: e.target.value }))}
                placeholder="https://g.page/r/xxxx/review"
                className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={savingGoogle}
              className="rounded-md bg-yellow px-5 py-2.5 text-[13px] font-bold text-ink hover:bg-yellow-dark disabled:opacity-60"
            >
              {savingGoogle ? "Saving…" : "Save"}
            </button>
            {googleSaved && <span className="text-[12.5px] font-semibold text-emerald-600">Saved!</span>}
          </div>
        </form>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_0_rgba(20,20,20,0.02)]">
            <div className="border-b border-line bg-cream/40 px-5 py-3">
              <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-body">
                <StarIcon className="h-3.5 w-3.5 text-yellow-dark" />
                {items.length} Testimonial{items.length === 1 ? "" : "s"}
              </span>
            </div>
            {loading ? (
              <div className="p-12 text-center text-[13.5px] text-body">Loading...</div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-body">
                <StarIcon className="h-6 w-6 text-body/40" />
                No testimonials yet — add one on the right.
              </div>
            ) : (
              <div className="divide-y divide-line">
                {items.map((item) => (
                  <div key={item.id} className="group flex items-start justify-between gap-4 p-5 transition-colors hover:bg-cream/30">
                    <div className="flex min-w-0 gap-3">
                      <div className="h-11 w-11 flex-none overflow-hidden rounded-full border border-line bg-cream shadow-sm transition-transform duration-200 group-hover:scale-105">
                        {item.avatar_url ? (
                          <img src={item.avatar_url} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-yellow/20 to-amber-100 text-[13px] font-extrabold text-ink/70">
                            {item.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <b className="text-[14px] text-ink">{item.name}</b>
                          {item.role && <span className="text-[12.5px] text-body">· {item.role}</span>}
                          <span className="text-[12px] tracking-wide text-yellow-dark">{"★".repeat(item.rating)}</span>
                          {item.source === "customer" && (
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10.5px] font-bold text-blue-700">
                              Customer Review
                            </span>
                          )}
                        </div>
                        <p className="mt-1 max-w-[50ch] text-[13.5px] text-body">{item.text}</p>
                      </div>
                    </div>
                    <div className="flex flex-none flex-col items-end gap-1.5">
                      <button
                        onClick={() => togglePublished(item)}
                        className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          item.published ? "bg-emerald-50 text-emerald-700" : "bg-cream text-body"
                        }`}
                      >
                        {item.published ? "Published" : "Hidden"}
                      </button>
                      <button onClick={() => edit(item)} className="flex items-center gap-1 text-[12.5px] font-semibold text-ink hover:underline">
                        <EditIcon className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button onClick={() => remove(item.id)} className="flex items-center gap-1 text-[12.5px] font-semibold text-red-400 hover:text-red-600">
                        <TrashIcon className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={save} className="h-fit rounded-2xl border border-line bg-white p-5 sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-ink">
              <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-cream text-ink">
                <StarIcon className="h-4 w-4" />
              </span>
              {editingId ? "Edit Testimonial" : "Add Testimonial"}
            </h3>

            <div className="mb-4">
              <ImageUploadField
                label="Photo (optional)"
                value={form.avatar_url}
                uploading={uploading}
                onUpload={handleAvatarUpload}
                aspect="aspect-square"
              />
              {!imagekitConfigured && <p className="mt-1 text-[11px] font-bold text-red-500">⚠ ImageKit not configured</p>}
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-[12px] font-semibold text-body">Name *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} required className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink" />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-[12px] font-semibold text-body">Role (e.g. Homeowner)</label>
              <input value={form.role} onChange={(e) => set("role", e.target.value)} className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink" />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-[12px] font-semibold text-body">Testimonial Text *</label>
              <textarea value={form.text} onChange={(e) => set("text", e.target.value)} required rows={4} className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink" />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-[12px] font-semibold text-body">Rating</label>
              <select value={form.rating} onChange={(e) => set("rating", Number(e.target.value))} className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] text-ink outline-none focus:border-ink">
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} star{r > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} />
                Published (visible on site)
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-md bg-yellow py-3 text-[13.5px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-60"
              >
                {saving ? "Saving…" : editingId ? "Update" : "Add"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md border border-line px-3.5 text-[13px] font-semibold text-body hover:border-ink/40 hover:text-ink"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
