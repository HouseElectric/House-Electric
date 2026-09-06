import CTA from "@/components/CTA";
import PageHero from "@/components/PageHero";
import Testimonials from "@/components/Testimonials";

export const metadata = {
  title: "Customer Reviews — House Electric",
  description:
    "Real feedback from House Electric's residential, commercial and corporate customers across repairs, installations, health checks and AMC.",
};

export default function ReviewsPage() {
  return (
    <main>
      <PageHero
        eyebrow="Reviews"
        title="Real Stories From Real Customers"
        subtitle="We ask every customer for honest feedback after a service — here's what they've told us."
        primaryCta={{ label: "Book a Service", href: "/contact" }}
      />
      <Testimonials />
      <CTA />
    </main>
  );
}
