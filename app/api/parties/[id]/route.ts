import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const party = await prisma.client.findUnique({
      where: { id },
      include: {
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        partyTransactions: {
          orderBy: { date: "desc" },
          take: 20,
        }
      }
    });

    if (!party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    // Calculate detailed ledger balance
    let netBalance = party.openingBalance * (party.balanceType === "receivable" ? 1 : -1);

    party.invoices.forEach(inv => {
      const unpaid = inv.totalAmount - inv.paidAmount;
      if (unpaid > 0 && inv.status !== "refunded") {
        netBalance += unpaid;
      }
    });

    party.partyTransactions.forEach(tx => {
      if (tx.type === "GAVE") {
        netBalance += tx.amount;
      } else if (tx.type === "GOT") {
        netBalance -= tx.amount;
      }
    });

    return NextResponse.json({
      ...party,
      calculatedBalance: Math.abs(netBalance),
      balanceStatus: netBalance >= 0 ? "receivable" : "payable",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch party" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, partyType, phone, email, address, gstin, stateCode, openingBalance, balanceType, creditLimit } = body;

    const party = await prisma.client.update({
      where: { id },
      data: {
        name,
        partyType,
        phone,
        email,
        address,
        gstin,
        stateCode,
        openingBalance: openingBalance !== undefined ? parseFloat(openingBalance) : undefined,
        balanceType,
        creditLimit: creditLimit ? parseFloat(creditLimit) : null,
      }
    });

    return NextResponse.json(party);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update party" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete party" }, { status: 500 });
  }
}
