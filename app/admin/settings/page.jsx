"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";

const EMPTY = {
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  state: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  youtube: "",
};

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
      alert(error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

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
          <form onSubmit={save} className="max-w-xl rounded-2xl border border-line bg-white p-6">
            <div className="mb-4">
              <label className="mb-1.5 block text-[13px] font-bold text-ink">Phone Number</label>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 98765 43210"
                required
                className="w-full rounded-md border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-ink"
              />
              <p className="mt-1 text-[12px] text-body">Shown as-is; used for all "Call Now" buttons.</p>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[13px] font-bold text-ink">WhatsApp Number</label>
              <input
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                placeholder="919876543210"
                required
                className="w-full rounded-md border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-ink"
              />
              <p className="mt-1 text-[12px] text-body">
                Country code + number, no spaces or symbols (e.g. 919876543210).
              </p>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[13px] font-bold text-ink">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
                className="w-full rounded-md border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-ink"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[13px] font-bold text-ink">Full Address</label>
              <input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Kh No. 307/202, 1st Floor, Plot No. 174, Street Number 4, Block-B, New Delhi, North Delhi, Delhi 110042"
                required
                className="w-full rounded-md border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-ink"
              />
            </div>

            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-ink">City</label>
                <input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  required
                  className="w-full rounded-md border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-ink">State</label>
                <input
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  required
                  className="w-full rounded-md border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-ink"
                />
              </div>
            </div>

            <div className="mb-5 border-t border-line pt-5">
              <h3 className="mb-1 text-[14px] font-extrabold text-ink">Social Links</h3>
              <p className="mb-4 text-[12px] text-body">
                Optional. Used by the social icons in the Footer and on the Contact page. Leave blank to hide a link.
              </p>

              <div className="mb-4">
                <label className="mb-1.5 block text-[13px] font-bold text-ink">Facebook URL</label>
                <input
                  value={form.facebook}
                  onChange={(e) => set("facebook", e.target.value)}
                  placeholder="https://facebook.com/houseelectric"
                  className="w-full rounded-md border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-ink"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1.5 block text-[13px] font-bold text-ink">Instagram URL</label>
                <input
                  value={form.instagram}
                  onChange={(e) => set("instagram", e.target.value)}
                  placeholder="https://instagram.com/houseelectric"
                  className="w-full rounded-md border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-ink"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1.5 block text-[13px] font-bold text-ink">LinkedIn URL</label>
                <input
                  value={form.linkedin}
                  onChange={(e) => set("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/company/houseelectric"
                  className="w-full rounded-md border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-ink">YouTube URL</label>
                <input
                  value={form.youtube}
                  onChange={(e) => set("youtube", e.target.value)}
                  placeholder="https://youtube.com/@houseelectric"
                  className="w-full rounded-md border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-ink"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink hover:bg-yellow-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            {saved && <span className="ml-3 text-[13px] font-semibold text-emerald-600">Saved!</span>}
          </form>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
