"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

export default function CustomerGuard({ children }) {
  const { user, profile, loading, supabaseReady } = useCustomerAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && supabaseReady && !user) {
      router.replace("/login");
    } else if (!loading && supabaseReady && user && profile?.is_admin) {
      router.replace("/admin");
    } else if (!loading && supabaseReady && user && profile?.is_technician) {
      router.replace("/technician");
    }
  }, [loading, supabaseReady, user, profile, router]);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-line border-t-yellow" />
      </div>
    );
  }

  if (!supabaseReady || !user || profile?.is_admin || profile?.is_technician) return null;

  return children;
}
