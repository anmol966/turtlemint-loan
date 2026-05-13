"use client";

import { usePathname } from "next/navigation";
import { FunnelStepper } from "./FunnelStepper";

const STEPS = [
  { label: "Mobile", path: "/loan/personal" },
  { label: "Details", path: "/loan/personal/basic-details" },
  { label: "Offers", path: "/loan/personal/offers" },
];

// Routes past the last stepper step — all stepper nodes render as done
const POST_FUNNEL_PATHS = ["/loan/personal/handoff"];

export function FunnelStepperNav() {
  const pathname = usePathname();

  // Match from most-specific to least-specific: every funnel path starts
  // with /loan/personal so a naive findIndex always returns step 1.
  const matched = [...STEPS]
    .map((s, i) => ({ ...s, index: i }))
    .sort((a, b) => b.path.length - a.path.length)
    .find((s) => pathname === s.path || pathname.startsWith(s.path + "/"));

  const isPostFunnel = POST_FUNNEL_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // current > steps.length renders every step as "done"
  const current = isPostFunnel
    ? STEPS.length + 1
    : (matched?.index ?? 0) + 1;

  return (
    <div className="border-b border-[var(--tm-ink-100)] bg-white">
      <div className="max-w-[480px] mx-auto px-4 py-4">
        <FunnelStepper steps={STEPS} current={current} />
      </div>
    </div>
  );
}
