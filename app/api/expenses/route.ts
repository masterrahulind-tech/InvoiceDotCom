import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";

    const user = await getCurrentUser();
    const activeProfileId = user?.businessProfiles[0]?.id || user?.businessMembers[0]?.businessProfileId;
    if (!user || !activeProfileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expenses = await prisma.expense.findMany({
      where: {
        businessProfileId: activeProfileId,
        ...(category ? { category } : {}),
      },
      orderBy: { date: "desc" }
    });

    const totalExpense = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const totalInputGst = expenses.reduce((acc, exp) => acc + exp.taxAmount, 0);

    return NextResponse.json({
      expenses,
      summary: {
        totalExpensesCount: expenses.length,
        totalExpense,
        totalInputGst,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, amount, taxAmount, vendorName, gstin, paymentMode, date, notes } = body;

    if (!category || !amount) {
      return NextResponse.json({ error: "Category and amount are required" }, { status: 400 });
    }

    const user = await getCurrentUser();
    const activeProfileId = user?.businessProfiles[0]?.id || user?.businessMembers[0]?.businessProfileId;
    if (!user || !activeProfileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expense = await prisma.expense.create({
      data: {
        businessProfileId: activeProfileId,
        category,
        amount: parseFloat(amount),
        taxAmount: parseFloat(taxAmount) || 0,
        vendorName: vendorName || null,
        gstin: gstin || null,
        paymentMode: paymentMode || "cash",
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
      }
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create expense" }, { status: 500 });
  }
}
