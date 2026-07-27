import { z } from "zod";

export const businessProfileSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.enum(["individual", "registered"], {
    message: "Select individual or registered",
  }),
  vertical: z.enum(
    [
      "real_estate",
      "restaurant",
      "school",
      "retail",
      "freelance",
      "healthcare",
      "logistics",
      "events",
      "other",
    ],
    { message: "Select a business vertical" }
  ),
  country: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  timeZone: z.string().optional().nullable(),
  taxSystem: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
  pan: z.string().optional().nullable(),
});

export const paymentMethodSchema = z.object({
  type: z.enum(["upi", "bank", "qr_upload", "gateway_link"]),
  value: z.string().min(1, "Payment method value is required"),
  isDefault: z.boolean().default(true),
});

export const onboardingSchema = z.object({
  businessProfile: businessProfileSchema,
  paymentMethod: paymentMethodSchema.optional(),
});

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
