"use client";

import { useParams } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import BlogEditor from "@/components/admin/BlogEditor";

export default function EditBlogPostPage() {
  const { id } = useParams();
  return (
    <AdminGuard>
      <BlogEditor postId={id} />
    </AdminGuard>
  );
}
