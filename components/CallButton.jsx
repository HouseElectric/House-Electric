"use client";

import { motion } from "framer-motion";
import { PhoneIcon } from "./icons";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function CallButton() {
  const { phone } = useSiteSettings();
  return (
    <motion.a
      href={`tel:${phone.replace(/\s+/g, "")}`}
      aria-label={`Call ${phone}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.8, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="group fixed bottom-[88px] right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-ink text-white shadow-[0_10px_30px_-6px_rgba(20,20,20,0.5)] md:bottom-[92px] md:right-6"
    >
      <PhoneIcon className="h-6 w-6" />

      {/* Hover Tooltip */}
      <span className="pointer-events-none absolute right-full mr-3 translate-x-2 whitespace-nowrap rounded-xl border border-white/20 bg-ink/95 px-3.5 py-1.5 text-xs font-extrabold text-white opacity-0 shadow-2xl backdrop-blur-md transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 flex items-center gap-1.5">
        <span>Call House Electric</span>
        <span className="text-[10px] text-yellow">({phone})</span>
      </span>
    </motion.a>
  );
}
