"use client";

import { motion } from "framer-motion";
import CTA from "@/components/CTA";
import ChecklistGrid from "@/components/ChecklistGrid";
import EnquiryForm from "@/components/EnquiryForm";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const ITEMS = [
  "New Home & Office Full Wiring",
  "Architectural & Accent LED Lighting",
  "Designer Fan & Chandelier Fitting",
  "Modular Switch & Smart Socket Fitting",
  "Main MCB, ELCB & DB Box Wiring",
  "High-Power Appliance Circuits (AC, Geyser, EV)",
  "Commercial Workstation & Conduit Cabling",
  "Earth Pit & Surge Protection Setup",
];

const ADVANTAGES = [
  {
    title: "IS-Code & Safety Compliant",
    desc: "Every installation adheres strictly to Indian Electricity Rules (IE Rules) ensuring proper grounding, wire gauge calculations, and zero fire risk.",
  },
  {
    title: "Neat Conduit & Concealed Wiring",
    desc: "Chasing walls or surface trunking is executed with laser alignment tools and dust-free cutting for ultra-clean aesthetic finishes.",
  },
  {
    title: "Load Calculation & Balance",
    desc: "We calculate exact Phase-Load distribution across MCBs to prevent frequent breaker tripping and voltage drop issues.",
  },
  {
    title: "1-Year Installation Warranty",
    desc: "Enjoy peace of mind with our 1-year comprehensive warranty on all installation workmanship and internal wiring joints.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Load Calculation & Planning",
    desc: "We analyze your electrical load requirements, draw circuit diagrams, and recommend ideal wire gauges and breaker sizes.",
  },
  {
    step: "02",
    title: "Conduit & Channel Laying",
    desc: "Precision wall chasing or surface conduit fitting with high-grade fire-retardant PVC/metallic conduits.",
  },
  {
    step: "03",
    title: "Wire Pulling & Panel Wiring",
    desc: "Pulling heavy-duty copper cables, wiring distribution boards, and installing modular switch matrices.",
  },
  {
    step: "04",
    title: "Insulation Test & Handover",
    desc: "Final megger insulation test, earthing verification, functional light check, and warranty certification.",
  },
];

export default function ElectricalInstallationPage() {
  const { phone } = useSiteSettings();
  return (
    <main>
      <PageHero
        eyebrow="PRECISION INSTALLATION"
        title={
          <>
            Clean, Code-Compliant <span className="text-yellow font-extrabold">Electrical Installations</span>
          </>
        }
        subtitle="New home construction, renovation, or a corporate fit-out — we plan and execute electrical installations that are safe, elegant, and built to last."
        primaryCta={{ label: "Book Installation Now", href: "#booking" }}
        secondaryCta={{ label: "Call 24/7 Hotline", href: `tel:${phone.replace(/\s+/g, "")}` }}
        image="/service-installation.png"
        imageAlt="Modern designer light and electrical installation"
      />

      {/* Metric Bar */}
      <section className="border-y border-line/80 bg-white py-7 shadow-sm">
        <div className="mx-auto max-w-wrap px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            <div className="text-center md:text-left">
              <span className="block text-xl font-black text-ink md:text-2xl">
                100<span className="text-yellow">%</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                IE Code Compliance
              </span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-xl font-black text-ink md:text-2xl">
                1<span className="text-yellow"> Year</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                Workmanship Warranty
              </span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-xl font-black text-ink md:text-2xl">
                Zero<span className="text-yellow"> Dust</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                Laser Wall Chasing
              </span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-xl font-black text-ink md:text-2xl">
                5k<span className="text-yellow">+</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                Sites Installed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Scope Checklist */}
      <section className="py-16 md:py-[74px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-10 max-w-[62ch]">
            <p className="eyebrow">INSTALLATION CAPABILITIES</p>
            <h2 className="mb-3">Full-Spectrum Electrical Setup Services</h2>
            <p className="text-[15.5px] leading-relaxed text-charcoal/80">
              From delicate crystal chandelier assembly to heavy-duty DB box routing, we deliver precision electrical craftsmanship.
            </p>
          </Reveal>
          <ChecklistGrid items={ITEMS} columns={4} />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-cream py-16 md:py-[74px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-12 max-w-[62ch]">
            <p className="eyebrow">THE INSTALLATION DIFFERENCE</p>
            <h2 className="mb-3">Engineered for Safety & Aesthetic Elegance</h2>
            <p className="text-[15.5px] leading-relaxed text-charcoal/80">
              We don&apos;t just connect wires — we design clean, balanced electrical networks tailored to modern spaces.
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

      {/* 4 Step Workflow */}
      <section className="py-16 md:py-[74px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-12 max-w-[62ch]">
            <p className="eyebrow">INSTALLATION WORKFLOW</p>
            <h2 className="mb-3">Our 4-Step Installation Protocol</h2>
            <p className="text-[15.5px] leading-relaxed text-charcoal/80">
              From blueprint calculation to final handover, every step is systematically checked for compliance.
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

      {/* Booking Form */}
      <EnquiryForm
        id="booking"
        variant="booking"
        eyebrow="FAST BOOKING"
        title="Schedule Your Electrical Installation"
        subtitle="Submit your requirements below to get a free estimate and book certified master installers."
      />

      <CTA />
    </main>
  );
}

