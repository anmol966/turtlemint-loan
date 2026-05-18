"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { BasicDetailsForm } from "@/components/forms/BasicDetailsForm";
import { useFunnelStore } from "@/lib/store/funnel";
import { useNavigationGuard } from "@/lib/hooks/useNavigationGuard";

export default function BasicDetailsPage() {
  const router = useRouter();
  const { bureau, phone } = useFunnelStore();

  useNavigationGuard(true);

  useEffect(() => {
    if (!bureau && !phone) router.replace("/loan/personal");
  }, [bureau, phone, router]);

  return (
    <div className="py-6 sm:py-10 px-4 max-w-[480px] mx-auto">
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--tm-ink-900)] mb-1"
              style={{ fontFamily: "var(--font-jakarta)" }}>
              Please verify details for the best loan offer
            </h1>
            <p className="text-sm text-[var(--tm-ink-500)]">
              Prefilled from your credit profile. Edit anything that&apos;s outdated.
            </p>
          </div>

          <BasicDetailsForm
            submitLabel="Continue →"
            onSaved={() => router.push("/loan/personal/offers")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
