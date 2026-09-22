import CTA from "@/components/CTA";
import ChecklistGrid from "@/components/ChecklistGrid";
import EnquiryForm from "@/components/EnquiryForm";
import FAQAccordion from "@/components/FAQAccordion";
import Reveal from "@/components/Reveal";
import {
  AlertIcon,
  AmcBadge,
  ArrowRightIcon,
  CalendarIcon,
  ChevronDown,
  CheckCircle,
  ClockIcon,
  RefreshIcon,
  ShieldIcon,
  SparklesIcon,
  WalletIcon,
  WhatsAppIcon,
  XIcon,
} from "@/components/icons";
import { getContactSettings, waHref } from "@/lib/getContactSettings";
import { supabase } from "@/lib/supabase";
import AmcBuyButton from "@/components/AmcBuyButton";
import CoverageStatusIcon from "@/components/CoverageStatusIcon";
import { getCoverageItems } from "@/lib/amcCoverage";
import { CATEGORY_META, DEFAULT_CATEGORY_META, matchCategoryMeta } from "@/lib/amcCategoryMeta";

export const revalidate = 60;

const SITE_URL = "https://houseelectric.in";

export async function generateMetadata() {
  const { city, state } = await getContactSettings();
  return {
    title: `Electrical AMC Plans & Pricing in ${city} | House Electric`,
    description: `Compare Residential, Commercial & Corporate Electrical AMC (Annual Maintenance Contract) plans in ${city}, ${state} — scheduled electrical maintenance, fault coverage and priority electrician support. See pricing and subscribe online.`,
    alternates: { canonical: "/amc/plans" },
  };
}

const DEFAULT_PAGE = {
  eyebrow: "AMC Plans",
  title_plain: "Electrical Problem? Just Inform Us.",
  title_highlight: "We'll Take Care of the Rest.",
  subtitle: "With House Electric AMC, you don't have to search for an electrician every time an electrical problem occurs.",
  trust_badges:
    "No Electrician Searching\nNo Service-Charge Negotiation\nProfessional Service Support\nEasy Service Request\nCustomer Dashboard\nWhatsApp & Phone Support",
  primary_cta_label: "Get Your AMC",
  secondary_cta_label: "Book Electrical Health Check",
  whatsapp_cta_label: "WhatsApp Us",
  image_url: "",
};

const TERMS_ITEMS = [
  {
    title: "Validity",
    desc: "Your AMC runs for the duration shown on your plan, starting from activation, for the property registered against it.",
    icon: CalendarIcon,
  },
  {
    title: "Covered Visits",
    desc: "Service visits and labour for covered diagnosis/troubleshooting are never charged separately during your AMC period.",
    icon: CheckCircle,
  },
  {
    title: "Materials & New Work",
    desc: "Replacement parts, new points, rewiring and major repairs are outside AMC scope and always quoted for your approval first.",
    icon: WalletIcon,
  },
  {
    title: "Cancellation & Refund",
    desc: "AMC is an annual commitment. Any refund is assessed pro-rata, less the value of services already availed.",
    icon: XIcon,
  },
  {
    title: "Renewal",
    desc: "You're reminded before expiry from your dashboard and by email. Coverage lapses if not renewed in time.",
    icon: RefreshIcon,
  },
  {
    title: "Response Time",
    desc: "Each plan shows a target response tier — an operational goal, contractual only where agreed in a Commercial/Corporate quotation.",
    icon: ClockIcon,
  },
];

const SLA_STAT_ICONS = [ClockIcon, ShieldIcon, AmcBadge, SparklesIcon];
const SLA_STAT_ACCENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
];

async function getPlans() {
  if (!supabase) return [];
  const { data } = await supabase
    .from("amc_plans")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });
  return data ?? [];
}

async function getPageContent() {
  if (!supabase) return DEFAULT_PAGE;
  const { data } = await supabase.from("site_settings").select("data").eq("key", "amc_plans_page").maybeSingle();
  return { ...DEFAULT_PAGE, ...(data?.data || {}) };
}

// The rich detail content (checklist, types, advantages, process, FAQs) already lives
// on the AMC row in the generic `services` table — reuse it here instead of duplicating it,
// so this pricing page reads as a complete AMC page rather than just a plans grid.
async function getServiceDetail() {
  if (!supabase) return null;
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("slug", "annual-maintenance-contract-amc")
    .eq("active", true)
    .maybeSingle();
  return data;
}

export default async function AmcPlansPage() {
  const [{ whatsapp, phone, email, address, city, state }, plans, page, service] = await Promise.all([
    getContactSettings(),
    getPlans(),
    getPageContent(),
    getServiceDetail(),
  ]);
  const trustBadges = (page.trust_badges || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const heroImage = page.image_url || "/service-amc.png";
  // An admin can hide an otherwise-populated section without deleting its content
  // (e.g. drafted FAQs not ready to publish yet) — see hidden_sections on the services table.
  const hiddenSections = service?.hidden_sections || [];
  const isVisible = (key) => !hiddenSections.includes(key);
  const faqs = isVisible("faqs") && service?.faqs?.length > 0 ? service.faqs : [];
  const planCoverageItems = plans.map((p) => ({ id: p.id, items: getCoverageItems(p) }));
  const comparisonRows = Array.from(new Set(planCoverageItems.flatMap((p) => p.items.map((i) => i.name))));
  const coverageStatusFor = (planId, row) => planCoverageItems.find((p) => p.id === planId)?.items.find((i) => i.name === row)?.status || "excluded";
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

  const pricedPlans = plans.filter((p) => p.price);
  const serviceJsonLd =
    plans.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Electrical Annual Maintenance Contract (AMC)",
          name: "House Electric AMC",
          description:
            "Residential, Commercial and Corporate Electrical AMC plans with scheduled preventive maintenance, electrical fault coverage and priority technician support.",
          provider: {
            "@type": "LocalBusiness",
            name: "House Electric",
            url: SITE_URL,
            telephone: phone,
            email,
            address: { "@type": "PostalAddress", addressLocality: city, addressRegion: state, streetAddress: address },
          },
          areaServed: { "@type": "City", name: city },
          ...(pricedPlans.length > 0 && {
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "AMC Plans",
              itemListElement: pricedPlans.map((p) => ({
                "@type": "Offer",
                name: p.name,
                price: p.price,
                priceCurrency: "INR",
                url: `${SITE_URL}/amc/plans#plan-${p.id}`,
                availability: "https://schema.org/InStock",
              })),
            },
          }),
        }
      : null;

  return (
    <main>
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
      {serviceJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      )}

      {/* Executive Luxury Hero Section */}
      <section className="relative overflow-hidden bg-cream py-16 md:py-24 border-b border-line/60">
        <div
          className="absolute inset-0 opacity-[0.045] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #DF9E10 1.2px, transparent 1.2px)", backgroundSize: "28px 28px" }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-yellow/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl" />

        <div className="relative z-[1] mx-auto grid max-w-wrap grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs mb-4">
              <SparklesIcon className="h-3.5 w-3.5 text-yellow-dark" />
              <span>{page.eyebrow}</span>
            </div>

            <h1 className="mb-4 text-[clamp(2.1rem,4.5vw,3.2rem)] font-black leading-[1.12] tracking-tight text-ink">
              {page.title_plain}{" "}
              <span className="bg-gradient-to-r from-amber-500 via-yellow to-amber-600 bg-clip-text text-transparent">
                {page.title_highlight}
              </span>
            </h1>

            <p className="mb-7 max-w-[54ch] text-base sm:text-lg leading-relaxed text-body">
              {page.subtitle}
            </p>

            {trustBadges.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-x-5 gap-y-2.5">
                {trustBadges.map((b) => (
                  <div key={b} className="inline-flex items-center gap-2 rounded-xl bg-white/90 border border-slate-200/90 px-3 py-1.5 text-xs sm:text-[13px] font-bold text-ink shadow-2xs">
                    <CheckCircle className="h-3.5 w-3.5 text-yellow-dark shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <a
                href="#plans"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow px-7 py-4 text-xs sm:text-sm font-black text-ink shadow-[0_12px_28px_-6px_rgba(242,176,30,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_18px_36px_-6px_rgba(242,176,30,0.65)] active:scale-[0.98]"
              >
                <span>{page.primary_cta_label}</span>
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="/health-check"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300/90 bg-white px-7 py-4 text-xs sm:text-sm font-black text-ink shadow-2xs backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:bg-white hover:shadow-xs"
              >
                {page.secondary_cta_label}
              </a>
              <a
                href={waHref(whatsapp, "Hi House Electric, I'd like to know more about your AMC plans.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-4 text-xs sm:text-sm font-black text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1ebd54]"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span>{page.whatsapp_cta_label}</span>
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Outer decorative ambient squircle */}
              <div className="absolute -inset-3.5 -z-[1] hidden sm:block rounded-[2.5rem] border border-amber-300/40 bg-gradient-to-tr from-amber-100/40 via-yellow/10 to-transparent shadow-sm" />
              
              <div className="relative overflow-hidden rounded-3xl border border-yellow/30 shadow-2xl">
                <img
                  src={heroImage}
                  alt="AMC technician servicing an electrical panel"
                  className="aspect-[4/3.3] w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
              </div>

              {plans.length > 0 && (
                <div className="absolute -bottom-5 right-2 sm:-bottom-6 sm:-right-4 flex items-center gap-3.5 rounded-2xl sm:rounded-3xl border border-amber-200/90 bg-white/95 px-4 py-3 sm:px-5 sm:py-4 shadow-xl backdrop-blur-md transition-all hover:scale-105">
                  <span className="grid h-11 w-11 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-yellow/20 text-yellow-dark border border-amber-200/60 shadow-2xs">
                    <AmcBadge className="h-6 w-6" />
                  </span>
                  <div className="leading-tight">
                    <div className="flex items-center gap-1.5">
                      <p className="text-base sm:text-lg font-black text-ink">{plans.length}+ Plans</p>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <p className="mt-0.5 text-[11px] font-extrabold text-muted">Available Now</p>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Problem Comparison: Without AMC vs With House Electric AMC */}
      {isVisible("problem") && (service?.problem_section?.without_items?.length > 0 || service?.problem_section?.with_items?.length > 0) && (
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mx-auto mb-12 md:mb-14 max-w-[62ch] text-center">
              {service.problem_section.eyebrow && (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs mb-3">
                  {service.problem_section.eyebrow}
                </div>
              )}
              {service.problem_section.heading && (
                <h2 className="mb-3 text-[clamp(1.8rem,3.4vw,2.5rem)] font-black tracking-tight text-ink">
                  {service.problem_section.heading}
                </h2>
              )}
              {service.problem_section.subtitle && (
                <p className="text-[15.5px] leading-relaxed text-body">{service.problem_section.subtitle}</p>
              )}
            </Reveal>

            <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
              <Reveal delay={0.05}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-rose-200/90 bg-gradient-to-br from-rose-50/70 via-white to-white p-6 sm:p-8 shadow-2xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-rose-300">
                  <span className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-red-500 to-rose-600" />
                  <div className="mb-6 flex items-center gap-3.5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <XIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-rose-700">Without AMC</span>
                      <b className="block text-base font-black text-ink">Unplanned Breakdown Cycle</b>
                    </div>
                  </div>
                  <ul className="space-y-3.5 text-xs sm:text-[13.5px] text-body">
                    {(service.problem_section.without_items || []).map((step) => (
                      <li key={step} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                          <XIcon className="h-3 w-3" />
                        </span>
                        <span className="leading-snug">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <span className="pointer-events-none absolute left-1/2 top-1/2 z-[1] hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white bg-ink text-yellow shadow-xl md:grid">
                <ArrowRightIcon className="h-4 w-4" />
              </span>

              <Reveal delay={0.1}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/70 via-white to-white p-6 sm:p-8 shadow-2xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-300">
                  <span className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-emerald-500 to-teal-600" />
                  <div className="mb-6 flex items-center gap-3.5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <CheckCircle className="h-5 w-5" />
                    </span>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-700">With House Electric AMC</span>
                      <b className="block text-base font-black text-ink">Guaranteed Safety &amp; VIP Priority</b>
                    </div>
                  </div>
                  <ul className="space-y-3.5 text-xs sm:text-[13.5px] text-ink font-semibold">
                    {(service.problem_section.with_items || []).map((step) => (
                      <li key={step} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                          <CheckCircle className="h-3 w-3" />
                        </span>
                        <span className="leading-snug">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* SLA Metric Statistics Band */}
      {isVisible("stats") && service?.sla_stats?.length > 0 && (
        <section className="border-y border-line/80 bg-white py-8 shadow-2xs">
          <div className="mx-auto max-w-wrap px-6">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {service.sla_stats.map((stat, i) => {
                const Icon = SLA_STAT_ICONS[i % SLA_STAT_ICONS.length];
                const accent = SLA_STAT_ACCENTS[i % SLA_STAT_ACCENTS.length];
                return (
                  <div key={i} className="flex items-center gap-3.5 text-center sm:text-left">
                    <span
                      className={`hidden h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-sm sm:grid ${accent}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <span className="block text-2xl font-black text-ink md:text-3xl [font-variant-numeric:tabular-nums]">
                        {stat.value}
                        <span className="text-yellow-dark">{stat.suffix}</span>
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider text-muted">{stat.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Property Types Section */}
      {isVisible("types") && service?.types_section?.items?.length > 0 && (
        <section className="py-16 md:py-24 bg-cream/50 border-b border-line/60">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mb-12 max-w-[62ch]">
              {service.types_section.eyebrow && (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs mb-3">
                  {service.types_section.eyebrow}
                </div>
              )}
              {service.types_section.heading && (
                <h2 className="mb-3 text-[clamp(1.8rem,3.4vw,2.5rem)] font-black tracking-tight text-ink">
                  {service.types_section.heading}
                </h2>
              )}
              {service.types_section.subtitle && (
                <p className="text-[15.5px] leading-relaxed text-body">{service.types_section.subtitle}</p>
              )}
            </Reveal>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {service.types_section.items.map((t, i) => {
                const meta = matchCategoryMeta(t.title);
                const Icon = meta.icon;
                return (
                  <Reveal key={i} delay={i * 0.07} y={18}>
                    <div className="group relative h-full overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xs transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-300 hover:shadow-xl flex flex-col justify-between">
                      <span className={`absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r ${meta.accent}`} />
                      <div>
                        <span
                          className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-sm transition-transform duration-300 group-hover:scale-105 ${meta.accent}`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <h3 className="mb-2 text-base sm:text-lg font-black text-ink">{t.title}</h3>
                        {t.desc && <p className="mb-4 text-xs sm:text-[13.5px] leading-relaxed text-body">{t.desc}</p>}
                      </div>
                      {t.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {t.tags.map((tag, ti) => (
                            <span key={ti} className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-black ${meta.tint}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* PRICING PLANS SECTION (THE STAR OF THE PAGE) */}
      <section id="plans" className="scroll-mt-20 py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mx-auto mb-12 md:mb-16 max-w-[62ch] text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-4 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs mb-3">
              <SparklesIcon className="h-3.5 w-3.5 text-yellow-dark" />
              <span>Tailored Protection Packages</span>
            </div>
            <h2 className="text-[clamp(1.9rem,3.8vw,2.8rem)] font-black tracking-tight text-ink">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-amber-500 via-yellow to-amber-600 bg-clip-text text-transparent">
                AMC Plan
              </span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-body">
              Transparent upfront pricing with zero hidden labor charges. Select a plan below to activate coverage instantly.
            </p>
          </Reveal>

          {plans.length === 0 ? (
            <Reveal className="mx-auto max-w-[50ch] text-center">
              <p className="text-[15.5px] leading-relaxed text-body">
                Our AMC plans are being updated — fill in the form below and our team will send you a custom proposal.
              </p>
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
              {plans.map((p, i) => {
                const meta = CATEGORY_META[p.category] || DEFAULT_CATEGORY_META;
                const Icon = meta.icon;
                const featured = !!p.featured;
                return (
                  <Reveal key={p.id} delay={i * 0.08} y={22}>
                    <div
                      id={`plan-${p.id}`}
                      className={`target:ring-4 target:ring-yellow/50 target:border-yellow group relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-3xl border bg-white p-6 sm:p-8 transition-all duration-300 hover:-translate-y-2 ${
                        featured
                          ? "border-amber-400 ring-4 ring-yellow/20 shadow-2xl lg:scale-[1.03] bg-gradient-to-b from-amber-50/20 via-white to-white"
                          : "border-slate-200/90 shadow-xs hover:border-amber-300 hover:shadow-xl"
                      }`}
                    >
                      <span className={`absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r ${meta.accent}`} />
                      
                      {featured && (
                        <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1 text-[10.5px] font-black uppercase tracking-wide text-yellow shadow-md">
                          <SparklesIcon className="h-3.5 w-3.5 text-yellow" />
                          Most Popular
                        </span>
                      )}

                      {/* Icon & Category Pill */}
                      <div className="mb-4 flex items-center justify-between">
                        <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-sm transition-transform duration-300 group-hover:scale-105 ${meta.accent}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                      </div>

                      <span className={`mb-3 w-fit rounded-full px-3 py-1 text-[10.5px] font-black uppercase tracking-wider shadow-2xs ${meta.tint}`}>
                        {p.category}
                      </span>

                      <h3 className="mb-2 text-xl sm:text-2xl font-black text-ink">{p.name}</h3>

                      {/* Pricing Display */}
                      <div className="mb-6 flex items-baseline gap-2 pt-1 border-b border-line/70 pb-5">
                        <span className="text-3xl sm:text-4xl font-black leading-none tracking-tight text-ink [font-variant-numeric:tabular-nums]">
                          {p.price_label || "Request Proposal"}
                        </span>
                        {p.price_label && <span className="text-xs sm:text-[13px] font-extrabold text-muted">/ {p.duration_label}</span>}
                      </div>

                      {/* Suitable For */}
                      {Array.isArray(p.suitable_for) && p.suitable_for.length > 0 && (
                        <div className="mb-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 p-3.5">
                          <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-muted">Suitable For</p>
                          <p className="text-xs sm:text-[12.5px] font-extrabold text-ink leading-snug">{p.suitable_for.join(" · ")}</p>
                        </div>
                      )}

                      {/* Coverage Bullet List */}
                      {Array.isArray(p.coverage) && p.coverage.length > 0 && (
                        <ul className="mb-6 flex-1 space-y-2.5 text-xs sm:text-[13.5px] text-body">
                          {p.coverage.map((c) => (
                            <li key={c} className="flex items-start gap-2.5">
                              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                                <CheckCircle className="h-3.5 w-3.5" />
                              </span>
                              <span className="leading-snug">{c}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Visit Limit & SLA Badges */}
                      {(p.visit_limit_type || p.response_time_sla) && (
                        <div className="mb-6 flex flex-wrap gap-2 pt-1">
                          <span className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-800 shadow-2xs">
                            {p.visit_limit_type === "defined"
                              ? `${p.visit_limit_count || "Limited"} Covered Visits`
                              : p.visit_limit_type === "fair_use"
                              ? "Fair-Use Visits"
                              : "Unlimited Covered Visits"}
                          </span>
                          {p.response_time_sla && (
                            <span className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-800 shadow-2xs">
                              {p.response_time_sla}
                            </span>
                          )}
                        </div>
                      )}

                      {/* CTA Action */}
                      <div className="mt-auto pt-2">
                        {p.price ? (
                          <AmcBuyButton planId={p.id} planName={p.name} className="w-full" />
                        ) : (
                          <a
                            href="#enquiry"
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-yellow px-6 py-3.5 text-xs sm:text-sm font-black text-ink shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md active:scale-[0.99]"
                          >
                            {p.price_label ? "Choose This Plan" : "Request Site Assessment"}
                          </a>
                        )}
                      </div>

                      {p.category === "corporate" && (
                        <a
                          href="/corporate"
                          className="mt-3 inline-flex items-center justify-center gap-1 text-[12px] font-extrabold text-muted hover:text-ink hover:underline"
                        >
                          Learn more about Corporate &amp; Institutional AMC
                          <ArrowRightIcon className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* AMC Plan Comparison Matrix */}
      {plans.length > 1 && comparisonRows.length > 0 && (
        <section className="bg-cream py-16 md:py-24 border-y border-line/60">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mb-10 max-w-[62ch]">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs mb-3">
                Compare Plans
              </div>
              <h2 className="text-[clamp(1.8rem,3.4vw,2.5rem)] font-black tracking-tight text-ink">AMC Plan Comparison</h2>
              <p className="mt-1 text-[15.5px] leading-relaxed text-body">See what&apos;s covered across every plan at a glance.</p>
            </Reveal>

            <Reveal
              delay={0.1}
              className="relative hidden overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm md:block"
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-xs sm:text-[13.5px]">
                  <thead>
                    <tr className="border-b border-line/80 bg-slate-50/60">
                      <th className="sticky left-0 z-10 min-w-[220px] border-r border-line/70 bg-slate-50 p-5 font-black text-ink">
                        Coverage Feature
                      </th>
                      {plans.map((p) => {
                        const meta = CATEGORY_META[p.category] || DEFAULT_CATEGORY_META;
                        const Icon = meta.icon;
                        const featured = !!p.featured;
                        return (
                          <th
                            key={p.id}
                            className={`relative min-w-[135px] p-5 text-center align-bottom ${
                              featured ? "bg-amber-50/40" : ""
                            }`}
                          >
                            {featured && (
                              <span className="absolute inset-x-3 top-0 h-[3px] rounded-b-full bg-gradient-to-r from-yellow to-yellow-dark" />
                            )}
                            <span
                              className={`mx-auto mb-2.5 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ${meta.accent}`}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <div className="font-black text-ink">{p.name}</div>
                            {featured ? (
                              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-wide text-yellow">
                                <SparklesIcon className="h-2.5 w-2.5" />
                                Popular
                              </span>
                            ) : (
                              <span className="mt-1.5 block h-[15px]" />
                            )}
                            <div className="mt-1.5 text-xs sm:text-[13px] font-black text-yellow-dark [font-variant-numeric:tabular-nums]">{p.price_label || "Custom"}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, i) => (
                      <tr key={row} className={`transition-colors duration-150 hover:bg-amber-50/20 ${i % 2 ? "bg-slate-50/30" : "bg-white"}`}>
                        <td className="sticky left-0 z-10 border-r border-line/60 bg-inherit p-4 sm:p-5 font-bold text-ink">
                          {row}
                        </td>
                        {plans.map((p) => (
                          <td key={p.id} className={`p-4 sm:p-5 text-center ${p.featured ? "bg-amber-50/20" : ""}`}>
                            <div className="mx-auto flex justify-center">
                              <CoverageStatusIcon status={coverageStatusFor(p.id, row)} />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>

            {/* Mobile: Accordion Plan Views */}
            <div className="space-y-3 md:hidden">
              {plans.map((p, i) => {
                const meta = CATEGORY_META[p.category] || DEFAULT_CATEGORY_META;
                const Icon = meta.icon;
                const featured = !!p.featured;
                return (
                  <Reveal key={p.id} delay={i * 0.05}>
                    <details
                      className={`group overflow-hidden rounded-2xl border bg-white shadow-2xs ${featured ? "border-amber-400 ring-2 ring-yellow/20" : "border-slate-200/90"}`}
                      open={featured}
                    >
                      <summary className="flex cursor-pointer list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ${meta.accent}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-black leading-snug text-ink">{p.name}</span>
                            {featured && (
                              <span className="rounded-full bg-ink px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-yellow">
                                Popular
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-black text-yellow-dark">{p.price_label || "Custom"}</span>
                        </div>
                        <ChevronDown className="mt-1.5 h-4 w-4 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <div className="divide-y divide-line/60 border-t border-line/60 bg-slate-50/40">
                        {comparisonRows.map((row) => (
                          <div key={row} className="flex items-center justify-between gap-3 px-4 py-3 text-xs font-bold text-ink">
                            <span>{row}</span>
                            <CoverageStatusIcon status={coverageStatusFor(p.id, row)} />
                          </div>
                        ))}
                      </div>
                    </details>
                  </Reveal>
                );
              })}
            </div>

            {/* Legend Bar */}
            <Reveal delay={0.15} className="mt-5 flex flex-wrap gap-x-6 gap-y-2.5 text-xs font-extrabold text-body">
              <span className="flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle className="h-3.5 w-3.5" />
                </span>
                Included in plan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-50 text-[10px] font-black text-amber-600">₹</span>
                Chargeable separately
              </span>
              <span className="flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-blue-50 text-[11px] font-black text-blue-600">?</span>
                Requires quotation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-200">
                  <span className="block h-[2px] w-2 rounded-full bg-slate-500" />
                </span>
                Not in this plan
              </span>
            </Reveal>
          </div>
        </section>
      )}

      {/* Checklist Grid Section */}
      {isVisible("checklist") && service?.checklist_items?.length > 0 && (
        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mb-10 max-w-[62ch]">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs mb-3">
                {service.checklist_section?.eyebrow || "What's included"}
              </div>
              <h2 className="text-[clamp(1.8rem,3.4vw,2.5rem)] font-black tracking-tight text-ink mb-2">
                {service.checklist_section?.heading || "What's Covered in Every AMC Visit"}
              </h2>
              {service.checklist_section?.subtitle && (
                <p className="text-[15.5px] leading-relaxed text-body">{service.checklist_section.subtitle}</p>
              )}
            </Reveal>
            <ChecklistGrid items={service.checklist_items} columns={4} />
          </div>
        </section>
      )}

      {/* Exclusions Section */}
      {isVisible("exclusions") && service?.exclusions_section?.items?.length > 0 && (
        <section className="py-16 md:py-24 bg-cream/40 border-t border-line/60">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mb-10 max-w-[64ch]">
              {service.exclusions_section.eyebrow && (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs mb-3">
                  {service.exclusions_section.eyebrow}
                </div>
              )}
              {service.exclusions_section.heading && (
                <h2 className="text-[clamp(1.8rem,3.4vw,2.5rem)] font-black tracking-tight text-ink mb-2">
                  {service.exclusions_section.heading}
                </h2>
              )}
              {service.exclusions_section.subtitle && (
                <p className="text-[15.5px] leading-relaxed text-body">{service.exclusions_section.subtitle}</p>
              )}
            </Reveal>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {service.exclusions_section.items.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-white p-4 shadow-2xs"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
                    <AlertIcon className="h-4 w-4" />
                  </span>
                  <span className="text-xs sm:text-[13.5px] font-extrabold text-ink">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-amber-300/70 bg-gradient-to-r from-amber-50 via-white to-amber-50 p-6 text-xs sm:text-[13.5px] leading-relaxed text-body shadow-2xs">
              <b className="text-ink font-black">Covered service visit = no separate service charge.</b> Materials, new points,
              rewiring or major repairs are quoted upfront and carried out only after you approve — never automatically
              billed.
            </div>
          </div>
        </section>
      )}

      {/* Advantages Section */}
      {isVisible("advantages") && service?.advantages_section?.items?.length > 0 && (
        <section className="py-16 md:py-24 bg-white border-t border-line/60">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mb-12 max-w-[62ch]">
              {service.advantages_section.eyebrow && (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs mb-3">
                  {service.advantages_section.eyebrow}
                </div>
              )}
              {service.advantages_section.heading && (
                <h2 className="text-[clamp(1.8rem,3.4vw,2.5rem)] font-black tracking-tight text-ink mb-2">
                  {service.advantages_section.heading}
                </h2>
              )}
              {service.advantages_section.subtitle && (
                <p className="text-[15.5px] leading-relaxed text-body">{service.advantages_section.subtitle}</p>
              )}
            </Reveal>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {service.advantages_section.items.map((item, i) => (
                <Reveal key={i} delay={i * 0.07} y={18}>
                  <div className="group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-300 hover:shadow-xl">
                    <span className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-yellow to-yellow-dark" />
                    <div className="mb-3.5 flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-yellow to-yellow-dark text-ink shadow-sm transition-transform duration-300 group-hover:scale-105">
                        <CheckCircle className="h-5 w-5" />
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-ink">{item.title}</h3>
                    </div>
                    <p className="pl-14 text-xs sm:text-[14px] leading-relaxed text-body">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process Section */}
      {isVisible("process") && service?.process_section?.items?.length > 0 && (
        <section className="bg-cream py-16 md:py-24 border-t border-line/60">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mb-12 max-w-[62ch]">
              {service.process_section.eyebrow && (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs mb-3">
                  {service.process_section.eyebrow}
                </div>
              )}
              {service.process_section.heading && (
                <h2 className="text-[clamp(1.8rem,3.4vw,2.5rem)] font-black tracking-tight text-ink mb-2">
                  {service.process_section.heading}
                </h2>
              )}
              {service.process_section.subtitle && (
                <p className="text-[15.5px] leading-relaxed text-body">{service.process_section.subtitle}</p>
              )}
            </Reveal>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {service.process_section.items.map((step, i) => (
                <Reveal key={i} delay={i * 0.07} y={20}>
                  <div className="group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xs transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-300 hover:shadow-xl flex flex-col justify-between h-full">
                    <span className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-yellow to-yellow-dark" />
                    <div>
                      <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-yellow to-yellow-dark font-mono text-base font-black text-ink shadow-sm transition-transform duration-300 group-hover:scale-105">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mb-2 text-base font-black text-ink">{step.title}</h3>
                      <p className="text-xs sm:text-[13.5px] leading-relaxed text-body">{step.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why House Electric Section */}
      {isVisible("why_he") && service?.why_house_electric_section?.items?.length > 0 && (
        <section className="bg-white py-16 md:py-24 border-t border-line/60">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mb-12 max-w-[62ch]">
              {service.why_house_electric_section.eyebrow && (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs mb-3">
                  {service.why_house_electric_section.eyebrow}
                </div>
              )}
              {service.why_house_electric_section.heading && (
                <h2 className="text-[clamp(1.8rem,3.4vw,2.5rem)] font-black tracking-tight text-ink mb-2">
                  {service.why_house_electric_section.heading}
                </h2>
              )}
              {service.why_house_electric_section.subtitle && (
                <p className="text-[15.5px] leading-relaxed text-body">{service.why_house_electric_section.subtitle}</p>
              )}
            </Reveal>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {service.why_house_electric_section.items.map((item) => (
                <Reveal key={item.title} delay={0.08} y={18}>
                  <div className="group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300/80 hover:shadow-xl">
                    <span className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-blue-500 to-indigo-600" />
                    <div className="mb-3.5 flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                        <ShieldIcon className="h-5 w-5" />
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-ink">{item.title}</h3>
                    </div>
                    <p className="pl-14 text-xs sm:text-[14px] leading-relaxed text-body">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Frequently Asked Questions */}
      {faqs.length > 0 && (
        <section className="py-16 md:py-24 bg-cream/40 border-t border-line/60">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mx-auto mb-10 max-w-[60ch] text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-900 shadow-2xs mb-3">
                Common questions
              </div>
              <h2 className="text-[clamp(1.8rem,3.4vw,2.5rem)] font-black tracking-tight text-ink">Frequently Asked Questions</h2>
            </Reveal>
            <Reveal delay={0.1} className="mx-auto max-w-[76ch]">
              <FAQAccordion items={faqs} />
            </Reveal>
          </div>
        </section>
      )}

      {/* Dark Luxury Terms & Conditions Band */}
      <section className="relative overflow-hidden bg-ink py-16 md:py-24">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #F2B01E 1px, transparent 1px)", backgroundSize: "26px 26px" }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-yellow/15 blur-3xl opacity-60" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-yellow/10 blur-3xl opacity-60" />

        <div className="relative z-[1] mx-auto max-w-wrap px-6">
          <Reveal className="mx-auto mb-12 max-w-[62ch] text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow/30 bg-white/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-yellow shadow-2xs mb-3">
              Before You Subscribe
            </div>
            <h2 className="mb-3 text-[clamp(1.8rem,3.4vw,2.6rem)] font-black text-white tracking-tight">AMC Terms &amp; Conditions</h2>
            <p className="text-sm sm:text-base leading-relaxed text-white/70">
              The key points of our AMC agreement, in plain language. Read the full terms before you subscribe.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mx-auto grid max-w-[960px] grid-cols-1 gap-4 sm:grid-cols-2">
            {TERMS_ITEMS.map((t) => (
              <div
                key={t.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-yellow/40 hover:bg-white/[0.08]"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-yellow to-yellow-dark text-ink shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <t.icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm sm:text-base font-black text-white">{t.title}</p>
                </div>
                <p className="pl-13 text-xs sm:text-[13px] leading-relaxed text-white/70">{t.desc}</p>
              </div>
            ))}
          </Reveal>

          <Reveal delay={0.15} className="mt-10 text-center">
            <a
              href="/terms-and-conditions#amc"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow px-7 py-3.5 text-xs sm:text-sm font-black text-ink shadow-[0_10px_25px_-5px_rgba(242,176,30,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark"
            >
              <span>Read Full AMC Terms &amp; Conditions</span>
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* Enquiry Form */}
      <EnquiryForm
        id="enquiry"
        variant="amc"
        eyebrow="Get Started"
        title="Request Your AMC Plan"
        subtitle="Tell us about your property and we'll put together a custom maintenance plan that fits."
        className="bg-cream"
      />

      <p className="mx-auto max-w-[60ch] px-6 py-6 text-center text-xs text-muted">
        By subscribing you agree to our{" "}
        <a href="/terms-and-conditions#amc" className="font-bold text-ink underline underline-offset-2 hover:text-yellow-dark">
          AMC Terms &amp; Conditions
        </a>
        .
      </p>

      <CTA />
    </main>
  );
}
