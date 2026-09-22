"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import CustomerPicker from "@/components/admin/CustomerPicker";
import PhotoThumbnail from "@/components/PhotoThumbnail";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/imagekit";
import { ArrowLeftIcon, CalendarIcon, ChevronDown, ReportIcon, UploadIcon, UserIcon } from "@/components/icons";

const INSPECTION_CATEGORIES = [
  "Main DB",
  "Sub DB",
  "MCB",
  "RCCB / RCBO",
  "Switches",
  "Sockets",
  "Lighting",
  "Fans",
  "Visible Wiring",
  "Earthing",
  "Electrical Load",
  "Safety Observations",
  "Other Accessible Installations",
];

const STATUS_OPTIONS = [
  { value: "good", label: "Good", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "attention", label: "Attention Required", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "repair", label: "Improvement / Repair Recommended", cls: "bg-red-50 text-red-700 border-red-200" },
];

function emptyItems() {
  return INSPECTION_CATEGORIES.map((category) => ({
    category,
    status: "good",
    observation: "",
    recommendation: "",
    priority: "low",
    photo_url: "",
    remarks: "",
  }));
}

export default function AdminHealthReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [healthCheck, setHealthCheck] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [customerProperties, setCustomerProperties] = useState([]);
  const [form, setForm] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set());

  const toggleExpanded = (i) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  useEffect(() => {
    (async () => {
      const [{ data: hc }, { data: existing }, { data: custs }, { data: amcPlans }] = await Promise.all([
        supabase.from("health_checks").select("*").eq("id", id).maybeSingle(),
        supabase.from("health_reports").select("*").eq("health_check_id", id).maybeSingle(),
        supabase.from("profiles").select("id, name, email, mobile, avatar_url").eq("is_admin", false),
        supabase.from("amc_plans").select("id, name, price_label").eq("active", true).order("display_order"),
      ]);
      setHealthCheck(hc);
      setCustomers(custs ?? []);
      setPlans(amcPlans ?? []);

      if (existing) {
        setReportId(existing.id);
        const items =
          Array.isArray(existing.items) && existing.items.length > 0
            ? existing.items.map((it) => ({ remarks: "", ...it }))
            : emptyItems();
        setForm({ ...existing, items });
        // Auto-open items that already have findings so a returning admin sees them immediately.
        setExpanded(
          new Set(
            items
              .map((it, i) => (it.status !== "good" || it.observation || it.recommendation || it.remarks ? i : null))
              .filter((i) => i !== null)
          )
        );
      } else if (hc) {
        setForm({
          customer_id: hc.customer_id || "",
          customer_name: hc.name || "",
          property_id: "",
          property_name: "",
          property_address: hc.address || "",
          property_type: hc.property_type || "",
          inspection_date: new Date().toISOString().slice(0, 10),
          inspector_name: hc.engineer_name || "",
          items: emptyItems(),
          summary: "",
          recommended_plan_id: "",
          recommended_plan_note: "",
          status: "draft",
        });
      }
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (!form?.customer_id) {
      setCustomerProperties([]);
      return;
    }
    (async () => {
      const { data } = await supabase.from("properties").select("id, label, address").eq("customer_id", form.customer_id);
      setCustomerProperties(data ?? []);
    })();
  }, [form?.customer_id]);

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const setItem = (i, field, value) =>
    setForm((f) => ({ ...f, items: f.items.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)) }));

  const uploadItemPhoto = async (i, file) => {
    if (!file) return;
    setUploadingIdx(i);
    try {
      const url = await uploadImage(file, "house-electric/health-reports");
      setItem(i, "photo_url", url);
    } catch (err) {
      toast.error(err.message || "Photo upload failed.");
    } finally {
      setUploadingIdx(null);
    }
  };

  const persist = useCallback(
    async (patch) => {
      const customer = customers.find((c) => c.id === form.customer_id);
      const payload = {
        health_check_id: id,
        customer_id: form.customer_id || null,
        customer_name: form.customer_name || customer?.name || null,
        property_id: form.property_id || null,
        property_name: form.property_name,
        property_address: form.property_address,
        property_type: form.property_type,
        inspection_date: form.inspection_date || null,
        inspector_name: form.inspector_name,
        items: form.items,
        summary: form.summary,
        recommended_plan_id: form.recommended_plan_id || null,
        recommended_plan_note: form.recommended_plan_note,
        status: form.status,
        ...patch,
      };

      if (reportId) {
        const { data } = await supabase.from("health_reports").update(payload).eq("id", reportId).select().single();
        return data;
      }
      const { data } = await supabase.from("health_reports").insert([payload]).select().single();
      if (data) setReportId(data.id);
      return data;
    },
    [customers, form, id, reportId]
  );

  const saveDraft = async () => {
    setSaving(true);
    try {
      await persist({ status: "draft" });
      toast.success("Draft saved");
    } catch (err) {
      toast.error("Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const publishAndNotify = async () => {
    setSaving(true);
    try {
      const saved = await persist({ status: "published" });
      setField("status", "published");
      if (saved) {
        if (saved.customer_id) {
          await supabase.from("notifications").insert([
            {
              customer_id: saved.customer_id,
              title: "Your electrical health report is ready",
              message: `Report ${saved.report_number} has been published — view your findings and recommended AMC plan.`,
            },
          ]);
        }
        const {
          data: { session },
        } = await supabase.auth.getSession();
        await fetch("/api/health-reports/notify", {
          method: "POST",
          headers: { "content-type": "application/json", Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({ reportId: saved.id }),
        }).catch((err) => console.error("Health report email trigger failed:", err));
      }
      toast.success("Report published and customer notified");
    } catch (err) {
      toast.error("Failed to publish report");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <AdminGuard>
        <AdminLayout title="Health Report">
          <div className="p-12 text-center text-[13.5px] text-body">Loading…</div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminLayout title="Health Report">
        <button
          onClick={() => router.push("/admin/health-checks")}
          className="mb-4 flex items-center gap-1.5 text-[13px] font-semibold text-body hover:text-ink"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to Health Checks
        </button>

        <div className="max-w-4xl space-y-5">
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            <div className="relative overflow-hidden bg-gradient-to-br from-ink to-[#2a2a2a] p-6 text-white">
              <span className="glow-blob -right-8 -top-10 h-32 w-32 bg-yellow/20" />
              <div className="relative flex items-center gap-3">
                <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-white/15 ring-2 ring-white/30">
                  <ReportIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[16px] font-extrabold">Electrical Health Report</p>
                  {form.report_number && <p className="text-[12px] text-white/60">{form.report_number}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                  <UserIcon className="h-3.5 w-3.5 text-body/60" />
                  Linked Customer (optional — enables viewing in their account)
                </label>
                <CustomerPicker customers={customers} value={form.customer_id} onChange={(v) => setField("customer_id", v)} />
              </div>

              {customerProperties.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-body">
                    Linked Property <span className="font-normal text-body/70">(links this report under that property in their account)</span>
                  </label>
                  <select
                    value={form.property_id || ""}
                    onChange={(e) => {
                      const p = customerProperties.find((cp) => cp.id === e.target.value);
                      setForm((f) => ({
                        ...f,
                        property_id: e.target.value,
                        property_name: p ? p.label : f.property_name,
                        property_address: p ? p.address : f.property_address,
                      }));
                    }}
                    className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
                  >
                    <option value="">Not linked to a specific property</option>
                    {customerProperties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-body">Customer Name</label>
                  <input
                    value={form.customer_name || ""}
                    onChange={(e) => setField("customer_name", e.target.value)}
                    className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-body">Property Name</label>
                  <input
                    value={form.property_name || ""}
                    onChange={(e) => setField("property_name", e.target.value)}
                    placeholder="e.g. Home – Delhi"
                    className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[12px] font-semibold text-body">Property Address</label>
                  <input
                    value={form.property_address || ""}
                    onChange={(e) => setField("property_address", e.target.value)}
                    className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-body">Property Type</label>
                  <input
                    value={form.property_type || ""}
                    onChange={(e) => setField("property_type", e.target.value)}
                    className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                    <CalendarIcon className="h-3.5 w-3.5 text-body/60" />
                    Inspection Date
                  </label>
                  <input
                    type="date"
                    value={form.inspection_date || ""}
                    onChange={(e) => setField("inspection_date", e.target.value)}
                    className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[12px] font-semibold text-body">Inspector / Engineer</label>
                  <input
                    value={form.inspector_name || ""}
                    onChange={(e) => setField("inspector_name", e.target.value)}
                    className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-[14px] font-extrabold text-ink">Inspection Items</h3>
                <p className="text-[11.5px] text-body">
                  {form.items.filter((it) => it.status !== "good").length} of {form.items.length} flagged for attention
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setExpanded(new Set(form.items.map((_, i) => i)))}
                  className="rounded-md border border-line px-2.5 py-1 text-[11.5px] font-bold text-body hover:border-ink/40 hover:text-ink"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(new Set())}
                  className="rounded-md border border-line px-2.5 py-1 text-[11.5px] font-bold text-body hover:border-ink/40 hover:text-ink"
                >
                  Collapse All
                </button>
              </div>
            </div>
            <div className="space-y-2.5">
              {form.items.map((item, i) => {
                const isOpen = expanded.has(i);
                const statusMeta = STATUS_OPTIONS.find((s) => s.value === item.status) ?? STATUS_OPTIONS[0];
                return (
                  <div key={item.category} className="rounded-xl border border-line/80 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(i)}
                      className="flex w-full flex-wrap items-center justify-between gap-2 p-3.5 text-left hover:bg-cream/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <ChevronDown className={`h-4 w-4 flex-none text-body/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        <p className="text-[13.5px] font-extrabold text-ink">{item.category}</p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusMeta.cls}`}>{statusMeta.label}</span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-line/80 p-4">
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {STATUS_OPTIONS.map((s) => (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => setItem(i, "status", s.value)}
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all ${
                                item.status === s.value ? s.cls : "border-line text-body hover:border-ink/30"
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-[11px] font-semibold text-body">Observation</label>
                            <textarea
                              rows={2}
                              value={item.observation}
                              onChange={(e) => setItem(i, "observation", e.target.value)}
                              className="w-full rounded-md border border-line px-2.5 py-2 text-[13px] outline-none focus:border-ink"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[11px] font-semibold text-body">Recommendation</label>
                            <textarea
                              rows={2}
                              value={item.recommendation}
                              onChange={(e) => setItem(i, "recommendation", e.target.value)}
                              className="w-full rounded-md border border-line px-2.5 py-2 text-[13px] outline-none focus:border-ink"
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <div>
                            <label className="mb-1 block text-[11px] font-semibold text-body">Priority</label>
                            <select
                              value={item.priority}
                              onChange={(e) => setItem(i, "priority", e.target.value)}
                              className="rounded-md border border-line px-2.5 py-1.5 text-[12.5px] outline-none focus:border-ink"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>

                          <div className="flex-1">
                            <label className="mb-1 block text-[11px] font-semibold text-body">Photo</label>
                            {item.photo_url ? (
                              <div className="flex items-center gap-2">
                                <PhotoThumbnail src={item.photo_url} alt={item.category} className="h-12 w-16 rounded-md border border-line object-cover" />
                                <label className="cursor-pointer text-[11.5px] font-bold text-ink underline underline-offset-2">
                                  Replace
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadItemPhoto(i, e.target.files[0])} />
                                </label>
                              </div>
                            ) : (
                              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-line px-3 py-1.5 text-[12px] font-semibold text-body hover:border-yellow hover:text-ink">
                                <UploadIcon className="h-3.5 w-3.5" />
                                {uploadingIdx === i ? "Uploading…" : "Upload photo"}
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadItemPhoto(i, e.target.files[0])} />
                              </label>
                            )}
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="mb-1 block text-[11px] font-semibold text-body">Remarks</label>
                          <textarea
                            rows={2}
                            value={item.remarks || ""}
                            onChange={(e) => setItem(i, "remarks", e.target.value)}
                            placeholder="Any additional notes for this item (optional)"
                            className="w-full rounded-md border border-line px-2.5 py-2 text-[13px] outline-none focus:border-ink"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-[14px] font-extrabold text-ink">Summary &amp; AMC Recommendation</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-body">Overall Summary / Remarks</label>
                <textarea
                  rows={3}
                  value={form.summary || ""}
                  onChange={(e) => setField("summary", e.target.value)}
                  className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-body">Recommended AMC Plan</label>
                  <select
                    value={form.recommended_plan_id || ""}
                    onChange={(e) => setField("recommended_plan_id", e.target.value)}
                    className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
                  >
                    <option value="">No recommendation</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.price_label ? `— ${p.price_label}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-body">Recommendation Note</label>
                  <input
                    value={form.recommended_plan_note || ""}
                    onChange={(e) => setField("recommended_plan_note", e.target.value)}
                    placeholder="Optional note for the customer"
                    className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] outline-none focus:border-ink"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={saveDraft}
                disabled={saving}
                className="rounded-md border border-line px-6 py-3 text-[13.5px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:border-ink/40 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Draft"}
              </button>
              <button
                onClick={publishAndNotify}
                disabled={saving}
                className="rounded-md bg-yellow px-6 py-3 text-[13.5px] font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:opacity-60"
              >
                {saving ? "Publishing…" : "Publish & Notify Customer"}
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
