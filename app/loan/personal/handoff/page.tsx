"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ExternalLink } from "lucide-react";
import { getLenderById } from "@/lib/mock/lenders";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { COMPLIANCE_COPY } from "@/lib/copy/compliance";
import { Suspense } from "react";

function HandoffContent() {
  const params = useSearchParams();
  const router = useRouter();
  const lenderId = params.get("lender") ?? "";
  const lender = getLenderById(lenderId);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!lender) return;
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [lender]);

  if (!lender) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--tm-ink-500)]">Invalid lender. <button onClick={() => router.back()} className="text-[var(--tm-green-700)] underline">Go back</button></p>
      </div>
    );
  }

  const isInApp = lender.id === "smfg";

  return (
    <div className="py-10 px-4 max-w-[480px] mx-auto">
      <Card>
        <CardContent className="p-8 text-center flex flex-col items-center gap-5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: lender.brandColor + "20" }}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: lender.brandColor }}
            />
          </div>

          <div>
            <h1 className="text-xl font-bold text-[var(--tm-ink-900)] mb-1"
              style={{ fontFamily: "var(--font-jakarta)" }}>
              {isInApp
                ? `Starting your ${lender.brandName} application`
                : `You're being redirected to ${lender.brandName}`}
            </h1>
            <p className="text-sm text-[var(--tm-ink-500)]">{lender.legalName}</p>
          </div>

          {!isInApp && (
            <div className="w-full bg-[var(--tm-ink-100)] rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-[var(--tm-green-500)] rounded-full transition-all duration-1000"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>
          )}

          <div className="flex items-center gap-2 text-[var(--tm-ink-500)]">
            <Loader2 size={16} className="animate-spin text-[var(--tm-green-500)]" />
            <span className="text-sm">
              {isInApp ? "Preparing your application…" : `Redirecting in ${countdown}s…`}
            </span>
          </div>

          <div className="w-full bg-[var(--tm-green-50)] rounded-[var(--tm-r-md)] px-4 py-3 text-xs text-[var(--tm-green-700)] text-left">
            {COMPLIANCE_COPY.directDisbursalNote(lender.brandName)}
          </div>

          <div className="flex flex-col gap-2 w-full">
            {!isInApp && (
              <Button size="md" className="w-full gap-2" onClick={() => {}}>
                <ExternalLink size={15} /> Open {lender.brandName} now
              </Button>
            )}
            <Button variant="ghost" size="sm" className="w-full text-[var(--tm-ink-500)]"
              onClick={() => router.push("/loan/personal/offers")}>
              ← Back to offers
            </Button>
          </div>

          <p className="text-[11px] text-[var(--tm-ink-500)] mt-2">
            Trouble with the lender?{" "}
            <a href={`mailto:${COMPLIANCE_COPY.grievanceOfficer.email}`} className="text-[var(--tm-green-700)] hover:underline">
              Talk to us first
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HandoffPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-[var(--tm-ink-500)]">Loading…</div>}>
      <HandoffContent />
    </Suspense>
  );
}
