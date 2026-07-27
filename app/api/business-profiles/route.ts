import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { businessProfileSchema, paymentMethodSchema } from "@/lib/validators/business-profile";

// GET — list all business profiles for the authenticated user
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profiles = await prisma.businessProfile.findMany({
    where: { userId: session.userId },
    include: { paymentMethods: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ profiles });
}

// POST — create a new business profile + optional payment method
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate business profile
    const profileParsed = businessProfileSchema.safeParse(body.businessProfile || body);
    if (!profileParsed.success) {
      return NextResponse.json(
        { error: "Invalid business profile data", details: profileParsed.error.flatten() },
        { status: 400 }
      );
    }

    const profileData = profileParsed.data;

    // Create business profile, main branch, and owner member in a transaction
    const profile = await prisma.$transaction(async (tx) => {
      const bp = await tx.businessProfile.create({
        data: {
          userId: session.userId,
          businessName: profileData.businessName,
          businessType: profileData.businessType,
          vertical: profileData.vertical,
          country: profileData.country || "India",
          currency: profileData.currency || "INR",
          language: profileData.language || "English",
          timeZone: profileData.timeZone || "Asia/Kolkata",
          taxSystem: profileData.taxSystem || "GST",
          gstin: profileData.gstin || null,
          pan: profileData.pan || null,
        },
      });

      const branch = await tx.branch.create({
        data: {
          businessProfileId: bp.id,
          name: "Main Branch",
          isMain: true,
        }
      });

      await tx.businessMember.create({
        data: {
          userId: session.userId,
          businessProfileId: bp.id,
          role: "OWNER",
          branchId: branch.id,
          status: "ACTIVE"
        }
      });

      return bp;
    });

    // If payment method provided, create it
    if (body.paymentMethod) {
      const pmParsed = paymentMethodSchema.safeParse(body.paymentMethod);
      if (pmParsed.success) {
        await prisma.paymentMethod.create({
          data: {
            businessProfileId: profile.id,
            type: pmParsed.data.type,
            value: pmParsed.data.value,
            isDefault: pmParsed.data.isDefault,
          },
        });
      }
    }

    // Fetch the complete profile with payment methods and branches
    const completeProfile = await prisma.businessProfile.findUnique({
      where: { id: profile.id },
      include: { 
        paymentMethods: true,
        branches: true,
        members: true
      },
    });

    return NextResponse.json({ profile: completeProfile }, { status: 201 });
  } catch (error) {
    console.error("Business profile creation error:", error);
    return NextResponse.json(
      { error: "Failed to create business profile" },
      { status: 500 }
    );
  }
}

// PUT — update an existing business profile
export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.businessProfile.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const profileParsed = businessProfileSchema.partial().safeParse(updateData);
    if (!profileParsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: profileParsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.businessProfile.update({
      where: { id },
      data: profileParsed.data,
      include: { paymentMethods: true },
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error("Business profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update business profile" },
      { status: 500 }
    );
  }
}
