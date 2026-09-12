"use client";

import Reveal from "./Reveal";
import FAQAccordion from "./FAQAccordion";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function HomeFAQ() {
  const { city, state } = useSiteSettings();

  const faqs = [
    {
      q: "How can I book an electrician?",
      a: "Call us, message us on WhatsApp, or fill out the booking form on our Contact page. You can also create an account to track your request from start to finish.",
    },
    {
      q: "Do you provide emergency electrical services?",
      a: "Yes — for urgent issues like power failure, MCB tripping, sparking or a burning smell, call or WhatsApp us directly for priority attention.",
    },
    {
      q: "What is included in Electrical AMC?",
      a: "Our AMC plans cover scheduled preventive inspections, DB/panel checks, safety testing and priority support — with visit reports after every scheduled visit.",
    },
    {
      q: "Which areas do you cover?",
      a: `We currently serve ${city}, ${state} and the surrounding localities — see our Service Areas page for the full list.`,
    },
    {
      q: "Do you provide commercial electrical maintenance?",
      a: "Yes. We handle residential, commercial and corporate properties — from apartments and independent houses to offices, shops and factories.",
    },
    {
      q: "Can I book through WhatsApp?",
      a: "Yes — tap the WhatsApp button on any page, tell us what you need, and we'll take it from there.",
    },
  ];

  return (
    <section className="bg-cream py-16 md:py-[80px]">
      <div className="mx-auto max-w-wrap px-6">
        <Reveal className="mx-auto mb-10 max-w-[60ch] text-center">
          <p className="eyebrow">FAQs</p>
          <h2 className="text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold">
            Frequently Asked <span className="text-yellow">Questions</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto max-w-3xl">
          <FAQAccordion items={faqs} />
        </Reveal>
      </div>
    </section>
  );
}
