"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFunnelStore } from "@/lib/store/funnel";
import { useNavigationGuard } from "@/lib/hooks/useNavigationGuard";
import { basicDetailsSchema, type BasicDetailsFormValues } from "@/lib/schema/funnel";
import { lookupPincode } from "@/lib/api/pincode";
import { cn } from "@/lib/utils/cn";

const GENDER_OPTIONS = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "O", label: "Other" },
] as const;

export default function BasicDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return");
  const { bureau, basicDetails, setBasicDetails, phone } = useFunnelStore();

  const [cityState, setCityState] = useState<string | null>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  useNavigationGuard(true);

  // Guard: redirect if no bureau data
  useEffect(() => {
    if (!bureau && !phone) router.replace("/loan/personal");
  }, [bureau, phone, router]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BasicDetailsFormValues>({
    resolver: zodResolver(basicDetailsSchema),
    defaultValues: {
      gender: basicDetails?.gender ?? (bureau?.gender as "M" | "F" | "O") ?? undefined,
      email: basicDetails?.email ?? bureau?.emailMasked?.replace(/\*+/, "") ?? "",
      dob:
        basicDetails?.dob ??
        (bureau?.dob
          ? (() => {
              const [y, m, d] = bureau.dob.split("-");
              return `${d}/${m}/${y}`;
            })()
          : ""),
      pincode: basicDetails?.pincode ?? bureau?.pincode ?? "",
    },
  });

  const pincode = watch("pincode");
  const selectedGender = watch("gender");

  // Pincode lookup
  useEffect(() => {
    if (!/^\d{6}$/.test(pincode)) { setCityState(null); return; }
    setPincodeLoading(true);
    lookupPincode(pincode).then((res) => {
      setCityState(res ? `${res.city}, ${res.state}` : null);
      setPincodeLoading(false);
    });
  }, [pincode]);

  // DOB auto-format: insert slashes as user types
  function handleDobChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    else if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    setValue("dob", formatted, { shouldValidate: digits.length === 8 });
  }

  async function onSubmit(data: BasicDetailsFormValues) {
    setBasicDetails({ ...data, panMasked: bureau?.panMasked ?? "" });
    router.push(returnTo === "profile" ? "/profile" : "/loan/personal/offers");
  }

  return (
    <div className="py-6 sm:py-10 px-4 max-w-[480px] mx-auto">
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--tm-ink-900)] mb-1"
              style={{ fontFamily: "var(--font-jakarta)" }}>
              Please verify details for the best loan offer
            </h1>
            <p className="text-sm text-[var(--tm-ink-500)]">
              Prefilled from your credit profile. Edit anything that&apos;s outdated.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">

            {/* Full Name — disabled */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-[var(--tm-ink-700)]">Full Name</label>
                <span className="group relative">
                  <Info size={14} className="text-[var(--tm-ink-500)] cursor-help" />
                  <span className="absolute right-0 top-5 w-52 text-xs bg-[var(--tm-ink-900)] text-white rounded-[var(--tm-r-sm)] px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 leading-relaxed">
                    This matches your PAN. Contact support if it&apos;s wrong.
                  </span>
                </span>
              </div>
              <input
                type="text"
                value={bureau?.fullName ?? ""}
                disabled
                className="w-full h-11 px-3.5 rounded-[var(--tm-r-md)] border border-[var(--tm-ink-300)] bg-[var(--tm-ink-100)] text-[var(--tm-ink-500)] text-sm cursor-not-allowed"
                aria-label="Full name — read only"
              />
            </div>

            {/* Gender — segmented control */}
            <div>
              <label className="text-sm font-semibold text-[var(--tm-ink-700)] block mb-1.5">
                Gender <span className="text-[var(--tm-danger)]">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Gender">
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue("gender", opt.value, { shouldValidate: true })}
                    className={cn(
                      "h-11 rounded-[var(--tm-r-md)] text-sm font-semibold border-2 transition-all",
                      selectedGender === opt.value
                        ? "bg-[var(--tm-green-50)] border-[var(--tm-green-500)] text-[var(--tm-green-700)]"
                        : "border-[var(--tm-ink-300)] text-[var(--tm-ink-700)] hover:border-[var(--tm-green-300)] hover:bg-[var(--tm-green-50)]"
                    )}
                    aria-pressed={selectedGender === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors.gender && (
                <p className="text-xs text-[var(--tm-danger)] mt-1.5" role="alert">{errors.gender.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-[var(--tm-ink-700)] block mb-1.5">
                Email <span className="text-[var(--tm-danger)]">*</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
                className={cn(
                  "w-full h-11 px-3.5 rounded-[var(--tm-r-md)] border text-sm text-[var(--tm-ink-900)] placeholder:text-[var(--tm-ink-300)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--tm-green-500)] focus:border-[var(--tm-green-500)]",
                  errors.email ? "border-[var(--tm-danger)]" : "border-[var(--tm-ink-300)]"
                )}
              />
              {errors.email && (
                <p className="text-xs text-[var(--tm-danger)] mt-1.5" role="alert">{errors.email.message}</p>
              )}
            </div>

            {/* DOB */}
            <div>
              <label htmlFor="dob" className="text-sm font-semibold text-[var(--tm-ink-700)] block mb-1.5">
                Date of Birth <span className="text-[var(--tm-danger)]">*</span>
              </label>
              <input
                id="dob"
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/YYYY"
                autoComplete="bday"
                value={watch("dob")}
                onChange={(e) => handleDobChange(e.target.value)}
                className={cn(
                  "w-full h-11 px-3.5 rounded-[var(--tm-r-md)] border text-sm text-[var(--tm-ink-900)] placeholder:text-[var(--tm-ink-300)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--tm-green-500)] focus:border-[var(--tm-green-500)]",
                  errors.dob ? "border-[var(--tm-danger)]" : "border-[var(--tm-ink-300)]"
                )}
              />
              {errors.dob && (
                <p className="text-xs text-[var(--tm-danger)] mt-1.5" role="alert">{errors.dob.message}</p>
              )}
            </div>

            {/* Pincode */}
            <div>
              <label htmlFor="pincode" className="text-sm font-semibold text-[var(--tm-ink-700)] block mb-1.5">
                Pincode <span className="text-[var(--tm-danger)]">*</span>
              </label>
              <input
                id="pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="400001"
                autoComplete="postal-code"
                {...register("pincode")}
                className={cn(
                  "w-full h-11 px-3.5 rounded-[var(--tm-r-md)] border text-sm text-[var(--tm-ink-900)] placeholder:text-[var(--tm-ink-300)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--tm-green-500)] focus:border-[var(--tm-green-500)]",
                  errors.pincode ? "border-[var(--tm-danger)]" : "border-[var(--tm-ink-300)]"
                )}
              />
              {pincodeLoading && (
                <p className="text-xs text-[var(--tm-ink-500)] mt-1.5">Looking up…</p>
              )}
              {!pincodeLoading && cityState && (
                <p className="text-xs text-[var(--tm-green-700)] mt-1.5 font-medium">{cityState}</p>
              )}
              {errors.pincode && (
                <p className="text-xs text-[var(--tm-danger)] mt-1.5" role="alert">{errors.pincode.message}</p>
              )}
            </div>

            {/* PAN — display only */}
            <div>
              <label className="text-sm font-semibold text-[var(--tm-ink-700)] block mb-1.5">PAN</label>
              <div className="w-full h-11 px-3.5 rounded-[var(--tm-r-md)] border border-[var(--tm-ink-300)] bg-[var(--tm-ink-100)] text-[var(--tm-ink-500)] text-sm flex items-center font-mono tracking-widest cursor-not-allowed">
                {bureau?.panMasked ?? "—"}
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full mt-2" loading={isSubmitting}>
              {returnTo === "profile" ? "Save changes" : "Continue →"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
