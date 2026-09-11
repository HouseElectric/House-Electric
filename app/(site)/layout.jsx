"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import CallButton from "@/components/CallButton";
import StickyMobileBar from "@/components/StickyMobileBar";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { CustomerAuthProvider } from "@/contexts/CustomerAuthContext";

export default function SiteLayout({ children }) {
  const pathname = usePathname();
  // The customer dashboard renders its own full-screen app shell (sidebar, header,
  // notifications) — the public marketing navbar/footer/floating bars aren't needed there.
  const isAccountArea = pathname?.startsWith("/account");

  return (
    <SiteSettingsProvider>
      <CustomerAuthProvider>
        {!isAccountArea && <Header />}
        <div className={isAccountArea ? "" : "pb-[58px] md:pb-0"}>{children}</div>
        {!isAccountArea && <Footer />}
        {!isAccountArea && (
          <>
            <div className="hidden md:contents print:hidden">
              <CallButton />
              <WhatsAppButton />
            </div>
            <div className="print:hidden">
              <StickyMobileBar />
            </div>
          </>
        )}
      </CustomerAuthProvider>
    </SiteSettingsProvider>
  );
}
