"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { ArticleIcon, CheckCircle, ClipboardIcon, EditIcon, PlusIcon, SparklesIcon, TrashIcon } from "@/components/icons";

function CountUp({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (typeof value !== "number") return;
    let frame;
    const duration = 700;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return typeof value === "number" ? display : value;
}

function StatCard({ label, value, icon: Icon, cls, glow, accent, delay = 0 }) {
  return (
    <div
      style={{ animationDelay: `${delay}s` }}
      className="card-hover group relative isolate overflow-hidden rounded-2xl border border-line bg-white p-4 opacity-0 animate-fade-up"
    >
      <span className={`absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r ${accent} transition-transform duration-300 ease-out group-hover:scale-x-100`} />
      <span className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${glow}`} />
      <div className="relative flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <p className="text-[11.5px] font-semibold text-body">{label}</p>
          <b className="mt-1 block text-[17px] font-black leading-none tabular-nums text-ink sm:text-[24px]">
            <CountUp value={value} />
          </b>
        </div>
        <span className={`grid h-9 w-9 flex-none place-items-center rounded-xl shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${cls}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

const CATEGORY_CHIP_CLS = [
  "bg-blue-50 text-blue-700",
  "bg-violet-50 text-violet-700",
  "bg-amber-50 text-amber-700",
  "bg-emerald-50 text-emerald-700",
  "bg-rose-50 text-rose-700",
  "bg-cyan-50 text-cyan-700",
];

function categoryChipCls(seed) {
  if (!seed) return "bg-cream text-body";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % CATEGORY_CHIP_CLS.length;
  return CATEGORY_CHIP_CLS[hash];
}

export default function AdminBlogListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (id) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(id);
    await supabase.from("blog_posts").delete().eq("id", id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Blog post deleted");
    setDeleting(null);
  };

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.length - publishedCount;

  return (
    <AdminGuard>
      <AdminLayout title="Blog Posts">
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-ink px-6 py-7 sm:px-8 sm:py-8">
          <span className="glow-blob -right-14 -top-20 h-56 w-56 bg-yellow/25" />
          <span className="glow-blob -bottom-24 -left-10 h-48 w-48 bg-yellow/10" style={{ animationDelay: "2.2s" }} />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow/30 bg-yellow/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-yellow">
              <SparklesIcon className="h-3 w-3" /> Content
            </span>
            <h2 className="mt-3 text-[21px] font-extrabold text-white sm:text-[25px]">Blog Posts</h2>
            <p className="mt-1.5 max-w-[56ch] text-[13.5px] text-white/55">
              Manage the articles shown on the public{" "}
              <a href="/blog" target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline">
                Blog
              </a>{" "}
              page.
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            label="Total Posts"
            value={posts.length}
            icon={ArticleIcon}
            cls="bg-ink text-yellow"
            glow="bg-yellow"
            accent="from-yellow to-amber-500"
            delay={0}
          />
          <StatCard
            label="Published"
            value={publishedCount}
            icon={CheckCircle}
            cls="bg-emerald-50 text-emerald-600"
            glow="bg-emerald-400"
            accent="from-emerald-400 to-teal-500"
            delay={0.06}
          />
          <StatCard
            label="Drafts"
            value={draftCount}
            icon={ClipboardIcon}
            cls="bg-amber-50 text-amber-600"
            glow="bg-amber-400"
            accent="from-amber-400 to-orange-500"
            delay={0.12}
          />
        </div>

        <div className="mb-5 flex items-center justify-end">
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md"
          >
            <PlusIcon className="h-4 w-4" />
            New Post
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="border-b border-line bg-cream/40 px-5 py-3">
            <span className="text-[12px] font-bold uppercase tracking-wide text-body">
              {posts.length} Post{posts.length === 1 ? "" : "s"}
            </span>
          </div>
          {loading ? (
            <div className="p-12 text-center text-[13.5px] text-body">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-body">
              <ArticleIcon className="h-6 w-6 text-body/40" />
              No blog posts yet.{" "}
              <Link href="/admin/blog/new" className="font-semibold text-ink underline">
                Write your first one
              </Link>
              .
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13.5px]">
                <thead>
                  <tr className="border-b border-line bg-cream/40">
                    {["Title", "Category", "Status", "Updated", ""].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.id} className="border-t border-line transition-colors hover:bg-cream/30">
                      <td className="px-4 py-3 font-bold text-ink">{p.title}</td>
                      <td className="px-4 py-3">
                        {p.category ? (
                          <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-bold ${categoryChipCls(p.category)}`}>
                            {p.category}
                          </span>
                        ) : (
                          <span className="text-body/50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-bold ${
                            p.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-cream text-body"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${p.status === "published" ? "bg-emerald-500" : "bg-body/40"}`} />
                          {p.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[12px] text-body">
                        {new Date(p.updated_at || p.created_at).toLocaleDateString("en-GB")}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-4">
                          <Link href={`/admin/blog/${p.id}`} className="flex items-center gap-1 text-[12.5px] font-semibold text-ink hover:underline">
                            <EditIcon className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                          <button
                            onClick={() => deletePost(p.id)}
                            disabled={deleting === p.id}
                            className="flex items-center gap-1 text-[12.5px] font-semibold text-red-400 transition-colors hover:text-red-600"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                            {deleting === p.id ? "…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
