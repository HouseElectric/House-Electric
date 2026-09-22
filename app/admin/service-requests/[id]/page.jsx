"use client";

import { useParams } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import ServiceRequestDetail from "@/components/admin/ServiceRequestDetail";

export default function ServiceRequestDetailPage() {
  const { id } = useParams();
  return (
    <AdminGuard>
      <ServiceRequestDetail requestId={id} />
    </AdminGuard>
  );
}
