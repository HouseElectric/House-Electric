"use client";

import { motion } from "framer-motion";
import EnquiryForm from "@/components/EnquiryForm";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/icons";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const WHATSAPP_MSG = encodeURIComponent(
  "Hello House Electric, I need electrical service. My location is __. My requirement is __."
);

function getCards({ phone, whatsapp, email, city, state }) {
  return [
    {
      icon: PhoneIcon,
      title: "Call Direct Hotline",
      value: phone,
      subtext: "24/7 Emergency Breakdown Support",
      cta: "Call Now",
      href: `tel:${phone.replace(/\s+/g, "")}`,
    },
    {
      icon: WhatsAppIcon,
      title: "Instant WhatsApp Chat",
      value: "Chat on WhatsApp",
      subtext: "Typical response in under 15 mins",
      cta: "Start Chat",
      href: `https://wa.me/${whatsapp}?text=${WHATSAPP_MSG}`,
    },
    {
      icon: MailIcon,
      title: "Email Engineering Team",
      value: email,
      subtext: "Official quotes & AMC proposals",
      cta: "Send Email",
      href: `mailto:${email}`,
    },
    {
      icon: PinIcon,
      title: "Headquarters & Areas",
      value: `${city}, ${state}`,
      subtext: "Serving all surrounding industrial zones",
      cta: "View Service Areas",
      href: "/service-areas",
    },
  ];
}

const FAST_LINKS = [
  {
    badge: "Residential & Home",
    title: "Need Urgent Repair or Installation?",
    desc: "Got a tripping MCB, short circuit, or wiring emergency? Book an expert home electrician.",
    linkText: "Book Service",
    href: "#booking",
  },
  {
    badge: "Annual Contracts",
    title: "Looking for Home or Building AMC?",
    desc: "Save up to 35% on electrical maintenance with guaranteed priority visits and zero labor charges.",
    linkText: "Explore AMC Plans",
    href: "/amc",
  },
  {
    badge: "Commercial & Corporate",
    title: "Facility Manager or Commercial Owner?",
    desc: "Get SLA-backed corporate maintenance contracts, thermography audits, and HT/LT panel care.",
    linkText: "View Corporate Solutions",
    href: "/corporate",
  },
];

const SOCIAL_ICONS = [
  {
    label: "Facebook",
    d: "M13 22v-8h3l.5-3H13V9c0-.9.3-1.5 1.6-1.5H17V4.8A22 22 0 0 0 14.6 4.7C12.1 4.7 10.4 6.2 10.4 9v2H7.5v3h2.9v8Z",
  },
  {
    label: "LinkedIn",
    d: "M4.5 9H8v11H4.5zM6.2 3.8a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM10 9h3.3v1.5c.6-1 1.7-1.8 3.4-1.8 2.7 0 3.8 1.7 3.8 4.6V20h-3.5v-6c0-1.4-.5-2.3-1.8-2.3-1.1 0-1.7.7-2 1.5-.1.2-.1.6-.1.9V20H10Z",
  },
];

function ContactSidebar({ phone, whatsapp, email, address, city, state, facebook, instagram, linkedin }) {
  const rows = [
    { icon: PhoneIcon, label: "Call", value: phone, href: `tel:${phone.replace(/\s+/g, "")}` },
    { icon: WhatsAppIcon, label: "WhatsApp", value: "Chat now", href: `https://wa.me/${whatsapp}?text=${WHATSAPP_MSG}` },
    { icon: MailIcon, label: "Email", value: email, href: `mailto:${email}` },
    { icon: PinIcon, label: "Address", value: address || `${city}, ${state}`, href: "/service-areas", isAddress: true },
  ];

  return (
    <Reveal delay={0.15} className="rounded-2xl bg-white p-5 sm:p-7 text-ink shadow-xl md:rounded-3xl md:p-8 border border-line/80">
      <h3 className="mb-1 text-[16px] font-extrabold text-ink">Reach Us Directly</h3>
      <p className="mb-6 text-[13.5px] text-charcoal/70">Prefer to skip the form? Contact us right away.</p>

      <div className="space-y-3.5">
        {rows.map((r) => (
          <a
            key={r.label}
            href={r.href}
            target={r.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="group flex items-start gap-3.5 rounded-xl border border-line/80 bg-cream/40 p-3.5 transition-all duration-200 hover:border-yellow/60 hover:bg-white hover:shadow-md"
          >
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-yellow/15 text-yellow-dark transition-colors group-hover:bg-yellow group-hover:text-ink mt-0.5">
              <r.icon className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-charcoal/60">{r.label}</p>
              {r.isAddress ? (
                <p className="text-[13px] font-bold leading-snug text-ink group-hover:text-yellow-dark transition-colors break-words">
                  {r.value}
                </p>
              ) : (
                <p className="truncate text-[14px] font-extrabold text-ink group-hover:text-yellow-dark transition-colors">
                  {r.value}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>

      {(facebook || instagram || linkedin) && (
        <div className="mt-7 border-t border-line/80 pt-6">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-charcoal/60">Follow Us</p>
          <div className="flex gap-2.5">
            {facebook && (
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-cream/50 text-ink transition-all duration-300 hover:border-yellow hover:bg-yellow hover:text-ink shadow-2xs"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d={SOCIAL_ICONS[0].d} />
                </svg>
              </a>
            )}
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-cream/50 text-ink transition-all duration-300 hover:border-yellow hover:bg-yellow hover:text-ink shadow-2xs"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d={SOCIAL_ICONS[1].d} />
                </svg>
              </a>
            )}
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-cream/50 text-ink transition-all duration-300 hover:border-yellow hover:bg-yellow hover:text-ink shadow-2xs"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            )}
          </div>
        </div>
      )}
    </Reveal>
  );
}

export default function ContactPage() {
  const settings = useSiteSettings();
  const { phone, whatsapp, email, address, city, state, facebook, instagram, linkedin } = settings;
  const CARDS = getCards(settings);
  return (
    <main>
      <PageHero
        eyebrow="GET IN TOUCH 24/7"
        title={
          <>
            Let&apos;s Power & Secure Your{" "}
            <span className="text-yellow font-extrabold">Space Today</span>
          </>
        }
        subtitle="Need an urgent electrician, a free thermography site audit, or a customized corporate AMC? We respond within 15 minutes during working hours."
        primaryCta={{ label: "Call Direct Hotline", href: `tel:${phone.replace(/\s+/g, "")}` }}
        secondaryCta={{ label: "WhatsApp Instant Chat", href: `https://wa.me/${whatsapp}?text=${WHATSAPP_MSG}` }}
      />

      {/* Booking Form + Contact Details / Social sidebar */}
      <EnquiryForm
        id="booking"
        variant="booking"
        eyebrow="BOOK A SERVICE ONLINE"
        title="Send Us Your Requirement"
        subtitle="Fill in your details below and our lead electrical engineer will connect with you within minutes."
        sidebar={
          <ContactSidebar
            phone={phone}
            whatsapp={whatsapp}
            email={email}
            address={address}
            city={city}
            state={state}
            facebook={facebook}
            instagram={instagram}
            linkedin={linkedin}
          />
        }
      />

      {/* Interactive Map & Office Location */}
      <section className="pb-16 md:pb-[74px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">HEADQUARTERS LOCATION</p>
              <h2 className="text-xl md:text-2xl font-extrabold">Serving {city} & Surrounding Regions</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Operational Dispatch Active Now
            </div>
          </Reveal>

          <Reveal className="overflow-hidden rounded-2xl md:rounded-3xl border border-line/80 bg-white p-3 shadow-xl">
            <iframe
              title="House Electric location map"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${city}, ${state}`)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
              className="h-[360px] w-full rounded-xl"
              loading="lazy"
            />
          </Reveal>
        </div>
      </section>

      {/* Interactive Contact Channels Grid */}
      <section className="bg-cream py-16 md:py-[74px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-10 max-w-[60ch]">
            <p className="eyebrow">DIRECT CONTACT CHANNELS</p>
            <h2>Choose Your Preferred Way to Connect</h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-line/80 bg-white p-7 shadow-sm transition-all duration-300 hover:border-yellow/60 hover:shadow-xl"
              >
                <div>
                  <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow/15 text-yellow-dark ring-1 ring-yellow/30 transition-colors group-hover:bg-yellow group-hover:text-ink">
                    <c.icon className="h-6 w-6" strokeWidth="2" />
                  </span>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-charcoal/70">
                    {c.title}
                  </p>
                  <b className="mb-1.5 block text-[14px] sm:text-[15px] font-extrabold text-ink group-hover:text-yellow-dark transition-colors break-all leading-tight">
                    {c.value}
                  </b>
                  <p className="text-[13.5px] leading-relaxed text-charcoal/80">
                    {c.subtext}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-line/50">
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-ink transition-colors hover:text-yellow-dark"
                  >
                    {c.cta}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Action Assistance Strip */}
      <section className="py-16 md:py-[74px]">
        <div className="mx-auto max-w-wrap px-6">
          <Reveal className="mb-12 max-w-[62ch]">
            <p className="eyebrow">FAST ASSISTANCE</p>
            <h2 className="mb-3">How Can We Help You Right Now?</h2>
            <p className="text-[15.5px] leading-relaxed text-charcoal/80">
              Select your requirement below for immediate service routing or detailed information.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {FAST_LINKS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex flex-col justify-between rounded-2xl border border-line/80 bg-white p-7 shadow-sm transition-all duration-300 hover:border-yellow/50 hover:shadow-lg"
              >
                <div>
                  <span className="mb-4 inline-block rounded-md bg-yellow/15 px-3 py-1 text-xs font-bold text-yellow-dark">
                    {item.badge}
                  </span>
                  <h3 className="mb-2.5 text-base font-extrabold text-ink">{item.title}</h3>
                  <p className="mb-6 text-[14px] leading-relaxed text-charcoal/80">{item.desc}</p>
                </div>
                <div>
                  <a
                    href={item.href}
                    className="inline-flex items-center gap-2 text-sm font-extrabold text-ink hover:text-yellow-dark underline underline-offset-4"
                  >
                    {item.linkText}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

