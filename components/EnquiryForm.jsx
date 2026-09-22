"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle } from "./icons";
import { supabase } from "@/lib/supabase";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

const SERVICE_TYPE_OPTIONS = [
  "Electrical Repair",
  "Electrical Installation",
  "Electrical Health Check",
  "Electrical Maintenance",
  "AMC",
  "Certified Electrical Audits",
  "Emergency Service",
  "Other",
];

const DB_FIELD = {
  propertyType: "property_type",
  systemDetails: "system_details",
  contactPerson: "contact_person",
  contactTime: "contact_time",
  date: "preferred_date",
  time: "preferred_time",
};

const FIELD_SETS = {
  booking: {
    heading: "Book a Service",
    intro: "I'd like to book a service.",
    submitLabel: "Book Service",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "mobile", label: "Mobile Number", type: "tel", required: true },
      { name: "email", label: "Email", type: "email" },
      { name: "location", label: "Location", type: "text" },
      { name: "address", label: "Address", type: "text", full: true },
      {
        name: "service",
        label: "Service Required",
        type: "select",
        required: true,
        full: true,
        options: [
          "Electrical Repair",
          "Electrical Installation",
          "Electrical Health Check",
          "Electrical Maintenance",
          "AMC",
          "Certified Electrical Audits",
          "Emergency Service",
          "Other",
        ],
      },
      { name: "date", label: "Preferred Date", type: "date" },
      { name: "time", label: "Preferred Time", type: "time" },
      { name: "message", label: "Problem / Requirement", type: "textarea", full: true },
    ],
  },
  amc: {
    heading: "AMC Enquiry",
    intro: "I'd like to enquire about an Annual Maintenance Contract (AMC).",
    submitLabel: "Request AMC",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "company", label: "Company / Property Name", type: "text" },
      { name: "mobile", label: "Mobile Number", type: "tel", required: true },
      { name: "email", label: "Email", type: "email" },
      {
        name: "propertyType",
        label: "Property Type",
        type: "select",
        options: ["Residential", "Commercial", "Corporate / Institutional"],
      },
      { name: "location", label: "Location", type: "text" },
      { name: "area", label: "Approximate Area", type: "text" },
      { name: "date", label: "Preferred Date", type: "date" },
      { name: "systemDetails", label: "Electrical System Details", type: "textarea", full: true },
      { name: "message", label: "Message", type: "textarea", full: true },
    ],
  },
  corporate: {
    heading: "Request Site Assessment",
    intro: "I'd like to request a site assessment for corporate/commercial electrical maintenance.",
    submitLabel: "Request Site Assessment",
    fields: [
      { name: "company", label: "Company Name", type: "text", required: true },
      { name: "contactPerson", label: "Contact Person", type: "text", required: true },
      { name: "mobile", label: "Mobile Number", type: "tel", required: true },
      { name: "email", label: "Email", type: "email" },
      { name: "location", label: "Location", type: "text" },
      {
        name: "propertyType",
        label: "Property Type",
        type: "select",
        options: ["Office", "Commercial Building", "Factory / Warehouse", "Institution", "Other"],
      },
      { name: "area", label: "Approximate Area", type: "text" },
      {
        name: "contactTime",
        label: "Preferred Contact Time",
        type: "select",
        options: ["Morning", "Afternoon", "Evening"],
      },
      { name: "requirement", label: "Requirement", type: "textarea", full: true },
    ],
  },
};

const inputClass =
  "w-full min-w-0 rounded-lg border border-line bg-white px-3.5 py-2.5 text-[14px] text-ink placeholder:text-[#9A9285] focus:border-ink focus:outline-none focus:ring-2 focus:ring-yellow/30 transition-shadow";

export default function EnquiryForm({ variant = "booking", eyebrow, title, subtitle, className = "", id, sidebar }) {
  const config = FIELD_SETS[variant];
  const { phone, whatsapp } = useSiteSettings();
  const { user, profile, defaultProperty } = useCustomerAuth() || {};
  // Logged-in customers already have their name/mobile/email/address on file — for
  // booking and AMC specifically, skip re-asking for it and go straight to a real,
  // account-linked service request instead of an anonymous enquiry.
  const isLoggedInBooking = (variant === "booking" || variant === "amc") && !!user;
  const [values, setValues] = useState(() => (variant === "amc" ? { serviceType: "AMC" } : {}));
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  const lines = config.fields
    .filter((f) => values[f.name])
    .map((f) => `${f.label}: ${values[f.name]}`);
  const whatsappMessage = `Hello House Electric, ${config.intro}\n${lines.join("\n")}`;
  const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    const payload = { type: variant };
    config.fields.forEach((f) => {
      if (values[f.name]) payload[DB_FIELD[f.name] || f.name] = values[f.name];
    });

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
    } catch {
      setSubmitError("Something went wrong saving your enquiry. Please call or WhatsApp us directly.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const handleAccountBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          service_type: values.serviceType,
          preferred_date: values.date,
          preferred_time: values.time,
          description: values.description,
          location: defaultProperty
            ? [defaultProperty.address, defaultProperty.city, defaultProperty.state].filter(Boolean).join(", ")
            : "",
          property_id: defaultProperty?.id || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit your request.");
      setTicketNumber(data.request?.ticket_number || "");
    } catch (err) {
      setSubmitError(err.message || "Something went wrong submitting your request.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section id={id} className={`scroll-mt-28 py-12 md:py-[74px] ${className}`}>
      <div className={`mx-auto px-4 sm:px-6 ${sidebar ? "max-w-wrap" : "max-w-3xl"}`}>
        {(eyebrow || title) && (
          <div className={`mb-8 ${sidebar ? "max-w-[56ch]" : "text-center"}`}>
            {eyebrow && <p className={`eyebrow ${sidebar ? "" : "justify-center"}`}>{eyebrow}</p>}
            {title && <h2>{title}</h2>}
            {subtitle && (
              <p className={`mt-3 max-w-[52ch] text-[15px] ${sidebar ? "" : "mx-auto"}`}>{subtitle}</p>
            )}
          </div>
        )}

        <div className={sidebar ? "grid grid-cols-1 items-start gap-8 lg:grid-cols-12" : ""}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className={`${sidebar ? "lg:col-span-7 xl:col-span-7" : ""} min-w-0 w-full rounded-2xl md:rounded-3xl border border-line/80 bg-white p-5 sm:p-7 md:p-8 shadow-xl`}
          >
            {submitted ? (
              <div className="flex flex-col items-center py-10 text-center">
                <CheckCircle className="mb-4 h-12 w-12 text-yellow" />
                <h3 className="mb-2 text-lg font-extrabold text-ink">
                  {isLoggedInBooking ? "Request submitted!" : "Thank you!"}
                </h3>
                <p className="max-w-[40ch] text-[15px]">
                  {isLoggedInBooking ? (
                    <>
                      Your service request{ticketNumber ? ` (${ticketNumber})` : ""} has been received — our team
                      will be in touch shortly. Track it anytime from your dashboard.
                    </>
                  ) : (
                    <>
                      Your enquiry has been received &mdash; our team will get back to you shortly. You
                      can also call us directly at{" "}
                      <a href={`tel:${phone.replace(/\s+/g, "")}`} className="font-bold text-ink">
                        {phone}
                      </a>{" "}
                      or reach out on WhatsApp.
                    </>
                  )}
                </p>
                {isLoggedInBooking ? (
                  <Link
                    href="/account/requests"
                    className="mt-6 inline-flex items-center gap-2 rounded-md bg-yellow px-6 py-3 text-[13.5px] font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark"
                  >
                    View My Requests
                  </Link>
                ) : (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-md border border-line px-6 py-3 text-[13.5px] font-bold text-ink transition-colors hover:border-ink"
                  >
                    Chat on WhatsApp
                  </a>
                )}
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setValues({});
                  }}
                  className="mt-4 text-[14px] font-bold text-ink underline underline-offset-4"
                >
                  Submit another {isLoggedInBooking ? "request" : "enquiry"}
                </button>
              </div>
            ) : isLoggedInBooking ? (
              <form onSubmit={handleAccountBooking} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 rounded-md border border-line/80 bg-cream/50 px-4 py-3 text-[13px] text-ink">
                  Booking as <span className="font-extrabold">{profile?.name || user.email}</span>
                  {defaultProperty ? (
                    <>
                      {" "}
                      for <span className="font-extrabold">{defaultProperty.label}</span> —{" "}
                      {[defaultProperty.address, defaultProperty.city].filter(Boolean).join(", ")}.
                    </>
                  ) : (
                    " — we'll use your saved contact details."
                  )}{" "}
                  Update anytime from{" "}
                  <Link href="/account/properties" className="font-bold underline underline-offset-2">
                    My Properties
                  </Link>
                  .
                </div>
                {!defaultProperty && (
                  <div className="sm:col-span-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-semibold text-amber-900">
                    You haven't added a property yet, so our technician won't have a location to visit.{" "}
                    <Link href="/account/properties/new" className="font-bold underline underline-offset-2">
                      Add your property
                    </Link>{" "}
                    before booking, or our team will call you to confirm it.
                  </div>
                )}
                {submitError && (
                  <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] font-semibold text-red-700">
                    {submitError}
                  </div>
                )}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">
                    Service Required<span className="text-yellow-dark"> *</span>
                  </label>
                  <select
                    required
                    value={values.serviceType || ""}
                    onChange={handleChange("serviceType")}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Select service required
                    </option>
                    {SERVICE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Preferred Date</label>
                  <input type="date" value={values.date || ""} onChange={handleChange("date")} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Preferred Time</label>
                  <input type="time" value={values.time || ""} onChange={handleChange("time")} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">Problem / Requirement</label>
                  <textarea
                    rows={3}
                    value={values.description || ""}
                    onChange={handleChange("description")}
                    className={inputClass}
                    placeholder="Briefly describe the issue you're facing…"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-md bg-yellow px-7 py-3.5 text-sm font-extrabold text-ink shadow-[0_10px_25px_-5px_rgba(242,176,30,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_15px_30px_-5px_rgba(242,176,30,0.6)] disabled:opacity-60 sm:w-auto sm:px-8"
                  >
                    {submitting ? "Submitting…" : config.submitLabel}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {submitError && (
                  <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] font-semibold text-red-700">
                    {submitError}
                  </div>
                )}
                {config.fields.map((f) => (
                  <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
                    <label className="mb-1.5 block text-[13.5px] font-semibold text-ink">
                      {f.label}
                      {f.required && <span className="text-yellow-dark"> *</span>}
                    </label>
                    {f.type === "select" ? (
                      <select
                        required={f.required}
                        value={values[f.name] || ""}
                        onChange={handleChange(f.name)}
                        className={inputClass}
                      >
                        <option value="" disabled>
                          Select {f.label.toLowerCase()}
                        </option>
                        {f.options?.map((opt) => (
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
                    {submitting ? "Submitting…" : config.submitLabel}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
          {sidebar && <div className="lg:col-span-5 xl:col-span-5 min-w-0 w-full">{sidebar}</div>}
        </div>
      </div>
    </section>
  );
}
