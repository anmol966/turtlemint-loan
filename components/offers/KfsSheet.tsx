"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { formatINR, formatPercent } from "@/lib/utils/format";
import { COMPLIANCE_COPY } from "@/lib/copy/compliance";
import type { Lender } from "@/lib/mock/lenders";
import type { OfferCardData } from "./OfferCard";

interface Props {
  lender: Lender;
  offer: OfferCardData;
  onClose: () => void;
}

function Row({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-3 border-b border-[var(--tm-ink-100)] last:border-0">
      <span className="text-sm text-[var(--tm-ink-500)]">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold text-[var(--tm-ink-900)]">{value}</span>
        {note && <p className="text-xs text-[var(--tm-ink-500)] mt-0.5">{note}</p>}
      </div>
    </div>
  );
}

export function KfsSheet({ lender, offer, onClose }: Props) {
  // Trap focus + close on Escape
  useEffect(() => {
    function handle(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handle);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handle);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const totalInterest = offer.emi * 36 - offer.approvedAmount;
  const totalPayable = offer.emi * 36;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`Key Facts for ${lender.brandName}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-[var(--tm-shadow-lg)] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[var(--tm-ink-100)] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-[var(--tm-ink-500)] mb-0.5">{COMPLIANCE_COPY.kfsIntro}</p>
            <h2 className="font-bold text-[var(--tm-ink-900)] text-lg">{lender.brandName} — Key Facts</h2>
            <p className="text-xs text-[var(--tm-ink-500)]">{lender.legalName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-[var(--tm-r-sm)] text-[var(--tm-ink-500)] hover:bg-[var(--tm-ink-100)] transition-colors"
            aria-label="Close key facts"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6 flex-1">
          {/* Loan terms */}
          <section>
            <h3 className="text-xs font-bold text-[var(--tm-green-700)] uppercase tracking-wide mb-2">Loan Terms</h3>
            <div className="bg-[var(--tm-ink-100)]/50 rounded-[var(--tm-r-md)] px-4">
              <Row label="Loan amount" value={formatINR(offer.approvedAmount)} />
              <Row label="Interest rate (p.a.)" value={formatPercent(offer.rate)} />
              <Row label="APR (all-in rate)" value={formatPercent(offer.apr)} note="Includes processing fee, annualised" />
              <Row label="Tenure" value={`${offer.tenure.min}–${offer.tenure.max} months`} />
              <Row label="Monthly EMI" value={`${formatINR(offer.emi)}/month`} note="On approved amount at 36 months" />
            </div>
          </section>

          {/* Total cost */}
          <section>
            <h3 className="text-xs font-bold text-[var(--tm-green-700)] uppercase tracking-wide mb-2">Total Cost of Loan</h3>
            <div className="bg-[var(--tm-ink-100)]/50 rounded-[var(--tm-r-md)] px-4">
              <Row label="Total interest payable" value={formatINR(totalInterest)} note="Over 36 months" />
              <Row label="Processing fee" value={`${formatPercent(offer.fee, 1)} of loan amount`} />
              <Row label="GST on processing fee" value="18% of fee" />
              <Row label="Total amount payable" value={formatINR(totalPayable)} note="Principal + interest + fees" />
            </div>
          </section>

          {/* Other charges */}
          <section>
            <h3 className="text-xs font-bold text-[var(--tm-green-700)] uppercase tracking-wide mb-2">Other Charges</h3>
            <div className="bg-[var(--tm-ink-100)]/50 rounded-[var(--tm-r-md)] px-4">
              <Row label="Prepayment charges" value="As per lender policy" note="Fixed-rate personal loans may have charges" />
              <Row label="Penal interest (late payment)" value="2–3% per month on overdue amount" />
              <Row label="Bounce charges" value="₹500–₹1,000 per instance" />
            </div>
          </section>

          {/* Cooling off */}
          <section>
            <h3 className="text-xs font-bold text-[var(--tm-green-700)] uppercase tracking-wide mb-2">Your Rights</h3>
            <div className="bg-[var(--tm-green-50)] rounded-[var(--tm-r-md)] px-4 py-1">
              <Row label="Cooling-off period" value="3 days" note={COMPLIANCE_COPY.coolingOffNote} />
            </div>
          </section>

          {/* Grievance */}
          <section className="bg-[var(--tm-ink-100)]/50 rounded-[var(--tm-r-md)] p-4">
            <h3 className="text-xs font-bold text-[var(--tm-ink-700)] uppercase tracking-wide mb-2">Grievance Redressal</h3>
            <p className="text-xs text-[var(--tm-ink-500)] leading-relaxed">
              {COMPLIANCE_COPY.grievanceOfficer.name} ·{" "}
              <a href={`mailto:${COMPLIANCE_COPY.grievanceOfficer.email}`} className="text-[var(--tm-green-700)] hover:underline">
                {COMPLIANCE_COPY.grievanceOfficer.email}
              </a>{" "}
              · {COMPLIANCE_COPY.grievanceOfficer.phone}
            </p>
          </section>
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 bg-white border-t border-[var(--tm-ink-100)] p-4">
          <p className="text-[11px] text-[var(--tm-ink-500)] leading-relaxed">
            {COMPLIANCE_COPY.lspDisclosure}
          </p>
        </div>
      </div>
    </div>
  );
}
