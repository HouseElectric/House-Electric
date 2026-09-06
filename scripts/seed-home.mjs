import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const HOME_CONTENT = {
  heroSlides: [
    {
      image: "/hero-electrician.png",
      alt: "House Electric technician working on a distribution board",
      eyebrow: "Professional electrical services",
      titleLine1: "Reliable Electrical",
      titleLine2: "Solutions for a",
      titleHighlight: "Safer Tomorrow",
      subtitle:
        "From quick repairs to annual maintenance, House Electric keeps your home, business and workplace powered, safe and worry-free.",
      primaryLabel: "Book Electrical Health Check",
      primaryHref: "/health-check",
      secondaryLabel: "Get a Quote",
      secondaryHref: "/contact",
    },
    {
      image: "/hero-electrician-2.png",
      alt: "House Electric technician repairing a home distribution panel",
      eyebrow: "Repair & installation experts",
      titleLine1: "Trusted Electrical Work",
      titleLine2: "Inside Your",
      titleHighlight: "Home & Business",
      subtitle:
        "Certified technicians handle your wiring, DB panels and installations with care — safe, tidy and built to last.",
      primaryLabel: "Book a Service",
      primaryHref: "/contact",
      secondaryLabel: "View Services",
      secondaryHref: "/services",
    },
    {
      image: "/hero-electrician-3.png",
      alt: "House Electric technician testing a distribution board with a multimeter",
      eyebrow: "Electrical health check",
      titleLine1: "Catch Problems",
      titleLine2: "Before They Become",
      titleHighlight: "Dangerous",
      subtitle:
        "Our detailed inspection finds hidden risks early — with a clear report and repair estimate, no surprises.",
      primaryLabel: "Book Health Check",
      primaryHref: "/health-check",
      secondaryLabel: "Get a Quote",
      secondaryHref: "/contact",
    },
  ],
  stats: [
    { icon: "users", to: 500, suffix: "+", label: "Happy Customers" },
    { icon: "check", to: 98, suffix: "%", label: "Service Satisfaction" },
    { icon: "building", to: 50, suffix: "+", label: "Commercial Clients" },
    { icon: "award", to: 5, suffix: "+", label: "Years of Experience" },
  ],
  process: {
    eyebrow: "Our process",
    title1: "A Simple Process",
    title2: "For Lasting Safety",
    subtitle:
      "We follow a clear and transparent process to ensure your electrical systems are safe, efficient and well-maintained.",
    steps: [
      { title: "Health Check", desc: "We inspect your electrical system thoroughly." },
      { title: "Inspection Report", desc: "Detailed report with findings & recommendations." },
      { title: "Repair / Replacement", desc: "We fix the issues quickly after your approval." },
      { title: "AMC & Long-term Care", desc: "Optional annual maintenance for year-round safety." },
    ],
  },
  healthCheck: {
    eyebrow: "Electrical health check",
    titlePlain: "Is Your Electrical System",
    titleHighlight: "Safe?",
    subtitle:
      "Undetected electrical faults can be dangerous. Get a professional electrical health check and ensure your property is completely safe, compliant and certified.",
    buttonLabel: "Book Electrical Health Check",
    trust: [
      { label: "Detailed Inspection" },
      { label: "Clear Report" },
      { label: "Expert Recommendation" },
    ],
  },
  whyChoose: {
    eyebrow: "Why choose house electric",
    title: "More Than Just Electrical Work",
    subtitle: "We are committed to quality, safety and long-term relationships with our customers.",
    features: [
      { title: "Experienced Team", desc: "Skilled, certified & verified electricians for all jobs." },
      { title: "Safety First", desc: "Strict safety standards and compliance best practices." },
      { title: "On-Time Service", desc: "Punctual, reliable experts who value your time." },
      { title: "Long-Term Support", desc: "From one-time repairs to annual AMC maintenance." },
    ],
    promoTitle: "Powering Safer Spaces Together",
    promoButtonLabel: "Get a Quote",
  },
  customers: {
    eyebrow: "Our customers",
    title: "Solutions for Every Space",
    subtitle: "We serve a wide range of customers with tailored electrical solutions.",
    spaces: [
      { title: "Residential", desc: "Homes, Apartments, Villas & Independent Houses" },
      { title: "Commercial", desc: "Shops, Offices, Restaurants, Clinics & Schools" },
      { title: "Corporate / Institutional", desc: "Corporate Offices, Tech Parks, Factories & Property Managers" },
    ],
  },
};

const { data: existing } = await supabase.from("site_settings").select("data").eq("key", "home").maybeSingle();
const merged = { ...HOME_CONTENT, ...(existing?.data || {}) };
// Only fill in sections that don't already exist, so previously-saved edits aren't lost.
for (const key of Object.keys(HOME_CONTENT)) {
  if (!existing?.data?.[key]) merged[key] = HOME_CONTENT[key];
}

const { error } = await supabase
  .from("site_settings")
  .upsert([{ key: "home", data: merged, updated_at: new Date().toISOString() }]);
if (error) console.error("Failed:", error.message);
else console.log(existing ? "Home content updated with new sections." : "Home content seeded.");
