"use client";

import { useParams } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import HealthCheckDetail from "@/components/admin/HealthCheckDetail";

export default function AdminHealthCheckDetailPage() {
  const { id } = useParams();
  return (
    <AdminGuard>
      <HealthCheckDetail bookingId={id} />
    </AdminGuard>
  );
}
