"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { BellIcon, InboxIcon, WrenchIcon, ReportIcon, AmcBadge, ChevronRightIcon, XIcon } from "./icons";

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// No dedicated record reference is stored on notifications, so the destination is
// inferred from the title/message text — good enough to route to the right list page.
function resolveNotification({ title = "", message = "" }) {
  const text = `${title} ${message}`;
  if (/invoice/i.test(text)) {
    return { href: "/account/invoices", icon: ReportIcon, tint: "bg-emerald-50 text-emerald-600" };
  }
  if (/quotation/i.test(text)) {
    return { href: "/account/quotations", icon: ReportIcon, tint: "bg-purple-50 text-purple-600" };
  }
  if (/\bamc\b/i.test(text)) {
    return { href: "/account/amc", icon: AmcBadge, tint: "bg-amber-50 text-amber-600" };
  }
  if (/service request|ticket/i.test(text)) {
    return { href: "/account/requests", icon: WrenchIcon, tint: "bg-blue-50 text-blue-600" };
  }
  return { href: null, icon: BellIcon, tint: "bg-slate-100 text-muted" };
}

export default function NotificationsBell() {
  const { user } = useCustomerAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setItems(data ?? []);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      const unreadIds = items.filter((n) => !n.read).map((n) => n.id);
      await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggleOpen}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line/80 bg-white text-charcoal/70 shadow-sm transition-all hover:border-ink hover:text-ink"
      >
        <BellIcon className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Full-screen backdrop on mobile only */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[190] bg-black/50 sm:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 1 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-white sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:z-20 sm:h-auto sm:w-[360px] sm:max-w-[90vw] sm:rounded-3xl sm:border sm:border-line/80 sm:shadow-[0_24px_60px_-15px_rgba(20,20,20,0.25)]"
            >
              <div className="flex flex-none items-center justify-between border-b border-line/70 bg-slate-50/60 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <b className="text-sm font-extrabold text-ink">Notifications</b>
                  {items.length > 0 && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-muted">{items.length}</span>
                  )}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close notifications"
                  className="grid h-8 w-8 flex-none place-items-center rounded-full text-muted transition-colors hover:bg-slate-100 hover:text-ink"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-none sm:max-h-[420px] sm:flex-none">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2.5 px-6 py-12 text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-muted">
                    <InboxIcon className="h-6 w-6" />
                  </span>
                  <p className="text-[13px] font-bold text-ink">You're all caught up</p>
                  <p className="text-[12px] text-body">No notifications yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-line/60">
                  {items.map((n) => {
                    const { href, icon: Icon, tint } = resolveNotification(n);
                    return (
                      <div key={n.id} className="group flex gap-3 px-5 py-3.5 transition-colors hover:bg-amber-50/30">
                        <span className={`mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-xl shadow-sm ring-4 ring-white transition-transform group-hover:scale-105 ${tint}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <b className="block text-[13px] font-extrabold text-ink">{n.title}</b>
                          {n.message && <p className="mt-0.5 text-[12px] leading-relaxed text-body">{n.message}</p>}
                          <div className="mt-1.5 flex items-center justify-between gap-2">
                            <span className="text-[10.5px] font-semibold text-muted">{timeAgo(n.created_at)}</span>
                            {href && (
                              <Link
                                href={href}
                                onClick={() => setOpen(false)}
                                className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] font-black text-ink shadow-2xs transition-all hover:border-ink hover:bg-ink hover:text-white"
                              >
                                View
                                <ChevronRightIcon className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
