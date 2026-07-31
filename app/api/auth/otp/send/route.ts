import { NextRequest, NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { otpSendSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = otpSendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { identifier } = parsed.data;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP before storing
    const otpHash = hashSync(otp, 10);

    // Set expiry to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Invalidate any previous OTPs for this identifier
    await prisma.otpToken.updateMany({
      where: { identifier, verified: false },
      data: { verified: true },
    });

    // Store new OTP
    await prisma.otpToken.create({
      data: {
        identifier,
        otpHash,
        expiresAt,
      },
    });

    // In production, send OTP via SMS (Twilio/MSG91) or Email (Resend/SendGrid)
    // For local dev, log the OTP to console
    console.log(`[DEV] OTP for ${identifier}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // Include OTP in dev mode for testing
      ...(process.env.NODE_ENV !== "production" && { dev_otp: otp }),
    });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
