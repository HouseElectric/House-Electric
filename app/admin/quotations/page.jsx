"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import CustomerPicker, { avatarGradient } from "@/components/admin/CustomerPicker";
import { supabase } from "@/lib/supabase";
import { CalendarIcon, ClipboardIcon, PlusIcon, ReportIcon, SlidersIcon, TrashIcon, UserIcon } from "@/components/icons";

const STATUS_META = {
  draft: { label: "Draft", cls: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  sent: { label: "Sent", cls: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  viewed: { label: "Viewed", cls: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
  accepted: { label: "Accepted", cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  rejected: { label: "Rejected", cls: "bg-red-50 text-red-700", dot: "bg-red-500" },
  expired: { label: "Expired", cls: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
  paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-600" },
};

const EMPTY_ITEM = { description: "", qty: 1, rate: 0 };

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    const { data } = await supabase.from("quotations").select("*").order("created_at", { ascending: false });
    setQuotations(data ?? []);
  };
  useEffect(() => {
    fetchAll();
    (async () => {
      const { data } = await supabase.from("profiles").select("id, name, email, mobile, avatar_url").eq("is_admin", false);
      setCustomers(data ?? []);
    })();
  }, []);

  const openNew = () =>
    setForm({
      customer_id: "",
      items: [{ ...EMPTY_ITEM }],
      discount: 0,
      gst_percent: 18,
      terms: "Valid for 15 days. 50% advance required to begin work.",
      valid_until: "",
    });

  const setItem = (i, field, value) =>
    setForm((f) => ({ ...f, items: f.items.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)) }));
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (i) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const subtotal = form ? form.items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.rate || 0), 0) : 0;
  const afterDiscount = form ? subtotal - Number(form.discount || 0) : 0;
  const total = form ? afterDiscount + afterDiscount * (Number(form.gst_percent || 0) / 100) : 0;

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
      discount: Number(form.discount) || 0,
      gst_percent: Number(form.gst_percent) || 0,
      subtotal,
      total,
      terms: form.terms,
      valid_until: form.valid_until || null,
      status: "sent",
    };
    const { data: created } = await supabase.from("quotations").insert([payload]).select().single();
    if (created) {
      await supabase.from("notifications").insert([
        {
          customer_id: form.customer_id,
          title: "New quotation received",
          message: `Quotation ${created.quotation_number} for ₹${total.toLocaleString("en-IN")} is ready for your review.`,
        },
      ]);
    }
    setSaving(false);
    toast.success("Quotation sent to customer");
    setForm(null);
    fetchAll();
  };

  return (
    <AdminGuard>
      <AdminLayout title="Quotations">
        {form ? (
          <form onSubmit={save} className="max-w-2xl overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            <div className="relative overflow-hidden bg-gradient-to-br from-ink to-[#2a2a2a] p-6 text-white">
              <span className="glow-blob -right-8 -top-10 h-32 w-32 bg-yellow/20" />
              <div className="relative flex items-center gap-3">
                <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-white/15 ring-2 ring-white/30">
                  <ReportIcon className="h-5 w-5" />
                </span>
                <p className="text-[16px] font-extrabold">Create Quotation</p>
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-body">Discount (₹)</label>
                <input
                  type="number"
                  value={form.discount}
                  onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                  className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-body">GST (%)</label>
                <input
                  type="number"
                  value={form.gst_percent}
                  onChange={(e) => setForm((f) => ({ ...f, gst_percent: e.target.value }))}
                  className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                  <CalendarIcon className="h-3.5 w-3.5 text-body/60" />
                  Valid Until
                </label>
                <input
                  type="date"
                  value={form.valid_until}
                  onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))}
                  className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                <ClipboardIcon className="h-3.5 w-3.5 text-body/60" />
                Terms &amp; Conditions
              </label>
              <textarea
                rows={2}
                value={form.terms}
                onChange={(e) => setForm((f) => ({ ...f, terms: e.target.value }))}
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
                {saving ? "Sending…" : "Send Quotation"}
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
              Create Quotation
            </button>

            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              <div className="border-b border-line bg-cream/40 px-5 py-3">
                <span className="text-[12px] font-bold uppercase tracking-wide text-body">
                  {quotations.length} Quotation{quotations.length === 1 ? "" : "s"}
                </span>
              </div>
              {quotations.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-body">
                  <ReportIcon className="h-6 w-6 text-body/40" />
                  No quotations yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[13.5px]">
                    <thead>
                      <tr className="border-b border-line bg-cream/40">
                        {["Quotation #", "Customer", "Total", "Status", "Valid Until"].map((h) => (
                          <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {quotations.map((q) => {
                        const meta = STATUS_META[q.status] ?? STATUS_META.draft;
                        const name = q.customer_name || "—";
                        return (
                          <tr key={q.id} className="border-t border-line transition-colors hover:bg-cream/30">
                            <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-ink">{q.quotation_number}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-ink">
                              <div className="flex items-center gap-2.5">
                                <span className={`grid h-7 w-7 flex-none place-items-center rounded-full bg-gradient-to-br text-[11px] font-extrabold text-white shadow-sm ${avatarGradient(name)}`}>
                                  {name.charAt(0).toUpperCase()}
                                </span>
                                {name}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 font-bold text-ink">₹{Number(q.total).toLocaleString("en-IN")}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.cls}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                                {meta.label}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-body">{q.valid_until || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
