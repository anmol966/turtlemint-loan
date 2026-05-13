export type Lender = {
  id: string;
  brandName: string;
  legalName: string;
  brandColor: string;
  minCreditScore: number;
  minMonthlyIncome: number;
  minLoan: number;
  maxLoan: number;
  minRate: number;
  maxRate: number;
  minTenure: number;
  maxTenure: number;
  minFee: number;
  maxFee: number;
  usps: string[];
  disbursalTime: string;
  strictSelfEmployed?: boolean;
};

export const LENDERS: Lender[] = [
  {
    id: "smfg",
    brandName: "SMFG India Credit",
    legalName: "SMFG India Credit Co. Ltd.",
    brandColor: "#1565C0",
    minCreditScore: 750,
    minMonthlyIncome: 25000,
    minLoan: 50000,
    maxLoan: 3000000,
    minRate: 12,
    maxRate: 24,
    minTenure: 12,
    maxTenure: 60,
    minFee: 0,
    maxFee: 6,
    usps: ["Disbursal in 30 min", "No income docs for pre-approved", "Large loan amounts"],
    disbursalTime: "30 minutes",
  },
  {
    id: "stashfin",
    brandName: "Stashfin",
    legalName: "Akara Capital Advisors Pvt Ltd",
    brandColor: "#FF6B35",
    minCreditScore: 650,
    minMonthlyIncome: 18000,
    minLoan: 1000,
    maxLoan: 500000,
    minRate: 11.99,
    maxRate: 35.99,
    minTenure: 3,
    maxTenure: 36,
    minFee: 2,
    maxFee: 6,
    usps: ["First 30 days interest-free", "Instant disbursal", "Thin-file friendly"],
    disbursalTime: "5–20 minutes",
  },
  {
    id: "moneyview",
    brandName: "Moneyview",
    legalName: "Whizdm Innovations Pvt Ltd",
    brandColor: "#00D4AA",
    minCreditScore: 650,
    minMonthlyIncome: 13500,
    minLoan: 10000,
    maxLoan: 1000000,
    minRate: 14,
    maxRate: 36,
    minTenure: 3,
    maxTenure: 60,
    minFee: 2,
    maxFee: 8,
    usps: ["Lowest income threshold", "Fast 24-hour disbursal", "Tier-2/3 friendly"],
    disbursalTime: "24 hours",
  },
  {
    id: "poonawalla",
    brandName: "Poonawalla Fincorp",
    legalName: "Poonawalla Fincorp Limited",
    brandColor: "#0E3A8A",
    minCreditScore: 750,
    minMonthlyIncome: 25000,
    minLoan: 100000,
    maxLoan: 5000000,
    minRate: 9.99,
    maxRate: 30,
    minTenure: 12,
    maxTenure: 84,
    minFee: 0,
    maxFee: 3,
    usps: ["Lowest interest rate from 9.99%", "Largest loan up to ₹50L", "Longest tenure up to 84 months"],
    disbursalTime: "Same day",
    strictSelfEmployed: true,
  },
  {
    id: "herofincorp",
    brandName: "Hero FinCorp",
    legalName: "Hero FinCorp Limited",
    brandColor: "#7C3AED",
    minCreditScore: 725,
    minMonthlyIncome: 15000,
    minLoan: 50000,
    maxLoan: 500000,
    minRate: 18,
    maxRate: 30,
    minTenure: 12,
    maxTenure: 36,
    minFee: 2.5,
    maxFee: 2.5,
    usps: ["Trusted Hero Group brand", "10-day cooling-off period", "No pre-closure charges if cancelled"],
    disbursalTime: "1–2 business days",
    strictSelfEmployed: true,
  },
  {
    id: "kissht",
    brandName: "Kissht",
    legalName: "OnEMI Technology Solutions Pvt Ltd",
    brandColor: "#003F7F",
    minCreditScore: 700,
    minMonthlyIncome: 15000,
    minLoan: 10000,
    maxLoan: 500000,
    minRate: 14,
    maxRate: 33,
    minTenure: 6,
    maxTenure: 24,
    minFee: 2,
    maxFee: 5,
    usps: ["Instant approval in 5 min", "100% digital", "Fast small-ticket loans"],
    disbursalTime: "5 minutes",
  },
];

export function getLenderById(id: string): Lender | undefined {
  return LENDERS.find((l) => l.id === id);
}
