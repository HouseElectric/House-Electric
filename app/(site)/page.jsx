import CTA from "@/components/CTA";
import Customers from "@/components/Customers";
import HealthCheck from "@/components/HealthCheck";
import Hero from "@/components/Hero";
import HomeAmc from "@/components/HomeAmc";
import HomeBeforeAfter from "@/components/HomeBeforeAfter";
import HomeEmergency from "@/components/HomeEmergency";
import HomeFAQ from "@/components/HomeFAQ";
import HomeProjects from "@/components/HomeProjects";
import HomeServiceAreas from "@/components/HomeServiceAreas";
import Process from "@/components/Process";
import Services from "@/components/Services";
import StatsBand from "@/components/StatsBand";
import Testimonials from "@/components/Testimonials";
import WhyChoose from "@/components/WhyChoose";
import { HomeContentProvider } from "@/contexts/HomeContentContext";
import { getContactSettings } from "@/lib/getContactSettings";

const SITE_URL = "https://houseelectric.in";

export default async function Home() {
  const { phone, email, address, city, state } = await getContactSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "House Electric",
    url: SITE_URL,
    telephone: phone,
    email,
    address: { "@type": "PostalAddress", addressLocality: city, addressRegion: state, streetAddress: address },
    creator: {
      "@type": "Organization",
      name: "Nexa Solutions",
      url: "https://www.nexa-solutions.in/",
    },
  };

  return (
    <HomeContentProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        <Hero />
        <Services />
        <StatsBand />
        <Process />
        <HealthCheck />
        <WhyChoose />
        <HomeAmc />
        <HomeEmergency />
        <HomeProjects />
        <HomeBeforeAfter />
        <Customers />
        <Testimonials />
        <HomeServiceAreas />
        <HomeFAQ />
        <CTA />
      </main>
    </HomeContentProvider>
  );
}
