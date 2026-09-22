"use client";

import { useParams } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import CustomerDetail from "@/components/admin/CustomerDetail";

export default function AdminCustomerDetailPage() {
  const { id } = useParams();
  return (
    <AdminGuard>
      <CustomerDetail customerId={id} />
    </AdminGuard>
  );
}
