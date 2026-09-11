import ContactContent from "./ContactContent";
import { getContactSettings } from "@/lib/getContactSettings";

export async function generateMetadata() {
  const { city, state } = await getContactSettings();
  return {
    title: `Contact Us | Electricians in ${city} — House Electric`,
    description: `Get in touch with House Electric — call, WhatsApp or book online for electrical repair, installation, maintenance and AMC services across ${city}, ${state}.`,
    alternates: { canonical: "/contact" },
  };
}

export default function ContactPage() {
  return <ContactContent />;
}
