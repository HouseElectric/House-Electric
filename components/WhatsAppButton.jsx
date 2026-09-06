"use client";

import { motion } from "framer-motion";
import { WhatsAppIcon } from "./icons";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const MESSAGE = encodeURIComponent(
  "Hello House Electric, I need electrical service. My location is __. My requirement is __."
);

export default function WhatsAppButton() {
  const { whatsapp } = useSiteSettings();
  return (
    <motion.a
      href={`https://wa.me/${whatsapp}?text=${MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="group fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.6)] md:bottom-6 md:right-6"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping [animation-duration:2.2s]" />
      <WhatsAppIcon className="relative h-7 w-7" />

      {/* Hover Tooltip */}
      <span className="pointer-events-none absolute right-full mr-3 translate-x-2 whitespace-nowrap rounded-xl border border-emerald-400/30 bg-[#082917]/95 px-3.5 py-1.5 text-xs font-extrabold text-white opacity-0 shadow-2xl backdrop-blur-md transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>WhatsApp House Electric</span>
      </span>
    </motion.a>
  );
}
