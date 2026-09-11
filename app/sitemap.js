import { supabase } from "@/lib/supabase";

const SITE_URL = "https://houseelectric.in";

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-");

const STATIC_PATHS = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/services", priority: 0.9, changeFrequency: "weekly" },
  { path: "/amc/plans", priority: 0.9, changeFrequency: "weekly" },
  { path: "/corporate", priority: 0.7, changeFrequency: "monthly" },
  { path: "/projects", priority: 0.6, changeFrequency: "weekly" },
  { path: "/reviews", priority: 0.6, changeFrequency: "weekly" },
  { path: "/service-areas", priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms-and-conditions", priority: 0.2, changeFrequency: "yearly" },
  { path: "/refund-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/disclaimer", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap() {
  const entries = STATIC_PATHS.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  if (supabase) {
    const [{ data: posts }, { data: services }, { data: areas }] = await Promise.all([
      supabase.from("blog_posts").select("slug, updated_at, created_at").eq("status", "published"),
      supabase.from("services").select("slug, href, updated_at").eq("active", true),
      supabase.from("service_areas").select("name"),
    ]);

    (posts ?? []).forEach((p) => {
      entries.push({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: new Date(p.updated_at || p.created_at),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    });

    (services ?? []).forEach((s) => {
      const path = s.href || `/services/${s.slug}`;
      if (path.startsWith("/") && !entries.some((e) => e.url === `${SITE_URL}${path}`)) {
        entries.push({
          url: `${SITE_URL}${path}`,
          lastModified: new Date(s.updated_at || Date.now()),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    });

    (areas ?? []).forEach((a) => {
      entries.push({
        url: `${SITE_URL}/electrician-in/${slugify(a.name)}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      });
    });
  }

  return entries;
}
