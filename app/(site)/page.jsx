import CTA from "@/components/CTA";
import Customers from "@/components/Customers";
import HealthCheck from "@/components/HealthCheck";
import Hero from "@/components/Hero";
import Process from "@/components/Process";
import Services from "@/components/Services";
import StatsBand from "@/components/StatsBand";
import Testimonials from "@/components/Testimonials";
import WhyChoose from "@/components/WhyChoose";
import { HomeContentProvider } from "@/contexts/HomeContentContext";

export default function Home() {
  return (
    <HomeContentProvider>
      <main>
        <Hero />
        <Services />
        <StatsBand />
        <Process />
        <HealthCheck />
        <WhyChoose />
        <Customers />
        <Testimonials />
        <CTA />
      </main>
    </HomeContentProvider>
  );
}
