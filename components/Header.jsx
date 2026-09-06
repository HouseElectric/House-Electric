"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Arrow,
  ArticleIcon,
  BuildingIcon,
  ChevronDown,
  DashboardIcon,
  HomeIcon,
  MailIcon,
  PhoneIcon,
  UsersIcon,
  WrenchIcon,
  XIcon,
} from "./icons";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { supabase } from "@/lib/supabase";

const FALLBACK_SERVICE_LINKS = [
  { href: "/services/electrical-repair", label: "Electrical Repair" },
  { href: "/services/electrical-installation", label: "Electrical Installation" },
  { href: "/services/electrical-maintenance", label: "Electrical Maintenance" },
  { href: "/health-check", label: "Health Check" },
  { href: "/amc", label: "AMC" },
];

const BASE_LINKS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/about", label: "About Us", icon: UsersIcon },
  { href: "/services", label: "Services", icon: WrenchIcon, hasChildren: true },
  { href: "/projects", label: "Projects", icon: DashboardIcon },
  { href: "/corporate", label: "Corporate", icon: BuildingIcon },
  { href: "/blog", label: "Blog", icon: ArticleIcon },
  { href: "/contact", label: "Contact", icon: MailIcon },
];

const Logo = () => (
  <motion.a
    href="/"
    className="flex shrink-0 items-center"
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: "spring", stiffness: 350, damping: 15 }}
  >
    <Image
      src="/logo.jpg"
      alt="House Electric"
      width={240}
      height={60}
      priority
      className="h-[36px] sm:h-[40px] md:h-[44px] w-auto max-w-[170px] sm:max-w-none object-contain flex-none"
    />
  </motion.a>
);

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [serviceLinks, setServiceLinks] = useState(FALLBACK_SERVICE_LINKS);
  const pathname = usePathname();
  const { phone } = useSiteSettings();

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase
        .from("services")
        .select("title, slug, href")
        .eq("active", true)
        .order("display_order", { ascending: true });
      if (data && data.length > 0) {
        setServiceLinks(data.map((s) => ({ href: s.href || `/services/${s.slug}`, label: s.title })));
      }
    })();
  }, []);

  const LINKS = BASE_LINKS.map((l) => (l.hasChildren ? { ...l, children: serviceLinks } : l));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const isActiveGroup = (l) =>
    isActive(l.href) || (l.children && l.children.some((c) => c.href.startsWith("/") && pathname.startsWith(c.href)));

  return (
    <header className="sticky top-0 z-[110] px-2 pt-2 transition-all duration-300 sm:px-4 sm:pt-3">
      <motion.div
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 transition-all duration-300 ${scrolled
            ? "h-[58px] max-w-[1140px] rounded-full border border-line/90 bg-white/95 shadow-[0_12px_36px_-10px_rgba(20,20,20,0.16)] backdrop-blur-xl"
            : "h-[68px] sm:h-[74px] max-w-wrap rounded-2xl sm:rounded-full border border-white/60 bg-white/85 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] backdrop-blur-md"
          }`}
      >
        {/* Brand Logo */}
        <div className="flex shrink-0 items-center">
          <Logo />
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden shrink-0 items-center gap-1 xl:flex">
          {LINKS.map((l) => {
            const active = isActiveGroup(l);
            return (
              <div key={l.label} className="group relative">
                <a
                  href={l.href}
                  className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-extrabold transition-all duration-200 ${active
                      ? "bg-yellow/20 text-ink shadow-sm border border-yellow/40"
                      : "text-charcoal/80 hover:bg-cream hover:text-ink"
                    }`}
                >
                  <span>{l.label}</span>
                  {l.children && (
                    <ChevronDown className="h-3 w-3 opacity-60 transition-transform duration-200 group-hover:rotate-180" />
                  )}
                </a>

                {/* Dropdown Menu for Services */}
                {l.children && (
                  <div className="invisible absolute left-1/2 -translate-x-1/2 top-full z-20 w-64 translate-y-3 scale-95 pt-2 opacity-0 transition-all duration-200 ease-out group-hover:visible group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
                    <div className="overflow-hidden rounded-2xl border border-line/90 bg-white/95 p-2 shadow-[0_20px_50px_-10px_rgba(20,20,20,0.22)] backdrop-blur-xl">
                      {l.children.map((c) => {
                        const isEmergency = c.href.startsWith("tel:");
                        return (
                          <a
                            key={c.label}
                            href={c.href}
                            className={`group/item relative flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-bold transition-all duration-200 ${isEmergency
                                ? "mt-1 border-t border-line/70 text-red-600 hover:bg-red-50"
                                : "text-charcoal/80 hover:bg-yellow/15 hover:text-ink"
                              }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full bg-yellow opacity-0 transition-opacity group-hover/item:opacity-100 ${isEmergency ? "bg-red-500 opacity-100 animate-pulse" : ""
                                }`}
                            />
                            {isEmergency && <PhoneIcon className="h-3.5 w-3.5 flex-none" />}
                            <span>{c.label}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Desktop CTA Action Button */}
        <div className="hidden xl:flex items-center gap-3 shrink-0">
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-yellow px-5 py-2.5 text-xs font-extrabold text-ink shadow-[0_6px_20px_-4px_rgba(242,176,30,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_10px_25px_-4px_rgba(242,176,30,0.8)]"
          >
            <span>Book Service</span>
          </a>
        </div>

        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="relative ml-auto flex h-10 w-10 flex-none items-center justify-center rounded-full border border-line/90 bg-white/90 shadow-sm transition-all hover:border-yellow hover:bg-yellow/10 xl:hidden"
        >
          <span
            className={`absolute h-[2px] w-[17px] bg-ink transition-all duration-300 ${open ? "rotate-45" : "-translate-y-[5px]"
              }`}
          />
          <span
            className={`absolute h-[2px] w-[17px] bg-ink transition-all duration-300 ${open ? "scale-0 opacity-0" : "scale-100 opacity-100"
              }`}
          />
          <span
            className={`absolute h-[2px] w-[17px] bg-ink transition-all duration-300 ${open ? "-rotate-45" : "translate-y-[5px]"
              }`}
          />
        </button>
      </motion.div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm xl:hidden"
            />

            {/* Side Drawer Panel */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 right-0 z-[130] flex w-[86%] max-w-[340px] flex-col overflow-y-auto bg-white rounded-l-3xl shadow-2xl xl:hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-line px-6 py-5 bg-cream/40">
                <Image src="/logo.jpg" alt="House Electric" width={240} height={60} className="h-[34px] w-auto max-w-[160px] object-contain flex-none" />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm transition-all hover:bg-yellow hover:border-yellow"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Links */}
              <motion.div
                className="flex flex-1 flex-col p-6 space-y-1"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}
              >
                {LINKS.map((l) =>
                  l.children ? (
                    <motion.div
                      key={l.label}
                      variants={{ hidden: { opacity: 0, x: 16 }, visible: { opacity: 1, x: 0 } }}
                      className="border-b border-line/60 pb-1"
                    >
                      <div className="flex items-center justify-between">
                        <a
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className={`flex flex-1 items-center gap-3 py-3 text-[14.5px] font-extrabold ${isActiveGroup(l) ? "text-ink" : "text-charcoal/80"
                            }`}
                        >
                          <span className={`grid h-8 w-8 flex-none place-items-center rounded-xl ${isActiveGroup(l) ? "bg-yellow text-ink shadow-sm" : "bg-cream text-charcoal/70"
                            }`}>
                            <l.icon className="h-4 w-4" />
                          </span>
                          {l.label}
                        </a>
                        <button
                          onClick={() => setMobileServicesOpen((v) => !v)}
                          aria-label="Toggle services list"
                          aria-expanded={mobileServicesOpen}
                          className="flex h-9 w-9 flex-none items-center justify-center text-charcoal/60"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${mobileServicesOpen ? "rotate-180" : ""
                              }`}
                          />
                        </button>
                      </div>
                      <AnimatePresence>
                        {mobileServicesOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-1 pb-3 pl-4 border-l-2 border-yellow/40 my-1 ml-4">
                              {l.children.map((c) => (
                                <a
                                  key={c.label}
                                  href={c.href}
                                  onClick={() => setOpen(false)}
                                  className="rounded-xl px-3 py-2 text-[13.5px] font-bold text-charcoal/80 hover:bg-yellow/15 hover:text-ink"
                                >
                                  {c.label}
                                </a>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.a
                      key={l.label}
                      variants={{ hidden: { opacity: 0, x: 16 }, visible: { opacity: 1, x: 0 } }}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 border-b border-line/60 py-3 text-[14.5px] font-extrabold ${isActive(l.href) ? "text-ink" : "text-charcoal/80"
                        }`}
                    >
                      <span className={`grid h-8 w-8 flex-none place-items-center rounded-xl ${isActive(l.href) ? "bg-yellow text-ink shadow-sm" : "bg-cream text-charcoal/70"
                        }`}>
                        <l.icon className="h-4 w-4" />
                      </span>
                      {l.label}
                    </motion.a>
                  )
                )}

                {/* Mobile Drawer Direct Call Button */}
                <div className="pt-6">
                  <a
                    href="/contact"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow px-6 py-3.5 text-sm font-extrabold text-ink shadow-lg hover:bg-yellow-dark"
                  >
                    <span>Book Service Online</span>
                  </a>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    onClick={() => setOpen(false)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-cream/60 px-6 py-3 text-xs font-bold text-ink hover:bg-cream"
                  >
                    <PhoneIcon className="h-3.5 w-3.5 text-yellow-dark" />
                    <span>Call Hotline: {phone}</span>
                  </a>
                </div>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
