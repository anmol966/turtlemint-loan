"use client";

import { cn } from "@/lib/utils/cn";
import { formatINR, formatPercent } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { ChevronRight, Star } from "lucide-react";
import { LenderLogo } from "@/components/brand/LenderLogo";
import type { Lender } from "@/lib/mock/lenders";

export type OfferCardData = {
  approvalChance: number;
  approvedAmount: number;
  emi: number;
  rate: number;
  apr: number;
  tenure: { min: number; max: number };
  fee: number;
  bestMatch?: boolean;
  matchedReasons: string[];
};

interface Props {
  lender: Lender;
  offer: OfferCardData;
  onSelect: (lenderId: string) => void;
  onViewKfs: (lenderId: string) => void;
}

type ApprovalTier = { label: string; color: string; bg: string; dots: number };

function getApprovalTier(chance: number): ApprovalTier {
  if (chance >= 85) return { label: "Excellent",  color: "#15803D", bg: "#DCFCE7", dots: 5 };
  if (chance >= 70) return { label: "Very High",  color: "#166534", bg: "#D1FAE5", dots: 4 };
  if (chance >= 55) return { label: "High",       color: "#92400E", bg: "#FEF3C7", dots: 3 };
  if (chance >= 40) return { label: "Medium",     color: "#9A3412", bg: "#FFEDD5", dots: 2 };
  return              { label: "Low",         color: "#991B1B", bg: "#FEE2E2", dots: 1 };
}

function ApprovalMeter({ chance }: { chance: number }) {
  const tier = getApprovalTier(chance);
  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--tm-r-md)]"
      style={{ background: tier.bg }}
    >
      {/* 5 rating dots */}
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="w-1.5 h-3.5 rounded-full"
            style={{ background: i < tier.dots ? tier.color : "#D1D5DB" }}
          />
        ))}
      </div>
      <span className="text-xs font-bold" style={{ color: tier.color }}>
        {tier.label}
      </span>
    </div>
  );
}

export function OfferCard({ lender, offer, onSelect, onViewKfs }: Props) {
  return (
    <div
      className={cn(
        "bg-white rounded-[var(--tm-r-lg)] border transition-shadow hover:shadow-[var(--tm-shadow-lg)]",
        offer.bestMatch
          ? "border-[var(--tm-green-500)] shadow-[var(--tm-shadow-glow)]"
          : "border-[var(--tm-ink-100)] shadow-[var(--tm-shadow-md)]"
      )}
    >
      {offer.bestMatch && (
        <div className="bg-[var(--tm-green-500)] text-white text-xs font-bold px-4 py-1.5 rounded-t-[var(--tm-r-lg)] flex items-center gap-1.5">
          <Star size={12} fill="white" /> BEST MATCH
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <LenderLogo lenderId={lender.id} brandName={lender.brandName} size="md" />
            <div>
              <p className="font-bold text-[var(--tm-ink-900)] text-base leading-tight">{lender.brandName}</p>
              <p className="text-[11px] text-[var(--tm-ink-500)] leading-tight">by {lender.legalName} · RBI-licensed</p>
            </div>
          </div>
          <ApprovalMeter chance={offer.approvalChance} />
        </div>

        {/* Key numbers */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-[var(--tm-ink-500)] mb-0.5">Loan up to</p>
            <p className="text-xl font-bold tabular-nums text-[var(--tm-ink-900)]">{formatINR(offer.approvedAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--tm-ink-500)] mb-0.5">EMI starts from</p>
            <p className="text-xl font-bold tabular-nums text-[var(--tm-ink-900)]">
              {formatINR(offer.emi)}<span className="text-sm font-normal text-[var(--tm-ink-500)]">/mo</span>
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-3 gap-3 py-3 border-y border-[var(--tm-ink-100)] mb-4">
          <div>
            <p className="text-xs text-[var(--tm-ink-500)] mb-0.5">Interest rate</p>
            <p className="font-semibold text-sm text-[var(--tm-ink-900)] tabular-nums">{formatPercent(offer.rate)}</p>
            <p className="text-[10px] text-[var(--tm-ink-500)]">APR {formatPercent(offer.apr)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--tm-ink-500)] mb-0.5">Processing fee</p>
            <p className="font-semibold text-sm text-[var(--tm-ink-900)]">{formatPercent(offer.fee, 1)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--tm-ink-500)] mb-0.5">Tenure</p>
            <p className="font-semibold text-sm text-[var(--tm-ink-900)]">{offer.tenure.min}–{offer.tenure.max} mo</p>
          </div>
        </div>

        {/* Why matched tags */}
        {offer.matchedReasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {offer.matchedReasons.map((r) => (
              <span key={r} className="text-xs bg-[var(--tm-green-50)] text-[var(--tm-green-700)] px-2 py-0.5 rounded-[var(--tm-r-pill)] font-medium">
                {r}
              </span>
            ))}
          </div>
        )}

        <p className="text-[11px] text-[var(--tm-ink-500)] mb-4">
          Disbursal directly to your bank account by {lender.brandName}.
        </p>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => onViewKfs(lender.id)}>
            View Key Facts
          </Button>
          <Button size="sm" className="flex-1 text-xs" onClick={() => onSelect(lender.id)}>
            Continue <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
