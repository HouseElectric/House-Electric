"use client";

import { useRef } from "react";

export default function OtpInput({ value, onChange, length = 6, disabled = false }) {
  const digits = value.split("");
  const inputRefs = useRef([]);

  const setDigits = (next) => onChange(next.join("").slice(0, length));

  const handleChange = (index, e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const next = value.split("");
    if (!raw) {
      next[index] = "";
      setDigits(next);
      return;
    }
    // Covers both a normal single keypress and a paste/autofill landing in one box.
    const chars = raw.slice(0, length - index).split("");
    chars.forEach((c, i) => {
      next[index + i] = c;
    });
    setDigits(next);
    inputRefs.current[Math.min(index + chars.length, length - 1)]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    onChange(text);
    inputRefs.current[Math.min(text.length, length - 1)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digits[i] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="h-12 w-11 flex-none rounded-xl border border-line bg-white text-center text-[20px] font-bold text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-yellow/15 sm:h-14 sm:w-12 disabled:bg-cream disabled:text-body"
        />
      ))}
    </div>
  );
}
