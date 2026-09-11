"use client";

import { useEffect, useMemo, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { avatarGradient } from "@/components/admin/CustomerPicker";
import {
  UsersIcon,
  SearchIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  ClockIcon,
  XIcon,
  EyeIcon,
  BuildingIcon,
  ClipboardIcon,
  LightbulbIcon,
} from "@/components/icons";

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function DetailRow({ icon: Icon, label, value, href }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-lg bg-cream text-ink">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-body">{label}</p>
        {value ? (
          href ? (
            <a href={href} className="text-[13px] font-semibold text-ink hover:underline break-words">
              {value}
            </a>
          ) : (
            <p className="text-[13px] font-semibold text-ink break-words">{value}</p>
          )
        ) : (
          <p className="text-[13px] text-body/50">—</p>
        )}
      </div>
    </div>
  );
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_admin", false)
        .order("created_at", { ascending: false });
      setCustomers(data ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = customers.filter(
    (c) => !search || [c.name, c.email, c.mobile].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = useMemo(() => {
    const now = new Date();
    const newThisMonth = customers.filter((c) => {
      const d = new Date(c.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const withMobile = customers.filter((c) => c.mobile).length;
    const withAddress = customers.filter((c) => c.address).length;
    return { total: customers.length, newThisMonth, withMobile, withAddress };
  }, [customers]);

  const SUMMARY_CARDS = [
    { label: "Total Customers", value: stats.total, icon: UsersIcon, cls: "bg-ink text-yellow" },
    { label: "New This Month", value: stats.newThisMonth, icon: ClockIcon, cls: "bg-emerald-50 text-emerald-600" },
    { label: "Mobile on File", value: stats.withMobile, icon: PhoneIcon, cls: "bg-blue-50 text-blue-600" },
    { label: "Address on File", value: stats.withAddress, icon: PinIcon, cls: "bg-amber-50 text-amber-600" },
  ];

  return (
    <AdminGuard>
      <AdminLayout title="Customers">
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SUMMARY_CARDS.map((c, i) => (
            <div
              key={c.label}
              style={{ animationDelay: `${i * 0.06}s` }}
              className="card-hover rounded-2xl border border-line bg-white p-4 opacity-0 animate-fade-up"
            >
              <div className={`mb-2.5 grid h-9 w-9 place-items-center rounded-lg ${c.cls}`}>
                <c.icon className="h-4 w-4" />
              </div>
              <div className="text-[11.5px] font-semibold text-body">{c.label}</div>
              <div className="mt-0.5 text-[22px] font-extrabold tabular-nums text-ink">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="mb-5 relative max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, mobile…"
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-9 text-[13.5px] outline-none transition-colors focus:border-ink"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-body/50 transition-colors hover:bg-cream hover:text-ink"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className={`grid grid-cols-1 gap-5 ${selected ? "lg:grid-cols-[1fr_360px]" : ""}`}>
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_0_rgba(20,20,20,0.02)]">
            <div className="flex items-center justify-between border-b border-line bg-cream/40 px-5 py-3">
              <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-body">
                <UsersIcon className="h-3.5 w-3.5 text-yellow-dark" />
                {filtered.length} Customer{filtered.length === 1 ? "" : "s"}
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-[13.5px] text-body">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-body">
                <UsersIcon className="h-6 w-6 text-body/40" />
                {customers.length === 0 ? "No customers registered yet." : `No customers match "${search}".`}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13.5px]">
                  <thead>
                    <tr className="border-b border-line bg-cream/40">
                      {["Name", "Email", "Mobile", "Joined", ""].map((h) => (
                        <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => {
                      const name = c.name || c.email || "—";
                      return (
                        <tr
                          key={c.id}
                          onClick={() => setSelected(c)}
                          className={`group cursor-pointer border-t border-line transition-colors hover:bg-cream/30 ${selected?.id === c.id ? "bg-cream/60" : ""}`}
                        >
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              {c.avatar_url ? (
                                <img
                                  src={c.avatar_url}
                                  alt={name}
                                  className="h-8 w-8 flex-none rounded-full border border-line object-cover transition-transform duration-200 group-hover:scale-110"
                                />
                              ) : (
                                <span
                                  className={`grid h-8 w-8 flex-none place-items-center rounded-full bg-gradient-to-br text-[11px] font-extrabold text-white shadow-sm transition-transform duration-200 group-hover:scale-110 ${avatarGradient(name)}`}
                                >
                                  {name.charAt(0).toUpperCase()}
                                </span>
                              )}
                              <span className="font-bold text-ink">{c.name || "—"}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {c.email ? (
                              <a
                                href={`mailto:${c.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 text-body transition-colors hover:text-ink hover:underline"
                              >
                                <MailIcon className="h-3.5 w-3.5 flex-none text-body/40" />
                                {c.email}
                              </a>
                            ) : (
                              <span className="text-body">—</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {c.mobile ? (
                              <a
                                href={`tel:${c.mobile}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 text-body transition-colors hover:text-ink hover:underline"
                              >
                                <PhoneIcon className="h-3.5 w-3.5 flex-none text-body/40" />
                                {c.mobile}
                              </a>
                            ) : (
                              <span className="text-body">—</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-[12px] text-body">{fmtDate(c.created_at)}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelected(c);
                              }}
                              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] font-bold text-ink transition-colors hover:border-ink/40 hover:bg-cream"
                            >
                              <EyeIcon className="h-3.5 w-3.5" />
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selected && (
            <>
              <div className="fixed inset-0 z-[190] bg-black/50 lg:hidden" onClick={() => setSelected(null)} />
              <div className="fixed inset-x-4 top-1/2 z-[200] max-h-[85vh] -translate-y-1/2 overflow-y-auto rounded-2xl border border-line bg-white shadow-2xl lg:sticky lg:inset-x-auto lg:top-[76px] lg:z-auto lg:h-fit lg:max-h-none lg:translate-y-0 lg:overflow-visible lg:shadow-none">
              <div className="relative overflow-hidden bg-gradient-to-br from-ink to-[#2a2a2a] p-5 text-white">
                <span className="glow-blob -right-8 -top-10 h-32 w-32 bg-yellow/20" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selected.avatar_url ? (
                      <img src={selected.avatar_url} alt="" className="h-12 w-12 flex-none rounded-full border border-white/20 object-cover" />
                    ) : (
                      <span
                        className={`grid h-12 w-12 flex-none place-items-center rounded-full bg-gradient-to-br text-[15px] font-extrabold text-white ring-2 ring-white/20 ${avatarGradient(
                          selected.name || selected.email || "—"
                        )}`}
                      >
                        {(selected.name || selected.email || "—").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-extrabold">{selected.name || "Unnamed"}</p>
                      <p className="text-[11.5px] text-white/50">Joined {fmtDate(selected.created_at)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    aria-label="Close"
                    className="grid h-8 w-8 flex-none place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <DetailRow icon={MailIcon} label="Email" value={selected.email} href={selected.email ? `mailto:${selected.email}` : null} />
                <DetailRow icon={PhoneIcon} label="Mobile" value={selected.mobile} href={selected.mobile ? `tel:${selected.mobile}` : null} />
                <DetailRow icon={PinIcon} label="Address" value={selected.address} />
                <DetailRow icon={BuildingIcon} label="City / State" value={[selected.city, selected.state].filter(Boolean).join(", ") || null} />
                <DetailRow icon={ClipboardIcon} label="Property Type / Size" value={[selected.property_type, selected.property_size].filter(Boolean).join(" · ") || null} />
                <DetailRow icon={LightbulbIcon} label="Electrical Setup Notes" value={selected.electrical_setup_notes} />
              </div>
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
