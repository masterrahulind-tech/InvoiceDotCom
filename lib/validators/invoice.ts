import { z } from "zod";

export const lineItemSchema = z.object({
  id: z.string().optional(),
  itemId: z.string().optional().nullable(),
  description: z.string().min(1, "Description is required"),
  hsnCode: z.string().optional().nullable(),
  qty: z.number().positive("Quantity must be positive"),
  unit: z.string().optional().default("Pcs"),
  rate: z.number().min(0, "Rate must be non-negative"),
  discountPercent: z.number().min(0).max(100).optional().default(0),
  taxPercent: z.number().min(0).max(100).default(0),
  amount: z.number().min(0),
});

export const customFieldSchema = z.object({
  id: z.string().optional(),
  fieldKey: z.string().min(1, "Field name is required"),
  fieldValue: z.string(),
});

export const invoiceCreateSchema = z.object({
  businessProfileId: z.string().optional(),
  clientId: z.string().min(1, "Client is required"),
  templateId: z.string().optional().nullable(),
  documentType: z.enum(["INVOICE", "QUOTATION", "PROFORMA", "CHALLAN"]).optional().default("INVOICE"),
  invoiceNo: z.string().optional(),
  billingType: z.enum(["B2B", "B2C", "EXPORT"]).optional().default("B2B"),
  placeOfSupply: z.string().optional().default("27"),
  status: z
    .enum(["draft", "pending", "partially_paid", "paid", "overdue", "refunded"])
    .default("pending"),
  totalAmount: z.number().min(0),
  paidAmount: z.number().optional().default(0),
  currency: z.string().default("INR"),
  dueDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  vehicleNo: z.string().optional().nullable(),
  ewayBillNo: z.string().optional().nullable(),
  transportMode: z.enum(["road", "rail", "air", "ship", "courier"]).optional().default("road"),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  customFields: z.array(customFieldSchema).optional(),
});

export const invoiceUpdateSchema = invoiceCreateSchema.partial().extend({
  id: z.string(),
});

export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;
export type InvoiceUpdateInput = z.infer<typeof invoiceUpdateSchema>;
export type LineItemInput = z.infer<typeof lineItemSchema>;
export type CustomFieldInput = z.infer<typeof customFieldSchema>;
