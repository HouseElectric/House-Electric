"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTechnicianAuth } from "@/contexts/TechnicianAuthContext";
import TechnicianNotificationsBell from "@/components/TechnicianNotificationsBell";
import { DashboardIcon, ExternalLinkIcon, LogoutIcon, MenuIcon, StarIcon, UserIcon } from "@/components/icons";

const NAV_ITEMS = [
  { href: "/technician", label: "My Jobs", icon: DashboardIcon, exact: true },
  { href: "/technician/reviews", label: "My Reviews", icon: StarIcon },
  { href: "/technician/profile", label: "My Profile", icon: UserIcon },
];

export default function TechnicianLayout({ children, title }) {
  const { technician, signOut } = useTechnicianAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

  const handleLogout = async () => {
    await signOut();
    router.replace("/technician/login");
  };

  const initials = (technician?.name || "T").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {mobileOpen && <div className="fixed inset-0 z-[90] bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside
        className={`fixed left-0 top-0 z-[100] flex h-screen w-64 flex-none flex-col bg-[#141414] transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/technician" className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
          <Image src="/logo.jpg" alt="House Electric" width={130} height={33} className="h-7 w-auto object-contain" />
        </Link>
        <div className="px-5 pb-3 pt-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/30">Technician Portal</div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold transition-colors ${
                  active ? "bg-white/[0.07] text-white" : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-yellow" />}
                <Icon className={`h-[18px] w-[18px] flex-none ${active ? "text-yellow" : "text-white/40"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/technician/profile"
            onClick={() => setMobileOpen(false)}
            className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/5"
          >
            {technician?.photo_url ? (
              <img src={technician.photo_url} alt="" className="h-8 w-8 flex-none rounded-full object-cover" />
            ) : (
              <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-yellow text-[12px] font-extrabold text-ink">{initials}</div>
            )}
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-semibold text-white/85">{technician?.name || "Technician"}</div>
              <div className="truncate text-[11px] text-white/40">{technician?.specialization || "View profile"}</div>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-white/50 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <LogoutIcon className="h-[17px] w-[17px]" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-[50] flex h-[60px] flex-none items-center gap-3 border-b border-line bg-white px-5">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-line lg:hidden"
          >
            <MenuIcon className="h-[18px] w-[18px] text-ink" />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-[15px] font-extrabold text-ink">{title}</h1>
          <div className="flex flex-none items-center gap-2.5">
            <TechnicianNotificationsBell />
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-md border border-line px-3.5 py-2 text-[13px] font-semibold text-ink hover:border-ink sm:flex"
            >
              View Site
              <ExternalLinkIcon className="h-3.5 w-3.5" />
            </a>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
