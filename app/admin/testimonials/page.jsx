"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { ImageUploadField } from "@/components/admin/FormKit";
import { supabase } from "@/lib/supabase";
import { uploadImage, cloudinaryConfigured } from "@/lib/cloudinary";
import { EditIcon, StarIcon, TrashIcon } from "@/components/icons";

const EMPTY = { name: "", role: "", text: "", rating: 5, avatar_url: "", published: true };

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleAvatarUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "house-electric/testimonials");
      set("avatar_url", url);
    } catch (err) {
      alert(err.message);
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
    fetchItems();
  };

  const togglePublished = async (item) => {
    await supabase.from("testimonials").update({ published: !item.published }).eq("id", item.id);
    fetchItems();
  };

  return (
    <AdminGuard>
      <AdminLayout title="Testimonials">
        <p className="mb-6 max-w-[65ch] text-[13.5px] text-body">
          Customer reviews shown in the testimonials carousel on the homepage. Add, edit, publish/hide or delete them here.
        </p>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="border-b border-line bg-cream/40 px-5 py-3">
              <span className="text-[12px] font-bold uppercase tracking-wide text-body">
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
                  <div key={item.id} className="flex items-start justify-between gap-4 p-5 transition-colors hover:bg-cream/30">
                    <div className="flex min-w-0 gap-3">
                      <div className="h-11 w-11 flex-none overflow-hidden rounded-full border border-line bg-cream">
                        {item.avatar_url ? (
                          <img src={item.avatar_url} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-[13px] font-extrabold text-body/50">
                            {item.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <b className="text-[14px] text-ink">{item.name}</b>
                          {item.role && <span className="text-[12.5px] text-body">· {item.role}</span>}
                          <span className="text-[12px] tracking-wide text-yellow-dark">{"★".repeat(item.rating)}</span>
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
            <h3 className="mb-4 text-[15px] font-extrabold text-ink">{editingId ? "Edit Testimonial" : "Add Testimonial"}</h3>

            <div className="mb-4">
              <ImageUploadField
                label="Photo (optional)"
                value={form.avatar_url}
                uploading={uploading}
                onUpload={handleAvatarUpload}
                aspect="aspect-square"
              />
              {!cloudinaryConfigured && <p className="mt-1 text-[11px] font-bold text-red-500">⚠ Cloudinary not configured</p>}
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
                className="flex-1 rounded-md bg-yellow py-3 text-[13.5px] font-bold text-ink hover:bg-yellow-dark disabled:opacity-60"
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
