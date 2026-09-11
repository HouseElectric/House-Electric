"use client";

import { useEffect, useRef, useState } from "react";

const DOC_WIDTH = 794;

/**
 * Scales the fixed-width (794px, A4-at-96dpi) DocumentTemplate down to fit narrow
 * viewports so quotations/invoices are readable on mobile without horizontal
 * scrolling. The scale is undone for print — window.print() always renders the
 * document at its native size so the A4 page math in globals.css stays correct.
 */
export default function ResponsiveDocumentWrapper({ children }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState(null);

  useEffect(() => {
    const measure = () => {
      if (!outerRef.current || !innerRef.current) return;
      const containerWidth = outerRef.current.clientWidth;
      const nextScale = Math.min(1, containerWidth / DOC_WIDTH);
      setScale(nextScale);
      setScaledHeight(innerRef.current.scrollHeight * nextScale);
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (outerRef.current) ro.observe(outerRef.current);
    if (innerRef.current) ro.observe(innerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div
      ref={outerRef}
      className="w-full print:!h-auto"
      style={{ height: scaledHeight ? `${scaledHeight}px` : undefined }}
    >
      <div
        ref={innerRef}
        className="print:!static print:!transform-none"
        style={{ width: `${DOC_WIDTH}px`, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
    </div>
  );
}
