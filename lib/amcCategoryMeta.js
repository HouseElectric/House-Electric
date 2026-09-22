import { AmcBadge, BuildingIcon, HomeIcon } from "@/components/icons";

export const CATEGORY_META = {
  residential: { icon: HomeIcon, tint: "bg-blue-50 text-blue-700", accent: "from-blue-500 to-indigo-600" },
  office: { icon: BuildingIcon, tint: "bg-violet-50 text-violet-700", accent: "from-violet-500 to-purple-600" },
  commercial: { icon: BuildingIcon, tint: "bg-amber-50 text-amber-700", accent: "from-amber-500 to-orange-600" },
  corporate: { icon: BuildingIcon, tint: "bg-emerald-50 text-emerald-700", accent: "from-emerald-600 to-teal-700" },
};

export const DEFAULT_CATEGORY_META = { icon: AmcBadge, tint: "bg-yellow/10 text-yellow-dark", accent: "from-yellow to-yellow-dark" };

// Matches a free-text section title (e.g. "Office AMC", "Corporate / Institutional AMC") to a
// CATEGORY_META key, for sections that aren't already tagged with a category field.
export function matchCategoryMeta(title) {
  const t = (title || "").toLowerCase();
  const key = Object.keys(CATEGORY_META).find((k) => t.includes(k)) || (t.includes("institutional") ? "corporate" : null);
  return CATEGORY_META[key] || DEFAULT_CATEGORY_META;
}
