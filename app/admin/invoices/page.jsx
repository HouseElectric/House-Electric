"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import CustomerPicker, { avatarGradient } from "@/components/admin/CustomerPicker";
import { supabase } from "@/lib/supabase";
import {
  ArrowRightIcon,
  ClipboardIcon,
  PlusIcon,
  ReportIcon,
  SlidersIcon,
  TrashIcon,
  UserIcon,
  XIcon,
} from "@/components/icons";

const STATUS_OPTIONS = ["pending", "payment_initiated", "paid", "failed", "cancelled", "refunded", "partially_paid"];
const STATUS_META = {
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500", gradient: "from-amber-500 to-orange-600" },
  payment_initiated: { label: "Processing", cls: "bg-blue-50 text-blue-700", dot: "bg-blue-500", gradient: "from-blue-600 to-indigo-700" },
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", gradient: "from-emerald-600 to-teal-700" },
  failed: { label: "Failed", cls: "bg-red-50 text-red-700", dot: "bg-red-500", gradient: "from-red-600 to-rose-700" },
  cancelled: { label: "Cancelled", cls: "bg-gray-100 text-gray-600", dot: "bg-gray-400", gradient: "from-gray-600 to-gray-800" },
  refunded: { label: "Refunded", cls: "bg-purple-50 text-purple-700", dot: "bg-purple-500", gradient: "from-purple-600 to-violet-700" },
  partially_paid: { label: "Partially Paid", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500", gradient: "from-amber-500 to-orange-600" },
};
const EMPTY_ITEM = { description: "", qty: 1, rate: 0 };

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(null);
  const [selected, setSelected] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ payment_status: "", paid_amount: 0, payment_reference: "" });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    const { data } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
    setInvoices(data ?? []);
  };
  useEffect(() => {
    fetchAll();
    (async () => {
      const { data } = await supabase.from("profiles").select("id, name, email, mobile, avatar_url").eq("is_admin", false);
      setCustomers(data ?? []);
    })();
  }, []);

  const openNew = () => setForm({ customer_id: "", items: [{ ...EMPTY_ITEM }], gst_percent: 18 });
  const setItem = (i, field, value) =>
    setForm((f) => ({ ...f, items: f.items.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)) }));
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (i) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const subtotal = form ? form.items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.rate || 0), 0) : 0;
  const total = form ? subtotal + subtotal * (Number(form.gst_percent || 0) / 100) : 0;

  const save = async (e) => {
    e.preventDefault();
    if (!form.customer_id) {
      toast.error("Please select a customer.");
      return;
    }
    setSaving(true);
    const customer = customers.find((c) => c.id === form.customer_id);
    const payload = {
      customer_id: form.customer_id,
      customer_name: customer?.name,
      customer_email: customer?.email,
      customer_mobile: customer?.mobile,
      items: form.items,
      gst_percent: Number(form.gst_percent) || 0,
      total_amount: total,
      payment_status: "pending",
    };
    const { data: created } = await supabase.from("invoices").insert([payload]).select().single();
    if (created) {
      await supabase.from("notifications").insert([
        {
          customer_id: form.customer_id,
          title: "New invoice generated",
          message: `Invoice ${created.invoice_number} for ₹${total.toLocaleString("en-IN")} has been generated.`,
        },
      ]);
    }
    setSaving(false);
    toast.success("Invoice generated");
    setForm(null);
    fetchAll();
  };

  const openPayment = (inv) => {
    setSelected(inv);
    setPaymentForm({ payment_status: inv.payment_status, paid_amount: inv.paid_amount, payment_reference: inv.payment_reference || "" });
  };

  const savePayment = async () => {
    await supabase
      .from("invoices")
      .update({
        payment_status: paymentForm.payment_status,
        paid_amount: Number(paymentForm.paid_amount) || 0,
        payment_reference: paymentForm.payment_reference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selected.id);

    if (paymentForm.payment_status !== selected.payment_status && selected.customer_id) {
      await supabase.from("notifications").insert([
        {
          customer_id: selected.customer_id,
          title: `Invoice ${selected.invoice_number} updated`,
          message: `Payment status is now "${STATUS_META[paymentForm.payment_status]?.label}".`,
        },
      ]);
    }
    setSelected(null);
    toast.success("Payment details updated");
    fetchAll();
  };

  return (
    <AdminGuard>
      <AdminLayout title="Invoices">
        {form ? (
          <form onSubmit={save} className="max-w-2xl overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            <div className="relative overflow-hidden bg-gradient-to-br from-ink to-[#2a2a2a] p-6 text-white">
              <span className="glow-blob -right-8 -top-10 h-32 w-32 bg-yellow/20" />
              <div className="relative flex items-center gap-3">
                <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-white/15 ring-2 ring-white/30">
                  <ReportIcon className="h-5 w-5" />
                </span>
                <p className="text-[16px] font-extrabold">Generate Invoice</p>
              </div>
            </div>
            <div className="space-y-5 p-6">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                <UserIcon className="h-3.5 w-3.5 text-body/60" />
                Customer *
              </label>
              <CustomerPicker
                customers={customers}
                value={form.customer_id}
                onChange={(id) => setForm((f) => ({ ...f, customer_id: id }))}
              />
              {!form.customer_id && <p className="mt-1 text-[11px] text-red-400">Please select a customer.</p>}
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold text-body">Items</label>
              <div className="space-y-2">
                {form.items.map((it, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-lg border border-line/60 p-2.5 sm:grid sm:grid-cols-[1fr_70px_100px_auto] sm:border-0 sm:p-0">
                    <input
                      required
                      placeholder="Description"
                      value={it.description}
                      onChange={(e) => setItem(i, "description", e.target.value)}
                      className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
                    />
                    <div className="flex items-center gap-2 sm:contents">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={it.qty}
                        onChange={(e) => setItem(i, "qty", e.target.value)}
                        className="w-full min-w-0 flex-1 rounded-md border border-line px-2 py-2 text-[13.5px] outline-none focus:border-ink sm:w-auto"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Rate"
                        value={it.rate}
                        onChange={(e) => setItem(i, "rate", e.target.value)}
                        className="w-full min-w-0 flex-1 rounded-md border border-line px-2 py-2 text-[13.5px] outline-none focus:border-ink sm:w-auto"
                      />
                      <button type="button" onClick={() => removeItem(i)} className="flex-none text-red-400 hover:text-red-600">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addItem} className="mt-2 flex items-center gap-1 text-[12.5px] font-bold text-ink hover:underline">
                <PlusIcon className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>

            <div className="max-w-[160px]">
              <label className="mb-1.5 block text-[12px] font-semibold text-body">GST (%)</label>
              <input
                type="number"
                value={form.gst_percent}
                onChange={(e) => setForm((f) => ({ ...f, gst_percent: e.target.value }))}
                className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
              />
            </div>

            <div className="rounded-xl bg-gradient-to-br from-amber-50/70 to-cream/40 p-4 text-[13.5px] ring-1 ring-yellow/20">
              <div className="flex justify-between text-body">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between border-t border-yellow/25 pt-2">
                <span className="flex items-center gap-1.5 text-[14px] font-extrabold text-ink">
                  <SlidersIcon className="h-3.5 w-3.5 text-yellow-dark" />
                  Total (incl. GST)
                </span>
                <span className="text-[17px] font-extrabold text-ink">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-yellow px-6 py-3 text-[13.5px] font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:opacity-60"
              >
                {saving ? "Generating…" : "Generate Invoice"}
              </button>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="rounded-md border border-line px-6 py-3 text-[13.5px] font-semibold text-body hover:border-ink/40"
              >
                Cancel
              </button>
            </div>
            </div>
          </form>
        ) : (
          <>
            <button
              onClick={openNew}
              className="mb-5 flex items-center gap-1.5 rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md"
            >
              <PlusIcon className="h-4 w-4" />
              Generate Invoice
            </button>

            <div className={`grid grid-cols-1 gap-5 ${selected ? "lg:grid-cols-[1fr_340px]" : ""}`}>
              <div className="overflow-hidden rounded-2xl border border-line bg-white">
                <div className="border-b border-line bg-cream/40 px-5 py-3">
                  <span className="text-[12px] font-bold uppercase tracking-wide text-body">
                    {invoices.length} Invoice{invoices.length === 1 ? "" : "s"}
                  </span>
                </div>
                {invoices.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-body">
                    <ReportIcon className="h-6 w-6 text-body/40" />
                    No invoices yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[13.5px]">
                      <thead>
                        <tr className="border-b border-line bg-cream/40">
                          {["Invoice #", "Customer", "Total", "Paid", "Status", ""].map((h) => (
                            <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((inv) => {
                          const meta = STATUS_META[inv.payment_status] ?? STATUS_META.pending;
                          const name = inv.customer_name || "—";
                          return (
                            <tr
                              key={inv.id}
                              onClick={() => openPayment(inv)}
                              className={`group cursor-pointer border-t border-line transition-colors hover:bg-cream/40 ${
                                selected?.id === inv.id ? "bg-cream/60" : ""
                              }`}
                            >
                              <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-ink">{inv.invoice_number}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-ink">
                                <div className="flex items-center gap-2.5">
                                  <span className={`grid h-7 w-7 flex-none place-items-center rounded-full bg-gradient-to-br text-[11px] font-extrabold text-white shadow-sm ${avatarGradient(name)}`}>
                                    {name.charAt(0).toUpperCase()}
                                  </span>
                                  {name}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 font-bold text-ink">₹{Number(inv.total_amount).toLocaleString("en-IN")}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-body">₹{Number(inv.paid_amount).toLocaleString("en-IN")}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.cls}`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                                  {meta.label}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3">
                                <span className="flex items-center gap-1 text-[12px] font-bold text-ink">
                                  Update
                                  <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {selected && (
                <div className="sticky top-[76px] overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                  <div className={`relative overflow-hidden bg-gradient-to-br p-5 text-white ${(STATUS_META[selected.payment_status] ?? STATUS_META.pending).gradient}`}>
                    <span className="glow-blob -right-8 -top-10 h-28 w-28 bg-white/15" />
                    <button
                      onClick={() => setSelected(null)}
                      aria-label="Close"
                      className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                    <p className="relative font-mono text-[16px] font-extrabold">{selected.invoice_number}</p>
                    <p className="relative mt-1 text-[12.5px] text-white/70">{selected.customer_name}</p>
                    <p className="relative mt-2 text-[22px] font-extrabold">₹{Number(selected.total_amount).toLocaleString("en-IN")}</p>
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
                      className="w-full rounded-md bg-yellow py-3 text-[13.5px] font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
