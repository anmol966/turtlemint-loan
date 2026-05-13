import Link from "next/link";
import { Logo } from "./Logo";
import { COMPLIANCE_COPY } from "@/lib/copy/compliance";

const LENDER_LINKS = [
  "SMFG India Credit",
  "Stashfin",
  "Moneyview",
  "Poonawalla Fincorp",
  "Hero FinCorp",
  "Kissht",
];

const PRODUCT_LINKS = [
  { label: "Personal Loan", href: "/loan/personal" },
  { label: "EMI Calculator", href: "/tools/emi-calculator" },
  { label: "Credit Score Check", href: "/tools/credit-score" },
  { label: "Improve Credit Score", href: "/tools/improve-credit-score" },
];

const LEGAL_LINKS = [
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Cookie Policy", href: "#" },
];

export function Footer() {
  const { grievanceOfficer, lspDisclosure, rbiRegistration } = COMPLIANCE_COPY;

  return (
    <footer className="bg-[var(--tm-ink-900)] text-[var(--tm-ink-300)] mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand col */}
          <div className="lg:col-span-1">
            <div className="mb-3">
              <Logo size="sm" href="/" />
            </div>
            <p className="text-xs leading-relaxed text-[var(--tm-ink-500)] max-w-xs">
              {lspDisclosure}
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Products</h4>
            <ul className="flex flex-col gap-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-[var(--tm-green-300)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Lender partners */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Lender Partners</h4>
            <ul className="flex flex-col gap-2">
              {LENDER_LINKS.map((name) => (
                <li key={name} className="text-sm">
                  {name}
                </li>
              ))}
            </ul>
          </div>

          {/* Grievance */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Grievance Redressal</h4>
            <address className="not-italic text-xs leading-6">
              <strong className="text-[var(--tm-ink-300)]">{grievanceOfficer.name}</strong>
              <br />
              <a
                href={`mailto:${grievanceOfficer.email}`}
                className="hover:text-[var(--tm-green-300)] transition-colors"
              >
                {grievanceOfficer.email}
              </a>
              <br />
              <a
                href={`tel:${grievanceOfficer.phone}`}
                className="hover:text-[var(--tm-green-300)] transition-colors"
              >
                {grievanceOfficer.phone}
              </a>
              <br />
              <span className="text-[var(--tm-ink-500)]">{grievanceOfficer.address}</span>
            </address>
          </div>
        </div>

        <div className="border-t border-[var(--tm-ink-700)] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-[var(--tm-ink-500)]">{rbiRegistration}</p>
          <div className="flex flex-wrap gap-4">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs hover:text-[var(--tm-green-300)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <p className="text-xs text-[var(--tm-ink-500)] mt-4">
          © {new Date().getFullYear()} Turtlemint. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
