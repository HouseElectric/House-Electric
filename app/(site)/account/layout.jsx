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
  HomeIcon,
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
  { href: "/account/properties", label: "My Properties", icon: HomeIcon, tint: "bg-teal-50 text-teal-600" },
  { href: "/account/requests", label: "Service Requests", icon: InboxIcon, tint: "bg-blue-50 text-blue-600" },
  { href: "/account/quotations", label: "Quotations", icon: ReportIcon, tint: "bg-purple-50 text-purple-600" },
  { href: "/account/health-reports", label: "Health Reports", icon: ShieldIcon, tint: "bg-indigo-50 text-indigo-600" },
  { href: "/account/invoices", label: "Invoices", icon: ReportIcon, tint: "bg-emerald-50 text-emerald-700" },
  { href: "/account/amc", label: "My AMC", icon: AmcBadge, tint: "bg-yellow/15 text-yellow-dark" },
  { href: "/account/profile", label: "My Profile", icon: UsersIcon, tint: "bg-rose-50 text-rose-500" },
];

export default function AccountLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useCustomerAuth();
  const { phone, whatsapp } = useSiteSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = profile?.name || user?.email || "";
  const initials = displayName ? displayName.trim().charAt(0).toUpperCase() : "U";
  const isActive = (item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));
  const pageTitle = NAV.find((item) => isActive(item))?.label || "My Account";

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
    <div className="flex h-full flex-col">
      <div className="flex flex-none items-center justify-between border-b border-line px-5 py-4 lg:py-5">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-2.5">
          <Image src="/logo.jpg" alt="House Electric" width={130} height={33} className="h-7 w-auto object-contain" />
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:text-ink lg:hidden"
          aria-label="Close navigation"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4 scrollbar-none">
        {NAV.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-extrabold transition-all ${
                active ? "bg-[#141414] text-white shadow-md shadow-black/15" : "text-body hover:bg-slate-100/80 hover:text-ink"
              }`}
            >
              <span
                className={`grid h-8 w-8 flex-none place-items-center rounded-lg transition-transform group-hover:scale-105 ${
                  active ? "bg-yellow text-ink" : item.tint
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-none border-t border-line p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
          <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-yellow text-[12px] font-extrabold text-ink">{initials}</span>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-extrabold text-ink">{displayName}</div>
            <div className="truncate text-[11px] text-body">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-bold text-red-600 transition-colors hover:bg-red-50"
        >
          <LogoutIcon className="h-4 w-4 flex-none transition-transform group-hover:-translate-x-0.5" />
          Log Out Account
        </button>
      </div>
    </div>
  );

  return (
    <CustomerGuard>
      <div className="flex min-h-screen bg-[#F8FAFC] text-ink print:bg-white">
        {mobileOpen && (
          <div className="fixed inset-0 z-[190] bg-black/50 lg:hidden print:hidden" onClick={() => setMobileOpen(false)} />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-[200] flex w-64 flex-none flex-col overflow-y-auto bg-white transition-transform duration-200 lg:translate-x-0 print:hidden scrollbar-none ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarBody onNavigate={() => setMobileOpen(false)} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
          <div className="flex min-h-full flex-1 flex-col xl:[zoom:1.05] print:[zoom:1]">
            <header className="sticky top-0 z-[50] flex h-14 sm:h-[60px] flex-none items-center gap-2.5 sm:gap-3 border-b border-line bg-white px-3.5 sm:px-5 print:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-line lg:hidden"
              >
                <MenuIcon className="h-[18px] w-[18px] text-ink" />
              </button>
              <h1 className="min-w-0 flex-1 text-sm sm:text-[15px] font-extrabold text-ink leading-tight">{pageTitle}</h1>
              <div className="flex flex-none items-center gap-2 sm:gap-2.5">
                <NotificationsBell />
                <Link
                  href="/"
                  className="hidden items-center gap-1.5 rounded-md border border-line px-3.5 py-2 text-[13px] font-semibold text-ink hover:border-ink sm:flex"
                >
                  View Site
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-md border border-line text-red-600 transition-colors hover:border-red-200 hover:bg-red-50"
                >
                  <LogoutIcon className="h-4 w-4" />
                </button>
              </div>
            </header>

            <main className="flex-1 p-3.5 sm:p-5 lg:p-7 print:p-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto max-w-6xl min-w-0"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </CustomerGuard>
  );
}
