"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { supabase } from "@/lib/supabase";
import { CheckCircle } from "@/components/icons";

export default function AmcBuyButton({ planId, planName, className }) {
  const { user } = useCustomerAuth();
  const [checkingOwnership, setCheckingOwnership] = useState(true);
  const [alreadyActive, setAlreadyActive] = useState(false);

  useEffect(() => {
    if (!user || !supabase) {
      setCheckingOwnership(false);
      return;
    }
    (async () => {
      const { data: sub } = await supabase
        .from("amc_subscriptions")
        .select("id")
        .eq("customer_id", user.id)
        .eq("plan_id", planId)
        .eq("status", "active")
        .maybeSingle();
      setAlreadyActive(!!sub);
      setCheckingOwnership(false);
    })();
  }, [user, planId]);

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
      <Link
        href={user ? `/amc/checkout/${planId}` : `/login?redirect=/amc/checkout/${planId}`}
        className="inline-flex w-full items-center justify-center rounded-md bg-yellow px-6 py-3 text-[13.5px] font-extrabold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-lg"
      >
        {checkingOwnership ? "Checking…" : user ? "Buy This Plan" : "Login to Buy"}
      </Link>
    </div>
  );
}
