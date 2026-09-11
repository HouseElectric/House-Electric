import { supabase } from "./supabase";

// Used by the hand-built service pages (electrical-repair, electrical-installation,
// electrical-maintenance) that shadow the generic [slug] route — these always render
// from their own bespoke layout, so unlike [slug]/page.jsx this never 404s on a
// missing/inactive row; callers just fall back to their hardcoded defaults.
export async function getService(slug) {
  if (!supabase) return null;
  const { data } = await supabase.from("services").select("*").eq("slug", slug).maybeSingle();
  return data;
}
