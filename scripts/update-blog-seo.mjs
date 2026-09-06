import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { uploadLocalFile } from "./lib/cloudinary-node.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const UPDATES = [
  {
    slug: "warning-signs-wiring-needs-attention",
    file: "hero-electrician-3.png",
    cover_image_alt: "Electrician using a multimeter to test wiring for faults",
    seo_title: "5 Warning Signs Your Wiring Needs Attention | House Electric",
    seo_description:
      "Flickering lights, warm switches, burning smells — learn the 5 warning signs of electrical wiring problems and when to call a professional electrician.",
  },
  {
    slug: "why-mcb-keeps-tripping",
    file: "service-maintenance.png",
    cover_image_alt: "Open distribution board showing MCB circuit breakers and wiring",
    seo_title: "Why Your MCB Keeps Tripping (And When to Worry) | House Electric",
    seo_description:
      "Is your MCB tripping frequently? Learn the difference between a normal overload trip and a serious wiring fault, and when to call an electrician.",
  },
  {
    slug: "what-is-earthing-why-it-matters",
    file: "process-electrician.png",
    cover_image_alt: "Electrician checking earthing and wiring connections in a distribution panel",
    seo_title: "What Is Earthing and Why It Matters | House Electric",
    seo_description:
      "Earthing protects your home and family from electric shock. Learn what earthing is, why it's often missing, and how a health check catches it.",
  },
  {
    slug: "how-often-electrical-health-check",
    file: "service-healthcheck.png",
    cover_image_alt: "Electrical inspection checklist and safety report on a clipboard",
    seo_title: "How Often Should You Get an Electrical Health Check? | House Electric",
    seo_description:
      "Find out how often homes, shops and offices should schedule an electrical health check to catch faults early and stay safe.",
  },
  {
    slug: "amc-vs-one-off-repairs",
    file: "service-amc.png",
    cover_image_alt: "Two professionals shaking hands after signing an AMC agreement",
    seo_title: "AMC vs One-Off Electrical Repairs: What Saves You More | House Electric",
    seo_description:
      "Compare Annual Maintenance Contracts (AMC) with one-off electrical repairs and see which one actually saves you money and downtime.",
  },
  {
    slug: "electrical-safety-basics-shops-offices",
    file: "customer-commercial.png",
    cover_image_alt: "Modern office interior with electrical lighting and workstations",
    seo_title: "Electrical Safety Basics for Small Shops & Offices | House Electric",
    seo_description:
      "Simple electrical safety habits every shop and office should follow — from avoiding overloaded sockets to keeping DB panels accessible.",
  },
];

for (const u of UPDATES) {
  const cover_image = await uploadLocalFile(path.join(PUBLIC_DIR, u.file), "house-electric/blog");
  const { error } = await supabase
    .from("blog_posts")
    .update({
      cover_image,
      cover_image_alt: u.cover_image_alt,
      seo_title: u.seo_title,
      seo_description: u.seo_description,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", u.slug);
  if (error) console.error(`Failed "${u.slug}":`, error.message);
  else console.log(`Updated "${u.slug}" with cover image + SEO.`);
}

console.log("Done.");
