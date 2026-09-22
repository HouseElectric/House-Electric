import { CheckCircle } from "@/components/icons";

export default function CoverageStatusIcon({ status }) {
  if (status === "included")
    return (
      <span title="Included" className="grid h-6 w-6 flex-none place-items-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle className="h-3.5 w-3.5" />
      </span>
    );
  if (status === "chargeable")
    return (
      <span
        title="Chargeable separately"
        className="grid h-6 w-6 flex-none place-items-center rounded-full bg-amber-50 text-[11px] font-extrabold text-amber-600"
      >
        ₹
      </span>
    );
  if (status === "quote_required")
    return (
      <span
        title="Requires quotation"
        className="grid h-6 w-6 flex-none place-items-center rounded-full bg-blue-50 text-[13px] font-extrabold text-blue-600"
      >
        ?
      </span>
    );
  return (
    <span title="Not in this plan" className="grid h-6 w-6 flex-none place-items-center rounded-full bg-line/50">
      <span className="block h-[2px] w-2.5 rounded-full bg-body/40" />
    </span>
  );
}
