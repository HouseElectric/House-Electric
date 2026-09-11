"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import CustomerGuard from "@/components/CustomerGuard";
import NotificationsBell from "@/components/NotificationsBell";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import {
  DashboardIcon,
  ExternalLinkIcon,
  InboxIcon,
  LogoutIcon,
  ReportIcon,
  AmcBadge,
  UsersIcon,
  PhoneIcon,
  WhatsAppIcon,
  ShieldIcon,
  MenuIcon,
  XIcon,
} from "@/components/icons";

const NAV = [
  { href: "/account", label: "Overview", icon: DashboardIcon, exact: true, tint: "bg-amber-50 text-amber-600" },
  { href: "/account/requests", label: "Service Requests", icon: InboxIcon, tint: "bg-blue-50 text-blue-600" },
  { href: "/account/quotations", label: "Quotations", icon: ReportIcon, tint: "bg-purple-50 text-purple-600" },
  { href: "/account/invoices", label: "Invoices", icon: ReportIcon, tint: "bg-emerald-50 text-emerald-700" },
  { href: "/account/amc", label: "My AMC", icon: AmcBadge, tint: "bg-yellow/15 text-yellow-dark" },
  { href: "/account/profile", label: "My Profile", icon: UsersIcon, tint: "bg-rose-50 text-rose-500" },
];

export default function AccountLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useCustomerAuth();
  const { phone, whatsapp } = useSiteSettings();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await signOut();
    router.replace("/");
  };

  const SidebarBody = ({ onNavigate }) => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
      className="space-y-5"
    >
      {/* Navigation Card */}
      <div className="rounded-3xl border border-line/80 bg-white p-3.5 shadow-sm">
        <p className="px-3 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted">Main Navigation</p>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <motion.div key={item.href} variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[13.5px] font-extrabold transition-all ${
                    active
                      ? "bg-[#141414] text-white shadow-lg shadow-black/20"
                      : "text-body hover:-translate-y-0.5 hover:bg-slate-100/80 hover:text-ink hover:shadow-sm"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebarActivePill"
                      className="absolute left-1 top-2.5 bottom-2.5 w-1 rounded-full bg-yellow shadow-[0_0_10px_rgba(242,176,30,0.8)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span
                    className={`grid h-9 w-9 flex-none place-items-center rounded-xl shadow-sm transition-transform group-hover:scale-110 ${
                      active ? "bg-yellow text-ink font-bold shadow-[0_4px_12px_-2px_rgba(242,176,30,0.7)] ring-2 ring-white/20" : `${item.tint} ring-4 ring-white`
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      {/* Priority Support Shortcut Card */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-500/10 via-yellow/5 to-transparent p-4 shadow-2xs">
        <div className="glow-blob right-[-20%] top-[-60%] h-[100px] w-[100px] bg-yellow/25 opacity-60 blur-[50px]" />
        <div className="relative flex items-center gap-2.5 text-amber-900">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-yellow text-ink font-bold shadow-[0_6px_14px_-3px_rgba(242,176,30,0.6)] ring-4 ring-white">
            <ShieldIcon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-black">24/7 Priority Support</p>
            <p className="text-[11px] text-amber-800">Need emergency repair?</p>
          </div>
        </div>
        <div className="relative mt-3 grid grid-cols-2 gap-2">
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-white py-2 text-[11.5px] font-extrabold text-ink shadow-2xs transition-all hover:-translate-y-0.5 hover:bg-amber-50 hover:shadow-md"
          >
            <PhoneIcon className="h-3.5 w-3.5 text-amber-600" />
            Call Us
          </a>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-[11.5px] font-extrabold text-white shadow-2xs transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
          >
            <WhatsAppIcon className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="group flex w-full items-center justify-center gap-2.5 rounded-2xl border border-line/80 bg-white px-4 py-3 text-[13.5px] font-bold text-red-600 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:shadow-md"
      >
        <LogoutIcon className="h-4 w-4 flex-none transition-transform group-hover:-translate-x-0.5" />
        Log Out Account
      </button>
    </motion.div>
  );

  return (
    <CustomerGuard>
      <main className="min-h-screen bg-[#F8FAFC] print:bg-white text-ink" style={{ zoom: 1.08 }}>
        {/* Mobile drawer backdrop — sits above the site navbar (z-[110]) so the drawer reads as the topmost layer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[190] bg-black/50 lg:hidden print:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* Mobile drawer sidebar */}
        <aside
          className={`fixed left-0 top-0 z-[200] h-screen w-[280px] flex-none overflow-y-auto bg-[#F8FAFC] p-4 shadow-2xl transition-transform duration-200 lg:hidden print:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image src="/logo.jpg" alt="House Electric" width={140} height={35} className="h-8 w-auto object-contain" />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="grid h-9 w-9 flex-none place-items-center rounded-xl border border-line bg-white"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
          <SidebarBody onNavigate={() => setMobileOpen(false)} />
        </aside>

        {/* Main Content Area */}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 print:p-0">
          {/* Mini navbar — keeps the brand visible now that the full public navbar is hidden on account pages */}
          <div className="sticky top-3 z-40 mb-5 flex items-center justify-between gap-3 rounded-2xl border border-line/80 bg-white/95 px-3.5 py-2.5 shadow-sm backdrop-blur-md print:hidden sm:rounded-full sm:px-5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="grid h-9 w-9 flex-none place-items-center rounded-xl border border-line bg-white shadow-2xs lg:hidden"
              >
                <MenuIcon className="h-4.5 w-4.5 text-ink" />
              </button>
              <Link href="/" className="flex items-center">
                <Image src="/logo.jpg" alt="House Electric" width={150} height={38} className="h-7 w-auto object-contain sm:h-8" />
              </Link>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                className="hidden items-center gap-1.5 rounded-full border border-line/80 bg-white px-3.5 py-2 text-[12px] font-bold text-body shadow-sm transition-colors hover:border-ink hover:text-ink sm:flex"
              >
                View Website
                <ExternalLinkIcon className="h-3 w-3" />
              </Link>
              <NotificationsBell />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] print:block">
            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:block print:hidden">
              <div className="sticky top-28">
                <SidebarBody onNavigate={undefined} />
              </div>
            </aside>

            {/* Sub-page Render Box */}
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="min-w-0"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </CustomerGuard>
  );
}
