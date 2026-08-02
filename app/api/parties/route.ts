import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const partyType = searchParams.get("type") || ""; // customer | supplier

    const user = await getCurrentUser();
    const activeProfileId = user?.businessProfiles[0]?.id || user?.businessMembers[0]?.businessProfileId;
    if (!user || !activeProfileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parties = await prisma.client.findMany({
      where: {
        businessProfileId: activeProfileId,
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
            { gstin: { contains: search } },
          ]
        } : {}),
        ...(partyType ? { partyType } : {}),
      },
      include: {
        partyTransactions: {
          orderBy: { date: "desc" },
          take: 3,
        },
        invoices: {
          select: {
            id: true,
            totalAmount: true,
            paidAmount: true,
            status: true,
          }
        }
      },
      orderBy: { name: "asc" }
    });

    // Calculate Khatabook Udhaar Balances for each party
    let totalReceivable = 0; // "You will get" (Green)
    let totalPayable = 0;    // "You will give" (Red)

    const partiesWithBalance = parties.map(party => {
      // Calculate net balance from initial opening balance + invoice unpaid totals + manual transactions
      let netBalance = party.openingBalance * (party.balanceType === "receivable" ? 1 : -1);

      // Add unpaid invoice balance
      party.invoices.forEach(inv => {
        const unpaid = inv.totalAmount - inv.paidAmount;
        if (unpaid > 0 && inv.status !== "refunded") {
          netBalance += unpaid;
        }
      });

      // Adjust for manual party ledger transactions (GAVE = increases receivable, GOT = decreases receivable)
      party.partyTransactions.forEach(tx => {
        if (tx.type === "GAVE") {
          netBalance += tx.amount;
        } else if (tx.type === "GOT") {
          netBalance -= tx.amount;
        }
      });

      if (netBalance > 0) {
        totalReceivable += netBalance;
      } else if (netBalance < 0) {
        totalPayable += Math.abs(netBalance);
      }

      return {
        ...party,
        calculatedBalance: Math.abs(netBalance),
        balanceStatus: netBalance >= 0 ? "receivable" : "payable",
      };
    });

    return NextResponse.json({
      parties: partiesWithBalance,
      summary: {
        totalPartiesCount: parties.length,
        totalReceivable, // "You will get"
        totalPayable,    // "You will give"
        netBalance: totalReceivable - totalPayable,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch parties" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, partyType, phone, email, address, gstin, stateCode, openingBalance, balanceType, creditLimit } = body;

    if (!name) {
      return NextResponse.json({ error: "Party name is required" }, { status: 400 });
    }

    const user = await getCurrentUser();
    const activeProfileId = user?.businessProfiles[0]?.id || user?.businessMembers[0]?.businessProfileId;
    if (!user || !activeProfileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for duplicate entity (Name + PartyType + B2B/B2C scope)
    const existingParty = await prisma.client.findFirst({
      where: {
        businessProfileId: activeProfileId,
        name: { equals: name, mode: "insensitive" },
        partyType: partyType || "customer",
        gstin: gstin ? { not: null } : null,
      }
    });

    if (existingParty) {
      const category = gstin ? "B2B (Registered)" : "B2C (Unregistered)";
      return NextResponse.json(
        { error: `A ${category} ${partyType || "customer"} named "${name}" already exists.` }, 
        { status: 409 }
      );
    }

    const party = await prisma.client.create({
      data: {
        businessProfileId: activeProfileId,
        name,
        partyType: partyType || "customer",
        phone: phone || null,
        email: email || null,
        address: address || null,
        gstin: gstin || null,
        stateCode: stateCode || user.businessProfiles[0]?.stateCode || "27",
        openingBalance: parseFloat(openingBalance) || 0,
        balanceType: balanceType || "receivable",
        creditLimit: creditLimit ? parseFloat(creditLimit) : null,
      }
    });

    return NextResponse.json(party, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create party" }, { status: 500 });
  }
}
