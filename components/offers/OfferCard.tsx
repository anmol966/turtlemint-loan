"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { formatINR, formatPercent } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Crown, FileText } from "lucide-react";
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
    <div className="flex flex-col items-end gap-1">
      <span className="text-[10px] font-semibold text-[var(--tm-ink-500)] uppercase tracking-wide">
        Approval chance
      </span>
      <div
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--tm-r-md)]"
        style={{ background: tier.bg }}
      >
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
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--tm-ink-500)] mb-0.5">{label}</p>
      <p className="text-lg font-bold tabular-nums text-[var(--tm-ink-900)] leading-tight">
        {value}
      </p>
      {sub && <p className="text-[10px] text-[var(--tm-ink-500)] mt-0.5">{sub}</p>}
    </div>
  );
}

export function OfferCard({ lender, offer, onSelect, onViewKfs }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-[var(--tm-r-lg)] border transition-all overflow-hidden",
        offer.bestMatch
          ? "border-[var(--tm-green-500)] border-2 shadow-[0_12px_40px_rgba(43,182,115,0.25)] bg-gradient-to-br from-[var(--tm-green-50)] to-white"
          : "border-[var(--tm-ink-100)] shadow-[var(--tm-shadow-md)] bg-white hover:shadow-[var(--tm-shadow-lg)]"
      )}
    >
      {offer.bestMatch && (
        <div className="bg-[var(--tm-green-500)] text-white px-4 py-2 flex items-center gap-2">
          <Crown size={14} fill="white" />
          <span className="text-xs font-bold tracking-wide">BEST MATCH FOR YOU</span>
          <span className="ml-auto text-[10px] uppercase tracking-wide opacity-90 hidden sm:inline">
            Highest approval chance · Best rate
          </span>
        </div>
      )}

      <div className="p-5 sm:p-6">
        {/* Header row: lender + approval */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <LenderLogo lenderId={lender.id} brandName={lender.brandName} size="md" />
            <div className="min-w-0">
              <p className="font-bold text-[var(--tm-ink-900)] text-base leading-tight truncate">
                {lender.brandName}
              </p>
              <p className="text-[11px] text-[var(--tm-ink-500)] leading-tight truncate">
                by {lender.legalName} · RBI-licensed
              </p>
            </div>
          </div>
          <ApprovalMeter chance={offer.approvalChance} />
        </div>

        {/* Compact stats grid: Loan / EMI / Fee / ROI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <Stat label="Loan Amount" value={formatINR(offer.approvedAmount)} />
          <Stat label="EMI" value={`${formatINR(offer.emi)}/mo`} />
          <Stat label="Processing Fee" value={formatPercent(offer.fee, 1)} />
          <Stat label="ROI" value={formatPercent(offer.rate)} />
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 text-sm font-semibold text-[var(--tm-green-700)] hover:text-[var(--tm-green-500)] transition-colors"
            aria-expanded={open}
          >
            {open ? "View Less" : "View Details"}
            <ChevronDown
              size={14}
              className={cn("transition-transform", open && "rotate-180")}
            />
          </button>

          <Button
            size={offer.bestMatch ? "lg" : "md"}
            className={cn(
              "flex-shrink-0",
              offer.bestMatch && "px-6 shadow-[0_4px_16px_rgba(43,182,115,0.4)]"
            )}
            onClick={() => onSelect(lender.id)}
          >
            Apply Now <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="bg-[var(--tm-green-50)]/60 border-t border-[var(--tm-ink-100)] px-5 sm:px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-4">
            <div>
              <p className="text-[11px] font-semibold text-[var(--tm-ink-500)] uppercase tracking-wide mb-1">Part Payment</p>
              <p className="text-sm font-bold text-[var(--tm-ink-900)] mb-1">
                {lender.partPayment?.headline ?? "As per lender policy"}
              </p>
              {lender.partPayment?.note && (
                <p className="text-[11px] text-[var(--tm-ink-500)] leading-snug">{lender.partPayment.note}</p>
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--tm-ink-500)] uppercase tracking-wide mb-1">Foreclosure</p>
              <p className="text-sm font-bold text-[var(--tm-ink-900)] mb-1">
                {lender.foreclosure?.headline ?? "As per lender policy"}
              </p>
              {lender.foreclosure?.note && (
                <p className="text-[11px] text-[var(--tm-ink-500)] leading-snug">{lender.foreclosure.note}</p>
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--tm-ink-500)] uppercase tracking-wide mb-1">Annual Percentage Rate</p>
              <p className="text-sm font-bold text-[var(--tm-ink-900)] tabular-nums">{formatPercent(offer.apr)}</p>
              <p className="text-[11px] text-[var(--tm-ink-500)] leading-snug">
                Tenure {offer.tenure.min}–{offer.tenure.max} months
              </p>
            </div>
          </div>

          {offer.matchedReasons.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {offer.matchedReasons.map((r) => (
                <span
                  key={r}
                  className="text-[11px] bg-white text-[var(--tm-green-700)] border border-[var(--tm-green-300)]/50 px-2 py-0.5 rounded-[var(--tm-r-pill)] font-medium"
                >
                  {r}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-[var(--tm-ink-500)] leading-relaxed">
            For more details on charges and other loan terms, kindly refer to the{" "}
            <button
              onClick={() => onViewKfs(lender.id)}
              className="text-[var(--tm-green-700)] underline font-medium hover:text-[var(--tm-green-500)]"
            >
              <FileText size={11} className="inline mr-0.5" />
              provisional KFS
            </button>{" "}
            statement.
          </p>
        </div>
      )}
    </div>
  );
}
