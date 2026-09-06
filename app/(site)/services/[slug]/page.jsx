import { notFound } from "next/navigation";
import CTA from "@/components/CTA";
import ChecklistGrid from "@/components/ChecklistGrid";
import EnquiryForm from "@/components/EnquiryForm";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

async function getService(slug) {
  if (!supabase) return null;
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }) {
  const service = await getService(params.slug);
  if (!service) return { title: "Service Not Found — House Electric" };
  return {
    title: `${service.title} — House Electric`,
    description: service.description,
  };
}

export default async function ServiceDetailPage({ params }) {
  const service = await getService(params.slug);
  if (!service) notFound();

  return (
    <main>
      <PageHero
        eyebrow={service.hero_eyebrow || "Our Services"}
        title={service.title}
        subtitle={service.subtitle || service.description}
        primaryCta={{ label: service.primary_cta_label || "Book This Service", href: service.primary_cta_href || "#booking" }}
        secondaryCta={{ label: service.secondary_cta_label || "Get a Quote", href: service.secondary_cta_href || "/contact" }}
        image={service.image_url}
        imageAlt={service.title}
      />

      {service.checklist_items?.length > 0 && (
        <section className="py-16 md:py-[74px]">
          <div className="mx-auto max-w-wrap px-6">
            <Reveal className="mb-10 max-w-[60ch]">
              <p className="eyebrow">What's included</p>
              <h2>{service.title} — What We Cover</h2>
            </Reveal>
            <ChecklistGrid items={service.checklist_items} />
          </div>
        </section>
      )}

      {service.price_label && (
        <section className={service.checklist_items?.length > 0 ? "pb-16 md:pb-[74px]" : "py-16 md:py-[74px]"}>
          <div className="mx-auto max-w-wrap px-6">
            <div className="rounded-2xl bg-cream p-7 text-center">
              <p className="text-[13px] font-bold uppercase tracking-wider text-body">Pricing</p>
              <p className="mt-1 text-[22px] font-extrabold text-ink">{service.price_label}</p>
            </div>
          </div>
        </section>
      )}

      <EnquiryForm
        id="booking"
        variant="booking"
        eyebrow="Book Now"
        title={`Book ${service.title}`}
        subtitle={service.booking_subtitle || "Fill in your details and our team will confirm your booking shortly."}
      />

      <CTA />
    </main>
  );
}
