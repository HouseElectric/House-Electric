"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Reveal from "./Reveal";
import { AmcBadge, Arrow, GearIcon, ReportIcon, SearchIcon } from "./icons";
import { useHomeContent } from "@/contexts/HomeContentContext";

const STEP_ICONS = [SearchIcon, ReportIcon, GearIcon, AmcBadge];
const STEP_NUMS = ["01", "02", "03", "04"];

export default function Process() {
  const { process } = useHomeContent();
  const steps = process.steps.map((s, i) => ({ ...s, icon: STEP_ICONS[i], num: STEP_NUMS[i] }));
  const isLocal = process.image?.startsWith("/");

  return (
    <section className="py-16 md:py-[74px]" id="process">
      <div className="mx-auto grid max-w-wrap grid-cols-1 items-center gap-10 px-6 md:grid-cols-[1fr_1.2fr] md:gap-12">
        <Reveal>
          <div className="relative aspect-[4/4.2] w-full overflow-hidden rounded-2xl shadow-lg">
            {isLocal ? (
              <Image src={process.image} alt="Electrician inspecting a consumer unit" fill className="object-cover" />
            ) : (
              <img src={process.image} alt="Electrician inspecting a consumer unit" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow">{process.eyebrow}</p>
            <h2 className="mb-3 text-[clamp(1.6rem,3vw,2.35rem)] font-extrabold">
              {process.title1}
              <br />
              {process.title2}
            </h2>
            <p className="mb-7 max-w-[52ch] text-[15px] leading-relaxed text-ink-soft">{process.subtitle}</p>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                className="group relative flex flex-col justify-between rounded-xl border border-line/80 bg-cream/40 p-5 transition-all duration-300 hover:border-yellow/60 hover:bg-white hover:shadow-soft"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-yellow/15 text-ink ring-1 ring-yellow/30 transition-colors group-hover:bg-yellow">
                      <s.icon className="h-5 w-5 text-ink" strokeWidth="1.8" />
                    </span>
                    <span className="text-[12px] font-black tracking-widest text-yellow-dark font-mono">
                      {s.num}
                    </span>
                  </div>
                  <h3 className="mb-1 text-[15.5px] font-extrabold text-ink">
                    {s.title}
                  </h3>
                  <p className="text-[13.5px] leading-relaxed text-ink-soft">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
