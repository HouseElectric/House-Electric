"use client";

import { useCallback, useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { EyeIcon, InboxIcon, MailIcon, SearchIcon, TrashIcon, WhatsAppIcon } from "@/components/icons";

const STATUS_META = {
  new: { label: "New", cls: "bg-blue-50 text-blue-700" },
  in_progress: { label: "In Progress", cls: "bg-amber-50 text-amber-700" },
  closed: { label: "Closed", cls: "bg-emerald-50 text-emerald-700" },
};

const TYPE_LABELS = { booking: "Booking", amc: "AMC", corporate: "Corporate" };

function Badge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.new;
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-bold ${m.cls}`}>{m.label}</span>;
}

const FIELD_LABELS = {
  name: "Name",
  company: "Company",
  contact_person: "Contact Person",
  mobile: "Mobile",
  email: "Email",
  location: "Location",
  address: "Address",
  property_type: "Property Type",
  area: "Approximate Area",
  service: "Service Required",
  requirement: "Requirement",
  message: "Message",
  system_details: "Electrical System Details",
  preferred_date: "Preferred Date",
  preferred_time: "Preferred Time",
  contact_time: "Preferred Contact Time",
};

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchEnquiries = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    let q = supabase.from("enquiries").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    if (typeFilter !== "all") q = q.eq("type", typeFilter);
    const { data } = await q;
    setEnquiries(data ?? []);
    setLoading(false);
  }, [filter, typeFilter]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const markRead = async (id) => {
    await supabase.from("enquiries").update({ read: true }).eq("id", id);
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, read: true } : e)));
    if (selected?.id === id) setSelected((prev) => ({ ...prev, read: true }));
  };

  const updateStatus = async (id, status) => {
    await supabase.from("enquiries").update({ status }).eq("id", id);
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    if (selected?.id === id) setSelected((prev) => ({ ...prev, status }));
  };

  const deleteEnquiry = async (id) => {
    setDeleting(id);
    await supabase.from("enquiries").delete().eq("id", id);
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleting(null);
  };

  const openEnquiry = (enquiry) => {
    setSelected(enquiry);
    if (!enquiry.read) markRead(enquiry.id);
  };

  const exportCSV = () => {
    const headers = ["Type", "Name", "Company", "Mobile", "Email", "Service", "Status", "Date"];
    const rows = filtered.map((e) => [
      TYPE_LABELS[e.type] ?? e.type,
      e.name ?? e.contact_person ?? "",
      e.company ?? "",
      e.mobile ?? "",
      e.email ?? "",
      e.service ?? e.requirement ?? "",
      e.status ?? "new",
      new Date(e.created_at).toLocaleDateString("en-GB"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `house-electric-enquiries-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = enquiries.filter(
    (e) =>
      !search ||
      [e.name, e.company, e.contact_person, e.email, e.mobile, e.service, e.requirement, e.message].some((v) =>
        v?.toLowerCase().includes(search.toLowerCase())
      )
  );

  const fmt = (iso) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const newCount = enquiries.filter((e) => !e.read).length;

  const detailFields = selected
    ? Object.entries(FIELD_LABELS)
        .filter(([key]) => selected[key])
        .map(([key, label]) => ({ label, value: selected[key] }))
    : [];

  return (
    <AdminGuard>
      <AdminLayout title="Enquiries">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, mobile…"
              className="w-full rounded-md border border-line py-2.5 pl-9 pr-3.5 text-[13.5px] outline-none focus:border-ink"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border border-line px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-ink"
          >
            <option value="all">All Types</option>
            <option value="booking">Booking</option>
            <option value="amc">AMC</option>
            <option value="corporate">Corporate</option>
          </select>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-line px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-ink"
          >
            <option value="all">All Status ({enquiries.length})</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
          <button
            onClick={exportCSV}
            className="whitespace-nowrap rounded-md bg-ink px-4 py-2.5 text-[13.5px] font-bold text-white transition-opacity hover:opacity-90"
          >
            Export CSV
          </button>
          {newCount > 0 && (
            <div className="whitespace-nowrap rounded-md bg-blue-50 px-3.5 py-2 text-[13px] font-bold text-blue-700">
              {newCount} unread
            </div>
          )}
        </div>

        <div className={`grid grid-cols-1 items-start gap-5 ${selected ? "lg:grid-cols-[1fr_380px]" : ""}`}>
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="border-b border-line bg-cream/40 px-5 py-3">
              <span className="text-[12px] font-bold uppercase tracking-wide text-body">
                {filtered.length} Enquir{filtered.length === 1 ? "y" : "ies"}
              </span>
            </div>
            {loading ? (
              <div className="p-12 text-center text-[13.5px] text-body">Loading enquiries...</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-body">
                <InboxIcon className="h-6 w-6 text-body/40" />
                No enquiries yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13.5px]">
                  <thead>
                    <tr className="border-b border-line bg-cream/40">
                      {["Type", "Name", "Contact", "Service", "Status", "Date", ""].map((h) => (
                        <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e) => (
                      <tr
                        key={e.id}
                        onClick={() => openEnquiry(e)}
                        className={`cursor-pointer border-t border-line transition-colors hover:bg-cream/40 ${
                          selected?.id === e.id ? "bg-cream/60" : !e.read ? "bg-yellow/5" : "bg-white"
                        }`}
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-[12px] font-bold text-body">
                          {TYPE_LABELS[e.type] ?? e.type}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 text-ink ${e.read ? "font-medium" : "font-bold"}`}>
                          {!e.read && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-yellow" />}
                          {e.name || e.contact_person || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-body">{e.mobile || e.email || "—"}</td>
                        <td className="max-w-[160px] truncate px-4 py-3 text-body">{e.service || e.requirement || "—"}</td>
                        <td className="px-4 py-3">
                          <Badge status={e.status || "new"} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[12px] text-body">{fmt(e.created_at)}</td>
                        <td className="px-4 py-3" onClick={(ev) => ev.stopPropagation()}>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openEnquiry(e)}
                              className="flex items-center gap-1 text-[12px] font-semibold text-ink hover:underline"
                            >
                              <EyeIcon className="h-3.5 w-3.5" />
                              See Details
                            </button>
                            <button
                              onClick={() => deleteEnquiry(e.id)}
                              disabled={deleting === e.id}
                              className="flex items-center gap-1 text-[12px] font-semibold text-red-400 hover:text-red-600"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                              {deleting === e.id ? "…" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selected && (
            <div className="sticky top-[76px] overflow-hidden rounded-2xl border border-line bg-white">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h3 className="text-[14.5px] font-extrabold text-ink">Enquiry Details</h3>
                <button onClick={() => setSelected(null)} className="text-[13px] font-semibold text-body hover:text-ink">
                  Close
                </button>
              </div>
              <div className="p-5">
                <div className="mb-5">
                  <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-body">Status</label>
                  <select
                    value={selected.status || "new"}
                    onChange={(e) => updateStatus(selected.id, e.target.value)}
                    className="w-full rounded-md border border-line px-3 py-2 text-[13.5px] text-ink outline-none focus:border-ink"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="space-y-3.5">
                  {detailFields.map((f) => (
                    <div key={f.label}>
                      <div className="text-[11px] font-bold uppercase tracking-wide text-body">{f.label}</div>
                      <div className="whitespace-pre-wrap text-[13.5px] font-medium text-ink">{f.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex gap-2">
                  {selected.email && (
                    <a
                      href={`mailto:${selected.email}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-ink py-2.5 text-center text-[13px] font-bold text-white"
                    >
                      <MailIcon className="h-4 w-4" />
                      Email
                    </a>
                  )}
                  {selected.mobile && (
                    <a
                      href={`https://wa.me/91${selected.mobile.replace(/[^0-9]/g, "").slice(-10)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[#25D366] py-2.5 text-center text-[13px] font-bold text-white"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
