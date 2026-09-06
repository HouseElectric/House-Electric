"use client";

import { useRef } from "react";

export function FormSection({ title, hint, children }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <h4 className="text-[13.5px] font-extrabold text-ink">{title}</h4>
      {hint && <p className="mt-0.5 text-[12px] text-body">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-semibold text-body">{label}</label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-ink";

export function ImageUploadField({ label = "Photo", value, uploading, onUpload, aspect = "aspect-[16/9]" }) {
  const fileInputRef = useRef(null);

  return (
    <Field label={label}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onUpload(e.target.files[0])}
      />
      {value ? (
        <div className="relative max-w-[280px]">
          <img src={value} alt="" className={`w-full ${aspect} rounded-lg border border-line bg-cream/30 object-cover`} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute right-2 top-2 rounded-md bg-black/70 px-2.5 py-1.5 text-[11px] font-bold text-white"
          >
            {uploading ? "Uploading…" : "Replace Photo"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`${aspect} w-full max-w-[280px] rounded-lg border-2 border-dashed border-line bg-cream/30 text-[13px] font-semibold text-body transition-colors hover:border-ink/30`}
        >
          {uploading ? "Uploading…" : "Click to upload photo"}
        </button>
      )}
    </Field>
  );
}
