export const STATUS_META = {
  requested: { label: "Requested", cls: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500", iconCls: "bg-blue-50 text-blue-600", gradient: "from-blue-600 to-indigo-700" },
  under_review: { label: "Under Review", cls: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-500", iconCls: "bg-slate-100 text-slate-600", gradient: "from-slate-600 to-slate-800" },
  assigned: { label: "Technician Assigned", cls: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500", iconCls: "bg-purple-50 text-purple-600", gradient: "from-purple-600 to-violet-700" },
  scheduled: { label: "Technician Scheduled", cls: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500", iconCls: "bg-indigo-50 text-indigo-600", gradient: "from-indigo-600 to-blue-700" },
  on_the_way: { label: "Technician On The Way", cls: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500", iconCls: "bg-cyan-50 text-cyan-600", gradient: "from-cyan-600 to-blue-600" },
  in_progress: { label: "Service In Progress", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", iconCls: "bg-amber-50 text-amber-600", gradient: "from-amber-500 to-orange-600" },
  material_required: { label: "Material Required", cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", iconCls: "bg-orange-50 text-orange-600", gradient: "from-orange-600 to-red-600" },
  customer_approval_pending: { label: "Awaiting Your Approval", cls: "bg-pink-50 text-pink-700 border-pink-200", dot: "bg-pink-500", iconCls: "bg-pink-50 text-pink-600", gradient: "from-pink-600 to-rose-700" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", iconCls: "bg-emerald-50 text-emerald-600", gradient: "from-emerald-600 to-teal-700" },
  confirmed: { label: "Confirmed", cls: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500", iconCls: "bg-teal-50 text-teal-600", gradient: "from-teal-600 to-emerald-700" },
  closed: { label: "Closed", cls: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400", iconCls: "bg-slate-100 text-slate-500", gradient: "from-slate-700 to-slate-900" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", iconCls: "bg-red-50 text-red-600", gradient: "from-red-600 to-rose-700" },
};

export const STATUS_OPTIONS = Object.keys(STATUS_META);

// The always-visible linear progress line. "material_required" and "customer_approval_pending"
// are conditional branches off "in_progress" (not every request goes through them), so they're
// shown as a callout banner instead of a step — see STEP_ALIAS.
export const STEPS = [
  { id: "requested", label: "Requested" },
  { id: "under_review", label: "Under Review" },
  { id: "assigned", label: "Assigned" },
  { id: "scheduled", label: "Scheduled" },
  { id: "on_the_way", label: "On The Way" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "confirmed", label: "Confirmed" },
  { id: "closed", label: "Closed" },
];

export const STEP_ALIAS = {
  material_required: "in_progress",
  customer_approval_pending: "in_progress",
};

export function stepIndexFor(status) {
  if (status === "cancelled") return -1;
  return STEPS.findIndex((s) => s.id === (STEP_ALIAS[status] || status));
}

// Maps each STEPS id to the earliest time the request reached it, from a
// service_request_status_history rows array (ascending by changed_at).
export function stepTimestamps(history) {
  const map = {};
  for (const row of history ?? []) {
    const stepId = STEP_ALIAS[row.status] || row.status;
    if (!(stepId in map)) map[stepId] = row.changed_at;
  }
  return map;
}
