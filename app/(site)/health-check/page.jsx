import CTA from "@/components/CTA";
import ChecklistGrid from "@/components/ChecklistGrid";
import FAQAccordion from "@/components/FAQAccordion";
import HealthCheckBookingForm from "@/components/HealthCheckBookingForm";
import Reveal from "@/components/Reveal";
import { AlertIcon, ArrowRightIcon, CheckCircle, PhoneIcon, ShieldIcon, XIcon } from "@/components/icons";
import { getContactSettings, telHref } from "@/lib/getContactSettings";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export async function generateMetadata() {
  const { city, state } = await getContactSettings();
  return {
    title: `Electrical Health Check in ${city} | House Electric`,
    description: `Book a professional electrical health check in ${city}, ${state} — full inspection of your DB, wiring, earthing and safety systems with a digital report and AMC recommendation.`,
    alternates: { canonical: "/health-check" },
  };
}

async function getServiceDetail() {
  if (!supabase) return null;
  const { data } = await supabase.from("services").select("*").eq("slug", "electrical-health-check").eq("active", true).maybeSingle();
  return data;
}

export default async function HealthCheckPage() {
  const [{ phone }, service] = await Promise.all([getContactSettings(), getServiceDetail()]);

  const heroTitlePlain = service?.hero_title_plain || "Know Exactly Where Your";
  const heroTitleHighlight = service?.hero_title_highlight || "Electrical System Stands";
  const heroSubtitle =
    service?.subtitle ||
    "A full inspection of your DB, wiring, switches, earthing and load — with a digital report and clear recommendations, whether or not you have an AMC.";
  const primaryCtaLabel = service?.primary_cta_label || "Book Electrical Health Check";

  // An admin can hide an otherwise-populated section without deleting its content
  // (e.g. drafted FAQs not ready to publish yet) — see hidden_sections on the services table.
  const hidden = service?.hidden_sections || [];
  const isVisible = (key) => !hidden.includes(key);
  const faqs = isVisible("faqs") && service?.faqs?.length > 0 ? service.faqs : [];

  return (
    <main>
      <section className="relative overflow-hidden bg-cream py-16 md:py-24">
        <div className="glow-blob -left-16 -top-16 h-72 w-72 bg-yellow/15 opacity-60" />
        <div className="glow-blob -bottom-16 -right-16 h-72 w-72 bg-yellow/15 opacity-60" />

        <div className="relative z-[1] mx-auto max-w-wrap px-6 text-center">
          <Reveal>
            <span className="eyebrow mx-auto">{service?.hero_eyebrow || "Electrical Health Check"}</span>
            <h1 className="mx-auto mb-4 max-w-[26ch] text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.1]">
              {heroTitlePlain} <span className="text-yellow">{heroTitleHighlight}</span>
            </h1>
            <p className="mx-auto mb-7 max-w-[56ch] text-[15.5px] leading-relaxed text-ink-soft">{heroSubtitle}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="#book"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-yellow px-7 py-3.5 text-sm font-extrabold text-ink shadow-[0_10px_25px_-5px_rgba(242,176,30,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark"
              >
                {primaryCtaLabel}
              </a>
              <a
                href={telHref(phone)}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-white px-7 py-3.5 text-sm font-bold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/40"
              >
                <PhoneIcon className="h-4 w-4" />
                Call Now
              </a>
            </div>
          </Reveal>
        </div>
      </section>

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

      {isVisible("stats") && service?.sla_stats?.length > 0 && (
        <section className="border-y border-line/80 bg-white py-7 shadow-sm">
          <div className="mx-auto max-w-wrap px-6">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {service.sla_stats.map((stat, i) => (
                <div key={i} className="text-center md:text-left">
                  <span className="block text-xl font-black text-ink md:text-2xl">
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

      {isVisible("types") && service?.types_section?.items?.length > 0 && (
        <section className="py-16 md:py-[74px]">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mb-12 max-w-[62ch]">
              {service.types_section.eyebrow && <p className="eyebrow">{service.types_section.eyebrow}</p>}
              {service.types_section.heading && <h2 className="mb-3">{service.types_section.heading}</h2>}
              {service.types_section.subtitle && (
                <p className="text-[15.5px] leading-relaxed text-charcoal/80">{service.types_section.subtitle}</p>
              )}
            </Reveal>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {service.types_section.items.map((t, i) => (
                <Reveal key={t.title} delay={i * 0.08} y={18}>
                  <div className="h-full rounded-2xl border border-line/80 bg-white p-7 shadow-sm">
                    <h3 className="mb-2 text-base font-extrabold text-ink">{t.title}</h3>
                    {t.desc && <p className="mb-4 text-[13.5px] leading-relaxed text-charcoal/80">{t.desc}</p>}
                    {t.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {t.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-bold text-ink/80">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {service.process_section.items.map((step, i) => (
                <Reveal key={step.title} delay={i * 0.08} y={20}>
                  <div className="relative rounded-2xl border border-line/80 bg-white p-7 shadow-sm transition-all duration-300 hover:border-yellow/50 hover:shadow-lg">
                    <span className="mb-4 inline-block font-mono text-3xl font-black text-yellow">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mb-2 text-base font-extrabold text-ink">{step.title}</h3>
                    <p className="text-[13.5px] leading-relaxed text-charcoal/80">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {isVisible("checklist") && service?.checklist_items?.length > 0 && (
        <section className="bg-cream py-16 md:py-[74px]">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mb-10 max-w-[62ch]">
              <p className="eyebrow">{service.checklist_section?.eyebrow || "What we check"}</p>
              <h2 className="mb-3">{service.checklist_section?.heading || "Every Health Check Covers"}</h2>
              {service.checklist_section?.subtitle && (
                <p className="text-[15.5px] leading-relaxed text-charcoal/80">{service.checklist_section.subtitle}</p>
              )}
            </Reveal>
            <ChecklistGrid items={service.checklist_items} columns={4} />
          </div>
        </section>
      )}

      {isVisible("advantages") && service?.advantages_section?.items?.length > 0 && (
        <section className="py-16 md:py-[74px]">
          <div className="mx-auto max-w-wrap px-6">
            {(service.advantages_section.eyebrow || service.advantages_section.heading) && (
              <Reveal className="mb-12 max-w-[62ch]">
                {service.advantages_section.eyebrow && <p className="eyebrow">{service.advantages_section.eyebrow}</p>}
                {service.advantages_section.heading && <h2 className="mb-3">{service.advantages_section.heading}</h2>}
              </Reveal>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {service.advantages_section.items.map((item, i) => (
                <Reveal key={item.title} delay={i * 0.08} y={18}>
                  <div className="h-full rounded-2xl border border-line/80 bg-white p-7 shadow-sm">
                    <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-yellow/20 text-yellow-dark font-extrabold text-sm">
                      <CheckCircle className="h-4 w-4" />
                    </span>
                    <h3 className="mb-2 text-base font-extrabold text-ink">{item.title}</h3>
                    <p className="text-[13.5px] leading-relaxed text-charcoal/80">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {isVisible("exclusions") && service?.exclusions_section?.items?.length > 0 && (
        <section className="bg-cream py-16 md:py-[74px]">
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
                <div key={item} className="flex items-center gap-3 rounded-xl border border-amber-200/70 bg-amber-50/50 px-5 py-3.5">
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

      {isVisible("why_he") && service?.why_house_electric_section?.items?.length > 0 && (
        <section className="py-16 md:py-[74px]">
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
                <Reveal key={item.title} delay={i * 0.08} y={18}>
                  <div className="group relative overflow-hidden rounded-3xl border border-line/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300/60 hover:shadow-xl">
                    <span className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-blue-500 to-indigo-600" />
                    <div className="mb-3 flex items-center gap-3">
                      <span className="grid h-10 w-10 flex-none place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                        <ShieldIcon className="h-[18px] w-[18px]" />
                      </span>
                      <h3 className="text-base font-extrabold text-ink">{item.title}</h3>
                    </div>
                    <p className="pl-[52px] text-[14.5px] leading-relaxed text-charcoal/80">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="bg-cream py-16 md:py-[74px]">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mx-auto mb-10 max-w-[60ch] text-center">
              <p className="eyebrow">Common questions</p>
              <h2>Frequently Asked Questions</h2>
            </Reveal>
            <Reveal delay={0.1} className="mx-auto max-w-[72ch]">
              <FAQAccordion items={faqs} />
            </Reveal>
          </div>
        </section>
      )}

      <HealthCheckBookingForm id="book" />

      <CTA />
    </main>
  );
}
