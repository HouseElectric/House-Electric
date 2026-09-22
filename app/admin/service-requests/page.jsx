"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { STATUS_META, STATUS_OPTIONS } from "@/lib/serviceRequestMeta";
import CustomerPicker from "@/components/admin/CustomerPicker";
import {
  ArrowRightIcon,
  CheckCircle,
  ClockIcon,
  InboxIcon,
  PinIcon,
  PlusIcon,
  SlidersIcon,
  SparklesIcon,
  UserIcon,
  WrenchIcon,
  XIcon,
} from "@/components/icons";

function CountUp({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (typeof value !== "number") return;
    let frame;
    const duration = 700;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return typeof value === "number" ? display : value;
}

function StatCard({ label, value, icon: Icon, cls, glow, accent, delay = 0 }) {
  return (
    <div
      style={{ animationDelay: `${delay}s` }}
      className="card-hover group relative isolate overflow-hidden rounded-2xl border border-line bg-white p-4 opacity-0 animate-fade-up"
    >
      <span className={`absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r ${accent} transition-transform duration-300 ease-out group-hover:scale-x-100`} />
      <span className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${glow}`} />
      <div className="relative flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <p className="text-[11.5px] font-semibold text-body">{label}</p>
          <b className="mt-1 block text-[17px] font-black leading-none tabular-nums text-ink sm:text-[24px]">
            <CountUp value={value} />
          </b>
        </div>
        <span className={`grid h-9 w-9 flex-none place-items-center rounded-xl shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${cls}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

const DEFAULT_SERVICE_TYPE_OPTIONS = ["Power Failure", "MCB Tripping", "Switch Problem", "Socket Problem", "Lighting", "Fan", "DB", "Wiring", "Earthing", "Other"];

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

export default function AdminServiceRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [creating, setCreating] = useState(null);
  const [savingNew, setSavingNew] = useState(false);
  const [serviceCategories, setServiceCategories] = useState(DEFAULT_SERVICE_TYPE_OPTIONS);
  const [editingCategories, setEditingCategories] = useState(null);
  const [categoryInput, setCategoryInput] = useState("");
  const [savingCategories, setSavingCategories] = useState(false);

  const fetchCategories = async () => {
    const { data } = await supabase.from("site_settings").select("data").eq("key", "service_categories").maybeSingle();
    if (data?.data?.categories?.length > 0) setServiceCategories(data.data.categories);
  };

  const saveCategories = async () => {
    setSavingCategories(true);
    const categories = editingCategories.map((s) => s.trim()).filter(Boolean);
    await supabase.from("site_settings").upsert([{ key: "service_categories", data: { categories }, updated_at: new Date().toISOString() }]);
    setServiceCategories(categories);
    setSavingCategories(false);
    setEditingCategories(null);
    toast.success("Service categories updated");
  };

  const addCategory = () => {
    const value = categoryInput.trim();
    if (!value) return;
    if (editingCategories.some((c) => c.toLowerCase() === value.toLowerCase())) {
      toast.error("That category already exists.");
      return;
    }
    setEditingCategories((c) => [...c, value]);
    setCategoryInput("");
  };

  const removeCategory = (index) => {
    setEditingCategories((c) => c.filter((_, i) => i !== index));
  };

  useEffect(() => {
    (async () => {
      const { data: custs } = await supabase.from("profiles").select("id, name, email, mobile, avatar_url").eq("is_admin", false);
      setCustomers(custs ?? []);
      fetchCategories();
    })();
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("service_requests").select("*, profiles(name, email, mobile)").order("created_at", { ascending: false });
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    const { data } = await q;
    setRequests(data ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const openCreate = () =>
    setCreating({ customer_id: "", service_type: "", description: "", location: "", preferred_date: "", preferred_time: "", channel: "phone" });

  const createRequest = async (e) => {
    e.preventDefault();
    if (!creating.customer_id || !creating.service_type) {
      toast.error("Please select a customer and service type.");
      return;
    }
    setSavingNew(true);
    const { data: created, error } = await supabase
      .from("service_requests")
      .insert([
        {
          customer_id: creating.customer_id,
          service_type: creating.service_type,
          description: creating.description || null,
          location: creating.location || null,
          preferred_date: creating.preferred_date || null,
          preferred_time: creating.preferred_time || null,
          admin_notes: `Raised by admin on customer's behalf (${creating.channel === "phone" ? "phone call" : "WhatsApp"}).`,
          status: "requested",
        },
      ])
      .select()
      .single();

    if (error || !created) {
      toast.error("Failed to create request.");
      setSavingNew(false);
      return;
    }

    await supabase.from("notifications").insert([
      { customer_id: creating.customer_id, title: "Service request received", message: `Your request ${created.ticket_number} has been received.` },
    ]);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    fetch("/api/service-requests/notify-status", {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ requestId: created.id }),
    }).catch((err) => console.error("Status email trigger failed:", err));

    setSavingNew(false);
    setCreating(null);
    toast.success(`Request ${created.ticket_number} created`);
    fetchRequests();
  };

  // ==================== LIST VIEW ====================
  const pendingCount = requests.filter((r) => ["requested", "under_review"].includes(r.status)).length;
  const activeCount = requests.filter((r) =>
    ["assigned", "scheduled", "on_the_way", "in_progress", "material_required", "customer_approval_pending"].includes(r.status)
  ).length;
  const doneCount = requests.filter((r) => ["completed", "confirmed", "closed"].includes(r.status)).length;

  return (
    <AdminGuard>
      <AdminLayout title="Service Requests">
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-ink px-6 py-7 sm:px-8 sm:py-8">
          <span className="glow-blob -right-14 -top-20 h-56 w-56 bg-yellow/25" />
          <span className="glow-blob -bottom-24 -left-10 h-48 w-48 bg-yellow/10" style={{ animationDelay: "2.2s" }} />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow/30 bg-yellow/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-yellow">
              <SparklesIcon className="h-3 w-3" /> Operations
            </span>
            <h2 className="mt-3 text-[21px] font-extrabold text-white sm:text-[25px]">Service Requests</h2>
            <p className="mt-1.5 max-w-[56ch] text-[13.5px] text-white/55">
              Track, assign and resolve every electrical service ticket raised by customers.
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total Requests"
            value={requests.length}
            icon={InboxIcon}
            cls="bg-ink text-yellow"
            glow="bg-yellow"
            accent="from-yellow to-amber-500"
            delay={0}
          />
          <StatCard
            label="Pending"
            value={pendingCount}
            icon={ClockIcon}
            cls="bg-blue-50 text-blue-600"
            glow="bg-blue-400"
            accent="from-blue-400 to-indigo-500"
            delay={0.06}
          />
          <StatCard
            label="In Progress"
            value={activeCount}
            icon={WrenchIcon}
            cls="bg-amber-50 text-amber-600"
            glow="bg-amber-400"
            accent="from-amber-400 to-orange-500"
            delay={0.12}
          />
          <StatCard
            label="Completed"
            value={doneCount}
            icon={CheckCircle}
            cls="bg-emerald-50 text-emerald-600"
            glow="bg-emerald-400"
            accent="from-emerald-400 to-teal-500"
            delay={0.18}
          />
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-line px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-ink"
          >
            <option value="all">All Status ({requests.length})</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditingCategories([...serviceCategories]);
              setCategoryInput("");
            }}
            className="flex items-center gap-1.5 rounded-md border border-line px-4 py-2.5 text-[13.5px] font-bold text-ink transition-all hover:border-ink/40"
          >
            <SlidersIcon className="h-4 w-4" />
            Manage Categories
          </button>
          <button
            onClick={openCreate}
            className="ml-auto flex items-center gap-1.5 rounded-md bg-yellow px-4 py-2.5 text-[13.5px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md"
          >
            <PlusIcon className="h-4 w-4" />
            New Request (Phone / WhatsApp)
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="border-b border-line bg-cream/40 px-5 py-3">
            <span className="text-[12px] font-bold uppercase tracking-wide text-body">
              {requests.length} Service Request{requests.length === 1 ? "" : "s"}
            </span>
          </div>
          {loading ? (
            <div className="p-12 text-center text-[13.5px] text-body">Loading…</div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-body">
              <InboxIcon className="h-6 w-6 text-body/40" />
              No service requests yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13.5px]">
                <thead>
                  <tr className="border-b border-line bg-cream/40">
                    {["Ticket", "Customer", "Service", "Status", "Date", ""].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => {
                    const meta = STATUS_META[r.status] ?? STATUS_META.requested;
                    const name = r.profiles?.name || r.profiles?.email || "—";
                    return (
                      <tr
                        key={r.id}
                        onClick={() => router.push(`/admin/service-requests/${r.id}`)}
                        className="group cursor-pointer border-t border-line transition-colors hover:bg-cream/40"
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-ink">{r.ticket_number}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-ink">
                          <div className="flex items-center gap-2.5">
                            <span className={`grid h-7 w-7 flex-none place-items-center rounded-full bg-gradient-to-br text-[11px] font-extrabold text-white shadow-sm transition-transform duration-200 group-hover:scale-105 ${avatarGradient(name)}`}>
                              {name.charAt(0).toUpperCase()}
                            </span>
                            {name}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-body">{r.service_type}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.cls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[12px] text-body">
                          {new Date(r.created_at).toLocaleDateString("en-GB")}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="flex items-center gap-1 text-[12px] font-bold text-ink">
                            Manage
                            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {creating && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4" onClick={() => setCreating(null)}>
            <form
              onSubmit={createRequest}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
            >
              <div className="max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-line bg-cream/40 px-5 py-4">
                <p className="text-[14px] font-extrabold text-ink">Raise Request on Customer's Behalf</p>
                <button type="button" onClick={() => setCreating(null)} className="text-body hover:text-ink">
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex gap-2">
                  {["phone", "whatsapp"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCreating((f) => ({ ...f, channel: c }))}
                      className={`flex-1 rounded-md border px-3 py-2 text-[12.5px] font-bold capitalize transition-colors ${
                        creating.channel === c ? "border-ink bg-ink text-white" : "border-line text-body hover:border-ink/40"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                    <UserIcon className="h-3.5 w-3.5 text-body/60" />
                    Customer *
                  </label>
                  <CustomerPicker
                    customers={customers}
                    value={creating.customer_id}
                    onChange={(id) => setCreating((f) => ({ ...f, customer_id: id }))}
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                    <WrenchIcon className="h-3.5 w-3.5 text-body/60" />
                    Problem Category *
                  </label>
                  <select
                    required
                    value={creating.service_type}
                    onChange={(e) => setCreating((f) => ({ ...f, service_type: e.target.value }))}
                    className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {serviceCategories.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-body">Description</label>
                  <textarea
                    rows={2}
                    value={creating.description}
                    onChange={(e) => setCreating((f) => ({ ...f, description: e.target.value }))}
                    className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-body">
                    <PinIcon className="h-3.5 w-3.5 text-body/60" />
                    Location
                  </label>
                  <input
                    value={creating.location}
                    onChange={(e) => setCreating((f) => ({ ...f, location: e.target.value }))}
                    className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-body">Preferred Date</label>
                    <input
                      type="date"
                      value={creating.preferred_date}
                      onChange={(e) => setCreating((f) => ({ ...f, preferred_date: e.target.value }))}
                      className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-body">Preferred Time</label>
                    <input
                      type="time"
                      value={creating.preferred_time}
                      onChange={(e) => setCreating((f) => ({ ...f, preferred_time: e.target.value }))}
                      className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingNew}
                  className="w-full rounded-md bg-yellow py-3 text-[13.5px] font-extrabold text-ink transition-all hover:bg-yellow-dark disabled:opacity-60"
                >
                  {savingNew ? "Creating…" : "Create Request"}
                </button>
              </div>
              </div>
            </form>
          </div>
        )}

        {editingCategories !== null && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4" onClick={() => setEditingCategories(null)}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-line bg-cream/40 px-5 py-4">
                <div>
                  <p className="text-[14px] font-extrabold text-ink">Manage Service Categories</p>
                  <p className="mt-0.5 text-[11.5px] text-body">Shown to customers raising a request, and to admin creating one on their behalf.</p>
                </div>
                <button
                  onClick={() => setEditingCategories(null)}
                  className="grid h-8 w-8 flex-none place-items-center rounded-full text-body/60 transition-colors hover:bg-cream hover:text-ink"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex min-h-[52px] flex-wrap gap-2 rounded-xl border border-line bg-cream/30 p-3">
                  {editingCategories.length === 0 ? (
                    <p className="text-[12.5px] text-body/60">No categories yet — add one below.</p>
                  ) : (
                    editingCategories.map((c, i) => (
                      <span
                        key={c + i}
                        className="group flex items-center gap-1.5 rounded-full border border-line bg-white py-1.5 pl-3.5 pr-2 text-[12.5px] font-bold text-ink shadow-2xs"
                      >
                        {c}
                        <button
                          type="button"
                          onClick={() => removeCategory(i)}
                          aria-label={`Remove ${c}`}
                          className="grid h-4.5 w-4.5 flex-none place-items-center rounded-full text-body/50 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCategory();
                      }
                    }}
                    placeholder="e.g. Inverter Issue"
                    className="w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] outline-none focus:border-ink"
                  />
                  <button
                    type="button"
                    onClick={addCategory}
                    disabled={!categoryInput.trim()}
                    className="flex flex-none items-center gap-1.5 rounded-md border border-line px-4 py-2.5 text-[13px] font-bold text-ink transition-colors hover:border-ink/40 disabled:opacity-40"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>

                <button
                  onClick={saveCategories}
                  disabled={savingCategories}
                  className="w-full rounded-md bg-yellow py-3 text-[13.5px] font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-60"
                >
                  {savingCategories ? "Saving…" : "Save Categories"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
