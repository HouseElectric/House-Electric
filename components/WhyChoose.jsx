"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Reveal from "./Reveal";
import { ClockIcon, NetworkIcon, ShieldIcon, UsersIcon } from "./icons";
import { useHomeContent } from "@/contexts/HomeContentContext";

const FEATURE_ICONS = [UsersIcon, ShieldIcon, ClockIcon, NetworkIcon];

export default function WhyChoose() {
  const { whyChoose: wc } = useHomeContent();
  const features = wc.features.map((f, i) => ({ ...f, icon: FEATURE_ICONS[i] }));
  const isLocal = wc.promoImage?.startsWith("/");

  return (
    <section className="py-16 md:py-[74px]" id="why">
      <div className="mx-auto grid max-w-wrap grid-cols-1 items-center gap-10 px-6 md:grid-cols-[1.4fr_1fr] md:gap-12">
        <div>
          <Reveal>
            <p className="eyebrow">{wc.eyebrow}</p>
            <h2 className="mb-3 text-[clamp(1.6rem,3vw,2.35rem)] font-extrabold">{wc.title}</h2>
            <p className="max-w-[50ch] text-[15px] leading-relaxed text-ink-soft">{wc.subtitle}</p>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                className="group rounded-xl border border-line/80 bg-cream/40 p-5 transition-all duration-300 hover:border-yellow/60 hover:bg-white hover:shadow-soft"
              >
                <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-yellow/15 text-ink ring-1 ring-yellow/30 transition-colors group-hover:bg-yellow">
                  <f.icon className="h-5 w-5 text-ink" strokeWidth="1.8" />
                </span>
                <b className="mb-1 block text-[15.5px] font-extrabold text-ink">{f.title}</b>
                <p className="text-[13.5px] leading-relaxed text-ink-soft">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <Reveal delay={0.15} className="w-full">
          <div className="group relative flex min-h-[340px] items-end overflow-hidden rounded-2xl md:rounded-3xl p-7 shadow-xl ring-1 ring-black/5 md:p-8">
            {isLocal ? (
              <Image
                src={wc.promoImage}
                alt="Warm living room interior"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <img
                src={wc.promoImage}
                alt="Warm living room interior"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.65)_100%)]" />
            <div className="relative z-[2]">
              <h3 className="mb-5 max-w-[14ch] text-[24px] font-extrabold leading-tight text-white">
                {wc.promoTitle}
              </h3>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2.5 rounded-md bg-yellow px-7 py-4 text-sm font-extrabold text-ink shadow-[0_10px_25px_-5px_rgba(242,176,30,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_15px_30px_-5px_rgba(242,176,30,0.6)] sm:px-8"
              >
                {wc.promoButtonLabel}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
