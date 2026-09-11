"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { HomeIcon, PhoneIcon, BoltBadge, WrenchIcon } from "@/components/icons";
import { SiteSettingsProvider, useSiteSettings } from "@/contexts/SiteSettingsContext";

// Root-level not-found.jsx sits outside app/(site)/layout.jsx, so it isn't already
// wrapped by SiteSettingsProvider — wrap it here so the phone number below still
// comes from live Contact Settings instead of being hardcoded.
function CallUsLink() {
  const { phone } = useSiteSettings();
  return (
    <a
      href={`tel:${phone.replace(/\s+/g, "")}`}
      className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-transparent px-6 py-3.5 text-sm font-bold text-white/80 transition-all hover:border-white/40 hover:text-white"
    >
      <PhoneIcon className="h-4 w-4 text-yellow" />
      Call Us
    </a>
  );
}

export default function NotFound() {
  return (
    <SiteSettingsProvider>
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0F0F11] px-4 py-16 text-center text-white">
      {/* Ambient glow blobs */}
      <motion.div
        animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="glow-blob left-[10%] top-[-10%] h-[280px] w-[280px] bg-yellow/25 blur-[100px]"
      />
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.12, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="glow-blob right-[5%] bottom-[-15%] h-[260px] w-[260px] bg-amber-500/20 blur-[100px]"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 25%, #F2B01E 0%, transparent 40%), radial-gradient(circle at 85% 75%, #F2B01E 0%, transparent 40%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:3rem_3rem]"
        aria-hidden="true"
      />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <Link href="/" className="relative z-10 mb-10 inline-flex items-center">
          <span className="inline-flex items-center rounded-xl bg-white p-2 shadow-lg">
            <Image src="/logo.jpg" alt="House Electric" width={200} height={50} className="h-8 w-auto object-contain" />
          </span>
        </Link>
      </motion.div>

      <div className="relative z-10 flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-red-400/30 bg-red-500/10 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-red-300"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
          Error Code 404
        </motion.span>

        {/* Flickering bolt badge */}
        <div className="relative mb-6">
          <motion.span
            animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.6, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-3xl bg-yellow/40 blur-md"
          />
          <motion.span
            animate={{ opacity: [1, 0.35, 1, 1, 0.5, 1], scale: [1, 0.97, 1, 1, 0.98, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", times: [0, 0.1, 0.15, 0.6, 0.68, 1] }}
            className="relative grid h-20 w-20 place-items-center rounded-3xl bg-yellow text-ink shadow-[0_16px_40px_-10px_rgba(242,176,30,0.7)]"
          >
            <BoltBadge className="h-10 w-10" />
          </motion.span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[88px] font-black leading-none tracking-tight text-white sm:text-[120px]"
        >
          4
          <span className="text-yellow drop-shadow-[0_0_28px_rgba(242,176,30,0.65)]">0</span>4
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-2 text-xl font-black text-white sm:text-2xl"
        >
          Looks Like This Circuit Tripped
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-3 max-w-md text-sm text-white/60 sm:text-[15px]"
        >
          The page you're looking for has either been moved, renamed, or never existed.
          Let's get you rewired to safety.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-yellow px-6 py-3.5 text-sm font-black text-ink shadow-lg shadow-yellow/20 transition-all hover:-translate-y-0.5 hover:bg-yellow-dark"
          >
            <HomeIcon className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/account/requests/new"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/15"
          >
            <WrenchIcon className="h-4 w-4 text-yellow" />
            Raise Service Request
          </Link>
          <CallUsLink />
        </motion.div>
      </div>
    </main>
    </SiteSettingsProvider>
  );
}
