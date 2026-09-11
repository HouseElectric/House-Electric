"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { ArrowLeftIcon, DownloadIcon, EyeIcon, InboxIcon, MailIcon, SearchIcon, TrashIcon, WhatsAppIcon, XIcon } from "@/components/icons";

const STATUS_META = {
  new: { label: "New", cls: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  in_progress: { label: "In Progress", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  closed: { label: "Closed", cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};

const TYPE_META = {
  booking: { label: "Booking", cls: "bg-blue-50 text-blue-700", gradient: "from-blue-600 to-indigo-700" },
  amc: { label: "AMC", cls: "bg-yellow/15 text-yellow-dark", gradient: "from-amber-500 to-yellow-600" },
  corporate: { label: "Corporate", cls: "bg-violet-50 text-violet-700", gradient: "from-violet-600 to-purple-700" },
};

const TYPE_LABELS = { booking: "Booking", amc: "AMC", corporate: "Corporate" };

function Badge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.new;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-bold ${m.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function TypeBadge({ type }) {
  const m = TYPE_META[type] ?? { label: type, cls: "bg-cream text-body" };
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${m.cls}`}>{m.label}</span>;
}

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
];

function avatarGradient(seed) {
  const idx = (seed?.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
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
    toast.success(`Marked as ${STATUS_META[status]?.label ?? status}`);
  };

  const deleteEnquiry = async (id) => {
    setDeleting(id);
    await supabase.from("enquiries").delete().eq("id", id);
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleting(null);
    toast.success("Enquiry deleted");
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

  // ==================== FULL-PAGE DETAIL VIEW ====================
  if (selected) {
    const name = selected.name || selected.contact_person || "—";
    const gradient = TYPE_META[selected.type]?.gradient || "from-ink to-[#2a2a2a]";
    return (
      <AdminGuard>
        <AdminLayout title="Enquiries">
          <button
            onClick={() => setSelected(null)}
            className="mb-4 flex items-center gap-1.5 text-[13px] font-semibold text-body hover:text-ink"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to Enquiries
          </button>

          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            <div className={`relative overflow-hidden bg-gradient-to-br p-6 text-white sm:p-8 ${gradient}`}>
              <span className="glow-blob -right-10 -top-16 h-48 w-48 bg-white/15" />
              <span className="glow-blob -bottom-16 left-1/3 h-40 w-40 bg-white/10" />
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
              >
                <XIcon className="h-4 w-4" />
              </button>
              <div className="relative flex flex-wrap items-center gap-4">
                <span className="grid h-16 w-16 flex-none place-items-center rounded-full bg-white/15 text-[22px] font-extrabold ring-2 ring-white/30">
                  {name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="truncate text-[20px] font-extrabold">{name}</p>
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                      {TYPE_META[selected.type]?.label ?? selected.type}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-white/70">Submitted {fmt(selected.created_at)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_300px]">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {detailFields.map((f) => (
                  <div key={f.label} className="border-l-2 border-line pl-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-body">{f.label}</div>
                    <div className="whitespace-pre-wrap text-[14px] font-medium text-ink">{f.value}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-5 lg:border-l lg:border-line lg:pl-6">
                <div>
                  <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-body">Status</label>
                  <select
                    value={selected.status || "new"}
                    onChange={(e) => updateStatus(selected.id, e.target.value)}
                    className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-ink"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  {selected.email && (
                    <a
                      href={`mailto:${selected.email}`}
                      className="flex items-center justify-center gap-1.5 rounded-md bg-ink py-2.5 text-center text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
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
                      className="flex items-center justify-center gap-1.5 rounded-md bg-[#25D366] py-2.5 text-center text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      WhatsApp
                    </a>
                  )}
                  <button
                    onClick={() => deleteEnquiry(selected.id)}
                    disabled={deleting === selected.id}
                    className="flex items-center justify-center gap-1.5 rounded-md border border-line py-2.5 text-[13px] font-semibold text-red-500 transition-colors hover:border-red-200 hover:bg-red-50"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    {deleting === selected.id ? "Deleting…" : "Delete Enquiry"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  // ==================== LIST VIEW ====================
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
            className="flex items-center gap-2 whitespace-nowrap rounded-md bg-ink px-4 py-2.5 text-[13.5px] font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <DownloadIcon className="h-4 w-4" />
            Export CSV
          </button>
          {newCount > 0 && (
            <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-blue-50 px-3.5 py-2 text-[13px] font-bold text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              {newCount} unread
            </div>
          )}
        </div>

        <div>
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
                    {filtered.map((e) => {
                      const name = e.name || e.contact_person || "—";
                      return (
                      <tr
                        key={e.id}
                        onClick={() => openEnquiry(e)}
                        className={`group relative cursor-pointer border-t border-line transition-colors hover:bg-cream/40 ${
                          selected?.id === e.id ? "bg-cream/60" : !e.read ? "bg-yellow/5" : "bg-white"
                        }`}
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          <TypeBadge type={e.type} />
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 text-ink ${e.read ? "font-medium" : "font-bold"}`}>
                          <div className="flex items-center gap-2.5">
                            <span className="relative flex-none">
                              <span className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br text-[11px] font-extrabold text-white shadow-sm transition-transform duration-200 group-hover:scale-105 ${avatarGradient(name)}`}>
                                {name.charAt(0).toUpperCase()}
                              </span>
                              {!e.read && (
                                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-yellow" />
                              )}
                            </span>
                            {name}
                          </div>
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
