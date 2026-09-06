"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { ArticleIcon, EditIcon, PlusIcon, TrashIcon } from "@/components/icons";

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
    setDeleting(null);
  };

  return (
    <AdminGuard>
      <AdminLayout title="Blog Posts">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-[65ch] text-[13.5px] text-body">
            Manage the articles shown on the public{" "}
            <a href="/blog" target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline">
              Blog
            </a>{" "}
            page.
          </p>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink hover:bg-yellow-dark"
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
                    <tr key={p.id} className="border-t border-line transition-colors hover:bg-cream/40">
                      <td className="px-4 py-3 font-bold text-ink">{p.title}</td>
                      <td className="px-4 py-3 text-body">{p.category || "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-bold ${
                            p.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-cream text-body"
                          }`}
                        >
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
                            className="flex items-center gap-1 text-[12.5px] font-semibold text-red-400 hover:text-red-600"
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
