"use client";

export default function TermsCheckbox({ checked, onChange, className = "" }) {
  return (
    <label className={`mb-2.5 flex items-start gap-2.5 text-[12px] leading-relaxed text-ink-soft ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 flex-none rounded border-line accent-yellow"
      />
      <span>
        I have read and agree to the{" "}
        <a href="/terms-and-conditions#amc" className="font-bold text-ink underline underline-offset-2 hover:text-yellow-dark">
          AMC Terms &amp; Conditions
        </a>
        .
      </span>
    </label>
  );
}
