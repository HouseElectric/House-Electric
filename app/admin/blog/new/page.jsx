"use client";

import AdminGuard from "@/components/admin/AdminGuard";
import BlogEditor from "@/components/admin/BlogEditor";

export default function NewBlogPostPage() {
  return (
    <AdminGuard>
      <BlogEditor />
    </AdminGuard>
  );
}
