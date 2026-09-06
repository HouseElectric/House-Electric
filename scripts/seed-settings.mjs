import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment (.env).");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

// -------------------------------------------------------------- Contact info
async function seedContact() {
  const { data: existing } = await supabase.from("site_settings").select("key").eq("key", "contact").maybeSingle();
  if (existing) {
    console.log("Contact settings already exist, skipping.");
    return;
  }
  const contact = {
    phone: "+91 97736 44275",
    whatsapp: "919773644275",
    email: "office.houseelectric@gmail.com",
    address: "Kh No. 307/202, 1st Floor, Plot No. 174, Street Number 4, Block-B, New Delhi, North Delhi, Delhi 110042",
    city: "New Delhi",
    state: "Delhi",
  };
  const { error } = await supabase.from("site_settings").insert([{ key: "contact", data: contact }]);
  if (error) console.error("Contact settings failed:", error.message);
  else console.log("Contact settings seeded.");
}

// ------------------------------------------------------------------ Services
const SERVICES = [
  {
    title: "Electrical Repair",
    description: "Fault finding, switch/socket replacement, MCB/RCCB work, DB repairs, wiring repairs and more.",
    price_label: "Starting ₹299 visit charge",
    icon_key: "repair",
    image_url: "/service-repair.png",
    href: "/services/electrical-repair",
    display_order: 1,
  },
  {
    title: "Electrical Installation",
    description: "New wiring, lighting, fans, switches, DB installation, electrical accessories and office setups.",
    price_label: "Custom quotation",
    icon_key: "install",
    image_url: "/service-installation.png",
    href: "/services/electrical-installation",
    display_order: 2,
  },
  {
    title: "Electrical Maintenance",
    description: "Regular inspection and maintenance for homes and businesses.",
    price_label: "Custom quotation",
    icon_key: "maintenance",
    image_url: "/service-maintenance.png",
    href: "/services/electrical-maintenance",
    display_order: 3,
  },
  {
    title: "Electrical Health Check",
    description: "Professional inspection with detailed report and recommendations.",
    price_label: "Starting ₹499",
    icon_key: "health",
    image_url: "/service-healthcheck.png",
    href: "/health-check",
    display_order: 4,
  },
  {
    title: "Annual Maintenance Contract (AMC)",
    description: "Planned maintenance, priority service and peace of mind.",
    price_label: "Plans from ₹4,999/year",
    icon_key: "amc",
    image_url: "/service-amc.png",
    href: "/amc",
    display_order: 5,
  },
  {
    title: "Emergency Electrical Service",
    description: "Urgent electrical issues? We're just a call away.",
    price_label: "24/7 availability",
    icon_key: "emergency",
    image_url: "/service-emergency.png",
    href: "tel:+919876543210",
    display_order: 6,
  },
];

async function seedServices() {
  const { count } = await supabase.from("services").select("id", { count: "exact", head: true });
  if (count > 0) {
    console.log(`Services: ${count} already exist, skipping.`);
    return;
  }
  const { error } = await supabase.from("services").insert(SERVICES);
  if (error) console.error("Services seed failed:", error.message);
  else console.log(`Services added: ${SERVICES.length}`);
}

// -------------------------------------------------------------- Service areas
const AREAS = [
  "Model Town",
  "Civil Lines",
  "Kamla Nagar",
  "Mukherjee Nagar",
  "GTB Nagar",
  "Ashok Vihar",
  "Wazirpur",
  "Shalimar Bagh",
  "Pitampura",
  "Rohini",
  "Adarsh Nagar",
  "Sadar Bazar",
];

async function seedAreas() {
  const { count } = await supabase.from("service_areas").select("id", { count: "exact", head: true });
  if (count > 0) {
    console.log(`Service areas: ${count} already exist, skipping.`);
    return;
  }
  const rows = AREAS.map((name, i) => ({ name, display_order: i + 1 }));
  const { error } = await supabase.from("service_areas").insert(rows);
  if (error) console.error("Service areas seed failed:", error.message);
  else console.log(`Service areas added: ${AREAS.length}`);
}

await seedContact();
await seedServices();
await seedAreas();
console.log("Done.");
