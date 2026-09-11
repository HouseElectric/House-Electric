"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { ImageUploadField } from "@/components/admin/FormKit";
import { supabase } from "@/lib/supabase";
import { uploadImage, imagekitConfigured } from "@/lib/imagekit";
import { EditIcon, ImageIcon, PlusIcon, TrashIcon } from "@/components/icons";

const EMPTY = { title: "", before_image_url: "", after_image_url: "", display_order: 0, active: true };

export default function AdminBeforeAfterPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("before_after_photos").select("*").order("display_order", { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const uploadBefore = async (file) => {
    if (!file) return;
    setUploadingBefore(true);
    try {
      const url = await uploadImage(file, "house-electric/before-after");
      set("before_image_url", url);
    } catch (err) {
      toast.error(err.message);
    }
    setUploadingBefore(false);
  };

  const uploadAfter = async (file) => {
    if (!file) return;
    setUploadingAfter(true);
    try {
      const url = await uploadImage(file, "house-electric/before-after");
      set("after_image_url", url);
    } catch (err) {
      toast.error(err.message);
    }
    setUploadingAfter(false);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.before_image_url || !form.after_image_url) {
      toast.error("Please upload both a before and an after photo.");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim() || null,
      before_image_url: form.before_image_url,
      after_image_url: form.after_image_url,
      display_order: Number(form.display_order) || 0,
      active: form.active,
    };
    if (form.id) {
      await supabase.from("before_after_photos").update(payload).eq("id", form.id);
    } else {
      await supabase.from("before_after_photos").insert([payload]);
    }
    setSaving(false);
    toast.success(form.id ? "Entry updated" : "Entry added");
    setForm(null);
    fetchItems();
  };

  const remove = async (id) => {
    if (!confirm("Delete this before/after entry?")) return;
    await supabase.from("before_after_photos").delete().eq("id", id);
    toast.success("Entry deleted");
    fetchItems();
  };

  const toggleActive = async (item) => {
    await supabase.from("before_after_photos").update({ active: !item.active }).eq("id", item.id);
    toast.success(item.active ? "Entry hidden" : "Entry activated");
    fetchItems();
  };

  return (
    <AdminGuard>
      <AdminLayout title="Before / After Photos">
        <p className="mb-6 max-w-[65ch] text-[13.5px] text-body">
          Real before/after photos of your completed work. Shown as an interactive slider on the homepage —
          only real, genuine project photos should be added here.
        </p>

        {form ? (
          <form onSubmit={save} className="max-w-xl space-y-4 rounded-2xl border border-line bg-white p-6">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-body">Title (optional)</label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. DB Panel Upgrade"
                className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ImageUploadField label="Before Photo *" value={form.before_image_url} uploading={uploadingBefore} onUpload={uploadBefore} aspect="aspect-square" />
              <ImageUploadField label="After Photo *" value={form.after_image_url} uploading={uploadingAfter} onUpload={uploadAfter} aspect="aspect-square" />
            </div>
            {!imagekitConfigured && <p className="text-[11px] font-bold text-red-500">⚠ ImageKit not configured</p>}

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="mb-1.5 block text-[12px] font-semibold text-body">Display Order</label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => set("display_order", e.target.value)}
                  className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                />
              </div>
              <label className="flex items-center gap-2 pt-5 text-[13px] font-semibold text-ink">
                <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
                Live on site
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-yellow px-6 py-3 text-[13.5px] font-extrabold text-ink hover:bg-yellow-dark disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="rounded-md border border-line px-6 py-3 text-[13.5px] font-semibold text-body hover:border-ink/40"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <button
              onClick={() => setForm({ ...EMPTY, display_order: items.length })}
              className="mb-5 flex items-center gap-1.5 rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink hover:bg-yellow-dark"
            >
              <PlusIcon className="h-4 w-4" />
              Add Before / After
            </button>

            {loading ? (
              <div className="rounded-2xl border border-line bg-white p-12 text-center text-[13.5px] text-body">Loading…</div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white p-12 text-center text-[13.5px] text-body">
                <ImageIcon className="h-6 w-6 text-body/40" />
                No before/after photos yet — add one above.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <div key={item.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                    <div className="grid grid-cols-2">
                      <img src={item.before_image_url} alt="Before" className="aspect-square w-full object-cover" />
                      <img src={item.after_image_url} alt="After" className="aspect-square w-full object-cover" />
                    </div>
                    <div className="flex items-center justify-between gap-2 p-4">
                      <div className="min-w-0">
                        <b className="block truncate text-[13.5px] text-ink">{item.title || "Untitled"}</b>
                        <button
                          onClick={() => toggleActive(item)}
                          className={`mt-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${item.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {item.active ? "Live" : "Hidden"}
                        </button>
                      </div>
                      <div className="flex flex-none items-center gap-3">
                        <button
                          onClick={() =>
                            setForm({
                              id: item.id,
                              title: item.title || "",
                              before_image_url: item.before_image_url,
                              after_image_url: item.after_image_url,
                              display_order: item.display_order,
                              active: item.active,
                            })
                          }
                          className="text-ink hover:opacity-70"
                        >
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
