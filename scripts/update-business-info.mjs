import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

// ---------------------------------------------------------------- contact
const CONTACT = {
  phone: "+91 97736 44275",
  whatsapp: "919773644275",
  email: "office.houseelectric@gmail.com",
  address: "Kh No. 307/202, 1st Floor, Plot No. 174, Street Number 4, Block-B, New Delhi, North Delhi, Delhi 110042",
  city: "New Delhi",
  state: "Delhi",
};

async function updateContact() {
  const { data: existing } = await supabase.from("site_settings").select("data").eq("key", "contact").maybeSingle();
  const merged = { ...(existing?.data || {}), ...CONTACT };
  const { error } = await supabase
    .from("site_settings")
    .upsert([{ key: "contact", data: merged, updated_at: new Date().toISOString() }]);
  if (error) console.error("Contact settings failed:", error.message);
  else console.log("Contact settings updated to New Delhi business info.");
}

// ------------------------------------------------------------ service areas
const NEW_AREAS = [
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

async function updateServiceAreas() {
  const { error: delError } = await supabase.from("service_areas").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delError) {
    console.error("Failed to clear old service areas:", delError.message);
    return;
  }
  const rows = NEW_AREAS.map((name, i) => ({ name, display_order: i + 1 }));
  const { error } = await supabase.from("service_areas").insert(rows);
  if (error) console.error("Service areas failed:", error.message);
  else console.log(`Service areas replaced with ${rows.length} New Delhi localities.`);
}

// ------------------------------------------------------- sample enquiries
const ENQUIRY_FIXES = [
  { match: { name: "Ramesh Chandra" }, set: { location: "Model Town, New Delhi", address: "12 Model Town Main Road" } },
  { match: { name: "Anjali Deshmukh" }, set: { location: "Kamla Nagar, New Delhi" } },
  { match: { company: "Shivalik Textiles Pvt. Ltd." }, set: { location: "Wazirpur Industrial Area, New Delhi", email: "vinod@shivaliktextiles.in" } },
  { match: { name: "Fatima Sheikh" }, set: { location: "Mukherjee Nagar, New Delhi" } },
  { match: { name: "Deepak Malviya" }, set: { location: "GTB Nagar, New Delhi" } },
  { match: { name: "Sanjay Kulkarni" }, set: { location: "Civil Lines, New Delhi", email: "sanjay.kulkarni@kdcdelhi.in" } },
  { match: { company: "Prime Facility Management Services" }, set: { location: "Multiple sites, New Delhi" } },
  { match: { name: "Neha Tiwari" }, set: { location: "Ashok Vihar, New Delhi", address: "9 Ashok Vihar Colony" } },
];

async function updateEnquiries() {
  let updated = 0;
  for (const fix of ENQUIRY_FIXES) {
    const [[key, value]] = Object.entries(fix.match);
    const { data, error } = await supabase.from("enquiries").update(fix.set).eq(key, value).select("id");
    if (error) {
      console.error(`Enquiry fix failed for ${value}:`, error.message);
      continue;
    }
    updated += data?.length || 0;
  }
  console.log(`Sample enquiries updated: ${updated} row(s).`);
}

await updateContact();
await updateServiceAreas();
await updateEnquiries();
