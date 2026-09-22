"use client";

import { Suspense } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import QuotationForm from "@/components/admin/QuotationForm";

export default function NewQuotationPage() {
  return (
    <Suspense fallback={null}>
      <AdminGuard>
        <QuotationForm />
      </AdminGuard>
    </Suspense>
  );
}
