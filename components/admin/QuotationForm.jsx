"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import CustomerPicker from "@/components/admin/CustomerPicker";
import { supabase } from "@/lib/supabase";
import {
  AmcBadge,
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircle,
  ClipboardIcon,
  PlusIcon,
  ReportIcon,
  SlidersIcon,
  SparklesIcon,
  TrashIcon,
  UserIcon,
} from "@/components/icons";

const VISIT_FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "half_yearly", label: "Half-Yearly" },
  { value: "yearly", label: "Yearly" },
];

const EMPTY_ITEM = { description: "", qty: 1, rate: 0 };

export default function QuotationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceRequestId = searchParams.get("serviceRequestId") || "";
  const prefillCustomerId = searchParams.get("customerId") || "";
  const isCorporate = searchParams.get("corporate") === "1";
  const enquiryId = searchParams.get("enquiryId") || "";
  const leadName = searchParams.get("name") || "";
  const leadEmail = searchParams.get("email") || "";
  const leadMobile = searchParams.get("mobile") || "";

  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("id, name, email, mobile, avatar_url").eq("is_admin", false);
      setCustomers(data ?? []);
    })();
  }, []);

  useEffect(() => {
    openNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once customers load, try to auto-select a registered account matching the lead's email —
  // only patches customer_id, never re-runs the whole form (so it can't clobber typed input).
  useEffect(() => {
    if (!isCorporate || !leadEmail || customers.length === 0) return;
    const matched = customers.find((c) => c.email?.toLowerCase() === leadEmail.toLowerCase());
    if (matched) setForm((f) => (f && !f.customer_id ? { ...f, customer_id: matched.id } : f));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers, isCorporate, leadEmail]);

  const openNew = () => {
    setForm({
      customer_id: prefillCustomerId,
      service_request_id: serviceRequestId || null,
      quotation_type: isCorporate ? "corporate_amc" : "standard",
      enquiry_id: enquiryId || null,
      scope_of_work: "",
      visit_frequency: "quarterly",
      response_time_sla: "",
      manpower: "",
      exclusions: "",
      amc_duration_months: 12,
      items: [{ ...EMPTY_ITEM }],
      discount: 0,
      gst_percent: 18,
      terms: "Valid for 15 days. 50% advance required to begin work.",
      valid_until: "",
    });
  };

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
      service_request_id: form.service_request_id || null,
      quotation_type: form.quotation_type || "standard",
      enquiry_id: form.enquiry_id || null,
      scope_of_work: form.quotation_type === "corporate_amc" ? form.scope_of_work || null : null,
      visit_frequency: form.quotation_type === "corporate_amc" ? form.visit_frequency || null : null,
      response_time_sla: form.quotation_type === "corporate_amc" ? form.response_time_sla || null : null,
      manpower: form.quotation_type === "corporate_amc" ? form.manpower || null : null,
      exclusions: form.quotation_type === "corporate_amc" ? form.exclusions || null : null,
      amc_duration_months: form.quotation_type === "corporate_amc" ? Number(form.amc_duration_months) || 12 : null,
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

      if (form.service_request_id) {
        await supabase.from("service_requests").update({ status: "customer_approval_pending" }).eq("id", form.service_request_id);
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      fetch("/api/quotations/notify", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ quotationId: created.id }),
      }).catch((err) => console.error("Quotation email trigger failed:", err));
      if (form.service_request_id) {
        fetch("/api/service-requests/notify-status", {
          method: "POST",
          headers: { "content-type": "application/json", Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({ requestId: form.service_request_id }),
        }).catch((err) => console.error("Service request status email trigger failed:", err));
      }
    }
    setSaving(false);
    toast.success("Quotation sent to customer");
    router.push("/admin/quotations");
  };

  if (!form) {
    return (
      <AdminLayout title="Quotations">
        <div className="rounded-2xl border border-line bg-white p-16 text-center text-[13.5px] text-body">Loading…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quotations">
      <button
        onClick={() => router.push("/admin/quotations")}
        className="mb-4 flex items-center gap-1.5 text-[13px] font-semibold text-body hover:text-ink"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to Quotations
      </button>

      <form onSubmit={save} className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-line bg-white shadow-[0_20px_60px_-25px_rgba(20,20,20,0.25)]">
      <div className="relative overflow-hidden bg-gradient-to-br from-ink to-[#2a2a2a] p-7 text-white">
        <span className="glow-blob -right-10 -top-14 h-40 w-40 bg-yellow/20" />
        <span className="glow-blob -bottom-16 left-1/3 h-32 w-32 bg-white/10" />
        <div className="relative flex items-center gap-4">
          <span className="grid h-14 w-14 flex-none place-items-center rounded-full bg-white/15 shadow-lg ring-2 ring-white/30">
            <ReportIcon className="h-6 w-6" />
          </span>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow/30 bg-yellow/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow">
              <SparklesIcon className="h-2.5 w-2.5" />
              New
            </span>
            <p className="mt-1.5 text-[18px] font-extrabold">{form.quotation_type === "corporate_amc" ? "Create Corporate AMC Quotation" : "Create Quotation"}</p>
          </div>
        </div>
      </div>
      <div className="space-y-5 p-7">
      {form.service_request_id && (
        <div className="rounded-md border border-orange-200 bg-orange-50 px-4 py-2.5 text-[12.5px] font-semibold text-orange-800">
          Linked to service request — sending this quotation will mark it "Awaiting Your Approval".
        </div>
      )}
      {form.quotation_type === "corporate_amc" && (leadName || leadEmail || leadMobile) && (
        <div className="rounded-md border border-yellow/40 bg-yellow/10 px-4 py-2.5 text-[12.5px] font-semibold text-ink">
          Lead: {leadName || "—"} {leadEmail && `· ${leadEmail}`} {leadMobile && `· ${leadMobile}`}
          {!form.customer_id && " — select or create their registered account below to send this quotation."}
        </div>
      )}
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

      {form.quotation_type === "corporate_amc" && (
        <div className="space-y-4 rounded-xl border border-line/70 bg-cream/30 p-4">
          <p className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-ink">
            <AmcBadge className="h-3.5 w-3.5 text-yellow-dark" />
            Corporate AMC Scope
          </p>
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-body">Scope of Work (one item per line)</label>
            <textarea
              rows={3}
              value={form.scope_of_work}
              onChange={(e) => setForm((f) => ({ ...f, scope_of_work: e.target.value }))}
              placeholder={"Preventive DB inspection\nPanel thermography\nEarthing checks"}
              className="w-full rounded-xl border border-line/90 bg-white px-3 py-2 text-[13.5px] outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-body">Visit Frequency</label>
              <select
                value={form.visit_frequency}
                onChange={(e) => setForm((f) => ({ ...f, visit_frequency: e.target.value }))}
                className="w-full rounded-xl border border-line/90 bg-white px-3 py-2 text-[13.5px] outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15"
              >
                {VISIT_FREQUENCIES.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-body">AMC Duration (months)</label>
              <input
                type="number"
                min="1"
                value={form.amc_duration_months}
                onChange={(e) => setForm((f) => ({ ...f, amc_duration_months: e.target.value }))}
                className="w-full rounded-xl border border-line/90 bg-white px-3 py-2 text-[13.5px] outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-body">Response Time / SLA</label>
              <input
                value={form.response_time_sla}
                onChange={(e) => setForm((f) => ({ ...f, response_time_sla: e.target.value }))}
                placeholder="e.g. 30 min emergency response"
                className="w-full rounded-xl border border-line/90 bg-white px-3 py-2 text-[13.5px] outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-body">Manpower</label>
              <input
                value={form.manpower}
                onChange={(e) => setForm((f) => ({ ...f, manpower: e.target.value }))}
                placeholder="e.g. 1 resident electrician + 1 supervisor"
                className="w-full rounded-xl border border-line/90 bg-white px-3 py-2 text-[13.5px] outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-body">Exclusions</label>
              <input
                value={form.exclusions}
                onChange={(e) => setForm((f) => ({ ...f, exclusions: e.target.value }))}
                placeholder="e.g. HT equipment, civil work"
                className="w-full rounded-xl border border-line/90 bg-white px-3 py-2 text-[13.5px] outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15"
              />
            </div>
          </div>
        </div>
      )}

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
                className="w-full rounded-xl border border-line/90 px-3 py-2 text-[13.5px] outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15"
              />
              <div className="flex items-center gap-2 sm:contents">
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={it.qty}
                  onChange={(e) => setItem(i, "qty", e.target.value)}
                  className="w-full min-w-0 flex-1 rounded-xl border border-line/90 px-2 py-2 text-[13.5px] outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15 sm:w-auto"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Rate"
                  value={it.rate}
                  onChange={(e) => setItem(i, "rate", e.target.value)}
                  className="w-full min-w-0 flex-1 rounded-xl border border-line/90 px-2 py-2 text-[13.5px] outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15 sm:w-auto"
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
            className="w-full rounded-xl border border-line/90 px-3 py-2 text-[13.5px] outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-body">GST (%)</label>
          <input
            type="number"
            value={form.gst_percent}
            onChange={(e) => setForm((f) => ({ ...f, gst_percent: e.target.value }))}
            className="w-full rounded-xl border border-line/90 px-3 py-2 text-[13.5px] outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15"
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
            className="w-full rounded-xl border border-line/90 px-3 py-2 text-[13.5px] outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15"
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
          className="w-full rounded-xl border border-line/90 px-3 py-2 text-[13.5px] outline-none transition-all hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-yellow/15"
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
          className="flex items-center justify-center gap-2 rounded-xl bg-yellow px-6 py-3 text-[13.5px] font-extrabold text-ink shadow-[0_10px_28px_-8px_rgba(242,176,30,0.7)] transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_14px_32px_-8px_rgba(242,176,30,0.85)] disabled:translate-y-0 disabled:opacity-60"
        >
          <CheckCircle className="h-4 w-4" />
          {saving ? "Sending…" : "Send Quotation"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/quotations")}
          className="rounded-xl border border-line/90 px-6 py-3 text-[13.5px] font-semibold text-body transition-colors hover:border-ink/40"
        >
          Cancel
        </button>
      </div>
      </div>
    </form>
    </AdminLayout>
  );
}
