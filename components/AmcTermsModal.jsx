"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "@/components/icons";
import AmcTermsContent from "@/components/AmcTermsContent";

export default function AmcTermsModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[190] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 z-[200] max-h-[85vh] -translate-y-1/2 overflow-hidden rounded-3xl border border-line/80 bg-white shadow-2xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-2xl sm:-translate-x-1/2">
        <div className="max-h-[85vh] overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line/70 bg-white/95 p-5 backdrop-blur-sm">
            <p className="text-[16px] font-extrabold text-ink">AMC Terms &amp; Conditions</p>
            <button
              onClick={onClose}
              aria-label="Close"
              className="grid h-8 w-8 flex-none place-items-center rounded-full text-body/60 transition-colors hover:bg-cream hover:text-ink"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="prose-content p-5 sm:p-7">
            <AmcTermsContent />
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
