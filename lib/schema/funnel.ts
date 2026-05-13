import { z } from "zod";

export const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  consent: z.literal(true, "You must authorize the bureau check to continue"),
});

export const otpSchema = z.object({
  otp: z.string().length(4, "OTP must be 4 digits").regex(/^\d{4}$/, "OTP must be numeric"),
});

export const basicDetailsSchema = z.object({
  gender: z.enum(["M", "F", "O"], "Please select your gender"),
  email: z.string().email("Enter a valid email address"),
  dob: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use DD/MM/YYYY format")
    .refine((dob) => {
      const [day, month, year] = dob.split("/").map(Number);
      const date = new Date(year, month - 1, day);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      const monthDiff = now.getMonth() - date.getMonth();
      const finalAge =
        monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())
          ? age - 1
          : age;
      return finalAge >= 21 && finalAge <= 65;
    }, "Age must be between 21 and 65 years"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

export type PhoneFormValues = z.infer<typeof phoneSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
export type BasicDetailsFormValues = z.infer<typeof basicDetailsSchema>;
