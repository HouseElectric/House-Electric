"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  SparklesIcon,
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

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_admin", false)
        .eq("is_technician", false)
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
    { label: "Total Customers", value: stats.total, icon: UsersIcon, cls: "bg-ink text-yellow", glow: "bg-yellow", accent: "from-yellow to-amber-500" },
    { label: "New This Month", value: stats.newThisMonth, icon: ClockIcon, cls: "bg-emerald-50 text-emerald-600", glow: "bg-emerald-400", accent: "from-emerald-400 to-teal-500" },
    { label: "Mobile on File", value: stats.withMobile, icon: PhoneIcon, cls: "bg-blue-50 text-blue-600", glow: "bg-blue-400", accent: "from-blue-400 to-indigo-500" },
    { label: "Address on File", value: stats.withAddress, icon: PinIcon, cls: "bg-amber-50 text-amber-600", glow: "bg-amber-400", accent: "from-amber-400 to-orange-500" },
  ];

  return (
    <AdminGuard>
      <AdminLayout title="Customers">
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-ink px-6 py-7 sm:px-8 sm:py-8">
          <span className="glow-blob -right-14 -top-20 h-56 w-56 bg-yellow/25" />
          <span className="glow-blob -bottom-24 -left-10 h-48 w-48 bg-yellow/10" style={{ animationDelay: "2.2s" }} />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow/30 bg-yellow/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-yellow">
              <SparklesIcon className="h-3 w-3" /> Customers
            </span>
            <h2 className="mt-3 text-[21px] font-extrabold text-white sm:text-[25px]">Customers</h2>
            <p className="mt-1.5 max-w-[56ch] text-[13.5px] text-white/55">Every registered customer, their properties, requests and payment history.</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SUMMARY_CARDS.map((c, i) => (
            <div
              key={c.label}
              style={{ animationDelay: `${i * 0.06}s` }}
              className="card-hover group relative isolate overflow-hidden rounded-2xl border border-line bg-white p-4 opacity-0 animate-fade-up"
            >
              <span className={`absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r ${c.accent} transition-transform duration-300 ease-out group-hover:scale-x-100`} />
              <span className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${c.glow}`} />
              <div className="relative flex items-start justify-between gap-2.5">
                <div className="min-w-0">
                  <p className="text-[11.5px] font-semibold text-body">{c.label}</p>
                  <b className="mt-1 block text-[17px] font-black leading-none tabular-nums text-ink sm:text-[24px]">
                    <CountUp value={c.value} />
                  </b>
                </div>
                <span className={`grid h-9 w-9 flex-none place-items-center rounded-xl shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${c.cls}`}>
                  <c.icon className="h-4 w-4" />
                </span>
              </div>
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

        <div>
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
                          onClick={() => router.push(`/admin/customers/${c.id}`)}
                          className="group cursor-pointer border-t border-line transition-colors hover:bg-cream/30"
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
                            <Link
                              href={`/admin/customers/${c.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] font-bold text-ink transition-colors hover:border-ink/40 hover:bg-cream"
                            >
                              <EyeIcon className="h-3.5 w-3.5" />
                              Details
                            </Link>
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
