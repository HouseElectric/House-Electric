"use client";

import { useParams } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import AmcPlanForm from "@/components/admin/AmcPlanForm";

export default function EditAmcPlanPage() {
  const { id } = useParams();
  return (
    <AdminGuard>
      <AmcPlanForm planId={id} />
    </AdminGuard>
  );
}
