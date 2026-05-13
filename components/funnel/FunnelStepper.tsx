import { cn } from "@/lib/utils/cn";
import { Check } from "lucide-react";

type Step = { label: string };

interface Props {
  steps: Step[];
  current: number; // 1-indexed
}

export function FunnelStepper({ steps, current }: Props) {
  return (
    <nav aria-label="Application progress" className="w-full">
      <ol className="flex items-center w-full">
        {steps.map((step, idx) => {
          const num = idx + 1;
          const done = num < current;
          const active = num === current;

          return (
            <li key={step.label} className="flex items-center flex-1 last:flex-none">
              {/* Node */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all",
                    done && "bg-[var(--tm-green-500)] border-[var(--tm-green-500)] text-white",
                    active && "bg-white border-[var(--tm-green-500)] text-[var(--tm-green-700)]",
                    !done && !active && "bg-white border-[var(--tm-ink-300)] text-[var(--tm-ink-500)]"
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Check size={14} strokeWidth={3} /> : num}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:block whitespace-nowrap",
                    active ? "text-[var(--tm-green-700)]" : done ? "text-[var(--tm-green-500)]" : "text-[var(--tm-ink-500)]"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector — skip after last step */}
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 rounded-full transition-all",
                    done ? "bg-[var(--tm-green-500)]" : "bg-[var(--tm-ink-300)]"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
