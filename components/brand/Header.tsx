"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { label: "Personal Loan", href: "/loan/personal" },
  { label: "EMI Calculator", href: "/tools/emi-calculator" },
  { label: "Credit Score", href: "/tools/credit-score" },
  { label: "About", href: "#about" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-white transition-shadow duration-200",
        scrolled && "shadow-[var(--tm-shadow-md)]"
      )}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Logo size="md" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 rounded-[var(--tm-r-sm)] text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-[var(--tm-green-700)] bg-[var(--tm-green-50)]"
                  : "text-[var(--tm-ink-700)] hover:text-[var(--tm-green-700)] hover:bg-[var(--tm-green-50)]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <UserMenu />
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-[var(--tm-r-sm)] text-[var(--tm-ink-700)] hover:bg-[var(--tm-ink-100)]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--tm-ink-100)] bg-white px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-2" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2.5 rounded-[var(--tm-r-sm)] text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-[var(--tm-green-700)] bg-[var(--tm-green-50)]"
                    : "text-[var(--tm-ink-700)] hover:bg-[var(--tm-ink-100)]"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 w-full [&>*]:w-full [&_button]:w-full [&_a]:w-full">
              <UserMenu />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
