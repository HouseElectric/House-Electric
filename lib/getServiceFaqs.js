import { supabase } from "./supabase";

export async function getServiceFaqs(slug) {
  if (!supabase) return [];
  const { data } = await supabase.from("services").select("faqs").eq("slug", slug).maybeSingle();
  return data?.faqs?.length > 0 ? data.faqs : [];
}
