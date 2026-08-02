import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const activeProfileId = user?.businessProfiles[0]?.id || user?.businessMembers[0]?.businessProfileId;
    if (!user || !activeProfileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const business = await prisma.businessProfile.findUnique({
      where: { id: activeProfileId }
    });
    if (!business) {
      return NextResponse.json({ error: "Business profile not found" }, { status: 404 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { businessProfileId: business.id },
      include: {
        client: true,
        lineItems: true,
      },
      orderBy: { createdAt: "desc" }
    });

    const expenses = await prisma.expense.findMany({
      where: { businessProfileId: business.id }
    });

    // 1. B2B vs B2C Breakdown
    const b2bInvoices = invoices.filter(inv => inv.client?.gstin && inv.client.gstin.trim().length > 0);
    const b2cInvoices = invoices.filter(inv => !inv.client?.gstin || inv.client.gstin.trim().length === 0);

    const b2bTaxable = b2bInvoices.reduce((acc, inv) => acc + inv.taxableAmount, 0);
    const b2bTax = b2bInvoices.reduce((acc, inv) => acc + (inv.cgstAmount + inv.sgstAmount + inv.igstAmount), 0);

    const b2cTaxable = b2cInvoices.reduce((acc, inv) => acc + inv.taxableAmount, 0);
    const b2cTax = b2cInvoices.reduce((acc, inv) => acc + (inv.cgstAmount + inv.sgstAmount + inv.igstAmount), 0);

    // 2. Tax totals
    const totalCgst = invoices.reduce((acc, inv) => acc + inv.cgstAmount, 0);
    const totalSgst = invoices.reduce((acc, inv) => acc + inv.sgstAmount, 0);
    const totalIgst = invoices.reduce((acc, inv) => acc + inv.igstAmount, 0);
    const totalOutputGst = totalCgst + totalSgst + totalIgst;

    const totalInputGst = expenses.reduce((acc, exp) => acc + exp.taxAmount, 0);
    const netGstLiability = Math.max(0, totalOutputGst - totalInputGst);

    // 3. HSN Summary Breakdown
    const hsnMap: Record<string, { hsnCode: string; description: string; totalQty: number; taxableValue: number; cgst: number; sgst: number; igst: number; totalTax: number }> = {};

    invoices.forEach(inv => {
      inv.lineItems.forEach(item => {
        const code = item.hsnCode || "8517";
        if (!hsnMap[code]) {
          hsnMap[code] = {
            hsnCode: code,
            description: item.description,
            totalQty: 0,
            taxableValue: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            totalTax: 0,
          };
        }
        hsnMap[code].totalQty += item.qty;
        hsnMap[code].taxableValue += item.amount;
        hsnMap[code].cgst += item.cgstAmount;
        hsnMap[code].sgst += item.sgstAmount;
        hsnMap[code].igst += item.igstAmount;
        hsnMap[code].totalTax += (item.cgstAmount + item.sgstAmount + item.igstAmount);
      });
    });

    const hsnSummary = Object.values(hsnMap);

    return NextResponse.json({
      businessGstin: business.gstin || "27AAACA1234A1Z5",
      businessName: business.businessName,
      stateCode: business.stateCode || "27",
      summary: {
        totalInvoicesCount: invoices.length,
        totalSalesTaxable: b2bTaxable + b2cTaxable,
        totalOutputGst,
        totalCgst,
        totalSgst,
        totalIgst,
        totalInputGst,
        netGstLiability,
        b2bCount: b2bInvoices.length,
        b2bTaxable,
        b2bTax,
        b2cCount: b2cInvoices.length,
        b2cTaxable,
        b2cTax,
      },
      b2bInvoices: b2bInvoices.map(inv => ({
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        date: inv.createdAt,
        clientName: inv.client.name,
        clientGstin: inv.client.gstin,
        taxableAmount: inv.taxableAmount,
        cgst: inv.cgstAmount,
        sgst: inv.sgstAmount,
        igst: inv.igstAmount,
        totalAmount: inv.totalAmount,
      })),
      hsnSummary,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate GST report" }, { status: 500 });
  }
}
