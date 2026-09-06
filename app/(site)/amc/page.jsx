import EnquiryForm from "@/components/EnquiryForm";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { getContactSettings, telHref } from "@/lib/getContactSettings";
import {
  AmcBadge,
  BuildingIcon,
  ClockIcon,
  GearIcon,
  HomeIcon,
  ReportIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/icons";

export const metadata = {
  title: "Electrical AMC — Annual Maintenance Contract | House Electric",
  description:
    "Annual electrical maintenance plans for residential, commercial and corporate customers — prevent failures, improve safety and get priority service.",
};

const WHY_AMC = [
  { icon: ShieldIcon, title: "Prevent Unexpected Failures", desc: "Catch issues before they cause costly downtime." },
  { icon: AmcBadge, title: "Improve Electrical Safety", desc: "Regular checks reduce fire & shock risks." },
  { icon: ReportIcon, title: "Regular Inspection", desc: "Scheduled visits, not just reactive call-outs." },
  { icon: ClockIcon, title: "Priority Service (24/7)", desc: "AMC customers are always attended to first." },
  { icon: GearIcon, title: "Better Maintenance", desc: "Small issues get fixed before they grow." },
  { icon: BuildingIcon, title: "Reduced Downtime", desc: "Keep homes & businesses running smoothly." },
  { icon: UsersIcon, title: "Predictable Annual Cost", desc: "Fixed maintenance cost instead of surprise bills." },
];

const SEGMENTS = [
  {
    title: "Residential AMC",
    icon: HomeIcon,
    tag: "For Homes & Villas",
    desc: "Scheduled checks for your home's DB, wiring and safety devices — ideal for homeowners, apartments and villas.",
  },
  {
    title: "Commercial AMC",
    icon: BuildingIcon,
    tag: "For Shops & Offices",
    desc: "Keep shops, restaurants, clinics and offices running without unplanned electrical downtime or hazards.",
  },
  {
    title: "Corporate AMC",
    icon: BuildingIcon,
    tag: "For Tech Parks & Factories",
    desc: "Facility-wide maintenance plans for corporate offices, buildings and factories, with dedicated priority support.",
  },
];

export default async function AMCPage() {
  const { phone } = await getContactSettings();
  return (
    <main>
      <PageHero
        eyebrow="Annual Maintenance Contract"
        title={
          <>
            Peace of Mind, <span className="text-yellow">All Year Round</span>
          </>
        }
        subtitle="Once your electrical system is in good shape, an AMC keeps it that way — with scheduled inspections, priority service and one predictable annual cost."
        primaryCta={{ label: "Request AMC Plan", href: "#enquiry" }}
        secondaryCta={{ label: "Call Now", href: telHref(phone) }}
        image="/service-amc.png"
        imageAlt="AMC agreement handshake"
      />

      <section className="py-16 md:py-[80px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-10 max-w-[60ch]">
            <p className="eyebrow">Why AMC?</p>
            <h2 className="text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold leading-tight">
              The Case for an{" "}
              <span className="text-yellow">Annual Maintenance Contract</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_AMC.map((f, i) => (
              <Reveal key={f.title} delay={(i % 4) * 0.08}>
                <div className="group flex h-full flex-col justify-between rounded-2xl border border-line/80 bg-white p-6 md:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-yellow/50 hover:shadow-xl">
                  <div>
                    <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-yellow/15 text-ink ring-1 ring-yellow/30 transition-colors group-hover:bg-yellow">
                      <f.icon className="h-5 w-5 text-ink" strokeWidth="1.8" />
                    </span>
                    <b className="mb-1.5 block text-[16px] font-extrabold text-ink">
                      {f.title}
                    </b>
                    <p className="text-[13.5px] leading-relaxed text-ink-soft">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-[80px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-10 max-w-[60ch]">
            <p className="eyebrow">Tailored plans</p>
            <h2 className="text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold">
              AMC for Every Kind of <span className="text-yellow">Property</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
            {SEGMENTS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.title} delay={i * 0.1}>
                  <div className="group flex h-full flex-col justify-between rounded-2xl border border-line/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-yellow/50 hover:shadow-xl md:p-8">
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-yellow/15 text-ink ring-1 ring-yellow/30 transition-colors group-hover:bg-yellow">
                          <Icon className="h-5 w-5 text-ink" strokeWidth="1.8" />
                        </span>
                        <span className="rounded-full bg-yellow/10 px-3 py-1 text-[12px] font-bold text-yellow-dark">
                          {s.tag}
                        </span>
                      </div>
                      <h3 className="mb-2 text-[19px] font-extrabold text-ink group-hover:text-yellow-dark transition-colors">
                        {s.title}
                      </h3>
                      <p className="mb-6 text-[14px] leading-relaxed text-ink-soft">
                        {s.desc}
                      </p>
                    </div>

                    <a
                      href="#enquiry"
                      className="mt-auto inline-flex w-fit items-center text-[13.5px] font-extrabold text-ink underline decoration-line underline-offset-4 transition-colors hover:text-yellow-dark hover:decoration-yellow-dark"
                    >
                      Request Plan Quote
                    </a>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <EnquiryForm
        id="enquiry"
        variant="amc"
        eyebrow="Get Started"
        title="Request Your AMC Plan"
        subtitle="Tell us about your property and we'll put together a custom maintenance plan that fits."
        className="bg-white"
      />
    </main>
  );
}
