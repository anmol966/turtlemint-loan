import Link from "next/link";
import { Button } from "@/components/ui/button";
import { COMPLIANCE_COPY } from "@/lib/copy/compliance";

type Reason = "low_credit" | "low_income" | "recent_inquiry" | "no_credit_history";

interface Props {
  reason: Reason;
  details?: string;
}

const REASON_COPY: Record<Reason, { headline: string; body: string; cta: string; ctaHref: string }> = {
  low_credit: {
    headline: "Your credit score is below our lenders' threshold",
    body: "Most of our partner lenders require a minimum score of 650. Improving your score by even 50–70 points can unlock multiple offers.",
    cta: "Improve my score →",
    ctaHref: "/tools/improve-credit-score",
  },
  low_income: {
    headline: "Income below lender requirements",
    body: "Our partner lenders have a minimum monthly income threshold. Check back once your income increases, or explore smaller loan options.",
    cta: "View EMI options →",
    ctaHref: "/tools/emi-calculator",
  },
  recent_inquiry: {
    headline: "Too many recent credit inquiries",
    body: "Multiple hard inquiries in a short period lower your score and flag risk for lenders. Give it 30–45 days before applying again.",
    cta: "Improve my score →",
    ctaHref: "/tools/improve-credit-score",
  },
  no_credit_history: {
    headline: "No credit history found",
    body: "Lenders couldn't assess your profile. Start building credit with a secured credit card or a small consumer loan.",
    cta: "Learn how to build credit →",
    ctaHref: "/tools/improve-credit-score",
  },
};

export function NoOffersState({ reason, details }: Props) {
  const copy = REASON_COPY[reason];

  return (
    <div className="flex flex-col items-center text-center py-16 px-4 max-w-md mx-auto">
      {/* Turtle illustration placeholder */}
      <div className="w-24 h-24 mb-6 rounded-full bg-[var(--tm-green-50)] flex items-center justify-center text-5xl">
        🐢
      </div>

      <h2 className="text-2xl font-bold text-[var(--tm-ink-900)] mb-2"
        style={{ fontFamily: "var(--font-jakarta)" }}>
        Sorry, no offers right now
      </h2>
      <p className="text-sm text-[var(--tm-ink-500)] mb-4">{copy.headline}</p>

      {details && (
        <div className="w-full bg-[var(--tm-ink-100)] rounded-[var(--tm-r-md)] px-4 py-3 mb-5 text-sm text-[var(--tm-ink-700)] text-left">
          <strong>Reason:</strong> {details}
        </div>
      )}

      <p className="text-sm text-[var(--tm-ink-700)] mb-6">{copy.body}</p>

      <div className="flex flex-col gap-3 w-full">
        <Button asChild size="lg" className="w-full">
          <Link href={copy.ctaHref}>{copy.cta}</Link>
        </Button>
        <p className="text-xs text-[var(--tm-ink-500)]">Try again in 30 days once your score improves.</p>
      </div>

      <div className="mt-8 pt-6 border-t border-[var(--tm-ink-100)] w-full text-left">
        <p className="text-xs text-[var(--tm-ink-500)]">
          Have a question?{" "}
          <a href={`mailto:${COMPLIANCE_COPY.grievanceOfficer.email}`}
            className="text-[var(--tm-green-700)] hover:underline font-medium">
            Contact our Grievance Officer
          </a>
        </p>
      </div>
    </div>
  );
}
