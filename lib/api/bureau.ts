import { getMockBureauProfile } from "@/lib/mock/bureau";

export type BureauProfile = {
  fullName: string;
  gender?: "M" | "F" | "O";
  dob?: string;
  emailMasked?: string;
  pincode?: string;
  panMasked: string;
  creditScore?: number;
  existingObligations: number;
};

const BUREAU_SERVER_URL =
  process.env.NEXT_PUBLIC_BUREAU_SERVER_URL ?? "http://localhost:3001";

type BureauServerResponse = {
  found: boolean;
  phone: string;
  data: {
    full_name: string | null;
    gender: string | null;
    email: string | null;
    dob: string | null;
    pincode: string | null;
    pan: string | null;
    credit_score: number | null;
  };
};

function dmyToYmd(dmy: string | null | undefined): string | undefined {
  if (!dmy) return undefined;
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(dmy);
  if (!m) return undefined;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function normalizeGender(g: string | null | undefined): "M" | "F" | "O" | undefined {
  if (!g) return undefined;
  const u = g.trim().toUpperCase();
  if (u === "M" || u === "F" || u === "O") return u;
  if (u.startsWith("M")) return "M";
  if (u.startsWith("F")) return "F";
  return "O";
}

function nullable(s: string | null | undefined): string | undefined {
  return s && s.trim() ? s : undefined;
}

export async function fetchBureauProfile(phone: string): Promise<BureauProfile> {
  // Mock only supplies existingObligations (still used by the offers calc).
  // creditScore now comes straight from the bureau server (or is undefined).
  const mock = getMockBureauProfile(phone);

  const res = await fetch(
    `${BUREAU_SERVER_URL}/api/bureau/lookup?phone=${encodeURIComponent(phone)}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`bureau server: ${res.status}`);

  const json = (await res.json()) as BureauServerResponse;
  const d = json.data;

  return {
    fullName: nullable(d.full_name) ?? "",
    gender: normalizeGender(d.gender),
    dob: dmyToYmd(d.dob),
    emailMasked: nullable(d.email),
    pincode: nullable(d.pincode),
    panMasked: nullable(d.pan) ?? "",
    creditScore: d.credit_score ?? undefined,
    existingObligations: mock.existingObligations,
  };
}
