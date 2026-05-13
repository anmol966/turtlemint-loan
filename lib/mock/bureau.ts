import type { BureauProfile } from "@/lib/api/bureau";

const MOCK_PROFILES: Record<string, BureauProfile> = {
  default: {
    fullName: "Rahul Sharma",
    gender: "M",
    dob: "1992-07-15",
    emailMasked: "ra***@gmail.com",
    pincode: "400001",
    panMasked: "DJ******8N",
    creditScore: 745,
    existingObligations: 8500,
  },
  "9999999999": {
    fullName: "Priya Mehta",
    gender: "F",
    dob: "1995-03-22",
    emailMasked: "pr***@yahoo.com",
    pincode: "110001",
    panMasked: "AB******5C",
    creditScore: 580,
    existingObligations: 15000,
  },
};

export function getMockBureauProfile(phone: string): BureauProfile {
  return MOCK_PROFILES[phone] ?? MOCK_PROFILES["default"];
}
