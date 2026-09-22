"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import {
  AlertIcon,
  ArrowLeftIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircle,
  ClockIcon,
  HomeIcon,
  PinIcon,
  PlusIcon,
  ReportIcon,
  SparklesIcon,
} from "@/components/icons";

const inputClass =
  "w-full rounded-2xl border border-slate-200/90 bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 pl-10 sm:pl-11 text-xs sm:text-sm text-ink outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-yellow/15 shadow-2xs";
const plainInputClass =
  "w-full rounded-2xl border border-slate-200/90 bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-ink outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-yellow/15 shadow-2xs";

function Field({ icon: Icon, label, required, children }) {
  return (
    <div>
      <label className="mb-1 sm:mb-1.5 block text-[11px] sm:text-xs font-extrabold text-ink">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-slate-400" />}
        {children}
      </div>
    </div>
  );
}

export default function NewHealthCheckPage() {
  const { user, profile } = useCustomerAuth();
  const router = useRouter();

  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({
    property_id: "",
    address: "",
    property_type: "",
    preferred_date: "",
    preferred_time: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: true });
      setProperties(data ?? []);

      const def = data?.find((p) => p.is_default) || data?.[0];
      if (def) {
        setForm((f) => ({
          ...f,
          property_id: def.id,
          address: [def.address, def.city].filter(Boolean).join(", "),
          property_type: def.property_type || "",
        }));
      }
    })();
  }, [user]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePropertySelect = (p) => {
    setForm((f) => ({
      ...f,
      property_id: p.id,
      address: [p.address, p.city].filter(Boolean).join(", "),
      property_type: p.property_type || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.address.trim()) {
      setError("Please select a property or enter an address.");
      toast.error("Please select a property or enter an address.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/health-check", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          name: profile?.name || user?.email,
          mobile: profile?.mobile || "",
          email: user?.email,
          address: form.address,
          property_type: form.property_type,
          preferred_date: form.preferred_date,
          preferred_time: form.preferred_time,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to book your health check.");

      toast.success("Health check booked successfully!");
      router.replace("/account/health-reports");
    } catch (err) {
      setError(err.message || "Failed to book your health check.");
      toast.error(err.message || "Failed to book your health check.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-4 sm:space-y-6">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/account/health-reports"
          className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-black text-slate-700 shadow-2xs transition-all hover:border-ink hover:text-ink hover:shadow-xs mb-3"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Health Reports</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-3.5">
          <span className="grid h-11 w-11 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl bg-amber-50 border border-amber-200/80 text-yellow-dark shadow-2xs">
            <ReportIcon className="h-5 w-5 sm:h-7 sm:w-7" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-ink">Book Electrical Health Check</h2>
            <p className="text-[11.5px] sm:text-[13px] text-body mt-0.5 truncate">
              Our engineer will inspect your property and hand you a full digital report.
            </p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-7 md:p-8 shadow-xs space-y-5 sm:space-y-6"
      >
        <div className="flex items-center gap-2 border-b border-line/70 pb-3 sm:pb-4">
          <SparklesIcon className="h-4 w-4 text-yellow-dark" />
          <h3 className="text-sm sm:text-base font-black text-ink">Booking Details</h3>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-700 shadow-2xs">
            <AlertIcon className="mt-0.5 h-4 w-4 flex-none" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3.5 sm:gap-4 sm:grid-cols-2">
          {/* Property Selection or Location */}
          {properties.length > 0 ? (
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-muted">
                  Property to Inspect <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/account/properties/new"
                    className="text-[11px] sm:text-[11.5px] font-bold text-amber-700 hover:text-amber-800 underline underline-offset-2"
                  >
                    + Add new
                  </Link>
                  <Link
                    href="/account/properties"
                    className="text-[11px] sm:text-[11.5px] font-semibold text-muted hover:text-ink"
                  >
                    Manage
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {properties.map((p) => {
                  const isSelected = form.property_id === p.id;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => handlePropertySelect(p)}
                      className={`flex items-start gap-2.5 sm:gap-3 rounded-2xl border p-3 sm:p-3.5 text-left transition-all ${
                        isSelected
                          ? "border-amber-400 bg-amber-50/60 shadow-xs ring-2 ring-yellow/30"
                          : "border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl transition-colors ${
                          isSelected
                            ? "bg-yellow text-ink font-bold shadow-2xs"
                            : "bg-white text-slate-500 border border-slate-200"
                        }`}
                      >
                        {p.property_type === "Residential" ? (
                          <HomeIcon className="h-4 w-4" />
                        ) : (
                          <BuildingIcon className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-ink truncate">{p.label}</p>
                          {p.is_default && (
                            <span className="text-[9px] sm:text-[9.5px] font-black uppercase tracking-wider bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-md">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] sm:text-[11px] text-muted line-clamp-1 mt-0.5">{p.address}</p>
                      </div>
                      {isSelected && <CheckCircle className="h-4 w-4 text-yellow-dark shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="sm:col-span-2 space-y-1.5">
              <Field icon={PinIcon} label="Property Address" required>
                <input
                  required
                  value={form.address}
                  onChange={set("address")}
                  placeholder="Where should the engineer visit? (Flat, Building, Street)"
                  className={inputClass}
                />
              </Field>
              <Link
                href="/account/properties/new"
                className="inline-block text-[11px] sm:text-[11.5px] font-bold text-amber-700 hover:text-amber-800 underline underline-offset-2"
              >
                + Save this address as a property for 1-click booking
              </Link>
            </div>
          )}

          <Field icon={CalendarIcon} label="Preferred Date">
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={form.preferred_date}
              onChange={set("preferred_date")}
              className={inputClass}
            />
          </Field>

          <Field icon={ClockIcon} label="Preferred Time">
            <input type="time" value={form.preferred_time} onChange={set("preferred_time")} className={inputClass} />
          </Field>

          <div className="sm:col-span-2">
            <label className="mb-1 sm:mb-1.5 block text-[11px] sm:text-xs font-extrabold text-ink">
              Anything specific you&apos;d like checked?
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={set("notes")}
              placeholder="e.g. Frequent MCB tripping, inverter setup, old wiring in one room..."
              className={plainInputClass}
            />
          </div>

          <div className="sm:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-line/70">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow px-6 py-3 sm:px-8 sm:py-3.5 text-xs sm:text-sm font-black text-ink shadow-sm transition-all hover:bg-yellow-dark hover:shadow-md active:scale-[0.99] disabled:opacity-60"
            >
              {!submitting && <PlusIcon className="h-4 w-4" />}
              <span>{submitting ? "Booking…" : "Book Health Check"}</span>
            </button>
            <Link
              href="/account/health-reports"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300/90 bg-white px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-bold text-body hover:border-ink hover:text-ink transition-colors shadow-2xs text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
