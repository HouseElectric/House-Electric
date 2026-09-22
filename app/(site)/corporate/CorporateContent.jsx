"use client";

import { motion } from "framer-motion";
import ChecklistGrid from "@/components/ChecklistGrid";
import EnquiryForm from "@/components/EnquiryForm";
import FAQAccordion from "@/components/FAQAccordion";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { AlertIcon, ArrowRightIcon, BuildingIcon, CheckCircle, ShieldIcon, XIcon } from "@/components/icons";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const FALLBACK = {
  hero_eyebrow: "Corporate & Commercial Solutions",
  hero_title_plain: "Enterprise Electrical Engineering for",
  hero_title_highlight: "Offices & Facilities",
  subtitle:
    "A dedicated single point of contact for corporate offices, commercial towers, industrial sites, and facility managers.",
  primary_cta_label: "Request Site Assessment",
  secondary_cta_label: "Call Direct SLA Hotline",
  image_url: "/customer-corporate.png",
};

export default function CorporateContent({ service }) {
  const { phone } = useSiteSettings();
  const s = { ...FALLBACK, ...(service || {}) };
  const hidden = service?.hidden_sections || [];
  const isVisible = (key) => !hidden.includes(key);

  return (
    <main>
      <PageHero
        eyebrow={s.hero_eyebrow}
        title={
          <>
            {s.hero_title_plain} <span className="text-yellow font-extrabold">{s.hero_title_highlight}</span>
          </>
        }
        subtitle={s.subtitle}
        primaryCta={{ label: s.primary_cta_label, href: "#quote" }}
        secondaryCta={{ label: s.secondary_cta_label, href: `tel:${phone.replace(/\s+/g, "")}` }}
        image={s.image_url}
        imageAlt="Corporate office building electrical infrastructure"
      />

      {/* Without Us / With Us */}
      {isVisible("problem") && (service?.problem_section?.without_items?.length > 0 || service?.problem_section?.with_items?.length > 0) && (
        <section className="py-16 md:py-[74px]">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mx-auto mb-12 max-w-[62ch] text-center">
              {service.problem_section.eyebrow && <p className="eyebrow mx-auto">{service.problem_section.eyebrow}</p>}
              {service.problem_section.heading && <h2 className="mb-3">{service.problem_section.heading}</h2>}
              {service.problem_section.subtitle && (
                <p className="text-[15.5px] leading-relaxed text-charcoal/80">{service.problem_section.subtitle}</p>
              )}
            </Reveal>

            <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2">
              <Reveal delay={0.05}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-red-200/80 bg-gradient-to-br from-red-50/70 via-white to-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                  <span className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-red-500 to-rose-600" />
                  <div className="mb-5 flex items-center gap-3">
                    <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                      <XIcon className="h-5 w-5" />
                    </span>
                    <span className="text-[13px] font-extrabold uppercase tracking-wide text-red-700">Without Us</span>
                  </div>
                  <ul className="space-y-3.5 text-[14px] text-ink-soft">
                    {(service.problem_section.without_items || []).map((step) => (
                      <li key={step} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-red-100 text-red-600">
                          <XIcon className="h-3.5 w-3.5" />
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <span className="pointer-events-none absolute left-1/2 top-1/2 z-[1] hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white bg-ink text-yellow shadow-lg md:grid">
                <ArrowRightIcon className="h-4 w-4" />
              </span>

              <Reveal delay={0.1}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                  <span className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-emerald-500 to-teal-600" />
                  <div className="mb-5 flex items-center gap-3">
                    <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                      <CheckCircle className="h-5 w-5" />
                    </span>
                    <span className="text-[13px] font-extrabold uppercase tracking-wide text-emerald-700">With House Electric</span>
                  </div>
                  <ul className="space-y-3.5 text-[14px] text-ink">
                    {(service.problem_section.with_items || []).map((step) => (
                      <li key={step} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-emerald-100 text-emerald-600">
                          <CheckCircle className="h-3.5 w-3.5" />
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* Stats SLA Metric Bar */}
      {isVisible("stats") && service?.sla_stats?.length > 0 && (
        <section className="border-y border-line/80 bg-white py-8 shadow-sm">
          <div className="mx-auto max-w-wrap px-6">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {service.sla_stats.map((stat, i) => (
                <div key={i} className="text-center md:text-left">
                  <span className="block text-2xl font-black text-ink md:text-3xl">
                    {stat.value}
                    <span className="text-yellow">{stat.suffix}</span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Core Capabilities Checklist */}
      {isVisible("checklist") && service?.checklist_items?.length > 0 && (
        <section className="py-16 md:py-[74px]">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mb-10 max-w-[65ch]">
              <p className="eyebrow">{service.checklist_section?.eyebrow || "Our Capabilities"}</p>
              <h2 className="mb-3">{service.checklist_section?.heading || "End-to-End Electrical Solutions"}</h2>
              {service.checklist_section?.subtitle && (
                <p className="text-[15.5px] leading-relaxed text-charcoal/80">{service.checklist_section.subtitle}</p>
              )}
            </Reveal>
            <ChecklistGrid items={service.checklist_items} columns={4} />
          </div>
        </section>
      )}

      {/* What's Chargeable Separately */}
      {isVisible("exclusions") && service?.exclusions_section?.items?.length > 0 && (
        <section className="py-16 md:py-[74px]">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mb-10 max-w-[64ch]">
              {service.exclusions_section.eyebrow && <p className="eyebrow">{service.exclusions_section.eyebrow}</p>}
              {service.exclusions_section.heading && <h2 className="mb-3">{service.exclusions_section.heading}</h2>}
              {service.exclusions_section.subtitle && (
                <p className="text-[15.5px] leading-relaxed text-charcoal/80">{service.exclusions_section.subtitle}</p>
              )}
            </Reveal>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {service.exclusions_section.items.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-amber-200/70 bg-amber-50/50 px-5 py-3.5"
                >
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-amber-100 text-amber-700">
                    <AlertIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[13.5px] font-bold text-ink">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Industry Sector Cards */}
      {isVisible("types") && service?.types_section?.items?.length > 0 && (
        <section className="bg-cream py-16 md:py-[74px]">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mb-12 max-w-[62ch]">
              {service.types_section.eyebrow && <p className="eyebrow">{service.types_section.eyebrow}</p>}
              {service.types_section.heading && <h2 className="mb-3">{service.types_section.heading}</h2>}
              {service.types_section.subtitle && (
                <p className="text-[15.5px] leading-relaxed text-charcoal/80">{service.types_section.subtitle}</p>
              )}
            </Reveal>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {service.types_section.items.map((sector, i) => (
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
                        <BuildingIcon className="h-6 w-6" />
                      </span>
                      <h3 className="text-lg font-extrabold text-ink transition-colors group-hover:text-yellow-dark">{sector.title}</h3>
                    </div>
                    <p className="mb-6 text-[14.5px] leading-relaxed text-charcoal/80">{sector.desc}</p>
                  </div>

                  {sector.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 border-t border-line/50 pt-2">
                      {sector.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-cream px-3 py-1 text-xs font-semibold text-ink/80">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* The Corporate Partnership Framework */}
      {isVisible("process") && service?.process_section?.items?.length > 0 && (
        <section className="py-16 md:py-[74px]">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mb-12 max-w-[62ch]">
              {service.process_section.eyebrow && <p className="eyebrow">{service.process_section.eyebrow}</p>}
              {service.process_section.heading && <h2 className="mb-3">{service.process_section.heading}</h2>}
              {service.process_section.subtitle && (
                <p className="text-[15.5px] leading-relaxed text-charcoal/80">{service.process_section.subtitle}</p>
              )}
            </Reveal>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {service.process_section.items.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="relative rounded-2xl border border-line/80 bg-white p-7 shadow-sm transition-all duration-300 hover:border-yellow/50 hover:shadow-lg"
                >
                  <span className="mb-4 inline-block font-mono text-3xl font-black text-yellow">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mb-2 text-base font-extrabold text-ink">{step.title}</h3>
                  <p className="text-[14px] leading-relaxed text-charcoal/80">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Facility Managers Partner With Us */}
      {isVisible("advantages") && service?.advantages_section?.items?.length > 0 && (
        <section className="bg-cream py-16 md:py-[74px]">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mb-12 max-w-[62ch]">
              {service.advantages_section.eyebrow && <p className="eyebrow">{service.advantages_section.eyebrow}</p>}
              {service.advantages_section.heading && <h2 className="mb-3">{service.advantages_section.heading}</h2>}
              {service.advantages_section.subtitle && (
                <p className="text-[15.5px] leading-relaxed text-charcoal/80">{service.advantages_section.subtitle}</p>
              )}
            </Reveal>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {service.advantages_section.items.map((pillar, i) => (
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
                  <p className="text-[14.5px] leading-relaxed text-charcoal/80 pl-11">{pillar.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why House Electric */}
      {isVisible("why_he") && service?.why_house_electric_section?.items?.length > 0 && (
        <section className="bg-cream py-16 md:py-[74px]">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mb-12 max-w-[62ch]">
              {service.why_house_electric_section.eyebrow && <p className="eyebrow">{service.why_house_electric_section.eyebrow}</p>}
              {service.why_house_electric_section.heading && <h2 className="mb-3">{service.why_house_electric_section.heading}</h2>}
              {service.why_house_electric_section.subtitle && (
                <p className="text-[15.5px] leading-relaxed text-charcoal/80">{service.why_house_electric_section.subtitle}</p>
              )}
            </Reveal>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {service.why_house_electric_section.items.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group relative overflow-hidden rounded-3xl border border-line/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300/60 hover:shadow-xl"
                >
                  <span className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-blue-500 to-indigo-600" />
                  <div className="mb-3 flex items-center gap-3">
                    <span className="grid h-10 w-10 flex-none place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                      <ShieldIcon className="h-[18px] w-[18px]" />
                    </span>
                    <h3 className="text-base font-extrabold text-ink">{item.title}</h3>
                  </div>
                  <p className="pl-[52px] text-[14.5px] leading-relaxed text-charcoal/80">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {isVisible("faqs") && service?.faqs?.length > 0 && (
        <section className="py-16 md:py-[74px]">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mx-auto mb-10 max-w-[60ch] text-center">
              <p className="eyebrow">Common questions</p>
              <h2>Frequently Asked Questions</h2>
            </Reveal>
            <Reveal delay={0.1} className="mx-auto max-w-[72ch]">
              <FAQAccordion items={service.faqs} />
            </Reveal>
          </div>
        </section>
      )}

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
