"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

export default function CustomerGuard({ children }) {
  const { user, loading, supabaseReady } = useCustomerAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && supabaseReady && !user) {
      router.replace("/login");
    }
  }, [loading, supabaseReady, user, router]);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-line border-t-yellow" />
      </div>
    );
  }

  if (!supabaseReady || !user) return null;

  return children;
}
