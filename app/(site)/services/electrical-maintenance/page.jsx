"use client";

import { motion } from "framer-motion";
import CTA from "@/components/CTA";
import ChecklistGrid from "@/components/ChecklistGrid";
import EnquiryForm from "@/components/EnquiryForm";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const ITEMS = [
  "Preventive Electrical Inspection",
  "Distribution Board & MCB Testing",
  "Infrared Thermal Imaging",
  "Earthing Resistance Measurement",
  "Voltage & Current Balancing",
  "UPS & Generator Crossover Check",
  "Capacitor & APFC Panel Service",
  "Emergency Lighting & Backup Testing",
];

const ADVANTAGES = [
  {
    title: "Prevent Outages Before They Happen",
    desc: "Scheduled thermography and load audits spot loose joints, wire corrosion, and overheating before sudden blackouts occur.",
  },
  {
    title: "Extend Appliance & Equipment Life",
    desc: "Voltage stabilization and phase balancing safeguard sensitive electronics, HVAC units, and heavy industrial machinery.",
  },
  {
    title: "Lower Energy Bills (Power Factor 0.99)",
    desc: "APFC calibration and harmonic filtering optimize energy efficiency, preventing hefty utility power factor penalties.",
  },
  {
    title: "Comprehensive Digital Maintenance Reports",
    desc: "Receive itemized health audit logs, thermography thermal scans, and actionable safety recommendations after every visit.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Visual & Thermal Inspection",
    desc: "Infrared scan of main distribution boards, busbars, transformers, and high-power connections.",
  },
  {
    step: "02",
    title: "Electrical Parameter Logging",
    desc: "Testing insulation resistance, phase load balance, earthing pit ohms, and voltage stability.",
  },
  {
    step: "03",
    title: "Tightening & Component Servicing",
    desc: "Torque-tightening terminal connections, cleaning DB dust, and replacing worn breaker contacts.",
  },
  {
    step: "04",
    title: "Audit Certificate & Report Handover",
    desc: "Delivering a digital audit report with risk ratings, thermography photos, and next-visit schedules.",
  },
];

export default function ElectricalMaintenancePage() {
  const { phone } = useSiteSettings();
  return (
    <main>
      <PageHero
        eyebrow="PREVENTIVE MAINTENANCE"
        title={
          <>
            Proactive, Zero-Downtime <span className="text-yellow font-extrabold">Electrical Maintenance</span>
          </>
        }
        subtitle="Protect your home, office, or factory with routine preventive electrical maintenance, thermal imaging, and guaranteed SLA support."
        primaryCta={{ label: "Schedule Maintenance Audit", href: "#booking" }}
        secondaryCta={{ label: "Call 24/7 Hotline", href: `tel:${phone.replace(/\s+/g, "")}` }}
        image="/service-maintenance.png"
        imageAlt="Engineer performing preventive electrical maintenance"
      />

      {/* SLA Metrics Strip */}
      <section className="border-y border-line/80 bg-white py-7 shadow-sm">
        <div className="mx-auto max-w-wrap px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            <div className="text-center md:text-left">
              <span className="block text-xl font-black text-ink md:text-2xl">
                99.9<span className="text-yellow">%</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                Uptime Protection
              </span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-xl font-black text-ink md:text-2xl">
                -35<span className="text-yellow">%</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                Breakdown Reduction
              </span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-xl font-black text-ink md:text-2xl">
                100<span className="text-yellow">%</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                Digital Audit Logs
              </span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-xl font-black text-ink md:text-2xl">
                24/7<span className="text-yellow"> SLA</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                Priority Dispatch
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Scope Checklist */}
      <section className="py-16 md:py-[74px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-10 max-w-[62ch]">
            <p className="eyebrow">MAINTENANCE CAPABILITIES</p>
            <h2 className="mb-3">Complete Preventive Maintenance Scope</h2>
            <p className="text-[15.5px] leading-relaxed text-charcoal/80">
              Our certified electrical engineers inspect every point of risk to keep your electrical infrastructure running flawlessly.
            </p>
          </Reveal>
          <ChecklistGrid items={ITEMS} columns={4} />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-cream py-16 md:py-[74px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-12 max-w-[62ch]">
            <p className="eyebrow">PREVENTIVE ADVANTAGES</p>
            <h2 className="mb-3">Why Proactive Maintenance Saves Money</h2>
            <p className="text-[15.5px] leading-relaxed text-charcoal/80">
              Catching micro-faults early costs a fraction of emergency repairs or business downtime.
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
            <p className="eyebrow">MAINTENANCE WORKFLOW</p>
            <h2 className="mb-3">Our 4-Step Preventive Maintenance Audit</h2>
            <p className="text-[15.5px] leading-relaxed text-charcoal/80">
              A systematic inspection process backed by thermal imaging technology.
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
        title="Schedule Your Preventive Maintenance Audit"
        subtitle="Submit your site details to schedule an inspection with our Lead Electrical Engineer."
      />

      <CTA />
    </main>
  );
}
