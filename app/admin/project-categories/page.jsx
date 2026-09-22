"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/imagekit";
import { ClipboardIcon, ImageIcon, PlusIcon, SparklesIcon, UploadIcon } from "@/components/icons";

function slugifyCategory(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminProjectCategoriesPage() {
  const router = useRouter();
  const [items, setItems] = useState([]); // project albums, for fallback covers + counts
  const [categoryCovers, setCategoryCovers] = useState([]); // rows from project_categories
  const [loading, setLoading] = useState(true);
  const [uploadingCoverFor, setUploadingCoverFor] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: projects }, { data: covers }] = await Promise.all([
      supabase.from("projects").select("id, title, category, image_url, images").order("created_at", { ascending: false }),
      supabase.from("project_categories").select("*").order("display_order"),
    ]);
    setItems(projects ?? []);
    setCategoryCovers(covers ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Every category that exists, whether or not it has any project albums yet — the union of
  // categories explicitly created (project_categories) and categories picked up from existing
  // albums, so a category shows up here the moment it's created, before it has a single photo.
  const categories = useMemo(() => {
    const used = items.map((p) => p.category?.trim()).filter(Boolean);
    const managed = categoryCovers.map((c) => c.name);
    const names = Array.from(new Set([...managed, ...used]));
    return names.map((name) => {
      const saved = categoryCovers.find((c) => c.name.toLowerCase() === name.toLowerCase());
      const fallback = items.find((p) => p.category?.trim().toLowerCase() === name.toLowerCase());
      const fallbackCover = fallback?.image_url || (Array.isArray(fallback?.images) ? fallback.images[0]?.url : "") || "";
      return {
        name,
        cover_image_url: saved?.cover_image_url || "",
        fallback_cover: fallbackCover,
        projectCount: items.filter((p) => p.category?.trim().toLowerCase() === name.toLowerCase()).length,
      };
    });
  }, [items, categoryCovers]);

  const totalAlbums = items.length;

  const createCategory = async (e) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error("That category already exists.");
      return;
    }
    setCreatingCategory(true);
    try {
      const { error } = await supabase
        .from("project_categories")
        .upsert([{ name, slug: slugifyCategory(name) }], { onConflict: "name" });
      if (error) throw error;
      toast.success(`Category "${name}" created`);
      setNewCategoryName("");
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to create category.");
    } finally {
      setCreatingCategory(false);
    }
  };

  const uploadCategoryCover = async (categoryName, file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploadingCoverFor(categoryName);
    try {
      const url = await uploadImage(file, "house-electric/project-categories");
      const { error } = await supabase
        .from("project_categories")
        .upsert(
          [{ name: categoryName, slug: slugifyCategory(categoryName), cover_image_url: url, updated_at: new Date().toISOString() }],
          { onConflict: "name" }
        );
      if (error) throw error;
      toast.success(`Cover updated for ${categoryName}`);
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to upload category cover.");
    } finally {
      setUploadingCoverFor(null);
    }
  };

  const addPhotosToCategory = (categoryName) => {
    router.push(`/admin/projects?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <AdminGuard>
      <AdminLayout title="Project Categories">
        <div className="space-y-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-yellow">
                <SparklesIcon className="h-3.5 w-3.5" /> Project Portfolio
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-ink">Project Categories</h2>
              <p className="mt-0.5 text-xs sm:text-sm text-body">
                Create categories, set a cover photo for each, then jump straight into adding photos for one.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Categories</span>
              <p className="mt-1.5 text-2xl font-black text-ink">{categories.length}</p>
              <span className="text-[10.5px] text-slate-500">Across the whole portfolio</span>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Total Albums</span>
              <p className="mt-1.5 text-2xl font-black text-amber-800">{totalAlbums}</p>
              <span className="text-[10.5px] text-slate-500">Project albums, all categories</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-line/70 pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-yellow-dark">
                <ClipboardIcon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-black text-ink">Manage Categories</h3>
                <p className="text-xs text-muted">
                  One cover photo per category, shown on the public Projects page. A category with no cover set yet
                  shows an "Auto" cover borrowed from one of its own photos.
                </p>
              </div>
            </div>

            <form onSubmit={createCategory} className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name — e.g. Industrial"
                className="w-full rounded-2xl border border-line px-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-ink focus:ring-2 focus:ring-yellow/20 sm:max-w-xs"
              />
              <button
                type="submit"
                disabled={creatingCategory || !newCategoryName.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-black text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-50"
              >
                <PlusIcon className="h-4 w-4" />
                <span>{creatingCategory ? "Creating…" : "Add Category"}</span>
              </button>
            </form>

            {loading ? (
              <div className="p-12 text-center text-sm font-bold text-muted">Loading categories…</div>
            ) : categories.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-12 text-center space-y-2">
                <ClipboardIcon className="h-10 w-10 text-slate-400 mx-auto" />
                <b className="block text-base font-black text-ink">No Categories Yet</b>
                <p className="text-xs text-muted max-w-sm mx-auto">Create your first category above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((c) => {
                  const cover = c.cover_image_url || c.fallback_cover;
                  const isCustom = !!c.cover_image_url;
                  const inputId = `category-cover-${slugifyCategory(c.name)}`;
                  return (
                    <div key={c.name} className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200">
                      {cover ? (
                        <img src={cover} alt={c.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-slate-100 text-slate-400">
                          <ImageIcon className="h-7 w-7" />
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                      <div className="absolute left-2 top-2 flex items-center gap-1.5">
                        {!isCustom && cover && (
                          <span className="rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-bold uppercase text-white/90 backdrop-blur-xs">
                            Auto
                          </span>
                        )}
                        <span className="rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-bold text-white/90 backdrop-blur-xs">
                          {c.projectCount} {c.projectCount === 1 ? "album" : "albums"}
                        </span>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-3">
                        <p className="truncate text-[12.5px] font-black text-white">{c.name}</p>
                        <button
                          type="button"
                          onClick={() => addPhotosToCategory(c.name)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-yellow py-1.5 text-[10.5px] font-black text-ink shadow-sm transition-colors hover:bg-yellow-dark"
                        >
                          <PlusIcon className="h-3 w-3" />
                          Add Photos
                        </button>
                        <label
                          htmlFor={inputId}
                          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-white/95 py-1.5 text-[10.5px] font-black text-ink shadow-sm transition-colors hover:bg-white"
                        >
                          <UploadIcon className="h-3 w-3" />
                          {uploadingCoverFor === c.name ? "Uploading…" : isCustom ? "Replace Cover" : "Set Cover"}
                        </label>
                        <input
                          id={inputId}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingCoverFor === c.name}
                          onChange={(e) => uploadCategoryCover(c.name, e.target.files[0])}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
