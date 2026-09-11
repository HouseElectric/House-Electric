"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { AmcBadge, CheckCircle, InboxIcon, ReportIcon } from "@/components/icons";

const POINTS = [
  { icon: InboxIcon, text: "Track every service request in real time" },
  { icon: ReportIcon, text: "View, accept & pay quotations and invoices online" },
  { icon: AmcBadge, text: "Manage your AMC plan & renewal dates" },
  { icon: CheckCircle, text: "One account for your entire service history" },
];

export default function AuthShowcase() {
  return (
    <div className="relative hidden overflow-hidden bg-[#0B0B0C] lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-14 xl:px-16">
      <motion.div
        animate={{ opacity: [0.4, 0.65, 0.4], scale: [1, 1.08, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="glow-blob left-[-10%] top-[-10%] h-[340px] w-[340px] bg-yellow/20 blur-[110px]"
      />
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="glow-blob right-[-15%] bottom-[-10%] h-[300px] w-[300px] bg-amber-500/10 blur-[100px]"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-[1]"
      >
        <span className="inline-flex items-center rounded-xl bg-white p-2.5 shadow-lg">
          <Image src="/logo.jpg" alt="House Electric" width={240} height={60} className="h-7 w-auto object-contain" />
        </span>
      </motion.div>

      <div className="relative z-[1] max-w-md">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-yellow"
        >
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-yellow"
          />
          Customer Portal
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="mb-4 text-[2rem] font-extrabold leading-[1.15] text-white xl:text-[2.3rem]"
        >
          Manage Every Electrical Service, <span className="text-yellow">In One Place.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mb-9 text-[14.5px] leading-relaxed text-white/55"
        >
          From service requests to AMC renewals — track everything from your personal House Electric
          dashboard.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } } }}
          className="space-y-4"
        >
          {POINTS.map((p) => (
            <motion.div
              key={p.text}
              variants={{ hidden: { opacity: 0, x: -14 }, visible: { opacity: 1, x: 0 } }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="group flex items-center gap-3.5"
            >
              <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-white/[0.06] text-yellow ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-yellow/15 group-hover:ring-yellow/30">
                <p.icon className="h-4 w-4" />
              </span>
              <span className="text-[13.5px] font-semibold text-white/80">{p.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative z-[1] text-[12px] font-medium text-white/35"
      >
        © 2026 House Electric. All rights reserved.
      </motion.p>
    </div>
  );
}
