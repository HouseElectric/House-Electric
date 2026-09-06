"use client";

import { useEffect, useRef, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage, cloudinaryConfigured } from "@/lib/cloudinary";
import { ImageIcon, TrashIcon, UploadIcon } from "@/components/icons";

const CATEGORIES = ["Repair", "Installation", "Maintenance", "Health Check", "AMC", "Residential", "Commercial", "Corporate"];

export default function AdminProjectsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const fileInputRef = useRef(null);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (!title.trim()) {
      alert("Add a title before uploading a photo.");
      return;
    }
    setUploading(true);
    try {
      const image_url = await uploadImage(file, "house-electric/projects");
      await supabase.from("projects").insert([{ title, category, image_url }]);
      setTitle("");
      fetchItems();
    } catch (err) {
      alert(err.message);
    }
    setUploading(false);
  };

  const remove = async (id) => {
    if (!confirm("Delete this photo?")) return;
    await supabase.from("projects").delete().eq("id", id);
    fetchItems();
  };

  return (
    <AdminGuard>
      <AdminLayout title="Projects / Work Gallery">
        <p className="mb-6 max-w-[65ch] text-[13.5px] text-body">
          Photos shown in the work gallery on the public site. Upload a photo with a title and category below.
        </p>

        <div className="mb-6 rounded-2xl border border-line bg-white p-5">
          <h3 className="mb-4 text-[14.5px] font-extrabold text-ink">Add a Photo</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-[12px] font-semibold text-body">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. DB Panel Repair — Napier Town"
                className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-body">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-yellow px-4 py-2.5 text-[13.5px] font-bold text-ink hover:bg-yellow-dark disabled:opacity-60"
            >
              <UploadIcon className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload Photo"}
            </button>
          </div>
          {!cloudinaryConfigured && <p className="mt-2 text-[12px] font-bold text-red-500">⚠ Cloudinary not configured</p>}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-line bg-white p-12 text-center text-[13.5px] text-body">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white p-12 text-center text-[13.5px] text-body">
            <ImageIcon className="h-6 w-6 text-body/40" />
            No project photos yet — add one above.
          </div>
        ) : (
          <>
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-body">
              {items.length} Photo{items.length === 1 ? "" : "s"}
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((p) => (
                <div
                  key={p.id}
                  className="overflow-hidden rounded-xl border border-line bg-white transition-colors hover:border-ink/20"
                >
                  <div className="relative aspect-[4/3]">
                    <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-3">
                    <b className="block truncate text-[13px] text-ink">{p.title}</b>
                    <span className="mt-1 inline-block rounded-full bg-cream px-2 py-0.5 text-[11px] font-bold text-ink">
                      {p.category}
                    </span>
                    <button
                      onClick={() => remove(p.id)}
                      className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-red-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
