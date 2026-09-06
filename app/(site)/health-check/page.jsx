import Image from "next/image";
import ChecklistGrid from "@/components/ChecklistGrid";
import EnquiryForm from "@/components/EnquiryForm";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { AmcBadge, GearIcon, ReportIcon, SearchIcon } from "@/components/icons";
import { getContactSettings, telHref } from "@/lib/getContactSettings";

export const metadata = {
  title: "Electrical Health Check — House Electric",
  description:
    "Don't wait for an electrical problem. Book a professional electrical health check — detailed inspection, clear report and a repair estimate.",
};

const CHECK_ITEMS = [
  "Distribution Board",
  "MCB / RCCB",
  "Wiring",
  "Earthing",
  "Switches & Sockets",
  "Lighting",
  "Load condition",
  "Visible safety issues",
  "Electrical accessories",
];

const GET_STEPS = [
  {
    num: "01",
    icon: SearchIcon,
    title: "Inspection",
    desc: "A thorough on-site check of your entire electrical system.",
  },
  {
    num: "02",
    icon: ReportIcon,
    title: "Findings",
    desc: "A clear, easy-to-read report of what we discovered.",
  },
  {
    num: "03",
    icon: GearIcon,
    title: "Recommendations",
    desc: "Priority level and recommended fix for each issue.",
  },
  {
    num: "04",
    icon: AmcBadge,
    title: "Repair Estimate",
    desc: "A transparent upfront quote before any work begins.",
  },
];

export default async function HealthCheckPage() {
  const { phone } = await getContactSettings();
  return (
    <main>
      <PageHero
        eyebrow="Electrical Health Check"
        title={
          <>
            Don&apos;t Wait for an{" "}
            <span className="text-yellow">Electrical Problem</span>
          </>
        }
        subtitle="Get your electrical system checked before a small issue becomes a major one. Detailed inspection, a clear report and a repair estimate — with no pressure to commit."
        primaryCta={{ label: "Book Electrical Health Check", href: "#book" }}
        secondaryCta={{ label: "Call Now", href: telHref(phone) }}
        image="/healthcheck-ceiling.png"
        imageAlt="House Electric technician fitting a ceiling light"
      />

      <section className="py-16 md:py-[80px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-8 max-w-[60ch]">
            <p className="eyebrow">What we check</p>
            <h2 className="text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold">
              A Complete Look at Your Electrical System
            </h2>
          </Reveal>
          <ChecklistGrid items={CHECK_ITEMS} columns={3} />
        </div>
      </section>

      <section className="bg-cream py-16 md:py-[80px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-10 max-w-[60ch]">
            <p className="eyebrow">What you get</p>
            <h2 className="text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold">
              Inspection + Findings + Recommendations +{" "}
              <span className="text-yellow">Repair Estimate</span>
            </h2>
          </Reveal>
          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {GET_STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1}>
                <div className="group flex flex-col justify-between rounded-2xl border border-line/80 bg-white p-6 md:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-yellow/50 hover:shadow-xl">
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-yellow/15 text-ink ring-1 ring-yellow/30 transition-colors group-hover:bg-yellow">
                        <s.icon className="h-5 w-5 text-ink" strokeWidth="1.8" />
                      </span>
                      <span className="font-mono text-[13px] font-black tracking-widest text-yellow-dark">
                        {s.num}
                      </span>
                    </div>
                    <h3 className="mb-1.5 text-[17px] font-extrabold text-ink">
                      {s.title}
                    </h3>
                    <p className="text-[13.5px] leading-relaxed text-ink-soft">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-[80px]">
        <div className="mx-auto grid max-w-wrap grid-cols-1 items-center gap-12 px-6 md:grid-cols-2">
          <Reveal className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl md:rounded-3xl shadow-xl ring-1 ring-black/5 md:order-2">
            <Image src="/service-healthcheck.png" alt="Electrical inspection checklist" fill className="object-cover" />
          </Reveal>
          <Reveal className="md:order-1">
            <p className="eyebrow">Why it matters</p>
            <h2 className="mb-4 text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold leading-tight">
              Small Checks Prevent{" "}
              <span className="text-yellow">Big Problems</span>
            </h2>
            <p className="max-w-[54ch] text-[15.5px] leading-relaxed text-ink-soft">
              Undetected electrical faults can be dangerous — overloaded
              circuits, worn wiring and faulty earthing rarely show warning
              signs until something fails. A health check catches these
              early, and becomes the entry point for the right repair or an
              ongoing AMC, so your property stays safe year-round.
            </p>
          </Reveal>
        </div>
      </section>

      <EnquiryForm
        id="book"
        variant="booking"
        eyebrow="Book Now"
        title="Book Your Electrical Health Check"
        subtitle="Fill in your details and preferred time — we'll confirm your visit over WhatsApp or a call."
        className="bg-cream"
      />
    </main>
  );
}
