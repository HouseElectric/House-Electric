"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle } from "./icons";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { supabase } from "@/lib/supabase";

const inputClass =
  "w-full min-w-0 rounded-lg border border-line bg-white px-3.5 py-2.5 text-[14px] text-ink placeholder:text-[#9A9285] focus:border-ink focus:outline-none focus:ring-2 focus:ring-yellow/30 transition-shadow";

const FIELDS = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "mobile", label: "Mobile Number", type: "tel", required: true },
  { name: "email", label: "Email", type: "email" },
  {
    name: "property_type",
    label: "Property Type",
    type: "select",
    options: ["Residential", "Commercial", "Corporate / Institutional"],
  },
  { name: "address", label: "Property Address", type: "text", full: true },
  { name: "preferred_date", label: "Preferred Date", type: "date" },
  { name: "preferred_time", label: "Preferred Time", type: "time" },
  { name: "notes", label: "Anything specific you'd like checked?", type: "textarea", full: true },
];

// Logged-in customers already have name/mobile/email on file — skip re-asking for it.
const LOGGED_IN_FIELDS = FIELDS.filter((f) => !["name", "mobile", "email"].includes(f.name));

export default function HealthCheckBookingForm({ id }) {
  const { phone, whatsapp } = useSiteSettings();
  const { user, profile, defaultProperty } = useCustomerAuth() || {};
  const fields = user ? LOGGED_IN_FIELDS : FIELDS;
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [requestNumber, setRequestNumber] = useState("");

  // defaultProperty loads asynchronously after mount — backfill once it arrives.
  useEffect(() => {
    if (!defaultProperty) return;
    setValues((v) => ({
      ...v,
      property_type: v.property_type || defaultProperty.property_type || "",
      address:
        v.address ||
        [defaultProperty.address, defaultProperty.city].filter(Boolean).join(", "),
    }));
  }, [defaultProperty]);

  const handleChange = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const {
        data: { session },
      } = (await supabase?.auth.getSession()) || { data: {} };
      const payload = user
        ? { ...values, name: profile?.name || user.email, mobile: profile?.mobile || "", email: user.email }
        : values;
      const res = await fetch("/api/health-check", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setRequestNumber(data.requestNumber || "");
    } catch (err) {
      setSubmitError(err.message || "Something went wrong booking your health check. Please call or WhatsApp us directly.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section id={id} className="scroll-mt-28 py-12 md:py-[74px]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <p className="eyebrow justify-center">Book Now</p>
          <h2>Book Your Electrical Health Check</h2>
          <p className="mx-auto mt-3 max-w-[52ch] text-[15px]">
            Tell us about your property and preferred visit time — our engineer will inspect and hand you a full digital
            report.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="w-full rounded-2xl border border-line/80 bg-white p-5 shadow-xl sm:p-7 md:rounded-3xl md:p-8"
        >
          {submitted ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle className="mb-4 h-12 w-12 text-yellow" />
              <h3 className="mb-2 text-lg font-extrabold text-ink">Booking received!</h3>
              <p className="max-w-[40ch] text-[15px]">
                Your health check{requestNumber ? ` (${requestNumber})` : ""} has been booked — our team will call you
                shortly to confirm the visit. You can also reach us at{" "}
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="font-bold text-ink">
                  {phone}
                </a>
                .
              </p>
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi House Electric, I just booked an Electrical Health Check.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-md border border-line px-6 py-3 text-[13.5px] font-bold text-ink transition-colors hover:border-ink"
              >
                Chat on WhatsApp
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {user && (
                <div className="sm:col-span-2 rounded-md border border-line/80 bg-cream/50 px-4 py-3 text-[13px] text-ink">
                  Booking as <span className="font-extrabold">{profile?.name || user.email}</span> — we&apos;ll use
                  your saved contact details from{" "}
                  <Link href="/account/profile" className="font-bold underline underline-offset-2">
                    My Profile
                  </Link>
                  . Property and address prefilled from{" "}
                  <Link href="/account/properties" className="font-bold underline underline-offset-2">
                    My Properties
                  </Link>
                  {" "}— feel free to edit below.
                </div>
              )}
              {submitError && (
                <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] font-semibold text-red-700">
                  {submitError}
                </div>
              )}
              {fields.map((f) => (
                <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
                  <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">
                    {f.label}
                    {f.required && <span className="text-yellow-dark"> *</span>}
                  </label>
                  {f.type === "select" ? (
                    <select required={f.required} value={values[f.name] || ""} onChange={handleChange(f.name)} className={inputClass}>
                      <option value="" disabled>
                        Select {f.label.toLowerCase()}
                      </option>
                      {f.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea
                      rows={3}
                      value={values[f.name] || ""}
                      onChange={handleChange(f.name)}
                      className={inputClass}
                      placeholder={`Enter ${f.label.toLowerCase()}`}
                    />
                  ) : (
                    <input
                      type={f.type}
                      required={f.required}
                      value={values[f.name] || ""}
                      onChange={handleChange(f.name)}
                      className={inputClass}
                      placeholder={`Enter ${f.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-md bg-yellow px-7 py-3.5 text-sm font-extrabold text-ink shadow-[0_10px_25px_-5px_rgba(242,176,30,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_15px_30px_-5px_rgba(242,176,30,0.6)] disabled:opacity-60 sm:w-auto sm:px-8"
                >
                  {submitting ? "Booking…" : "Book Health Check"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
