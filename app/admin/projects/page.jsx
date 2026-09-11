"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { ImageUploadField } from "@/components/admin/FormKit";
import { supabase } from "@/lib/supabase";
import { uploadImage, imagekitConfigured } from "@/lib/imagekit";
import { ImageIcon, TrashIcon, UploadIcon, EditIcon, XIcon } from "@/components/icons";

const CATEGORIES = ["Repair", "Installation", "Maintenance", "Health Check", "AMC", "Residential", "Commercial", "Corporate"];

function CategoryPicker({ value, onChange, options }) {
  const [custom, setCustom] = useState(value !== "" && !options.includes(value));

  if (custom) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="New category name"
          className="w-full min-w-[190px] rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none transition-all focus:border-ink focus:ring-2 focus:ring-yellow/20"
        />
        <button
          type="button"
          onClick={() => {
            setCustom(false);
            onChange(options[0] || "");
          }}
          className="whitespace-nowrap text-[12px] font-semibold text-body transition-colors hover:text-ink hover:underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value === "__custom__") {
          setCustom(true);
          onChange("");
        } else {
          onChange(e.target.value);
        }
      }}
      className="w-full min-w-[190px] rounded-md border border-line px-3 py-2.5 text-[13.5px] text-ink outline-none transition-all focus:border-ink focus:ring-2 focus:ring-yellow/20"
    >
      {options.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
      <option value="__custom__">+ Create custom category…</option>
    </select>
  );
}

export default function AdminProjectsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(null); // { id, title, category, image_url }
  const [editUploading, setEditUploading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Suggest the fixed categories plus any custom ones already used, so typing a
  // brand-new category still works while existing ones stay one click away.
  const categoryOptions = useMemo(() => {
    const fromItems = items.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...CATEGORIES, ...fromItems]));
  }, [items]);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (!title.trim()) {
      toast.error("Add a title before uploading a photo.");
      return;
    }
    setUploading(true);
    try {
      const image_url = await uploadImage(file, "house-electric/projects");
      await supabase.from("projects").insert([{ title, category: category.trim() || "Uncategorized", image_url }]);
      setTitle("");
      toast.success("Project photo added");
      fetchItems();
    } catch (err) {
      toast.error(err.message);
    }
    setUploading(false);
  };

  const remove = async (id) => {
    if (!confirm("Delete this photo?")) return;
    await supabase.from("projects").delete().eq("id", id);
    toast.success("Project photo deleted");
    fetchItems();
  };

  const startEdit = (item) => {
    setEditing({ id: item.id, title: item.title, category: item.category || "", image_url: item.image_url });
  };

  const setEditField = (k, v) => setEditing((e) => ({ ...e, [k]: v }));

  const editUploadPhoto = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setEditUploading(true);
    try {
      const url = await uploadImage(file, "house-electric/projects");
      setEditField("image_url", url);
    } catch (err) {
      toast.error(err.message);
    }
    setEditUploading(false);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    setSavingEdit(true);
    await supabase
      .from("projects")
      .update({
        title: editing.title.trim(),
        category: editing.category.trim() || "Uncategorized",
        image_url: editing.image_url,
      })
      .eq("id", editing.id);
    setSavingEdit(false);
    toast.success("Project photo updated");
    setEditing(null);
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
                className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none transition-all focus:border-ink focus:ring-2 focus:ring-yellow/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-body">Category</label>
              <CategoryPicker value={category} onChange={setCategory} options={categoryOptions} />
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
              className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-yellow px-4 py-2.5 text-[13.5px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-60"
            >
              <UploadIcon className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload Photo"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-body/70">
            Pick an existing category from the dropdown, or choose "+ Create custom category…" to add a new one.
          </p>
          {!imagekitConfigured && <p className="mt-2 text-[12px] font-bold text-red-500">⚠ ImageKit not configured</p>}
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
                  className="group overflow-hidden rounded-xl border border-line bg-white transition-all hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <b className="block truncate text-[13px] text-ink">{p.title}</b>
                    <span className="mt-1 inline-block rounded-full bg-cream px-2 py-0.5 text-[11px] font-bold text-ink">
                      {p.category}
                    </span>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={() => startEdit(p)}
                        className="flex items-center gap-1 text-[12px] font-semibold text-ink hover:underline"
                      >
                        <EditIcon className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => remove(p.id)}
                        className="flex items-center gap-1 text-[12px] font-semibold text-red-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {editing && (
          <>
            <div className="fixed inset-0 z-[190] bg-black/50" onClick={() => setEditing(null)} />
            <div className="fixed inset-x-4 top-1/2 z-[200] max-h-[85vh] -translate-y-1/2 overflow-y-auto rounded-2xl border border-line bg-white shadow-2xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h3 className="text-[14.5px] font-extrabold text-ink">Edit Photo</h3>
                <button
                  onClick={() => setEditing(null)}
                  aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-full text-body transition-colors hover:bg-cream hover:text-ink"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={saveEdit} className="space-y-4 p-5">
                <ImageUploadField
                  label="Photo"
                  value={editing.image_url}
                  uploading={editUploading}
                  onUpload={editUploadPhoto}
                  aspect="aspect-[4/3]"
                />
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-body">Title *</label>
                  <input
                    required
                    value={editing.title}
                    onChange={(e) => setEditField("title", e.target.value)}
                    className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none transition-all focus:border-ink focus:ring-2 focus:ring-yellow/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-body">Category</label>
                  <CategoryPicker
                    value={editing.category}
                    onChange={(v) => setEditField("category", v)}
                    options={categoryOptions}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="flex-1 rounded-md bg-yellow py-3 text-[13.5px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-60"
                  >
                    {savingEdit ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="rounded-md border border-line px-5 text-[13px] font-semibold text-body hover:border-ink/40"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
