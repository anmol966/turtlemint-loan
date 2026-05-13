import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, Zap, Eye } from "lucide-react";

export default function HomePage() {
  return (
    <div className="bg-[var(--tm-paper)]">
      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[var(--tm-green-700)] uppercase tracking-wide mb-4">
            Personal Loan · 100% Digital
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--tm-ink-900)] leading-tight mb-6"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Money when you need it, without the paperwork
          </h1>
          <p className="text-xl text-[var(--tm-ink-500)] mb-8">
            Compare offers from 6+ RBI-licensed lenders in 60 seconds. One soft inquiry, no CIBIL impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="xl">
              <Link href="/loan/personal">
                Check My Loan Eligibility <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/tools/emi-calculator">EMI Calculator</Link>
            </Button>
          </div>
          <p className="text-sm text-[var(--tm-ink-500)] mt-4">
            No impact on credit score · 60 sec process · 5L+ Indians compared offers here
          </p>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-[var(--tm-green-50)] border-y border-[var(--tm-green-300)]/30 py-6">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-[var(--tm-green-700)] text-center mb-4 uppercase tracking-wide">
            Powered by RBI-licensed lenders
          </p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {["SMFG India Credit", "Stashfin", "Moneyview", "Poonawalla Fincorp", "Hero FinCorp", "Kissht"].map((name) => (
              <span key={name} className="text-sm font-semibold text-[var(--tm-ink-500)]">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Why Turtlemint */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16">
        <h2
          className="text-2xl sm:text-3xl font-bold text-[var(--tm-ink-900)] mb-10 text-center"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          Why Turtlemint?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap className="text-[var(--tm-green-500)]" size={28} />,
              title: "Compare 6+ lenders in 60 sec",
              desc: "Get personalised offers from all our partners simultaneously, not one by one.",
            },
            {
              icon: <Eye className="text-[var(--tm-green-500)]" size={28} />,
              title: "Approval chances shown upfront",
              desc: "See your probability of approval before you apply, so you apply smart.",
            },
            {
              icon: <Shield className="text-[var(--tm-green-500)]" size={28} />,
              title: "Soft inquiry, no CIBIL hit",
              desc: "We use a soft bureau pull. Your credit score is completely unaffected.",
            },
          ].map((feat) => (
            <Card key={feat.title} className="p-6">
              <CardContent className="p-0">
                <div className="w-12 h-12 rounded-[var(--tm-r-md)] bg-[var(--tm-green-50)] flex items-center justify-center mb-4">
                  {feat.icon}
                </div>
                <h3 className="font-bold text-[var(--tm-ink-900)] mb-2">{feat.title}</h3>
                <p className="text-sm text-[var(--tm-ink-500)]">{feat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[var(--tm-green-700)] text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-jakarta)" }}>
              Ready to find your best loan?
            </h2>
            <p className="text-[var(--tm-green-300)] text-sm">Takes 60 seconds. No CIBIL impact.</p>
          </div>
          <Button asChild size="xl" className="bg-white text-[var(--tm-green-700)] hover:bg-[var(--tm-green-50)] flex-shrink-0">
            <Link href="/loan/personal">Get Started →</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
