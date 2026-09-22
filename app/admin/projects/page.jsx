"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/imagekit";
import {
  CameraIcon,
  ClipboardIcon,
  EditIcon,
  ImageIcon,
  PinIcon,
  PlusIcon,
  SparklesIcon,
  StarIcon,
  TrashIcon,
  UploadIcon,
  XIcon,
} from "@/components/icons";

const PRESET_CATEGORIES = [
  "Residential",
  "Commercial",
  "Installation",
  "Maintenance",
  "Health Check",
  "Repair",
  "AMC",
  "Corporate",
];

function CategoryPicker({ value, onChange, options }) {
  const [custom, setCustom] = useState(value !== "" && !options.includes(value));

  if (custom) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter custom category name"
          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs sm:text-sm text-ink outline-none transition-all focus:border-ink focus:ring-2 focus:ring-yellow/20 shadow-2xs"
        />
        <button
          type="button"
          onClick={() => {
            setCustom(false);
            onChange(options[0] || "General");
          }}
          className="whitespace-nowrap rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-body transition-colors hover:text-ink hover:bg-slate-50"
        >
          Cancel
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
      className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs sm:text-sm text-ink outline-none transition-all focus:border-ink focus:ring-2 focus:ring-yellow/20 shadow-2xs cursor-pointer font-bold"
    >
      {options.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
      <option value="__custom__">+ Create new category…</option>
    </select>
  );
}

function AdminProjectsPageInner() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Project State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categoryFromUrl || "Commercial");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [newImages, setNewImages] = useState([]); // [{ url, caption }]
  const [coverUrl, setCoverUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const fileInputRef = useRef(null);

  // Modal / Editing State
  const [editing, setEditing] = useState(null); // project object being edited
  const [editUploading, setEditUploading] = useState(false);
  const [editUploadProgress, setEditUploadProgress] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const editFileInputRef = useRef(null);

  // Names of categories created via /admin/project-categories with no photos yet — merged into
  // the category picker below so a brand-new category is selectable immediately. Category
  // creation and cover photos are managed entirely on that separate page now.
  const [managedCategoryNames, setManagedCategoryNames] = useState([]);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    // Normalize images array for each project
    const normalized = (data ?? []).map((p) => {
      let imgs = [];
      if (Array.isArray(p.images)) {
        imgs = p.images.map((img) =>
          typeof img === "string" ? { url: img, caption: p.title } : img
        );
      } else if (p.image_url) {
        imgs = [{ url: p.image_url, caption: p.title }];
      }
      return {
        ...p,
        images: imgs,
        image_url: p.image_url || imgs[0]?.url || "",
      };
    });

    setItems(normalized);
    setLoading(false);
  };

  const fetchManagedCategoryNames = async () => {
    const { data } = await supabase.from("project_categories").select("name");
    setManagedCategoryNames((data ?? []).map((c) => c.name));
  };

  useEffect(() => {
    fetchItems();
    fetchManagedCategoryNames();
  }, []);

  // Every category that exists, whether or not it has any project albums yet — categories are
  // created and covered from /admin/project-categories; this just makes a freshly-created,
  // still-empty category selectable here immediately.
  const categoryOptions = useMemo(() => {
    const used = items.map((p) => p.category?.trim()).filter(Boolean);
    return Array.from(new Set([...PRESET_CATEGORIES, ...managedCategoryNames, ...used]));
  }, [items, managedCategoryNames]);

  // Handle uploading multiple photos for the NEW project
  const handleNewFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    const files = Array.from(filesList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    setUploading(true);
    const added = [];

    for (let i = 0; i < files.length; i++) {
      setUploadProgress(`Uploading photo ${i + 1} of ${files.length}…`);
      try {
        const url = await uploadImage(files[i], "house-electric/projects");
        if (url) {
          added.push({ url, caption: title || "Project Photo" });
        }
      } catch (err) {
        toast.error(`Failed to upload ${files[i].name}: ${err.message}`);
      }
    }

    setNewImages((prev) => {
      const updated = [...prev, ...added];
      // Automatically pick first photo as cover if not set yet
      if (!coverUrl && updated.length > 0) {
        setCoverUrl(updated[0].url);
      }
      return updated;
    });

    setUploading(false);
    setUploadProgress("");
    if (added.length > 0) {
      toast.success(`Added ${added.length} photo(s) to album`);
    }
  };

  // Create Project in Database
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a project title.");
      return;
    }
    if (newImages.length === 0) {
      toast.error("Please upload at least one photo for this project.");
      return;
    }

    setSavingNew(true);
    const selectedCover = coverUrl || newImages[0]?.url || "";

    try {
      const { error } = await supabase.from("projects").insert([
        {
          title: title.trim(),
          category: category.trim() || "General",
          location: location.trim(),
          description: description.trim(),
          image_url: selectedCover,
          images: newImages,
          status: "Completed",
          featured,
        },
      ]);

      if (error) throw error;

      toast.success("Project album created successfully!");
      setTitle("");
      setLocation("");
      setDescription("");
      setNewImages([]);
      setCoverUrl("");
      setFeatured(false);
      fetchItems();
    } catch (err) {
      toast.error(err.message || "Failed to create project.");
    } finally {
      setSavingNew(false);
    }
  };

  // Remove photo from NEW project pending list
  const removeNewPhoto = (index) => {
    setNewImages((prev) => {
      const targetUrl = prev[index]?.url;
      const updated = prev.filter((_, i) => i !== index);
      if (coverUrl === targetUrl) {
        setCoverUrl(updated[0]?.url || "");
      }
      return updated;
    });
  };

  // Open Edit Modal for an existing project
  const openEditModal = (item) => {
    setEditing({
      id: item.id,
      title: item.title,
      category: item.category || "General",
      location: item.location || "",
      description: item.description || "",
      image_url: item.image_url || item.images[0]?.url || "",
      images: Array.isArray(item.images) ? [...item.images] : [],
      featured: !!item.featured,
    });
  };

  // Upload more photos directly into the project currently being edited
  const handleEditFiles = async (filesList) => {
    if (!filesList || filesList.length === 0 || !editing) return;
    const files = Array.from(filesList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    setEditUploading(true);
    const added = [];

    for (let i = 0; i < files.length; i++) {
      setEditUploadProgress(`Uploading ${i + 1} of ${files.length}…`);
      try {
        const url = await uploadImage(files[i], "house-electric/projects");
        if (url) {
          added.push({ url, caption: editing.title || "Project Photo" });
        }
      } catch (err) {
        toast.error(`Failed to upload ${files[i].name}: ${err.message}`);
      }
    }

    setEditing((curr) => {
      const updatedImages = [...curr.images, ...added];
      const updatedCover = curr.image_url || updatedImages[0]?.url || "";
      return {
        ...curr,
        images: updatedImages,
        image_url: updatedCover,
      };
    });

    setEditUploading(false);
    setEditUploadProgress("");
    if (added.length > 0) {
      toast.success(`Uploaded ${added.length} photo(s) to album`);
    }
  };

  // Remove photo from project currently being edited
  const removeEditPhoto = (index) => {
    setEditing((curr) => {
      const targetUrl = curr.images[index]?.url;
      const updatedImages = curr.images.filter((_, i) => i !== index);
      let updatedCover = curr.image_url;
      if (updatedCover === targetUrl) {
        updatedCover = updatedImages[0]?.url || "";
      }
      return {
        ...curr,
        images: updatedImages,
        image_url: updatedCover,
      };
    });
  };

  // Save changes to existing project
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editing.title.trim()) {
      toast.error("Project title is required.");
      return;
    }
    if (editing.images.length === 0) {
      toast.error("The project album must have at least one photo.");
      return;
    }

    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          title: editing.title.trim(),
          category: editing.category.trim() || "General",
          location: editing.location.trim(),
          description: editing.description.trim(),
          image_url: editing.image_url || editing.images[0]?.url || "",
          images: editing.images,
          featured: editing.featured,
        })
        .eq("id", editing.id);

      if (error) throw error;

      toast.success("Project album updated successfully!");
      setEditing(null);
      fetchItems();
    } catch (err) {
      toast.error(err.message || "Failed to update project.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Project
  const deleteProject = async (id, projectTitle) => {
    if (!confirm(`Are you sure you want to delete "${projectTitle}" and all its photos?`)) {
      return;
    }
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      toast.success("Project album deleted");
      fetchItems();
    } catch (err) {
      toast.error(err.message || "Failed to delete project");
    }
  };

  const totalPhotosCount = useMemo(
    () => items.reduce((acc, p) => acc + (p.images?.length || 1), 0),
    [items]
  );
  const totalCategoriesCount = useMemo(
    () => new Set(items.map((p) => p.category?.trim()).filter(Boolean)).size,
    [items]
  );

  return (
    <AdminGuard>
      <AdminLayout title="Project Work & Albums">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-yellow">
                Dynamic Projects &amp; Work Portfolio
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-ink">
                Project Albums &amp; Gallery Manager
              </h2>
              <p className="text-xs sm:text-sm text-body mt-0.5">
                Create project albums, select cover images, and upload multiple photos.
                100% dynamic — updates live on the public website.
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Total Projects
              </span>
              <p className="mt-1.5 text-2xl font-black text-ink">{items.length}</p>
              <span className="text-[10.5px] text-slate-500">Live albums published</span>
            </div>

            <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Total Photos
              </span>
              <p className="mt-1.5 text-2xl font-black text-amber-800">{totalPhotosCount}</p>
              <span className="text-[10.5px] text-slate-500">Photos across all albums</span>
            </div>

            <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Categories
              </span>
              <p className="mt-1.5 text-2xl font-black text-ink">{totalCategoriesCount}</p>
              <span className="text-[10.5px] text-slate-500">Unique work categories</span>
            </div>

            <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Storage Service
              </span>
              <p className="mt-1.5 text-base sm:text-lg font-black text-emerald-700">ImageKit Cloud</p>
              <span className="text-[10.5px] text-slate-500">CDN optimized high-res</span>
            </div>
          </div>

          {/* Form: Add Project Photos */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col gap-3 border-b border-line/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-yellow-dark">
                  <PlusIcon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-ink">Add Project Photos</h3>
                  <p className="text-xs text-muted">
                    Pick a category, add project details, upload photos, and click &quot;Set as Cover&quot; to choose
                    the album cover photo.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/project-categories"
                className="inline-flex flex-none items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-ink shadow-2xs transition-colors hover:border-ink hover:bg-slate-50"
              >
                <ClipboardIcon className="h-3.5 w-3.5" />
                Manage Categories
              </Link>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Project Title */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-black text-ink">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Office Electrical Fit-Out — Civil Lines"
                    className="w-full rounded-2xl border border-line px-4 py-3 text-xs sm:text-sm outline-none transition-all focus:border-ink focus:ring-2 focus:ring-yellow/20"
                  />
                </div>

                {/* Category Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-ink">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <CategoryPicker
                    value={category}
                    onChange={setCategory}
                    options={categoryOptions}
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-black text-ink">
                    Location / Area (Optional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Civil Lines, New Delhi"
                    className="w-full rounded-2xl border border-line px-4 py-3 text-xs sm:text-sm outline-none transition-all focus:border-ink focus:ring-2 focus:ring-yellow/20"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-black text-ink">
                    Project Scope &amp; Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the electrical work, panels, or safety checks conducted..."
                    className="w-full rounded-2xl border border-line px-4 py-3 text-xs sm:text-sm outline-none transition-all focus:border-ink focus:ring-2 focus:ring-yellow/20"
                  />
                </div>

                {/* Featured on Home Page */}
                <label className="sm:col-span-3 flex items-center gap-2.5 rounded-2xl border border-line px-4 py-3 cursor-pointer hover:border-ink transition-colors w-fit">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="h-4 w-4 accent-yellow-dark"
                  />
                  <span className="text-xs sm:text-sm font-black text-ink flex items-center gap-1.5">
                    <StarIcon className="h-3.5 w-3.5 text-yellow-dark" />
                    Featured on Home Page
                  </span>
                </label>
              </div>

              {/* Photos Upload & Cover Selection Section */}
              <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/20 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <b className="block text-sm font-black text-ink">
                      Project Photos &amp; Cover Selection ({newImages.length} uploaded)
                    </b>
                    <p className="text-xs text-muted">
                      Select multiple photos. Click <span className="font-bold text-amber-800">&quot;Set as Cover&quot;</span> on any photo to make it the folder cover.
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleNewFiles(e.target.files)}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-black text-white shadow-sm hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    <UploadIcon className="h-4 w-4" />
                    <span>{uploading ? uploadProgress || "Uploading…" : "+ Select Photos"}</span>
                  </button>
                </div>

                {/* Uploaded Photos Thumbnails with Cover Selector */}
                {newImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                    {newImages.map((img, idx) => {
                      const isCover = coverUrl === img.url || (!coverUrl && idx === 0);
                      return (
                        <div
                          key={idx}
                          className={`group relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all ${
                            isCover
                              ? "border-amber-500 shadow-md ring-2 ring-yellow/30"
                              : "border-slate-200 hover:border-slate-400"
                          }`}
                        >
                          <img
                            src={img.url}
                            alt="Project photo"
                            className="h-full w-full object-cover"
                          />

                          {/* Cover Badge */}
                          {isCover && (
                            <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[9.5px] font-black uppercase text-white shadow-sm">
                              <StarIcon className="h-3 w-3 fill-white" />
                              <span>Cover</span>
                            </span>
                          )}

                          {/* Action Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => setCoverUrl(img.url)}
                                className="w-full rounded-md bg-white/90 py-1 text-[10px] font-black text-ink hover:bg-white shadow-sm"
                              >
                                Set as Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeNewPhoto(idx)}
                              className="rounded-md bg-red-600/90 p-1.5 text-white hover:bg-red-700 shadow-sm"
                              title="Remove Photo"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingNew || uploading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-yellow px-8 py-3.5 text-xs sm:text-sm font-black text-ink shadow-sm transition-all hover:bg-yellow-dark hover:shadow-md disabled:opacity-50"
                >
                  <SparklesIcon className="h-4 w-4" />
                  <span>{savingNew ? "Creating Album…" : "Create Project Album"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Projects List */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/70 pb-4">
              <div>
                <h3 className="text-lg font-black text-ink">All Published Project Albums ({items.length})</h3>
                <p className="text-xs text-muted">
                  Click &quot;Manage Album &amp; Photos&quot; on any project to add more photos or change its cover image.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-sm font-bold text-muted">
                Loading projects from database…
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-12 text-center space-y-2">
                <ImageIcon className="h-10 w-10 text-slate-400 mx-auto" />
                <b className="block text-base font-black text-ink">No Projects Created Yet</b>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Use the form above to add your first project album with multiple photos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((p) => {
                  const cover = p.image_url || p.images[0]?.url || "";
                  const photoCount = p.images?.length || 1;

                  return (
                    <div
                      key={p.id}
                      className="group rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden transition-all hover:shadow-md hover:border-slate-300 flex flex-col justify-between"
                    >
                      {/* Cover Thumbnail */}
                      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                        {cover ? (
                          <img
                            src={cover}
                            alt={p.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-slate-400">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                          <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[10.5px] font-black text-ink shadow-sm backdrop-blur-xs">
                            {p.category}
                          </span>
                          <span className="rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-[10.5px] font-black shadow-sm flex items-center gap-1">
                            <CameraIcon className="h-3 w-3" />
                            <span>{photoCount} Photos</span>
                          </span>
                        </div>
                      </div>

                      {/* Info & Actions */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <b className="block text-sm font-black text-ink line-clamp-2 leading-snug">
                            {p.title}
                          </b>
                          {p.location && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-muted font-bold">
                              <PinIcon className="h-3 w-3 text-amber-600 shrink-0" />
                              <span className="truncate">{p.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 text-xs font-black text-ink shadow-2xs hover:bg-slate-50 hover:border-ink transition-all"
                          >
                            <EditIcon className="h-3.5 w-3.5 text-slate-600" />
                            <span>Manage Photos</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteProject(p.id, p.title)}
                            className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 transition-colors"
                            title="Delete Project"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* EDIT / MANAGE PHOTOS MODAL */}
          {editing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
              <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line/70 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase text-amber-700">
                      Manage Album &amp; Photos
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-ink">{editing.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-black text-ink">Project Title</label>
                      <input
                        type="text"
                        required
                        value={editing.title}
                        onChange={(e) => setEditing((c) => ({ ...c, title: e.target.value }))}
                        className="w-full rounded-xl border border-line px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-ink"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-ink">Category</label>
                      <CategoryPicker
                        value={editing.category}
                        onChange={(cat) => setEditing((c) => ({ ...c, category: cat }))}
                        options={categoryOptions}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-ink">Location</label>
                      <input
                        type="text"
                        value={editing.location}
                        onChange={(e) => setEditing((c) => ({ ...c, location: e.target.value }))}
                        className="w-full rounded-xl border border-line px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-ink"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-black text-ink">Description</label>
                      <input
                        type="text"
                        value={editing.description}
                        onChange={(e) => setEditing((c) => ({ ...c, description: e.target.value }))}
                        className="w-full rounded-xl border border-line px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-ink"
                      />
                    </div>

                    <label className="sm:col-span-2 flex items-center gap-2.5 rounded-xl border border-line px-3.5 py-2.5 cursor-pointer hover:border-ink transition-colors w-fit">
                      <input
                        type="checkbox"
                        checked={editing.featured}
                        onChange={(e) => setEditing((c) => ({ ...c, featured: e.target.checked }))}
                        className="h-4 w-4 accent-yellow-dark"
                      />
                      <span className="text-xs sm:text-sm font-black text-ink flex items-center gap-1.5">
                        <StarIcon className="h-3.5 w-3.5 text-yellow-dark" />
                        Featured on Home Page
                      </span>
                    </label>
                  </div>

                  {/* Photos Grid & Cover Picker inside Modal */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <b className="block text-xs sm:text-sm font-black text-ink">
                          Album Photos ({editing.images.length})
                        </b>
                        <p className="text-[11px] text-muted">
                          Click &quot;Set as Cover&quot; on any photo to choose the project cover image.
                        </p>
                      </div>

                      <input
                        ref={editFileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleEditFiles(e.target.files)}
                      />

                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        disabled={editUploading}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-black text-white hover:bg-slate-800 disabled:opacity-50"
                      >
                        <UploadIcon className="h-3.5 w-3.5" />
                        <span>{editUploading ? editUploadProgress || "Uploading…" : "+ Add Photos"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
                      {editing.images.map((img, idx) => {
                        const isCover =
                          editing.image_url === img.url ||
                          (!editing.image_url && idx === 0);
                        return (
                          <div
                            key={idx}
                            className={`group relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                              isCover
                                ? "border-amber-500 shadow-md ring-2 ring-yellow/30"
                                : "border-slate-200 hover:border-slate-400"
                            }`}
                          >
                            <img
                              src={img.url}
                              alt="Project photo"
                              className="h-full w-full object-cover"
                            />

                            {isCover && (
                              <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-sm">
                                <StarIcon className="h-2.5 w-2.5 fill-white" />
                                <span>Cover</span>
                              </span>
                            )}

                            {/* Action Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1.5">
                              {!isCover && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditing((c) => ({ ...c, image_url: img.url }))
                                  }
                                  className="w-full rounded bg-white py-1 text-[10px] font-black text-ink hover:bg-slate-100 shadow-sm"
                                >
                                  Set as Cover
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeEditPhoto(idx)}
                                className="rounded bg-red-600 p-1 text-white hover:bg-red-700 shadow-sm"
                                title="Remove photo from album"
                              >
                                <TrashIcon className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-body hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingEdit || editUploading}
                      className="rounded-xl bg-yellow px-6 py-2.5 text-xs font-black text-ink hover:bg-yellow-dark shadow-sm disabled:opacity-50"
                    >
                      {savingEdit ? "Saving Changes…" : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}

export default function AdminProjectsPage() {
  return (
    <Suspense fallback={null}>
      <AdminProjectsPageInner />
    </Suspense>
  );
}
