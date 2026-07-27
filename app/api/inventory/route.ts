import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BulkItemImportSchema } from "@/lib/validators/item";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.businessProfileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId") || user.branchId;

    const items = await prisma.item.findMany({
      where: {
        businessProfileId: user.businessProfileId,
        ...(branchId ? { branchId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/inventory error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.businessProfileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Check if body is an array (bulk import) or a single object
    const isBulk = Array.isArray(body);
    
    // We will validate as array in both cases for simplicity
    const dataToValidate = isBulk ? body : [body];
    const validationResult = BulkItemImportSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const validItems = validationResult.data;

    // Attach businessProfileId and branchId
    const itemsToCreate = validItems.map((item) => ({
      ...item,
      businessProfileId: user.businessProfileId!,
      branchId: user.branchId, // Assuming they fall into user's default active branch
    }));

    if (isBulk) {
      const result = await prisma.item.createMany({
        data: itemsToCreate,
        skipDuplicates: true,
      });
      return NextResponse.json({ success: true, count: result.count }, { status: 201 });
    } else {
      const createdItem = await prisma.item.create({
        data: itemsToCreate[0],
      });
      return NextResponse.json(createdItem, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/inventory error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
