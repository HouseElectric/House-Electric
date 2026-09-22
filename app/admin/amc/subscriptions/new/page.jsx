"use client";

import AdminGuard from "@/components/admin/AdminGuard";
import AmcSubscriptionForm from "@/components/admin/AmcSubscriptionForm";

export default function NewAmcSubscriptionPage() {
  return (
    <AdminGuard>
      <AmcSubscriptionForm />
    </AdminGuard>
  );
}
