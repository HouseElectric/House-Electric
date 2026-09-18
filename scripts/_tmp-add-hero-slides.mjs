import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: row, error: fetchErr } = await supabase.from("site_settings").select("data").eq("key", "home").maybeSingle();
if (fetchErr) throw fetchErr;

const existing = row?.data || {};
const slides = existing.heroSlides || [];

const NEW_SLIDES = [
  {
    image: "/service-amc.png",
    alt: "House Electric technician performing scheduled AMC maintenance",
    eyebrow: "Annual maintenance contract",
    titleLine1: "Never Worry About",
    titleLine2: "Electrical Issues",
    titleHighlight: "Again",
    subtitle:
      "Our AMC plans cover scheduled inspections, priority support and complete peace of mind — for homes, offices and commercial properties.",
    primaryLabel: "Explore AMC Plans",
    primaryHref: "/amc/plans",
    secondaryLabel: "Get a Quote",
    secondaryHref: "/contact",
  },
  {
    image: "/service-emergency.png",
    alt: "House Electric technician responding to an emergency electrical call",
    eyebrow: "Emergency electrical service",
    titleLine1: "Electrical Emergency?",
    titleLine2: "We're",
    titleHighlight: "On Our Way",
    subtitle:
      "Power failure, sparking, burning smell or a tripped MCB — call us for fast, safe emergency electrical support.",
    primaryLabel: "Get Emergency Help",
    primaryHref: "/contact",
    secondaryLabel: "WhatsApp Now",
    secondaryHref: "/contact",
  },
];

// Avoid duplicating if this script is ever re-run — match by eyebrow text.
const existingEyebrows = new Set(slides.map((s) => s.eyebrow));
const toAdd = NEW_SLIDES.filter((s) => !existingEyebrows.has(s.eyebrow));

const updated = { ...existing, heroSlides: [...slides, ...toAdd] };

const { error: upsertErr } = await supabase
  .from("site_settings")
  .upsert([{ key: "home", data: updated, updated_at: new Date().toISOString() }]);
if (upsertErr) throw upsertErr;

console.log(`Total slides now: ${updated.heroSlides.length} (added ${toAdd.length} new)`);
process.exit(0);
