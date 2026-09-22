"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Reveal from "./Reveal";
import { supabase } from "@/lib/supabase";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { PinIcon } from "./icons";

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-");

export default function HomeServiceAreas() {
  const { city, state } = useSiteSettings();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase.from("service_areas").select("name").order("display_order", { ascending: true });
      setAreas(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (!loading && areas.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-cream py-16 md:py-[80px]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{ backgroundImage: "radial-gradient(circle, rgba(20,20,20,0.08) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
      />
      <div className="glow-blob left-[-8%] top-[-10%] h-[300px] w-[300px] bg-yellow/15 opacity-40" />
      <div className="glow-blob right-[-6%] bottom-[-12%] h-[280px] w-[280px] bg-amber-400/10 opacity-30" />

      <div className="relative z-[1] mx-auto max-w-wrap px-6">
        <Reveal className="mb-10 max-w-[62ch]">
          <p className="eyebrow">Where We Work</p>
          <h2 className="mb-3 text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold leading-tight">
            Serving{" "}
            <span className="relative inline-block text-yellow-dark">
              {city}
              <span className="absolute -bottom-0.5 left-0 h-[3px] w-full rounded-full bg-yellow/60" />
            </span>{" "}
            &amp; Nearby Areas
          </h2>
          <p className="text-[14.5px] leading-relaxed text-ink-soft">
            House Electric regularly serves the following localities across {city}, {state}.
          </p>
        </Reveal>

        {loading ? (
          <div className="flex flex-wrap gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 w-28 animate-pulse rounded-full bg-white" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {areas.map((a) => (
              <Link
                key={a.name}
                href={`/electrician-in/${slugify(a.name)}`}
                className="group flex items-center gap-2 rounded-full border border-line bg-white py-2 pl-2 pr-4 text-[13px] font-semibold text-ink shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-yellow hover:bg-yellow/5 hover:text-yellow-dark hover:shadow-[0_10px_24px_-10px_rgba(242,176,30,0.5)]"
              >
                <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-yellow/15 text-yellow-dark transition-all duration-300 group-hover:scale-110 group-hover:bg-yellow group-hover:text-ink">
                  <PinIcon className="h-3.5 w-3.5" />
                </span>
                {a.name}
              </Link>
            ))}
          </div>
        )}

        <a
          href="/service-areas"
          className="group mt-8 inline-flex items-center gap-2 rounded-md border border-line bg-white px-6 py-3 text-[13.5px] font-extrabold text-ink shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-yellow hover:shadow-[0_14px_30px_-14px_rgba(242,176,30,0.6)]"
        >
          View All Service Areas
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  );
}
