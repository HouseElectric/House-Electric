"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import Reveal from "@/components/Reveal";
import {
  AmcBadge,
  BuildingIcon,
  CheckCircle,
  ClockIcon,
  DownloadIcon,
  EditIcon,
  EyeIcon,
  HomeIcon,
  PinIcon,
  PlusIcon,
  ReportIcon,
  SparklesIcon,
  TrashIcon,
  WrenchIcon,
  XIcon,
} from "@/components/icons";

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function MyPropertiesPage() {
  const { user } = useCustomerAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchProperties = async () => {
    if (!user) return;
    const [{ data }, { data: subs }, { data: requests }] = await Promise.all([
      supabase.from("properties").select("*").eq("customer_id", user.id).order("created_at", { ascending: true }),
      supabase
        .from("amc_subscriptions")
        .select("property_id, status, expiry_date, plan_name_snapshot")
        .eq("customer_id", user.id)
        .not("property_id", "is", null)
        .order("expiry_date", { ascending: false }),
      supabase
        .from("service_requests")
        .select("property_id, status")
        .eq("customer_id", user.id)
        .not("property_id", "is", null),
    ]);

    const amcByProperty = new Map();
    (subs ?? []).forEach((s) => {
      if (!amcByProperty.has(s.property_id)) amcByProperty.set(s.property_id, s);
    });
    const openStatuses = new Set([
      "requested",
      "under_review",
      "assigned",
      "scheduled",
      "on_the_way",
      "in_progress",
      "material_required",
      "customer_approval_pending",
    ]);
    const openCountByProperty = new Map();
    (requests ?? []).forEach((r) => {
      if (openStatuses.has(r.status))
        openCountByProperty.set(r.property_id, (openCountByProperty.get(r.property_id) || 0) + 1);
    });

    setProperties(
      (data ?? []).map((p) => ({
        ...p,
        amc: amcByProperty.get(p.id) || null,
        openRequests: openCountByProperty.get(p.id) || 0,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const remove = async (id) => {
    await supabase.from("properties").delete().eq("id", id);
    toast.success("Property removed");
    fetchProperties();
  };

  const openView = async (p) => {
    setViewing(p);
    setViewLoading(true);
    const [{ data: amc }, { data: requests }, { data: healthReports }] = await Promise.all([
      supabase
        .from("amc_subscriptions")
        .select("id, amc_number, plan_name_snapshot, status, start_date, expiry_date")
        .eq("property_id", p.id)
        .order("start_date", { ascending: false }),
      supabase
        .from("service_requests")
        .select("id, ticket_number, service_type, status, created_at")
        .eq("property_id", p.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("health_reports")
        .select("id, report_number, status, created_at")
        .eq("property_id", p.id)
        .eq("status", "published")
        .order("created_at", { ascending: false }),
    ]);
    const requestIds = (requests ?? []).map((r) => r.id);
    const { data: invoices } =
      requestIds.length > 0
        ? await supabase
            .from("invoices")
            .select("id, invoice_number, total_amount, payment_status, created_at")
            .in("service_request_id", requestIds)
            .order("created_at", { ascending: false })
        : { data: [] };
    setViewData({
      amc: amc ?? [],
      requests: requests ?? [],
      healthReports: healthReports ?? [],
      invoices: invoices ?? [],
    });
    setViewLoading(false);
  };

  const setDefault = async (id) => {
    await supabase.from("properties").update({ is_default: false }).eq("customer_id", user.id);
    await supabase.from("properties").update({ is_default: true }).eq("id", id);
    toast.success("Default property updated");
    fetchProperties();
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-ink">My Properties</h2>
            {!loading && properties.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-700 shadow-2xs">
                <BuildingIcon className="h-3 w-3 text-slate-500" />
                <span>
                  {properties.length} {properties.length === 1 ? "Property" : "Properties"} Covered
                </span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-[13px] text-body mt-0.5">
            Add every home or office you want covered — each gets its own AMC and service history
          </p>
        </div>
        <Link
          href="/account/properties/new"
          className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-yellow px-5 py-3 text-xs font-black text-ink shadow-sm transition-all hover:bg-yellow-dark hover:shadow-md active:scale-[0.99]"
        >
          <PlusIcon className="h-4 w-4 transition-transform group-hover:rotate-90" />
          <span>Add Property</span>
        </Link>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body shadow-2xs">
          Loading properties…
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-line/80 bg-white p-10 sm:p-14 text-center shadow-xs">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-amber-50 text-yellow-dark shadow-2xs">
            <HomeIcon className="h-8 w-8" />
          </span>
          <div className="space-y-1.5">
            <p className="text-base sm:text-lg font-extrabold text-ink">No Properties Added Yet</p>
            <p className="max-w-md text-xs sm:text-[13px] text-body leading-relaxed">
              Add a property so you can subscribe it to an AMC and raise service requests for it.
            </p>
          </div>
          <Link
            href="/account/properties/new"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-yellow px-6 py-3 text-xs font-black text-ink shadow-sm hover:bg-yellow-dark"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Property</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {properties.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 4) * 0.05} y={12}>
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-md">
                <div className="space-y-3.5">
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-50 border border-amber-200/80 text-yellow-dark shadow-2xs transition-transform duration-300 group-hover:scale-105">
                        {p.property_type === "Residential" ? (
                          <HomeIcon className="h-6 w-6" />
                        ) : (
                          <BuildingIcon className="h-6 w-6" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-[17px] font-black text-ink break-words leading-snug">
                          {p.label}
                        </h3>
                        <span className="inline-block mt-0.5 font-mono text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {p.property_type}
                        </span>
                      </div>
                    </div>

                    {p.is_default && (
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[10.5px] sm:text-[11px] font-black text-emerald-800 shadow-2xs">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Default</span>
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-xs sm:text-[13px] leading-relaxed text-slate-600 font-medium">
                    <PinIcon className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="break-words">
                      {p.address}
                      {p.city ? `, ${p.city}` : ""}
                      {p.state ? `, ${p.state}` : ""}
                      {p.pincode ? ` – ${p.pincode}` : ""}
                    </span>
                  </div>

                  {/* Area & Electrical Setup Specs */}
                  {(p.area_sqft || p.electrical_details) && (
                    <div className="rounded-2xl bg-slate-50/80 border border-slate-200/70 p-3 text-xs text-slate-700">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted mb-0.5">
                        Setup Details
                      </span>
                      <p className="font-semibold break-words leading-relaxed">
                        {p.area_sqft ? `${p.area_sqft} sq.ft.` : ""}
                        {p.area_sqft && p.electrical_details ? " · " : ""}
                        {p.electrical_details}
                      </p>
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {p.amc?.status === "active" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-800 shadow-2xs">
                        <AmcBadge className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>AMC Active · till {fmtDate(p.amc.expiry_date)}</span>
                      </span>
                    ) : p.amc ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                        <AmcBadge className="h-3.5 w-3.5 shrink-0" />
                        <span>AMC Expired</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800">
                        <span>No AMC</span>
                      </span>
                    )}

                    {p.openRequests > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700 shadow-2xs">
                        <WrenchIcon className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                        <span>
                          {p.openRequests} Open Request{p.openRequests > 1 ? "s" : ""}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Primary 2-Column Action CTAs */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <Link
                      href={`/account/requests/new?property=${p.id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300/90 bg-white py-2.5 text-xs font-extrabold text-ink shadow-2xs transition-all hover:border-ink hover:bg-slate-50"
                    >
                      <WrenchIcon className="h-3.5 w-3.5 text-slate-600" />
                      <span>Report Issue</span>
                    </Link>
                    {p.amc?.status === "active" ? (
                      <Link
                        href="/account/amc"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-ink py-2.5 text-xs font-black text-white shadow-xs transition-all hover:bg-slate-800"
                      >
                        <AmcBadge className="h-3.5 w-3.5 text-yellow" />
                        <span>View AMC</span>
                      </Link>
                    ) : (
                      <Link
                        href="/amc/plans#plans"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-yellow py-2.5 text-xs font-black text-ink shadow-xs transition-all hover:bg-yellow-dark"
                      >
                        <AmcBadge className="h-3.5 w-3.5" />
                        <span>Get AMC</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Card Footer Bar */}
                <div className="mt-4.5 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openView(p)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-2xs transition-all hover:border-ink hover:bg-slate-50"
                    >
                      <EyeIcon className="h-3.5 w-3.5 text-slate-500" />
                      <span>Details</span>
                    </button>
                    {!p.is_default && (
                      <button
                        type="button"
                        onClick={() => setDefault(p.id)}
                        className="text-xs font-bold text-slate-600 hover:text-ink transition-colors underline-offset-4 hover:underline"
                      >
                        Set Default
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/account/properties/new?edit=${p.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-ink transition-colors"
                    >
                      <EditIcon className="h-3.5 w-3.5 text-slate-500" />
                      <span>Edit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {/* Property Details Modal */}
      {viewing && (
        <>
          <div className="fixed inset-0 z-[190] bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setViewing(null)} />
          <div className="fixed inset-x-4 top-1/2 z-[200] max-h-[85vh] -translate-y-1/2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2">
            <div className="max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-line/80 bg-slate-50/70 p-5">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-ink">{viewing.label}</h3>
                  <p className="text-xs text-body mt-0.5">
                    {viewing.address}
                    {viewing.city ? `, ${viewing.city}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewing(null)}
                  className="grid h-8 w-8 flex-none place-items-center rounded-full bg-white border border-slate-200 text-body hover:bg-slate-100 hover:text-ink transition-colors"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              {viewLoading ? (
                <div className="p-10 text-center text-xs font-medium text-body">Loading property dossier…</div>
              ) : (
                <div className="space-y-5 p-5 sm:p-6">
                  {/* AMC Coverage Section */}
                  <div>
                    <p className="mb-2.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-ink">
                      <AmcBadge className="h-4 w-4 text-yellow-dark" />
                      <span>Annual Maintenance Contracts</span>
                    </p>
                    {viewData?.amc.length ? (
                      <div className="space-y-2">
                        {viewData.amc.map((a) => (
                          <Link
                            key={a.id}
                            href={`/account/amc/${a.id}/certificate`}
                            className={`block rounded-2xl border p-3.5 text-xs transition-all hover:border-ink/40 shadow-2xs ${
                              a.status === "active" ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-ink">{a.plan_name_snapshot}</span>
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  a.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {a.status}
                              </span>
                            </div>
                            <p className="text-slate-600 mt-1 font-mono text-[11px]">
                              {a.amc_number} · {fmtDate(a.start_date)} – {fmtDate(a.expiry_date)}
                            </p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No AMC for this property yet.</p>
                    )}
                  </div>

                  {/* Service Requests Section */}
                  <div>
                    <p className="mb-2.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-ink">
                      <WrenchIcon className="h-4 w-4 text-amber-600" />
                      <span>Service Requests</span>
                    </p>
                    {viewData?.requests.length ? (
                      <div className="space-y-2">
                        {viewData.requests.map((r) => (
                          <Link
                            key={r.id}
                            href={`/account/requests/${r.id}`}
                            className="block rounded-2xl border border-slate-200 bg-white p-3.5 text-xs transition-all hover:border-ink/40 shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono font-bold text-ink">{r.ticket_number}</span>
                              <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                {r.status.replace(/_/g, " ")}
                              </span>
                            </div>
                            <p className="text-slate-600 mt-1">
                              {r.service_type} · {fmtDate(r.created_at)}
                            </p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No service requests for this property yet.</p>
                    )}
                  </div>

                  {/* Health Reports Section */}
                  <div>
                    <p className="mb-2.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-ink">
                      <ClockIcon className="h-4 w-4 text-yellow-dark" />
                      <span>Electrical Health Reports</span>
                    </p>
                    {viewData?.healthReports.length ? (
                      <div className="space-y-2">
                        {viewData.healthReports.map((h) => (
                          <Link
                            key={h.id}
                            href={`/account/health-reports/${h.id}`}
                            className="block rounded-2xl border border-slate-200 bg-white p-3.5 text-xs transition-all hover:border-ink/40 shadow-2xs"
                          >
                            <span className="font-mono font-bold text-ink">{h.report_number}</span>
                            <span className="ml-2 text-slate-600">{fmtDate(h.created_at)}</span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No health reports for this property yet.</p>
                    )}
                  </div>

                  {/* Documents Section */}
                  <div>
                    <p className="mb-2.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-ink">
                      <ReportIcon className="h-4 w-4 text-yellow-dark" />
                      <span>Official Property Documents</span>
                    </p>
                    {viewData?.amc.length || viewData?.invoices.length || viewData?.healthReports.length ? (
                      <div className="space-y-2">
                        {viewData.amc
                          .filter((a) => a.status === "active")
                          .map((a) => (
                            <Link
                              key={`cert-${a.id}`}
                              href={`/account/amc/${a.id}/certificate`}
                              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 text-xs transition-all hover:border-ink/40 shadow-2xs"
                            >
                              <span>AMC Certificate — {a.amc_number}</span>
                              <DownloadIcon className="h-4 w-4 text-slate-500" />
                            </Link>
                          ))}
                        {viewData.invoices.map((inv) => (
                          <Link
                            key={inv.id}
                            href={`/account/invoices/${inv.id}`}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 text-xs transition-all hover:border-ink/40 shadow-2xs"
                          >
                            <span>
                              Invoice {inv.invoice_number} — ₹{Number(inv.total_amount).toLocaleString("en-IN")}
                            </span>
                            <DownloadIcon className="h-4 w-4 text-slate-500" />
                          </Link>
                        ))}
                        {viewData.healthReports.map((h) => (
                          <Link
                            key={`hr-${h.id}`}
                            href={`/account/health-reports/${h.id}`}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 text-xs transition-all hover:border-ink/40 shadow-2xs"
                          >
                            <span>Health Report — {h.report_number}</span>
                            <DownloadIcon className="h-4 w-4 text-slate-500" />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No documents for this property yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
