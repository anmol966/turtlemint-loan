"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, XCircle } from "lucide-react";
import { LenderLogo } from "@/components/brand/LenderLogo";
import type { Lender } from "@/lib/mock/lenders";

type UnmatchedOffer = { lender: Lender; reason: string };

interface Props { items: UnmatchedOffer[] }

export function UnmatchedSection({ items }: Props) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <div className="mt-8 border-t border-[var(--tm-ink-100)] pt-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-semibold text-[var(--tm-ink-500)] hover:text-[var(--tm-ink-700)] transition-colors mb-3 w-full text-left"
        aria-expanded={open}
      >
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        <span>
          Your profile didn&apos;t meet criteria for{" "}
          <span className="text-[var(--tm-ink-700)]">{items.length} lender{items.length !== 1 ? "s" : ""}</span>
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-2.5">
          {items.map(({ lender, reason }) => (
            <div
              key={lender.id}
              className="flex items-center gap-3 p-3.5 rounded-[var(--tm-r-lg)] border border-[var(--tm-ink-100)] bg-[var(--tm-ink-100)]/40"
            >
              <LenderLogo lenderId={lender.id} brandName={lender.brandName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[var(--tm-ink-600)]">{lender.brandName}</p>
                <p className="text-[11px] text-[var(--tm-ink-500)]">{lender.legalName}</p>
              </div>
              <div className="flex items-start gap-1 shrink-0 max-w-[180px] text-right">
                <XCircle size={13} className="text-[var(--tm-ink-500)] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--tm-ink-500)]">{reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
