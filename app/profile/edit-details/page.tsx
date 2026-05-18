"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/brand/Logo";
import { BasicDetailsForm } from "@/components/forms/BasicDetailsForm";
import { useFunnelStore } from "@/lib/store/funnel";

export default function EditDetailsPage() {
  const router = useRouter();
  const { bureau, phone } = useFunnelStore();

  useEffect(() => {
    if (!bureau && !phone) router.replace("/loan/personal");
  }, [bureau, phone, router]);

  if (!bureau && !phone) return null;

  return (
    <div className="min-h-screen bg-[var(--tm-paper)]">
      {/* Minimal profile-style header (no funnel stepper) */}
      <header className="sticky top-0 z-50 bg-white shadow-[var(--tm-shadow-md)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <Link
            href="/profile"
            className="flex items-center gap-1 text-sm font-medium text-[var(--tm-green-700)] hover:text-[var(--tm-green-500)] transition-colors"
          >
            <ChevronLeft size={16} /> Back to profile
          </Link>
        </div>
      </header>

      <div className="max-w-[480px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[var(--tm-ink-900)] mb-1"
          style={{ fontFamily: "var(--font-jakarta)" }}>
          Edit Personal Details
        </h1>
        <p className="text-sm text-[var(--tm-ink-500)] mb-6">
          Update any details that have changed since your last application.
        </p>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <BasicDetailsForm
              submitLabel="Save changes"
              onSaved={() => router.push("/profile")}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
