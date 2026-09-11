"use client";

import Image from "next/image";
import { Arrow, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon, SparklesIcon } from "./icons";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/services/annual-maintenance-contract-amc", label: "AMC" },
  { href: "/corporate", label: "Corporate" },
  { href: "/projects", label: "Projects" },
  { href: "/reviews", label: "Reviews" },
  { href: "/blog", label: "Blog" },
  { href: "/service-areas", label: "Service Areas" },
  { href: "/contact", label: "Contact" },
];

const SERVICE_LINKS = [
  { href: "/services/electrical-repair", label: "Electrical Repair" },
  { href: "/services/electrical-installation", label: "Electrical Installation" },
  { href: "/services/electrical-maintenance", label: "Electrical Maintenance" },
  { href: "/services/electrical-health-check", label: "Electrical Health Check" },
  { href: "/services/annual-maintenance-contract-amc", label: "Annual Maintenance Contract" },
];

const SOCIALS = [
  {
    label: "Facebook",
    d: "M13 22v-8h3l.5-3H13V9c0-.9.3-1.5 1.6-1.5H17V4.8A22 22 0 0 0 14.6 4.7C12.1 4.7 10.4 6.2 10.4 9v2H7.5v3h2.9v8Z",
  },
  {
    label: "Instagram",
    isSvg: true,
  },
  {
    label: "LinkedIn",
    d: "M4.5 9H8v11H4.5zM6.2 3.8a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM10 9h3.3v1.5c.6-1 1.7-1.8 3.4-1.8 2.7 0 3.8 1.7 3.8 4.6V20h-3.5v-6c0-1.4-.5-2.3-1.8-2.3-1.1 0-1.7.7-2 1.5-.1.2-.1.6-.1.9V20H10Z",
  },
  {
    label: "YouTube",
    d: "M22 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.5a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.7c.2.9.9 1.6 1.8 1.8C5.7 19 12 19 12 19s6.3 0 7.8-.5a2.5 2.5 0 0 0 1.8-1.8c.4-1.5.4-4.7.4-4.7Zm-12 3V9l5 3Z",
  },
];

export default function Footer() {
  const { phone, whatsapp, email, address, gstin, facebook, instagram, linkedin, youtube } = useSiteSettings();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative overflow-hidden bg-[#07080B] pt-16 text-[#A5A096] border-t border-white/10 print:hidden">
      {/* Background Ambient Glows */}
      <div className="glow-blob left-[-5%] top-[-10%] h-[350px] w-[350px] bg-yellow/15 opacity-30 blur-[110px]" />
      <div className="glow-blob right-[-8%] bottom-[-15%] h-[320px] w-[320px] bg-amber-500/10 opacity-25 blur-[100px]" />

      {/* Circuit Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-60" />

      <div className="relative z-[2] mx-auto max-w-wrap px-6">
        {/* Top Emergency Dispatch Callout Banner */}
        <div className="mb-14 rounded-2xl md:rounded-3xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-yellow text-ink shadow-[0_0_20px_rgba(242,176,30,0.5)]">
              <SparklesIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-yellow">
                24/7 Emergency Electrician Desk
              </p>
              <h3 className="text-lg md:text-xl font-extrabold text-white">
                Need Breakdown Support or a Quick Site Audit?
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-yellow px-6 py-3.5 text-xs font-extrabold text-ink shadow-lg transition-all hover:bg-yellow-dark hover:-translate-y-0.5 whitespace-nowrap"
            >
              <PhoneIcon className="h-4 w-4 flex-none" />
              <span>Call Now</span>
            </a>
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                "Hello House Electric, I need electrical assistance."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-xs font-bold text-white transition-all hover:border-yellow/60 hover:bg-white/15 whitespace-nowrap backdrop-blur-md"
            >
              <WhatsAppIcon className="h-4 w-4 text-emerald-400" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>

        {/* 4 Main Footer Columns */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.2fr_1.3fr]">
          {/* Col 1: Brand Info & Socials */}
          <div>
            <a href="/" className="flex items-center gap-3.5 group">
              <span className="inline-flex flex-none items-center rounded-xl bg-white p-2.5 shadow-md group-hover:scale-105 transition-transform">
                <Image src="/logo.jpg" alt="House Electric" width={240} height={60} className="h-7 w-auto object-contain" />
              </span>
              <span className="block text-[8px] font-extrabold leading-tight tracking-[.18em] text-[#A5A096]">
                SAFE TODAY.
                <br />
                <span className="text-yellow">BRIGHTER TOMORROW.</span>
              </span>
            </a>

            <p className="my-5 max-w-[34ch] text-[14px] leading-relaxed text-[#B0AAA0]">
              Reliable electrical solutions for residential, commercial and corporate customers. Safe spaces. Brighter tomorrows.
            </p>

            {/* Social Icons */}
            {(facebook || instagram || linkedin || youtube) && (
              <div className="flex items-center gap-2.5 pt-2">
                {facebook && (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition-all duration-300 hover:border-yellow hover:bg-yellow hover:text-ink shadow-sm hover:scale-110"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M13 22v-8h3l.5-3H13V9c0-.9.3-1.5 1.6-1.5H17V4.8A22 22 0 0 0 14.6 4.7C12.1 4.7 10.4 6.2 10.4 9v2H7.5v3h2.9v8Z" />
                    </svg>
                  </a>
                )}
                {instagram && (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition-all duration-300 hover:border-yellow hover:bg-yellow hover:text-ink shadow-sm hover:scale-110"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  </a>
                )}
                {linkedin && (
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition-all duration-300 hover:border-yellow hover:bg-yellow hover:text-ink shadow-sm hover:scale-110"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M4.5 9H8v11H4.5zM6.2 3.8a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM10 9h3.3v1.5c.6-1 1.7-1.8 3.4-1.8 2.7 0 3.8 1.7 3.8 4.6V20h-3.5v-6c0-1.4-.5-2.3-1.8-2.3-1.1 0-1.7.7-2 1.5-.1.2-.1.6-.1.9V20H10Z" />
                    </svg>
                  </a>
                )}
                {youtube && (
                  <a
                    href={youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition-all duration-300 hover:border-yellow hover:bg-yellow hover:text-ink shadow-sm hover:scale-110"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M22 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.5a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.7c.2.9.9 1.6 1.8 1.8C5.7 19 12 19 12 19s6.3 0 7.8-.5a2.5 2.5 0 0 0 1.8-1.8c.4-1.5.4-4.7.4-4.7Zm-12 3V9l5 3Z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="mb-5 flex items-center gap-2 text-[13.5px] font-black uppercase tracking-wider text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow" />
              Quick Navigation
            </h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((l, i) => (
                <li key={l.label + i} className="text-[13.5px]">
                  <a
                    href={l.href}
                    className="group inline-flex items-center gap-2 transition-all duration-200 hover:translate-x-1.5 hover:text-yellow"
                  >
                    <span className="text-yellow opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      ›
                    </span>
                    <span>{l.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Services Links */}
          <div>
            <h4 className="mb-5 flex items-center gap-2 text-[13.5px] font-black uppercase tracking-wider text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow" />
              Our Services
            </h4>
            <ul className="space-y-2.5">
              {SERVICE_LINKS.map((l) => (
                <li key={l.label} className="text-[13.5px]">
                  <a
                    href={l.href}
                    className="group inline-flex items-center gap-2 transition-all duration-200 hover:translate-x-1.5 hover:text-yellow"
                  >
                    <span className="text-yellow opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      ›
                    </span>
                    <span>{l.label}</span>
                  </a>
                </li>
              ))}
              <li className="text-[13.5px] pt-1">
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="group inline-flex items-center gap-2 font-bold text-yellow transition-all duration-200 hover:translate-x-1.5"
                >
                  <span className="h-2 w-2 rounded-full bg-yellow animate-pulse" />
                  <span>24/7 Emergency Line</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Cards */}
          <div>
            <h4 className="mb-5 flex items-center gap-2 text-[13.5px] font-black uppercase tracking-wider text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow" />
              Contact Desk
            </h4>
            <div className="space-y-3">
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-[13.5px] font-extrabold text-white transition-all duration-200 hover:border-yellow/50 hover:bg-white/10 hover:-translate-y-0.5"
              >
                <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-yellow/15 text-yellow transition-colors group-hover:bg-yellow group-hover:text-ink">
                  <PhoneIcon className="h-4 w-4" />
                </span>
                <span className="truncate">{phone}</span>
              </a>

              <a
                href={`mailto:${email}`}
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-[13.5px] font-extrabold text-white transition-all duration-200 hover:border-yellow/50 hover:bg-white/10 hover:-translate-y-0.5"
              >
                <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-yellow/15 text-yellow transition-colors group-hover:bg-yellow group-hover:text-ink">
                  <MailIcon className="h-4 w-4" />
                </span>
                <span className="truncate">{email}</span>
              </a>

              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-[13.5px] font-medium text-[#C0BAAF]">
                <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-yellow/15 text-yellow">
                  <PinIcon className="h-4 w-4" />
                </span>
                <span className="leading-snug">{address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Links Row */}
        <div className="relative z-[2] mt-16 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-[12.5px] text-[#8C867D] sm:justify-start">
          {[
            { href: "/privacy-policy", label: "Privacy Policy" },
            { href: "/terms-and-conditions", label: "Terms & Conditions" },
            { href: "/refund-policy", label: "Cancellation & Refund Policy" },
            { href: "/disclaimer", label: "Disclaimer" },
          ].map((l) => (
            <a key={l.href} href={l.href} className="hover:text-yellow transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        {/* Bottom Copyright & Back-to-Top Strip */}
        <div className="relative z-[2] mt-4 border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-[13px] text-[#8C867D] text-center sm:text-left">
          <span>
            © 2026 House Electric. All rights reserved.
            {gstin && (
              <>
                <span className="hidden sm:inline"> · </span>
                <span className="block sm:inline text-[12px]">GSTIN: {gstin}</span>
              </>
            )}
          </span>

          <div className="flex items-center gap-4">
            <a
              href="https://www.nexa-solutions.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="group text-[12px] text-[#8C867D] transition-colors"
            >
              Developed by{" "}
              <span className="font-bold text-yellow transition-colors group-hover:text-yellow-dark">
                Nexa Solutions
              </span>
            </a>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold text-white hover:border-yellow hover:bg-yellow hover:text-ink transition-all"
            >
              <span>Back to Top</span>
              <Arrow className="h-3.5 w-3.5 -rotate-90" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
