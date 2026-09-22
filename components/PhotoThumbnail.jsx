"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { EyeIcon, XIcon } from "@/components/icons";

/**
 * A small clickable photo thumbnail that opens a full-size view in a portal-rendered
 * lightbox on click — used for health-report inspection photos (admin + customer).
 * Portaled to <body> so it isn't clipped by the (site) page-transition wrapper's transform.
 */
export default function PhotoThumbnail({ src, alt, className = "h-16 w-24 rounded-lg border border-line object-cover" }) {
  const [open, setOpen] = useState(false);
  if (!src) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex-none overflow-hidden rounded-lg"
        aria-label="View full-size photo"
      >
        <img src={src} alt={alt || "Inspection photo"} className={className} />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
          <EyeIcon className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
            >
              <XIcon className="h-5 w-5" />
            </button>
            <img
              src={src}
              alt={alt || "Inspection photo"}
              className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </>
  );
}
