"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import Reveal from "@/components/Reveal";
import { STATUS_META } from "@/lib/serviceRequestMeta";
import {
  InboxIcon,
  PlusIcon,
  WrenchIcon,
  CalendarIcon,
  PinIcon,
  ChevronRightIcon,
  ClockIcon,
  SparklesIcon,
  UsersIcon,
} from "@/components/icons";

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

  const DONE_STATUSES = ["completed", "confirmed", "closed", "cancelled"];
  const filteredRequests = requests.filter((r) => {
    if (filter === "active") return !DONE_STATUSES.includes(r.status);
    if (filter === "completed") return ["completed", "confirmed", "closed"].includes(r.status);
    return true;
  });

  const counts = {
    all: requests.length,
    active: requests.filter((r) => !DONE_STATUSES.includes(r.status)).length,
    completed: requests.filter((r) => ["completed", "confirmed", "closed"].includes(r.status)).length,
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Header Bar */}
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-ink">My Service Requests</h2>
            {!loading && counts.active > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-extrabold text-yellow-dark shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  {counts.active} Active {counts.active === 1 ? "Ticket" : "Tickets"}
                </span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-[13px] text-body mt-0.5">
            Track status, scheduled visits, and technician dispatches
          </p>
        </div>
        <Link
          href="/account/requests/new"
          className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-yellow px-5 py-3 text-xs font-black text-ink shadow-sm transition-all hover:bg-yellow-dark hover:shadow-md active:scale-[0.99]"
        >
          <PlusIcon className="h-4 w-4 transition-transform group-hover:rotate-90" />
          <span>Raise New Request</span>
        </Link>
      </div>

      {/* Modern Status Filter Pills */}
      <div className="flex items-center overflow-x-auto pb-1 scrollbar-none">
        <div className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 p-1.5">
          {[
            { key: "all", label: "All Requests" },
            { key: "active", label: "Active Tickets" },
            { key: "completed", label: "Completed" },
          ].map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-black transition-all ${
                  active
                    ? "bg-ink text-white shadow-xs"
                    : "text-slate-600 hover:text-ink hover:bg-white/70"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10.5px] font-black ${
                    active ? "bg-white/20 text-white" : "bg-slate-200/90 text-slate-700"
                  }`}
                >
                  {counts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body shadow-2xs">
          Loading service requests…
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-line/80 bg-white p-10 sm:p-14 text-center shadow-xs">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-amber-50 text-yellow-dark shadow-2xs">
            <InboxIcon className="h-8 w-8" />
          </span>
          <div className="space-y-1.5">
            <p className="text-base sm:text-lg font-extrabold text-ink">No Service Tickets Found</p>
            <p className="max-w-md text-xs sm:text-[13px] text-body leading-relaxed">
              {filter === "all"
                ? "You haven't requested any electrical services yet."
                : `No ${filter} requests found in your account.`}
            </p>
          </div>
          <Link
            href="/account/requests/new"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-yellow px-6 py-3 text-xs font-black text-ink shadow-sm hover:bg-yellow-dark"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Book Service Now</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5 sm:space-y-4">
          {filteredRequests.map((r, i) => {
            const meta = STATUS_META[r.status] ?? STATUS_META.requested;
            const isCompleted = ["completed", "confirmed", "closed"].includes(r.status);

            return (
              <Reveal key={r.id} delay={Math.min(i, 4) * 0.05} y={12}>
                <Link
                  href={`/account/requests/${r.id}`}
                  className="group relative flex flex-col gap-4 sm:gap-5 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Left accent strip */}
                  <span className={`absolute inset-y-0 left-0 w-1.5 ${meta.dot}`} />

                  <div className="flex min-w-0 items-start sm:items-center gap-3.5 sm:gap-4">
                    <span
                      className={`grid h-12 w-12 sm:h-13 sm:w-13 shrink-0 place-items-center rounded-2xl border ${meta.cls} font-bold shadow-2xs transition-transform duration-300 group-hover:scale-105 mt-0.5 sm:mt-0`}
                    >
                      <WrenchIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[15px] sm:text-base font-black text-ink break-words leading-snug transition-colors group-hover:text-amber-800">
                          {r.service_type}
                        </h3>
                        <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-lg border border-slate-200 bg-slate-100/90 px-2.5 py-0.5 font-mono text-[10.5px] sm:text-[11px] font-extrabold tracking-wide text-slate-700 shadow-2xs">
                          {r.ticket_number}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs font-medium text-slate-500">
                        <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
                          <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span>
                            {new Date(r.created_at || Date.now()).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </span>
                        {r.location && (
                          <span className="flex items-center gap-1.5">
                            <PinIcon className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                            <span className="break-words">{r.location}</span>
                          </span>
                        )}
                        {r.technician_name && (
                          <span className="hidden md:inline-flex items-center gap-1 text-slate-600 font-semibold">
                            <UsersIcon className="h-3.5 w-3.5 text-slate-400" />
                            <span>{r.technician_name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Right Status & Action */}
                  <div className="flex shrink-0 items-center justify-between gap-3 pt-3 sm:pt-0 border-t border-slate-100 sm:border-0 sm:justify-end">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-black shadow-2xs ${meta.cls}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          !isCompleted && r.status !== "cancelled" ? "animate-pulse" : ""
                        } ${meta.dot}`}
                      />
                      <span>{meta.label}</span>
                    </span>
                    <span className="hidden items-center gap-1.5 rounded-xl border border-slate-300/90 bg-white px-4 py-2 text-xs font-black text-ink shadow-2xs transition-all group-hover:border-ink group-hover:bg-ink group-hover:text-white sm:flex">
                      <span>View Details</span>
                      <ChevronRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="flex items-center gap-1 text-xs font-black text-slate-500 group-hover:text-ink sm:hidden">
                      <span>View Details</span>
                      <ChevronRightIcon className="h-3.5 w-3.5 text-slate-400 group-hover:text-ink" />
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
