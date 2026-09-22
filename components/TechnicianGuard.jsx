"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTechnicianAuth } from "@/contexts/TechnicianAuthContext";

export default function TechnicianGuard({ children }) {
  const { user, isTechnician, isAdmin, loading, supabaseReady } = useTechnicianAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && supabaseReady && !user) {
      router.replace("/technician/login");
    } else if (!loading && supabaseReady && user && !isTechnician) {
      router.replace(isAdmin ? "/admin" : "/account");
    }
  }, [loading, supabaseReady, user, isTechnician, isAdmin, router]);

  if (loading) {
    return (
      <div className="grid h-screen place-items-center bg-[#0F0F0F]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/15 border-t-yellow" />
      </div>
    );
  }

  if (!supabaseReady || !user || !isTechnician) return null;

  return children;
}
