export const MOCK_CONFIG = {
  OTP_DELAY_MS: 800,
  BUREAU_FETCH_DELAY_MS: 2500,
  OFFERS_FETCH_DELAY_MS: 2000,
  PINCODE_DELAY_MS: 600,
  ERROR_RATE: 0,
} as const;

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
