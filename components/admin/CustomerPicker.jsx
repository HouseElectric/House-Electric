"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, SearchIcon } from "@/components/icons";

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
];

export function avatarGradient(seed) {
  const idx = (seed?.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

export default function CustomerPicker({ customers, value, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const selected = customers.find((c) => c.id === value);

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = customers.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [c.name, c.email, c.mobile].some((v) => v?.toLowerCase().includes(q));
  });

  return (
    <div ref={wrapRef} className="relative">
      {selected && !open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setQuery("");
          }}
          className="flex w-full items-center gap-2.5 rounded-md border border-line px-3 py-2.5 text-left text-[13.5px] outline-none transition-colors hover:border-ink/40"
        >
          {selected.avatar_url ? (
            <img src={selected.avatar_url} alt="" className="h-7 w-7 flex-none rounded-full object-cover" />
          ) : (
            <span
              className={`grid h-7 w-7 flex-none place-items-center rounded-full bg-gradient-to-br text-[11px] font-extrabold text-white ${avatarGradient(
                selected.name || selected.email
              )}`}
            >
              {(selected.name || selected.email || "?").charAt(0).toUpperCase()}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate">
            <span className="font-bold text-ink">{selected.name || "Unnamed"}</span>
            {selected.email && <span className="ml-1.5 text-body">{selected.email}</span>}
          </span>
          <ChevronDown className="h-4 w-4 flex-none text-body/60" />
        </button>
      ) : (
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body/60" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search by name, email or mobile…"
            className="w-full rounded-md border border-ink px-3 py-2.5 pl-9 text-[13.5px] outline-none"
          />
        </div>
      )}

      {open && (
        <div className="absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-lg border border-line bg-white shadow-xl">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-[13px] text-body">No customers found.</div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                  setQuery("");
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] transition-colors hover:bg-cream/60 ${
                  c.id === value ? "bg-cream/40" : ""
                }`}
              >
                {c.avatar_url ? (
                  <img src={c.avatar_url} alt="" className="h-8 w-8 flex-none rounded-full object-cover" />
                ) : (
                  <span
                    className={`grid h-8 w-8 flex-none place-items-center rounded-full bg-gradient-to-br text-[11px] font-extrabold text-white ${avatarGradient(
                      c.name || c.email
                    )}`}
                  >
                    {(c.name || c.email || "?").charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-ink">{c.name || "Unnamed"}</span>
                  <span className="block truncate text-[11.5px] text-body">
                    {c.email}
                    {c.mobile ? ` · ${c.mobile}` : ""}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
