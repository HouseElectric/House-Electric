export const STATUS_META = {
  requested: { label: "Requested", cls: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500", iconCls: "bg-blue-50 text-blue-600" },
  assigned: { label: "Assigned", cls: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500", iconCls: "bg-purple-50 text-purple-600" },
  scheduled: { label: "Scheduled", cls: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500", iconCls: "bg-indigo-50 text-indigo-600" },
  in_progress: { label: "In Progress", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", iconCls: "bg-amber-50 text-amber-600" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", iconCls: "bg-emerald-50 text-emerald-600" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", iconCls: "bg-red-50 text-red-600" },
};

export const STEPS = [
  { id: "requested", label: "Requested" },
  { id: "assigned", label: "Assigned" },
  { id: "scheduled", label: "Scheduled" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
];
