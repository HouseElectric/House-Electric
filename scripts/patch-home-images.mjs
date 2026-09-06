import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const DEFAULT_IMAGES = {
  statsImage: "/stats-house.png",
  process: { image: "/process-electrician.png" },
  healthCheck: { image: "/healthcheck-ceiling.png" },
  whyChoose: { promoImage: "/whychoose-livingroom.png" },
  customers: {
    spaces: [
      { image: "/customer-residential.png" },
      { image: "/customer-commercial.png" },
      { image: "/customer-corporate.png" },
    ],
  },
};

const { data: existing } = await supabase.from("site_settings").select("data").eq("key", "home").maybeSingle();
if (!existing?.data) {
  console.error("No existing home row found — run seed-home.mjs first.");
  process.exit(1);
}

const d = existing.data;

if (d.statsImage === undefined) d.statsImage = DEFAULT_IMAGES.statsImage;

if (d.process && d.process.image === undefined) d.process.image = DEFAULT_IMAGES.process.image;
if (d.healthCheck && d.healthCheck.image === undefined) d.healthCheck.image = DEFAULT_IMAGES.healthCheck.image;
if (d.whyChoose && d.whyChoose.promoImage === undefined) d.whyChoose.promoImage = DEFAULT_IMAGES.whyChoose.promoImage;

if (d.customers?.spaces?.length) {
  d.customers.spaces = d.customers.spaces.map((s, i) => ({
    ...s,
    image: s.image ?? DEFAULT_IMAGES.customers.spaces[i]?.image,
  }));
}

const { error } = await supabase
  .from("site_settings")
  .upsert([{ key: "home", data: d, updated_at: new Date().toISOString() }]);

if (error) console.error("Failed:", error.message);
else console.log("Home content patched with default image fields.");
