import CTA from "@/components/CTA";
import EnquiryForm from "@/components/EnquiryForm";
import Reveal from "@/components/Reveal";
import { AmcBadge, BuildingIcon, CheckCircle, HomeIcon, PhoneIcon, SparklesIcon } from "@/components/icons";
import { getContactSettings, telHref } from "@/lib/getContactSettings";
import { supabase } from "@/lib/supabase";
import AmcBuyButton from "@/components/AmcBuyButton";

const CATEGORY_META = {
  residential: { icon: HomeIcon, tint: "bg-blue-50 text-blue-700", accent: "from-blue-500 to-indigo-600" },
  office: { icon: BuildingIcon, tint: "bg-violet-50 text-violet-700", accent: "from-violet-500 to-purple-600" },
  commercial: { icon: BuildingIcon, tint: "bg-amber-50 text-amber-700", accent: "from-amber-500 to-orange-600" },
  corporate: { icon: BuildingIcon, tint: "bg-emerald-50 text-emerald-700", accent: "from-emerald-600 to-teal-700" },
};
const DEFAULT_CATEGORY_META = { icon: AmcBadge, tint: "bg-yellow/10 text-yellow-dark", accent: "from-yellow to-yellow-dark" };

export const revalidate = 60;

export async function generateMetadata() {
  const { city, state } = await getContactSettings();
  return {
    title: `AMC Plans & Pricing in ${city} | House Electric`,
    description: `Compare Annual Maintenance Contract plans and pricing in ${city}, ${state} for residential, commercial and corporate properties — choose your coverage and subscribe online.`,
    alternates: { canonical: "/amc/plans" },
  };
}

const DEFAULT_PAGE = {
  eyebrow: "AMC Plans",
  title_plain: "Choose Your",
  title_highlight: "Coverage",
  subtitle: "Compare our Annual Maintenance Contract plans and subscribe online — or request a custom proposal for larger properties.",
  trust_badges: "No Hidden Fees\nCancel Anytime\nCertified Technicians",
  cta_label: "Request a Custom Quote",
  image_url: "",
};

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

export default async function AmcPlansPage() {
  const [{ phone }, plans, page] = await Promise.all([getContactSettings(), getPlans(), getPageContent()]);
  const trustBadges = (page.trust_badges || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const heroImage = page.image_url || "/service-amc.png";

  return (
    <main>
      {/* Same left-text/right-photo pattern as every other service page, with a few
          extra flourishes (glow, corner frame, floating plan-count badge) so this
          pricing page still reads as a step up rather than a carbon copy. */}
      <section className="relative overflow-hidden bg-cream py-16 md:py-24">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(circle, #C8860A 1px, transparent 1px)", backgroundSize: "26px 26px" }}
          aria-hidden="true"
        />
        <div className="glow-blob -left-16 -top-16 h-72 w-72 bg-yellow/15 opacity-60" />
        <div className="glow-blob -bottom-16 -right-16 h-72 w-72 bg-yellow/15 opacity-60" />

        <div className="relative z-[1] mx-auto grid max-w-wrap grid-cols-1 items-center gap-12 px-6 md:grid-cols-[1.05fr_1fr]">
          <Reveal>
            <span className="eyebrow">{page.eyebrow}</span>
            <h1 className="mb-4 text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.1]">
              {page.title_plain} <span className="text-yellow">{page.title_highlight}</span>
            </h1>
            <p className="mb-7 max-w-[52ch] text-[15.5px] leading-relaxed text-ink-soft">{page.subtitle}</p>

            {trustBadges.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-x-6 gap-y-3">
                {trustBadges.map((b) => (
                  <div key={b} className="flex items-center gap-2 text-[13.5px] font-bold text-ink">
                    <CheckCircle className="h-4 w-4 text-yellow-dark" />
                    {b}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#enquiry"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-yellow px-7 py-3.5 text-sm font-extrabold text-ink shadow-[0_10px_25px_-5px_rgba(242,176,30,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark"
              >
                {page.cta_label}
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

          <Reveal delay={0.1} className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-yellow/35 via-yellow/10 to-transparent blur-lg" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-yellow/25 shadow-2xl">
              <img src={heroImage} alt="AMC technician servicing an electrical panel" className="aspect-[4/3.3] w-full object-cover" />
            </div>
            <div className="absolute -top-3 -left-3 h-12 w-12 rounded-tl-2xl border-l-2 border-t-2 border-yellow/50" aria-hidden="true" />
            <div className="absolute -bottom-3 -right-3 h-12 w-12 rounded-br-2xl border-b-2 border-r-2 border-yellow/50" aria-hidden="true" />

            {plans.length > 0 && (
              <div className="absolute -bottom-6 left-6 flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-xl">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-yellow/15 text-yellow-dark">
                  <AmcBadge className="h-[18px] w-[18px]" />
                </span>
                <div className="leading-none">
                  <p className="text-[14px] font-extrabold text-ink">{plans.length}+ Plans</p>
                  <p className="mt-1 text-[11px] font-semibold text-body">Available Now</p>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <section id="plans" className="scroll-mt-20 py-16 md:py-[80px]">
        <div className="mx-auto max-w-wrap px-6">
          {plans.length === 0 ? (
            <Reveal className="mx-auto max-w-[50ch] text-center">
              <p className="text-[15.5px] leading-relaxed text-ink-soft">
                Our AMC plans are being updated — fill in the form below and our team will send you a custom proposal.
              </p>
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((p, i) => {
                const meta = CATEGORY_META[p.category] || DEFAULT_CATEGORY_META;
                const Icon = meta.icon;
                const featured = !!p.featured;
                return (
                  <Reveal key={p.id} delay={i * 0.08} y={22}>
                    <div
                      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                        featured ? "border-yellow/60 shadow-[0_20px_50px_-20px_rgba(242,176,30,0.45)] lg:scale-[1.04]" : "border-line/80 hover:border-yellow/50"
                      }`}
                    >
                      <span className={`absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r ${meta.accent}`} />
                      {featured && (
                        <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide text-yellow">
                          <SparklesIcon className="h-3 w-3" />
                          Most Popular
                        </span>
                      )}

                      <span className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-sm transition-transform duration-300 group-hover:scale-110 ${meta.accent}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className={`mb-3 w-fit rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${meta.tint}`}>
                        {p.category}
                      </span>
                      <h3 className="mb-2 text-[20px] font-extrabold text-ink">{p.name}</h3>
                      <div className="mb-6 flex items-baseline gap-1.5">
                        <span className="text-[30px] font-black leading-none tracking-tight text-ink">
                          {p.price_label || "Request Proposal"}
                        </span>
                        {p.price_label && <span className="text-[12.5px] font-semibold text-body">/ {p.duration_label}</span>}
                      </div>

                      {Array.isArray(p.coverage) && p.coverage.length > 0 && (
                        <ul className="mb-7 flex-1 space-y-2.5 text-[13.5px] text-ink-soft">
                          {p.coverage.map((c) => (
                            <li key={c} className="flex items-start gap-2.5">
                              <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-emerald-50 text-emerald-600">
                                <CheckCircle className="h-3 w-3" />
                              </span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      )}

                      {p.price ? (
                        <AmcBuyButton planId={p.id} planName={p.name} className="mt-auto" />
                      ) : (
                        <a
                          href="#enquiry"
                          className="mt-auto inline-flex items-center justify-center rounded-md bg-yellow px-6 py-3 text-[13.5px] font-extrabold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-lg"
                        >
                          {p.price_label ? "Choose This Plan" : "Request Proposal"}
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

      <EnquiryForm
        id="enquiry"
        variant="amc"
        eyebrow="Get Started"
        title="Request Your AMC Plan"
        subtitle="Tell us about your property and we'll put together a custom maintenance plan that fits."
        className="bg-cream"
      />

      <CTA />
    </main>
  );
}
