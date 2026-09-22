"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import Reveal from "@/components/Reveal";
import PhotoThumbnail from "@/components/PhotoThumbnail";
import { AmcBadge, ArrowLeftIcon, CalendarIcon, CheckCircle, PrinterIcon, UserIcon } from "@/components/icons";

const STATUS_META = {
  good: { label: "Good", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  attention: { label: "Attention Required", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  repair: { label: "Improvement / Repair Recommended", cls: "bg-red-50 text-red-700 border-red-200" },
};

const PRIORITY_META = {
  low: { label: "Low Priority", cls: "text-body" },
  medium: { label: "Medium Priority", cls: "text-amber-700" },
  high: { label: "High Priority", cls: "text-red-700" },
};

export default function HealthReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useCustomerAuth();
  const [report, setReport] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("health_reports")
        .select("*")
        .eq("id", id)
        .eq("customer_id", user.id)
        .eq("status", "published")
        .maybeSingle();
      setReport(data);
      if (data?.recommended_plan_id) {
        const { data: p } = await supabase.from("amc_plans").select("*").eq("id", data.recommended_plan_id).maybeSingle();
        setPlan(p);
      }
      setLoading(false);
    })();
  }, [id, user]);

  if (loading) {
    return <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body">Loading report…</div>;
  }
  if (!report) {
    return <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body">Report not found.</div>;
  }

  const items = Array.isArray(report.items) ? report.items : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={() => router.push("/account/health-reports")}
          className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap text-[13.5px] font-bold text-ink transition-colors hover:text-yellow-dark"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 flex-none" />
          Back to Health Reports
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex flex-none items-center gap-2 whitespace-nowrap rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-black text-ink shadow-2xs transition-all hover:border-ink"
        >
          <PrinterIcon className="h-4 w-4 flex-none" />
          Print / Save as PDF
        </button>
      </div>

      <Reveal y={12}>
        <div className="overflow-hidden rounded-3xl border border-line/80 bg-white shadow-sm">
          <div className="relative overflow-hidden bg-gradient-to-br from-ink to-[#2a2a2a] p-6 text-white sm:p-8">
            <span className="glow-blob -right-10 -top-16 h-48 w-48 bg-yellow/15" />
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wide text-white/60">Electrical Health Report</p>
                <p className="mt-0.5 font-mono text-lg font-extrabold">{report.report_number}</p>
              </div>
              <div className="text-right text-[12.5px] text-white/70">
                <div className="flex items-center justify-end gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Inspected {report.inspection_date ? new Date(report.inspection_date).toLocaleDateString("en-GB") : "—"}
                </div>
                {report.inspector_name && (
                  <div className="mt-1 flex items-center justify-end gap-1.5">
                    <UserIcon className="h-3.5 w-3.5" />
                    {report.inspector_name}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-b border-line p-6 sm:grid-cols-3 sm:p-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-body">Customer</p>
              <p className="text-[14px] font-extrabold text-ink">{report.customer_name || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-body">Property</p>
              <p className="text-[14px] font-extrabold text-ink">{report.property_name || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-body">Address</p>
              <p className="text-[14px] font-extrabold text-ink">{report.property_address || "—"}</p>
            </div>
          </div>

          <div className="space-y-4 p-6 sm:p-8">
            {items.map((item) => {
              const meta = STATUS_META[item.status] ?? STATUS_META.good;
              const priority = PRIORITY_META[item.priority] ?? PRIORITY_META.low;
              return (
                <div key={item.category} className="rounded-2xl border border-line/80 p-5">
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[14px] font-extrabold text-ink">{item.category}</p>
                    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </div>
                  {item.observation && <p className="text-[13px] leading-relaxed text-charcoal/80">{item.observation}</p>}
                  {item.recommendation && (
                    <p className="mt-1.5 text-[13px] leading-relaxed text-charcoal/80">
                      <b className="text-ink">Recommendation:</b> {item.recommendation}
                    </p>
                  )}
                  {item.remarks && (
                    <p className="mt-1.5 text-[13px] leading-relaxed text-charcoal/80">
                      <b className="text-ink">Remarks:</b> {item.remarks}
                    </p>
                  )}
                  <div className="mt-2.5 flex flex-wrap items-center gap-3">
                    <span className={`text-[11.5px] font-bold ${priority.cls}`}>{priority.label}</span>
                    <PhotoThumbnail src={item.photo_url} alt={item.category} className="h-16 w-24 rounded-lg border border-line object-cover" />
                  </div>
                </div>
              );
            })}
          </div>

          {report.summary && (
            <div className="mx-6 mb-6 rounded-2xl border border-line/80 bg-cream p-6 sm:mx-8 sm:mb-8">
              <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-body">Overall Summary</p>
              <p className="text-[13.5px] leading-relaxed text-ink-soft">{report.summary}</p>
            </div>
          )}
        </div>
      </Reveal>

      {plan && (
        <Reveal delay={0.1} className="overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-white p-6 shadow-sm print:hidden sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-yellow/20 text-yellow-dark">
                <AmcBadge className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">Recommended For You</p>
                <p className="text-[16px] font-extrabold text-ink">
                  {plan.name} {plan.price_label ? `— ${plan.price_label}` : ""}
                </p>
                {report.recommended_plan_note && <p className="mt-1 text-[13px] text-charcoal/80">{report.recommended_plan_note}</p>}
              </div>
            </div>
            <Link
              href={`/amc/plans#plan-${report.recommended_plan_id}`}
              className="inline-flex flex-none items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-yellow px-6 py-3 text-sm font-extrabold text-ink shadow-md transition-all hover:-translate-y-0.5 hover:bg-yellow-dark"
            >
              <CheckCircle className="h-4 w-4" />
              Activate AMC
            </Link>
          </div>
        </Reveal>
      )}
    </div>
  );
}
