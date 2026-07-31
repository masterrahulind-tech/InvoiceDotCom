import { NextRequest, NextResponse } from "next/server";
import { compareSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, AUTH_COOKIE_NAME } from "@/lib/auth";
import { otpVerifySchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = otpVerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { identifier, otp, name } = parsed.data;

    // Find the most recent unverified OTP for this identifier
    const otpRecord = await prisma.otpToken.findFirst({
      where: {
        identifier,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "OTP expired or not found. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify OTP hash
    const isValid = compareSync(otp, otpRecord.otpHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    await prisma.otpToken.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    const isEmail = identifier.includes("@");
    const whereClause = isEmail ? { email: identifier } : { phone: identifier };

    // Find or create user
    let user = await prisma.user.findFirst({
      where: whereClause,
    });

    const isNewUser = !user;

    if (!user) {
      // Create new user (signup flow)
      user = await prisma.user.create({
        data: {
          email: isEmail ? identifier : null,
          phone: !isEmail ? identifier : null,
          name: name || "User",
        },
      });
    }

    // Create JWT session
    const token = await createSession({
      id: user.id,
      phone: user.phone || "",
      name: user.name,
    });

    // Set httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
      },
      isNewUser,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
