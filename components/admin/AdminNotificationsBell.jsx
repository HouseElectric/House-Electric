"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { BellIcon, InboxIcon, WrenchIcon, ChevronRightIcon, XIcon } from "@/components/icons";

const TYPE_LABELS = { booking: "Booking", amc: "AMC", corporate: "Corporate" };

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminNotificationsBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const ref = useRef(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    const [{ data: enquiries }, { data: requests }] = await Promise.all([
      supabase
        .from("enquiries")
        .select("id, name, contact_person, type, read, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("service_requests")
        .select("id, ticket_number, service_type, status, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    const merged = [
      ...(enquiries ?? []).map((e) => ({
        id: `enq-${e.id}`,
        icon: InboxIcon,
        title: e.name || e.contact_person || "New enquiry",
        subtitle: TYPE_LABELS[e.type] ?? e.type,
        unread: !e.read,
        created_at: e.created_at,
        href: "/admin/enquiries",
      })),
      ...(requests ?? []).map((r) => ({
        id: `req-${r.id}`,
        icon: WrenchIcon,
        title: r.ticket_number,
        subtitle: r.service_type || "Service request",
        unread: r.status === "requested",
        created_at: r.created_at,
        href: "/admin/service-requests",
      })),
    ]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 12);

    setItems(merged);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("admin-notifications-bell")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "enquiries" }, () => {
        load();
        setPulse(true);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "service_requests" }, () => {
        load();
        setPulse(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const unreadCount = items.filter((i) => i.unread).length;

  const toggleOpen = () => {
    setOpen((v) => !v);
    setPulse(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggleOpen}
        aria-label="Notifications"
        className={`relative flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-line text-ink transition-all hover:border-ink ${
          pulse ? "animate-[blink_1.4s_ease-in-out_2]" : ""
        }`}
      >
        <BellIcon className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-[16px] min-w-[16px] place-items-center rounded-full border-2 border-white bg-red-500 px-1 text-[9.5px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[190] bg-black/40 sm:hidden" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-4 top-16 z-[200] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_24px_60px_-15px_rgba(20,20,20,0.25)] sm:absolute sm:inset-auto sm:right-0 sm:top-11 sm:w-[360px]">
            <div className="flex items-center justify-between border-b border-line bg-cream/40 px-4 py-3">
              <b className="text-[13px] font-extrabold text-ink">Live Activity</b>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-7 w-7 place-items-center rounded-full text-body hover:bg-cream sm:hidden"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[420px] overflow-y-auto scrollbar-none">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                  <InboxIcon className="h-6 w-6 text-body/40" />
                  <p className="text-[12.5px] text-body">No activity yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {items.map((i) => {
                    const Icon = i.icon;
                    return (
                      <Link
                        key={i.id}
                        href={i.href}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-cream/40"
                      >
                        <span
                          className={`mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-lg ${
                            i.unread ? "bg-ink text-yellow" : "bg-cream text-ink"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <b className="truncate text-[13px] text-ink">{i.title}</b>
                            {i.unread && <span className="h-1.5 w-1.5 flex-none rounded-full bg-yellow" />}
                          </div>
                          <p className="mt-0.5 text-[11.5px] text-body">
                            {i.subtitle} · {timeAgo(i.created_at)}
                          </p>
                        </div>
                        <ChevronRightIcon className="mt-1.5 h-3.5 w-3.5 flex-none text-body/40" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
