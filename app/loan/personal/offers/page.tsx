"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFunnelStore } from "@/lib/store/funnel";
import { fetchOffers, type Offer, type UnmatchedOffer } from "@/lib/api/offers";
import { EligibilityCarousel } from "@/components/funnel/EligibilityCarousel";
import { OfferCard } from "@/components/offers/OfferCard";
import { OfferCardSkeleton } from "@/components/offers/OfferCardSkeleton";
import { SortBar, type SortKey } from "@/components/offers/SortBar";
import { UnmatchedSection } from "@/components/offers/UnmatchedSection";
import { NoOffersState } from "@/components/offers/NoOffersState";
import { KfsSheet } from "@/components/offers/KfsSheet";
import type { EligibilityAnswers } from "@/lib/api/offers";

const ELIGIBILITY_QUESTIONS = [
  {
    id: "employmentType",
    label: "What's your employment type?",
    options: [
      { value: "salaried",      label: "Salaried",      subLabel: "Receiving a monthly salary from an employer" },
      { value: "self_employed", label: "Self-employed",  subLabel: "Business owner, freelancer, or consultant" },
    ],
  },
  {
    id: "annualIncome",
    label: "What's your annual income?",
    subtext: "Your total income in the last 12 months, before tax",
    options: [
      { value: "10L+",  label: "More than ₹10 Lakh" },
      { value: "5-10L", label: "₹5 Lakh – ₹10 Lakh" },
      { value: "3-5L",  label: "₹3 Lakh – ₹5 Lakh" },
      { value: "lt_3L", label: "Less than ₹3 Lakh" },
    ],
  },
  {
    id: "familyAnnualIncome",
    label: "What's your household annual income?",
    subtext: "Combined income of all earning members in your household",
    options: [
      { value: "gt_3L", label: "More than ₹3 Lakh" },
      { value: "lt_3L", label: "Less than ₹3 Lakh" },
    ],
  },
];


type PageState = "quiz" | "loading" | "results" | "no-offers";

export default function OffersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return");
  const { bureau, phone, eligibility, cachedOffers, setEligibility, setCachedOffers, setSelectedLender } =
    useFunnelStore();

  const [pageState, setPageState] = useState<PageState>(
    cachedOffers ? "results" : eligibility ? "loading" : "quiz"
  );
  const [matched, setMatched]   = useState<Offer[]>(cachedOffers?.matched ?? []);
  const [unmatched, setUnmatched] = useState<UnmatchedOffer[]>(cachedOffers?.unmatched ?? []);
  const [sortKey, setSortKey]   = useState<SortKey>("approval");
  const [kfsLenderId, setKfsLenderId] = useState<string | null>(null);

  useEffect(() => {
    if (!bureau && !phone) router.replace("/loan/personal");
  }, [bureau, phone, router]);

  useEffect(() => {
    if (eligibility && !cachedOffers && pageState === "loading") {
      runFetch(eligibility);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runFetch(el: EligibilityAnswers) {
    setPageState("loading");
    try {
      const result = await fetchOffers(bureau!, el, phone ?? "0000000000");
      setMatched(result.matched);
      setUnmatched(result.unmatched);
      setCachedOffers(result);
      setPageState(result.matched.length === 0 ? "no-offers" : "results");
    } catch {
      setPageState("no-offers");
    }
  }

  async function handleEligibilityComplete(answers: Record<string, string>) {
    const el = answers as unknown as EligibilityAnswers;
    setEligibility(el);
    if (returnTo === "profile") {
      // Pre-compute offers in the background so they're cached, then go back to profile
      runFetch(el);
      router.push("/profile");
      return;
    }
    await runFetch(el);
  }

  function handleSelectLender(lenderId: string) {
    setSelectedLender(lenderId);
    router.push(`/loan/personal/handoff?lender=${lenderId}`);
  }

  const kfsOffer = useMemo(() =>
    kfsLenderId ? matched.find((o) => o.lender.id === kfsLenderId) ?? null : null,
    [kfsLenderId, matched]
  );

  const sorted = useMemo(() => {
    const arr = [...matched];
    switch (sortKey) {
      case "emi":    return arr.sort((a, b) => a.emi - b.emi);
      case "rate":   return arr.sort((a, b) => a.rate - b.rate);
      case "amount": return arr.sort((a, b) => b.approvedAmount - a.approvedAmount);
      default:       return arr.sort((a, b) => b.approvalChance - a.approvalChance);
    }
  }, [matched, sortKey]);

  const noOfferReason = useMemo(() => {
    const reasons = unmatched.map((u) => u.reason.toLowerCase());
    if (reasons.some((r) => r.includes("income"))) return "low_income" as const;
    return "low_credit" as const;
  }, [unmatched]);

  const noOfferDetails = unmatched.length > 0
    ? `${unmatched[0].lender.brandName}: ${unmatched[0].reason}`
    : undefined;

  return (
    <>
      {pageState === "quiz" && (
        <EligibilityCarousel
          questions={ELIGIBILITY_QUESTIONS}
          onComplete={handleEligibilityComplete}
          onCancel={() => router.push(returnTo === "profile" ? "/profile" : "/loan/personal/basic-details")}
        />
      )}

      {kfsOffer && (
        <KfsSheet lender={kfsOffer.lender} offer={kfsOffer} onClose={() => setKfsLenderId(null)} />
      )}

      <div className="py-6 sm:py-10 px-4 max-w-[800px] mx-auto">
        {/* Skeleton — shown during quiz (behind popup) and while loading */}
        {(pageState === "quiz" || pageState === "loading") && (
          <div>
            <div className="skeleton h-7 w-56 rounded mb-6" />
            <div className="flex flex-col gap-4">
              {[0, 1, 2].map((i) => <OfferCardSkeleton key={i} />)}
            </div>
            {pageState === "loading" && (
              <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center pointer-events-none">
                <div className="bg-[var(--tm-ink-900)]/90 text-white text-sm font-medium px-5 py-3 rounded-[var(--tm-r-pill)] mb-8 sm:mb-0 flex items-center gap-2 pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-[var(--tm-green-400)] animate-ping" />
                  Calculating your offers…
                </div>
              </div>
            )}
          </div>
        )}

        {pageState === "no-offers" && (
          <NoOffersState reason={noOfferReason} details={noOfferDetails} />
        )}

        {pageState === "results" && (
          <div aria-live="polite" aria-label={`${sorted.length} offers found`}>
            <SortBar value={sortKey} onChange={setSortKey} matchedCount={sorted.length} />
            <div className="flex flex-col gap-4">
              {sorted.map((offer, idx) => (
                <div
                  key={offer.lender.id}
                  style={{ animation: idx < 4 ? `fadeSlideIn 300ms ease-out ${idx * 60}ms both` : "none" }}
                >
                  <OfferCard
                    lender={offer.lender}
                    offer={offer}
                    onSelect={handleSelectLender}
                    onViewKfs={(id) => setKfsLenderId(id)}
                  />
                </div>
              ))}
            </div>
            <UnmatchedSection items={unmatched} />
          </div>
        )}
      </div>
    </>
  );
}
