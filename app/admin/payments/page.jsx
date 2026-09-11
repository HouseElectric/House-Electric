"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { AmcBadge, ReportIcon, WalletIcon } from "@/components/icons";
import { avatarGradient } from "@/components/admin/CustomerPicker";

const STATUS_META = {
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  partially_paid: { label: "Partially Paid", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  failed: { label: "Failed", cls: "bg-red-50 text-red-700", dot: "bg-red-500" },
  cancelled: { label: "Cancelled", cls: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  refunded: { label: "Refunded", cls: "bg-purple-50 text-purple-700", dot: "bg-purple-500" },
};

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | invoice | amc

  useEffect(() => {
    (async () => {
      const [{ data: invoices }, { data: subs }] = await Promise.all([
        supabase
          .from("invoices")
          .select("id, invoice_number, customer_name, total_amount, paid_amount, payment_status, payment_reference, razorpay_payment_id, updated_at, created_at")
          .gt("paid_amount", 0),
        supabase
          .from("amc_subscriptions")
          .select("id, amc_number, plan_name_snapshot, amount_paid, razorpay_payment_id, created_at, profiles(name, email)")
          .not("amount_paid", "is", null),
      ]);

      const invoiceRows = (invoices ?? []).map((inv) => ({
        id: `inv-${inv.id}`,
        type: "invoice",
        reference: inv.invoice_number,
        customer: inv.customer_name,
        amount: inv.paid_amount,
        status: inv.payment_status,
        paymentRef: inv.razorpay_payment_id || inv.payment_reference,
        date: inv.updated_at || inv.created_at,
      }));

      const amcRows = (subs ?? []).map((s) => ({
        id: `amc-${s.id}`,
        type: "amc",
        reference: s.amc_number,
        customer: s.profiles?.name || s.profiles?.email,
        amount: s.amount_paid,
        status: "paid",
        paymentRef: s.razorpay_payment_id,
        date: s.created_at,
      }));

      const merged = [...invoiceRows, ...amcRows].sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(merged);
      setLoading(false);
    })();
  }, []);

  const filtered = transactions.filter((t) => filter === "all" || t.type === filter);
  const totalCollected = filtered.filter((t) => t.status === "paid").reduce((s, t) => s + Number(t.amount), 0);

  return (
    <AdminGuard>
      <AdminLayout title="Payments">
        <p className="mb-5 max-w-[65ch] text-[13.5px] text-body">
          A combined view of every payment received — from invoices and AMC purchases/renewals — in one
          place.
        </p>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card-hover group relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-emerald-50/50 via-white to-white p-5">
            <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-400 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold text-body">Total Collected</p>
                <b className="mt-1 block text-[28px] font-black leading-none text-ink">₹{totalCollected.toLocaleString("en-IN")}</b>
              </div>
              <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <WalletIcon className="h-5 w-5" />
              </span>
            </div>
          </div>
          <div className="card-hover group relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-blue-50/50 via-white to-white p-5">
            <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-400 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold text-body">Invoice Payments</p>
                <b className="mt-1 block text-[28px] font-black leading-none text-ink">{transactions.filter((t) => t.type === "invoice").length}</b>
              </div>
              <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <ReportIcon className="h-5 w-5" />
              </span>
            </div>
          </div>
          <div className="card-hover group relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-yellow/10 via-white to-white p-5">
            <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-yellow opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold text-body">AMC Payments</p>
                <b className="mt-1 block text-[28px] font-black leading-none text-ink">{transactions.filter((t) => t.type === "amc").length}</b>
              </div>
              <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-yellow/15 text-yellow-dark shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <AmcBadge className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>

        <div className="mb-5 flex w-fit gap-1 rounded-xl border border-line bg-white p-1">
          {[
            { key: "all", label: "All" },
            { key: "invoice", label: "Invoices" },
            { key: "amc", label: "AMC" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-4 py-2 text-[13px] font-bold transition-colors ${
                filter === f.key ? "bg-ink text-white shadow-sm" : "text-body hover:bg-cream"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="border-b border-line bg-cream/40 px-5 py-3">
            <span className="text-[12px] font-bold uppercase tracking-wide text-body">
              {filtered.length} Payment{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
          {loading ? (
            <div className="p-12 text-center text-[13.5px] text-body">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-body">
              <ReportIcon className="h-6 w-6 text-body/40" />
              No payments recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13.5px]">
                <thead>
                  <tr className="border-b border-line bg-cream/40">
                    {["Type", "Reference", "Customer", "Amount", "Status", "Payment Ref", "Date"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const meta = STATUS_META[t.status] ?? STATUS_META.pending;
                    const name = t.customer || "—";
                    return (
                      <tr key={t.id} className="border-t border-line transition-colors hover:bg-cream/30">
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${t.type === "invoice" ? "bg-blue-50 text-blue-700" : "bg-yellow/15 text-yellow-dark"}`}>
                            {t.type === "invoice" ? "Invoice" : "AMC"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-ink">{t.reference}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-ink">
                          <div className="flex items-center gap-2.5">
                            <span className={`grid h-7 w-7 flex-none place-items-center rounded-full bg-gradient-to-br text-[11px] font-extrabold text-white shadow-sm ${avatarGradient(name)}`}>
                              {name.charAt(0).toUpperCase()}
                            </span>
                            {name}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-bold text-ink">₹{Number(t.amount).toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.cls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {t.paymentRef ? (
                            <span className="rounded-md bg-cream px-2 py-1 font-mono text-[11.5px] text-body">{t.paymentRef}</span>
                          ) : (
                            <span className="text-body/50">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[12px] text-body">
                          {new Date(t.date).toLocaleDateString("en-GB")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
