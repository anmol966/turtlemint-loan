export const COMPLIANCE_COPY = {
  lspDisclosure:
    "Turtlemint is a Lending Service Provider (LSP) for the partner NBFCs listed. We do not lend. Loans are underwritten and disbursed by the respective Regulated Entity. We are compensated by lenders via a referral commission.",

  bureauConsentText:
    "I authorize Turtlemint and its partner lenders to fetch my credit report from credit bureaus (CIBIL, Experian, Equifax, CRIF Highmark) for the purpose of personal loan eligibility assessment. This is a soft inquiry and will not affect my credit score.",

  lenderShareConsentText: (lenderName: string) =>
    `I authorize Turtlemint to share my profile and application details with ${lenderName} for the purpose of processing my personal loan application.`,

  softInquiryNote:
    "Soft inquiry only — no impact on your CIBIL score.",

  directDisbursalNote: (lenderName: string) =>
    `Disbursal directly to your bank account by ${lenderName}.`,

  coolingOffNote:
    "You have a 3-day cooling-off period after loan disbursement. You may cancel the loan without penalty during this period.",

  grievanceOfficer: {
    name: "Grievance Officer",
    email: "grievance@turtlemint.com",
    phone: "1800-XXX-XXXX",
    address: "Turtlemint, 4th Floor, Tower 1, World Trade Centre, Kharadi, Pune – 411014",
  },

  rankingMethodology:
    "Offers are ranked by estimated approval probability, calculated from your credit score, income, and each lender's eligibility criteria. Equal probability offers are then ranked by lowest EMI.",

  kfsIntro: "Everything you need to know before you say yes.",

  rbiRegistration:
    "RBI registration details and compliance documents are available on request. Contact grievance@turtlemint.com.",
} as const;
