"use client";

import Reveal from "./Reveal";
import { AmcBadge, BuildingIcon, ClockIcon, HomeIcon, ReportIcon, ShieldIcon } from "./icons";

const POINTS = [
  { icon: ShieldIcon, label: "Preventive Inspections" },
  { icon: ReportIcon, label: "Scheduled Maintenance Reports" },
  { icon: ClockIcon, label: "Priority Support" },
];

const SEGMENTS = [
  { icon: HomeIcon, label: "Residential" },
  { icon: BuildingIcon, label: "Commercial" },
  { icon: BuildingIcon, label: "Corporate" },
];

export default function HomeAmc() {
  return (
    <section className="relative overflow-hidden bg-[#0B0B0C] py-16 md:py-[80px]">
      <div className="glow-blob left-[-8%] top-[-10%] h-[320px] w-[320px] bg-yellow/15 opacity-40 blur-[110px]" />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-[1] mx-auto grid max-w-wrap grid-cols-1 items-center gap-10 px-6 md:grid-cols-[1.1fr_1fr] md:gap-14">
        <Reveal>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow/15 px-3.5 py-1.5 text-[11.5px] font-extrabold uppercase tracking-wide text-yellow">
            <AmcBadge className="h-4 w-4" />
            Electrical AMC
          </span>
          <h2 className="mb-4 text-[clamp(1.75rem,3.4vw,2.6rem)] font-extrabold leading-tight text-white">
            Stop Reacting to Breakdowns. <span className="text-yellow">Prevent Them.</span>
          </h2>
          <p className="mb-7 max-w-[50ch] text-[15px] leading-relaxed text-white/60">
            An Annual Maintenance Contract keeps your electrical system inspected, documented and safe all
            year — with priority service whenever you need us, instead of waiting until something breaks.
          </p>

          <div className="mb-8 flex flex-wrap gap-x-6 gap-y-3">
            {POINTS.map((p) => (
              <div key={p.label} className="flex items-center gap-2 text-[13.5px] font-bold text-white/85">
                <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-white/[0.06] text-yellow ring-1 ring-white/10">
                  <p.icon className="h-4 w-4" />
                </span>
                {p.label}
              </div>
            ))}
          </div>

          <a
            href="/amc/plans#plans"
            className="inline-flex items-center justify-center gap-2.5 rounded-md bg-yellow px-7 py-4 text-sm font-extrabold text-ink shadow-[0_10px_25px_-5px_rgba(242,176,30,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark sm:px-8"
          >
            Explore AMC Plans
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-1">
            {SEGMENTS.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
              >
                <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-yellow/15 text-yellow">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <b className="block text-[15px] text-white">{s.label} AMC</b>
                  <span className="text-[12.5px] text-white/50">Tailored maintenance coverage</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
