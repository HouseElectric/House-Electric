import Image from "next/image";
import Link from "next/link";
import CTA from "@/components/CTA";
import FAQAccordion from "@/components/FAQAccordion";
import Reveal from "@/components/Reveal";
import StatsBand from "@/components/StatsBand";
import WhyChoose from "@/components/WhyChoose";
import { HomeContentProvider } from "@/contexts/HomeContentContext";
import {
  AmcBadge,
  ArrowRightIcon,
  AwardIcon,
  CheckCircle,
  GearIcon,
  PinIcon,
  ReportIcon,
  SearchIcon,
  ShieldIcon,
  SparklesIcon,
} from "@/components/icons";
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

      {/* Executive Hero Section */}
      <section className="relative overflow-hidden bg-cream py-14 sm:py-16 md:py-24 border-b border-line/60">
        {/* Ambient Luxury Background Lights & Pattern */}
        <div
          className="absolute inset-0 opacity-[0.045] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #141414 1.2px, transparent 1.2px)", backgroundSize: "28px 28px" }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -left-20 -top-20 h-[420px] w-[420px] rounded-full bg-amber-300/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-[380px] w-[380px] rounded-full bg-yellow/15 blur-3xl" />

        <div className="relative z-[1] mx-auto grid max-w-wrap grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Visual Showcase (Image + Badges) */}
          <div className="relative order-2 lg:order-1">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Luxury Squircle Glow Frame */}
              <div className="absolute -inset-3 -z-[1] hidden sm:block rounded-[2.5rem] border border-amber-300/40 bg-gradient-to-tr from-amber-100/40 via-yellow/10 to-transparent shadow-sm" />
              
              <div className="relative aspect-[4/3.4] w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/10">
                <Image
                  src="/hero-electrician.png"
                  alt="House Electric technician working on a distribution board"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
              </div>

              {/* Top Floating Pill: VIP Verified */}
              <div className="absolute -top-3 left-4 sm:-top-4 sm:left-6 flex items-center gap-2 rounded-full border border-emerald-200/90 bg-white/95 px-3.5 py-1.5 shadow-md backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900">
                  Certified &amp; Insured Crew
                </span>
              </div>

              {/* Bottom Floating Glass Card: 5+ Years */}
              <div className="absolute -bottom-5 right-2 sm:-bottom-6 sm:-right-4 flex items-center gap-3.5 rounded-2xl sm:rounded-3xl border border-amber-200/90 bg-white/95 px-4 py-3 sm:px-5 sm:py-4 shadow-xl backdrop-blur-md transition-all hover:scale-105">
                <span className="grid h-11 w-11 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-yellow/20 text-yellow-dark border border-amber-200/60 shadow-2xs">
                  <AwardIcon className="h-6 w-6" strokeWidth="2" />
                </span>
                <div>
                  <b className="block text-lg sm:text-xl font-black leading-none text-ink [font-variant-numeric:tabular-nums]">
                    5+ Years
                  </b>
                  <span className="text-[11px] sm:text-xs font-extrabold text-muted">
                    Of Trusted Service
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Content Column */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/90 bg-amber-50/90 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs">
              <SparklesIcon className="h-3.5 w-3.5 text-yellow-dark" />
              <span>About Us — {city}, {state}</span>
            </div>

            <h1 className="text-[clamp(2.1rem,3.8vw,3.2rem)] font-black leading-[1.12] tracking-tight text-ink">
              Building a Professional{" "}
              <span className="bg-gradient-to-r from-amber-500 via-yellow to-amber-600 bg-clip-text text-transparent">
                Electrical Maintenance
              </span>{" "}
              Company in {city}
            </h1>

            <p className="max-w-[54ch] text-base sm:text-lg leading-relaxed text-body">
              House Electric is growing from a local electrical service provider into a full electrical maintenance
              and AMC company — for homes, businesses and corporate properties across {city}, {state}.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-yellow px-7 py-4 text-sm font-black text-ink shadow-[0_12px_28px_-6px_rgba(242,176,30,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_18px_36px_-6px_rgba(242,176,30,0.65)] active:scale-[0.98]"
              >
                <span>Book a Service</span>
                <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300/90 bg-white/95 px-7 py-4 text-sm font-black text-ink shadow-2xs backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:bg-white hover:shadow-xs"
              >
                View Services
              </Link>
            </div>

            {/* Assurances ribbon */}
            <div className="pt-2 border-t border-line/70">
              <ul className="flex flex-wrap gap-x-6 gap-y-2.5">
                {["Certified Electricians", "Transparent Pricing", "Same-Day Response"].map((t) => (
                  <li key={t} className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-bold text-ink">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle className="h-3.5 w-3.5" />
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <HomeContentProvider>
        <StatsBand />
      </HomeContentProvider>

      {/* Our Approach Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto grid max-w-wrap grid-cols-1 items-center gap-10 md:gap-14 px-6 md:grid-cols-[1.15fr_1fr]">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs mb-4">
              Our approach
            </div>
            <h2 className="mb-5 text-[clamp(1.75rem,3.2vw,2.5rem)] font-black leading-tight tracking-tight text-ink">
              House Electric Is Not Just an{" "}
              <span className="bg-gradient-to-r from-amber-500 to-yellow-dark bg-clip-text text-transparent">
                Electrician Service
              </span>
            </h2>
            <p className="mb-4 max-w-[60ch] text-[15.5px] leading-relaxed text-body">
              We&apos;re building a professional electrical maintenance company —
              one that helps residential, commercial and corporate customers
              stay safe through a clear, repeatable process instead of
              one-off emergency call-outs.
            </p>
            <p className="mb-7 max-w-[60ch] text-[15.5px] leading-relaxed text-body">
              Our model is simple: <b className="font-black text-ink">Inspect → Identify → Repair → Maintain</b>.
              For recurring customers, that turns a one-time visit into a long-term, safer relationship.
            </p>

            {/* Connected Process Ledger Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/70 to-amber-50/30 shadow-2xs">
              {[
                { name: "Inspect", num: "01" },
                { name: "Identify", num: "02" },
                { name: "Repair", num: "03" },
                { name: "Maintain", num: "04" },
              ].map((step, idx) => (
                <div
                  key={step.name}
                  className="relative flex items-center justify-between rounded-2xl border border-white/80 bg-white p-3 shadow-2xs transition-all hover:border-amber-300 hover:shadow-xs"
                >
                  <div className="min-w-0">
                    <span className="block font-mono text-[10px] font-black text-amber-700">
                      STEP {step.num}
                    </span>
                    <b className="block text-xs sm:text-sm font-black text-ink">
                      {step.name}
                    </b>
                  </div>
                  {idx < 3 && (
                    <span className="hidden sm:inline font-black text-amber-400 text-xs pl-1">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative mx-auto max-w-md md:max-w-none">
              <div className="absolute -inset-3 -z-[1] hidden sm:block rounded-[2.5rem] border border-slate-200/80 bg-slate-50 shadow-xs" />
              <div className="relative aspect-[4/3.4] w-full overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5">
                <Image
                  src="/process-electrician.png"
                  alt="Electrician inspecting a consumer unit"
                  fill
                  className="object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-white/90 p-3.5 backdrop-blur-md shadow-lg">
                  <span className="block text-[11px] font-black uppercase tracking-wider text-amber-900">
                    Standardized Engineering Protocols
                  </span>
                  <p className="text-xs font-bold text-ink mt-0.5">
                    Every circuit tested, documented, and certified before sign-off.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Our Model Section */}
      <section className="bg-cream py-16 md:py-24 border-y border-line/60">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-10 md:mb-12 max-w-[62ch]">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs mb-4">
              Our model
            </div>
            <h2 className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-black tracking-tight text-ink">
              Inspect. Identify. Repair.{" "}
              <span className="bg-gradient-to-r from-amber-500 to-yellow-dark bg-clip-text text-transparent">
                Maintain.
              </span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {MODEL_STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="group relative flex flex-col justify-between h-full rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xs transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-300 hover:shadow-xl">
                  {/* Subtle top indicator */}
                  <div className="pointer-events-none absolute top-0 left-6 right-6 h-1 rounded-b-full bg-gradient-to-r from-transparent via-amber-400/0 to-transparent transition-all duration-300 group-hover:via-amber-400" />

                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 border border-amber-200/80 text-yellow-dark shadow-2xs transition-all duration-300 group-hover:bg-yellow group-hover:text-ink group-hover:scale-105">
                        <s.icon className="h-6 w-6" strokeWidth="1.9" />
                      </span>
                      <span className="rounded-xl border border-amber-200/70 bg-amber-50/60 px-2.5 py-1 font-mono text-xs font-black tracking-wider text-amber-900">
                        {s.num}
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-black text-ink transition-colors group-hover:text-amber-950">
                      {s.title}
                    </h3>
                    <p className="text-xs sm:text-[13.5px] leading-relaxed text-body">
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
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-10 md:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-[56ch]">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs mb-4">
                Proof, not promises
              </div>
              <h2 className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-black tracking-tight text-ink">
                Recent{" "}
                <span className="bg-gradient-to-r from-amber-500 to-yellow-dark bg-clip-text text-transparent">
                  Work
                </span>
              </h2>
            </div>
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-5 py-2.5 text-xs sm:text-[13px] font-black text-ink shadow-2xs transition-all hover:border-ink hover:bg-slate-50 hover:shadow-xs w-fit"
            >
              <span>View all projects</span>
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-2 gap-3.5 sm:gap-5 sm:grid-cols-4">
            {recentWork.map((p, i) => {
              const isLocal = p.image_url?.startsWith("/");
              return (
                <Reveal
                  key={p.id || p.title}
                  delay={i * 0.07}
                  className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-slate-100 shadow-2xs transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-300 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {isLocal ? (
                      <Image
                        src={p.image_url}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                      />
                    ) : (
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                      />
                    )}
                    {/* Gradient overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

                    {p.category && (
                      <span className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3 rounded-full border border-white/40 bg-white/90 backdrop-blur-md px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-black text-ink shadow-2xs truncate max-w-[85%]">
                        {p.category}
                      </span>
                    )}

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3">
                      <b className="block text-xs sm:text-sm font-extrabold text-white leading-tight drop-shadow-sm truncate">
                        {p.title}
                      </b>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Safety & Compliance Section */}
      <section className="py-16 md:py-24 bg-cream/60 border-t border-line/60">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-10 md:mb-12 max-w-[62ch]">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs mb-4">
              Safety &amp; compliance
            </div>
            <h2 className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-black tracking-tight text-ink">
              How We Keep Every Job{" "}
              <span className="bg-gradient-to-r from-amber-500 to-yellow-dark bg-clip-text text-transparent">
                Safe
              </span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ShieldIcon, title: "Safety-Focused Work", desc: "Standard safety practices followed on every job, residential or commercial." },
              { icon: CheckCircle, title: "Proper Inspection", desc: "Every job starts with a proper inspection before any work begins." },
              { icon: ReportIcon, title: "Testing & Documentation", desc: "Work is tested before handover, with findings documented for your records." },
              { icon: AmcBadge, title: "Maintenance Reports", desc: "AMC and health-check customers receive a clear report after every visit." },
              { icon: AwardIcon, title: "GST Invoice", desc: "Transparent, GST-compliant invoicing for all completed work." },
              { icon: GearIcon, title: "Genuine Parts", desc: "Standard, reliable electrical components used across our work." },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
                <div className="group flex h-full items-start gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-md">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-50 border border-amber-200/80 text-yellow-dark shadow-2xs transition-all duration-300 group-hover:bg-yellow group-hover:text-ink group-hover:scale-105">
                    <f.icon className="h-5 w-5" strokeWidth="1.9" />
                  </span>
                  <div>
                    <b className="mb-1.5 block text-sm sm:text-base font-black text-ink transition-colors group-hover:text-amber-950">
                      {f.title}
                    </b>
                    <p className="text-xs sm:text-[13px] leading-relaxed text-body">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Where We Work Section */}
      <section className="relative overflow-hidden bg-cream py-16 md:py-24 border-t border-line/60">
        <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-yellow/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />

        <div className="relative z-[1] mx-auto max-w-wrap px-6">
          <Reveal className="mb-10 md:mb-12 max-w-[62ch]">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs mb-4">
              Where we work
            </div>
            <h2 className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-black tracking-tight text-ink">
              Electrical Services Across{" "}
              <span className="bg-gradient-to-r from-amber-500 to-yellow-dark bg-clip-text text-transparent">
                {city}
              </span>{" "}
              &amp; Nearby Areas
            </h2>
            <p className="mt-3 max-w-[58ch] text-[15.5px] leading-relaxed text-body">
              House Electric provides electrical repair, installation, maintenance and AMC services
              throughout {city}, {state} — including these localities.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 gap-3 sm:gap-3.5 sm:grid-cols-3 md:grid-cols-4">
            {areas.map((a, i) => (
              <Reveal key={a} delay={(i % 8) * 0.03}>
                <div className="group/pin flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 sm:px-4 sm:py-3.5 text-xs sm:text-[13.5px] font-black text-ink shadow-2xs backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:bg-white hover:shadow-xs min-w-0">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-amber-50 border border-amber-200/70 text-yellow-dark transition-transform group-hover/pin:scale-110">
                    <PinIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">{a}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-8 sm:mt-10">
            <Link
              href="/service-areas"
              className="group inline-flex items-center gap-2 rounded-2xl border border-slate-300/90 bg-white px-5 py-3 text-xs sm:text-[13px] font-black text-ink shadow-2xs transition-all hover:border-ink hover:shadow-xs"
            >
              <span>View all service areas</span>
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Section */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-white border-t border-line/60">
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative z-[1] mx-auto max-w-wrap px-6">
          <Reveal className="mb-10 md:mb-12 max-w-[60ch]">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs mb-4">
              Common questions
            </div>
            <h2 className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-black tracking-tight text-ink">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-amber-500 to-yellow-dark bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <Reveal delay={0.08}>
              <FAQAccordion items={faqs.slice(0, 3)} />
            </Reveal>
            <Reveal delay={0.16}>
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
