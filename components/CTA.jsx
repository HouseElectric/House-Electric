"use client";

"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { MailIcon, PhoneIcon } from "./icons";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function CTA() {
  const { phone, email } = useSiteSettings();
  return (
    <section className="pb-16 md:pb-[74px]" id="contact">
      <div className="mx-auto max-w-wrap px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-[#0B0B0E] p-8 md:p-12 shadow-2xl border border-white/10">
            <div className="glow-blob right-[5%] top-[-25%] h-[300px] w-[300px] bg-yellow/20 opacity-50 blur-[90px]" />
            <Image
              src="/cta-bulb.png"
              alt="Glowing filament bulb"
              fill
              className="object-cover object-right opacity-85"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#0B0B0E_32%,rgba(11,11,14,0.6)_60%,rgba(11,11,14,0.15)_100%)]" />
            <div className="relative z-[2] grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto_auto]">
              <div>
                <h2 className="mb-2 text-[clamp(1.4rem,2.4vw,1.9rem)] font-extrabold text-white leading-tight">
                  Let&apos;s Make Your Space Safer
                </h2>
                <p className="max-w-[44ch] text-[15px] leading-relaxed text-[#D2CDC4]">
                  Book a service, request an AMC or get a free consultation
                  today.
                </p>
              </div>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2.5 rounded-md bg-yellow px-7 py-4 text-sm font-extrabold text-ink shadow-[0_10px_25px_-5px_rgba(242,176,30,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_15px_30px_-5px_rgba(242,176,30,0.6)] sm:px-8"
              >
                Contact Us
              </a>
              <div className="flex flex-col gap-3 min-w-0">
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs sm:text-[13.5px] font-bold text-white transition-all hover:border-yellow/50 hover:bg-white/10"
                >
                  <PhoneIcon className="h-4 w-4 flex-none shrink-0 text-yellow" />
                  <span>{phone}</span>
                </a>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs sm:text-[13.5px] font-bold text-white transition-all hover:border-yellow/50 hover:bg-white/10 break-all"
                >
                  <MailIcon className="h-4 w-4 flex-none shrink-0 text-yellow" />
                  <span className="break-all">{email}</span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
