import CTA from "@/components/CTA";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import Services from "@/components/Services";
import { CheckCircle, ClockIcon, ShieldIcon, UsersIcon } from "@/components/icons";

export const metadata = {
  title: "Electrical Services — House Electric",
  description:
    "Electrical repair, installation, maintenance, health checks, AMC and emergency electrical services for homes, businesses and corporate properties.",
};

const GUARANTEES = [
  { icon: ShieldIcon, title: "100% Certified Safety", desc: "All work complies with safety standards." },
  { icon: ClockIcon, title: "On-Time Service", desc: "Punctual experts who value your schedule." },
  { icon: UsersIcon, title: "Expert Electricians", desc: "Background verified & skilled technicians." },
  { icon: CheckCircle, title: "Transparent Pricing", desc: "No hidden charges or unexpected costs." },
];

export default function ServicesPage() {
  return (
    <main>
      <PageHero
        eyebrow="Our Services"
        title={
          <>
            Complete Electrical Services{" "}
            <span className="text-yellow">Under One Roof</span>
          </>
        }
        subtitle="From a single repair to a full annual maintenance contract, House Electric provides end-to-end electrical solutions for residential, commercial and corporate customers."
        primaryCta={{ label: "Book a Service", href: "/contact" }}
        secondaryCta={{ label: "Book Health Check", href: "/services/electrical-health-check" }}
        image="/service-installation.png"
        imageAlt="Professional electrical installation by House Electric"
      />

      <Services showViewAll={false} />

      <section className="bg-cream py-16 md:py-[80px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-10">
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-line/80 bg-white p-8 md:p-12 shadow-xl">
              <div className="glow-blob right-[5%] top-[-20%] h-[280px] w-[280px] bg-yellow/15 opacity-40 blur-[80px]" />
              <div className="relative z-[2] flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <p className="eyebrow">Not sure what you need?</p>
                  <h2 className="text-[clamp(1.5rem,2.8vw,2.1rem)] font-extrabold leading-tight">
                    Start With a Free Electrical{" "}
                    <span className="text-yellow">Health Check</span>
                  </h2>
                  <p className="mt-2.5 max-w-[55ch] text-[15.5px] leading-relaxed text-ink-soft">
                    We&apos;ll inspect your system, flag any potential hazards and give you a
                    clear report with an upfront repair estimate — before you commit to
                    anything.
                  </p>
                </div>
                <a
                  href="/services/electrical-health-check"
                  className="inline-flex flex-none items-center gap-2.5 rounded-md bg-yellow px-7 py-4 text-sm font-extrabold text-ink shadow-[0_10px_25px_-5px_rgba(242,176,30,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-[0_15px_30px_-5px_rgba(242,176,30,0.6)] sm:px-8"
                >
                  Book Health Check
                </a>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {GUARANTEES.map((g, i) => (
              <Reveal key={g.title} delay={i * 0.08}>
                <div className="group rounded-xl border border-line/80 bg-white p-5 transition-all duration-300 hover:border-yellow/50 hover:shadow-soft">
                  <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-yellow/15 text-ink ring-1 ring-yellow/30 transition-colors group-hover:bg-yellow">
                    <g.icon className="h-5 w-5 text-ink" strokeWidth="1.8" />
                  </span>
                  <b className="mb-1 block text-[15px] font-extrabold text-ink">
                    {g.title}
                  </b>
                  <p className="text-[13.5px] leading-relaxed text-ink-soft">
                    {g.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </main>
  );
}
