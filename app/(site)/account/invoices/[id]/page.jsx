"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { startPayment } from "@/lib/payments";
import DocumentTemplate from "@/components/DocumentTemplate";
import ResponsiveDocumentWrapper from "@/components/ResponsiveDocumentWrapper";
import Reveal from "@/components/Reveal";
import { AlertIcon, ArrowLeftIcon, PhoneIcon, PrinterIcon, WhatsAppIcon } from "@/components/icons";

const STATUS_META = {
  pending: { label: "Pending", color: "#b45309" },
  payment_initiated: { label: "Processing", color: "#1d4ed8" },
  paid: { label: "Paid", color: "#047857" },
  failed: { label: "Failed", color: "#b91c1c" },
  cancelled: { label: "Cancelled", color: "#64748b" },
  refunded: { label: "Refunded", color: "#7e22ce" },
  partially_paid: { label: "Partially Paid", color: "#b45309" },
};

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile } = useCustomerAuth();
  const { phone, whatsapp, email, address, gstin } = useSiteSettings();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("invoices").select("*").eq("id", id).eq("customer_id", user.id).maybeSingle();
      setInvoice(data);
      setLoading(false);
    })();
  }, [id, user]);

  if (loading) {
    return <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body">Loading invoice…</div>;
  }
  if (!invoice) {
    return <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body">Invoice not found.</div>;
  }

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const balance = Number(invoice.total_amount) - Number(invoice.paid_amount);
  const meta = STATUS_META[invoice.payment_status] ?? STATUS_META.pending;
  const issuedDate = invoice.created_at
    ? new Date(invoice.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  const totals = [
    { label: "Total Amount", value: `₹${Number(invoice.total_amount).toLocaleString("en-IN")}` },
    { label: "Paid Amount", value: `₹${Number(invoice.paid_amount).toLocaleString("en-IN")}`, color: "#047857" },
  ];

  const handlePayNow = async () => {
    setPayError("");
    setPaying(true);
    try {
      await startPayment({
        type: "invoice",
        invoiceId: invoice.id,
        name: profile?.name,
        email: user?.email,
        contact: profile?.mobile,
        description: `Invoice ${invoice.invoice_number}`,
      });
      const { data } = await supabase.from("invoices").select("*").eq("id", id).eq("customer_id", user.id).maybeSingle();
      setInvoice(data);
      toast.success("Payment successful");
    } catch (err) {
      setPayError(err.message || "Payment failed.");
      toast.error(err.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={() => router.push("/account/invoices")}
          className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap text-[13.5px] font-bold text-ink transition-colors hover:text-yellow-dark"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 flex-none" />
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to Invoices</span>
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
              kind="invoice"
              docNumber={invoice.invoice_number}
              statusLabel={meta.label}
              statusColor={meta.color}
              customerName={invoice.customer_name}
              customerEmail={invoice.customer_email}
              customerMobile={invoice.customer_mobile}
              dateIssued={issuedDate}
              secondaryLabel="Payment Ref"
              secondaryValue={invoice.payment_reference}
              items={items}
              totals={totals}
              finalTotal={{ label: "Balance Due", value: `₹${balance.toLocaleString("en-IN")}` }}
              terms={null}
              address={address}
              phone={phone}
              email={email}
              gstin={gstin}
            />
          </ResponsiveDocumentWrapper>
        </div>
      </Reveal>

      {balance > 0 && invoice.payment_status !== "paid" && (
        <Reveal delay={0.1} className="overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-white p-6 shadow-sm print:hidden">
          {payError && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              <AlertIcon className="mt-0.5 h-4 w-4 flex-none" />
              {payError}
            </div>
          )}
          <p className="mb-4 text-sm font-bold text-ink">
            Outstanding balance of <span className="text-amber-700">₹{balance.toLocaleString("en-IN")}</span> — pay online, or reach out directly.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePayNow}
              disabled={paying}
              className="inline-flex items-center gap-2 rounded-2xl bg-yellow px-6 py-3.5 text-sm font-black text-ink shadow-md transition-all hover:bg-yellow-dark hover:scale-[1.02] disabled:opacity-60"
            >
              {paying ? "Opening payment…" : `Pay ₹${balance.toLocaleString("en-IN")} Now`}
            </button>
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white px-5 py-3.5 text-sm font-bold text-ink shadow-2xs transition-all hover:border-ink"
            >
              <PhoneIcon className="h-4 w-4" />
              Call {phone}
            </a>
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi House Electric, I'd like to pay invoice ${invoice.invoice_number} (balance ₹${balance}).`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white px-5 py-3.5 text-sm font-bold text-ink shadow-2xs transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Pay via WhatsApp
            </a>
          </div>
        </Reveal>
      )}
    </div>
  );
}
