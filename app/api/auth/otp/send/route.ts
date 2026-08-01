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

    // Verify user exists since OTP is now only for password reset
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email or phone number" },
        { status: 404 }
      );
    }

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

    // Send email using Resend if an API key is available
    const resendApiKey = process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_API_KEY;
    
    if (resendApiKey && identifier.includes("@")) {
      const { Resend } = require("resend");
      const resend = new Resend(resendApiKey);
      
      try {
        await resend.emails.send({
          from: 'InvoiceDotCom <onboarding@resend.dev>',
          to: identifier,
          subject: 'Your Password Reset OTP',
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e8ecf1; border-radius: 12px;">
              <h2 style="color: #1f2029; margin-top: 0;">Password Reset Request</h2>
              <p style="color: #6c757d; font-size: 15px;">You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed.</p>
              
              <div style="background: #f4f7fa; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #6730e3;">${otp}</span>
              </div>
              
              <p style="color: #6c757d; font-size: 14px;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
            </div>
          `,
        });
      } catch (err) {
        console.error("Failed to send OTP email via Resend:", err);
      }
    } else {
      console.log(`[DEV ONLY - NO API KEY] OTP for ${identifier}: ${otp}`);
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
