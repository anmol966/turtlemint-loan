"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Phone, Mail, MapPin, CreditCard, TrendingUp, Calendar,
  Briefcase, Wallet, Users, Pencil,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { useFunnelStore } from "@/lib/store/funnel";
import Link from "next/link";

function scoreColor(score: number) {
  if (score >= 750) return "#15803D";
  if (score >= 650) return "#92400E";
  return "#991B1B";
}

function scoreLabel(score: number) {
  if (score >= 750) return "Excellent";
  if (score >= 700) return "Good";
  if (score >= 650) return "Fair";
  return "Poor";
}

const EMPLOYMENT_LABELS = {
  salaried: "Salaried",
  self_employed: "Self-employed",
} as const;

const ANNUAL_INCOME_LABELS = {
  "10L+":  "More than ₹10 Lakh",
  "5-10L": "₹5 – 10 Lakh",
  "3-5L":  "₹3 – 5 Lakh",
  "lt_3L": "Less than ₹3 Lakh",
} as const;

const FAMILY_INCOME_LABELS = {
  gt_3L: "More than ₹3 Lakh",
  lt_3L: "Less than ₹3 Lakh",
} as const;

function ScoreGauge({ score }: { score: number }) {
  const min = 300;
  const max = 900;
  const pct = Math.round(((score - min) / (max - min)) * 100);
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div
        className="w-24 h-24 rounded-full flex flex-col items-center justify-center border-4"
        style={{ borderColor: color }}
      >
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>{score}</span>
        <span className="text-[10px] font-semibold" style={{ color }}>{scoreLabel(score)}</span>
      </div>
      <div className="w-full max-w-[200px]">
        <div className="h-2 rounded-full bg-[var(--tm-ink-100)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[var(--tm-ink-400)] mt-1">
          <span>300</span>
          <span>900</span>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { phone, bureau, basicDetails, eligibility, reset, editEligibility } = useFunnelStore();

  useEffect(() => {
    if (!phone && !bureau) router.replace("/loan/personal");
  }, [phone, bureau, router]);

  if (!bureau && !phone) return null;

  const detailRows: { icon: React.ReactNode; label: string; value: string }[] = [
    {
      icon: <User size={15} className="text-[var(--tm-ink-400)]" />,
      label: "Full Name",
      value: bureau?.fullName ?? "—",
    },
    {
      icon: <Phone size={15} className="text-[var(--tm-ink-400)]" />,
      label: "Mobile",
      value: phone ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : "—",
    },
    {
      icon: <Mail size={15} className="text-[var(--tm-ink-400)]" />,
      label: "Email",
      value: basicDetails?.email ?? bureau?.emailMasked ?? "—",
    },
    {
      icon: <Calendar size={15} className="text-[var(--tm-ink-400)]" />,
      label: "Date of Birth",
      value: basicDetails?.dob ?? (bureau?.dob ? bureau.dob.split("-").reverse().join("/") : "—"),
    },
    {
      icon: <MapPin size={15} className="text-[var(--tm-ink-400)]" />,
      label: "Pincode",
      value: basicDetails?.pincode ?? bureau?.pincode ?? "—",
    },
    {
      icon: <CreditCard size={15} className="text-[var(--tm-ink-400)]" />,
      label: "PAN",
      value: bureau?.panMasked ?? "—",
    },
    {
      icon: <TrendingUp size={15} className="text-[var(--tm-ink-400)]" />,
      label: "Existing obligations",
      value: bureau?.existingObligations != null
        ? `₹${bureau.existingObligations.toLocaleString("en-IN")}/mo`
        : "—",
    },
  ];

  function handleEditEligibility() {
    editEligibility();
    router.push("/loan/personal/offers?return=profile");
  }

  function handleEditDetails() {
    router.push("/loan/personal/basic-details?return=profile");
  }

  return (
    <div className="min-h-screen bg-[var(--tm-paper)]">
      <header className="sticky top-0 z-50 bg-white shadow-[var(--tm-shadow-md)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <Link
            href="/"
            className="text-sm font-medium text-[var(--tm-green-700)] hover:text-[var(--tm-green-500)] transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <div className="max-w-[480px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[var(--tm-ink-900)] mb-1"
          style={{ fontFamily: "var(--font-jakarta)" }}>
          Your Profile
        </h1>
        <p className="text-sm text-[var(--tm-ink-500)] mb-6">
          Data fetched from CIBIL during your session. Not stored on our servers.
        </p>

        {/* Credit score */}
        {bureau && (
          <Card className="mb-5">
            <CardContent className="p-5 text-center">
              <p className="text-xs font-semibold text-[var(--tm-ink-500)] uppercase tracking-wide mb-1">
                CIBIL Score
              </p>
              <ScoreGauge score={bureau.creditScore} />
            </CardContent>
          </Card>
        )}

        {/* Personal details */}
        <Card className="mb-5">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--tm-ink-100)]">
              <p className="text-xs font-semibold text-[var(--tm-ink-500)] uppercase tracking-wide">
                Personal Details
              </p>
              {basicDetails && (
                <button
                  onClick={handleEditDetails}
                  className="flex items-center gap-1 text-xs font-semibold text-[var(--tm-green-700)] hover:text-[var(--tm-green-500)] transition-colors"
                >
                  <Pencil size={12} /> Edit
                </button>
              )}
            </div>
            <div className="divide-y divide-[var(--tm-ink-100)]">
              {detailRows.map((row) => (
                <div key={row.label} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex-shrink-0">{row.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--tm-ink-400)]">{row.label}</p>
                    <p className="text-sm font-medium text-[var(--tm-ink-900)] truncate">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Eligibility answers */}
        <Card className="mb-5">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--tm-ink-100)]">
              <p className="text-xs font-semibold text-[var(--tm-ink-500)] uppercase tracking-wide">
                Eligibility Answers
              </p>
              {eligibility && (
                <button
                  onClick={handleEditEligibility}
                  className="flex items-center gap-1 text-xs font-semibold text-[var(--tm-green-700)] hover:text-[var(--tm-green-500)] transition-colors"
                >
                  <Pencil size={12} /> Edit
                </button>
              )}
            </div>

            {eligibility ? (
              <div className="divide-y divide-[var(--tm-ink-100)]">
                <div className="flex items-center gap-3 px-5 py-3.5">
                  <Briefcase size={15} className="text-[var(--tm-ink-400)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--tm-ink-400)]">Employment Type</p>
                    <p className="text-sm font-medium text-[var(--tm-ink-900)]">
                      {EMPLOYMENT_LABELS[eligibility.employmentType]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3.5">
                  <Wallet size={15} className="text-[var(--tm-ink-400)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--tm-ink-400)]">Annual Income</p>
                    <p className="text-sm font-medium text-[var(--tm-ink-900)]">
                      {ANNUAL_INCOME_LABELS[eligibility.annualIncome]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3.5">
                  <Users size={15} className="text-[var(--tm-ink-400)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--tm-ink-400)]">Household Income</p>
                    <p className="text-sm font-medium text-[var(--tm-ink-900)]">
                      {FAMILY_INCOME_LABELS[eligibility.familyAnnualIncome]}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-5 py-6 text-center">
                <p className="text-sm text-[var(--tm-ink-500)] mb-3">
                  You haven&apos;t answered the eligibility questions yet.
                </p>
                <Button size="sm" onClick={handleEditEligibility}>
                  Answer now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            size="lg"
            className="w-full text-[var(--tm-danger)] border-[var(--tm-danger)]/30 hover:bg-[var(--tm-danger)]/5"
            onClick={() => { reset(); router.push("/loan/personal"); }}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
