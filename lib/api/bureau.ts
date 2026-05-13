import { getMockBureauProfile } from "@/lib/mock/bureau";
import { delay, MOCK_CONFIG } from "@/lib/mock/config";

export type BureauProfile = {
  fullName: string;
  gender?: "M" | "F" | "O";
  dob?: string;
  emailMasked?: string;
  pincode?: string;
  panMasked: string;
  creditScore: number;
  existingObligations: number;
};

export async function fetchBureauProfile(phone: string): Promise<BureauProfile> {
  await delay(MOCK_CONFIG.BUREAU_FETCH_DELAY_MS);
  return getMockBureauProfile(phone);
}
