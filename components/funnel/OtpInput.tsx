"use client";

import { useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";
import { cn } from "@/lib/utils/cn";

const OTP_LENGTH = 4;

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, disabled }: Props) {
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function focus(idx: number) { refs.current[idx]?.focus(); }

  function handleChange(idx: number, e: ChangeEvent<HTMLInputElement>) {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, i) => (i === idx ? char : d));
    onChange(next.join(""));
    if (char && idx < OTP_LENGTH - 1) focus(idx + 1);
  }

  function handleKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        onChange(digits.map((d, i) => (i === idx ? "" : d)).join(""));
      } else if (idx > 0) {
        focus(idx - 1);
        onChange(digits.map((d, i) => (i === idx - 1 ? "" : d)).join(""));
      }
    } else if (e.key === "ArrowLeft" && idx > 0) focus(idx - 1);
    else if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) focus(idx + 1);
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    onChange(pasted.padEnd(OTP_LENGTH, "").slice(0, OTP_LENGTH));
    focus(Math.min(pasted.length, OTP_LENGTH - 1));
  }

  return (
    <div className="flex gap-3 justify-center" role="group" aria-label="One-time password">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => { refs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={idx === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${idx + 1} of ${OTP_LENGTH}`}
          className={cn(
            "w-14 h-16 rounded-[var(--tm-r-lg)] border-2 text-center text-2xl font-bold text-[var(--tm-ink-900)] bg-white transition-all",
            "focus:outline-none focus:border-[var(--tm-green-500)] focus:shadow-[0_0_0_3px_rgba(43,182,115,0.12)]",
            digit ? "border-[var(--tm-green-500)]" : "border-[var(--tm-ink-300)]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      ))}
    </div>
  );
}
