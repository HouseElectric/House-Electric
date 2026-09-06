import Image from "next/image";
import Link from "next/link";
import CTA from "@/components/CTA";
import FAQAccordion from "@/components/FAQAccordion";
import Reveal from "@/components/Reveal";
import StatsBand from "@/components/StatsBand";
import WhyChoose from "@/components/WhyChoose";
import { HomeContentProvider } from "@/contexts/HomeContentContext";
import { AmcBadge, AwardIcon, CheckCircle, GearIcon, PinIcon, ReportIcon, SearchIcon } from "@/components/icons";
import { supabase } from "@/lib/supabase";
import { getContactSettings } from "@/lib/getContactSettings";

export const revalidate = 60;

const SITE_URL = "https://houseelectric.in";

export const metadata = {
  title: "About Us — Electrical Maintenance Company in New Delhi | House Electric",
  description:
    "House Electric is an electrical maintenance & AMC company serving homes, businesses and corporate properties across New Delhi, North Delhi. Learn about our Inspect → Identify → Repair → Maintain approach.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About House Electric — Electrical Maintenance Company in New Delhi",
    description:
      "We're building a professional electrical maintenance company for homes, businesses and corporate properties across New Delhi — not just an electrician call-out service.",
    url: "/about",
    type: "website",
  },
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
];

async function getAreas() {
  if (!supabase) return FALLBACK_AREAS;
  const { data } = await supabase.from("service_areas").select("name").order("display_order", { ascending: true });
  return data && data.length > 0 ? data.map((a) => a.name) : FALLBACK_AREAS;
}

const FALLBACK_WORK = [
  { image_url: "/service-repair.png", title: "Fault Finding & Repair", category: "Repair" },
  { image_url: "/process-electrician.png", title: "Consumer Unit Inspection", category: "Health Check" },
  { image_url: "/service-installation.png", title: "Pendant Lighting Installation", category: "Installation" },
  { image_url: "/customer-commercial.png", title: "Office Electrical Fit-Out", category: "Commercial" },
];

async function getRecentWork() {
  if (!supabase) return FALLBACK_WORK;
  const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false }).limit(4);
  return data && data.length > 0 ? data : FALLBACK_WORK;
}

const MODEL_STEPS = [
  {
    num: "01",
    icon: SearchIcon,
    title: "Inspect",
    desc: "We check your wiring, DB panels & switches thoroughly.",
  },
  {
    num: "02",
    icon: ReportIcon,
    title: "Identify",
    desc: "We flag risks, faults & priority issues in a clear report.",
  },
  {
    num: "03",
    icon: GearIcon,
    title: "Repair",
    desc: "We fix what is broken quickly, with your approval first.",
  },
  {
    num: "04",
    icon: AmcBadge,
    title: "Maintain",
    desc: "Ongoing AMC keeps your entire system safe long-term.",
  },
];

const FAQ_ITEMS = (city, state) => [
  {
    q: `What areas does House Electric serve?`,
    a: `We currently serve ${city}, ${state} and the surrounding localities. See our full Service Areas page for the complete, up-to-date list — and if your locality isn't on it, reach out anyway.`,
  },
  {
    q: "Do you offer Annual Maintenance Contracts (AMC)?",
    a: "Yes. Our AMC plans cover scheduled inspections and priority support so your electrical system stays safe year-round, instead of waiting for something to break before calling an electrician.",
  },
  {
    q: "What exactly is an Electrical Health Check?",
    a: "A detailed inspection of your wiring, DB panel and switches that flags hidden risks early — with a clear report and repair estimate before any work begins, so there are no surprises.",
  },
  {
    q: "Do you work with homes as well as businesses?",
    a: "Yes. We handle residential, commercial and corporate properties — from single apartments and independent houses to offices, shops, clinics and factories.",
  },
  {
    q: "How do I book a service?",
    a: "Call us, message us on WhatsApp, or fill out the booking form on our Contact page. We'll confirm your appointment and get a technician to you shortly after.",
  },
  {
    q: "What if my locality isn't listed in your service areas?",
    a: "Reach out anyway. We're regularly expanding coverage, and can often accommodate requests just outside our current listed areas.",
  },
];

export default async function AboutPage() {
  const [areas, { city, state, phone, address }, recentWork] = await Promise.all([
    getAreas(),
    getContactSettings(),
    getRecentWork(),
  ]);
  const faqs = FAQ_ITEMS(city, state);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    mainEntity: {
      "@type": "LocalBusiness",
      name: "House Electric",
      url: SITE_URL,
      telephone: phone,
      address: { "@type": "PostalAddress", addressLocality: city, addressRegion: state, streetAddress: address },
      areaServed: areas,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="relative overflow-hidden bg-cream">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #141414 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          aria-hidden="true"
        />
        <div className="glow-blob left-[-8%] top-[-15%] h-[320px] w-[320px] bg-yellow/10 opacity-30" />
        <div className="glow-blob right-[-6%] bottom-[-18%] h-[280px] w-[280px] bg-amber-400/10 opacity-25" />

        <div className="relative z-[1] mx-auto grid max-w-wrap grid-cols-1 items-center gap-10 px-6 py-14 md:grid-cols-[1fr_1.05fr] md:gap-14 md:py-20">
          <div className="relative order-2 md:order-1">
            <div className="absolute -inset-3 -z-[1] hidden rounded-2xl border-2 border-yellow/50 sm:block md:rounded-3xl" />
            <div className="relative aspect-[4/3.6] w-full overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5 md:rounded-3xl">
              <Image
                src="/hero-electrician.png"
                alt="House Electric technician working on a distribution board"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -right-2 flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-xl sm:-right-6 sm:px-5 sm:py-4">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-yellow/15 text-yellow-dark">
                <AwardIcon className="h-5 w-5" strokeWidth="1.8" />
              </span>
              <div>
                <b className="block text-[17px] font-extrabold leading-none text-ink">5+ Years</b>
                <span className="text-[11px] font-semibold text-ink-soft">Of Trusted Service</span>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <p className="eyebrow">About Us — {city}, {state}</p>
            <h1 className="mb-5 text-[clamp(1.9rem,3.2vw,2.75rem)] font-extrabold leading-[1.15]">
              Building a Professional{" "}
              <span className="text-yellow">Electrical Maintenance</span> Company in {city}
            </h1>
            <p className="max-w-[52ch] text-[16px]">
              House Electric is growing from a local electrical service provider into a full electrical maintenance
              and AMC company — for homes, businesses and corporate properties across {city}, {state}.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-md bg-yellow px-7 py-4 text-sm font-extrabold text-ink shadow-[0_10px_25px_-5px_rgba(242,176,30,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_15px_30px_-5px_rgba(242,176,30,0.6)] sm:px-8"
              >
                Book a Service
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-md border border-line px-7 py-4 text-sm font-bold text-ink transition-colors hover:border-ink"
              >
                View Services
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2.5">
              {["Certified Electricians", "Transparent Pricing", "Same-Day Response"].map((t) => (
                <li key={t} className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                  <CheckCircle className="h-3.5 w-3.5 text-yellow-dark" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <HomeContentProvider>
        <StatsBand />
      </HomeContentProvider>

      {/* Our Approach Section */}
      <section className="py-12 md:py-[80px]">
        <div className="mx-auto grid max-w-wrap grid-cols-1 items-center gap-8 md:gap-12 px-6 md:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <p className="eyebrow">Our approach</p>
            <h2 className="mb-4 text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold leading-tight">
              House Electric Is Not Just an{" "}
              <span className="text-yellow">Electrician Service</span>
            </h2>
            <p className="mb-4 max-w-[60ch] text-[15px] leading-relaxed text-ink-soft">
              We&apos;re building a professional electrical maintenance company —
              one that helps residential, commercial and corporate customers
              stay safe through a clear, repeatable process instead of
              one-off emergency call-outs.
            </p>
            <p className="mb-6 max-w-[60ch] text-[15px] leading-relaxed text-ink-soft">
              Our model is simple: <b className="text-ink">Inspect → Identify → Repair → Maintain</b>.
              For recurring customers, that turns a one-time visit into a long-term, safer relationship.
            </p>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12.5px] font-black tracking-wider uppercase font-mono">
              <span className="rounded-full border border-yellow/40 bg-yellow/15 px-3 py-1 sm:px-3.5 sm:py-1.5 text-yellow-dark">
                Inspect
              </span>
              <span className="text-yellow font-extrabold">→</span>
              <span className="rounded-full border border-yellow/40 bg-yellow/15 px-3 py-1 sm:px-3.5 sm:py-1.5 text-yellow-dark">
                Identify
              </span>
              <span className="text-yellow font-extrabold">→</span>
              <span className="rounded-full border border-yellow/40 bg-yellow/15 px-3 py-1 sm:px-3.5 sm:py-1.5 text-yellow-dark">
                Repair
              </span>
              <span className="text-yellow font-extrabold">→</span>
              <span className="rounded-full border border-yellow/40 bg-yellow/15 px-3 py-1 sm:px-3.5 sm:py-1.5 text-yellow-dark">
                Maintain
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative aspect-[4/3.4] w-full overflow-hidden rounded-2xl md:rounded-3xl shadow-xl ring-1 ring-black/5">
              <Image
                src="/process-electrician.png"
                alt="Electrician inspecting a consumer unit"
                fill
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Our Model Section */}
      <section className="bg-cream py-12 md:py-[80px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-8 md:mb-10 max-w-[60ch]">
            <p className="eyebrow">Our model</p>
            <h2 className="text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold">
              Inspect. Identify. Repair. <span className="text-yellow">Maintain.</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {MODEL_STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1}>
                <div className="group flex flex-col justify-between rounded-2xl border border-line/80 bg-white p-5 sm:p-6 md:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-yellow/50 hover:shadow-xl h-full">
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-yellow/15 text-ink ring-1 ring-yellow/30 transition-colors group-hover:bg-yellow">
                        <s.icon className="h-5 w-5 text-ink" strokeWidth="1.8" />
                      </span>
                      <span className="font-mono text-[13px] font-black tracking-widest text-yellow-dark">
                        {s.num}
                      </span>
                    </div>
                    <h3 className="mb-1.5 text-[17px] font-extrabold text-ink">
                      {s.title}
                    </h3>
                    <p className="text-[13.5px] leading-relaxed text-ink-soft">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Work Section */}
      <section className="py-12 md:py-[80px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-8 md:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
            <div className="max-w-[56ch]">
              <p className="eyebrow">Proof, not promises</p>
              <h2 className="text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold">
                Recent <span className="text-yellow">Work</span>
              </h2>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13.5px] font-bold text-ink hover:text-yellow-dark"
            >
              View all projects
            </Link>
          </Reveal>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
            {recentWork.map((p, i) => {
              const isLocal = p.image_url?.startsWith("/");
              return (
                <Reveal
                  key={p.id || p.title}
                  delay={i * 0.08}
                  className="card-hover group overflow-hidden rounded-xl border border-line bg-white"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {isLocal ? (
                      <Image
                        src={p.image_url}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    {p.category && (
                      <span className="absolute left-2 top-2 sm:left-2.5 sm:top-2.5 rounded-full bg-white/90 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9.5px] sm:text-[10.5px] font-bold text-ink truncate max-w-[85%]">
                        {p.category}
                      </span>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Where We Work Section */}
      <section className="relative overflow-hidden bg-cream py-12 md:py-[80px]">
        <div className="glow-blob left-[-8%] top-[10%] h-[300px] w-[300px] bg-yellow/10 opacity-30" />
        <div className="relative z-[1] mx-auto max-w-wrap px-6">
          <Reveal className="mb-8 md:mb-10 max-w-[62ch]">
            <p className="eyebrow">Where we work</p>
            <h2 className="text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold">
              Electrical Services Across <span className="text-yellow">{city}</span> & Nearby Areas
            </h2>
            <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-ink-soft">
              House Electric provides electrical repair, installation, maintenance and AMC services
              throughout {city}, {state} — including these localities.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 md:grid-cols-4">
            {areas.map((a, i) => (
              <Reveal key={a} delay={(i % 8) * 0.04}>
                <div className="card-hover flex items-center gap-2 sm:gap-2.5 rounded-xl border border-line/80 bg-white px-3 py-2.5 sm:px-4 sm:py-3.5 text-[12.5px] sm:text-[13.5px] font-bold text-ink transition-all duration-200 hover:border-yellow/50 hover:shadow-md min-w-0">
                  <span className="grid h-6 w-6 sm:h-7 sm:w-7 flex-none place-items-center rounded-full bg-yellow/15 text-yellow-dark">
                    <PinIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">{a}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <Link
            href="/service-areas"
            className="mt-6 sm:mt-8 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-ink hover:text-yellow-dark"
          >
            View all service areas
          </Link>
        </div>
      </section>

      {/* Frequently Asked Questions Section */}
      <section className="relative overflow-hidden py-12 md:py-[80px]">
        <div className="glow-blob right-[-6%] bottom-[-10%] h-[280px] w-[280px] bg-amber-400/10 opacity-25" />
        <div className="relative z-[1] mx-auto max-w-wrap px-6">
          <Reveal className="mb-8 md:mb-10 max-w-[60ch]">
            <p className="eyebrow">Common questions</p>
            <h2 className="text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold">
              Frequently Asked <span className="text-yellow">Questions</span>
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <Reveal delay={0.1}>
              <FAQAccordion items={faqs.slice(0, 3)} />
            </Reveal>
            <Reveal delay={0.18}>
              <FAQAccordion items={faqs.slice(3)} defaultOpen={-1} />
            </Reveal>
          </div>
        </div>
      </section>

      <WhyChoose />
      <CTA />
    </main>
  );
}
