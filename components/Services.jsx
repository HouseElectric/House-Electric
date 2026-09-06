"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Reveal from "./Reveal";
import { supabase } from "@/lib/supabase";
import {
  AlertBadge,
  AmcBadge,
  BoltBadge,
  InstallBadge,
  ReportIcon,
  GearIcon,
} from "./icons";

const ICONS = {
  repair: BoltBadge,
  install: InstallBadge,
  maintenance: GearIcon,
  health: ReportIcon,
  amc: AmcBadge,
  emergency: AlertBadge,
  bolt: BoltBadge,
};

const FALLBACK = [
  {
    title: "Electrical Repair",
    description: "Fault finding, switch/socket replacement, MCB/RCCB work, DB repairs, wiring repairs and more.",
    price_label: null,
    icon_key: "repair",
    image_url: "/service-repair.png",
    href: "/services/electrical-repair",
  },
  {
    title: "Electrical Installation",
    description: "New wiring, lighting, fans, switches, DB installation, electrical accessories and office setups.",
    price_label: null,
    icon_key: "install",
    image_url: "/service-installation.png",
    href: "/services/electrical-installation",
  },
  {
    title: "Electrical Maintenance",
    description: "Regular inspection and maintenance for homes and businesses.",
    price_label: null,
    icon_key: "maintenance",
    image_url: "/service-maintenance.png",
    href: "/services/electrical-maintenance",
  },
  {
    title: "Electrical Health Check",
    description: "Professional inspection with detailed report and recommendations.",
    price_label: null,
    icon_key: "health",
    image_url: "/service-healthcheck.png",
    href: "/health-check",
  },
  {
    title: "Annual Maintenance Contract (AMC)",
    description: "Planned maintenance, priority service and peace of mind.",
    price_label: null,
    icon_key: "amc",
    image_url: "/service-amc.png",
    href: "/amc",
  },
  {
    title: "Emergency Electrical Service",
    description: "Urgent electrical issues? We're just a call away.",
    price_label: null,
    icon_key: "emergency",
    image_url: "/service-emergency.png",
    href: "/contact",
  },
];

export default function Services({ showViewAll = true }) {
  const [services, setServices] = useState(FALLBACK);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true });
      if (data && data.length > 0) setServices(data);
    })();
  }, []);

  return (
    <section className="py-16 md:py-[74px]" id="services">
      <div className="mx-auto max-w-wrap px-6">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <p className="eyebrow">Our services</p>
            <h2 className="mb-3 text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold leading-tight">
              Complete Electrical Services{" "}
              <span className="text-yellow">Under One Roof</span>
            </h2>
            <p className="max-w-[56ch] text-[15.5px] leading-relaxed text-ink-soft">
              We provide end-to-end electrical solutions for residential, commercial and
              corporate customers. Quality work, professional approach and long-term support.
            </p>
          </Reveal>
          {showViewAll && (
            <Reveal delay={0.15}>
              <a
                href="/services"
                className="inline-flex flex-none items-center gap-2 rounded-md border border-line px-6 py-3.5 text-sm font-extrabold text-ink transition-all hover:border-ink hover:bg-white hover:shadow-sm"
              >
                View All Services
              </a>
            </Reveal>
          )}
        </div>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Badge = ICONS[s.icon_key] || BoltBadge;
            const isLocal = s.image_url?.startsWith("/");
            return (
              <motion.article
                key={s.id || s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-line bg-white"
              >
                <div className="relative aspect-[16/11] overflow-hidden">
                  {isLocal ? (
                    <Image
                      src={s.image_url}
                      alt={s.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={s.image_url}
                      alt={s.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
                  <span className="absolute bottom-3.5 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-yellow text-ink shadow-md ring-2 ring-white/80">
                    <Badge className="h-[18px] w-[18px] text-ink" />
                  </span>
                  {s.price_label && (
                    <span className="absolute right-3.5 top-3.5 z-10 rounded-full bg-white/90 px-3 py-1 text-[11.5px] font-bold text-ink backdrop-blur">
                      {s.price_label}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                  <h3 className="mb-2 text-[19px] font-extrabold text-ink">{s.title}</h3>
                  <p className="mb-4 text-[14.5px] leading-relaxed text-ink-soft">{s.description}</p>
                  <a
                    href={s.href}
                    className="mt-auto inline-flex w-fit items-center text-[14px] font-bold text-ink underline decoration-line underline-offset-4 transition-colors hover:text-yellow-dark hover:decoration-yellow-dark"
                  >
                    Learn More
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
