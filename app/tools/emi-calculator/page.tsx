import type { Metadata } from "next";
import { EmiCalculatorClient } from "./EmiCalculatorClient";
import { Header } from "@/components/brand/Header";
import { Footer } from "@/components/brand/Footer";

export const metadata: Metadata = {
  title: "EMI Calculator — Turtlemint Personal Loan",
  description:
    "Calculate your personal loan EMI instantly. Adjust loan amount, interest rate, and tenure to see your monthly EMI, total interest, and amortization schedule.",
};

export default function EmiCalculatorPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--tm-paper)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="mb-8 sm:mb-12">
            <p className="text-sm font-semibold text-[var(--tm-green-700)] mb-2 uppercase tracking-wide">
              Free Tool
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--tm-ink-900)] font-[var(--font-jakarta)] mb-3">
              EMI Calculator
            </h1>
            <p className="text-[var(--tm-ink-500)] text-lg max-w-xl">
              Adjust the sliders to see how your EMI changes with loan amount, tenure, and interest rate.
            </p>
          </div>
          <EmiCalculatorClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
