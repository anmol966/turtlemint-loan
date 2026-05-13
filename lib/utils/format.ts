export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRCompact(amount: number): string {
  const trim = (n: number, d: number) => {
    const s = n.toFixed(d);
    return s.replace(/\.?0+$/, "");
  };
  if (amount >= 1_00_00_000) return `₹${trim(amount / 1_00_00_000, 2)}Cr`;
  if (amount >= 1_00_000)    return `₹${trim(amount / 1_00_000, 1)}L`;
  if (amount >= 1_000)       return `₹${trim(amount / 1_000, 1)}K`;
  return `₹${amount}`;
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function maskPan(pan: string): string {
  if (pan.length !== 10) return pan;
  return `${pan.slice(0, 2)}${"*".repeat(6)}${pan.slice(8)}`;
}

export function maskPhone(phone: string): string {
  if (phone.length < 10) return phone;
  return `+91 ${phone.slice(0, 2)}${"*".repeat(6)}${phone.slice(-2)}`;
}
