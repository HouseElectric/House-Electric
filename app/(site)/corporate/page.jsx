"use client";

import { motion } from "framer-motion";
import ChecklistGrid from "@/components/ChecklistGrid";
import EnquiryForm from "@/components/EnquiryForm";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const ITEMS = [
  "Preventive Routine Audits",
  "24/7 SLA Breakdown Support",
  "HT/LT Switchgear & Panels",
  "Energy Efficiency & Harmonic Audits",
  "Statutory Safety & Fire Compliance",
  "APFC Panel & Load Calibration",
  "Workstation Fit-Out & UPS Lines",
  "Multi-Site Portfolio Care",
];

const SECTORS = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0v4m0 0h4m-4 0v4" />
      </svg>
    ),
    title: "IT Parks & Corporate Offices",
    desc: "Zero-downtime server room electricals, workplace LED array calibration, floor DB distribution, and automated UPS crossover lines.",
    tags: ["UPS Power Backup", "Workstation Cabling", "Smart Energy"],
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    title: "Commercial Malls & Retail Hubs",
    desc: "High footfall load management, architectural decorative lighting, main distribution board overhaul, and fire alarm synchronization.",
    tags: ["High Footfall Load", "Facade Lighting", "Safety Cutoffs"],
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Factories & Industrial Plants",
    desc: "Heavy machinery power lines, APFC panel power factor optimization (0.99 target), high-tension sub-station upkeep, and factory act safety certification.",
    tags: ["APFC Panel Overhaul", "HT Line Care", "Factory Act Safety"],
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Facility Management & Real Estate",
    desc: "White-label vendor support, dedicated Account Manager, unified monthly billing, consolidated health reports, and guaranteed SLA response across all sites.",
    tags: ["Dedicated SLA", "Unified Billing", "Single Contact"],
  },
];

const STEPS = [
  {
    step: "01",
    title: "Site Audit & Thermography Scan",
    desc: "Free comprehensive inspection of your HT/LT panels, earth pits, transformers, and load distribution with infrared thermal imaging.",
  },
  {
    step: "02",
    title: "Customized SLA & Rate Agreement",
    desc: "Tailored contract terms with guaranteed emergency response times, transparent parts pricing, and predefined SLA parameters.",
  },
  {
    step: "03",
    title: "Dedicated Account Manager & 24/7 Ops",
    desc: "Immediate assignment of a Senior Electrical Engineer, digital maintenance logs, and monthly executive health summaries.",
  },
];

const PILLARS = [
  {
    title: "Single Point of Accountable Contact",
    desc: "No dealing with unverified local technicians. Your dedicated Senior Engineer manages all visits, audits, and emergencies.",
  },
  {
    title: "Guaranteed 30-Min Emergency SLA",
    desc: "Rapid dispatch emergency team with guaranteed on-site response time to eliminate business downtime.",
  },
  {
    title: "Transparent Digital Audit Reports",
    desc: "Thermography thermal scans, earth resistance logs, and asset health status delivered after every visit.",
  },
  {
    title: "Certified & PPE-Compliant Engineers",
    desc: "Industrial-grade safety gear, licensed master electricians, and comprehensive liability insurance cover.",
  },
];

export default function CorporatePage() {
  const { phone } = useSiteSettings();
  return (
    <main>
      <PageHero
        eyebrow="Corporate & Commercial Solutions"
        title={
          <>
            Enterprise Electrical Engineering for{" "}
            <span className="text-yellow font-extrabold">Offices & Facilities</span>
          </>
        }
        subtitle="A dedicated single point of contact for corporate offices, commercial towers, industrial sites, and facility managers — guaranteeing 99.9% uptime and rapid 24/7 SLA breakdown response."
        primaryCta={{ label: "Request Corporate Quotation", href: "#quote" }}
        secondaryCta={{ label: "Call Direct SLA Hotline", href: `tel:${phone.replace(/\s+/g, "")}` }}
        image="/customer-corporate.png"
        imageAlt="Corporate office building electrical infrastructure"
      />

      {/* Stats SLA Metric Bar */}
      <section className="border-y border-line/80 bg-white py-8 shadow-sm">
        <div className="mx-auto max-w-wrap px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            <div className="text-center md:text-left">
              <span className="block text-2xl font-black text-ink md:text-3xl">
                99.9<span className="text-yellow">%</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                Uptime Commitment
              </span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-2xl font-black text-ink md:text-3xl">
                30<span className="text-yellow"> Mins</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                Emergency SLA Response
              </span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-2xl font-black text-ink md:text-3xl">
                500<span className="text-yellow">+</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                Corporate Sites Managed
              </span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-2xl font-black text-ink md:text-3xl">
                100<span className="text-yellow">%</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                ISO & Safety Compliant
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Checklist */}
      <section className="py-16 md:py-[74px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-10 max-w-[65ch]">
            <p className="eyebrow">OUR CORPORATE CAPABILITIES</p>
            <h2 className="mb-3">End-to-End Electrical Solutions Built for Business Leaders</h2>
            <p className="text-[15.5px] leading-relaxed text-charcoal/80">
              From preventive routine thermography to high-capacity transformer overhauls, we manage every facet of corporate power with safety and precision.
            </p>
          </Reveal>
          <ChecklistGrid items={ITEMS} columns={4} />
        </div>
      </section>

      {/* Industry Sector Cards */}
      <section className="bg-cream py-16 md:py-[74px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-12 max-w-[62ch]">
            <p className="eyebrow">SECTOR SPECIALIZATION</p>
            <h2 className="mb-3">Tailored Engineering for Your Infrastructure</h2>
            <p className="text-[15.5px] leading-relaxed text-charcoal/80">
              Every facility has distinct operational demands. We customize electrical protocols for specialized commercial environments.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {SECTORS.map((sector, i) => (
              <motion.div
                key={sector.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-line/80 bg-white p-7 shadow-sm transition-all duration-300 hover:border-yellow/60 hover:shadow-xl"
              >
                <div>
                  <div className="mb-5 flex items-center gap-4">
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-yellow/15 text-yellow-dark ring-1 ring-yellow/30 transition-colors group-hover:bg-yellow group-hover:text-ink">
                      {sector.icon}
                    </span>
                    <h3 className="text-lg font-extrabold text-ink transition-colors group-hover:text-yellow-dark">
                      {sector.title}
                    </h3>
                  </div>
                  <p className="mb-6 text-[14.5px] leading-relaxed text-charcoal/80">
                    {sector.desc}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-line/50">
                  {sector.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-cream px-3 py-1 text-xs font-semibold text-ink/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Corporate Partnership Framework */}
      <section className="py-16 md:py-[74px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-12 max-w-[62ch]">
            <p className="eyebrow">WORKFLOW & ONBOARDING</p>
            <h2 className="mb-3">How We Onboard & Maintain Corporate Accounts</h2>
            <p className="text-[15.5px] leading-relaxed text-charcoal/80">
              A transparent, structured workflow designed to integrate seamlessly with your existing facility management processes.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative rounded-2xl border border-line/80 bg-white p-7 shadow-sm transition-all duration-300 hover:border-yellow/50 hover:shadow-lg"
              >
                <span className="mb-4 inline-block font-mono text-3xl font-black text-yellow">
                  {s.step}
                </span>
                <h3 className="mb-2 text-base font-extrabold text-ink">{s.title}</h3>
                <p className="text-[14px] leading-relaxed text-charcoal/80">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Facility Managers Partner With Us */}
      <section className="bg-cream py-16 md:py-[74px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-12 max-w-[62ch]">
            <p className="eyebrow">EXECUTIVE ADVANTAGES</p>
            <h2 className="mb-3">Why Top Enterprises Trust House Electric</h2>
            <p className="text-[15.5px] leading-relaxed text-charcoal/80">
              We eliminate electrical downtime, compliance risks, and vendor management friction for commercial properties.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border border-line/80 bg-white p-7 shadow-sm transition-all duration-300 hover:border-yellow/50 hover:shadow-lg"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow/20 text-yellow-dark font-extrabold text-sm">
                    ✓
                  </span>
                  <h3 className="text-base font-extrabold text-ink">{pillar.title}</h3>
                </div>
                <p className="text-[14.5px] leading-relaxed text-charcoal/80 pl-11">
                  {pillar.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Quotation Form */}
      <EnquiryForm
        id="quote"
        variant="corporate"
        eyebrow="GET A TAILORED PROPOSAL"
        title="Request Corporate Electrical SLA Quote"
        subtitle="Share your site specifications or request a complimentary on-site thermography audit with our Lead Electrical Engineer."
      />
    </main>
  );
}

