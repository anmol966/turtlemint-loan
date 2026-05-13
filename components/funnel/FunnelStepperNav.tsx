"use client";

import { usePathname } from "next/navigation";
import { FunnelStepper } from "./FunnelStepper";

const STEPS = [
  { label: "Mobile", path: "/loan/personal" },
  { label: "Details", path: "/loan/personal/basic-details" },
  { label: "Offers", path: "/loan/personal/offers" },
];

export function FunnelStepperNav() {
  const pathname = usePathname();
  const current = Math.max(
    1,
    STEPS.findIndex((s) => pathname === s.path || pathname.startsWith(s.path + "/")) + 1
  );

  return (
    <div className="border-b border-[var(--tm-ink-100)] bg-white">
      <div className="max-w-[480px] mx-auto px-4 py-4">
        <FunnelStepper steps={STEPS} current={current} />
      </div>
    </div>
  );
}
