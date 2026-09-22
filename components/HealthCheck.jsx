"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Reveal from "./Reveal";
import { ReportIcon, SearchIcon, ShieldIcon } from "./icons";
import { useHomeContent } from "@/contexts/HomeContentContext";

const TRUST_ICONS = [SearchIcon, ReportIcon, ShieldIcon];

export default function HealthCheck() {
  const { healthCheck: hc } = useHomeContent();
  const trust = hc.trust.map((t, i) => ({ ...t, icon: TRUST_ICONS[i] }));
  const isLocal = hc.image?.startsWith("/");

  return (
    <section className="relative overflow-hidden bg-cream py-16 md:py-[80px]" id="health">
      <div className="glow-blob left-[-8%] top-[10%] h-[320px] w-[320px] bg-yellow/10 opacity-30" />
      <div className="relative z-[1] mx-auto grid max-w-wrap grid-cols-1 items-center gap-12 px-6 md:grid-cols-[1fr_1.1fr]">
        <Reveal>
          <p className="eyebrow">{hc.eyebrow}</p>
          <h2 className="mb-4 text-[clamp(1.75rem,3.4vw,2.6rem)] font-extrabold leading-tight">
            {hc.titlePlain} <span className="text-yellow">{hc.titleHighlight}</span>
          </h2>
          <p className="mb-7 max-w-[48ch] text-[15.5px] leading-relaxed text-ink-soft">{hc.subtitle}</p>
          <a
            href="/health-check"
            className="inline-flex items-center justify-center gap-2.5 rounded-md bg-yellow px-7 py-4 text-sm font-extrabold text-ink shadow-[0_10px_25px_-5px_rgba(242,176,30,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_15px_30px_-5px_rgba(242,176,30,0.6)] sm:px-8"
          >
            {hc.buttonLabel}
          </a>

          <ul className="mt-8 flex flex-wrap items-center gap-3">
            {trust.map(({ icon: Icon, label }, i) => (
              <li
                key={i}
                className={`flex items-center gap-2 text-[13.5px] font-bold text-ink ${
                  i !== trust.length - 1 ? "sm:border-r sm:border-line/80 sm:pr-4" : ""
                }`}
              >
                <Icon className="h-4 w-4 text-yellow-dark" strokeWidth="2" />
                {label}
              </li>
            ))}
          </ul>
        </Reveal>

        <motion.div
          initial={{ opacity: 0, scale: 1.03 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[4/3.4] w-full overflow-hidden rounded-2xl md:rounded-3xl shadow-xl ring-1 ring-black/5"
        >
          {isLocal ? (
            <Image src={hc.image} alt="House Electric technician fitting a ceiling light" fill className="object-cover" />
          ) : (
            <img src={hc.image} alt="House Electric technician fitting a ceiling light" className="absolute inset-0 h-full w-full object-cover" />
          )}
        </motion.div>
      </div>
    </section>
  );
}
