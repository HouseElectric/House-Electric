"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { ClipboardIcon, SlidersIcon, XIcon } from "@/components/icons";

export const STATUS_OPTIONS = ["pending", "payment_initiated", "paid", "failed", "cancelled", "refunded", "partially_paid"];
export const STATUS_META = {
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500", gradient: "from-amber-500 to-orange-600" },
  payment_initiated: { label: "Processing", cls: "bg-blue-50 text-blue-700", dot: "bg-blue-500", gradient: "from-blue-600 to-indigo-700" },
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", gradient: "from-emerald-600 to-teal-700" },
  failed: { label: "Failed", cls: "bg-red-50 text-red-700", dot: "bg-red-500", gradient: "from-red-600 to-rose-700" },
  cancelled: { label: "Cancelled", cls: "bg-gray-100 text-gray-600", dot: "bg-gray-400", gradient: "from-gray-600 to-gray-800" },
  refunded: { label: "Refunded", cls: "bg-purple-50 text-purple-700", dot: "bg-purple-500", gradient: "from-purple-600 to-violet-700" },
  partially_paid: { label: "Partially Paid", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500", gradient: "from-amber-500 to-orange-600" },
};

export default function InvoicePayment({ invoiceId }) {
  const router = useRouter();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentForm, setPaymentForm] = useState({ payment_status: "", paid_amount: 0, payment_reference: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("invoices").select("*").eq("id", invoiceId).single();
      if (data) {
        setInvoice(data);
        setPaymentForm({ payment_status: data.payment_status, paid_amount: data.paid_amount, payment_reference: data.payment_reference || "" });
      }
      setLoading(false);
    })();
  }, [invoiceId]);

  const savePayment = async () => {
    setSaving(true);
    await supabase
      .from("invoices")
      .update({
        payment_status: paymentForm.payment_status,
        paid_amount: Number(paymentForm.paid_amount) || 0,
        payment_reference: paymentForm.payment_reference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoice.id);

    if (paymentForm.payment_status !== invoice.payment_status && invoice.customer_id) {
      await supabase.from("notifications").insert([
        {
          customer_id: invoice.customer_id,
          title: `Invoice ${invoice.invoice_number} updated`,
          message: `Payment status is now "${STATUS_META[paymentForm.payment_status]?.label}".`,
        },
      ]);

      if (paymentForm.payment_status === "paid") {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        fetch("/api/invoices/notify-payment-status", {
          method: "POST",
          headers: { "content-type": "application/json", Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({ invoiceId: invoice.id }),
        }).catch((err) => console.error("Payment status email trigger failed:", err));
      }
    }
    setSaving(false);
    toast.success("Payment details updated");
    router.push("/admin/invoices");
  };

  if (loading) {
    return (
      <AdminLayout title="Invoices">
        <div className="rounded-2xl border border-line bg-white p-16 text-center text-[13.5px] text-body">
          Loading invoice...
        </div>
      </AdminLayout>
    );
  }

  if (!invoice) {
    return (
      <AdminLayout title="Invoices">
        <div className="rounded-2xl border border-line bg-white p-16 text-center text-[13.5px] text-body">
          Invoice not found.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Invoices">
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className={`relative overflow-hidden bg-gradient-to-br p-5 text-white ${(STATUS_META[invoice.payment_status] ?? STATUS_META.pending).gradient}`}>
          <span className="glow-blob -right-8 -top-10 h-28 w-28 bg-white/15" />
          <button
            onClick={() => router.push("/admin/invoices")}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
          <p className="relative font-mono text-[16px] font-extrabold">{invoice.invoice_number}</p>
          <p className="relative mt-1 text-[12.5px] text-white/70">{invoice.customer_name}</p>
          <p className="relative mt-2 text-[22px] font-extrabold">₹{Number(invoice.total_amount).toLocaleString("en-IN")}</p>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-body">
              <SlidersIcon className="h-3.5 w-3.5 text-body/60" />
              Payment Status
            </label>
            <select
              value={paymentForm.payment_status}
              onChange={(e) => setPaymentForm((f) => ({ ...f, payment_status: e.target.value }))}
              className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-body">Paid Amount (₹)</label>
            <input
              type="number"
              value={paymentForm.paid_amount}
              onChange={(e) => setPaymentForm((f) => ({ ...f, paid_amount: e.target.value }))}
              className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-body">
              <ClipboardIcon className="h-3.5 w-3.5 text-body/60" />
              Payment Reference
            </label>
            <input
              value={paymentForm.payment_reference}
              onChange={(e) => setPaymentForm((f) => ({ ...f, payment_reference: e.target.value }))}
              placeholder="UPI ref / cash / cheque no."
              className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
            />
          </div>
          <button
            onClick={savePayment}
            disabled={saving}
            className="w-full rounded-md bg-yellow py-3 text-[13.5px] font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
