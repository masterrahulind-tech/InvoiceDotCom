import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const lowStockOnly = searchParams.get("lowStock") === "true";

    const user = await getCurrentUser();
    const activeProfileId = user?.businessProfiles[0]?.id || user?.businessMembers[0]?.businessProfileId;
    if (!user || !activeProfileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.item.findMany({
      where: {
        businessProfileId: activeProfileId,
        ...(search ? { name: { contains: search } } : {}),
        ...(category ? { category } : {}),
      },
      include: {
        stockMovements: {
          take: 5,
          orderBy: { createdAt: "desc" }
        }
      },
      orderBy: { name: "asc" }
    });

    const filteredItems = lowStockOnly
      ? items.filter(item => item.stockQty <= item.lowStockThreshold)
      : items;

    // Calculate Inventory Summary Statistics
    const totalItemsCount = items.length;
    const totalStockQty = items.reduce((acc, item) => acc + item.stockQty, 0);
    const totalStockValuation = items.reduce((acc, item) => acc + (item.stockQty * item.purchasePrice), 0);
    const totalRetailValuation = items.reduce((acc, item) => acc + (item.stockQty * item.salePrice), 0);
    const lowStockCount = items.filter(item => item.stockQty <= item.lowStockThreshold).length;

    return NextResponse.json({
      items: filteredItems,
      summary: {
        totalItemsCount,
        totalStockQty,
        totalStockValuation,
        totalRetailValuation,
        lowStockCount,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sku, name, category, unit, hsnCode, mrp, salePrice, purchasePrice, taxRate, stockQty, lowStockThreshold } = body;

    if (!name) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }

    const user = await getCurrentUser();
    const activeProfileId = user?.businessProfiles[0]?.id || user?.businessMembers[0]?.businessProfileId;
    if (!user || !activeProfileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const item = await prisma.item.create({
      data: {
        businessProfileId: activeProfileId,
        sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
        name,
        category: category || "General",
        unit: unit || "Pcs",
        hsnCode: hsnCode || null,
        mrp: parseFloat(mrp) || 0,
        salePrice: parseFloat(salePrice) || 0,
        purchasePrice: parseFloat(purchasePrice) || 0,
        taxRate: parseFloat(taxRate) || 18,
        stockQty: parseFloat(stockQty) || 0,
        lowStockThreshold: parseFloat(lowStockThreshold) || 10,
        stockMovements: {
          create: {
            changeQty: parseFloat(stockQty) || 0,
            movementType: "purchase",
            notes: "Initial stock quantity added",
          }
        }
      }
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create item" }, { status: 500 });
  }
}
