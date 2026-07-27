import * as z from "zod";

export const ItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  category: z.string().optional().default("General"),
  unit: z.string().min(1, "Unit is required").default("Pcs"),
  hsnCode: z.string().optional(),
  salePrice: z.coerce.number().min(0, "Sale price must be >= 0"),
  purchasePrice: z.coerce.number().min(0, "Purchase price must be >= 0"),
  taxRate: z.coerce.number().min(0, "Tax rate must be >= 0"),
  stockQty: z.coerce.number().default(0),
  lowStockThreshold: z.coerce.number().default(10),
});

export const BulkItemImportSchema = z.array(ItemSchema);
