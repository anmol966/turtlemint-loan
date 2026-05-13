import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--tm-r-pill)] px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--tm-green-50)] text-[var(--tm-green-700)]",
        success: "bg-[var(--tm-chance-high)] text-white",
        warning: "bg-[var(--tm-chance-medium)] text-white",
        danger: "bg-[var(--tm-chance-low)] text-white",
        outline: "border border-[var(--tm-ink-300)] text-[var(--tm-ink-700)]",
        info: "bg-[var(--tm-info)] text-white",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
