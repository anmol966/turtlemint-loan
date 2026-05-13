"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  calculateEmi,
  totalInterest,
  totalPayable,
  amortizationSchedule,
} from "@/lib/utils/emi";
import { formatINR, formatINRCompact, formatPercent } from "@/lib/utils/format";

const EmiDonutChart = dynamic(
  () => import("./EmiDonutChart").then((m) => m.EmiDonutChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-52 flex items-center justify-center">
        <div className="skeleton w-40 h-40 rounded-full" />
      </div>
    ),
  },
);

const AMOUNT_MIN = 10000;
const AMOUNT_MAX = 2000000; // 20 lakh
const TENURE_MIN = 3;
const TENURE_MAX = 60;
const RATE_MIN = 5;
const RATE_MAX = 40;

function formatAmountInput(val: number): string {
  return val.toLocaleString("en-IN");
}

function parseAmountInput(str: string): number {
  return parseInt(str.replace(/[^0-9]/g, ""), 10) || 0;
}

export function EmiCalculatorClient() {
  const [amount, setAmount] = useState(500000);
  const [tenure, setTenure] = useState(24);
  // Store rate as string so partial values like "15." or "15.5" don't get clamped mid-typing
  const [rateStr, setRateStr] = useState("14");
  const [showBreakdown, setShowBreakdown] = useState(false);

  const rate = parseFloat(rateStr) || 0;

  const emi = useMemo(
    () => calculateEmi(amount, rate, tenure),
    [amount, rate, tenure],
  );
  const interest = useMemo(
    () => totalInterest(amount, rate, tenure),
    [amount, rate, tenure],
  );
  const payable = useMemo(
    () => totalPayable(amount, rate, tenure),
    [amount, rate, tenure],
  );

  const schedule = useMemo(
    () => (showBreakdown ? amortizationSchedule(amount, rate, tenure) : []),
    [amount, rate, tenure, showBreakdown],
  );

  function handleRateInput(raw: string) {
    // Allow digits, one dot, up to 2 decimal places
    const cleaned = raw
      .replace(/[^0-9.]/g, "")
      .replace(/^(\d*\.?\d{0,2}).*$/, "$1");
    setRateStr(cleaned);
  }

  function handleRateBlur() {
    const v = parseFloat(rateStr);
    if (isNaN(v) || v < RATE_MIN) setRateStr(String(RATE_MIN));
    else if (v > RATE_MAX) setRateStr(String(RATE_MAX));
    else setRateStr(String(v));
  }

  function handleRateSlider(v: number) {
    setRateStr(String(v));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
      {/* Sliders panel */}
      <Card>
        <CardContent className="p-6 sm:p-8 flex flex-col gap-8">
          {/* Loan Amount */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[var(--tm-ink-700)]">
                Loan Amount
              </span>
              <div className="flex items-center border border-[var(--tm-ink-300)] rounded-[var(--tm-r-sm)] overflow-hidden">
                <span className="px-2 py-1.5 bg-[var(--tm-ink-100)] text-sm text-[var(--tm-ink-500)] border-r border-[var(--tm-ink-300)]">
                  ₹
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatAmountInput(amount)}
                  onChange={(e) => {
                    const v = parseAmountInput(e.target.value);
                    if (v >= AMOUNT_MIN && v <= AMOUNT_MAX) setAmount(v);
                  }}
                  className="w-28 px-2 py-1.5 text-sm font-semibold text-[var(--tm-ink-900)] tabular-nums focus:outline-none"
                  aria-label="Loan amount"
                />
              </div>
            </div>
            <Slider
              min={AMOUNT_MIN}
              max={AMOUNT_MAX}
              step={10000}
              value={amount}
              onChange={setAmount}
              id="loan-amount"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-[var(--tm-ink-500)]">
                {formatINRCompact(AMOUNT_MIN)}
              </span>
              <span className="text-xs text-[var(--tm-ink-500)]">
                {formatINRCompact(2000000)}
              </span>
            </div>
          </div>

          {/* Tenure */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[var(--tm-ink-700)]">
                Tenure
              </span>
              <div className="flex items-center border border-[var(--tm-ink-300)] rounded-[var(--tm-r-sm)] overflow-hidden">
                <input
                  type="number"
                  min={TENURE_MIN}
                  max={TENURE_MAX}
                  value={tenure}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= TENURE_MIN && v <= TENURE_MAX)
                      setTenure(v);
                  }}
                  className="w-12 px-2 py-1.5 text-sm font-semibold text-[var(--tm-ink-900)] tabular-nums focus:outline-none text-center"
                  aria-label="Tenure in months"
                />
                <span className="px-2 py-1.5 bg-[var(--tm-ink-100)] text-sm text-[var(--tm-ink-500)] border-l border-[var(--tm-ink-300)]">
                  mo
                </span>
              </div>
            </div>
            <Slider
              min={TENURE_MIN}
              max={TENURE_MAX}
              step={1}
              value={tenure}
              onChange={setTenure}
              id="tenure"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-[var(--tm-ink-500)]">
                {TENURE_MIN} months
              </span>
              <span className="text-xs text-[var(--tm-ink-500)]">
                {TENURE_MAX} months
              </span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[var(--tm-ink-700)]">
                Interest Rate (p.a.)
              </span>
              <div className="flex items-center border border-[var(--tm-ink-300)] rounded-[var(--tm-r-sm)] overflow-hidden">
                <input
                  type="text"
                  inputMode="decimal"
                  value={rateStr}
                  onChange={(e) => handleRateInput(e.target.value)}
                  onBlur={handleRateBlur}
                  className="w-16 px-2 py-1.5 text-sm font-semibold text-[var(--tm-ink-900)] tabular-nums focus:outline-none text-center"
                  aria-label="Interest rate"
                />
                <span className="px-2 py-1.5 bg-[var(--tm-ink-100)] text-sm text-[var(--tm-ink-500)] border-l border-[var(--tm-ink-300)]">
                  %
                </span>
              </div>
            </div>
            <Slider
              min={RATE_MIN}
              max={RATE_MAX}
              step={0.5}
              value={Math.min(RATE_MAX, Math.max(RATE_MIN, rate || RATE_MIN))}
              onChange={handleRateSlider}
              id="interest-rate"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-[var(--tm-ink-500)]">
                {RATE_MIN}%
              </span>
              <span className="text-xs text-[var(--tm-ink-500)]">
                {RATE_MAX}%
              </span>
            </div>
          </div>

          {/* Month-wise breakdown toggle */}
          <div>
            <button
              onClick={() => setShowBreakdown((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-[var(--tm-green-700)] hover:text-[var(--tm-green-500)] transition-colors"
              aria-expanded={showBreakdown}
            >
              {showBreakdown ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
              Month-wise breakdown
            </button>

            {showBreakdown && (
              <div className="mt-4 overflow-auto rounded-[var(--tm-r-md)] border border-[var(--tm-ink-100)] max-h-80">
                <table className="w-full text-sm tabular-nums">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[var(--tm-ink-100)]">
                      <th className="px-4 py-2.5 text-left font-semibold text-[var(--tm-ink-700)] whitespace-nowrap">
                        Month
                      </th>
                      <th className="px-4 py-2.5 text-right font-semibold text-[var(--tm-ink-700)] whitespace-nowrap">
                        Principal
                      </th>
                      <th className="px-4 py-2.5 text-right font-semibold text-[var(--tm-ink-700)] whitespace-nowrap">
                        Interest Charged
                      </th>
                      <th className="px-4 py-2.5 text-right font-semibold text-[var(--tm-ink-700)] whitespace-nowrap">
                        Total Payment
                      </th>
                      <th className="px-4 py-2.5 text-right font-semibold text-[var(--tm-ink-700)] whitespace-nowrap">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row) => (
                      <tr
                        key={row.month}
                        className="border-t border-[var(--tm-ink-100)] hover:bg-[var(--tm-green-50)] transition-colors"
                      >
                        <td className="px-4 py-2.5 font-medium text-[var(--tm-ink-700)]">
                          {row.month}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[var(--tm-success)]">
                          {formatINR(row.principal)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[var(--tm-warning)]">
                          {formatINR(row.interest)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[var(--tm-ink-900)] font-medium">
                          {formatINR(row.emi)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[var(--tm-ink-500)]">
                          {formatINR(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results + Chart panel */}
      <div className="flex flex-col gap-4">
        <Card className="bg-[var(--tm-green-700)] text-white border-0 shadow-[var(--tm-shadow-glow)]">
          <CardContent className="p-6 sm:p-8">
            <p className="text-sm font-medium text-[var(--tm-green-300)] mb-1">
              Monthly EMI
            </p>
            <p className="text-4xl sm:text-5xl font-bold tabular-nums mb-6">
              {formatINR(emi)}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--tm-green-300)] mb-0.5">
                  Total Interest
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {formatINR(interest)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--tm-green-300)] mb-0.5">
                  Total Payable
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {formatINR(payable)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-[var(--tm-ink-700)] mb-4 text-center">
              Principal vs Interest
            </p>
            <EmiDonutChart
              principal={amount}
              interest={interest}
              payable={payable}
            />
          </CardContent>
        </Card>

        <Card className="bg-[var(--tm-green-50)] border-[var(--tm-green-300)] border">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-[var(--tm-green-900)] mb-1">
              Like what you see?
            </p>
            <p className="text-xs text-[var(--tm-green-700)] mb-4">
              Find lenders offering {formatPercent(rate)} or lower for your
              profile.
            </p>
            <Button asChild size="md" className="w-full">
              <Link href="/loan/personal">Find My Best Loan →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
