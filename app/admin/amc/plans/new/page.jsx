"use client";

import AdminGuard from "@/components/admin/AdminGuard";
import AmcPlanForm from "@/components/admin/AmcPlanForm";

export default function NewAmcPlanPage() {
  return (
    <AdminGuard>
      <AmcPlanForm />
    </AdminGuard>
  );
}
