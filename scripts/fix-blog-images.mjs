import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { uploadLocalFile } from "./lib/cloudinary-node.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

// Re-matched so each cover image actually reflects what the post is about.
const UPDATES = [
  {
    slug: "warning-signs-wiring-needs-attention",
    file: "service-repair.png",
    cover_image_alt: "Close-up of an electrician's hands checking faulty wiring with a screwdriver",
  },
  {
    slug: "why-mcb-keeps-tripping",
    file: "service-maintenance.png",
    cover_image_alt: "Open distribution board showing rows of MCB circuit breakers",
  },
  {
    slug: "what-is-earthing-why-it-matters",
    file: "hero-electrician-3.png",
    cover_image_alt: "Electrician using a multimeter to test earthing and circuit continuity",
  },
  {
    slug: "how-often-electrical-health-check",
    file: "service-healthcheck.png",
    cover_image_alt: "Electrical inspection checklist and safety report on a clipboard",
  },
  {
    slug: "amc-vs-one-off-repairs",
    file: "service-amc.png",
    cover_image_alt: "Two professionals shaking hands after signing an AMC agreement",
  },
  {
    slug: "electrical-safety-basics-shops-offices",
    file: "process-electrician.png",
    cover_image_alt: "Electrician servicing a distribution board inside a commercial space",
  },
];

for (const u of UPDATES) {
  const cover_image = await uploadLocalFile(path.join(PUBLIC_DIR, u.file), "house-electric/blog");
  const { error } = await supabase
    .from("blog_posts")
    .update({ cover_image, cover_image_alt: u.cover_image_alt, updated_at: new Date().toISOString() })
    .eq("slug", u.slug);
  if (error) console.error(`Failed "${u.slug}":`, error.message);
  else console.log(`Updated cover image for "${u.slug}" -> ${u.file}`);
}

console.log("Done.");
