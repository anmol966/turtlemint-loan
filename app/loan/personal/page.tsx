"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Shield, ChevronLeft, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/funnel/OtpInput";
import { sendOtp, verifyOtp } from "@/lib/api/auth";
import { fetchBureauProfile } from "@/lib/api/bureau";
import { useFunnelStore } from "@/lib/store/funnel";
import { useNavigationGuard } from "@/lib/hooks/useNavigationGuard";
import { cn } from "@/lib/utils/cn";

type Stage = "phone" | "otp" | "fetching";

export default function PhoneOtpPage() {
  const router = useRouter();
  const { phone: storedPhone, setPhone, setAuthToken, setBureau } = useFunnelStore();

  const [stage, setStage] = useState<Stage>("phone");
  const [phone, setPhoneInput] = useState(storedPhone ?? "");
  const [consent, setConsent] = useState(true);
  const [phoneError, setPhoneError] = useState("");

  const [requestId, setRequestId] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [loading, setLoading] = useState(false);

  // Guard: warn on page leave while filling
  useNavigationGuard(stage !== "phone" || phone.length > 0);

  // Resend countdown
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

  // Auto-submit OTP when all 4 digits entered
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
    if (!consent) { setPhoneError("Please authorise the bureau check to continue"); return; }
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
      const bureau = await fetchBureauProfile(phone);
      setBureau(bureau);
      router.push("/loan/personal/basic-details");
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
    <div className="py-6 sm:py-10 px-4 max-w-[480px] mx-auto">
      {/* Fetching bureau overlay */}
      {stage === "fetching" && (
        <Card className="text-center py-12 px-6">
          <CardContent className="p-0 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--tm-green-50)] flex items-center justify-center">
              <Loader2 size={32} className="text-[var(--tm-green-500)] animate-spin" />
            </div>
            <div>
              <p className="font-bold text-[var(--tm-ink-900)] text-lg mb-1">Fetching your credit profile</p>
              <p className="text-sm text-[var(--tm-ink-500)]">Securely connecting to CIBIL… this takes a moment</p>
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
            {/* Phone entry */}
            {stage === "phone" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-2xl font-bold text-[var(--tm-ink-900)] mb-1"
                    style={{ fontFamily: "var(--font-jakarta)" }}>
                    Let&apos;s start with your mobile number
                  </h1>
                  <p className="text-sm text-[var(--tm-ink-500)]">
                    We&apos;ll fetch your eligibility instantly.{" "}
                    <span className="text-[var(--tm-green-700)] font-medium">No impact on your credit score.</span>
                  </p>
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
                      aria-describedby={phoneError ? "phone-error" : undefined}
                      aria-invalid={!!phoneError}
                    />
                  </div>
                  {phoneError && (
                    <p id="phone-error" className="text-xs text-[var(--tm-danger)] mt-1.5" role="alert">{phoneError}</p>
                  )}
                </div>

                {/* Consent */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-[var(--tm-green-500)] flex-shrink-0"
                  />
                  <span className="text-xs text-[var(--tm-ink-500)] leading-relaxed group-hover:text-[var(--tm-ink-700)] transition-colors">
                    I authorise Turtlemint and its partner lenders to fetch my credit report from credit bureaus (CIBIL, Experian) for personal loan eligibility assessment. This is a{" "}
                    <strong className="text-[var(--tm-ink-700)]">soft inquiry</strong> — no impact on my credit score.
                  </span>
                </label>

                <Button size="lg" className="w-full" onClick={handleSendOtp} loading={loading}>
                  Send OTP
                </Button>

                <div className="flex items-center gap-2 text-xs text-[var(--tm-ink-500)] justify-center">
                  <Shield size={13} className="text-[var(--tm-green-500)]" />
                  256-bit encrypted · RBI-compliant · No CIBIL impact
                </div>
              </div>
            )}

            {/* OTP entry */}
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
                  Verify OTP
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
