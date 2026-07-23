import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch item" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { sku, name, category, unit, hsnCode, salePrice, purchasePrice, taxRate, lowStockThreshold, adjustStock, adjustNotes } = body;

    const existingItem = await prisma.item.findUnique({ where: { id } });
    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    let updatedStockQty = existingItem.stockQty;
    let createMovement = null;

    if (adjustStock !== undefined && parseFloat(adjustStock) !== 0) {
      const diff = parseFloat(adjustStock);
      updatedStockQty += diff;
      createMovement = {
        changeQty: diff,
        movementType: diff > 0 ? "purchase" : "adjustment",
        notes: adjustNotes || "Manual stock adjustment",
      };
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        sku: sku !== undefined ? sku : existingItem.sku,
        name: name !== undefined ? name : existingItem.name,
        category: category !== undefined ? category : existingItem.category,
        unit: unit !== undefined ? unit : existingItem.unit,
        hsnCode: hsnCode !== undefined ? hsnCode : existingItem.hsnCode,
        salePrice: salePrice !== undefined ? parseFloat(salePrice) : existingItem.salePrice,
        purchasePrice: purchasePrice !== undefined ? parseFloat(purchasePrice) : existingItem.purchasePrice,
        taxRate: taxRate !== undefined ? parseFloat(taxRate) : existingItem.taxRate,
        lowStockThreshold: lowStockThreshold !== undefined ? parseFloat(lowStockThreshold) : existingItem.lowStockThreshold,
        stockQty: updatedStockQty,
        ...(createMovement ? {
          stockMovements: {
            create: createMovement
          }
        } : {})
      }
    });

    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.item.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete item" }, { status: 500 });
  }
}
