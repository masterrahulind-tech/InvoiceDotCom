import { z } from "zod";

export const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number is too long")
  .regex(/^\+?[0-9]+$/, "Invalid phone number format");

export const otpSendSchema = z.object({
  phone: phoneSchema,
  name: z.string().min(1, "Name is required").optional(),
});

export const otpVerifySchema = z.object({
  phone: phoneSchema,
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^[0-9]+$/, "OTP must be numeric"),
  name: z.string().min(1, "Name is required").optional(),
});

export type OtpSendInput = z.infer<typeof otpSendSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
