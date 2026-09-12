import Link from "next/link";
import CTA from "@/components/CTA";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { PinIcon } from "@/components/icons";
import { supabase } from "@/lib/supabase";
import { getContactSettings } from "@/lib/getContactSettings";

export const revalidate = 60;

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-");

export const metadata = {
  title: "Service Areas — House Electric",
  description:
    "House Electric provides electrical repair, installation, maintenance and AMC services across New Delhi, North Delhi and nearby areas.",
};

const FALLBACK_AREAS = [
  "Model Town",
  "Civil Lines",
  "Kamla Nagar",
  "Mukherjee Nagar",
  "GTB Nagar",
  "Ashok Vihar",
  "Wazirpur",
  "Shalimar Bagh",
  "Pitampura",
  "Rohini",
  "Adarsh Nagar",
  "Sadar Bazar",
];

async function getAreas() {
  if (!supabase) return FALLBACK_AREAS;
  const { data } = await supabase.from("service_areas").select("name").order("display_order", { ascending: true });
  return data && data.length > 0 ? data.map((a) => a.name) : FALLBACK_AREAS;
}

export default async function ServiceAreasPage() {
  const [areas, { city, state, address }] = await Promise.all([getAreas(), getContactSettings()]);

  return (
    <main>
      <PageHero
        eyebrow="Where We Work"
        title="Our Service Areas"
        subtitle={`House Electric currently serves ${city}, ${state} and the surrounding areas below. Not sure if we cover your location? Just ask us on WhatsApp.`}
        primaryCta={{ label: "Check Availability", href: "/contact" }}
      />

      <section className="py-16 md:py-[74px]">
        <div className="mx-auto max-w-wrap px-6">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_1.1fr]">
            <Reveal>
              <p className="eyebrow">Localities we cover</p>
              <h2 className="mb-5">{city} & Surrounding Areas</h2>
              <ul className="grid grid-cols-2 gap-y-3 sm:grid-cols-3">
                {areas.map((a) => (
                  <li key={a}>
                    <Link
                      href={`/electrician-in/${slugify(a)}`}
                      className="group flex items-center gap-2 text-[14px] font-medium text-ink-soft transition-colors hover:text-yellow-dark"
                    >
                      <PinIcon className="h-3.5 w-3.5 flex-none text-yellow" />
                      <span className="group-hover:underline group-hover:underline-offset-2">{a}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-6 max-w-[52ch] text-[14.5px]">
                Serving a location that isn&apos;t listed? Reach out — we
                regularly take on new areas around {city}.
              </p>
            </Reveal>
            <Reveal delay={0.15} className="overflow-hidden rounded-[10px] border border-line">
              <iframe
                title="House Electric service area map"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(address || `${city}, ${state}`)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                className="h-[340px] w-full md:h-full"
                loading="lazy"
              />
            </Reveal>
            <Reveal delay={0.2}>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address || `${city}, ${state}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-yellow px-5 py-3 text-[13.5px] font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark"
              >
                Get Directions
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <CTA />
    </main>
  );
}
