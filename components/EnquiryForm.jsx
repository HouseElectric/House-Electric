"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "./icons";
import { supabase } from "@/lib/supabase";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

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
    heading: "Request Corporate Quotation",
    intro: "I'd like a quotation for corporate/commercial electrical maintenance.",
    submitLabel: "Request Quotation",
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
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

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

    if (supabase) {
      const payload = { type: variant };
      config.fields.forEach((f) => {
        if (values[f.name]) payload[DB_FIELD[f.name] || f.name] = values[f.name];
      });
      const { error } = await supabase.from("enquiries").insert([payload]);
      if (error) {
        console.error("Failed to save enquiry:", error.message);
        setSubmitError("Something went wrong saving your enquiry. Please call or WhatsApp us directly.");
        setSubmitting(false);
        return;
      }
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
                <h3 className="mb-2 text-lg font-extrabold text-ink">Thank you!</h3>
                <p className="max-w-[40ch] text-[15px]">
                  Your enquiry has been received &mdash; our team will get back to you shortly. You
                  can also call us directly at{" "}
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="font-bold text-ink">
                    {phone}
                  </a>{" "}
                  or reach out on WhatsApp.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-md border border-line px-6 py-3 text-[13.5px] font-bold text-ink transition-colors hover:border-ink"
                >
                  Chat on WhatsApp
                </a>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-[14px] font-bold text-ink underline underline-offset-4"
                >
                  Submit another enquiry
                </button>
              </div>
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
