"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { supabase } from "@/lib/supabase";
import { startPayment } from "@/lib/payments";
import { getCoverageItems } from "@/lib/amcCoverage";
import { CATEGORY_META, DEFAULT_CATEGORY_META } from "@/lib/amcCategoryMeta";
import CoverageStatusIcon from "@/components/CoverageStatusIcon";
import AmcTermsModal from "@/components/AmcTermsModal";
import Reveal from "@/components/Reveal";
import { AlertIcon, AmcBadge, ArrowLeftIcon, CheckCircle, ShieldIcon } from "@/components/icons";

export default function AmcCheckoutPage() {
  const { planId } = useParams();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useCustomerAuth();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [propertyId, setPropertyId] = useState("");
  const [alreadyActive, setAlreadyActive] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("amc_plans").select("*").eq("id", planId).eq("active", true).maybeSingle();
      setPlan(p || null);

      if (user && p) {
        const [{ data: sub }, { data: props }] = await Promise.all([
          supabase.from("amc_subscriptions").select("id").eq("customer_id", user.id).eq("plan_id", p.id).eq("status", "active").maybeSingle(),
          supabase.from("properties").select("id, label, is_default").eq("customer_id", user.id).order("created_at", { ascending: true }),
        ]);
        setAlreadyActive(!!sub);
        setProperties(props ?? []);
        setPropertyId(props?.find((x) => x.is_default)?.id || props?.[0]?.id || "");
      }
      setLoading(false);
    })();
  }, [planId, user]);

  const proceed = async () => {
    setError("");
    setPaying(true);
    try {
      await startPayment({
        type: "amc",
        planId: plan.id,
        propertyId: propertyId || undefined,
        name: profile?.name,
        email: user.email,
        contact: profile?.mobile,
        description: `AMC Plan — ${plan.name}`,
      });
      toast.success("AMC plan purchased successfully");
      router.push("/account/amc");
    } catch (err) {
      setError(err.message || "Payment failed.");
      toast.error(err.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  if (authLoading || loading) {
    return <div className="mx-auto max-w-wrap px-6 py-24 text-center text-[13.5px] text-body">Loading plan…</div>;
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-wrap px-6 py-24 text-center">
        <p className="text-[15px] font-bold text-ink">This plan isn't available anymore.</p>
        <Link href="/amc/plans" className="mt-3 inline-block text-[13.5px] font-bold text-ink underline underline-offset-2">
          Back to AMC Plans
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-wrap px-6 py-24 text-center">
        <p className="text-[15px] font-bold text-ink">Please log in to continue with your AMC purchase.</p>
        <Link
          href={`/login?redirect=/amc/checkout/${plan.id}`}
          className="mt-4 inline-flex items-center justify-center rounded-md bg-yellow px-6 py-3 text-[13.5px] font-extrabold text-ink hover:bg-yellow-dark"
        >
          Log In
        </Link>
      </div>
    );
  }

  const meta = CATEGORY_META[plan.category] || DEFAULT_CATEGORY_META;
  const Icon = meta.icon;
  const items = getCoverageItems(plan);

  return (
    <main className="bg-cream py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <Link href="/amc/plans" className="mb-6 inline-flex items-center gap-1.5 text-[14px] font-bold text-ink hover:text-yellow-dark">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to AMC Plans
        </Link>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_400px]">
          {/* Plan details */}
          <Reveal>
            <div className="rounded-3xl border border-line/80 bg-white p-7 shadow-sm lg:p-9">
              <span className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-sm ${meta.accent}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className={`mb-3 inline-block w-fit rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${meta.tint}`}>
                {plan.category}
              </span>
              <h1 className="mb-1 text-[28px] font-extrabold text-ink">{plan.name}</h1>
              <div className="mb-5 flex items-baseline gap-1.5">
                <span className="text-[34px] font-black leading-none tracking-tight text-ink">{plan.price_label || "Custom"}</span>
                {plan.price_label && <span className="text-[13.5px] font-semibold text-body">/ {plan.duration_label}</span>}
              </div>

              {Array.isArray(plan.suitable_for) && plan.suitable_for.length > 0 && (
                <div className="mb-5 rounded-xl bg-cream/60 p-4">
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-body">Suitable For</p>
                  <p className="text-[14.5px] font-semibold text-ink-soft">{plan.suitable_for.join(" · ")}</p>
                </div>
              )}

              {(plan.visit_limit_type || plan.response_time_sla) && (
                <div className="mb-6 flex flex-wrap gap-2">
                  <span className="rounded-full border border-line bg-cream/60 px-3 py-1.5 text-[12.5px] font-bold text-ink-soft">
                    {plan.visit_limit_type === "defined"
                      ? `${plan.visit_limit_count || "Limited"} Covered Visits`
                      : plan.visit_limit_type === "fair_use"
                      ? "Fair-Use Visits"
                      : "Unlimited Covered Visits"}
                  </span>
                  {plan.response_time_sla && (
                    <span className="rounded-full border border-line bg-cream/60 px-3 py-1.5 text-[12.5px] font-bold text-ink-soft">
                      {plan.response_time_sla}
                    </span>
                  )}
                </div>
              )}

              {items.length > 0 && (
                <div>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-body">Coverage</p>
                  <div className="space-y-2.5">
                    {items.map((it) => (
                      <div key={it.name} className="flex items-center gap-3 text-[14.5px] text-ink-soft">
                        <CoverageStatusIcon status={it.status} />
                        {it.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          {/* Purchase panel */}
          <Reveal delay={0.1}>
            <div className="sticky top-24 rounded-3xl border border-line/80 bg-white p-7 shadow-sm">
              {alreadyActive ? (
                <>
                  <p className="mb-4 flex items-center gap-2 text-[14.5px] font-bold text-emerald-700">
                    <CheckCircle className="h-4 w-4" />
                    You already have this plan active.
                  </p>
                  <Link
                    href="/account/amc"
                    className="inline-flex w-full items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-6 py-3 text-[14.5px] font-extrabold text-emerald-700 hover:bg-emerald-100"
                  >
                    Manage AMC
                  </Link>
                </>
              ) : (
                <>
                  <p className="mb-4 text-[15px] font-extrabold text-ink">Confirm Your Purchase</p>

                  <div className="mb-5 rounded-2xl border border-line/80 bg-cream/50 p-4">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-body">Order Summary</p>
                    <div className="flex items-center justify-between text-[14.5px]">
                      <span className="font-semibold text-ink-soft">{plan.name} AMC</span>
                      <span className="font-extrabold text-ink">{plan.price_label || "Custom"}</span>
                    </div>
                    {plan.duration_label && <p className="mt-0.5 text-[12.5px] text-body">Billed once, valid for {plan.duration_label.toLowerCase()}</p>}
                  </div>

                  {properties.length > 0 ? (
                    <div className="mb-4">
                      <label className="mb-1.5 block text-[13.5px] font-bold text-ink">Which property is this AMC for?</label>
                      <select
                        value={propertyId}
                        onChange={(e) => setPropertyId(e.target.value)}
                        className="w-full rounded-xl border border-line px-3.5 py-2.5 text-[14.5px] outline-none transition-colors focus:border-ink"
                      >
                        {properties.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-[13.5px] text-amber-800">
                      You haven't added a property yet.{" "}
                      <Link href="/account/properties" className="font-bold underline underline-offset-2">
                        Add one first
                      </Link>{" "}
                      — or continue and add it later from your dashboard.
                    </div>
                  )}

                  <label className="mb-4 flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-soft">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 flex-none rounded border-line accent-yellow"
                    />
                    <span>
                      I have read and agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="font-bold text-ink underline underline-offset-2 hover:text-yellow-dark"
                      >
                        AMC Terms &amp; Conditions
                      </button>
                      .
                    </span>
                  </label>

                  {error && (
                    <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
                      <AlertIcon className="mt-0.5 h-3.5 w-3.5 flex-none" />
                      {error}
                    </div>
                  )}

                  <button
                    onClick={proceed}
                    disabled={paying || !agreed}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-yellow px-6 py-3.5 text-[15px] font-extrabold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-lg disabled:translate-y-0 disabled:opacity-60"
                  >
                    {paying ? "Opening payment…" : "Continue to Payment"}
                  </button>

                  <div className="mt-5 space-y-2.5 border-t border-line/70 pt-4">
                    <p className="flex items-center gap-2 text-[12.5px] font-semibold text-body">
                      <ShieldIcon className="h-3.5 w-3.5 flex-none text-emerald-600" />
                      Secure payment powered by Cashfree
                    </p>
                    <p className="flex items-center gap-2 text-[12.5px] font-semibold text-body">
                      <CheckCircle className="h-3.5 w-3.5 flex-none text-emerald-600" />
                      UPI, Cards, Net Banking &amp; Wallets accepted
                    </p>
                    <p className="flex items-center gap-2 text-[12.5px] font-semibold text-body">
                      <AmcBadge className="h-3.5 w-3.5 flex-none text-emerald-600" />
                      Never auto-charged for material or new work
                    </p>
                  </div>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      <AmcTermsModal open={showTerms} onClose={() => setShowTerms(false)} />
    </main>
  );
}
