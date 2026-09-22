"use client";

import { useParams } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import ServiceEditor from "@/components/admin/ServiceEditor";

export default function EditServicePage() {
  const { id } = useParams();
  return (
    <AdminGuard>
      <ServiceEditor serviceId={id} />
    </AdminGuard>
  );
}
