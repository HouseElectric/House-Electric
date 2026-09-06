"use client";

import { motion } from "framer-motion";
import CTA from "@/components/CTA";
import ChecklistGrid from "@/components/ChecklistGrid";
import EnquiryForm from "@/components/EnquiryForm";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const ITEMS = [
  "Comprehensive Fault Finding",
  "Switch & Socket Replacement",
  "MCB & DB Overhaul",
  "RCCB / ELCB Sensitivity Testing",
  "Short-Circuit & Spark Repairs",
  "Internal Wiring Repair & Re-laying",
  "Lighting & Appliance Point Fixing",
  "Main Board & Neutral Line Repair",
];

const ADVANTAGES = [
  {
    title: "Thermal & Digital Diagnosis",
    desc: "We use infrared thermography and digital multimeters to detect hidden hotspots, wire degradation, and loose terminals before failures occur.",
  },
  {
    title: "100% Genuine ISI & OEM Parts",
    desc: "We only use original branded switchgear, fire-retardant copper wires, and certified breakers with official manufacturer warranties.",
  },
  {
    title: "Upfront Transparent Pricing",
    desc: "No hidden fees or unexpected surcharges. Our technicians inspect first and provide a clear quote before starting any work.",
  },
  {
    title: "30-Day Service Guarantee",
    desc: "All repair work is backed by our 30-day workmanship warranty. If the issue reoccurs, we rectify it immediately at zero cost.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Rapid Dispatch & Inspection",
    desc: "Our verified technician arrives at your site with full diagnostic gear and conducts an initial safety check.",
  },
  {
    step: "02",
    title: "Root Cause Diagnosis & Flat Quote",
    desc: "We identify the exact issue and present a transparent upfront repair estimate for your approval.",
  },
  {
    step: "03",
    title: "Precision Repair & Component Fix",
    desc: "Using industrial safety tools and genuine spares, we resolve the fault adhering to strict electrical safety codes.",
  },
  {
    step: "04",
    title: "Load Test & Safety Handover",
    desc: "We test voltage stability, clear all debris, and hand over a 30-day warranty card.",
  },
];

export default function ElectricalRepairPage() {
  const { phone } = useSiteSettings();
  return (
    <main>
      <PageHero
        eyebrow="EXPERT ELECTRICAL REPAIR"
        title={
          <>
            Fast, Diagnostic-Led <span className="text-yellow font-extrabold">Electrical Repairs</span>
          </>
        }
        subtitle="From a tripping MCB to a complex short-circuit emergency, our certified electricians diagnose and fix issues safely — for homes, offices, and commercial properties."
        primaryCta={{ label: "Book a Repair Now", href: "#booking" }}
        secondaryCta={{ label: "Call 24/7 Hotline", href: `tel:${phone.replace(/\s+/g, "")}` }}
        image="/service-repair.png"
        imageAlt="Certified technician performing electrical repair"
      />

      {/* SLA Metrics Strip */}
      <section className="border-y border-line/80 bg-white py-7 shadow-sm">
        <div className="mx-auto max-w-wrap px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            <div className="text-center md:text-left">
              <span className="block text-xl font-black text-ink md:text-2xl">
                30<span className="text-yellow"> Mins</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                Average Arrival SLA
              </span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-xl font-black text-ink md:text-2xl">
                100<span className="text-yellow">%</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                Genuine ISI Spares
              </span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-xl font-black text-ink md:text-2xl">
                30<span className="text-yellow"> Days</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                Service Guarantee
              </span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-xl font-black text-ink md:text-2xl">
                10k<span className="text-yellow">+</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                Repairs Completed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Scope Checklist */}
      <section className="py-16 md:py-[74px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-10 max-w-[62ch]">
            <p className="eyebrow">REPAIR SERVICES SCOPE</p>
            <h2 className="mb-3">Comprehensive Electrical Fault Resolution</h2>
            <p className="text-[15.5px] leading-relaxed text-charcoal/80">
              No matter how complex the fault, we carry full diagnostic equipment to repair issues on the first visit.
            </p>
          </Reveal>
          <ChecklistGrid items={ITEMS} columns={4} />
        </div>
      </section>

      {/* Why Choose Us Pillars */}
      <section className="bg-cream py-16 md:py-[74px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-12 max-w-[62ch]">
            <p className="eyebrow">THE HOUSE ELECTRIC ADVANTAGE</p>
            <h2 className="mb-3">Why Customers Choose Us For Repairs</h2>
            <p className="text-[15.5px] leading-relaxed text-charcoal/80">
              We eliminate guesswork with infrared thermography and high-grade safety standards.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {ADVANTAGES.map((item, i) => (
              <motion.div
                key={item.title}
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
                  <h3 className="text-base font-extrabold text-ink">{item.title}</h3>
                </div>
                <p className="text-[14.5px] leading-relaxed text-charcoal/80 pl-11">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Step by Step Repair Process */}
      <section className="py-16 md:py-[74px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-12 max-w-[62ch]">
            <p className="eyebrow">REPAIR WORKFLOW</p>
            <h2 className="mb-3">Our 4-Step Repair Protocol</h2>
            <p className="text-[15.5px] leading-relaxed text-charcoal/80">
              A standardized engineering approach to ensure your property remains completely safe.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative rounded-2xl border border-line/80 bg-white p-7 shadow-sm transition-all duration-300 hover:border-yellow/50 hover:shadow-lg"
              >
                <span className="mb-4 inline-block font-mono text-3xl font-black text-yellow">
                  {s.step}
                </span>
                <h3 className="mb-2 text-base font-extrabold text-ink">{s.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-charcoal/80">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Booking Form */}
      <EnquiryForm
        id="booking"
        variant="booking"
        eyebrow="FAST BOOKING"
        title="Schedule Your Electrical Repair"
        subtitle="Submit your details below and our lead technician will confirm your booking within minutes."
      />

      <CTA />
    </main>
  );
}

