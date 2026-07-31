import { z } from "zod";

export const identifierSchema = z.string().min(3, "Please enter a valid email or phone number").refine((val) => {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isPhone = /^\+?[0-9]{10,15}$/.test(val);
  return isEmail || isPhone;
}, {
  message: "Invalid email or phone number format",
});

export const otpSendSchema = z.object({
  identifier: identifierSchema,
  name: z.string().min(1, "Name is required").optional(),
});

export const otpVerifySchema = z.object({
  identifier: identifierSchema,
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^[0-9]+$/, "OTP must be numeric"),
  name: z.string().min(1, "Name is required").optional(),
});

export type OtpSendInput = z.infer<typeof otpSendSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
