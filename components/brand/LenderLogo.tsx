import { cn } from "@/lib/utils/cn";

const LENDER_LOGOS: Record<string, { abbr: string; bg: string; text: string }> = {
  smfg:       { abbr: "SMFG", bg: "#E3F0FB", text: "#1565C0" },
  stashfin:   { abbr: "SF",   bg: "#FFF0EA", text: "#C2440A" },
  moneyview:  { abbr: "MV",   bg: "#E0FAF5", text: "#007A62" },
  poonawalla: { abbr: "PFL",  bg: "#E8EEF8", text: "#0E3A8A" },
  herofincorp:{ abbr: "HFC",  bg: "#EDE9FB", text: "#5B21B6" },
  kissht:     { abbr: "KS",   bg: "#E8EEF8", text: "#003F7F" },
};

interface Props {
  lenderId: string;
  brandName: string;
  size?: "sm" | "md";
  className?: string;
}

export function LenderLogo({ lenderId, brandName, size = "md", className }: Props) {
  const config = LENDER_LOGOS[lenderId] ?? { abbr: brandName.slice(0, 2).toUpperCase(), bg: "#F0F0F0", text: "#555" };
  const dim = size === "sm" ? "w-8 h-8 text-[10px]" : "w-11 h-11 text-xs";

  return (
    <div
      className={cn("rounded-[var(--tm-r-sm)] flex items-center justify-center font-bold flex-shrink-0", dim, className)}
      style={{ background: config.bg, color: config.text }}
      aria-label={brandName}
      role="img"
    >
      {config.abbr}
    </div>
  );
}
