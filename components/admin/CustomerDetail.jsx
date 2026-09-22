"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { avatarGradient } from "@/components/admin/CustomerPicker";
import {
  AmcBadge,
  UsersIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  ClockIcon,
  XIcon,
  BuildingIcon,
  ClipboardIcon,
  HomeIcon,
  LightbulbIcon,
  ReportIcon,
  WrenchIcon,
  ArrowLeftIcon,
  TrashIcon,
  PlusIcon,
  ShieldIcon,
} from "@/components/icons";

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function DetailRow({ icon: Icon, label, value, href }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-lg bg-cream text-ink">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-body">{label}</p>
        {value ? (
          href ? (
            <a href={href} className="text-[13px] font-semibold text-ink hover:underline break-words">
              {value}
            </a>
          ) : (
            <p className="text-[13px] font-semibold text-ink break-words">{value}</p>
          )
        ) : (
          <p className="text-[13px] text-body/50">—</p>
        )}
      </div>
    </div>
  );
}

export default function CustomerDetail({ customerId }) {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [commLog, setCommLog] = useState([]);
  const [commForm, setCommForm] = useState({ channel: "call", direction: "outbound", summary: "" });
  const [savingComm, setSavingComm] = useState(false);
  const [showCommForm, setShowCommForm] = useState(false);

  const fetchCommLog = async (id) => {
    const { data } = await supabase
      .from("communication_log")
      .select("*")
      .eq("customer_id", id)
      .order("created_at", { ascending: false });
    setCommLog(data ?? []);
  };

  const addCommLog = async (e) => {
    e.preventDefault();
    if (!commForm.summary.trim() || !customerId) return;
    setSavingComm(true);
    await supabase.from("communication_log").insert([{ ...commForm, customer_id: customerId }]);
    setCommForm({ channel: "call", direction: "outbound", summary: "" });
    await fetchCommLog(customerId);
    setSavingComm(false);
    setShowCommForm(false);
  };

  const deleteCommLog = async (id) => {
    if (!confirm("Delete this log entry?")) return;
    setCommLog((prev) => prev.filter((c) => c.id !== id));
    await supabase.from("communication_log").delete().eq("id", id);
  };

  useEffect(() => {
    if (!customerId) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", customerId).single();
      setProfile(data ?? null);
      setProfileLoading(false);
    })();
  }, [customerId]);

  useEffect(() => {
    setShowCommForm(false);
    if (!customerId) {
      setSummary(null);
      setCommLog([]);
      return;
    }
    fetchCommLog(customerId);
    setSummaryLoading(true);
    (async () => {
      const [{ data: amcHistory }, { data: invoices }, { data: requests }, { data: properties }, { data: healthReports }, { data: quotations }, { data: healthChecks }] =
        await Promise.all([
          supabase
            .from("amc_subscriptions")
            .select("plan_name_snapshot, amc_number, status, expiry_date")
            .eq("customer_id", customerId)
            .order("expiry_date", { ascending: false }),
          supabase
            .from("invoices")
            .select("id, invoice_number, total_amount, paid_amount, payment_status, created_at")
            .eq("customer_id", customerId)
            .order("created_at", { ascending: false })
            .limit(8),
          supabase
            .from("service_requests")
            .select("id, ticket_number, service_type, status, created_at")
            .eq("customer_id", customerId)
            .order("created_at", { ascending: false })
            .limit(8),
          supabase
            .from("properties")
            .select("id, label, property_type, address, city, state, pincode, area_sqft, electrical_details, is_default")
            .eq("customer_id", customerId)
            .order("is_default", { ascending: false }),
          supabase
            .from("health_reports")
            .select("report_number, property_name, status, created_at")
            .eq("customer_id", customerId)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("quotations")
            .select("quotation_number, total, status, valid_until, created_at")
            .eq("customer_id", customerId)
            .order("created_at", { ascending: false })
            .limit(8),
          supabase
            .from("health_checks")
            .select("request_number, status, preferred_date, engineer_name, created_at")
            .eq("customer_id", customerId)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);
      const pendingAmount = (invoices ?? []).reduce((s, i) => s + Math.max(0, Number(i.total_amount) - Number(i.paid_amount)), 0);
      const activeAmc = (amcHistory ?? []).find((a) => a.status === "active") || null;
      setSummary({
        amc: activeAmc,
        amcHistory: amcHistory ?? [],
        invoices: invoices ?? [],
        invoicesCount: invoices?.length ?? 0,
        pendingAmount,
        requests: requests ?? [],
        requestsCount: requests?.length ?? 0,
        properties: properties ?? [],
        propertiesCount: properties?.length ?? 0,
        healthReports: healthReports ?? [],
        quotations: quotations ?? [],
        quotationsCount: quotations?.length ?? 0,
        healthChecks: healthChecks ?? [],
      });
      setSummaryLoading(false);
    })();
  }, [customerId]);

  if (profileLoading) {
    return (
      <AdminLayout title="Customers">
        <div className="p-12 text-center text-[13.5px] text-body">Loading…</div>
      </AdminLayout>
    );
  }

  if (!profile) {
    return (
      <AdminLayout title="Customers">
        <button
          onClick={() => router.push("/admin/customers")}
          className="mb-4 flex items-center gap-1.5 text-[13px] font-semibold text-body hover:text-ink"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to Customers
        </button>
        <div className="p-12 text-center text-[13.5px] text-body">Customer not found.</div>
      </AdminLayout>
    );
  }

  const name = profile.name || profile.email || "—";
  return (
    <AdminLayout title="Customers">
      <button
        onClick={() => router.push("/admin/customers")}
        className="mb-4 flex items-center gap-1.5 text-[13px] font-semibold text-body hover:text-ink"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to Customers
      </button>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="relative overflow-hidden bg-gradient-to-br from-ink to-[#2a2a2a] p-6 text-white sm:p-8">
          <span className="glow-blob -right-10 -top-16 h-48 w-48 bg-yellow/15" />
          <span className="glow-blob -bottom-16 left-1/3 h-40 w-40 bg-white/10" />
          <div className="relative flex flex-wrap items-center gap-4">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-16 w-16 flex-none rounded-full border-2 border-white/20 object-cover" />
            ) : (
              <span
                className={`grid h-16 w-16 flex-none place-items-center rounded-full bg-gradient-to-br text-[20px] font-extrabold text-white ring-2 ring-white/20 ${avatarGradient(name)}`}
              >
                {name.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-[20px] font-extrabold">{name}</p>
              <p className="mt-1 text-[13px] text-white/60">Customer since {fmtDate(profile.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-7 p-6 sm:p-8 lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <div className="rounded-xl border border-line bg-cream/40 p-3.5 text-center">
                <AmcBadge className="mx-auto mb-1.5 h-5 w-5 text-yellow-dark" />
                <p className="text-[10.5px] font-bold uppercase text-body">AMC</p>
                <p className="text-[14px] font-extrabold text-ink">{summaryLoading ? "…" : summary?.amc ? "Active" : "None"}</p>
              </div>
              <div className="rounded-xl border border-line bg-cream/40 p-3.5 text-center">
                <ReportIcon className="mx-auto mb-1.5 h-5 w-5 text-blue-600" />
                <p className="text-[10.5px] font-bold uppercase text-body">Invoices</p>
                <p className="text-[14px] font-extrabold text-ink">{summaryLoading ? "…" : summary?.invoicesCount ?? 0}</p>
              </div>
              <div className="rounded-xl border border-line bg-cream/40 p-3.5 text-center">
                <ClipboardIcon className="mx-auto mb-1.5 h-5 w-5 text-purple-600" />
                <p className="text-[10.5px] font-bold uppercase text-body">Quotations</p>
                <p className="text-[14px] font-extrabold text-ink">{summaryLoading ? "…" : summary?.quotationsCount ?? 0}</p>
              </div>
              <div className="rounded-xl border border-line bg-cream/40 p-3.5 text-center">
                <WrenchIcon className="mx-auto mb-1.5 h-5 w-5 text-amber-600" />
                <p className="text-[10.5px] font-bold uppercase text-body">Requests</p>
                <p className="text-[14px] font-extrabold text-ink">{summaryLoading ? "…" : summary?.requestsCount ?? 0}</p>
              </div>
              <div className="rounded-xl border border-line bg-cream/40 p-3.5 text-center">
                <HomeIcon className="mx-auto mb-1.5 h-5 w-5 text-teal-600" />
                <p className="text-[10.5px] font-bold uppercase text-body">Properties</p>
                <p className="text-[14px] font-extrabold text-ink">{summaryLoading ? "…" : summary?.propertiesCount ?? 0}</p>
              </div>
            </div>

            {!summaryLoading && summary?.amc && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-[12.5px]">
                <p className="font-extrabold text-emerald-800">{summary.amc.plan_name_snapshot}</p>
                <p className="text-emerald-700/80">
                  {summary.amc.amc_number} · expires {fmtDate(summary.amc.expiry_date)}
                </p>
              </div>
            )}
            {!summaryLoading && summary?.pendingAmount > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-[12.5px] font-bold text-amber-800">
                ₹{summary.pendingAmount.toLocaleString("en-IN")} pending across invoices
              </div>
            )}

            <div className="rounded-xl border border-line bg-white p-4">
              <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-body">
                <UsersIcon className="h-3.5 w-3.5 text-rose-500" />
                Contact & Property Info
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailRow icon={MailIcon} label="Email" value={profile.email} href={profile.email ? `mailto:${profile.email}` : null} />
                <DetailRow icon={PhoneIcon} label="Mobile" value={profile.mobile} href={profile.mobile ? `tel:${profile.mobile}` : null} />
                <DetailRow icon={PinIcon} label="Address" value={profile.address} />
                <DetailRow icon={BuildingIcon} label="City / State" value={[profile.city, profile.state].filter(Boolean).join(", ") || null} />
                <DetailRow
                  icon={ClipboardIcon}
                  label="Property Type / Size"
                  value={[profile.property_type, profile.property_size].filter(Boolean).join(" · ") || null}
                />
                <DetailRow icon={LightbulbIcon} label="Electrical Setup Notes" value={profile.electrical_setup_notes} />
              </div>
            </div>

            {!summaryLoading && (
              <>
                <div className="rounded-xl border border-line bg-white p-4">
                  <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-body">
                    <HomeIcon className="h-3.5 w-3.5 text-teal-600" />
                    Properties
                  </p>
                  {summary?.properties.length ? (
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {summary.properties.map((p) => (
                        <div key={p.id} className="rounded-lg border border-line bg-cream/30 px-3.5 py-3 text-[12.5px]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-ink">{p.label}</span>
                            {p.is_default && (
                              <span className="flex-none rounded-full bg-yellow/15 px-2 py-0.5 text-[10px] font-bold text-yellow-dark">Default</span>
                            )}
                          </div>
                          {p.property_type && <p className="mt-0.5 text-body/70">{p.property_type}</p>}
                          <p className="mt-1.5 text-body/80">{p.address}</p>
                          {[p.city, p.state, p.pincode].filter(Boolean).length > 0 && (
                            <p className="text-body/60">{[p.city, p.state, p.pincode].filter(Boolean).join(", ")}</p>
                          )}
                          {p.area_sqft && <p className="mt-1.5 text-body/60">Area: {p.area_sqft} sq.ft</p>}
                          {p.electrical_details && <p className="mt-1 text-body/60">{p.electrical_details}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12.5px] text-body/60">No properties added yet.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="rounded-xl border border-line bg-white p-4">
                    <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-body">
                      <AmcBadge className="h-3.5 w-3.5 text-yellow-dark" />
                      AMC History
                    </p>
                    {summary?.amcHistory.length ? (
                      <div className="space-y-1.5">
                        {summary.amcHistory.map((a) => (
                          <div
                            key={a.amc_number}
                            className={`rounded-lg border px-3 py-2 text-[12.5px] ${a.status === "active" ? "border-emerald-200 bg-emerald-50/60" : "border-line bg-cream/30"}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-ink">{a.plan_name_snapshot}</span>
                              <span className="text-[10.5px] font-bold uppercase text-body">{a.status}</span>
                            </div>
                            <p className="text-body/70">
                              {a.amc_number} · expires {fmtDate(a.expiry_date)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12.5px] text-body/60">No AMC purchased yet.</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-line bg-white p-4">
                    <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-body">
                      <WrenchIcon className="h-3.5 w-3.5 text-amber-600" />
                      Recent Service Requests
                    </p>
                    {summary?.requests.length ? (
                      <div className="space-y-1.5">
                        {summary.requests.map((r) => (
                          <Link
                            key={r.id}
                            href={`/admin/service-requests/${r.id}`}
                            className="block rounded-lg border border-line bg-cream/30 px-3 py-2 text-[12.5px] transition-colors hover:border-ink/40 hover:bg-cream/60"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono font-bold text-ink underline-offset-2 hover:underline">{r.ticket_number}</span>
                              <span className="text-[10.5px] font-bold uppercase text-body">{r.status.replace(/_/g, " ")}</span>
                            </div>
                            <p className="text-body/70">
                              {r.service_type} · {fmtDate(r.created_at)}
                            </p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12.5px] text-body/60">No service requests raised yet.</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-line bg-white p-4">
                    <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-body">
                      <ReportIcon className="h-3.5 w-3.5 text-blue-600" />
                      Recent Invoices
                    </p>
                    {summary?.invoices.length ? (
                      <div className="space-y-1.5">
                        {summary.invoices.map((inv) => (
                          <Link
                            key={inv.id}
                            href={`/admin/invoices/${inv.id}`}
                            className="block rounded-lg border border-line bg-cream/30 px-3 py-2 text-[12.5px] transition-colors hover:border-ink/40 hover:bg-cream/60"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono font-bold text-ink underline-offset-2 hover:underline">{inv.invoice_number}</span>
                              <span className="text-[10.5px] font-bold uppercase text-body">{inv.payment_status.replace(/_/g, " ")}</span>
                            </div>
                            <p className="text-body/70">
                              ₹{Number(inv.total_amount).toLocaleString("en-IN")} · {fmtDate(inv.created_at)}
                            </p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12.5px] text-body/60">No invoices raised yet.</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-line bg-white p-4">
                    <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-body">
                      <ClipboardIcon className="h-3.5 w-3.5 text-purple-600" />
                      Quotations
                    </p>
                    {summary?.quotations.length ? (
                      <div className="space-y-1.5">
                        {summary.quotations.map((q) => (
                          <div key={q.quotation_number} className="rounded-lg border border-line bg-cream/30 px-3 py-2 text-[12.5px]">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono font-bold text-ink">{q.quotation_number}</span>
                              <span className="text-[10.5px] font-bold uppercase text-body">{q.status}</span>
                            </div>
                            <p className="text-body/70">
                              ₹{Number(q.total).toLocaleString("en-IN")} · {fmtDate(q.created_at)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12.5px] text-body/60">No quotations raised yet.</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-line bg-white p-4">
                    <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-body">
                      <ShieldIcon className="h-3.5 w-3.5 text-cyan-600" />
                      Health Check Bookings
                    </p>
                    {summary?.healthChecks.length ? (
                      <div className="space-y-1.5">
                        {summary.healthChecks.map((h) => (
                          <div key={h.request_number} className="rounded-lg border border-line bg-cream/30 px-3 py-2 text-[12.5px]">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono font-bold text-ink">{h.request_number}</span>
                              <span className="text-[10.5px] font-bold uppercase text-body">{h.status}</span>
                            </div>
                            <p className="text-body/70">
                              {h.preferred_date ? fmtDate(h.preferred_date) : "No date set"}
                              {h.engineer_name ? ` · ${h.engineer_name}` : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12.5px] text-body/60">No health check bookings yet.</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-line bg-white p-4">
                    <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-body">
                      <ClipboardIcon className="h-3.5 w-3.5 text-indigo-600" />
                      Health Reports
                    </p>
                    {summary?.healthReports.length ? (
                      <div className="space-y-1.5">
                        {summary.healthReports.map((h) => (
                          <div key={h.report_number} className="rounded-lg border border-line bg-cream/30 px-3 py-2 text-[12.5px]">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono font-bold text-ink">{h.report_number}</span>
                              <span className="text-[10.5px] font-bold uppercase text-body">{h.status}</span>
                            </div>
                            <p className="text-body/70">
                              {h.property_name || "—"} · {fmtDate(h.created_at)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12.5px] text-body/60">No health reports yet.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-cream/30 p-5 lg:sticky lg:top-[76px] lg:border-l lg:ml-0 lg:max-h-[calc(100vh-96px)]">
            <div className="flex flex-none items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-body">
                <ClockIcon className="h-3.5 w-3.5" />
                Communication History
                {commLog.length > 0 && (
                  <span className="rounded-full bg-line/70 px-1.5 py-0.5 text-[10px] font-bold text-body normal-case">{commLog.length}</span>
                )}
              </p>
              <button
                type="button"
                onClick={() => setShowCommForm((v) => !v)}
                className={`flex flex-none items-center gap-1 rounded-md px-2.5 py-1.5 text-[11.5px] font-bold transition-colors ${
                  showCommForm ? "bg-line/70 text-ink" : "bg-ink text-white hover:bg-ink/85"
                }`}
              >
                {showCommForm ? (
                  <>
                    <XIcon className="h-3 w-3" />
                    Cancel
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-3 w-3" />
                    Add
                  </>
                )}
              </button>
            </div>

            {showCommForm && (
              <form onSubmit={addCommLog} className="flex-none space-y-2 rounded-xl border border-line bg-white p-3">
                <div className="flex gap-2">
                  <select
                    value={commForm.channel}
                    onChange={(e) => setCommForm((f) => ({ ...f, channel: e.target.value }))}
                    className="rounded-md border border-line bg-white px-2 py-1.5 text-[12px] font-semibold outline-none focus:border-ink"
                  >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                    <option value="note">Note</option>
                  </select>
                  <select
                    value={commForm.direction}
                    onChange={(e) => setCommForm((f) => ({ ...f, direction: e.target.value }))}
                    className="rounded-md border border-line bg-white px-2 py-1.5 text-[12px] font-semibold outline-none focus:border-ink"
                  >
                    <option value="outbound">Outbound</option>
                    <option value="inbound">Inbound</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  autoFocus
                  value={commForm.summary}
                  onChange={(e) => setCommForm((f) => ({ ...f, summary: e.target.value }))}
                  placeholder="What was discussed…"
                  className="w-full rounded-md border border-line bg-white px-2.5 py-2 text-[12.5px] outline-none focus:border-ink"
                />
                <button
                  type="submit"
                  disabled={savingComm || !commForm.summary.trim()}
                  className="rounded-md bg-yellow px-3.5 py-1.5 text-[12px] font-bold text-ink transition-all hover:bg-yellow-dark disabled:opacity-50"
                >
                  {savingComm ? "Saving…" : "Log Entry"}
                </button>
              </form>
            )}

            {commLog.length > 0 ? (
              <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1 lg:max-h-[420px] scrollbar-none">
                {commLog.map((c) => (
                  <div key={c.id} className="rounded-lg border border-line bg-white px-3 py-2 text-[12.5px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold uppercase text-ink">
                        {c.channel} · {c.direction}
                      </span>
                      <div className="flex flex-none items-center gap-2">
                        <span className="text-[10.5px] text-body">{fmtDate(c.created_at)}</span>
                        <button
                          type="button"
                          onClick={() => deleteCommLog(c.id)}
                          aria-label="Delete entry"
                          className="text-body/40 transition-colors hover:text-red-600"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="break-words text-body/80">{c.summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12.5px] text-body/60">No communication logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
