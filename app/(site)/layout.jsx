import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import CallButton from "@/components/CallButton";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";

export default function SiteLayout({ children }) {
  return (
    <SiteSettingsProvider>
      <Header />
      <div>{children}</div>
      <Footer />
      <CallButton />
      <WhatsAppButton />
    </SiteSettingsProvider>
  );
}
