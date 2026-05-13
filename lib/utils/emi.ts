export function calculateEmi(principal: number, annualRate: number, tenureMonths: number): number {
  const r = annualRate / 12 / 100;
  const n = tenureMonths;
  if (r === 0) return Math.round(principal / n);
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

export function totalInterest(principal: number, annualRate: number, tenureMonths: number): number {
  return calculateEmi(principal, annualRate, tenureMonths) * tenureMonths - principal;
}

export function totalPayable(principal: number, annualRate: number, tenureMonths: number): number {
  return calculateEmi(principal, annualRate, tenureMonths) * tenureMonths;
}

export function calculateApr(annualRate: number, processingFeePercent: number, tenureMonths: number): number {
  return annualRate + (processingFeePercent / 100) * (12 / tenureMonths) * 100;
}

export function amortizationSchedule(
  principal: number,
  annualRate: number,
  tenureMonths: number
): Array<{ month: number; emi: number; principal: number; interest: number; balance: number }> {
  const emi = calculateEmi(principal, annualRate, tenureMonths);
  const r = annualRate / 12 / 100;
  let balance = principal;
  const schedule = [];
  for (let i = 1; i <= tenureMonths; i++) {
    const interestPart = Math.round(balance * r);
    const principalPart = emi - interestPart;
    balance = Math.max(0, balance - principalPart);
    schedule.push({ month: i, emi, principal: principalPart, interest: interestPart, balance });
  }
  return schedule;
}
