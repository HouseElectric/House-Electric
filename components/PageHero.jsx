"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  image,
  imageAlt,
}) {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="glow-blob left-[-8%] top-[-15%] h-[320px] w-[320px] bg-yellow/10 opacity-30" />
      <div className="glow-blob right-[-6%] bottom-[-18%] h-[280px] w-[280px] bg-amber-400/10 opacity-25" />
      <div
        className={`relative z-[1] mx-auto grid max-w-wrap grid-cols-1 items-center gap-10 px-6 ${
          image ? "md:grid-cols-[1fr_1fr]" : ""
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`py-14 md:py-20 ${image ? "" : "mx-auto max-w-[62ch] text-center"}`}
        >
          <p className={`eyebrow max-w-full whitespace-nowrap overflow-hidden text-ellipsis ${image ? "" : "justify-center"}`}>{eyebrow}</p>
          <h1 className="mb-5 font-extrabold">{title}</h1>
          {subtitle && <p className={`text-[16px] ${image ? "max-w-[52ch]" : "mx-auto max-w-[52ch]"}`}>{subtitle}</p>}

          {(primaryCta || secondaryCta) && (
            <div className={`mt-7 flex items-center gap-2 sm:gap-3 ${image ? "" : "justify-center"}`}>
              {primaryCta && (
                <a
                  href={primaryCta.href}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-md bg-yellow px-3 py-3.5 text-xs font-extrabold text-ink shadow-[0_10px_25px_-5px_rgba(242,176,30,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_15px_30px_-5px_rgba(242,176,30,0.6)] sm:px-8 sm:py-4 sm:text-sm whitespace-nowrap text-center"
                >
                  {primaryCta.label}
                </a>
              )}
              {secondaryCta && (
                <a
                  href={secondaryCta.href}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-md border border-line px-3 py-3.5 text-xs font-bold text-ink transition-colors hover:border-ink sm:px-8 sm:py-4 sm:text-sm whitespace-nowrap text-center"
                >
                  {secondaryCta.label}
                </a>
              )}
            </div>
          )}
        </motion.div>

        {image && (
          <motion.div
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/3.5] w-full overflow-hidden rounded-2xl md:rounded-3xl shadow-xl ring-1 ring-black/5 my-6 md:my-10"
          >
            {image.startsWith("/") ? (
              <Image src={image} alt={imageAlt || ""} fill className="object-cover" />
            ) : (
              <img src={image} alt={imageAlt || ""} className="absolute inset-0 h-full w-full object-cover" />
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
