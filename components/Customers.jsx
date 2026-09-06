"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Reveal from "./Reveal";
import { BuildingIcon, HomeIcon } from "./icons";
import { useHomeContent } from "@/contexts/HomeContentContext";

const SPACE_META = [
  { icon: HomeIcon, href: "/contact" },
  { icon: BuildingIcon, href: "/contact" },
  { icon: BuildingIcon, href: "/corporate" },
];

export default function Customers() {
  const { customers } = useHomeContent();
  const spaces = customers.spaces.map((s, i) => ({ ...s, ...SPACE_META[i] }));

  return (
    <section className="pb-16 md:pb-[74px]" id="spaces">
      <div className="mx-auto max-w-wrap px-6">
        <Reveal>
          <p className="eyebrow">{customers.eyebrow}</p>
          <h2 className="mb-2 text-[clamp(1.6rem,3vw,2.35rem)] font-extrabold">{customers.title}</h2>
          <p className="mb-8 text-[15px] leading-relaxed text-ink-soft">{customers.subtitle}</p>
        </Reveal>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
          {spaces.map((s, i) => {
            const Icon = s.icon;
            const isLocal = s.image?.startsWith("/");
            return (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-line/80 bg-white shadow-sm transition-all duration-300 hover:border-yellow/50 hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {isLocal ? (
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={s.image}
                      alt={s.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                  <span className="absolute top-3.5 left-3.5 z-10 flex h-10 w-10 items-center justify-center p-2.5 rounded-xl bg-white/95 backdrop-blur-md text-ink shadow-md ring-1 ring-black/5">
                    <Icon className="h-full w-full text-yellow-dark" strokeWidth="2" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                  <h3 className="mb-1.5 text-[18px] font-extrabold text-ink transition-colors group-hover:text-yellow-dark">
                    {s.title}
                  </h3>
                  <p className="mb-5 min-h-[40px] text-[14px] leading-relaxed text-ink-soft">{s.desc}</p>
                  <a
                    href={s.href}
                    className="mt-auto inline-flex w-fit items-center text-[13.5px] font-extrabold text-ink underline decoration-line underline-offset-4 transition-colors hover:text-yellow-dark hover:decoration-yellow-dark"
                  >
                    Explore Solutions
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
