"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import CustomerPicker from "@/components/admin/CustomerPicker";
import { supabase } from "@/lib/supabase";
import { PlusIcon, ReportIcon, SlidersIcon, TrashIcon, UserIcon } from "@/components/icons";

const EMPTY_ITEM = { description: "", qty: 1, rate: 0 };

export default function InvoiceForm() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customer_id: "", items: [{ ...EMPTY_ITEM }], gst_percent: 18 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("id, name, email, mobile, avatar_url").eq("is_admin", false);
      setCustomers(data ?? []);
    })();
  }, []);

  const setItem = (i, field, value) =>
    setForm((f) => ({ ...f, items: f.items.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)) }));
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (i) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const subtotal = form.items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.rate || 0), 0);
  const total = subtotal + subtotal * (Number(form.gst_percent || 0) / 100);

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

      const {
        data: { session },
      } = await supabase.auth.getSession();
      fetch("/api/invoices/notify", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ invoiceId: created.id }),
      }).catch((err) => console.error("Invoice email trigger failed:", err));
    }
    setSaving(false);
    toast.success("Invoice generated");
    router.push("/admin/invoices");
  };

  return (
    <AdminLayout title="Invoices">
      <form onSubmit={save} className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
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
            onClick={() => router.push("/admin/invoices")}
            className="rounded-md border border-line px-6 py-3 text-[13.5px] font-semibold text-body hover:border-ink/40"
          >
            Cancel
          </button>
        </div>
        </div>
      </form>
    </AdminLayout>
  );
}
