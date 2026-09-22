import CorporateContent from "./CorporateContent";
import { getContactSettings } from "@/lib/getContactSettings";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export async function generateMetadata() {
  const { city, state } = await getContactSettings();
  return {
    title: `Corporate Electrical Services in ${city} | House Electric`,
    description: `Electrical maintenance, AMC and facility electrical services for corporate offices, IT parks, factories and institutions across ${city}, ${state}.`,
    alternates: { canonical: "/corporate" },
  };
}

async function getServiceDetail() {
  if (!supabase) return null;
  const { data } = await supabase.from("services").select("*").eq("slug", "corporate-amc-solutions").eq("active", true).maybeSingle();
  return data;
}

export default async function CorporatePage() {
  const service = await getServiceDetail();
  return <CorporateContent service={service} />;
}
