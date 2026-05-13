"use client";

import { Logo } from "@/components/brand/Logo";
import { UserMenu } from "@/components/brand/UserMenu";

export function FunnelHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-[var(--tm-shadow-md)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo size="md" />
        <UserMenu />
      </div>
    </header>
  );
}
