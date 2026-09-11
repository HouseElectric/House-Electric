import CorporateContent from "./CorporateContent";
import { getContactSettings } from "@/lib/getContactSettings";

export async function generateMetadata() {
  const { city, state } = await getContactSettings();
  return {
    title: `Corporate Electrical Services in ${city} | House Electric`,
    description: `Electrical maintenance, AMC and facility electrical services for corporate offices, IT parks, factories and institutions across ${city}, ${state}.`,
    alternates: { canonical: "/corporate" },
  };
}

export default function CorporatePage() {
  return <CorporateContent />;
}
