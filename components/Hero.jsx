"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  Arrow,
  AwardIcon,
  BoltBadge,
  CheckCircle,
  ClockIcon,
  PinIcon,
  ShieldIcon,
  StarIcon,
  UsersIcon,
} from "./icons";
import { useHomeContent } from "@/contexts/HomeContentContext";

const trustBadges = [
  { icon: ShieldIcon, title: "Certified Experts" },
  { icon: ClockIcon, title: "On-Time Service" },
  { icon: CheckCircle, title: "Safe & Compliant" },
];

const METRIC_ICON_MAP = { users: UsersIcon, star: StarIcon, shield: ShieldIcon, pin: PinIcon, award: AwardIcon, check: CheckCircle };

const AUTOPLAY_MS = 6000;

export default function Hero() {
  const { heroSlides: slides, heroMetrics, heroMetricsVisible } = useHomeContent();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[Math.min(index, slides.length - 1)];
  const isLocal = slide.image?.startsWith("/");

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5] py-6 sm:py-10 md:py-16" id="top">
      {/* Subtle dot-grid texture for depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{ backgroundImage: "radial-gradient(circle, rgba(20,20,20,0.08) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
      />
      {/* Subtle Background Blobs */}
      <div className="glow-blob left-[-10%] top-[-10%] h-[360px] w-[360px] bg-yellow/15 opacity-40" />
      <div className="glow-blob right-[-5%] top-[20%] h-[300px] w-[300px] bg-amber-400/10 opacity-30" />
      <div className="glow-blob right-[8%] bottom-[-8%] h-[260px] w-[260px] bg-yellow/10 opacity-30" />

      <div className="relative z-[1] mx-auto max-w-wrap px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_1.1fr] md:gap-10">
          
          {/* Left Column: Text & Actions */}
          <div className="relative pt-2 pb-2 sm:py-6">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Top Badge + Cursive Accent */}
                <div className="mb-3.5 flex items-center justify-between gap-2">
                  <div className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-yellow/40 bg-yellow/15 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-yellow-dark shadow-[0_2px_10px_-4px_rgba(242,176,30,0.5)]">
                    <span className="h-2 w-2 rounded-full bg-yellow shadow-[0_0_8px_rgba(242,176,30,0.9)] animate-pulse" />
                    <span className="relative z-[1]">{slide.eyebrow || "REPAIR & INSTALLATION EXPERTS"}</span>
                    <span className="pointer-events-none absolute inset-y-0 left-[-60%] w-[40%] -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/60 to-transparent [animation:hero-badge-sheen_3.5s_ease-in-out_infinite]" />
                  </div>

                  <span className="hidden xs:inline-block font-script text-sm font-bold text-charcoal/60 -rotate-3">
                    Powering Safer Spaces ⚡
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="mb-4 font-black tracking-tight text-ink text-[1.95rem] leading-[1.12] sm:text-[2.6rem] md:text-[3.2rem]">
                  {slide.titleLine1}{" "}
                  <span className="block">{slide.titleLine2}</span>
                  <span className="relative inline-block text-yellow mt-1">
                    <span className="absolute -inset-x-3 -inset-y-1 -z-[1] rounded-full bg-yellow/25 blur-xl" />
                    {slide.titleHighlight}
                    <svg
                      viewBox="0 0 286 14"
                      fill="none"
                      className="absolute -bottom-1.5 left-0 h-2.5 w-full text-yellow opacity-80"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M2 10C50 4 150 3 284 10"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="mb-6 max-w-[46ch] text-[14.5px] leading-relaxed text-charcoal/80 sm:text-[16px]">
                  {slide.subtitle}
                </p>

                {/* 1-Line Side-by-Side Action Buttons */}
                <div className="mb-6 flex items-center gap-2.5 sm:gap-3">
                  <a
                    href={slide.primaryHref}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-yellow px-4 py-3.5 text-xs sm:text-sm font-extrabold text-ink shadow-[0_10px_25px_-5px_rgba(242,176,30,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark sm:px-7 whitespace-nowrap text-center"
                  >
                    <span>{slide.primaryLabel}</span>
                  </a>
                  <a
                    href={slide.secondaryHref}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-line/90 bg-white/90 px-4 py-3.5 text-xs sm:text-sm font-bold text-ink shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-yellow hover:bg-white hover:shadow-[0_10px_25px_-8px_rgba(242,176,30,0.4)] sm:px-7 whitespace-nowrap text-center"
                  >
                    {slide.secondaryLabel}
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Horizontal Trust Card Bar (3 Badges) */}
            <div className="rounded-2xl border border-line/80 bg-white p-2.5 sm:p-3 shadow-md grid grid-cols-3 divide-x divide-line/70">
              {trustBadges.map((b) => (
                <div
                  key={b.title}
                  className="group flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 rounded-xl px-1 py-1.5 text-center sm:text-left transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow/5"
                >
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-yellow/15 text-yellow-dark transition-all duration-300 group-hover:scale-110 group-hover:bg-yellow group-hover:text-ink group-hover:shadow-[0_6px_16px_-4px_rgba(242,176,30,0.6)]">
                    <b.icon className="h-4 w-4" strokeWidth="2" />
                  </span>
                  <span className="text-[10.5px] sm:text-xs font-extrabold text-ink leading-tight">
                    {b.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Image Frame with Floating 24/7 Support Badge */}
          <div className="relative w-full">
            {/* Soft gradient ring glow behind the frame */}
            <div className="absolute -inset-3 -z-[1] rounded-[2rem] bg-gradient-to-br from-yellow/30 via-amber-300/10 to-transparent opacity-70 blur-xl" />
            {/* Corner accent frames (outside the clipped image box) */}
            <span className="pointer-events-none absolute -right-1.5 -top-1.5 z-[5] h-10 w-10 rounded-tr-2xl border-r-[3px] border-t-[3px] border-yellow/70" />
            <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 z-[5] h-10 w-10 rounded-bl-2xl border-b-[3px] border-l-[3px] border-yellow/70" />

            <div className="relative aspect-[4/3.2] sm:aspect-[4/3] md:aspect-[4/3.6] w-full overflow-hidden rounded-2xl md:rounded-3xl border border-line/80 shadow-2xl bg-white">
              <AnimatePresence mode="sync">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  {isLocal ? (
                    <Image
                      src={slide.image}
                      alt={slide.alt}
                      fill
                      priority={index === 0}
                      className="object-cover"
                    />
                  ) : (
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Floating Badge (Top-Left): 24/7 Electrical Support */}
              <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-3 rounded-2xl border border-white/40 bg-white/95 p-3 shadow-xl backdrop-blur-md max-w-[210px] sm:max-w-[240px]">
                <span className="relative grid h-9 w-9 flex-none place-items-center rounded-xl bg-yellow text-ink shadow-md">
                  <span className="absolute inset-0 -z-[1] animate-ping rounded-xl bg-yellow/60 [animation-duration:2.2s]" />
                  <BoltBadge className="h-5 w-5" />
                </span>
                <div>
                  <b className="block text-xs font-extrabold text-ink leading-snug">
                    24/7 Electrical Support
                  </b>
                  <span className="block text-[10.5px] font-medium text-charcoal/70">
                    Available when you need us
                  </span>
                </div>
              </div>

              {/* Slide Indicators (progress-fill dots) */}
              <div className="absolute bottom-3.5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Show slide ${i + 1}`}
                    className={`relative h-2 overflow-hidden rounded-full bg-white/50 transition-all duration-300 ${
                      i === index ? "w-8" : "w-2 hover:bg-white/80"
                    }`}
                  >
                    {i === index && (
                      <span
                        key={index}
                        className="absolute inset-0 origin-left rounded-full bg-yellow [animation:hero-dot-fill_6s_linear]"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom 4-Column Stats Strip */}
        {heroMetricsVisible && heroMetrics?.length > 0 && (
          <div className="mt-6 grid grid-cols-4 gap-2 rounded-2xl border border-line/80 bg-white p-3.5 shadow-sm sm:gap-3 sm:p-4">
            {heroMetrics.map((m) => {
              const Icon = METRIC_ICON_MAP[m.icon] || UsersIcon;
              return (
                <div
                  key={m.label}
                  className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl px-1 py-2 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-b hover:from-yellow/10 hover:to-transparent"
                >
                  <span className="pointer-events-none absolute inset-x-3 top-0 h-[2px] scale-x-0 rounded-full bg-yellow transition-transform duration-300 group-hover:scale-x-100" />
                  <span className="mb-1.5 grid h-8 w-8 place-items-center rounded-full bg-yellow/15 text-yellow-dark transition-all duration-300 group-hover:scale-110 group-hover:bg-yellow group-hover:text-ink group-hover:shadow-[0_6px_16px_-4px_rgba(242,176,30,0.6)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <b className="text-sm sm:text-base font-black text-ink leading-tight">{m.val}</b>
                  <span className="text-[9.5px] sm:text-[11px] font-bold text-charcoal/60 uppercase tracking-wide">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
