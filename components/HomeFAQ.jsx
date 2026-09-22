"use client";

import Reveal from "./Reveal";
import FAQAccordion from "./FAQAccordion";
import { useHomeContent } from "@/contexts/HomeContentContext";

export default function HomeFAQ() {
  const { faqs } = useHomeContent();

  return (
    <section className="bg-cream py-16 md:py-[80px]">
      <div className="mx-auto max-w-wrap px-6">
        <Reveal className="mx-auto mb-10 max-w-[60ch] text-center">
          <p className="eyebrow">{faqs.eyebrow}</p>
          <h2 className="text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold">
            {faqs.titlePlain} <span className="text-yellow">{faqs.titleHighlight}</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto max-w-3xl">
          <FAQAccordion items={faqs.items} />
        </Reveal>
      </div>
    </section>
  );
}
