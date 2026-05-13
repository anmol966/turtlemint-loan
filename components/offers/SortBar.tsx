"use client";

import { cn } from "@/lib/utils/cn";
import { HelpCircle } from "lucide-react";
import { COMPLIANCE_COPY } from "@/lib/copy/compliance";

export type SortKey = "approval" | "emi" | "rate" | "amount";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "approval", label: "Approval chance" },
  { key: "emi", label: "Lowest EMI" },
  { key: "rate", label: "Lowest rate" },
  { key: "amount", label: "Highest amount" },
];

interface Props {
  value: SortKey;
  onChange: (key: SortKey) => void;
  matchedCount: number;
}

export function SortBar({ value, onChange, matchedCount }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-[var(--tm-ink-900)]">
          {matchedCount} offer{matchedCount !== 1 ? "s" : ""} matched for you
        </h2>
        <span className="group relative hidden sm:block">
          <HelpCircle size={15} className="text-[var(--tm-ink-500)] cursor-help" />
          <span className="absolute left-0 top-6 w-64 text-xs bg-[var(--tm-ink-900)] text-white rounded-[var(--tm-r-sm)] px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 leading-relaxed">
            {COMPLIANCE_COPY.rankingMethodology}
          </span>
        </span>
      </div>

      <div className="flex gap-1 flex-wrap" role="group" aria-label="Sort offers by">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={cn(
              "px-3 py-1.5 rounded-[var(--tm-r-pill)] text-xs font-semibold transition-all whitespace-nowrap",
              value === opt.key
                ? "bg-[var(--tm-green-500)] text-white shadow-sm"
                : "bg-[var(--tm-ink-100)] text-[var(--tm-ink-700)] hover:bg-[var(--tm-green-50)] hover:text-[var(--tm-green-700)]"
            )}
            aria-pressed={value === opt.key}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
