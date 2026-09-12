"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { FormSection, Field, inputClass } from "@/components/admin/FormKit";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle,
  PhoneIcon,
  WhatsAppIcon,
  MailIcon,
  PinIcon,
  ReportIcon,
  BuildingIcon,
  ClockIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  YoutubeIcon,
} from "@/components/icons";

const EMPTY = {
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  state: "",
  gstin: "",
  hours: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  youtube: "",
};

const iconInput = `${inputClass} pl-10`;

function IconField({ icon: Icon, label, hint, children }) {
  return (
    <Field label={label}>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body/40" />
        {children}
      </div>
      {hint && <p className="mt-1.5 text-[11.5px] text-body">{hint}</p>}
    </Field>
  );
}

const SOCIALS = [
  { key: "facebook", label: "Facebook URL", icon: FacebookIcon, placeholder: "https://facebook.com/houseelectric" },
  { key: "instagram", label: "Instagram URL", icon: InstagramIcon, placeholder: "https://instagram.com/houseelectric" },
  { key: "linkedin", label: "LinkedIn URL", icon: LinkedInIcon, placeholder: "https://linkedin.com/company/houseelectric" },
  { key: "youtube", label: "YouTube URL", icon: YoutubeIcon, placeholder: "https://youtube.com/@houseelectric" },
];

export default function AdminSettingsPage() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("data").eq("key", "contact").maybeSingle();
      if (data?.data) setForm({ ...EMPTY, ...data.data });
      setLoading(false);
    })();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert([{ key: "contact", data: form, updated_at: new Date().toISOString() }]);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSaved(true);
      toast.success("Contact settings saved");
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const activeSocials = SOCIALS.filter((s) => form[s.key]?.trim());

  return (
    <AdminGuard>
      <AdminLayout title="Contact Settings">
        <p className="mb-6 max-w-[65ch] text-[13.5px] text-body">
          This phone number, WhatsApp number, email and address are used everywhere across the
          website — header, footer, floating call/WhatsApp buttons, sticky mobile bar, contact
          page and all enquiry forms. Update it once here and it updates everywhere.
        </p>

        {loading ? (
          <div className="rounded-2xl border border-line bg-white p-12 text-center text-[13.5px] text-body">
            Loading...
          </div>
        ) : (
          <form onSubmit={save} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
            <div className="space-y-6">
              <FormSection title="Primary Contact" hint="Shown as the main contact points across the site.">
                <IconField icon={PhoneIcon} label="Phone Number" hint='Shown as-is; used for all "Call Now" buttons.'>
                  <input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className={iconInput}
                  />
                </IconField>

                <IconField
                  icon={WhatsAppIcon}
                  label="WhatsApp Number"
                  hint="Country code + number, no spaces or symbols (e.g. 919876543210)."
                >
                  <input
                    value={form.whatsapp}
                    onChange={(e) => set("whatsapp", e.target.value)}
                    placeholder="919876543210"
                    required
                    className={iconInput}
                  />
                </IconField>

                <IconField icon={MailIcon} label="Email Address">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    required
                    className={iconInput}
                  />
                </IconField>
              </FormSection>

              <FormSection title="Business Details" hint="Shown in the Footer and on every generated Invoice/Quotation.">
                <IconField icon={PinIcon} label="Full Address">
                  <input
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="Kh No. 307/202, 1st Floor, Plot No. 174, Street Number 4, Block-B, New Delhi, North Delhi, Delhi 110042"
                    required
                    className={iconInput}
                  />
                </IconField>

                <IconField icon={ReportIcon} label="GSTIN">
                  <input
                    value={form.gstin}
                    onChange={(e) => set("gstin", e.target.value)}
                    placeholder="07DDQPK2622Q1ZX"
                    className={iconInput}
                  />
                </IconField>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <IconField icon={BuildingIcon} label="City">
                    <input value={form.city} onChange={(e) => set("city", e.target.value)} required className={iconInput} />
                  </IconField>
                  <IconField icon={BuildingIcon} label="State">
                    <input value={form.state} onChange={(e) => set("state", e.target.value)} required className={iconInput} />
                  </IconField>
                </div>

                <IconField
                  icon={ClockIcon}
                  label="Working Hours"
                  hint="Shown on the Contact page. Leave blank to hide it — never show hours you don't actually keep."
                >
                  <input
                    value={form.hours}
                    onChange={(e) => set("hours", e.target.value)}
                    placeholder="Mon – Sat, 9:00 AM – 8:00 PM"
                    className={iconInput}
                  />
                </IconField>
              </FormSection>

              <FormSection
                title="Social Links"
                hint="Optional. Used by the social icons in the Footer and on the Contact page. Leave blank to hide a link."
              >
                {SOCIALS.map((s) => (
                  <IconField key={s.key} icon={s.icon} label={s.label}>
                    <input
                      value={form[s.key]}
                      onChange={(e) => set(s.key, e.target.value)}
                      placeholder={s.placeholder}
                      className={iconInput}
                    />
                  </IconField>
                ))}
              </FormSection>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                {saved && (
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600">
                    <CheckCircle className="h-4 w-4" /> Saved!
                  </span>
                )}
              </div>
            </div>

            {/* ---------- Live Preview ---------- */}
            <div className="lg:sticky lg:top-[76px]">
              <div className="overflow-hidden rounded-2xl border border-line bg-white">
                <div className="relative overflow-hidden bg-gradient-to-br from-ink to-[#2a2a2a] p-5 text-white">
                  <span className="glow-blob -right-8 -top-10 h-32 w-32 bg-yellow/20" />
                  <p className="relative text-[11px] font-bold uppercase tracking-wider text-white/50">Live Preview</p>
                  <p className="relative mt-1 text-[15px] font-extrabold">How this appears sitewide</p>
                </div>
                <div className="space-y-4 p-5">
                  {[
                    { icon: PhoneIcon, value: form.phone, empty: "No phone number set" },
                    { icon: WhatsAppIcon, value: form.whatsapp, empty: "No WhatsApp number set" },
                    { icon: MailIcon, value: form.email, empty: "No email set" },
                    { icon: PinIcon, value: [form.address, form.city, form.state].filter(Boolean).join(", "), empty: "No address set" },
                    { icon: ClockIcon, value: form.hours, empty: "No working hours set" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-lg ${
                          row.value ? "bg-cream text-ink" : "bg-gray-100 text-gray-300"
                        }`}
                      >
                        <row.icon className="h-3.5 w-3.5" />
                      </span>
                      <p className={`text-[12.5px] leading-relaxed ${row.value ? "font-semibold text-ink" : "italic text-body/50"}`}>
                        {row.value || row.empty}
                      </p>
                    </div>
                  ))}

                  <div className="border-t border-line pt-4">
                    <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-body">
                      Social Links ({activeSocials.length}/4 active)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SOCIALS.map((s) => {
                        const active = !!form[s.key]?.trim();
                        return (
                          <span
                            key={s.key}
                            className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${
                              active ? "bg-ink text-yellow" : "bg-gray-100 text-gray-300"
                            }`}
                            title={s.label}
                          >
                            <s.icon className="h-4 w-4" />
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
