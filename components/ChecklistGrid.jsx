"use client";

import { motion } from "framer-motion";

export default function ChecklistGrid({ items, columns = 3 }) {
  const colClass =
    columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 gap-3.5 ${colClass}`}>
      {items.map((item, i) => (
        <motion.div
          key={item}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.35, delay: (i % 6) * 0.04 }}
          whileHover={{ y: -2 }}
          className="group flex items-center gap-4 rounded-xl border border-line/80 bg-white px-6 py-4 shadow-sm transition-all duration-200 hover:border-yellow/60 hover:bg-[#FDFBF7] hover:shadow-md"
        >
          <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-yellow/15 text-yellow-dark transition-colors group-hover:bg-yellow group-hover:text-ink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" className="h-3.5 w-3.5">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="text-[14.5px] font-extrabold text-ink transition-colors group-hover:text-yellow-dark">
            {item}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
