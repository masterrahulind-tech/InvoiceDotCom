import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const party = await prisma.client.findUnique({
      where: { id },
    });

    if (!party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { clientId: id },
      select: {
        id: true,
        invoiceNo: true,
        totalAmount: true,
        paidAmount: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" }
    });

    const transactions = await prisma.partyTransaction.findMany({
      where: { clientId: id, invoiceId: null },
      orderBy: { date: "asc" }
    });

    // Merge invoices & manual ledger entries into chronological passbook statement
    const statement: any[] = [];

    if (party.openingBalance > 0) {
      statement.push({
        id: "opening-bal",
        date: party.createdAt,
        type: party.balanceType === "receivable" ? "GAVE" : "GOT",
        title: "Opening Balance",
        amount: party.openingBalance,
        paymentMode: "N/A",
        notes: `Initial opening balance (${party.balanceType})`,
      });
    }

    invoices.forEach(inv => {
      statement.push({
        id: `inv-${inv.id}`,
        date: inv.createdAt,
        type: "GAVE", // Bill given
        title: `Invoice #${inv.invoiceNo}`,
        amount: inv.totalAmount,
        paymentMode: "Invoice",
        notes: `Status: ${inv.status.toUpperCase()}`,
        invoiceId: inv.id,
      });

      if (inv.paidAmount > 0) {
        statement.push({
          id: `inv-paid-${inv.id}`,
          date: inv.createdAt,
          type: "GOT", // Payment received for invoice
          title: `Payment for Invoice #${inv.invoiceNo}`,
          amount: inv.paidAmount,
          paymentMode: "Payment",
          notes: "Settlement via invoice payment",
          invoiceId: inv.id,
        });
      }
    });

    transactions.forEach(tx => {
      statement.push({
        id: tx.id,
        date: tx.date,
        type: tx.type, // GAVE or GOT
        title: tx.type === "GAVE" ? "You Gave (Debit)" : "You Got (Credit)",
        amount: tx.amount,
        paymentMode: tx.paymentMode,
        notes: tx.notes || "",
        invoiceId: tx.invoiceId,
      });
    });

    // Sort by date ascending
    statement.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Compute running balance
    let runningBal = 0;
    const statementWithRunningBal = statement.map(entry => {
      if (entry.type === "GAVE") {
        runningBal += entry.amount;
      } else {
        runningBal -= entry.amount;
      }
      return {
        ...entry,
        runningBalance: Math.abs(runningBal),
        balanceStatus: runningBal >= 0 ? "receivable" : "payable",
      };
    });

    return NextResponse.json({
      partyName: party.name,
      partyPhone: party.phone,
      statement: statementWithRunningBal,
      finalBalance: Math.abs(runningBal),
      finalStatus: runningBal >= 0 ? "receivable" : "payable",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch ledger statement" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { type, amount, paymentMode, notes, date } = body;

    if (!type || !amount) {
      return NextResponse.json({ error: "Transaction type and amount are required" }, { status: 400 });
    }

    const party = await prisma.client.findUnique({ where: { id } });
    if (!party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    const transaction = await prisma.partyTransaction.create({
      data: {
        businessProfileId: party.businessProfileId,
        clientId: party.id,
        type: type, // GAVE or GOT
        amount: parseFloat(amount),
        paymentMode: paymentMode || "cash",
        notes: notes || "",
        date: date ? new Date(date) : new Date(),
      }
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to record ledger entry" }, { status: 500 });
  }
}
