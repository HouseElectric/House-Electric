"use client";

import Image from "next/image";
import Counter from "./Counter";
import Reveal from "./Reveal";
import { AwardIcon, BuildingIcon, CheckCircle, UsersIcon } from "./icons";
import { useHomeContent } from "@/contexts/HomeContentContext";

const ICON_MAP = { users: UsersIcon, check: CheckCircle, building: BuildingIcon, award: AwardIcon };

export default function StatsBand() {
  const { stats, statsImage, statsVisible } = useHomeContent();
  const isLocal = statsImage?.startsWith("/");

  return (
    <section className="relative overflow-hidden bg-[#0B0B0B] text-white">
      {isLocal ? (
        <Image src={statsImage} alt="Modern house exterior at dusk" fill className="object-cover opacity-75" />
      ) : (
        <img src={statsImage} alt="Modern house exterior at dusk" className="absolute inset-0 h-full w-full object-cover opacity-75" />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,11,11,0.85)_0%,rgba(11,11,11,0.5)_55%,rgba(11,11,11,0.2)_100%)]" />
      <div
        className={`relative z-[2] mx-auto grid max-w-wrap grid-cols-1 items-center gap-10 px-6 py-14 md:py-[74px] ${
          statsVisible ? "md:grid-cols-[1fr_auto]" : ""
        }`}
      >
        <Reveal>
          <h2 className="mb-3.5 text-white text-[clamp(1.7rem,3.2vw,2.5rem)] font-extrabold leading-tight">
            Electrical Safety
            <br />
            Starts at Home
          </h2>
          <p className="mb-6 max-w-[44ch] text-[15px] leading-relaxed text-[#D3CFC7]">
            Whether it&apos;s your home, office or commercial space, we help
            you stay safe, compliant and worry-free.
          </p>
          <a
            href="/services/electrical-health-check"
            className="inline-flex items-center gap-2 rounded-md bg-yellow px-6 py-3.5 text-sm font-bold text-ink transition-transform duration-200 hover:-translate-y-0.5 hover:bg-yellow-dark"
          >
            Book Your Inspection
          </a>
        </Reveal>

        {statsVisible && (
        <Reveal delay={0.15}>
          <div className="grid min-w-[280px] sm:min-w-[310px] gap-5 rounded-2xl bg-white p-7 shadow-2xl">
            {stats.map((s) => {
              const Icon = ICON_MAP[s.icon] || UsersIcon;
              return (
                <div key={s.label} className="flex items-center gap-4">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#FAF7F2]">
                    <Icon className="h-[18px] w-[18px] text-ink" strokeWidth="1.8" />
                  </span>
                  <div>
                    <Counter to={s.to} suffix={s.suffix} className="text-ink text-[26px] font-extrabold leading-tight" />
                    <span className="text-[13px] font-medium text-body">{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
        )}
      </div>
    </section>
  );
}
