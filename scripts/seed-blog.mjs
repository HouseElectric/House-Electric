import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment (.env).");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const now = new Date().toISOString();

const POSTS = [
  {
    slug: "warning-signs-wiring-needs-attention",
    title: "5 Warning Signs Your Wiring Needs Attention",
    category: "Electrical Safety",
    tags: ["safety", "wiring", "inspection"],
    excerpt:
      "Flickering lights, warm switch plates, a burning smell near sockets — none of these are 'normal'. Here's what each one actually means.",
    content: `
      <p>Most serious electrical faults don't happen out of nowhere — they give warning signs first. The problem is that many homeowners and shop owners write these signs off as minor annoyances instead of getting them checked. Here are five signs we see most often during health checks, and what they usually mean.</p>
      <h2>1. Flickering or dimming lights</h2>
      <p>Occasional flickering during a storm is one thing. Lights that flicker regularly, especially when an appliance switches on, often point to a loose connection somewhere in the circuit or an overloaded line.</p>
      <h2>2. Warm switch plates or plug points</h2>
      <p>A switch or socket should never feel warm to the touch. Warmth usually means a loose connection is causing resistance and heat build-up — a common precursor to a burnt socket or a fire risk.</p>
      <h2>3. A burning smell near outlets</h2>
      <p>This one should never be ignored. Turn off the circuit at the DB and get it inspected the same day if possible.</p>
      <h2>4. MCBs that trip often</h2>
      <p>An MCB tripping once in a while under heavy load is normal. Frequent, unexplained trips — especially on a single circuit — usually mean a fault in the wiring or a connected appliance.</p>
      <h2>5. Discoloured plug points</h2>
      <p>Yellowing or browning around a socket is a visible sign of past overheating, even if the socket seems to work fine today.</p>
      <p>If any of these sound familiar, it's worth booking an <a href="/health-check">Electrical Health Check</a> rather than waiting for something to fail outright.</p>
    `,
    author: "House Electric Team",
    status: "published",
    published_at: now,
  },
  {
    slug: "why-mcb-keeps-tripping",
    title: "Why Your MCB Keeps Tripping (And When to Worry)",
    category: "Maintenance Tips",
    tags: ["mcb", "troubleshooting"],
    excerpt:
      "An MCB tripping occasionally is normal. Frequent, unexplained trips usually mean something else is going on — here's how to tell the difference.",
    content: `
      <p>An MCB (Miniature Circuit Breaker) exists to protect your circuit — tripping is it doing its job, not a malfunction. But how often is too often?</p>
      <h2>When it's probably fine</h2>
      <p>If your MCB trips because you ran the microwave, iron and kettle on the same circuit at once, that's expected behaviour — the circuit was overloaded and the breaker protected it.</p>
      <h2>When it's worth investigating</h2>
      <ul>
        <li>The same MCB trips several times a week without an obvious cause</li>
        <li>It trips the moment you switch on one specific appliance</li>
        <li>It trips even with very little load connected</li>
        <li>You've started resetting it as a habit instead of finding the cause</li>
      </ul>
      <p>Repeatedly resetting a tripping MCB without finding the cause is one of the more common (and avoidable) risks we see. A short circuit-troubleshooting visit is usually quick and inexpensive compared to what an ignored fault can lead to.</p>
    `,
    author: "House Electric Team",
    status: "published",
    published_at: now,
  },
  {
    slug: "what-is-earthing-why-it-matters",
    title: "What Is Earthing, and Why Does It Matter?",
    category: "Electrical Safety",
    tags: ["earthing", "basics", "safety"],
    excerpt:
      "Poor or missing earthing is one of the most common issues we find during health checks — and one of the easiest to fix once identified.",
    content: `
      <p>Earthing gives electricity a safe, low-resistance path to the ground if something goes wrong inside an appliance or the wiring — instead of that fault current passing through a person who touches it.</p>
      <h2>What poor earthing looks like in practice</h2>
      <p>You won't usually see it directly — that's what makes it dangerous. Signs that prompt us to check earthing include a mild tingling sensation from metal appliance bodies, older properties that have never had their earthing tested, and DBs without a visible earth connection at all.</p>
      <h2>Why it's often overlooked</h2>
      <p>Earthing doesn't affect whether your lights turn on or your appliances run, so it's invisible day-to-day — until there's a fault, at which point it's the single biggest factor in whether that fault is a minor trip or a serious shock.</p>
      <p>Checking earthing continuity and connection quality is a standard part of our <a href="/health-check">Electrical Health Check</a>, and it's usually a straightforward fix once identified.</p>
    `,
    author: "House Electric Team",
    status: "published",
    published_at: now,
  },
  {
    slug: "how-often-electrical-health-check",
    title: "How Often Should You Get an Electrical Health Check?",
    category: "Maintenance Tips",
    tags: ["health check", "maintenance"],
    excerpt:
      "For most homes, once every 1-2 years is a reasonable baseline. Here's how to judge if you need one sooner.",
    content: `
      <p>There's no single answer that fits every property, but a few simple guidelines help.</p>
      <h2>Residential properties</h2>
      <p>For a home under 10 years old with no known issues, a health check every 1-2 years is a reasonable baseline. Older properties, or ones that have had informal wiring work done in the past, benefit from more frequent checks.</p>
      <h2>Commercial & corporate properties</h2>
      <p>Shops, offices and factories typically run heavier and more continuous electrical loads than a home. Combined with higher footfall and equipment turnover, this is exactly why these properties are usually better served by an <a href="/amc">Annual Maintenance Contract</a> rather than one-off checks — the inspection schedule is built in rather than something you have to remember to book.</p>
      <h2>Signs that mean "now", not "sometime this year"</h2>
      <p>Any of the warning signs covered in our <a href="/blog/warning-signs-wiring-needs-attention">wiring warning signs</a> post, a recent renovation that touched electrical layout, or simply never having had the system checked since it was installed.</p>
    `,
    author: "House Electric Team",
    status: "published",
    published_at: now,
  },
  {
    slug: "amc-vs-one-off-repairs",
    title: "AMC vs One-Off Repairs: What Actually Saves You Money",
    category: "AMC",
    tags: ["amc", "cost", "maintenance"],
    excerpt:
      "A one-off repair fixes what's broken today. An AMC catches small issues on a schedule, before they become expensive breakdowns.",
    content: `
      <p>It's a fair question — why pay for an annual contract when you could just call for a repair whenever something breaks?</p>
      <h2>What a one-off repair actually covers</h2>
      <p>A repair visit fixes the specific fault you called about. It doesn't include a look at the rest of your system, and there's no priority queue if something else comes up later that week.</p>
      <h2>What an AMC adds on top</h2>
      <ul>
        <li>Scheduled inspections that catch small issues before they become breakdowns</li>
        <li>Priority response if something does go wrong</li>
        <li>One predictable annual cost instead of unplanned repair bills</li>
        <li>A running record of your property's electrical condition over time</li>
      </ul>
      <h2>Where the real savings show up</h2>
      <p>The saving isn't usually in any single visit — it's in the breakdowns that never happen because a loose connection or an overloading circuit was caught during a scheduled check instead of after it failed. For businesses especially, unplanned downtime is almost always more expensive than the maintenance that would have prevented it.</p>
    `,
    author: "House Electric Team",
    status: "published",
    published_at: now,
  },
  {
    slug: "electrical-safety-basics-shops-offices",
    title: "Electrical Safety Basics for Small Shops & Offices",
    category: "Electrical Safety",
    tags: ["commercial", "safety", "shops"],
    excerpt:
      "Simple habits — like not overloading a socket with extension boards — prevent most of the electrical issues we see in commercial spaces.",
    content: `
      <p>Most of the electrical problems we get called out for in shops and small offices trace back to a handful of avoidable habits. None of these require an electrician to fix — just awareness.</p>
      <h2>Don't stack extension boards</h2>
      <p>Plugging an extension board into another extension board to power multiple devices from one socket is one of the most common causes of overheating we see. Each socket and circuit has a load limit for a reason.</p>
      <h2>Keep DB panels accessible</h2>
      <p>We regularly find distribution boards blocked by furniture, stock or storage. In an emergency, seconds matter — keep at least a clear approach to the panel at all times.</p>
      <h2>Label circuits clearly</h2>
      <p>An unlabelled DB means guesswork during a fault — which circuit feeds which area. A simple, updated label inside the panel door saves real time when something needs to be switched off quickly.</p>
      <h2>Re-inspect after layout changes</h2>
      <p>Moving heavy equipment, adding a new appliance, or changing the floor layout can change the load distribution across your circuits. It's worth a quick check after any significant change rather than assuming the existing wiring will simply cope.</p>
      <p>If it's been a while since your space was looked at, a <a href="/health-check">health check</a> or a <a href="/corporate">corporate maintenance plan</a> is a straightforward way to get ahead of these.</p>
    `,
    author: "House Electric Team",
    status: "published",
    published_at: now,
  },
];

let created = 0;
let updated = 0;

for (const post of POSTS) {
  const { data: existing } = await supabase.from("blog_posts").select("id").eq("slug", post.slug).maybeSingle();

  if (existing) {
    const { error } = await supabase.from("blog_posts").update({ ...post, updated_at: now }).eq("id", existing.id);
    if (error) console.error(`Failed to update "${post.slug}":`, error.message);
    else updated++;
  } else {
    const { error } = await supabase.from("blog_posts").insert([{ ...post, updated_at: now }]);
    if (error) console.error(`Failed to insert "${post.slug}":`, error.message);
    else created++;
  }
}

console.log(`Done. Created ${created}, updated ${updated} blog post(s).`);
