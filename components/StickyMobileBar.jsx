"use client";

import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { PhoneIcon, WhatsAppIcon } from "./icons";

const MESSAGE = encodeURIComponent(
  "Hi House Electric, I need electrical service. Please contact me."
);

export default function StickyMobileBar() {
  const { phone, whatsapp } = useSiteSettings();

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] flex border-t border-line bg-white shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.12)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <a
        href={`tel:${phone.replace(/\s+/g, "")}`}
        className="flex flex-1 items-center justify-center gap-2 py-3.5 text-[13.5px] font-extrabold text-ink active:bg-cream"
      >
        <PhoneIcon className="h-[18px] w-[18px]" />
        Call Now
      </a>
      <div className="w-px bg-line" />
      <a
        href={`https://wa.me/${whatsapp}?text=${MESSAGE}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center justify-center gap-2 bg-[#25D366] py-3.5 text-[13.5px] font-extrabold text-white active:bg-[#1ebd54]"
      >
        <WhatsAppIcon className="h-[18px] w-[18px]" />
        WhatsApp
      </a>
    </div>
  );
}
