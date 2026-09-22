"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import CertificateTemplate from "@/components/CertificateTemplate";
import ResponsiveDocumentWrapper from "@/components/ResponsiveDocumentWrapper";
import Reveal from "@/components/Reveal";
import { ArrowLeftIcon, PrinterIcon } from "@/components/icons";

export default function AmcCertificatePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile } = useCustomerAuth();
  const { phone, email, address } = useSiteSettings();
  const [sub, setSub] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("amc_subscriptions").select("*").eq("id", id).eq("customer_id", user.id).maybeSingle();
      setSub(data);
      if (data?.property_id) {
        const { data: p } = await supabase.from("properties").select("label, address").eq("id", data.property_id).maybeSingle();
        setProperty(p);
      }
      setLoading(false);
    })();
  }, [id, user]);

  if (loading) {
    return <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body">Loading certificate…</div>;
  }
  if (!sub) {
    return <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body">AMC membership not found.</div>;
  }

  const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");

  return (
    <div className="space-y-5 print:space-y-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={() => router.push("/account/amc")}
          className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap text-[13.5px] font-bold text-ink transition-colors hover:text-yellow-dark"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 flex-none" />
          Back to My AMC
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex flex-none items-center gap-2 whitespace-nowrap rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-black text-ink shadow-2xs transition-all hover:border-ink"
        >
          <PrinterIcon className="h-4 w-4 flex-none" />
          Print / Save as PDF
        </button>
      </div>

      <Reveal y={12}>
        <div className="rounded-2xl border border-line/80 bg-slate-100/60 p-4 shadow-sm print:flex print:h-screen print:items-center print:justify-center print:overflow-hidden print:rounded-none print:border-0 print:bg-transparent print:p-0 print:shadow-none">
          <ResponsiveDocumentWrapper>
            <CertificateTemplate
              amcNumber={sub.amc_number}
              planName={sub.plan_name_snapshot}
              customerName={profile?.name || user?.email}
              propertyLabel={property?.label}
              propertyAddress={property?.address}
              startDate={fmt(sub.start_date)}
              expiryDate={fmt(sub.expiry_date)}
              coverage={Array.isArray(sub.coverage_snapshot) ? sub.coverage_snapshot : []}
              address={address}
              phone={phone}
              email={email}
            />
          </ResponsiveDocumentWrapper>
        </div>
      </Reveal>
    </div>
  );
}
