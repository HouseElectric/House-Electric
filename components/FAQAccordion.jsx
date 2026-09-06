"use client";

import { useState } from "react";
import { ChevronDown } from "./icons";

export default function FAQAccordion({ items, defaultOpen = 0 }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="h-fit divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className={isOpen ? "bg-cream/40" : ""}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-cream/30"
            >
              <span className={`text-[14.5px] font-bold ${isOpen ? "text-yellow-dark" : "text-ink"}`}>{item.q}</span>
              <span
                className={`grid h-7 w-7 flex-none place-items-center rounded-full transition-colors ${
                  isOpen ? "bg-yellow text-ink" : "bg-cream text-body"
                }`}
              >
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-5 text-[14px] leading-relaxed text-body">{item.a}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
