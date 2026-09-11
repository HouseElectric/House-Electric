"use client";

import { useRef } from "react";

export function FormSection({ title, hint, children }) {
  return (
    <div className="card-hover group relative overflow-hidden rounded-2xl border border-line bg-white p-5">
      <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-yellow/0 via-yellow to-yellow/0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
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
  "w-full rounded-md border border-line px-3 py-2.5 text-[13.5px] text-ink outline-none transition-all focus:border-ink focus:ring-2 focus:ring-yellow/20";

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
        <div className="group/img relative max-w-[280px] overflow-hidden rounded-lg border border-line">
          <img
            src={value}
            alt=""
            className={`w-full ${aspect} bg-cream/30 object-cover transition-transform duration-300 group-hover/img:scale-105`}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover/img:opacity-100" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute right-2 top-2 rounded-md bg-black/70 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-black"
          >
            {uploading ? "Uploading…" : "Replace Photo"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`${aspect} w-full max-w-[280px] rounded-lg border-2 border-dashed border-line bg-cream/30 text-[13px] font-semibold text-body transition-all hover:border-yellow hover:bg-yellow/5 hover:text-ink disabled:opacity-60`}
        >
          {uploading ? "Uploading…" : "Click to upload photo"}
        </button>
      )}
    </Field>
  );
}
