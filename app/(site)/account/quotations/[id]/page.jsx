"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import DocumentTemplate from "@/components/DocumentTemplate";
import ResponsiveDocumentWrapper from "@/components/ResponsiveDocumentWrapper";
import Reveal from "@/components/Reveal";
import { ArrowLeftIcon, CheckCircle, PrinterIcon, XIcon } from "@/components/icons";

const STATUS_META = {
  draft: { label: "Draft", color: "#64748b" },
  sent: { label: "Sent", color: "#1d4ed8" },
  viewed: { label: "Viewed", color: "#4338ca" },
  accepted: { label: "Accepted", color: "#047857" },
  rejected: { label: "Rejected", color: "#b91c1c" },
  expired: { label: "Expired", color: "#64748b" },
  paid: { label: "Paid", color: "#047857" },
};

export default function QuotationDetailPage() {
  const { id } = useParams();
  const { user } = useCustomerAuth();
  const { phone, email, address, gstin } = useSiteSettings();
  const router = useRouter();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("quotations").select("*").eq("id", id).eq("customer_id", user.id).maybeSingle();
      setQuotation(data);
      setLoading(false);
      if (data && data.status === "sent") {
        await supabase.from("quotations").update({ status: "viewed" }).eq("id", id);
      }
    })();
  }, [id, user]);

  const respond = async (status) => {
    setUpdating(true);
    await supabase.from("quotations").update({ status }).eq("id", id);
    setQuotation((q) => ({ ...q, status }));
    setUpdating(false);
    toast.success(status === "accepted" ? "Quotation accepted" : "Quotation declined");
  };

  if (loading) {
    return <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body">Loading quotation…</div>;
  }
  if (!quotation) {
    return <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body">Quotation not found.</div>;
  }

  const items = Array.isArray(quotation.items) ? quotation.items : [];
  const canRespond = ["sent", "viewed"].includes(quotation.status);
  const meta = STATUS_META[quotation.status] ?? STATUS_META.draft;
  const gstAmount = (quotation.subtotal - quotation.discount) * (quotation.gst_percent / 100);
  const issuedDate = quotation.created_at
    ? new Date(quotation.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  const totals = [
    { label: "Subtotal", value: `₹${Number(quotation.subtotal).toLocaleString("en-IN")}` },
    ...(quotation.discount > 0
      ? [{ label: "Discount", value: `-₹${Number(quotation.discount).toLocaleString("en-IN")}`, color: "#047857" }]
      : []),
    { label: `GST (${quotation.gst_percent}%)`, value: `₹${gstAmount.toLocaleString("en-IN")}` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={() => router.push("/account/quotations")}
          className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap text-[13.5px] font-bold text-ink transition-colors hover:text-yellow-dark"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 flex-none" />
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to Quotations</span>
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex flex-none items-center gap-2 whitespace-nowrap rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-black text-ink shadow-2xs transition-all hover:border-ink"
        >
          <PrinterIcon className="h-4 w-4 flex-none" />
          <span className="sm:hidden">Print</span>
          <span className="hidden sm:inline">Print / Save as PDF</span>
        </button>
      </div>

      <Reveal y={12}>
        <div className="rounded-2xl border border-line/80 bg-slate-100/60 p-4 shadow-sm print:block print:rounded-none print:border-0 print:bg-transparent print:p-0 print:shadow-none">
          <ResponsiveDocumentWrapper>
            <DocumentTemplate
              kind="quotation"
              docNumber={quotation.quotation_number}
              statusLabel={meta.label}
              statusColor={meta.color}
              customerName={quotation.customer_name}
              customerEmail={quotation.customer_email}
              customerMobile={quotation.customer_mobile}
              dateIssued={issuedDate}
              secondaryLabel="Valid Until"
              secondaryValue={quotation.valid_until}
              items={items}
              totals={totals}
              finalTotal={{ label: "Total", value: `₹${Number(quotation.total).toLocaleString("en-IN")}` }}
              terms={quotation.terms}
              address={address}
              phone={phone}
              email={email}
              gstin={gstin}
            />
          </ResponsiveDocumentWrapper>
        </div>
      </Reveal>

      {canRespond && (
        <Reveal delay={0.1} className="flex flex-wrap gap-3 print:hidden">
          <button
            onClick={() => respond("accepted")}
            disabled={updating}
            className="inline-flex items-center gap-2 rounded-2xl bg-yellow px-7 py-3.5 text-sm font-black text-ink shadow-md transition-all hover:bg-yellow-dark hover:scale-[1.02] disabled:opacity-60"
          >
            <CheckCircle className="h-4 w-4" />
            Accept Quotation
          </button>
          <button
            onClick={() => respond("rejected")}
            disabled={updating}
            className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white px-7 py-3.5 text-sm font-bold text-ink transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
          >
            <XIcon className="h-4 w-4" />
            Decline
          </button>
        </Reveal>
      )}
      {quotation.status === "accepted" && (
        <Reveal delay={0.1} className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-[13.5px] font-semibold text-emerald-700 print:hidden">
          <CheckCircle className="h-4 w-4 flex-none" />
          You've accepted this quotation. Our team will follow up to schedule the work and share payment details.
        </Reveal>
      )}
    </div>
  );
}
