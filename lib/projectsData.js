import { supabase } from "@/lib/supabase";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeProject(dbItem) {
  const id = String(dbItem.id);
  const title = dbItem.title || "Untitled Project";
  const slug = slugify(title) || id;
  const category = dbItem.category?.trim() || "General";

  // Normalize images array from JSONB or fallback
  let rawImages = [];
  if (Array.isArray(dbItem.images)) {
    rawImages = dbItem.images;
  } else if (typeof dbItem.images === "string") {
    try {
      rawImages = JSON.parse(dbItem.images);
    } catch {
      rawImages = [];
    }
  }

  const images = [];
  const seenUrls = new Set();

  for (const img of rawImages) {
    if (!img) continue;
    const url = typeof img === "string" ? img : img.url;
    if (url && !seenUrls.has(url)) {
      seenUrls.add(url);
      images.push({
        url,
        caption: (typeof img === "object" && img.caption) || title,
      });
    }
  }

  // Cover image: either explicitly saved image_url or first image in album
  let cover_image = dbItem.image_url;
  if (!cover_image && images.length > 0) {
    cover_image = images[0].url;
  }

  // Ensure cover image is in images list if not already
  if (cover_image && !seenUrls.has(cover_image)) {
    images.unshift({ url: cover_image, caption: `${title} — Cover Photo` });
  }

  return {
    id,
    slug,
    title,
    category,
    status: dbItem.status || "Completed",
    location: dbItem.location || "",
    client_type: dbItem.client_type || (category === "Commercial" ? "Commercial Facility" : "Residential Client"),
    completed_date: dbItem.created_at
      ? new Date(dbItem.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
      : "Recent",
    cover_image: cover_image || (images[0]?.url ?? ""),
    images,
    description:
      dbItem.description ||
      `Comprehensive electrical work executed for ${title} under certified safety standards.`,
    highlights: dbItem.highlights || [
      "Load distribution & phase balancing completed",
      "Shock-safe RCCB protection on all outgoing circuits",
      "Full post-installation continuity & insulation tested",
      "Backed by House Electric's verified workmanship warranty",
    ],
  };
}

export async function getAllProjects() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((item) => normalizeProject(item));
  } catch (err) {
    console.error("Error fetching projects:", err);
    return [];
  }
}

export async function getProjectByIdOrSlug(identifier) {
  const all = await getAllProjects();
  if (!all || all.length === 0) return null;

  const cleanId = String(identifier || "").toLowerCase();
  return (
    all.find(
      (p) =>
        String(p.id).toLowerCase() === cleanId ||
        p.slug === cleanId ||
        p.slug.endsWith(cleanId) ||
        cleanId.endsWith(p.slug)
    ) || null
  );
}

export async function getProjectCategories() {
  const all = await getAllProjects();
  const cats = new Set(all.map((p) => p.category).filter(Boolean));
  return ["All", ...Array.from(cats)];
}

// One card per distinct category used across projects, each with a cover photo — an admin-picked
// one from `project_categories` if set, otherwise the most recently added project's cover in that
// category, so a category never shows up broken just because no one has picked its cover yet.
export async function getProjectCategoryCards() {
  const all = await getAllProjects();
  if (all.length === 0) return [];

  const byCategory = new Map();
  for (const p of all) {
    const key = p.category.toLowerCase();
    if (!byCategory.has(key)) {
      byCategory.set(key, { name: p.category, slug: slugify(p.category), count: 0, fallback_cover: p.cover_image });
    }
    byCategory.get(key).count += 1;
  }

  let overrides = [];
  if (supabase) {
    const { data } = await supabase.from("project_categories").select("*");
    overrides = data ?? [];
  }
  const overrideByName = new Map(overrides.map((c) => [c.name.toLowerCase(), c]));

  const cards = Array.from(byCategory.values()).map((c) => {
    const override = overrideByName.get(c.name.toLowerCase());
    return {
      name: c.name,
      slug: c.slug,
      count: c.count,
      cover_image: override?.cover_image_url || c.fallback_cover || "",
      display_order: override?.display_order ?? 999,
    };
  });

  cards.sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name));
  return cards;
}

export async function getProjectsByCategorySlug(categorySlug) {
  const all = await getAllProjects();
  return all.filter((p) => slugify(p.category) === categorySlug);
}
