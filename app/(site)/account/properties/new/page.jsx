"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import {
  ArrowLeftIcon,
  BuildingIcon,
  CheckCircle,
  HomeIcon,
  PinIcon,
  PlusIcon,
  SparklesIcon,
  WrenchIcon,
} from "@/components/icons";

const PROPERTY_TYPES = [
  { id: "Residential", label: "Residential", icon: HomeIcon, desc: "Home, Villa, Flat" },
  { id: "Commercial", label: "Commercial", icon: BuildingIcon, desc: "Shop, Retail, Clinic" },
  { id: "Corporate / Institutional", label: "Corporate", icon: BuildingIcon, desc: "Office, Hub, Campus" },
];

const EMPTY_FORM = {
  label: "",
  property_type: "Residential",
  address: "",
  city: "",
  state: "",
  pincode: "",
  area_sqft: "",
  electrical_details: "",
  is_default: false,
};

function PropertyFormInner() {
  const { user } = useCustomerAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit") || searchParams.get("id");

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(Boolean(editId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    if (!editId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from("properties")
          .select("*")
          .eq("id", editId)
          .eq("customer_id", user.id)
          .maybeSingle();

        if (fetchErr || !data) {
          toast.error("Property not found or access denied.");
          router.replace("/account/properties");
          return;
        }

        setForm({
          label: data.label || "",
          property_type: data.property_type || "Residential",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          area_sqft: data.area_sqft != null ? String(data.area_sqft) : "",
          electrical_details: data.electrical_details || "",
          is_default: Boolean(data.is_default),
        });
      } catch (err) {
        toast.error("Error loading property details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, editId, router]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeSelect = (typeId) => {
    setForm((prev) => ({ ...prev, property_type: typeId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to manage properties.");
      return;
    }
    if (!form.label.trim()) {
      setError("Please provide a name for this property.");
      return;
    }
    if (!form.address.trim()) {
      setError("Please provide an address for this property.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        label: form.label.trim(),
        property_type: form.property_type,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.replace(/\D/g, "").slice(0, 6),
        area_sqft: form.area_sqft === "" ? null : Number(form.area_sqft),
        electrical_details: form.electrical_details.trim(),
        is_default: form.is_default,
      };

      if (editId) {
        if (form.is_default) {
          await supabase.from("properties").update({ is_default: false }).eq("customer_id", user.id);
        }
        const { error: updateErr } = await supabase
          .from("properties")
          .update(payload)
          .eq("id", editId)
          .eq("customer_id", user.id);

        if (updateErr) throw updateErr;
        toast.success("Property updated successfully!");
      } else {
        const { count } = await supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("customer_id", user.id);

        const shouldBeDefault = count === 0 || form.is_default;
        if (shouldBeDefault && count > 0) {
          await supabase.from("properties").update({ is_default: false }).eq("customer_id", user.id);
        }

        const insertPayload = {
          ...payload,
          customer_id: user.id,
          is_default: shouldBeDefault,
        };

        const { error: insertErr } = await supabase.from("properties").insert([insertPayload]);
        if (insertErr) throw insertErr;
        toast.success("Property added successfully!");
      }

      router.push("/account/properties");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save property. Please try again.");
      toast.error("Failed to save property.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-yellow/15 shadow-2xs";

  if (loading) {
    return (
      <div className="max-w-3xl rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body shadow-2xs">
        Loading property details…
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/account/properties"
          className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-black text-slate-700 shadow-2xs transition-all hover:border-ink hover:text-ink hover:shadow-xs mb-3.5"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to My Properties</span>
        </Link>
        <div className="flex items-start sm:items-center gap-3.5">
          <span className="grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl bg-amber-50 border border-amber-200/80 text-yellow-dark shadow-2xs">
            {form.property_type === "Residential" ? (
              <HomeIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            ) : (
              <BuildingIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            )}
          </span>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-ink">
              {editId ? "Edit Property" : "Add New Property"}
            </h2>
            <p className="text-xs sm:text-[13px] text-body mt-0.5">
              {editId
                ? "Update your property address and electrical configuration details."
                : "Register a home, apartment, or commercial building to manage service requests and AMC coverage."}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-black text-red-700 shadow-2xs">
          {error}
        </div>
      )}

      {/* Property Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 md:p-8 shadow-xs space-y-6"
      >
        {/* Interactive Property Type Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-muted">
            Property Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {PROPERTY_TYPES.map((type) => {
              const active = form.property_type === type.id;
              const Icon = type.icon;
              return (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                    active
                      ? "border-amber-400 bg-amber-50/60 shadow-xs ring-2 ring-yellow/30"
                      : "border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors ${
                      active ? "bg-yellow text-ink font-bold shadow-2xs" : "bg-white text-slate-500 border border-slate-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-ink leading-tight">{type.label}</p>
                    <p className="text-[10.5px] text-muted font-medium mt-0.5">{type.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-line/70">
          {/* Property Name */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-extrabold text-ink">
              Property Name / Nickname <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.label}
              onChange={handleChange("label")}
              placeholder="e.g. Sunrise Residency, Home – Delhi, Office Floor 3"
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-muted">
              A short label to easily identify this location when raising service requests.
            </p>
          </div>

          {/* Full Address */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-extrabold text-ink">
              Full Address <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.address}
              onChange={handleChange("address")}
              placeholder="Flat / House No., Building Name, Street / Road, Sector"
              className={inputClass}
            />
          </div>

          {/* City */}
          <div>
            <label className="mb-1.5 block text-xs font-extrabold text-ink">City</label>
            <input
              value={form.city}
              onChange={handleChange("city")}
              placeholder="e.g. Delhi, Noida, Lucknow"
              className={inputClass}
            />
          </div>

          {/* State */}
          <div>
            <label className="mb-1.5 block text-xs font-extrabold text-ink">State</label>
            <input
              value={form.state}
              onChange={handleChange("state")}
              placeholder="e.g. Delhi, Uttar Pradesh"
              className={inputClass}
            />
          </div>

          {/* Pincode */}
          <div>
            <label className="mb-1.5 block text-xs font-extrabold text-ink">Pincode</label>
            <input
              value={form.pincode}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                }))
              }
              inputMode="numeric"
              maxLength={6}
              placeholder="e.g. 110042"
              className={inputClass}
            />
          </div>

          {/* Area */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-extrabold text-ink">Area (sq. ft.)</label>
              <span className="text-[10.5px] font-bold text-muted">Optional</span>
            </div>
            <input
              type="number"
              min="0"
              value={form.area_sqft}
              onChange={handleChange("area_sqft")}
              placeholder="e.g. 1500"
              className={inputClass}
            />
          </div>

          {/* Set as default toggle card */}
          <div className="sm:col-span-2 pt-1">
            <div
              onClick={() => setForm((prev) => ({ ...prev, is_default: !prev.is_default }))}
              className={`cursor-pointer flex items-center justify-between gap-3 rounded-2xl border p-3.5 sm:p-4 transition-all ${
                form.is_default
                  ? "border-emerald-300 bg-emerald-50/60 shadow-2xs"
                  : "border-slate-200/90 bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-colors ${
                    form.is_default ? "bg-emerald-500 text-white shadow-2xs" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs sm:text-[13px] font-black text-ink">Set as default property</p>
                  <p className="text-[11px] text-body">Pre-selected for new service bookings & priority dispatch</p>
                </div>
              </div>
              <span
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  form.is_default ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                    form.is_default ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </span>
            </div>
          </div>

          {/* Electrical Infrastructure */}
          <div className="sm:col-span-2 pt-1">
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-extrabold text-ink">Electrical Infrastructure</label>
              <span className="text-[10.5px] font-bold text-muted">Optional</span>
            </div>
            <textarea
              rows={3}
              value={form.electrical_details}
              onChange={handleChange("electrical_details")}
              placeholder="e.g. 3-Phase Connection, 63A Main MCB, 2 Distribution Boards, Inverter setup"
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-muted">
              Any electrical specs or setup notes our technicians and engineers should be aware of.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-t border-line/70 pt-5">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow px-7 py-3.5 text-xs sm:text-sm font-black text-ink shadow-sm transition-all hover:bg-yellow-dark hover:shadow-md active:scale-[0.99] disabled:opacity-60"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{saving ? "Saving…" : editId ? "Save Changes" : "Add Property"}</span>
          </button>
          <Link
            href="/account/properties"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300/90 bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-body hover:border-ink hover:text-ink transition-colors shadow-2xs"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NewPropertyPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body shadow-2xs">
          Loading property form…
        </div>
      }
    >
      <PropertyFormInner />
    </Suspense>
  );
}
