"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, FileText, Lock, MapPin, ShieldCheck, Banknote,
  IdCard, ChevronLeft, Loader2, ExternalLink, AlertCircle,
  Camera, Upload, X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { LenderLogo } from "@/components/brand/LenderLogo";
import { KfsSheet } from "@/components/offers/KfsSheet";
import { useFunnelStore } from "@/lib/store/funnel";
import { calculateEmi } from "@/lib/utils/emi";
import { formatINR, formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type Stage =
  | "configure"
  | "kyc-redirect"
  | "kyc-confirm"
  | "address"
  | "bank"
  | "enach-redirect"
  | "enach-confirm"
  | "agreement"
  | "otp"
  | "submitting"
  | "success";

const STAGE_GROUPS: Array<{ label: string; stages: Stage[] }> = [
  { label: "Loan Offer",    stages: ["configure"] },
  { label: "KYC Details",   stages: ["kyc-redirect", "kyc-confirm", "address"] },
  { label: "Bank Details",  stages: ["bank", "enach-redirect", "enach-confirm"] },
  { label: "Agreement",     stages: ["agreement", "otp"] },
  { label: "Disbursed",     stages: ["submitting", "success"] },
];

const BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Canara Bank",
  "Bank of Baroda",
  "Punjab National Bank",
  "IDFC FIRST Bank",
  "Yes Bank",
];

const IFSC_BANK_BY_PREFIX: Record<string, string> = {
  SBIN: "State Bank of India",
  HDFC: "HDFC Bank",
  ICIC: "ICICI Bank",
  UTIB: "Axis Bank",
  KKBK: "Kotak Mahindra Bank",
  CNRB: "Canara Bank",
  BARB: "Bank of Baroda",
  PUNB: "Punjab National Bank",
  IDFB: "IDFC FIRST Bank",
  YESB: "Yes Bank",
};

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const maxSide = 1600;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (Math.max(w, h) > maxSide) {
        const r = maxSide / Math.max(w, h);
        w = Math.round(w * r);
        h = Math.round(h * r);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("canvas-context")); return; }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("canvas-toBlob"))),
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("image-load")); };
    img.src = objectUrl;
  });
}

function StageHeader({ stage }: { stage: Stage }) {
  const currentIdx = STAGE_GROUPS.findIndex((g) => g.stages.includes(stage));
  return (
    <div className="bg-white border-b border-[var(--tm-ink-100)] py-3 px-4">
      <div className="max-w-[640px] mx-auto flex items-center justify-between gap-2 text-[10px] sm:text-xs">
        {STAGE_GROUPS.map((g, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={g.label} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition",
                  done && "bg-[var(--tm-green-500)] border-[var(--tm-green-500)] text-white",
                  active && "bg-white border-[var(--tm-green-500)] text-[var(--tm-green-700)]",
                  !done && !active && "bg-white border-[var(--tm-ink-300)] text-[var(--tm-ink-500)]"
                )}
              >
                {done ? "✓" : i + 1}
              </div>
              <span className={cn("font-medium whitespace-nowrap hidden sm:block",
                active ? "text-[var(--tm-green-700)]" : done ? "text-[var(--tm-green-500)]" : "text-[var(--tm-ink-500)]"
              )}>
                {g.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-6 sm:py-8 px-4 max-w-[560px] mx-auto">
      <Card>
        <CardContent className="p-6 sm:p-8">{children}</CardContent>
      </Card>
    </div>
  );
}

export default function SmfgApplyPage() {
  const router = useRouter();
  const { bureau, phone, basicDetails, cachedOffers } = useFunnelStore();
  const offer = cachedOffers?.matched.find((o) => o.lender.id === "smfg");

  useEffect(() => {
    if (!offer || !bureau) router.replace("/loan/personal/offers");
  }, [offer, bureau, router]);

  const [stage, setStage] = useState<Stage>("configure");

  // ---------- Loan config ----------
  const minLoan = offer ? Math.max(offer.lender.minLoan, 50_000) : 50_000;
  const maxLoan = offer?.approvedAmount ?? 500_000;
  const [loanAmount, setLoanAmount] = useState(maxLoan);
  const [tenure, setTenure] = useState(36);
  const tenureOptions = useMemo(() => {
    if (!offer) return [36, 24, 12];
    const out: number[] = [];
    for (const t of [12, 24, 36, 48, 60]) {
      if (t >= offer.tenure.min && t <= offer.tenure.max) out.push(t);
    }
    const list = out.length ? out : [Math.min(36, offer.tenure.max)];
    return list.reverse();
  }, [offer]);

  useEffect(() => { setLoanAmount(maxLoan); }, [maxLoan]);

  const emi = offer ? calculateEmi(loanAmount, offer.rate, tenure) : 0;
  const processingFee = offer ? Math.round((loanAmount * offer.fee) / 100) : 0;
  const gstOnPf = Math.round(processingFee * 0.18);
  const stampDuty = 100;
  const upfrontDeductions = processingFee + gstOnPf + stampDuty;
  const netDisbursal = loanAmount - upfrontDeductions;

  // ---------- KYC redirect (simulated) ----------
  useEffect(() => {
    if (stage === "kyc-redirect") {
      const t = setTimeout(() => setStage("kyc-confirm"), 1800);
      return () => clearTimeout(t);
    }
    if (stage === "enach-redirect") {
      const t = setTimeout(() => setStage("enach-confirm"), 1800);
      return () => clearTimeout(t);
    }
    if (stage === "submitting") {
      const t = setTimeout(() => setStage("success"), 2400);
      return () => clearTimeout(t);
    }
  }, [stage]);

  // ---------- Address state ----------
  const currentAddress = useMemo(() => {
    const pin = basicDetails?.pincode ?? bureau?.pincode ?? "";
    return pin ? `Resident at Pincode ${pin}, India` : "Address as per Aadhaar";
  }, [basicDetails, bureau]);
  const [corrSameAsCurrent, setCorrSameAsCurrent] = useState(true);
  const [corrLine1, setCorrLine1] = useState("");
  const [corrLine2, setCorrLine2] = useState("");
  const [corrPincode, setCorrPincode] = useState(basicDetails?.pincode ?? "");

  // ---------- Bank state ----------
  const [bank, setBank] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [acctNo, setAcctNo] = useState("");
  const [acctNoConfirm, setAcctNoConfirm] = useState("");
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "ok" | "partial" | "error">("idle");
  const [scanMessage, setScanMessage] = useState<string>("");
  const proofCameraRef = useRef<HTMLInputElement | null>(null);
  const proofFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => () => { if (proofPreview) URL.revokeObjectURL(proofPreview); }, [proofPreview]);

  async function handleProofFile(file: File | null | undefined) {
    if (!file) return;
    if (proofPreview) URL.revokeObjectURL(proofPreview);
    setProofPreview(URL.createObjectURL(file));
    setProofFileName(file.name);
    setScanStatus("scanning");
    setScanMessage("Reading your bank details…");

    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append("file", new File([compressed], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" }));
      const res = await fetch("/api/scan-bank-doc", { method: "POST", body: fd });
      const json = (await res.json()) as {
        ifsc?: string | null;
        accountNumber?: string | null;
        bankName?: string | null;
        error?: string;
      };

      if (!res.ok) {
        setScanStatus("error");
        setScanMessage(json.error ?? "Couldn't read the photo. Please enter details manually.");
        return;
      }

      let filledIfsc = false;
      let filledAcct = false;
      let filledBank = false;
      if (json.ifsc) {
        setIfsc(json.ifsc);
        filledIfsc = true;
        const prefix = json.ifsc.slice(0, 4).toUpperCase();
        const mapped = IFSC_BANK_BY_PREFIX[prefix];
        if (mapped && BANKS.includes(mapped)) {
          setBank(mapped);
          filledBank = true;
        }
      }
      if (json.accountNumber) {
        setAcctNo(json.accountNumber);
        setAcctNoConfirm(json.accountNumber);
        filledAcct = true;
      }

      if (filledIfsc && filledAcct) {
        setScanStatus("ok");
        setScanMessage(`Filled IFSC${filledBank ? ", bank" : ""} and account number — please verify`);
      } else if (filledIfsc || filledAcct) {
        setScanStatus("partial");
        setScanMessage(
          filledIfsc
            ? "Read the IFSC. Please enter the account number manually."
            : "Read the account number. Please enter the IFSC manually."
        );
      } else {
        setScanStatus("error");
        setScanMessage("Couldn't read the photo. Please retake or enter manually.");
      }
    } catch {
      setScanStatus("error");
      setScanMessage("Couldn't process the photo. Please enter details manually.");
    }
  }
  function clearProof() {
    if (proofPreview) URL.revokeObjectURL(proofPreview);
    setProofPreview(null);
    setProofFileName(null);
    setScanStatus("idle");
    setScanMessage("");
    if (proofCameraRef.current) proofCameraRef.current.value = "";
    if (proofFileRef.current) proofFileRef.current.value = "";
  }
  const ifscOk = /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc);
  const acctOk = /^\d{9,18}$/.test(acctNo);
  const acctMatchOk = acctNo === acctNoConfirm;
  const bankValid = bank && ifscOk && acctOk && acctMatchOk;

  const bankBlockers: string[] = [];
  if (!bank) bankBlockers.push("Choose your bank");
  if (!ifscOk) bankBlockers.push(ifsc ? "IFSC format looks wrong" : "Enter the IFSC code");
  if (!acctOk) bankBlockers.push(acctNo ? "Account number must be 9–18 digits" : "Enter your account number");
  if (acctNo && acctNoConfirm && !acctMatchOk) bankBlockers.push("Account numbers do not match");
  else if (acctOk && !acctNoConfirm) bankBlockers.push("Re-enter the account number to confirm");
  const [umrn] = useState(() => `UMRN${Math.floor(Math.random() * 9e15 + 1e15)}`);

  // ---------- Agreement state ----------
  const [readKfs, setReadKfs] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [kfsOpen, setKfsOpen] = useState(false);

  // ---------- OTP state ----------
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const otpRef = useRef<HTMLInputElement | null>(null);

  if (!offer || !bureau) return null;

  function back(target: Stage) { setStage(target); }
  function goAgreementSubmit() {
    if (otp.length !== 6) { setOtpError("Enter the 6-digit OTP"); return; }
    setOtpError("");
    setStage("submitting");
  }

  return (
    <>
      <StageHeader stage={stage} />

      {kfsOpen && (
        <KfsSheet lender={offer.lender} offer={offer} onClose={() => setKfsOpen(false)} />
      )}

      {/* STAGE: configure */}
      {stage === "configure" && (
        <CardShell>
          <div className="flex items-center gap-3 mb-5">
            <LenderLogo lenderId="smfg" brandName="SMFG India Credit" size="md" />
            <div>
              <p className="text-[11px] text-[var(--tm-ink-500)]">Loan Partner</p>
              <p className="font-bold text-[var(--tm-ink-900)]">SMFG India Credit</p>
            </div>
          </div>

          <h1 className="text-xl font-bold text-[var(--tm-ink-900)] mb-1"
              style={{ fontFamily: "var(--font-jakarta)" }}>
            Choose Loan Amount
          </h1>
          <p className="text-3xl font-bold text-[var(--tm-green-700)] tabular-nums mt-2 mb-3">
            {formatINR(loanAmount)}
          </p>
          <Slider min={minLoan} max={maxLoan} step={10_000} value={loanAmount} onChange={setLoanAmount} />
          <div className="flex justify-between text-xs text-[var(--tm-ink-500)] mt-1 mb-6">
            <span>{formatINR(minLoan)}</span>
            <span>{formatINR(maxLoan)}</span>
          </div>

          <p className="text-sm font-semibold text-[var(--tm-ink-700)] mb-2">Select EMI and Tenure</p>
          <p className="text-xs text-[var(--tm-ink-500)] mb-3">Rate of interest at {formatPercent(offer.rate)} per annum</p>
          <div className="flex flex-col gap-2 mb-6">
            {tenureOptions.map((t) => {
              const e = calculateEmi(loanAmount, offer.rate, t);
              const active = tenure === t;
              return (
                <button
                  key={t}
                  onClick={() => setTenure(t)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-[var(--tm-r-md)] border-2 transition",
                    active
                      ? "border-[var(--tm-green-500)] bg-[var(--tm-green-50)]"
                      : "border-[var(--tm-ink-300)] hover:border-[var(--tm-green-300)]"
                  )}
                  aria-pressed={active}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2",
                      active ? "border-[var(--tm-green-500)]" : "border-[var(--tm-ink-300)]"
                    )}>
                      {active && <div className="w-2 h-2 rounded-full bg-[var(--tm-green-500)] m-0.5" />}
                    </div>
                    <span className="text-sm font-semibold text-[var(--tm-ink-900)]">{t} Months</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-[var(--tm-ink-900)]">{formatINR(e)} / month</span>
                </button>
              );
            })}
          </div>

          <Button size="lg" className="w-full" onClick={() => setStage("kyc-redirect")}>
            Submit
          </Button>
        </CardShell>
      )}

      {/* STAGE: kyc-redirect (simulated DigiLocker) */}
      {stage === "kyc-redirect" && (
        <CardShell>
          <div className="text-center flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-[var(--tm-green-50)] flex items-center justify-center">
              <ShieldCheck size={32} className="text-[var(--tm-green-500)]" />
            </div>
            <div>
              <p className="font-bold text-[var(--tm-ink-900)] text-lg mb-1">Completing KYC via DigiLocker</p>
              <p className="text-sm text-[var(--tm-ink-500)] max-w-sm">
                In production, you would sign in to DigiLocker with your Aadhaar-linked mobile and a 6-digit PIN, then approve Aadhaar sharing.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[var(--tm-ink-500)]">
              <Loader2 size={16} className="animate-spin text-[var(--tm-green-500)]" />
              <span className="text-sm">Fetching Aadhaar from DigiLocker…</span>
            </div>
          </div>
        </CardShell>
      )}

      {/* STAGE: kyc-confirm */}
      {stage === "kyc-confirm" && (
        <CardShell>
          <button onClick={() => back("configure")}
            className="flex items-center gap-1 text-sm text-[var(--tm-ink-500)] hover:text-[var(--tm-ink-900)] mb-4">
            <ChevronLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3 mb-4">
            <IdCard size={20} className="text-[var(--tm-green-700)]" />
            <h1 className="text-xl font-bold text-[var(--tm-ink-900)]"
              style={{ fontFamily: "var(--font-jakarta)" }}>
              Confirm Your KYC Details
            </h1>
          </div>
          <p className="text-sm text-[var(--tm-ink-500)] mb-5">
            We&apos;ve fetched the following information from your DigiLocker / Aadhaar record.
          </p>

          <dl className="bg-[var(--tm-ink-100)]/40 rounded-[var(--tm-r-md)] divide-y divide-[var(--tm-ink-100)] mb-6">
            {[
              ["Full Name", bureau.fullName],
              ["Aadhaar Number", "XXXX XXXX " + (bureau.panMasked.slice(-4) || "2843")],
              ["Date of Birth", basicDetails?.dob ?? (bureau.dob ? bureau.dob.split("-").reverse().join("/") : "—")],
              ["Gender", basicDetails?.gender === "M" ? "Male" : basicDetails?.gender === "F" ? "Female" : "Other"],
              ["Address", currentAddress],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-xs text-[var(--tm-ink-500)]">{k}</dt>
                <dd className="text-sm font-semibold text-[var(--tm-ink-900)] text-right">{v}</dd>
              </div>
            ))}
          </dl>

          <Button size="lg" className="w-full" onClick={() => setStage("address")}>
            Confirm
          </Button>
        </CardShell>
      )}

      {/* STAGE: address */}
      {stage === "address" && (
        <CardShell>
          <button onClick={() => back("kyc-confirm")}
            className="flex items-center gap-1 text-sm text-[var(--tm-ink-500)] hover:text-[var(--tm-ink-900)] mb-4">
            <ChevronLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={20} className="text-[var(--tm-green-700)]" />
            <h1 className="text-xl font-bold text-[var(--tm-ink-900)]"
              style={{ fontFamily: "var(--font-jakarta)" }}>
              Confirm Your Address
            </h1>
          </div>

          <label className="text-sm font-semibold text-[var(--tm-ink-700)] block mb-1.5">
            Current Address (from KYC)
          </label>
          <div className="w-full px-3.5 py-3 rounded-[var(--tm-r-md)] border border-[var(--tm-ink-300)] bg-[var(--tm-ink-100)] text-sm text-[var(--tm-ink-700)] mb-5">
            {currentAddress}
          </div>

          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={corrSameAsCurrent}
              onChange={(e) => setCorrSameAsCurrent(e.target.checked)}
              className="w-4 h-4 accent-[var(--tm-green-500)]"
            />
            <span className="text-sm text-[var(--tm-ink-700)]">
              Correspondence address is same as current
            </span>
          </label>

          {!corrSameAsCurrent && (
            <div className="flex flex-col gap-3 mb-5">
              <input
                type="text"
                value={corrLine1}
                onChange={(e) => setCorrLine1(e.target.value)}
                placeholder="House / Flat number"
                className="w-full h-11 px-3.5 rounded-[var(--tm-r-md)] border border-[var(--tm-ink-300)] text-sm placeholder:text-[var(--tm-ink-300)] focus:outline-none focus:ring-2 focus:ring-[var(--tm-green-500)] focus:border-[var(--tm-green-500)]"
              />
              <input
                type="text"
                value={corrLine2}
                onChange={(e) => setCorrLine2(e.target.value)}
                placeholder="Street / Area"
                className="w-full h-11 px-3.5 rounded-[var(--tm-r-md)] border border-[var(--tm-ink-300)] text-sm placeholder:text-[var(--tm-ink-300)] focus:outline-none focus:ring-2 focus:ring-[var(--tm-green-500)] focus:border-[var(--tm-green-500)]"
              />
              <input
                type="text"
                value={corrPincode}
                onChange={(e) => setCorrPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Pincode"
                inputMode="numeric"
                maxLength={6}
                className="w-full h-11 px-3.5 rounded-[var(--tm-r-md)] border border-[var(--tm-ink-300)] text-sm placeholder:text-[var(--tm-ink-300)] focus:outline-none focus:ring-2 focus:ring-[var(--tm-green-500)] focus:border-[var(--tm-green-500)]"
              />
            </div>
          )}

          {(() => {
            const addressBlockers: string[] = [];
            if (!corrSameAsCurrent) {
              if (corrLine1.length < 3) addressBlockers.push("Enter house/flat number (3+ chars)");
              if (!/^\d{6}$/.test(corrPincode)) addressBlockers.push("Enter a valid 6-digit pincode");
            }
            return (
              <>
                <Button
                  size="lg"
                  className="w-full"
                  disabled={addressBlockers.length > 0}
                  onClick={() => setStage("bank")}
                >
                  Confirm &amp; Proceed
                </Button>
                {addressBlockers.length > 0 && (
                  <div className="mt-3 px-3.5 py-2.5 rounded-[var(--tm-r-md)] bg-[var(--tm-warning)]/10 border border-[var(--tm-warning)]/30 flex gap-2 items-start">
                    <AlertCircle size={14} className="text-[var(--tm-warning)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[var(--tm-ink-700)] mb-1">Before continuing:</p>
                      <ul className="text-xs text-[var(--tm-ink-700)] space-y-0.5 list-disc list-inside">
                        {addressBlockers.map((b) => <li key={b}>{b}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </CardShell>
      )}

      {/* STAGE: bank */}
      {stage === "bank" && (
        <CardShell>
          <button onClick={() => back("address")}
            className="flex items-center gap-1 text-sm text-[var(--tm-ink-500)] hover:text-[var(--tm-ink-900)] mb-4">
            <ChevronLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3 mb-4">
            <Banknote size={20} className="text-[var(--tm-green-700)]" />
            <h1 className="text-xl font-bold text-[var(--tm-ink-900)]"
              style={{ fontFamily: "var(--font-jakarta)" }}>
              Bank Account for Disbursal
            </h1>
          </div>
          <p className="text-sm text-[var(--tm-ink-500)] mb-5">
            Make sure this account has internet banking or a debit card enabled — we&apos;ll use it to set up auto-debit for EMIs.
          </p>

          <div className="flex flex-col gap-3 mb-5">
            <div>
              <label className="text-sm font-semibold text-[var(--tm-ink-700)] block mb-1.5">Bank</label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full h-11 px-3 rounded-[var(--tm-r-md)] border border-[var(--tm-ink-300)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tm-green-500)] focus:border-[var(--tm-green-500)]"
              >
                <option value="">Select your bank</option>
                {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--tm-ink-700)] block mb-1.5">IFSC Code</label>
              <input
                type="text"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase().slice(0, 11))}
                placeholder="SBIN0001234"
                maxLength={11}
                className={cn(
                  "w-full h-11 px-3.5 rounded-[var(--tm-r-md)] border text-sm uppercase placeholder:text-[var(--tm-ink-300)] focus:outline-none focus:ring-2 focus:ring-[var(--tm-green-500)] focus:border-[var(--tm-green-500)]",
                  ifsc && !ifscOk ? "border-[var(--tm-danger)]" : "border-[var(--tm-ink-300)]"
                )}
              />
              <p className={cn(
                "text-xs mt-1.5",
                ifsc && !ifscOk ? "text-[var(--tm-danger)]" : "text-[var(--tm-ink-500)]"
              )}>
                {ifsc && !ifscOk
                  ? "11-character format: 4 letters + 0 + 6 alphanumeric (e.g. SBIN0001234)"
                  : "Find this on your cheque or bank app"}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--tm-ink-700)] block mb-1.5">Account Number</label>
              <input
                type="text"
                value={acctNo}
                onChange={(e) => setAcctNo(e.target.value.replace(/\D/g, "").slice(0, 18))}
                placeholder="9 to 18 digits"
                inputMode="numeric"
                className={cn(
                  "w-full h-11 px-3.5 rounded-[var(--tm-r-md)] border text-sm placeholder:text-[var(--tm-ink-300)] focus:outline-none focus:ring-2 focus:ring-[var(--tm-green-500)] focus:border-[var(--tm-green-500)]",
                  acctNo && !acctOk ? "border-[var(--tm-danger)]" : "border-[var(--tm-ink-300)]"
                )}
              />
              {acctNo && !acctOk && (
                <p className="text-xs text-[var(--tm-danger)] mt-1.5">Account number must be 9 to 18 digits</p>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--tm-ink-700)] block mb-1.5">Re-enter Account Number</label>
              <input
                type="text"
                value={acctNoConfirm}
                onChange={(e) => setAcctNoConfirm(e.target.value.replace(/\D/g, "").slice(0, 18))}
                placeholder="Confirm by typing again"
                inputMode="numeric"
                className={cn(
                  "w-full h-11 px-3.5 rounded-[var(--tm-r-md)] border text-sm placeholder:text-[var(--tm-ink-300)] focus:outline-none focus:ring-2 focus:ring-[var(--tm-green-500)] focus:border-[var(--tm-green-500)]",
                  acctNoConfirm && acctNoConfirm !== acctNo ? "border-[var(--tm-danger)]" : "border-[var(--tm-ink-300)]"
                )}
              />
              {acctNoConfirm && acctNoConfirm !== acctNo && (
                <p className="text-xs text-[var(--tm-danger)] mt-1.5">Account numbers do not match</p>
              )}
            </div>
          </div>

          <div className="rounded-[var(--tm-r-md)] border border-dashed border-[var(--tm-green-300)] bg-[var(--tm-green-50)]/40 p-4 mb-5">
            <div className="flex items-start gap-2 mb-3">
              <Camera size={18} className="text-[var(--tm-green-700)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[var(--tm-ink-900)]">
                  Upload passbook or chequebook to autofill details
                </p>
              </div>
            </div>

            <input
              ref={proofCameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleProofFile(e.target.files?.[0])}
            />
            <input
              ref={proofFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleProofFile(e.target.files?.[0])}
            />

            {!proofPreview ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => proofCameraRef.current?.click()}
                  className="flex-1 h-11 px-3 rounded-[var(--tm-r-md)] bg-[var(--tm-green-500)] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[var(--tm-green-700)]"
                >
                  <Camera size={16} /> Take photo
                </button>
                <button
                  type="button"
                  onClick={() => proofFileRef.current?.click()}
                  className="flex-1 h-11 px-3 rounded-[var(--tm-r-md)] border border-[var(--tm-green-500)] bg-white text-[var(--tm-green-700)] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[var(--tm-green-50)]"
                >
                  <Upload size={16} /> Upload
                </button>
              </div>
            ) : (
              <div className="flex gap-3 items-start">
                <img
                  src={proofPreview}
                  alt="Bank document preview"
                  className="w-20 h-20 object-cover rounded-[var(--tm-r-md)] border border-[var(--tm-ink-300)] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[var(--tm-ink-900)] truncate">
                    {proofFileName ?? "Image attached"}
                  </p>
                  <p className={cn(
                    "text-[11px] mb-2 flex items-center gap-1 leading-snug",
                    scanStatus === "ok" && "text-[var(--tm-green-700)]",
                    scanStatus === "partial" && "text-[var(--tm-warning)]",
                    scanStatus === "error" && "text-[var(--tm-danger)]",
                    (scanStatus === "scanning" || scanStatus === "idle") && "text-[var(--tm-ink-500)]"
                  )}>
                    {scanStatus === "scanning" && <Loader2 size={11} className="animate-spin flex-shrink-0" />}
                    <span>{scanMessage || "Image attached"}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => proofCameraRef.current?.click()}
                      className="text-xs font-semibold text-[var(--tm-green-700)] hover:underline"
                    >
                      Retake
                    </button>
                    <button
                      type="button"
                      onClick={clearProof}
                      className="text-xs font-semibold text-[var(--tm-danger)] hover:underline inline-flex items-center gap-1"
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={!bankValid}
            onClick={() => setStage("enach-redirect")}
          >
            Setup Autopay
          </Button>
          {!bankValid && bankBlockers.length > 0 && (
            <div className="mt-3 px-3.5 py-2.5 rounded-[var(--tm-r-md)] bg-[var(--tm-warning)]/10 border border-[var(--tm-warning)]/30 flex gap-2 items-start">
              <AlertCircle size={14} className="text-[var(--tm-warning)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[var(--tm-ink-700)] mb-1">Before continuing:</p>
                <ul className="text-xs text-[var(--tm-ink-700)] space-y-0.5 list-disc list-inside">
                  {bankBlockers.map((b) => <li key={b}>{b}</li>)}
                </ul>
              </div>
            </div>
          )}
        </CardShell>
      )}

      {/* STAGE: enach-redirect (simulated Nupay) */}
      {stage === "enach-redirect" && (
        <CardShell>
          <div className="text-center flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-[var(--tm-green-50)] flex items-center justify-center">
              <Lock size={28} className="text-[var(--tm-green-500)]" />
            </div>
            <div>
              <p className="font-bold text-[var(--tm-ink-900)] text-lg mb-1">Setting up auto-debit (E-NACH)</p>
              <p className="text-sm text-[var(--tm-ink-500)] max-w-sm">
                In production, you would be redirected to Nupay / your bank&apos;s NACH portal to authorise the mandate with debit card, net-banking or UPI.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[var(--tm-ink-500)]">
              <Loader2 size={16} className="animate-spin text-[var(--tm-green-500)]" />
              <span className="text-sm">Registering e-mandate…</span>
            </div>
          </div>
        </CardShell>
      )}

      {/* STAGE: enach-confirm */}
      {stage === "enach-confirm" && (
        <CardShell>
          <div className="flex flex-col items-center mb-4">
            <div className="w-14 h-14 rounded-full bg-[var(--tm-green-500)]/10 flex items-center justify-center mb-2">
              <CheckCircle2 size={28} className="text-[var(--tm-green-500)]" />
            </div>
            <h1 className="text-xl font-bold text-[var(--tm-ink-900)]"
              style={{ fontFamily: "var(--font-jakarta)" }}>
              E-NACH Mandate Registered
            </h1>
            <p className="text-sm text-[var(--tm-ink-500)] mt-1">eMandate request has been successfully initiated.</p>
          </div>

          <dl className="bg-[var(--tm-ink-100)]/40 rounded-[var(--tm-r-md)] divide-y divide-[var(--tm-ink-100)] mb-6">
            {[
              ["Customer", bureau.fullName],
              ["Bank", bank],
              ["Account No.", `XXXXXXXX${acctNo.slice(-4)}`],
              ["Account Type", "Savings"],
              ["EMI Amount", `${formatINR(emi)} / month`],
              ["Frequency", "Monthly"],
              ["Monthly Debit Date", "4th of every month"],
              ["UMRN", umrn.slice(0, 22)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-xs text-[var(--tm-ink-500)]">{k}</dt>
                <dd className="text-sm font-semibold text-[var(--tm-ink-900)] text-right break-all">{v}</dd>
              </div>
            ))}
          </dl>

          <Button size="lg" className="w-full" onClick={() => setStage("agreement")}>
            Proceed
          </Button>
        </CardShell>
      )}

      {/* STAGE: agreement */}
      {stage === "agreement" && (
        <CardShell>
          <div className="flex items-center gap-3 mb-4">
            <FileText size={20} className="text-[var(--tm-green-700)]" />
            <h1 className="text-xl font-bold text-[var(--tm-ink-900)]"
              style={{ fontFamily: "var(--font-jakarta)" }}>
              Digital Agreement Sign
            </h1>
          </div>

          <dl className="bg-[var(--tm-ink-100)]/40 rounded-[var(--tm-r-md)] divide-y divide-[var(--tm-ink-100)] mb-4">
            <Row k="Loan Amount" v={formatINR(loanAmount)} />
            <Row k="Upfront Deductions (-)" v={`− ${formatINR(upfrontDeductions)}`} />
            <Row k="Processing Fee" v={formatINR(processingFee)} muted />
            <Row k="GST on Processing Fee" v={formatINR(gstOnPf)} muted />
            <Row k="Stamp Duty" v={formatINR(stampDuty)} muted />
            <Row k="Net Disbursal Loan Amount" v={formatINR(netDisbursal)} bold />
            <Row k="Loan Tenure" v={`${tenure} Months`} />
            <Row k="Interest Rate (% P.A.)" v={formatPercent(offer.rate)} />
            <Row k="Monthly EMI" v={formatINR(emi)} />
          </dl>

          <p className="text-sm text-[var(--tm-ink-700)] mb-3">
            Please click and read the KFS and loan agreement to proceed further.
          </p>

          <button
            onClick={() => setKfsOpen(true)}
            className="w-full px-4 py-2.5 rounded-[var(--tm-r-md)] border-2 border-[var(--tm-green-300)] text-sm font-semibold text-[var(--tm-green-700)] hover:bg-[var(--tm-green-50)] flex items-center justify-center gap-2 mb-4"
          >
            <FileText size={15} /> Key Facts Statement
          </button>

          <label className="flex items-start gap-2 cursor-pointer mb-2.5">
            <input
              type="checkbox"
              checked={readKfs}
              onChange={(e) => setReadKfs(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[var(--tm-green-500)] flex-shrink-0"
            />
            <span className="text-xs text-[var(--tm-ink-700)] leading-snug">
              By proceeding, I confirm that I have read, understood and accepted the contents and terms &amp; conditions of the Sanction Letter, Key Facts Statement and Loan Agreement (including all annexures).
            </span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer mb-5">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[var(--tm-green-500)] flex-shrink-0"
            />
            <span className="text-xs text-[var(--tm-ink-700)] leading-snug">
              I agree to all the Declarations and Terms &amp; Conditions of SMFG India Credit.
            </span>
          </label>

          <Button
            size="lg"
            className="w-full"
            disabled={!readKfs || !acceptTerms}
            onClick={() => { setStage("otp"); setTimeout(() => otpRef.current?.focus(), 100); }}
          >
            Proceed
          </Button>
          {(!readKfs || !acceptTerms) && (
            <p className="text-xs text-[var(--tm-ink-500)] text-center mt-2 flex items-center justify-center gap-1">
              <AlertCircle size={12} className="text-[var(--tm-warning)]" />
              Please accept both consents above to continue
            </p>
          )}
        </CardShell>
      )}

      {/* STAGE: otp */}
      {stage === "otp" && (
        <CardShell>
          <div className="flex items-center gap-3 mb-3">
            <Lock size={20} className="text-[var(--tm-green-700)]" />
            <h1 className="text-xl font-bold text-[var(--tm-ink-900)]"
              style={{ fontFamily: "var(--font-jakarta)" }}>
              Final Step — Verify OTP
            </h1>
          </div>
          <p className="text-sm text-[var(--tm-ink-500)] mb-5">
            Enter the 6-digit OTP sent to <strong className="text-[var(--tm-ink-700)]">+91 {phone?.slice(0, 5)} {phone?.slice(5)}</strong> to digitally sign the agreement.
          </p>

          <input
            ref={otpRef}
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setOtpError(""); }}
            placeholder="6-digit OTP"
            maxLength={6}
            className={cn(
              "w-full h-14 px-4 rounded-[var(--tm-r-md)] border-2 text-center text-2xl font-bold tracking-[0.5em] text-[var(--tm-ink-900)] placeholder:text-[var(--tm-ink-300)] placeholder:tracking-normal placeholder:text-base placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[var(--tm-green-500)]",
              otpError ? "border-[var(--tm-danger)]" : "border-[var(--tm-ink-300)] focus:border-[var(--tm-green-500)]"
            )}
          />
          {otpError && (
            <p className="text-xs text-[var(--tm-danger)] mt-2 flex items-center gap-1" role="alert">
              <AlertCircle size={12} /> {otpError}
            </p>
          )}
          <p className="text-xs text-[var(--tm-ink-500)] mt-2">For demo: any 6-digit number works</p>

          <Button size="lg" className="w-full mt-5" disabled={otp.length !== 6} onClick={goAgreementSubmit}>
            Submit
          </Button>
        </CardShell>
      )}

      {/* STAGE: submitting */}
      {stage === "submitting" && (
        <CardShell>
          <div className="text-center flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-full bg-[var(--tm-green-50)] flex items-center justify-center">
              <Loader2 size={32} className="text-[var(--tm-green-500)] animate-spin" />
            </div>
            <div>
              <p className="font-bold text-[var(--tm-ink-900)] text-lg mb-1">Submitting Your Loan Application</p>
              <p className="text-sm text-[var(--tm-ink-500)]">We&apos;re finalising your EMI setup. Please don&apos;t close this page.</p>
            </div>
            <div className="w-full bg-[var(--tm-ink-100)] rounded-full h-1.5 overflow-hidden mt-2">
              <div className="h-full bg-[var(--tm-green-500)] rounded-full animate-[progress_2.4s_ease-in-out_forwards]" />
            </div>
          </div>
        </CardShell>
      )}

      {/* STAGE: success */}
      {stage === "success" && (
        <CardShell>
          <div className="text-center flex flex-col items-center gap-3 mb-5">
            <div className="w-20 h-20 rounded-full bg-[var(--tm-green-500)]/10 flex items-center justify-center">
              <CheckCircle2 size={40} className="text-[var(--tm-green-500)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--tm-ink-900)]"
              style={{ fontFamily: "var(--font-jakarta)" }}>
              Application Submitted!
            </h1>
            <p className="text-sm text-[var(--tm-ink-500)] max-w-sm">
              Your loan application is received by SMFG India Credit. {formatINR(netDisbursal)} will be disbursed to your bank account within 48–72 hours subject to final verification.
            </p>
          </div>

          <dl className="bg-[var(--tm-green-50)]/60 rounded-[var(--tm-r-md)] divide-y divide-[var(--tm-green-300)]/30 mb-5">
            <Row k="Total Loan Amount" v={formatINR(loanAmount)} />
            <Row k="Processing Fee" v={formatINR(processingFee + gstOnPf)} muted />
            <Row k="Net Disbursal" v={formatINR(netDisbursal)} bold />
            <Row k="Tenure" v={`${tenure} Months`} />
            <Row k="Interest Rate" v={`${formatPercent(offer.rate)} per annum`} />
            <Row k="Monthly EMI" v={formatINR(emi)} />
            <Row k="First EMI Date" v={"4th of next month"} />
          </dl>

          <Button size="lg" className="w-full" onClick={() => router.push("/profile")}>
            Go to my profile
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-[var(--tm-ink-500)]"
            onClick={() => window.open("https://www.smfgindiacredit.com", "_blank", "noopener")}
          >
            <ExternalLink size={13} /> Visit SMFG India Credit
          </Button>
        </CardShell>
      )}
    </>
  );
}

function Row({ k, v, bold, muted }: { k: string; v: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-2.5">
      <dt className={cn("text-xs", muted ? "text-[var(--tm-ink-400)]" : "text-[var(--tm-ink-500)]")}>{k}</dt>
      <dd className={cn(
        "text-right tabular-nums",
        bold ? "text-[var(--tm-ink-900)] text-base font-bold" : muted ? "text-[var(--tm-ink-500)] text-xs" : "text-sm text-[var(--tm-ink-900)] font-semibold"
      )}>{v}</dd>
    </div>
  );
}
