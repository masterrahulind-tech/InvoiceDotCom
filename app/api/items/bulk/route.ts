import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const items = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided for upload." }, { status: 400 });
    }

    const user = await getCurrentUser();
    const activeProfileId = user?.businessProfiles[0]?.id || user?.businessMembers[0]?.businessProfileId;
    if (!user || !activeProfileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      try {
        if (!row.name) {
          throw new Error("Item Name is missing");
        }

        const sku = row.sku || `SKU-${Date.now().toString().slice(-6)}-${i}`;
        
        // Ensure SKU is unique (or we could use upsert if we want to update existing items)
        const existing = await prisma.item.findFirst({ where: { sku, businessProfileId: activeProfileId } });
        if (existing) {
          throw new Error(`Item with SKU ${sku} already exists.`);
        }

        const stockQty = parseFloat(row.stockQty) || 0;

        const item = await prisma.item.create({
          data: {
            businessProfileId: activeProfileId,
            sku,
            name: row.name,
            category: row.category || "General",
            unit: row.unit || "Pcs",
            hsnCode: String(row.hsnCode || ""),
            mrp: parseFloat(row.mrp || row.MRP) || 0,
            salePrice: parseFloat(row.salePrice || row["Sale Price"]) || 0,
            purchasePrice: parseFloat(row.purchasePrice || row["Purchase Price"]) || 0,
            taxRate: parseFloat(row.taxRate) || 18,
            stockQty,
            lowStockThreshold: parseFloat(row.lowStockThreshold) || 10,
            ...(stockQty > 0 ? {
              stockMovements: {
                create: {
                  changeQty: stockQty,
                  movementType: "purchase",
                  notes: "Bulk Import Opening Stock",
                }
              }
            } : {})
          }
        });

        results.push(item);
      } catch (err: any) {
        errors.push({ row: i + 1, item: row.name || 'Unknown', error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.length,
      failed: errors.length,
      errors
    });

  } catch (error: any) {
    console.error("Bulk upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to process bulk upload" }, { status: 500 });
  }
}
