import { NextRequest, NextResponse } from "next/server";
import { hashSync, compareSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { identifier, otp, newPassword } = parsed.data;

    const tokenRecord = await prisma.otpToken.findFirst({
      where: {
        identifier,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    const isValid = compareSync(otp, tokenRecord.otpHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = hashSync(newPassword, 10);

    // Update the user's password
    await prisma.user.updateMany({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      },
      data: { passwordHash },
    });

    // Mark OTP as verified
    await prisma.otpToken.update({
      where: { id: tokenRecord.id },
      data: { verified: true },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
