"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTechnicianAuth } from "@/contexts/TechnicianAuthContext";
import { BellIcon, InboxIcon, XIcon } from "@/components/icons";

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function TechnicianNotificationsBell() {
  const { technician } = useTechnicianAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    if (!technician) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("technician_id", technician.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setItems(data ?? []);
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [technician]);

  useEffect(() => {
    if (!supabase || !technician) return;
    const channel = supabase
      .channel(`technician-notifications-${technician.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `technician_id=eq.${technician.id}` },
        () => fetchNotifications()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [technician]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  const markRead = async (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  };

  const toggleOpen = () => setOpen((v) => !v);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggleOpen}
        aria-label="Notifications"
        className="relative flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-line text-ink transition-all hover:border-ink"
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
              <b className="text-[13px] font-extrabold text-ink">Notifications</b>
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
                  <p className="text-[12.5px] text-body">No notifications yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {items.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.read && markRead(n.id)}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-cream/40 ${!n.read ? "bg-cream/30" : ""}`}
                    >
                      <span className={`mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-lg ${n.read ? "bg-cream text-ink" : "bg-ink text-yellow"}`}>
                        <BellIcon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <b className="truncate text-[13px] text-ink">{n.title}</b>
                          {!n.read && <span className="h-1.5 w-1.5 flex-none rounded-full bg-yellow" />}
                        </div>
                        {n.message && <p className="mt-0.5 text-[11.5px] text-body">{n.message}</p>}
                        <p className="mt-1 text-[10.5px] font-semibold text-muted">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
