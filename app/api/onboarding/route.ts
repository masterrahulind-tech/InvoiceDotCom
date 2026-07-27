import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please authenticate first." }, { status: 401 });
    }

    const body = await req.json();
    const { country, businessType, orgInfo, ownerInfo, planId } = body;

    // 1. Create or ensure SubscriptionPlan exists (basic mock if it doesn't)
    let plan = await prisma.subscriptionPlan.findFirst({ where: { name: planId === 'pro' ? 'Professional' : 'Free' } });
    if (!plan) {
      plan = await prisma.subscriptionPlan.create({
        data: {
          name: planId === 'pro' ? 'Professional' : 'Free',
          priceMonthly: planId === 'pro' ? 499 : 0,
          priceYearly: planId === 'pro' ? 4990 : 0,
          features: JSON.stringify(["Unlimited Invoices", "Basic Reporting"])
        }
      });
    }

    // 2. Create the BusinessProfile (Tenant)
    const businessProfile = await prisma.businessProfile.create({
      data: {
        userId: user.id,
        businessName: orgInfo.name,
        businessType: "registered",
        vertical: businessType,
        gstin: orgInfo.gstin,
        country: country,
        currency: orgInfo.currency,
        isVerified: true, // Auto verify since they did OTP
        members: {
          create: {
            userId: user.id,
            role: "OWNER"
          }
        },
        branches: {
          create: {
            name: "Head Office",
            isMain: true
          }
        },
        subscription: {
          create: {
            planId: plan.id,
            status: "active"
          }
        }
      }
    });

    return NextResponse.json({ success: true, businessProfileId: businessProfile.id });
  } catch (error: any) {
    console.error("Workspace Provisioning Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
