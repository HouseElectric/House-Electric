"use client";

import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import { supabase } from "@/lib/supabase";

function BeforeAfterSlider({ item }) {
  const [pos, setPos] = useState(50);

  return (
    <div className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-2xl border border-line/80 shadow-sm">
      <img src={item.after_image_url} alt={item.title ? `${item.title} — after` : "After"} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0 h-full overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={item.before_image_url} alt={item.title ? `${item.title} — before` : "Before"} className="h-full w-full object-cover" draggable={false} />
      </div>

      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)]" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-lg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M8 7 4 12l4 5M16 7l4 5-4 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Drag to compare before and after"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white">Before</span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white">After</span>

      {item.title && (
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white">
          {item.title}
        </span>
      )}
    </div>
  );
}

export default function HomeBeforeAfter() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("before_after_photos")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true })
        .limit(4);
      setItems(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (!loading && items.length === 0) return null;
  if (loading) return null;

  return (
    <section className="py-16 md:py-[80px]">
      <div className="mx-auto max-w-wrap px-6">
        <Reveal className="mb-10 max-w-[62ch]">
          <p className="eyebrow">Real Results</p>
          <h2 className="text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold leading-tight">
            See The <span className="text-yellow">Difference</span> — Drag to Compare
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.08}>
              <BeforeAfterSlider item={item} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
