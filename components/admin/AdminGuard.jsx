"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export default function AdminGuard({ children }) {
  const { user, isAdmin, loading, supabaseReady } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && supabaseReady && !user) {
      router.replace("/admin/login");
    } else if (!loading && supabaseReady && user && !isAdmin) {
      router.replace("/account");
    }
  }, [loading, supabaseReady, user, isAdmin, router]);

  if (loading) {
    return (
      <div className="grid h-screen place-items-center bg-[#0F0F0F]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/15 border-t-yellow" />
      </div>
    );
  }

  if (!supabaseReady) {
    return (
      <div className="grid h-screen place-items-center bg-[#0F0F0F] p-8">
        <div className="max-w-md rounded-xl border border-red-900/40 bg-[#1a1010] p-8 text-center">
          <h2 className="mb-3 text-lg font-bold text-white">Supabase Not Configured</h2>
          <p className="text-sm leading-relaxed text-white/60">
            Add <code className="rounded bg-white/10 px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5">.env</code> file, then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return children;
}
