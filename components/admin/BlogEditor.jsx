"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "./AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage, cloudinaryConfigured } from "@/lib/cloudinary";
import { ArrowLeftIcon } from "@/components/icons";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

const CATEGORIES = ["Electrical Safety", "Maintenance Tips", "AMC", "Installation", "Company News"];

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic"],
    ["blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const EMPTY = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  cover_image_alt: "",
  category: "",
  tags: "",
  author: "House Electric Team",
  status: "draft",
  seo_title: "",
  seo_description: "",
};

function CoverImageField({ value, alt, onChangeAlt, onUpload, onRemove, showToast }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast("Image must be under 10 MB.", "error");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file, "house-electric/blog");
      onUpload(url);
      showToast("Image uploaded!");
    } catch (err) {
      showToast(err.message, "error");
    }
    setUploading(false);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {value ? (
        <div className="relative">
          <img src={value} alt="Cover" className="h-36 w-full rounded-lg border border-line object-cover" />
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md bg-black/70 px-2.5 py-1.5 text-[11.5px] font-bold text-white backdrop-blur"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="rounded-md bg-red-500/80 px-2.5 py-1.5 text-[11.5px] font-bold text-white backdrop-blur"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files[0]);
          }}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            dragOver ? "border-yellow bg-yellow/5" : "border-line bg-cream/30"
          }`}
        >
          {uploading ? (
            <p className="text-[13px] font-semibold text-body">Uploading…</p>
          ) : (
            <>
              <p className="text-[13px] font-semibold text-body">{dragOver ? "Drop to upload" : "Click or drag & drop"}</p>
              <p className="mt-1 text-[11.5px] text-body">PNG, JPG, WebP — max 10 MB</p>
              {!cloudinaryConfigured && (
                <p className="mt-2 text-[11px] font-bold text-red-500">⚠ Cloudinary not configured</p>
              )}
            </>
          )}
        </div>
      )}

      <div className="mt-3">
        <label className="mb-1 block text-[12px] font-semibold text-body">Image Alt Text</label>
        <input
          value={alt}
          onChange={(e) => onChangeAlt(e.target.value)}
          placeholder="Describe the image…"
          className="w-full rounded-md border border-line px-3 py-2 text-[13px] outline-none focus:border-ink"
        />
      </div>
    </div>
  );
}

export default function BlogEditor({ postId }) {
  const router = useRouter();
  const isEdit = !!postId;

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [slugLock, setSlugLock] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data } = await supabase.from("blog_posts").select("*").eq("id", postId).single();
      if (data) {
        setForm({ ...EMPTY, ...data, tags: (data.tags ?? []).join(", ") });
        setSlugLock(true);
      }
      setLoading(false);
    })();
  }, [postId, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTitle = (v) => {
    set("title", v);
    if (!slugLock) set("slug", slugify(v));
    if (!form.seo_title) set("seo_title", v);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.slug.trim()) e.slug = "Slug is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (publishNow = false) => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      status: publishNow ? "published" : form.status,
    };
    if (publishNow && !payload.published_at) payload.published_at = new Date().toISOString();
    payload.updated_at = new Date().toISOString();
    delete payload.id;
    delete payload.created_at;

    const { error } = isEdit
      ? await supabase.from("blog_posts").update(payload).eq("id", postId)
      : await supabase.from("blog_posts").insert([payload]);

    setSaving(false);
    if (error) {
      showToast(error.message, "error");
    } else {
      showToast(publishNow ? "Post published!" : "Draft saved!");
      setTimeout(() => router.push("/admin/blog"), 900);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={isEdit ? "Edit Post" : "New Post"}>
        <div className="rounded-2xl border border-line bg-white p-16 text-center text-[13.5px] text-body">
          Loading post...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? "Edit Blog Post" : "New Blog Post"}>
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[999] rounded-lg border px-4 py-3 text-[13.5px] font-semibold shadow-lg ${
            toast.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            onClick={() => router.push("/admin/blog")}
            className="mb-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-body hover:text-ink"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to Posts
          </button>
          <h3 className="text-[19px] font-extrabold text-ink">
            {isEdit ? `Edit — ${form.title || "Post"}` : "New Blog Post"}
          </h3>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="rounded-md border border-line px-4 py-3 text-[13.5px] font-semibold text-body hover:border-ink/40 hover:text-ink disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving}
            className="whitespace-nowrap rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink hover:bg-yellow-dark disabled:opacity-60"
          >
            {form.status === "published" ? "Update Post" : "Publish Post"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-line bg-white p-6">
            <div className="mb-4">
              <label className="mb-1.5 block text-[13px] font-bold text-ink">Post Title *</label>
              <input
                value={form.title}
                onChange={(e) => handleTitle(e.target.value)}
                placeholder="e.g. 5 Warning Signs Your Wiring Needs Attention"
                className="w-full rounded-md border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-ink"
              />
              {errors.title && <p className="mt-1 text-[12px] text-red-500">{errors.title}</p>}
            </div>
            <div className="mb-4">
              <label className="mb-1.5 block text-[13px] font-bold text-ink">URL Slug *</label>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-body">/blog/</span>
                <input
                  value={form.slug}
                  onChange={(e) => {
                    set("slug", slugify(e.target.value));
                    setSlugLock(true);
                  }}
                  className="flex-1 rounded-md border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-ink"
                />
              </div>
              {errors.slug && <p className="mt-1 text-[12px] text-red-500">{errors.slug}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-bold text-ink">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={2}
                placeholder="Short summary shown in the blog listing…"
                className="w-full rounded-md border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-ink"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6">
            <label className="mb-2 block text-[13px] font-bold text-ink">Content</label>
            <ReactQuill theme="snow" value={form.content} onChange={(v) => set("content", v)} modules={QUILL_MODULES} />
          </div>

          <div className="rounded-2xl border border-line bg-white p-6">
            <h3 className="mb-4 text-[14.5px] font-extrabold text-ink">SEO Settings</h3>
            <div className="mb-4">
              <label className="mb-1.5 block text-[13px] font-bold text-ink">SEO Title</label>
              <input
                value={form.seo_title}
                onChange={(e) => set("seo_title", e.target.value)}
                className="w-full rounded-md border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-bold text-ink">Meta Description</label>
              <textarea
                value={form.seo_description}
                onChange={(e) => set("seo_description", e.target.value)}
                rows={3}
                className="w-full rounded-md border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-ink"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-line bg-white p-5">
            <h3 className="mb-3 text-[14px] font-extrabold text-ink">Publish Settings</h3>
            <div className="mb-3.5">
              <label className="mb-1 block text-[12px] font-semibold text-body">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-body">Author</label>
              <input
                value={form.author}
                onChange={(e) => set("author", e.target.value)}
                className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <h3 className="mb-3 text-[14px] font-extrabold text-ink">Category & Tags</h3>
            <div className="mb-3.5">
              <label className="mb-1 block text-[12px] font-semibold text-body">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none"
              >
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-body">Tags</label>
              <input
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="safety, wiring, AMC…"
                className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <h3 className="mb-3 text-[14px] font-extrabold text-ink">Cover Image</h3>
            <CoverImageField
              value={form.cover_image}
              alt={form.cover_image_alt}
              onChangeAlt={(v) => set("cover_image_alt", v)}
              onUpload={(url) => set("cover_image", url)}
              onRemove={() => set("cover_image", "")}
              showToast={showToast}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
