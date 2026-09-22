// Shared status vocabulary for the per-service AMC coverage matrix (amc_plans.coverage_items).
// `coverage` (included names) and `exclusions` (chargeable/quote_required names) on amc_plans are
// legacy flat lists still read by certificates, snapshots and emails — derive() keeps them in sync.

export const COVERAGE_STATUSES = [
  { value: "included", label: "Included", short: "Included", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "excluded", label: "Not in this plan", short: "Excluded", cls: "bg-gray-100 text-gray-500 border-gray-200" },
  { value: "chargeable", label: "Chargeable separately", short: "Chargeable", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "quote_required", label: "Requires quotation", short: "Quote Required", cls: "bg-blue-50 text-blue-700 border-blue-200" },
];

export function statusMeta(status) {
  return COVERAGE_STATUSES.find((s) => s.value === status) || COVERAGE_STATUSES[0];
}

// Falls back to deriving items from the legacy coverage[]/exclusions[] arrays for plans the admin
// hasn't re-saved through the new matrix editor yet, so the public site never regresses.
export function getCoverageItems(plan) {
  if (Array.isArray(plan?.coverage_items) && plan.coverage_items.length > 0) return plan.coverage_items;
  const included = (Array.isArray(plan?.coverage) ? plan.coverage : []).map((name) => ({ name, status: "included" }));
  const chargeable = (Array.isArray(plan?.exclusions) ? plan.exclusions : []).map((name) => ({ name, status: "chargeable" }));
  return [...included, ...chargeable];
}

export function deriveLegacyLists(items) {
  const coverage = items.filter((i) => i.status === "included").map((i) => i.name);
  const exclusions = items.filter((i) => i.status === "chargeable" || i.status === "quote_required").map((i) => i.name);
  return { coverage, exclusions };
}
