"use client";

import { useRef, useState } from "react";
import { useEffect } from "react";
import Reveal from "./Reveal";
import { supabase } from "@/lib/supabase";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";

function BeforeAfterSlider({ item }) {
  const [pos, setPos] = useState(50);
  const trackRef = useRef(null);
  const dragging = useRef(false);

  const setFromClientX = (clientX) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      if (e.touches) e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setFromClientX(clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  return (
    <div
      ref={trackRef}
      className="group relative aspect-[3/2] w-full touch-none select-none overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_45px_-20px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-yellow/40 hover:shadow-[0_28px_55px_-18px_rgba(242,176,30,0.35)]"
      onMouseDown={(e) => {
        dragging.current = true;
        setFromClientX(e.clientX);
      }}
      onTouchStart={(e) => {
        dragging.current = true;
        setFromClientX(e.touches[0].clientX);
      }}
    >
      <img
        src={item.after_image_url}
        alt={item.title ? `${item.title} — after` : "After"}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div
        className="pointer-events-none absolute inset-0 h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img
          src={item.before_image_url}
          alt={item.title ? `${item.title} — before` : "Before"}
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      {/* Divider + drag handle */}
      <div className="pointer-events-none absolute inset-y-0 w-[3px] bg-gradient-to-b from-white/20 via-white to-white/20 shadow-[0_0_12px_rgba(255,255,255,0.6)]" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full bg-white text-ink shadow-[0_8px_20px_-4px_rgba(0,0,0,0.6)] ring-4 ring-white/30 transition-transform duration-200 group-hover:scale-110">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
            <path d="M8 7 4 12l4 5M16 7l4 5-4 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-sm">
        Before
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-yellow px-2.5 py-1 text-[11px] font-bold text-ink shadow-[0_4px_14px_-2px_rgba(242,176,30,0.7)]">
        After
      </span>
    </div>
  );
}

export default function HomeBeforeAfter() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);

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
        .order("display_order", { ascending: true });
      setItems(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (!loading && items.length === 0) return null;
  if (loading) return null;

  // Scrolls by exactly one card's width (+ gap), whatever the current breakpoint's
  // card width happens to be — 1 card visible on mobile, 3 on desktop.
  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const amount = (card?.offsetWidth || el.clientWidth) + 24;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-[#0B1220] py-16 md:py-[80px]">
      {/* Ambient glows to match the site's dark-section treatment */}
      <div className="glow-blob left-[-8%] top-[-10%] h-[320px] w-[320px] bg-yellow/10 opacity-40" />
      <div className="glow-blob right-[-6%] bottom-[-15%] h-[300px] w-[300px] bg-amber-500/10 opacity-30" />

      <div className="relative z-[1] mx-auto max-w-wrap px-6">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-[60ch]">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-yellow">Real Results</p>
            <h2 className="text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold leading-tight text-white">
              Before &amp;{" "}
              <span className="relative inline-block text-yellow">
                After
                <span className="absolute -bottom-0.5 left-0 h-[3px] w-full rounded-full bg-yellow/50" />
              </span>
            </h2>
            <p className="mt-2 text-[14.5px] text-white/60">Real transformations. Real results. Drag to compare.</p>
          </div>

          <div className="flex flex-none items-center gap-2.5">
            <button
              onClick={() => scrollByCard(-1)}
              aria-label="Previous"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-yellow hover:bg-yellow hover:text-ink hover:shadow-[0_10px_24px_-8px_rgba(242,176,30,0.6)] active:scale-95"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollByCard(1)}
              aria-label="Next"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-yellow hover:bg-yellow hover:text-ink hover:shadow-[0_10px_24px_-8px_rgba(242,176,30,0.6)] active:scale-95"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </Reveal>

        {/* Scroll-snap carousel: 1 card visible on mobile, 3 on desktop — swipeable
            by touch, and the arrows above scroll by exactly one card either way. */}
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              data-card
              className="w-full flex-none snap-start sm:w-[calc(50%-12px)] lg:w-[calc((100%-48px)/3)]"
            >
              <Reveal delay={i * 0.05}>
                <BeforeAfterSlider item={item} />
                {item.title && (
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[14px] font-bold text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow" />
                    {item.title}
                  </p>
                )}
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
