import { ForgotPasswordView } from "@/features/auth/components/ForgotPasswordView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | InvoiceDotCom",
  description: "Reset your password securely via OTP to regain access to your account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
