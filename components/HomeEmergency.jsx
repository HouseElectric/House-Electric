"use client";

import Reveal from "./Reveal";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useHomeContent } from "@/contexts/HomeContentContext";
import { PhoneIcon, SparklesIcon, WhatsAppIcon } from "./icons";

export default function HomeEmergency() {
  const { phone, whatsapp } = useSiteSettings();
  const { emergency } = useHomeContent();

  return (
    <section className="bg-cream py-16 md:py-[80px]">
      <div className="mx-auto max-w-wrap px-6">
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-line/80 bg-white shadow-sm md:rounded-3xl">
            <div className="grid grid-cols-1 gap-8 p-7 md:grid-cols-[1fr_auto] md:items-center md:gap-10 md:p-10">
              <div>
                <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3.5 py-1.5 text-[11.5px] font-extrabold uppercase tracking-wide text-red-600">
                  <SparklesIcon className="h-4 w-4" />
                  {emergency.badgeLabel}
                </span>
                <h2 className="mb-3 text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold leading-tight text-ink">
                  {emergency.titlePlain} <span className="text-yellow-dark">{emergency.titleHighlight}</span>
                </h2>
                <p className="mb-5 max-w-[52ch] text-[14.5px] leading-relaxed text-ink-soft">{emergency.subtitle}</p>
                <div className="flex flex-wrap gap-2">
                  {emergency.problems.map((p) => (
                    <span
                      key={p}
                      className="rounded-full border border-line bg-cream/60 px-3.5 py-1.5 text-[12.5px] font-semibold text-ink"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:min-w-[220px]">
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-ink px-7 py-4 text-sm font-extrabold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-ink-soft"
                >
                  <PhoneIcon className="h-4 w-4" />
                  Call {phone}
                </a>
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi House Electric, I have an urgent electrical issue. Please help.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-7 py-4 text-sm font-extrabold text-white shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  WhatsApp Now
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
