"use client";

import AdminGuard from "@/components/admin/AdminGuard";
import ServiceEditor from "@/components/admin/ServiceEditor";

export default function NewServicePage() {
  return (
    <AdminGuard>
      <ServiceEditor />
    </AdminGuard>
  );
}
