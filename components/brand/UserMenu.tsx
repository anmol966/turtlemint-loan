"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, ChevronDown, LogOut, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useFunnelStore } from "@/lib/store/funnel";
import { cn } from "@/lib/utils/cn";

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

export function UserMenu() {
  const { phone, bureau, reset } = useFunnelStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Hide the Login button on the login page or while filling the application
  const hideLogin = pathname === "/login" || pathname === "/loan/personal";
  const isLoggedIn = !!(phone && bureau);

  if (!isLoggedIn) {
    if (hideLogin) return null;
    return (
      <Button asChild size="md" variant="outline" className="px-4">
        <Link href="/login">Login</Link>
      </Button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--tm-r-md)] hover:bg-[var(--tm-ink-100)] transition-colors"
        aria-label="Open profile menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-[var(--tm-green-50)] border-2 border-[var(--tm-green-300)] flex items-center justify-center">
          <User size={15} className="text-[var(--tm-green-700)]" />
        </div>
        <span className="hidden sm:block text-sm font-semibold text-[var(--tm-ink-700)] max-w-[120px] truncate">
          {bureau.fullName.split(" ")[0]}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-[var(--tm-ink-400)] transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-72 bg-white rounded-[var(--tm-r-lg)] shadow-[var(--tm-shadow-lg)] border border-[var(--tm-ink-100)] overflow-hidden z-50"
          role="menu"
        >
          <div className="p-4 bg-[var(--tm-ink-100)]/40 border-b border-[var(--tm-ink-100)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--tm-green-50)] border-2 border-[var(--tm-green-300)] flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-[var(--tm-green-700)]" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[var(--tm-ink-900)] text-sm leading-tight truncate">
                  {bureau.fullName}
                </p>
                <p className="text-xs text-[var(--tm-ink-500)] mt-0.5">
                  +91 {phone.slice(0, 5)} {phone.slice(5)}
                </p>
                <p className="text-xs text-[var(--tm-ink-500)]">{bureau.panMasked}</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-[var(--tm-ink-100)] flex items-center justify-between">
            <span className="text-xs text-[var(--tm-ink-500)] font-medium">CIBIL Score</span>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-bold tabular-nums"
                style={{ color: scoreColor(bureau.creditScore) }}
              >
                {bureau.creditScore}
              </span>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[var(--tm-r-sm)]"
                style={{
                  color: scoreColor(bureau.creditScore),
                  background: scoreColor(bureau.creditScore) + "18",
                }}
              >
                {scoreLabel(bureau.creditScore)}
              </span>
            </div>
          </div>

          <div className="p-2">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-[var(--tm-r-sm)] text-sm text-[var(--tm-ink-700)] hover:bg-[var(--tm-ink-100)] transition-colors"
              role="menuitem"
            >
              <ExternalLink size={14} className="text-[var(--tm-ink-400)]" />
              More details
            </Link>
            <button
              onClick={() => {
                reset();
                setOpen(false);
                router.push("/");
              }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-[var(--tm-r-sm)] text-sm text-[var(--tm-danger)] hover:bg-[var(--tm-danger)]/5 transition-colors"
              role="menuitem"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
