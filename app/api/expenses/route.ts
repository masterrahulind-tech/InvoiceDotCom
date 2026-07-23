import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";

    const business = await prisma.businessProfile.findFirst();
    if (!business) {
      return NextResponse.json({ error: "Business profile not found" }, { status: 404 });
    }

    const expenses = await prisma.expense.findMany({
      where: {
        businessProfileId: business.id,
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

    const business = await prisma.businessProfile.findFirst();
    if (!business) {
      return NextResponse.json({ error: "Business profile not found" }, { status: 404 });
    }

    const expense = await prisma.expense.create({
      data: {
        businessProfileId: business.id,
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
