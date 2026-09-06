import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const { data: services } = await supabase.from("services").select("id, title, slug");
for (const s of services ?? []) {
  if (s.slug) continue;
  const slug = slugify(s.title);
  const { error } = await supabase.from("services").update({ slug }).eq("id", s.id);
  if (error) console.error(`Failed for "${s.title}":`, error.message);
  else console.log(`Set slug "${slug}" for "${s.title}"`);
}
console.log("Done.");
