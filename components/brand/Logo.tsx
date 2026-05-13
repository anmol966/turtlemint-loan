import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

const sizes = {
  sm: { text: "text-xl", mark: 28 },
  md: { text: "text-2xl", mark: 34 },
  lg: { text: "text-3xl", mark: 42 },
};

function TurtleMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 42 42"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Shell */}
      <rect x="4" y="10" width="28" height="28" rx="9" fill="#1B7A5A" transform="rotate(-8 18 24)" />
      {/* Head */}
      <ellipse cx="34" cy="10" rx="8" ry="9.5" fill="#2BB673" transform="rotate(12 34 10)" />
      {/* Flipper */}
      <ellipse cx="37" cy="24" rx="5" ry="3.5" fill="#2BB673" transform="rotate(28 37 24)" opacity="0.75" />
    </svg>
  );
}

export function Logo({ className, size = "md", href = "/" }: LogoProps) {
  const { text, mark } = sizes[size];

  const content = (
    <span className={cn("flex items-center gap-1.5", className)}>
      <span
        className={cn("font-bold text-[var(--tm-green-500)] tracking-tight leading-none", text)}
        style={{ fontFamily: "var(--font-jakarta), var(--font-inter), system-ui, sans-serif" }}
      >
        turtlemint
      </span>
      <TurtleMark size={mark} />
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Turtlemint — Home">
        {content}
      </Link>
    );
  }
  return content;
}
