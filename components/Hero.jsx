"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  Arrow,
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

const bottomMetrics = [
  { icon: UsersIcon, val: "500+", label: "Happy Clients" },
  { icon: StarIcon, val: "4.9/5", label: "Client Rating" },
  { icon: ShieldIcon, val: "100%", label: "Safety First" },
  { icon: PinIcon, val: "Local", label: "Trusted Team" },
];

const AUTOPLAY_MS = 6000;

export default function Hero() {
  const { heroSlides: slides } = useHomeContent();
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
      {/* Subtle Background Blobs */}
      <div className="glow-blob left-[-10%] top-[-10%] h-[360px] w-[360px] bg-yellow/15 opacity-40" />
      <div className="glow-blob right-[-5%] top-[20%] h-[300px] w-[300px] bg-amber-400/10 opacity-30" />

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
                  <div className="inline-flex items-center gap-2 rounded-full border border-yellow/40 bg-yellow/15 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-yellow-dark">
                    <span className="h-2 w-2 rounded-full bg-yellow shadow-[0_0_8px_rgba(242,176,30,0.9)] animate-pulse" />
                    <span>{slide.eyebrow || "REPAIR & INSTALLATION EXPERTS"}</span>
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
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-line/90 bg-white/90 px-4 py-3.5 text-xs sm:text-sm font-bold text-ink shadow-sm transition-colors hover:border-ink hover:bg-white sm:px-7 whitespace-nowrap text-center"
                  >
                    {slide.secondaryLabel}
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Horizontal Trust Card Bar (3 Badges) */}
            <div className="rounded-2xl border border-line/80 bg-white p-2.5 sm:p-3 shadow-md grid grid-cols-3 divide-x divide-line/70">
              {trustBadges.map((b) => (
                <div key={b.title} className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 px-1 py-1 text-center sm:text-left">
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-yellow/15 text-yellow-dark">
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
                <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-yellow text-ink shadow-md">
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

              {/* Slide Indicators (Dots) */}
              <div className="absolute bottom-3.5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Show slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === index ? "w-7 bg-yellow" : "w-2 bg-white/70 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom 4-Column Stats Strip */}
        <div className="mt-6 grid grid-cols-4 gap-2 rounded-2xl border border-line/80 bg-white p-3.5 sm:p-4 shadow-sm divide-x divide-line/60">
          {bottomMetrics.map((m) => (
            <div key={m.label} className="flex flex-col items-center justify-center text-center px-1">
              <m.icon className="mb-1 h-4 w-4 text-yellow-dark" />
              <b className="text-sm sm:text-base font-black text-ink leading-tight">{m.val}</b>
              <span className="text-[9.5px] sm:text-[11px] font-bold text-charcoal/60 uppercase tracking-wide">
                {m.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
