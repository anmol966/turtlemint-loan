import { delay, MOCK_CONFIG } from "@/lib/mock/config";

const PINCODE_MAP: Record<string, { city: string; state: string }> = {
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "400051": { city: "Bandra", state: "Maharashtra" },
  "110001": { city: "New Delhi", state: "Delhi" },
  "110011": { city: "New Delhi", state: "Delhi" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "411001": { city: "Pune", state: "Maharashtra" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "302001": { city: "Jaipur", state: "Rajasthan" },
  "226001": { city: "Lucknow", state: "Uttar Pradesh" },
};

export async function lookupPincode(
  pin: string
): Promise<{ city: string; state: string } | null> {
  await delay(MOCK_CONFIG.PINCODE_DELAY_MS);
  return PINCODE_MAP[pin] ?? null;
}
