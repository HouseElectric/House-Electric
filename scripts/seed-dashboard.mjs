import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { uploadLocalFile, uploadFromUrl } from "./lib/cloudinary-node.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment (.env).");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

// ---------------------------------------------------------------- Projects
const PROJECTS = [
  { file: "service-repair.png", title: "Fault Finding & Wiring Repair — Napier Town", category: "Repair" },
  { file: "hero-electrician-2.png", title: "Home Distribution Panel Repair — Adhartal", category: "Repair" },
  { file: "service-installation.png", title: "New Pendant Lighting Installation", category: "Installation" },
  { file: "healthcheck-ceiling.png", title: "Ceiling Light Fitting — Residential", category: "Installation" },
  { file: "service-maintenance.png", title: "DB Panel Preventive Maintenance", category: "Maintenance" },
  { file: "process-electrician.png", title: "Consumer Unit Servicing — Vijay Nagar", category: "Maintenance" },
  { file: "service-healthcheck.png", title: "Electrical Inspection & Report", category: "Health Check" },
  { file: "hero-electrician-3.png", title: "Post-Repair Safety Testing", category: "Health Check" },
  { file: "service-amc.png", title: "AMC Agreement Sign-Up — Commercial Client", category: "AMC" },
  { file: "customer-residential.png", title: "Residential Site Visit — Independent House", category: "Residential" },
  { file: "customer-commercial.png", title: "Office Electrical Fit-Out — Civil Lines", category: "Commercial" },
];

async function seedProjects() {
  const { count } = await supabase.from("projects").select("id", { count: "exact", head: true });
  if (count > 0) {
    console.log(`Projects: ${count} already exist, skipping.`);
    return;
  }
  for (const p of PROJECTS) {
    const image_url = await uploadLocalFile(path.join(PUBLIC_DIR, p.file), "house-electric/projects");
    const { error } = await supabase.from("projects").insert([{ title: p.title, category: p.category, image_url }]);
    if (error) console.error(`Project "${p.title}" failed:`, error.message);
    else console.log(`Project uploaded: ${p.title}`);
  }
}

// ------------------------------------------------------------ Testimonials
const TESTIMONIALS = [
  {
    name: "Rohit Sharma",
    role: "Homeowner",
    text: "Excellent service and very professional team. They identified issues we didn't even know about. Highly recommended.",
    rating: 5,
    avatarSeed: 12,
  },
  {
    name: "Priya Mehta",
    role: "Office Manager",
    text: "We have taken AMC for our office and the service has been outstanding. Prompt response and great support.",
    rating: 5,
    avatarSeed: 45,
  },
  {
    name: "Aman Verma",
    role: "Business Owner",
    text: "Quick and reliable service during an emergency. Highly professional and courteous staff.",
    rating: 5,
    avatarSeed: 33,
  },
  {
    name: "Sunita Rao",
    role: "Property Manager",
    text: "The electrical health check caught a wiring fault before it became a serious problem. Very thorough report.",
    rating: 5,
    avatarSeed: 20,
  },
  {
    name: "Vikram Nair",
    role: "Shop Owner",
    text: "Professional, punctual and transparent about pricing. Our go-to team for anything electrical now.",
    rating: 5,
    avatarSeed: 51,
  },
  {
    name: "Meera Iyer",
    role: "Facility Head",
    text: "Great experience getting our AMC set up for the factory. Peace of mind knowing they're a call away.",
    rating: 5,
    avatarSeed: 47,
  },
];

async function seedTestimonials() {
  const { count } = await supabase.from("testimonials").select("id", { count: "exact", head: true });
  if (count > 0) {
    console.log(`Testimonials: ${count} already exist, skipping.`);
    return;
  }
  for (const t of TESTIMONIALS) {
    const avatar_url = await uploadFromUrl(
      `https://i.pravatar.cc/200?img=${t.avatarSeed}`,
      "house-electric/testimonials",
      `${t.name.replace(/\s+/g, "-").toLowerCase()}.jpg`
    );
    const { error } = await supabase
      .from("testimonials")
      .insert([{ name: t.name, role: t.role, text: t.text, rating: t.rating, avatar_url, published: true }]);
    if (error) console.error(`Testimonial "${t.name}" failed:`, error.message);
    else console.log(`Testimonial added: ${t.name}`);
  }
}

// --------------------------------------------------------------- Enquiries
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const ENQUIRIES = [
  {
    type: "booking",
    name: "Ramesh Chandra",
    mobile: "+91 98261 45032",
    email: "ramesh.chandra@gmail.com",
    location: "Model Town, New Delhi",
    address: "12 Napier Town Main Road",
    service: "Electrical Repair",
    message: "MCB in the kitchen keeps tripping when the microwave is on. Need someone to check today or tomorrow.",
    preferred_date: "2026-09-08",
    preferred_time: "11:00",
    status: "new",
    read: false,
    created_at: daysAgo(0),
  },
  {
    type: "amc",
    name: "Anjali Deshmukh",
    company: "Deshmukh Residency",
    mobile: "+91 90391 22876",
    email: "anjali.d@outlook.com",
    property_type: "Residential",
    location: "Kamla Nagar, New Delhi",
    area: "2400 sq ft",
    system_details: "3BHK independent house, DB installed ~8 years ago, no earthing check done since construction.",
    preferred_date: "2026-09-10",
    message: "Interested in an annual plan after your team did our health check last month.",
    status: "in_progress",
    read: true,
    created_at: daysAgo(1),
  },
  {
    type: "corporate",
    company: "Shivalik Textiles Pvt. Ltd.",
    contact_person: "Vinod Agarwal",
    mobile: "+91 97539 60214",
    email: "vinod@shivaliktextiles.in",
    location: "Wazirpur Industrial Area, New Delhi",
    property_type: "Factory / Warehouse",
    area: "18,000 sq ft",
    contact_time: "Morning",
    requirement: "Looking for a preventive maintenance contract covering our main production floor DB panels and factory lighting circuits.",
    status: "new",
    read: false,
    created_at: daysAgo(1),
  },
  {
    type: "booking",
    name: "Fatima Sheikh",
    mobile: "+91 94253 78190",
    email: "fatima.sheikh92@gmail.com",
    location: "Mukherjee Nagar, New Delhi",
    address: "Flat 4B, Sunrise Apartments",
    service: "Electrical Health Check",
    message: "New tenant, want a full check before moving furniture in.",
    preferred_date: "2026-09-09",
    preferred_time: "16:00",
    status: "closed",
    read: true,
    created_at: daysAgo(3),
  },
  {
    type: "booking",
    name: "Deepak Malviya",
    mobile: "+91 88171 04563",
    email: "",
    location: "GTB Nagar, New Delhi",
    address: "",
    service: "Emergency Service",
    message: "Sparking sound from the meter box, need someone urgently.",
    preferred_date: "",
    preferred_time: "",
    status: "closed",
    read: true,
    created_at: daysAgo(4),
  },
  {
    type: "amc",
    name: "Sanjay Kulkarni",
    company: "Kulkarni Diagnostic Centre",
    mobile: "+91 96305 87421",
    email: "sanjay.kulkarni@kdcdelhi.in",
    property_type: "Commercial",
    location: "Civil Lines, New Delhi",
    area: "3200 sq ft",
    system_details: "Diagnostic centre running sensitive lab equipment, need stable power and regular load checks.",
    preferred_date: "2026-09-12",
    message: "Equipment downtime is costly for us — want priority response built into the contract.",
    status: "in_progress",
    read: true,
    created_at: daysAgo(5),
  },
  {
    type: "corporate",
    company: "Prime Facility Management Services",
    contact_person: "Ritu Chawla",
    mobile: "+91 99931 20456",
    email: "ritu.chawla@primefms.com",
    location: "Multiple sites, New Delhi",
    property_type: "Office",
    area: "Approx. 6 properties, 2000-5000 sq ft each",
    contact_time: "Afternoon",
    requirement: "We manage facilities for several corporate clients and are looking for a single electrical maintenance vendor across all sites.",
    status: "new",
    read: false,
    created_at: daysAgo(6),
  },
  {
    type: "booking",
    name: "Neha Tiwari",
    mobile: "+91 92345 61789",
    email: "neha.tiwari@gmail.com",
    location: "Ashok Vihar, New Delhi",
    address: "9 Riverside Colony",
    service: "Electrical Installation",
    message: "Want to install 2 new ceiling fans and shift a few switch points during our renovation.",
    preferred_date: "2026-09-14",
    preferred_time: "10:30",
    status: "new",
    read: false,
    created_at: daysAgo(0),
  },
];

async function seedEnquiries() {
  const { count } = await supabase.from("enquiries").select("id", { count: "exact", head: true });
  if (count > 0) {
    console.log(`Enquiries: ${count} already exist, skipping.`);
    return;
  }
  const { error } = await supabase.from("enquiries").insert(ENQUIRIES);
  if (error) console.error("Enquiries seed failed:", error.message);
  else console.log(`Enquiries added: ${ENQUIRIES.length}`);
}

await seedProjects();
await seedTestimonials();
await seedEnquiries();
console.log("Done.");
