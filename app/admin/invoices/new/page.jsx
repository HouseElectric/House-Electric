"use client";

import AdminGuard from "@/components/admin/AdminGuard";
import InvoiceForm from "@/components/admin/InvoiceForm";

export default function NewInvoicePage() {
  return (
    <AdminGuard>
      <InvoiceForm />
    </AdminGuard>
  );
}
