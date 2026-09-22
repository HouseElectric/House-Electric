"use client";

import { useParams } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import PropertyDetail from "@/components/admin/PropertyDetail";

export default function PropertyDetailPage() {
  const { id } = useParams();
  return (
    <AdminGuard>
      <PropertyDetail propertyId={id} />
    </AdminGuard>
  );
}
