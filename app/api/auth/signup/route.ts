import { NextRequest, NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validators/auth";
import { createSession, AUTH_COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { identifier, name, password } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Account already exists with this email or phone number. Please log in." },
        { status: 400 }
      );
    }

    const isEmail = identifier.includes("@");
    const passwordHash = hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: isEmail ? identifier : null,
        phone: !isEmail ? identifier : null,
        passwordHash,
      },
    });

    const sessionToken = await createSession({
      id: user.id,
      identifier: identifier,
      name: user.name,
    });

    const cookieStore = await cookies();
    cookieStore.set({
      name: AUTH_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
