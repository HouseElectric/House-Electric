"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PinIcon, SearchIcon, WhatsAppIcon, CheckCircle, Arrow } from "@/components/icons";

export default function LocalityExplorer({ areas, city, state, whatsapp }) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  const filteredAreas = areas.filter((a) =>
    a.toLowerCase().includes(search.toLowerCase().trim())
  );

  const getWaLink = (areaName) => {
    const msg = encodeURIComponent(
      `Hello House Electric, I am located in ${areaName}, ${city}. Is an electrician available right now?`
    );
    return `https://wa.me/${whatsapp}?text=${msg}`;
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search your locality in ${city}... (e.g. Vijay Nagar, Napier Town)`}
            className="w-full rounded-xl border border-line/80 bg-cream/30 pl-11 pr-4 py-3 text-sm text-ink placeholder:text-[#9A9285] focus:border-yellow focus:bg-white focus:outline-none focus:ring-4 focus:ring-yellow/20 transition-all"
          />
        </div>

        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs font-bold text-charcoal/60 hover:text-ink underline self-end sm:self-center"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Locality Grid */}
      {filteredAreas.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAreas.map((a, i) => (
            <motion.div
              key={a}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              whileHover={{ y: -3 }}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-line/80 bg-white p-4 shadow-sm transition-all duration-300 hover:border-yellow/60 hover:shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-yellow/15 text-yellow-dark transition-colors group-hover:bg-yellow group-hover:text-ink">
                  <PinIcon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-[14.5px] font-extrabold text-ink group-hover:text-yellow-dark transition-colors">
                    {a}
                  </h4>
                  <p className="text-[11.5px] font-bold text-emerald-600 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Coverage Active
                  </p>
                </div>
              </div>

              <a
                href={getWaLink(a)}
                target="_blank"
                rel="noopener noreferrer"
                title={`Check availability in ${a}`}
                className="inline-flex items-center gap-1 rounded-xl bg-cream border border-line px-3 py-2 text-xs font-bold text-ink hover:bg-yellow hover:border-yellow transition-all"
              >
                <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-600 group-hover:text-ink" />
                <span className="hidden xs:inline">Book</span>
              </a>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-cream/40 p-8 text-center">
          <PinIcon className="mx-auto mb-3 h-8 w-8 text-charcoal/40" />
          <h4 className="mb-1 text-base font-extrabold text-ink">Locality not found in quick list</h4>
          <p className="mx-auto max-w-[42ch] text-xs text-charcoal/70 mb-4">
            We regularly serve areas around {city}. Message our dispatch team directly to check instant service to your address.
          </p>
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
              `Hello House Electric, I am located in ${search}, ${city}. Do you provide service here?`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-yellow px-5 py-2.5 text-xs font-extrabold text-ink shadow-md hover:bg-yellow-dark"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Check &quot;{search}&quot; Coverage on WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
