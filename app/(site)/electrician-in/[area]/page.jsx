import { notFound } from "next/navigation";
import Link from "next/link";
import EnquiryForm from "@/components/EnquiryForm";
import FAQAccordion from "@/components/FAQAccordion";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { supabase } from "@/lib/supabase";
import { getContactSettings, telHref } from "@/lib/getContactSettings";
import { AmcBadge, ClockIcon, GearIcon, PinIcon, ReportIcon, SearchIcon, ShieldIcon } from "@/components/icons";

export const revalidate = 3600;

const SITE_URL = "https://houseelectric.in";

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-");

async function getAreas() {
  if (!supabase) return [];
  const { data } = await supabase.from("service_areas").select("name").order("display_order", { ascending: true });
  return data ?? [];
}

async function getArea(slug) {
  const areas = await getAreas();
  return areas.find((a) => slugify(a.name) === slug) || null;
}

export async function generateStaticParams() {
  const areas = await getAreas();
  return areas.map((a) => ({ area: slugify(a.name) }));
}

export async function generateMetadata({ params }) {
  const area = await getArea(params.area);
  if (!area) return { title: "Service Area Not Found — House Electric" };
  const { city, state } = await getContactSettings();
  return {
    title: `Electrician in ${area.name}, ${city} — House Electric`,
    description: `Professional electrical repair, installation, maintenance and AMC services in ${area.name}, ${city}, ${state}. Book a certified House Electric technician today.`,
    alternates: { canonical: `/electrician-in/${params.area}` },
  };
}

const SERVICES = [
  { icon: SearchIcon, title: "Electrical Repair", desc: "Fault finding, MCB, switch & socket repairs." },
  { icon: GearIcon, title: "Electrical Installation", desc: "New wiring, lighting, fans, DB installation." },
  { icon: ReportIcon, title: "Electrical Health Check", desc: "Full inspection with a clear findings report." },
  { icon: AmcBadge, title: "Electrical AMC", desc: "Annual maintenance plans with priority visits." },
];

export default async function ElectricianInAreaPage({ params }) {
  const [area, { city, state, phone }, allAreas] = await Promise.all([
    getArea(params.area),
    getContactSettings(),
    getAreas(),
  ]);
  if (!area) notFound();

  const nearby = allAreas.filter((a) => a.name !== area.name).slice(0, 6);

  const faqs = [
    {
      q: `Do you provide electrical services in ${area.name}?`,
      a: `Yes. House Electric regularly serves ${area.name} and the surrounding parts of ${city}, ${state} for electrical repair, installation, maintenance and AMC work.`,
    },
    {
      q: `How quickly can a technician reach ${area.name}?`,
      a: `For most requests in ${area.name}, we aim to confirm a visit slot the same day. For urgent electrical faults, call us directly for priority dispatch.`,
    },
    {
      q: "What electrical services can I book?",
      a: "Electrical repair, installation, maintenance, health checks, Annual Maintenance Contracts (AMC) and emergency electrical support for homes, shops and offices.",
    },
    {
      q: "Do you offer AMC plans for this area?",
      a: `Yes — residential, office, commercial and corporate AMC plans are available for properties in ${area.name}. Request a proposal and we'll confirm coverage and next steps.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "House Electric",
    url: `${SITE_URL}/electrician-in/${params.area}`,
    telephone: phone,
    areaServed: area.name,
    address: { "@type": "PostalAddress", addressLocality: city, addressRegion: state },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        eyebrow={`Electrician in ${area.name}`}
        title={
          <>
            Trusted Electrician in{" "}
            <span className="text-yellow">{area.name}</span>, {city}
          </>
        }
        subtitle={`House Electric provides professional electrical repair, installation, maintenance and AMC services to homes, shops and offices across ${area.name} and nearby areas of ${city}, ${state}.`}
        primaryCta={{ label: "Book a Service", href: "#booking" }}
        secondaryCta={{ label: "Call Now", href: telHref(phone) }}
      />

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-10 max-w-[62ch]">
            <p className="eyebrow">Local Electrical Services</p>
            <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold">
              What We Do in <span className="text-yellow">{area.name}</span>
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              From a single repair to full property maintenance, our certified electricians handle
              residential, commercial and corporate jobs in {area.name} with the same safety standards and
              transparent pricing across all of {city}.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <div key={s.title} className="rounded-2xl border border-line/80 bg-white p-6 shadow-sm">
                <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-yellow/15 text-ink ring-1 ring-yellow/30">
                  <s.icon className="h-5 w-5" strokeWidth="1.8" />
                </span>
                <b className="mb-1 block text-[15.5px] text-ink">{s.title}</b>
                <p className="text-[13px] leading-relaxed text-ink-soft">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-14 md:py-20">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-8 max-w-[60ch]">
            <p className="eyebrow">Why House Electric</p>
            <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold">
              Why {area.name} Residents Choose Us
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { icon: ShieldIcon, title: "Safety-First Work", desc: "Standard safety practices on every job, every time." },
              { icon: ClockIcon, title: "On-Time Service", desc: "Clear scheduling and punctual technicians." },
              { icon: PinIcon, title: "Local Coverage", desc: `Regularly serving ${area.name} and nearby localities.` },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-line/80 bg-white p-6">
                <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-yellow/15 text-ink ring-1 ring-yellow/30">
                  <f.icon className="h-5 w-5" strokeWidth="1.8" />
                </span>
                <b className="mb-1 block text-[15px] text-ink">{f.title}</b>
                <p className="text-[13px] leading-relaxed text-ink-soft">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-8 max-w-[60ch]">
            <p className="eyebrow">FAQs</p>
            <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold">
              Electrician in {area.name} — FAQs
            </h2>
          </Reveal>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {nearby.length > 0 && (
        <section className="bg-cream py-12">
          <div className="mx-auto max-w-wrap px-6">
            <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-body">
              We also serve nearby areas
            </p>
            <div className="flex flex-wrap gap-2">
              {nearby.map((a) => (
                <Link
                  key={a.name}
                  href={`/electrician-in/${slugify(a.name)}`}
                  className="rounded-full border border-line bg-white px-4 py-2 text-[12.5px] font-semibold text-ink hover:border-yellow hover:text-yellow-dark"
                >
                  Electrician in {a.name}
                </Link>
              ))}
              <Link
                href="/service-areas"
                className="rounded-full border border-line bg-white px-4 py-2 text-[12.5px] font-bold text-ink hover:border-ink"
              >
                View all service areas
              </Link>
            </div>
          </div>
        </section>
      )}

      <EnquiryForm
        id="booking"
        variant="booking"
        eyebrow="Book Now"
        title={`Book an Electrician in ${area.name}`}
        subtitle="Fill in your details and our team will confirm your booking shortly."
      />
    </main>
  );
}
