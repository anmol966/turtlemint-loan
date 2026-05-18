import { delay, MOCK_CONFIG } from "@/lib/mock/config";
import { LENDERS, type Lender } from "@/lib/mock/lenders";
import type { BureauProfile } from "@/lib/api/bureau";
import { calculateEmi } from "@/lib/utils/emi";

export type AnnualIncomeBucket = "10L+" | "5-10L" | "3-5L" | "lt_3L";
export type FamilyIncomeBucket = "gt_3L" | "lt_3L";

export type EligibilityAnswers = {
  employmentType: "salaried" | "self_employed";
  annualIncome: AnnualIncomeBucket;
  familyAnnualIncome: FamilyIncomeBucket;
};

export type Offer = {
  lender: Lender;
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

export type UnmatchedOffer = {
  lender: Lender;
  reason: string;
};

function bucketToMonthlyIncome(bucket: AnnualIncomeBucket): number {
  switch (bucket) {
    case "10L+": return 1_200_000 / 12;
    case "5-10L": return 750_000 / 12;
    case "3-5L": return 400_000 / 12;
    case "lt_3L": return 200_000 / 12;
  }
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildOffer(
  lender: Lender,
  profile: BureauProfile,
  eligibility: EligibilityAnswers,
  approvalChance: number,
  monthlyIncome: number
): Omit<Offer, "lender" | "bestMatch"> {
  const approvedAmount =
    Math.min(lender.maxLoan, Math.round((monthlyIncome * 24) / 50000) * 50000);
  const finalAmount = Math.max(lender.minLoan, approvedAmount);

  const rate = parseFloat(
    (lender.minRate + (1 - approvalChance / 100) * (lender.maxRate - lender.minRate)).toFixed(2)
  );
  const fee = parseFloat(
    (lender.minFee + (1 - approvalChance / 100) * (lender.maxFee - lender.minFee)).toFixed(2)
  );
  const defaultTenure = Math.min(36, lender.maxTenure);
  const emi = calculateEmi(finalAmount, rate, defaultTenure);
  const apr = parseFloat((rate + (fee / 100) * (12 / defaultTenure) * 100).toFixed(2));

  const reasons: string[] = [];
  if (approvalChance >= 80) reasons.push("Pre-approved");
  if (lender.id === "stashfin") reasons.push("First 30 days interest-free");
  if (lender.id === "poonawalla") reasons.push("Lowest interest rate");
  if (eligibility.employmentType === "salaried") reasons.push("No income docs needed");
  reasons.push(`Disbursal in ${lender.disbursalTime}`);

  void profile; // unused after bypassing credit check
  return {
    approvalChance,
    approvedAmount: finalAmount,
    emi,
    rate,
    apr,
    tenure: { min: lender.minTenure, max: lender.maxTenure },
    fee,
    matchedReasons: reasons.slice(0, 3),
  };
}

function matchLender(
  lender: Lender,
  profile: BureauProfile,
  eligibility: EligibilityAnswers,
  phoneSeed: number
): { matched: true; offer: Omit<Offer, "lender" | "bestMatch"> } | { matched: false; reason: string } {
  const monthlyIncome = bucketToMonthlyIncome(eligibility.annualIncome);
  const { creditScore } = profile;

  // Fixed tiers: SMFG = Excellent (95), Moneyview = Very High (75), always matched
  if (lender.id === "smfg") {
    return { matched: true, offer: buildOffer(lender, profile, eligibility, 95, monthlyIncome) };
  }
  if (lender.id === "moneyview") {
    return { matched: true, offer: buildOffer(lender, profile, eligibility, 75, monthlyIncome) };
  }

  if (creditScore == null) {
    return {
      matched: false,
      reason: `Credit score unavailable — cannot evaluate eligibility`,
    };
  }

  if (creditScore < lender.minCreditScore) {
    return {
      matched: false,
      reason: `Credit score below threshold (need ${lender.minCreditScore}+, you have ${creditScore})`,
    };
  }

  if (monthlyIncome < lender.minMonthlyIncome) {
    return {
      matched: false,
      reason: `Minimum income required: ₹${lender.minMonthlyIncome.toLocaleString("en-IN")}/month`,
    };
  }

  const baseScore = Math.min(100, Math.max(0, ((creditScore - 600) / 300) * 100));
  const lenderNoise = seededRandom(phoneSeed + lender.id.charCodeAt(0)) * 10 - 5;

  let approvalChance = Math.round(
    Math.min(98, Math.max(30, baseScore + lenderNoise))
  );

  if (eligibility.employmentType === "self_employed" && lender.strictSelfEmployed) {
    approvalChance = Math.max(30, approvalChance - 18);
  }

  return { matched: true, offer: buildOffer(lender, profile, eligibility, approvalChance, monthlyIncome) };
}

export async function fetchOffers(
  profile: BureauProfile,
  eligibility: EligibilityAnswers,
  phone: string
): Promise<{ matched: Offer[]; unmatched: UnmatchedOffer[] }> {
  await delay(MOCK_CONFIG.OFFERS_FETCH_DELAY_MS);

  const phoneSeed = phone.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const matched: Offer[] = [];
  const unmatched: UnmatchedOffer[] = [];

  for (const lender of LENDERS) {
    const result = matchLender(lender, profile, eligibility, phoneSeed);
    if (result.matched) {
      matched.push({ lender, ...result.offer });
    } else {
      unmatched.push({ lender, reason: result.reason });
    }
  }

  matched.sort((a, b) => b.approvalChance - a.approvalChance);
  if (matched.length > 0) matched[0].bestMatch = true;

  return { matched, unmatched };
}
