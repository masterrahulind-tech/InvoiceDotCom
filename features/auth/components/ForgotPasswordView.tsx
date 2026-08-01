"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = "phone" | "reset";

function ForgotPasswordForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("phone");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        return;
      }

      setStep("reset");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        return;
      }

      router.push("/login");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card login-signup-card shadow-lg mb-0">
      <div className="card-body px-md-5 py-5">
        <div className="mb-5">
          <h5 className="h3">Reset Password</h5>
          <p className="text-muted mb-0">Verify your identity to set a new password.</p>
        </div>

        {step === "phone" ? (
          <form className="login-signup-form" onSubmit={handleSendOtp}>
            <div className="form-group mb-3">
              <label className="pb-1">Email or Phone Number</label>
              <div className="input-group input-group-merge">
                <div className="input-icon">
                  <span className="ti-user color-primary"></span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your email or phone"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && <p className="small text-danger mb-2">{error}</p>}

            <button
              type="submit"
              disabled={loading || identifier.length < 5}
              className="btn btn-lg d-block w-100 solid-btn border-radius mt-4 mb-3"
            >
              {loading ? "Sending OTP..." : "Send Reset OTP"}
            </button>
          </form>
        ) : (
          <form className="login-signup-form" onSubmit={handleResetPassword}>
            <div className="form-group mb-3">
              <label className="pb-1">Enter OTP</label>
              <div className="input-group input-group-merge">
                <div className="input-icon">
                  <span className="ti-unlock color-primary"></span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-control"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  required
                  autoFocus
                  style={{ letterSpacing: "0.2em", fontWeight: "bold" }}
                />
              </div>
              <small className="form-text text-muted mt-2">
                We sent a 6-digit code to <strong>{identifier}</strong>.
              </small>
            </div>

            <div className="form-group mb-3">
              <label className="pb-1">New Password</label>
              <div className="input-group input-group-merge">
                <div className="input-icon">
                  <span className="ti-lock color-primary"></span>
                </div>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && <p className="small text-danger mb-2">{error}</p>}

            <button
              type="submit"
              disabled={loading || otp.length !== 6 || newPassword.length < 6}
              className="btn btn-lg d-block w-100 solid-btn border-radius mt-4 mb-3"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setNewPassword("");
                setError(null);
              }}
              className="btn btn-link text-muted p-0 border-0"
              style={{ fontSize: "0.85rem" }}
            >
              &larr; Change email or phone
            </button>
          </form>
        )}
      </div>
      <div className="card-footer bg-transparent border-top px-md-5">
        <small>Remembered your password?</small>
        <Link href="/login" className="small"> Sign in</Link>
      </div>
    </div>
  );
}

export function ForgotPasswordView() {
  return (
    <>
      <section
        className="hero-section ptb-100 background-img full-screen"
        style={{ background: "url('/assets/hero-bg-1.jpg') no-repeat center center / cover" }}
      >
        <div className="container">
          <div className="row align-items-center justify-content-between pt-5 pt-sm-5 pt-md-5 pt-lg-0">
            <div className="col-md-7 col-lg-6">
              <div className="hero-content-left text-white">
                <h1 className="text-white">Reset Password</h1>
                <p className="lead">
                  Don't worry, it happens to the best of us. Verify your identity with an OTP to reset your password and get back into your account safely.
                </p>
                <div className="mt-5">
                  <Link href="/" className="btn btn-outline-light">
                    &larr; Back to Home
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-5 col-lg-5">
              <Suspense
                fallback={
                  <div className="text-center text-white p-5">Loading...</div>
                }
              >
                <ForgotPasswordForm />
              </Suspense>
            </div>
          </div>
        </div>
        <div className="bottom-img-absolute">
          <img src="/assets/hero-bg-shape-1.svg" alt="wave shape" className="img-fluid" />
        </div>
      </section>
    </>
  );
}
