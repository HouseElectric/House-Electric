"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { supabase } from "@/lib/supabase";
import { startPayment } from "@/lib/payments";
import toast from "react-hot-toast";
import { CheckCircle } from "@/components/icons";

export default function AmcBuyButton({ planId, planName, className }) {
  const { user, profile } = useCustomerAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingOwnership, setCheckingOwnership] = useState(true);
  const [alreadyActive, setAlreadyActive] = useState(false);

  useEffect(() => {
    if (!user || !supabase) {
      setCheckingOwnership(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("amc_subscriptions")
        .select("id")
        .eq("customer_id", user.id)
        .eq("plan_id", planId)
        .eq("status", "active")
        .maybeSingle();
      setAlreadyActive(!!data);
      setCheckingOwnership(false);
    })();
  }, [user, planId]);

  const handleClick = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await startPayment({
        type: "amc",
        planId,
        name: profile?.name,
        email: user.email,
        contact: profile?.mobile,
        description: `AMC Plan — ${planName}`,
      });
      toast.success("AMC plan purchased successfully");
      router.push("/account/amc");
    } catch (err) {
      setError(err.message || "Payment failed.");
      toast.error(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!checkingOwnership && alreadyActive) {
    return (
      <div className={className}>
        <Link
          href="/account/amc"
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-6 py-3 text-[13.5px] font-extrabold text-emerald-700 transition-all hover:bg-emerald-100"
        >
          <CheckCircle className="h-4 w-4" />
          Already Active — Manage AMC
        </Link>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={loading || checkingOwnership}
        className="inline-flex w-full items-center justify-center rounded-md bg-yellow px-6 py-3 text-[13.5px] font-extrabold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-lg disabled:translate-y-0 disabled:opacity-60"
      >
        {loading ? "Opening payment…" : checkingOwnership ? "Checking…" : user ? "Buy This Plan" : "Login to Buy"}
      </button>
      {error && <p className="mt-2 text-[12px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}
