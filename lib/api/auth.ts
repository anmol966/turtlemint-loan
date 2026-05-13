import { delay, MOCK_CONFIG } from "@/lib/mock/config";

let requestIdCounter = 1;

export async function sendOtp(phone: string): Promise<{ requestId: string }> {
  await delay(MOCK_CONFIG.OTP_DELAY_MS);
  const requestId = `otp_${phone}_${requestIdCounter++}`;
  return { requestId };
}

export async function verifyOtp(
  _requestId: string,
  _otp: string
): Promise<{ token: string }> {
  await delay(MOCK_CONFIG.OTP_DELAY_MS);
  return { token: `mock_token_${Date.now()}` };
}
