import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  phone: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  businessProfileId: z.string().min(1, "Business profile is required"),
});

export type ClientInput = z.infer<typeof clientSchema>;
