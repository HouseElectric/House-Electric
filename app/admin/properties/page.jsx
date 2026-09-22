"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { avatarGradient } from "@/components/admin/CustomerPicker";
import {
  AmcBadge,
  BuildingIcon,
  ClockIcon,
  EyeIcon,
  HomeIcon,
  SearchIcon,
  XIcon,
} from "@/components/icons";

export default function AdminPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [amcFilter, setAmcFilter] = useState("all"); // all | active | none

  useEffect(() => {
    (async () => {
      const [{ data: props }, { data: subs }] = await Promise.all([
        supabase.from("properties").select("*").order("created_at", { ascending: false }),
        supabase
          .from("amc_subscriptions")
          .select("property_id, plan_name_snapshot, amc_number, status, expiry_date")
          .not("property_id", "is", null)
          .order("expiry_date", { ascending: false }),
      ]);

      const customerIds = Array.from(new Set((props ?? []).map((p) => p.customer_id).filter(Boolean)));
      const { data: profiles } =
        customerIds.length > 0
          ? await supabase.from("profiles").select("id, name, email, mobile").in("id", customerIds)
          : { data: [] };
      const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

      const amcByProperty = new Map();
      (subs ?? []).forEach((s) => {
        if (!amcByProperty.has(s.property_id)) amcByProperty.set(s.property_id, s);
      });

      const merged = (props ?? []).map((p) => ({
        ...p,
        profiles: profileById.get(p.customer_id) || null,
        amc: amcByProperty.get(p.id) || null,
      }));
      setProperties(merged);
      setLoading(false);
    })();
  }, []);

  const filtered = properties.filter((p) => {
    const matchesSearch =
      !search ||
      [p.label, p.address, p.city, p.state, p.profiles?.name, p.profiles?.email, p.profiles?.mobile].some((v) =>
        v?.toLowerCase().includes(search.toLowerCase())
      );
    const matchesAmc = amcFilter === "all" || (amcFilter === "active" ? p.amc?.status === "active" : !p.amc || p.amc.status !== "active");
    return matchesSearch && matchesAmc;
  });

  const stats = useMemo(() => {
    const total = properties.length;
    const withActiveAmc = properties.filter((p) => p.amc?.status === "active").length;
    const residential = properties.filter((p) => (p.property_type || "").toLowerCase().includes("resid") || !p.property_type).length;
    return { total, withActiveAmc, withoutAmc: total - withActiveAmc, residential };
  }, [properties]);

  const SUMMARY_CARDS = [
    { label: "Total Properties", value: stats.total, icon: BuildingIcon, cls: "bg-ink text-yellow" },
    { label: "Covered by Active AMC", value: stats.withActiveAmc, icon: AmcBadge, cls: "bg-emerald-50 text-emerald-600" },
    { label: "No Active AMC", value: stats.withoutAmc, icon: ClockIcon, cls: "bg-amber-50 text-amber-600" },
    { label: "Residential", value: stats.residential, icon: HomeIcon, cls: "bg-blue-50 text-blue-600" },
  ];

  // ==================== LIST VIEW ====================
  return (
    <AdminGuard>
      <AdminLayout title="Properties">
        <p className="mb-5 max-w-[65ch] text-[13.5px] text-body">
          Every property registered by customers, with its AMC coverage and service history — across all
          customer accounts, in one browsable list.
        </p>

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
              <div className="mt-0.5 text-[16px] font-extrabold tabular-nums text-ink sm:text-[22px]">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search property, address, owner…"
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
          <div className="flex w-fit gap-1 rounded-xl border border-line bg-white p-1">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active AMC" },
              { key: "none", label: "No AMC" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setAmcFilter(f.key)}
                className={`rounded-lg px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
                  amcFilter === f.key ? "bg-ink text-white shadow-sm" : "text-body hover:bg-cream"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_0_rgba(20,20,20,0.02)]">
            <div className="flex items-center justify-between border-b border-line bg-cream/40 px-5 py-3">
              <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-body">
                <BuildingIcon className="h-3.5 w-3.5 text-yellow-dark" />
                {filtered.length} Propert{filtered.length === 1 ? "y" : "ies"}
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-[13.5px] text-body">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-body">
                <BuildingIcon className="h-6 w-6 text-body/40" />
                {properties.length === 0 ? "No properties added by customers yet." : `No properties match "${search}".`}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13.5px]">
                  <thead>
                    <tr className="border-b border-line bg-cream/40">
                      {["Property", "Owner", "Location", "AMC", ""].map((h) => (
                        <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => {
                      const owner = p.profiles?.name || p.profiles?.email || "—";
                      return (
                        <tr
                          key={p.id}
                          onClick={() => router.push(`/admin/properties/${p.id}`)}
                          className="group cursor-pointer border-t border-line transition-colors hover:bg-cream/30"
                        >
                          <td className="px-4 py-3">
                            <div className="font-bold text-ink">{p.label}</div>
                            {p.property_type && <div className="text-[11.5px] text-body">{p.property_type}</div>}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`grid h-7 w-7 flex-none place-items-center rounded-full bg-gradient-to-br text-[10.5px] font-extrabold text-white shadow-sm ${avatarGradient(owner)}`}
                              >
                                {owner.charAt(0).toUpperCase()}
                              </span>
                              <span className="text-ink">{owner}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-body">
                            {[p.city, p.state].filter(Boolean).join(", ") || "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {p.amc?.status === "active" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : p.amc ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                {p.amc.status === "expired" ? "Expired" : "Cancelled"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                No AMC
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <Link
                              href={`/admin/properties/${p.id}`}
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
