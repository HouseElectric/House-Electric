import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const FAQS = {
  "electrical-repair": [
    { q: "How quickly can you reach me for a repair?", a: "For urgent faults we aim to dispatch a technician the same day — our team confirms an exact time slot after you book or call." },
    { q: "Do you charge for the initial inspection?", a: "We inspect the issue first and give you a clear, upfront quote before starting any paid repair work — no hidden charges." },
    { q: "What kind of electrical faults do you repair?", a: "Tripping MCBs, short circuits, sparking sockets, faulty wiring, dead points, DB panel issues and more — for homes, offices and commercial properties." },
    { q: "Is the repair work guaranteed?", a: "Yes — all repair work is backed by a workmanship guarantee. If the same issue reoccurs shortly after, we fix it again at no extra cost." },
  ],
  "electrical-installation": [
    { q: "Can you handle new wiring for a full home or office fit-out?", a: "Yes — from a single room to a complete building, we plan and install wiring, DB panels and lighting circuits to IS-code standards." },
    { q: "Do you provide a completion certificate?", a: "Yes, every installation is tested (megger insulation test, earthing verification) and signed off with a warranty certificate." },
    { q: "Can you install additional points in an existing property?", a: "Absolutely — adding new switches, sockets, lighting points or a sub-DB to an existing setup is one of our most common jobs." },
    { q: "How long does a typical installation take?", a: "It depends on scope — a few extra points can be done same-day, while a full property fit-out is scheduled and quoted after a site visit." },
  ],
  "electrical-maintenance": [
    { q: "What does a maintenance visit actually cover?", a: "A scheduled inspection of your DB panel, wiring, switches, earthing and load — flagging risks early with a written report, before they turn into breakdowns." },
    { q: "How often should electrical maintenance be done?", a: "For most homes and offices we recommend a check every 6-12 months; higher-load commercial properties often benefit from quarterly visits." },
    { q: "Is maintenance different from an AMC?", a: "A maintenance visit is a one-time scheduled check. An AMC (Annual Maintenance Contract) bundles regular visits, priority support and reporting into one yearly plan." },
    { q: "Do you provide a report after each visit?", a: "Yes — every maintenance visit ends with a clear report of what was checked, any issues found, and recommended next steps." },
  ],
  "emergency-electrical-service": [
    { q: "Is this available at night or on holidays?", a: "Yes — emergency call-outs are handled 24/7, including nights, weekends and holidays." },
    { q: "What counts as an electrical emergency?", a: "Sparking sockets or wiring, a tripped main that won't reset, a burning smell from the DB panel, total power failure, or any exposed live wiring." },
    { q: "How fast can a technician reach me?", a: "We prioritise emergency calls and dispatch the nearest available technician immediately — call or WhatsApp us and we'll confirm arrival time right away." },
    { q: "Is it safe to wait until morning for a minor issue?", a: "If there's any sparking, burning smell or exposed wiring, don't wait — isolate the circuit if you can and call us immediately. For anything else, our team can advise you on the phone." },
  ],
};

async function run() {
  for (const [slug, faqs] of Object.entries(FAQS)) {
    const { error } = await supabase.from("services").update({ faqs }).eq("slug", slug);
    if (error) console.error(`Failed for ${slug}:`, error.message);
    else console.log(`FAQs saved for ${slug} (${faqs.length} items)`);
  }

  // The Emergency service's CTA hrefs were saved before the business phone/WhatsApp
  // number was corrected to the real New Delhi number — fix them directly. (The
  // dynamic service page now also resolves tel:/wa.me hrefs live against Contact
  // Settings, so this is belt-and-suspenders for the stored value.)
  const { error: ctaError } = await supabase
    .from("services")
    .update({ primary_cta_href: "tel:+919773644275", secondary_cta_href: "https://wa.me/919773644275" })
    .eq("slug", "emergency-electrical-service");
  if (ctaError) console.error("Failed to fix Emergency CTA hrefs:", ctaError.message);
  else console.log("Emergency service CTA phone/WhatsApp hrefs corrected.");
}

await run();
