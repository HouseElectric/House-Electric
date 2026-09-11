import { notFound } from "next/navigation";
import CTA from "@/components/CTA";
import ChecklistGrid from "@/components/ChecklistGrid";
import EnquiryForm from "@/components/EnquiryForm";
import FAQAccordion from "@/components/FAQAccordion";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { ArrowRightIcon } from "@/components/icons";
import { supabase } from "@/lib/supabase";
import { getContactSettings, telHref, waHref } from "@/lib/getContactSettings";

export const revalidate = 60;

async function getService(slug) {
  if (!supabase) return null;
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }) {
  const [service, { city, state }] = await Promise.all([getService(params.slug), getContactSettings()]);
  if (!service) return { title: "Service Not Found — House Electric" };
  return {
    title: `${service.title} in ${city} | House Electric`,
    description: service.description
      ? `${service.description} Serving ${city}, ${state} and nearby areas.`
      : `${service.title} in ${city}, ${state} — book with House Electric.`,
    alternates: { canonical: service.href || `/services/${params.slug}` },
  };
}

export default async function ServiceDetailPage({ params }) {
  const [service, { phone, whatsapp }] = await Promise.all([getService(params.slug), getContactSettings()]);
  if (!service) notFound();

  // Saved tel:/wa.me hrefs can go stale if the business phone number ever changes —
  // always resolve these two specific CTA kinds against the live contact settings
  // instead of trusting whatever was saved on the service row.
  const resolveHref = (href, fallback) => {
    if (!href) return fallback;
    if (href.startsWith("tel:")) return telHref(phone);
    if (href.startsWith("https://wa.me/")) return waHref(whatsapp, `Hi, I'd like to book ${service.title}.`);
    return href;
  };

  const primaryCta = {
    label: service.primary_cta_label || "Book This Service",
    href: resolveHref(service.primary_cta_href, "#booking"),
  };
  // A primary CTA that points to a real page (e.g. AMC's own Plans catalog) rather
  // than the in-page "#booking" anchor means there's somewhere more useful to send
  // pricing clicks than the generic booking form below.
  const pricingLink = primaryCta.href && !primaryCta.href.startsWith("#") ? primaryCta.href : null;
  const pricingHeadline = service.price_cta_label?.trim() || service.price_label;

  const faqs = service.faqs?.length > 0 ? service.faqs : [];
  const faqJsonLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <main>
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
      <PageHero
        eyebrow={service.hero_eyebrow || "Our Services"}
        title={
          service.hero_title_plain || service.hero_title_highlight ? (
            <>
              {service.hero_title_plain} <span className="text-yellow font-extrabold">{service.hero_title_highlight}</span>
            </>
          ) : (
            service.title
          )
        }
        subtitle={service.subtitle || service.description}
        primaryCta={primaryCta}
        secondaryCta={{
          label: service.secondary_cta_label || "Get a Quote",
          href: resolveHref(service.secondary_cta_href, "/contact"),
        }}
        image={service.image_url}
        imageAlt={service.title}
      />

      {service.sla_stats?.length > 0 && (
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

      {service.checklist_items?.length > 0 && (
        <section className="py-16 md:py-[74px]">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mb-10 max-w-[62ch]">
              <p className="eyebrow">{service.checklist_section?.eyebrow || "What's included"}</p>
              <h2 className="mb-3">{service.checklist_section?.heading || `${service.title} — What We Cover`}</h2>
              {service.checklist_section?.subtitle && (
                <p className="text-[15.5px] leading-relaxed text-charcoal/80">{service.checklist_section.subtitle}</p>
              )}
            </Reveal>
            <ChecklistGrid items={service.checklist_items} columns={4} />
          </div>
        </section>
      )}

      {service.price_label && (
        <section className={service.checklist_items?.length > 0 ? "pb-16 md:pb-[74px]" : "py-16 md:py-[74px]"}>
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mx-auto max-w-md">
              {(() => {
                const CardTag = pricingLink ? "a" : "div";
                return (
                  <CardTag
                    {...(pricingLink ? { href: pricingLink } : {})}
                    className={`group relative block overflow-hidden rounded-3xl border border-yellow/25 bg-gradient-to-b from-cream to-white px-6 py-8 text-center shadow-[0_20px_45px_-25px_rgba(242,176,30,0.5)] sm:px-10 ${
                      pricingLink
                        ? "transition-all duration-300 hover:-translate-y-1 hover:border-yellow/60 hover:shadow-[0_28px_55px_-25px_rgba(242,176,30,0.65)]"
                        : ""
                    }`}
                  >
                    <div className="glow-blob left-1/2 top-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 bg-yellow/20 opacity-60" />
                    <span className="relative mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-yellow/15 text-[20px] font-black text-yellow-dark ring-4 ring-white">
                      ₹
                    </span>
                    <p className="relative text-[12px] font-bold uppercase tracking-wider text-body">Pricing</p>
                    <p className="relative mt-1 text-[26px] font-extrabold leading-tight text-ink">{pricingHeadline}</p>
                    {pricingLink && (
                      <span className="relative mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-yellow-dark">
                        {primaryCta.label}
                        <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    )}
                  </CardTag>
                );
              })()}
            </Reveal>
          </div>
        </section>
      )}

      {service.advantages_section?.items?.length > 0 && (
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
              {service.advantages_section.items.map((item, i) => (
                <Reveal key={i} delay={i * 0.08} y={18}>
                  <div className="rounded-2xl border border-line/80 bg-white p-7 shadow-sm transition-all duration-300 hover:border-yellow/50 hover:shadow-lg">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow/20 text-yellow-dark font-extrabold text-sm">
                        ✓
                      </span>
                      <h3 className="text-base font-extrabold text-ink">{item.title}</h3>
                    </div>
                    <p className="text-[14.5px] leading-relaxed text-charcoal/80 pl-11">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {service.process_section?.items?.length > 0 && (
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
                <Reveal key={i} delay={i * 0.08} y={20}>
                  <div className="relative rounded-2xl border border-line/80 bg-white p-7 shadow-sm transition-all duration-300 hover:border-yellow/50 hover:shadow-lg">
                    <span className="mb-4 inline-block font-mono text-3xl font-black text-yellow">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mb-2 text-base font-extrabold text-ink">{step.title}</h3>
                    <p className="text-[13.5px] leading-relaxed text-charcoal/80">{step.desc}</p>
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

      <EnquiryForm
        id="booking"
        variant="booking"
        eyebrow="Book Now"
        title={`Book ${service.title}`}
        subtitle={service.booking_subtitle || "Fill in your details and our team will confirm your booking shortly."}
      />

      <CTA />
    </main>
  );
}
