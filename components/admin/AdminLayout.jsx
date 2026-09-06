"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  ArticleIcon,
  DashboardIcon,
  ExternalLinkIcon,
  HomeIcon,
  ImageIcon,
  InboxIcon,
  LogoutIcon,
  MapIcon,
  MenuIcon,
  SlidersIcon,
  StarIcon,
  WrenchIcon,
} from "@/components/icons";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: DashboardIcon, exact: true }],
  },
  {
    label: "Leads",
    items: [{ href: "/admin/enquiries", label: "Enquiries", icon: InboxIcon }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/home", label: "Home Page", icon: HomeIcon },
      { href: "/admin/blog", label: "Blog Posts", icon: ArticleIcon },
      { href: "/admin/testimonials", label: "Testimonials", icon: StarIcon },
      { href: "/admin/projects", label: "Projects", icon: ImageIcon },
    ],
  },
  {
    label: "Catalog",
    items: [{ href: "/admin/services", label: "Services & Pricing", icon: WrenchIcon }],
  },
  {
    label: "Settings",
    items: [
      { href: "/admin/service-areas", label: "Service Areas", icon: MapIcon },
      { href: "/admin/settings", label: "Contact Settings", icon: SlidersIcon },
    ],
  },
];

export default function AdminLayout({ children, title }) {
  const { user, signOut } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

  const handleLogout = async () => {
    await signOut();
    router.replace("/admin/login");
  };

  const initials = user?.email?.[0]?.toUpperCase() ?? "A";

  return (
    <div className="flex min-h-screen bg-[#F4F3EF]">
      {mobileOpen && (
        <div className="fixed inset-0 z-[90] bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed left-0 top-0 z-[100] flex h-screen w-64 flex-none flex-col bg-[#141414] transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
          <svg viewBox="0 0 40 40" fill="none" className="h-8 w-8 flex-none" aria-hidden="true">
            <path d="M20 4 4 16v20h32V16L20 4Z" fill="#fff" />
            <path d="M22 14l-8 10h5l-1 8 8-10h-5l1-8Z" fill="#F2B01E" />
          </svg>
          <div>
            <div className="text-[14px] font-extrabold leading-tight text-white">HOUSE ELECTRIC</div>
            <div className="text-[10px] font-semibold tracking-wide text-white/40">ADMIN PANEL</div>
          </div>
        </div>

        <nav className="scrollbar-dark flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[10.5px] font-bold uppercase tracking-wider text-white/30">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
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
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-yellow text-[12px] font-extrabold text-ink">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-semibold text-white/85">{user?.email}</div>
              <div className="text-[11px] text-white/40">Administrator</div>
            </div>
          </div>
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
        <header className="sticky top-0 z-[50] flex h-[60px] items-center justify-between border-b border-line bg-white px-5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-line lg:hidden"
            >
              <MenuIcon className="h-[18px] w-[18px] text-ink" />
            </button>
            <h1 className="truncate text-[15px] font-extrabold text-ink">{title}</h1>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-line px-3.5 py-2 text-[13px] font-semibold text-ink hover:border-ink"
          >
            View Site
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </a>
        </header>

        <main className="flex-1 p-5 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
