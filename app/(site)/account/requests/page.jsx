"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import Reveal from "@/components/Reveal";
import { STATUS_META } from "@/lib/serviceRequestMeta";
import { InboxIcon, PlusIcon, WrenchIcon, CalendarIcon, PinIcon, ChevronRightIcon } from "@/components/icons";

export default function MyRequestsPage() {
  const { user } = useCustomerAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("service_requests")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      setRequests(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  const filteredRequests = requests.filter((r) => {
    if (filter === "active") return !["completed", "cancelled"].includes(r.status);
    if (filter === "completed") return r.status === "completed";
    return true;
  });

  const counts = {
    all: requests.length,
    active: requests.filter((r) => !["completed", "cancelled"].includes(r.status)).length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-ink">My Service Requests</h2>
          <p className="text-xs text-body">Track status, scheduled visits, and technician dispatches</p>
        </div>
        <Link
          href="/account/requests/new"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow px-5 py-3 text-xs font-black text-ink shadow-md transition-all hover:bg-yellow-dark hover:scale-[1.02]"
        >
          <PlusIcon className="h-4 w-4" />
          Raise New Request
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="-mx-4 flex items-center gap-2 overflow-x-auto border-b border-line px-4 pb-3 scrollbar-none">
        {[
          { key: "all", label: "All Requests" },
          { key: "active", label: "Active Tickets" },
          { key: "completed", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex flex-none items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
              filter === tab.key
                ? "bg-ink text-white shadow-sm"
                : "bg-white text-body hover:bg-slate-100 hover:text-ink border border-line"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                filter === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-muted"
              }`}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body">
          Loading service requests…
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-line/80 bg-white p-12 text-center shadow-xs">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-muted">
            <InboxIcon className="h-7 w-7" />
          </span>
          <div className="space-y-1">
            <p className="text-base font-extrabold text-ink">No Service Tickets Found</p>
            <p className="text-xs text-body">
              {filter === "all" ? "You haven't requested any electrical services yet." : `No ${filter} requests.`}
            </p>
          </div>
          <Link
            href="/account/requests/new"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-yellow px-5 py-2.5 text-xs font-black text-ink shadow-sm hover:bg-yellow-dark"
          >
            <PlusIcon className="h-4 w-4" />
            Book Service Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((r, i) => {
            const meta = STATUS_META[r.status] ?? STATUS_META.requested;

            return (
              <Reveal key={r.id} delay={Math.min(i, 4) * 0.06} y={12}>
                <Link
                  href={`/account/requests/${r.id}`}
                  className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-line/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-line hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className={`absolute inset-y-0 left-0 w-1.5 ${meta.dot}`} />

                  <div className="flex min-w-0 items-center gap-3.5">
                    <span className={`grid h-12 w-12 flex-none place-items-center rounded-2xl font-bold shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-105 ${meta.iconCls}`}>
                      <WrenchIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <b className="truncate text-[15px] font-extrabold text-ink">{r.service_type}</b>
                        <span className="inline-flex flex-none items-center whitespace-nowrap rounded-lg border border-slate-200 bg-slate-100/90 px-2 py-0.5 font-mono text-[10.5px] font-extrabold tracking-wide text-slate-600 shadow-2xs">
                          {r.ticket_number}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-medium text-slate-500">
                        <span className="flex flex-none items-center gap-1.5 whitespace-nowrap">
                          <CalendarIcon className="h-3.5 w-3.5 flex-none text-slate-400" />
                          {new Date(r.created_at || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        {r.location && (
                          <span className="flex max-w-[160px] items-center gap-1 truncate">
                            <PinIcon className="h-3.5 w-3.5 flex-none text-rose-500" />
                            <span className="truncate">{r.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-none items-center justify-between gap-3 sm:justify-end">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-extrabold shadow-2xs ${meta.cls}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                    <span className="hidden items-center gap-1 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-black text-ink shadow-2xs transition-all group-hover:border-ink group-hover:bg-ink group-hover:text-white sm:flex">
                      View Details
                      <ChevronRightIcon className="h-3.5 w-3.5" />
                    </span>
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-xl border border-line bg-white text-slate-400 shadow-2xs transition-all group-hover:border-ink group-hover:bg-ink group-hover:text-white sm:hidden">
                      <ChevronRightIcon className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
