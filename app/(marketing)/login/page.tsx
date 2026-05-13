"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, LogIn, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/funnel/OtpInput";
import { sendOtp, verifyOtp } from "@/lib/api/auth";
import { fetchBureauProfile } from "@/lib/api/bureau";
import { useFunnelStore } from "@/lib/store/funnel";
import { cn } from "@/lib/utils/cn";

type Stage = "phone" | "otp" | "fetching";

export default function LoginPage() {
  const router = useRouter();
  const { phone: storedPhone, bureau, setPhone, setAuthToken, setBureau } = useFunnelStore();

  // Already signed in — bounce to profile
  useEffect(() => {
    if (storedPhone && bureau) router.replace("/profile");
  }, [storedPhone, bureau, router]);

  const [stage, setStage] = useState<Stage>("phone");
  const [phone, setPhoneInput] = useState(storedPhone ?? "");
  const [phoneError, setPhoneError] = useState("");

  const [requestId, setRequestId] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stage !== "otp") return;
    setResendTimer(30);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [stage, requestId]);

  useEffect(() => {
    if (otp.length === 4 && stage === "otp") handleVerifyOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  function validatePhone(p: string) {
    if (!/^[6-9]\d{9}$/.test(p)) return "Enter a valid 10-digit mobile number";
    return "";
  }

  async function handleSendOtp() {
    const err = validatePhone(phone);
    if (err) { setPhoneError(err); return; }
    setPhoneError("");
    setLoading(true);
    try {
      const res = await sendOtp(phone);
      setRequestId(res.requestId);
      setStage("otp");
      setOtp("");
      setOtpError("");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otp.length < 4) { setOtpError("Enter all 4 digits"); return; }
    setOtpError("");
    setLoading(true);
    try {
      const { token } = await verifyOtp(requestId, otp);
      setAuthToken(token);
      setPhone(phone);
      setStage("fetching");
      const bureauProfile = await fetchBureauProfile(phone);
      setBureau(bureauProfile);
      router.push("/profile");
    } catch {
      setOtpError("Incorrect OTP. Please try again.");
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const res = await sendOtp(phone);
      setRequestId(res.requestId);
      setOtp("");
      setOtpError("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-10 sm:py-16 px-4 max-w-[480px] mx-auto">
      {stage === "fetching" && (
        <Card className="text-center py-12 px-6">
          <CardContent className="p-0 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--tm-green-50)] flex items-center justify-center">
              <Loader2 size={32} className="text-[var(--tm-green-500)] animate-spin" />
            </div>
            <div>
              <p className="font-bold text-[var(--tm-ink-900)] text-lg mb-1">Signing you in</p>
              <p className="text-sm text-[var(--tm-ink-500)]">Loading your profile…</p>
            </div>
            <div className="w-full bg-[var(--tm-ink-100)] rounded-full h-1.5 overflow-hidden mt-2">
              <div className="h-full bg-[var(--tm-green-500)] rounded-full animate-[progress_2.5s_ease-in-out_forwards]" />
            </div>
          </CardContent>
        </Card>
      )}

      {stage !== "fetching" && (
        <Card>
          <CardContent className="p-6 sm:p-8">
            {stage === "phone" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-[var(--tm-green-50)] flex items-center justify-center flex-shrink-0">
                    <LogIn size={20} className="text-[var(--tm-green-700)]" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[var(--tm-ink-900)] mb-1"
                      style={{ fontFamily: "var(--font-jakarta)" }}>
                      Sign in
                    </h1>
                    <p className="text-sm text-[var(--tm-ink-500)]">
                      Verify your mobile number with a 4-digit OTP.
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="text-sm font-semibold text-[var(--tm-ink-700)] block mb-2">
                    Mobile Number
                  </label>
                  <div className="flex">
                    <span className="flex items-center gap-1.5 px-3 bg-[var(--tm-ink-100)] border border-r-0 border-[var(--tm-ink-300)] rounded-l-[var(--tm-r-md)] text-sm font-medium text-[var(--tm-ink-700)] whitespace-nowrap">
                      🇮🇳 +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "");
                        if (v.length > 10 && v.startsWith("91")) v = v.slice(2);
                        if (v.length > 10 && v.startsWith("0")) v = v.slice(1);
                        v = v.slice(0, 10);
                        setPhoneInput(v);
                        if (phoneError) setPhoneError(validatePhone(v));
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSendOtp(); }}
                      placeholder="98765 43210"
                      autoComplete="tel"
                      className={cn(
                        "flex-1 h-11 px-3 text-sm text-[var(--tm-ink-900)] border border-[var(--tm-ink-300)] rounded-r-[var(--tm-r-md)] focus:outline-none focus:ring-2 focus:ring-[var(--tm-green-500)] focus:border-[var(--tm-green-500)] transition-colors",
                        phoneError && "border-[var(--tm-danger)] focus:ring-[var(--tm-danger)]"
                      )}
                      aria-invalid={!!phoneError}
                      aria-describedby={phoneError ? "phone-error" : undefined}
                    />
                  </div>
                  {phoneError && (
                    <p id="phone-error" className="text-xs text-[var(--tm-danger)] mt-1.5" role="alert">{phoneError}</p>
                  )}
                </div>

                <Button size="lg" className="w-full" onClick={handleSendOtp} loading={loading}>
                  Send OTP
                </Button>

                <div className="flex items-center gap-2 text-xs text-[var(--tm-ink-500)] justify-center">
                  <Shield size={13} className="text-[var(--tm-green-500)]" />
                  256-bit encrypted · RBI-compliant
                </div>

                <p className="text-xs text-[var(--tm-ink-500)] text-center pt-2 border-t border-[var(--tm-ink-100)]">
                  New to Turtlemint?{" "}
                  <a href="/loan/personal" className="font-semibold text-[var(--tm-green-700)] hover:text-[var(--tm-green-500)]">
                    Apply for a loan
                  </a>
                </p>
              </div>
            )}

            {stage === "otp" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setStage("phone"); setOtp(""); setOtpError(""); }}
                    className="p-1 rounded-[var(--tm-r-sm)] text-[var(--tm-ink-500)] hover:text-[var(--tm-ink-900)] hover:bg-[var(--tm-ink-100)] transition-colors"
                    aria-label="Back to phone entry"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-[var(--tm-ink-900)]"
                      style={{ fontFamily: "var(--font-jakarta)" }}>
                      Enter OTP
                    </h1>
                    <p className="text-sm text-[var(--tm-ink-500)]">
                      Sent to +91 {phone.slice(0, 5)} {phone.slice(5)}
                    </p>
                  </div>
                </div>

                <OtpInput value={otp} onChange={setOtp} disabled={loading} />

                {otpError && (
                  <p className="text-xs text-[var(--tm-danger)] text-center -mt-2" role="alert">{otpError}</p>
                )}

                <Button size="lg" className="w-full" onClick={handleVerifyOtp} loading={loading}
                  disabled={otp.length < 4}>
                  Verify & Sign in
                </Button>

                <div className="text-center text-sm text-[var(--tm-ink-500)]">
                  {resendTimer > 0 ? (
                    <span>Resend OTP in <strong className="text-[var(--tm-ink-700)]">{resendTimer}s</strong></span>
                  ) : (
                    <button
                      onClick={handleResend}
                      className="font-semibold text-[var(--tm-green-700)] hover:text-[var(--tm-green-500)] transition-colors"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <p className="text-xs text-[var(--tm-ink-500)] text-center">
                  For demo: any 4-digit OTP works
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
