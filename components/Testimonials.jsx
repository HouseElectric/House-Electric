"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Reveal from "./Reveal";
import { supabase } from "@/lib/supabase";

const GOOGLE_STAR_COLOR = "#FBBC04";
const AVATAR_COLORS = ["#F2B01E", "#4285F4", "#34A853", "#EA4335", "#8E44AD", "#16A085"];

function GoogleLogo({ className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

function StarRow({ rating = 5, size = "h-3.5 w-3.5" }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={size} fill={i < Math.round(rating) ? GOOGLE_STAR_COLOR : "#E8E4DC"}>
          <path d="M10 1.5l2.6 5.4 5.9.7-4.4 4.1 1.2 5.8L10 14.8l-5.3 2.7 1.2-5.8L1.5 7.6l5.9-.7z" />
        </svg>
      ))}
    </div>
  );
}

function initials(name) {
  const parts = (name || "").trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

function avatarColor(name) {
  const code = (name || "").charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [googleMeta, setGoogleMeta] = useState({ rating: null, reviewCount: null, profileUrl: "" });
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const [{ data: rows }, { data: settingsRow }] = await Promise.all([
        supabase.from("testimonials").select("*").eq("published", true).order("created_at", { ascending: false }).limit(12),
        supabase.from("site_settings").select("data").eq("key", "google_reviews").maybeSingle(),
      ]);
      setReviews(rows ?? []);
      if (settingsRow?.data) setGoogleMeta(settingsRow.data);
      setLoading(false);
    })();
  }, []);

  const total = reviews.length;
  const step = isDesktop ? 3 : 1;
  const pageCount = isDesktop ? Math.ceil(total / 3) : total;

  const scrollToCard = (index) => {
    if (total === 0) return;
    const nextIndex = (index + total) % total;
    setCurrentIndex(nextIndex);
    if (scrollRef.current) {
      const container = scrollRef.current;
      const card = container.children[nextIndex];
      if (card) {
        const targetLeft = card.offsetLeft - container.offsetLeft;
        container.scrollTo({ left: targetLeft, behavior: "smooth" });
      }
    }
  };

  const go = (dir) => scrollToCard(currentIndex + dir * step);

  // Auto-swipe timer
  useEffect(() => {
    if (isPaused || total <= step) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + step) % total;
        if (scrollRef.current) {
          const container = scrollRef.current;
          const card = container.children[next];
          if (card) {
            const targetLeft = card.offsetLeft - container.offsetLeft;
            container.scrollTo({ left: targetLeft, behavior: "smooth" });
          }
        }
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, total, step]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.children[0]?.offsetWidth || 300;
    const newIndex = Math.round(scrollLeft / (cardWidth + 20));
    if (newIndex >= 0 && newIndex < total && newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const activeDotIndex = isDesktop ? Math.floor(currentIndex / 3) : currentIndex;

  if (loading || total === 0) return null;

  return (
    <section className="pb-16 md:pb-[74px]" id="testimonials">
      <div className="mx-auto max-w-wrap px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <Reveal>
            <p className="eyebrow">Reviews</p>
            <h2 className="text-[clamp(1.6rem,3vw,2.35rem)] font-extrabold">What Our Customers Say</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">Real people. Real experiences.</p>
          </Reveal>

          <div className="flex items-center gap-4">
            {googleMeta.rating && (
              <div className="hidden items-center gap-3 rounded-2xl border border-line bg-white px-4 py-2.5 shadow-sm sm:flex">
                <GoogleLogo className="h-7 w-7 flex-none" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <b className="text-[17px] font-extrabold leading-none text-ink">{googleMeta.rating}</b>
                    <StarRow rating={googleMeta.rating} size="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[11px] text-body">
                    {googleMeta.reviewCount ? `${googleMeta.reviewCount} Google reviews` : "Google Reviews"}
                  </span>
                </div>
              </div>
            )}

            {total > step && (
              <div className="flex gap-2.5">
                <button
                  onClick={() => go(-1)}
                  aria-label="Previous testimonial"
                  className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white shadow-sm transition-all hover:bg-yellow hover:border-yellow active:scale-95"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2.4" className="h-4 w-4">
                    <path d="M19 12H5M11 6l-6 6 6 6" />
                  </svg>
                </button>
                <button
                  onClick={() => go(1)}
                  aria-label="Next testimonial"
                  className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white shadow-sm transition-all hover:bg-yellow hover:border-yellow active:scale-95"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2.4" className="h-4 w-4">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="relative"
        >
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth p-2 pb-6 md:gap-6 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {reviews.map((r, i) => (
              <motion.article
                key={r.id}
                whileHover={{ y: -5 }}
                className={`flex w-[85vw] max-w-[340px] shrink-0 snap-start flex-col rounded-2xl border border-line/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-yellow/50 hover:shadow-xl md:w-[calc((100%-3rem)/3)] md:max-w-none md:p-7 ${
                  i >= currentIndex && i < currentIndex + step ? "ring-2 ring-yellow/40" : ""
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {r.avatar_url ? (
                      <img src={r.avatar_url} alt={r.name} className="h-10 w-10 flex-none rounded-full object-cover" />
                    ) : (
                      <span
                        className="grid h-10 w-10 flex-none place-items-center rounded-full text-[13px] font-extrabold text-white"
                        style={{ background: avatarColor(r.name) }}
                      >
                        {initials(r.name)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <b className="block truncate text-[13.5px] font-extrabold text-ink">{r.name}</b>
                      {r.role && <span className="block truncate text-[11.5px] text-body">{r.role}</span>}
                    </div>
                  </div>
                  <GoogleLogo className="h-5 w-5 flex-none opacity-80" />
                </div>
                <StarRow rating={r.rating} />
                <p className="mt-3 min-h-[72px] flex-1 text-[13.5px] leading-relaxed text-ink-soft">{r.text}</p>
              </motion.article>
            ))}
          </div>

          {pageCount > 1 && (
            <div className="mt-2 flex items-center justify-center gap-2">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToCard(isDesktop ? i * 3 : i)}
                  aria-label={`Go to testimonial slide ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === activeDotIndex ? "w-8 bg-yellow shadow-sm" : "w-2.5 bg-line hover:bg-yellow/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {googleMeta.profileUrl && (
          <Reveal className="mt-6 text-center">
            <a
              href={googleMeta.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-md border border-line bg-white px-6 py-3.5 text-[13.5px] font-extrabold text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-ink"
            >
              <GoogleLogo className="h-5 w-5 flex-none" />
              View All Reviews on Google
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}
