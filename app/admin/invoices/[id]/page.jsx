"use client";

import { useParams } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import InvoicePayment from "@/components/admin/InvoicePayment";

export default function InvoicePaymentPage() {
  const { id } = useParams();
  return (
    <AdminGuard>
      <InvoicePayment invoiceId={id} />
    </AdminGuard>
  );
}
