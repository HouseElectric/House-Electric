"use client";

import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import { supabase } from "@/lib/supabase";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { PinIcon } from "./icons";

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
    <section className="bg-cream py-16 md:py-[80px]">
      <div className="mx-auto max-w-wrap px-6">
        <Reveal className="mb-10 max-w-[62ch]">
          <p className="eyebrow">Where We Work</p>
          <h2 className="mb-3 text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold leading-tight">
            Serving <span className="text-yellow">{city}</span> &amp; Nearby Areas
          </h2>
          <p className="text-[14.5px] leading-relaxed text-ink-soft">
            House Electric regularly serves the following localities across {city}, {state}.
          </p>
        </Reveal>

        {loading ? (
          <div className="flex flex-wrap gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-white" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {areas.map((a) => (
              <span
                key={a.name}
                className="flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-[13px] font-semibold text-ink shadow-sm"
              >
                <PinIcon className="h-3.5 w-3.5 text-yellow-dark" />
                {a.name}
              </span>
            ))}
          </div>
        )}

        <a
          href="/service-areas"
          className="mt-7 inline-flex items-center text-[13.5px] font-extrabold text-ink underline decoration-line underline-offset-4 hover:text-yellow-dark hover:decoration-yellow-dark"
        >
          View All Service Areas
        </a>
      </div>
    </section>
  );
}
