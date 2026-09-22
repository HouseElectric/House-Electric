"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { avatarGradient } from "@/components/admin/CustomerPicker";
import {
  AmcBadge,
  ArrowLeftIcon,
  BoltBadge,
  BuildingIcon,
  HomeIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  ReportIcon,
  RulerIcon,
  UserIcon,
  WrenchIcon,
  XIcon,
} from "@/components/icons";

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const SECTION_CHIP_CLS = {
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
};

function Section({ icon: Icon, color = "slate", title, children }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5">
      <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-body">
        <span className={`grid h-6 w-6 flex-none place-items-center rounded-lg ${SECTION_CHIP_CLS[color]}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        {title}
      </p>
      {children}
    </div>
  );
}

const STATUS_CHIP_CLS = {
  active: "bg-emerald-50 text-emerald-700",
  completed: "bg-emerald-50 text-emerald-700",
  closed: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-50 text-red-600",
  expired: "bg-slate-100 text-slate-600",
};

function StatusChip({ status }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_CHIP_CLS[status] || "bg-cream text-body"}`}>
      {(status || "").replace(/_/g, " ")}
    </span>
  );
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
            <a href={href} className="break-words text-[13px] font-semibold text-ink hover:underline">
              {value}
            </a>
          ) : (
            <p className="break-words text-[13px] font-semibold text-ink">{value}</p>
          )
        ) : (
          <p className="text-[13px] text-body/50">—</p>
        )}
      </div>
    </div>
  );
}

export default function PropertyDetail({ propertyId }) {
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: propData } = await supabase.from("properties").select("*").eq("id", propertyId).single();

      if (!propData) {
        setProperty(null);
        setLoading(false);
        return;
      }

      const [{ data: profile }, { data: subs }] = await Promise.all([
        propData.customer_id
          ? supabase.from("profiles").select("id, name, email, mobile").eq("id", propData.customer_id).single()
          : Promise.resolve({ data: null }),
        supabase
          .from("amc_subscriptions")
          .select("property_id, plan_name_snapshot, amc_number, status, expiry_date")
          .eq("property_id", propData.id)
          .order("expiry_date", { ascending: false }),
      ]);

      setProperty({ ...propData, profiles: profile || null, amc: (subs && subs[0]) || null });
      setLoading(false);
    })();
  }, [propertyId]);

  useEffect(() => {
    setDetailLoading(true);
    (async () => {
      const [{ data: amcHistory }, { data: requests }, { data: healthReports }] = await Promise.all([
        supabase
          .from("amc_subscriptions")
          .select("amc_number, plan_name_snapshot, status, start_date, expiry_date, amount_paid")
          .eq("property_id", propertyId)
          .order("start_date", { ascending: false }),
        supabase
          .from("service_requests")
          .select("id, ticket_number, service_type, status, created_at, technician_name")
          .eq("property_id", propertyId)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("health_reports")
          .select("id, health_check_id, report_number, status, created_at")
          .eq("property_id", propertyId)
          .order("created_at", { ascending: false }),
      ]);
      setDetail({ amcHistory: amcHistory ?? [], requests: requests ?? [], healthReports: healthReports ?? [] });
      setDetailLoading(false);
    })();
  }, [propertyId]);

  if (loading) {
    return (
      <AdminLayout title="Properties">
        <div className="rounded-2xl border border-line bg-white p-16 text-center text-[13.5px] text-body">
          Loading property...
        </div>
      </AdminLayout>
    );
  }

  if (!property) {
    return (
      <AdminLayout title="Properties">
        <button
          onClick={() => router.push("/admin/properties")}
          className="mb-4 flex items-center gap-1.5 text-[13px] font-semibold text-body hover:text-ink"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to Properties
        </button>
        <div className="rounded-2xl border border-line bg-white p-16 text-center text-[13.5px] text-body">
          Property not found.
        </div>
      </AdminLayout>
    );
  }

  const owner = property.profiles?.name || property.profiles?.email || "—";

  return (
    <AdminLayout title="Properties">
      <button
        onClick={() => router.push("/admin/properties")}
        className="mb-4 flex items-center gap-1.5 text-[13px] font-semibold text-body hover:text-ink"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to Properties
      </button>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-lg shadow-ink/5">
        <div className="relative overflow-hidden bg-gradient-to-br from-ink to-[#2a2a2a] p-6 text-white sm:p-8">
          <span className="glow-blob -right-10 -top-16 h-48 w-48 bg-yellow/15" />
          <span className="glow-blob -bottom-16 left-1/3 h-40 w-40 bg-white/5" />
          <button
            onClick={() => router.push("/admin/properties")}
            aria-label="Close"
            className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/70 transition-all hover:rotate-90 hover:bg-white/20 hover:text-white"
          >
            <XIcon className="h-4 w-4" />
          </button>
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="grid h-16 w-16 flex-none place-items-center rounded-2xl bg-white/10 shadow-inner ring-2 ring-white/20 backdrop-blur-sm">
              <BuildingIcon className="h-7 w-7 text-yellow" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="truncate text-[22px] font-extrabold tracking-tight">{property.label}</p>
                {property.amc?.status === "active" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/25">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Active AMC
                  </span>
                ) : (
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white/60 ring-1 ring-white/15">
                    No Active AMC
                  </span>
                )}
              </div>
              <p className="mt-1 text-[13px] text-white/60">
                {property.property_type || "Property"} · Added {fmtDate(property.created_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Section icon={UserIcon} color="violet" title="Owner">
              <div className="mb-3.5 flex items-center gap-3 border-b border-line/70 pb-3.5">
                <span
                  className={`grid h-11 w-11 flex-none place-items-center rounded-full bg-gradient-to-br text-[13px] font-extrabold text-white shadow-sm ring-4 ring-cream ${avatarGradient(owner)}`}
                >
                  {owner.charAt(0).toUpperCase()}
                </span>
                <p className="truncate text-[14.5px] font-extrabold text-ink">{owner}</p>
              </div>
              <div className="space-y-3">
                <DetailRow
                  icon={MailIcon}
                  label="Email"
                  value={property.profiles?.email}
                  href={property.profiles?.email ? `mailto:${property.profiles.email}` : null}
                />
                <DetailRow
                  icon={PhoneIcon}
                  label="Mobile"
                  value={property.profiles?.mobile}
                  href={property.profiles?.mobile ? `tel:${property.profiles.mobile}` : null}
                />
              </div>
            </Section>

            <Section icon={BuildingIcon} color="blue" title="Property">
              <div className="space-y-3">
                <DetailRow icon={HomeIcon} label="Type" value={property.property_type} />
                <DetailRow
                  icon={PinIcon}
                  label="Address"
                  value={[property.address, property.city, property.state, property.pincode].filter(Boolean).join(", ")}
                />
                <DetailRow icon={RulerIcon} label="Area" value={property.area_sqft ? `${property.area_sqft} sq.ft.` : null} />
                <DetailRow icon={BoltBadge} label="Electrical Infrastructure" value={property.electrical_details} />
              </div>
            </Section>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Section icon={AmcBadge} color="emerald" title="AMC History">
              {detailLoading ? (
                <p className="text-[12.5px] text-body">Loading…</p>
              ) : detail?.amcHistory.length ? (
                <div className="space-y-2">
                  {detail.amcHistory.map((a) => (
                    <div
                      key={a.amc_number}
                      className={`rounded-xl border px-3.5 py-2.5 text-[12.5px] transition-colors ${
                        a.status === "active" ? "border-emerald-200 bg-emerald-50/60" : "border-line bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-ink">{a.plan_name_snapshot}</span>
                        <StatusChip status={a.status} />
                      </div>
                      <p className="mt-0.5 text-body/80">
                        {a.amc_number} · {fmtDate(a.start_date)} – {fmtDate(a.expiry_date)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12.5px] text-body/60">No AMC purchased for this property yet.</p>
              )}
            </Section>

            <Section icon={WrenchIcon} color="amber" title="Recent Service Requests">
              {detailLoading ? (
                <p className="text-[12.5px] text-body">Loading…</p>
              ) : detail?.requests.length ? (
                <div className="space-y-2">
                  {detail.requests.map((r) => (
                    <a
                      key={r.ticket_number}
                      href={`/admin/service-requests/${r.id}`}
                      className="block rounded-xl border border-line px-3.5 py-2.5 text-[12.5px] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/30 hover:bg-cream/40 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-ink">{r.ticket_number}</span>
                        <StatusChip status={r.status} />
                      </div>
                      <p className="mt-0.5 text-body/80">
                        {r.service_type} · {fmtDate(r.created_at)}
                        {r.technician_name ? ` · ${r.technician_name}` : ""}
                      </p>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-[12.5px] text-body/60">No service requests raised for this property yet.</p>
              )}
            </Section>

            <Section icon={ReportIcon} color="slate" title="Health Reports">
              {detailLoading ? (
                <p className="text-[12.5px] text-body">Loading…</p>
              ) : detail?.healthReports.length ? (
                <div className="space-y-2">
                  {detail.healthReports.map((h) => (
                    <a
                      key={h.id}
                      href={`/admin/health-checks/${h.health_check_id}/report`}
                      className="block rounded-xl border border-line px-3.5 py-2.5 text-[12.5px] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-ink">{h.report_number}</span>
                        <StatusChip status={h.status} />
                      </div>
                      <p className="mt-0.5 text-body/80">{fmtDate(h.created_at)}</p>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-[12.5px] text-body/60">No health reports for this property yet.</p>
              )}
            </Section>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
