"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
  id?: string;
}

export function Slider({ min, max, step = 1, value, onChange, label, className, id }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--tm-ink-700)]">
          {label}
        </label>
      )}
      <div className="relative h-6 flex items-center select-none">
        {/* Track background */}
        <div className="absolute w-full h-2 rounded-full bg-[var(--tm-ink-100)]">
          {/* Filled portion */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-[var(--tm-green-500)]"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Visual thumb — pointer-events-none so input below receives all events */}
        <div
          className="absolute w-5 h-5 rounded-full bg-white border-2 border-[var(--tm-green-500)] shadow-md pointer-events-none z-10"
          style={{ left: `calc(${pct}% - 10px)` }}
          aria-hidden="true"
        />

        {/* The actual range input — full height, transparent, on top via z-20 */}
        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer z-20"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>
    </div>
  );
}
