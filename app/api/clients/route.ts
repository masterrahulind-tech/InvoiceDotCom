import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { clientSchema } from "@/lib/validators/client";

// GET — list all clients for the authenticated user's business profile
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const businessProfileId = searchParams.get("businessProfileId");

  // Get user's business profiles
  const userProfiles = await prisma.businessProfile.findMany({
    where: { userId: session.userId },
    select: { id: true },
  });
  const profileIds = userProfiles.map((p) => p.id);

  if (profileIds.length === 0) {
    return NextResponse.json({ clients: [] });
  }

  const where = businessProfileId && profileIds.includes(businessProfileId)
    ? { businessProfileId }
    : { businessProfileId: { in: profileIds } };

  const clients = await prisma.client.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ clients });
}

// POST — create a new client
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = clientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid client data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify the business profile belongs to this user
    const profile = await prisma.businessProfile.findFirst({
      where: {
        id: parsed.data.businessProfileId,
        userId: session.userId,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Business profile not found" },
        { status: 404 }
      );
    }

    const client = await prisma.client.create({
      data: {
        businessProfileId: parsed.data.businessProfileId,
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        email: parsed.data.email || null,
        address: parsed.data.address || null,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("Client creation error:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
