"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type Step = "info" | "otp";

function SignupForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("info");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
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
        body: JSON.stringify({ phone, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        return;
      }

      if (data.dev_otp) {
        setDevOtp(data.dev_otp);
      }

      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to verify OTP");
        return;
      }

      // New user → go to onboarding, existing user → dashboard
      if (data.isNewUser) {
        router.push("/settings/profile");
      } else {
        router.push("/dashboard");
      }
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
          <h5 className="h3">Create Account</h5>
          <p className="text-muted mb-0">Register for your free account.</p>
        </div>

        {step === "info" ? (
          <form className="login-signup-form" onSubmit={handleSendOtp}>
            <div className="form-group mb-3">
              <label className="pb-1">Your Name</label>
              <div className="input-group input-group-merge">
                <div className="input-icon">
                  <span className="ti-user color-primary"></span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="pb-1">Phone Number</label>
              <div className="input-group input-group-merge">
                <div className="input-icon">
                  <span className="ti-mobile color-primary"></span>
                </div>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className="small text-danger mb-2">{error}</p>}

            <button
              type="submit"
              disabled={loading || !name || phone.length < 10}
              className="btn btn-lg d-block w-100 solid-btn border-radius mt-4 mb-3"
            >
              {loading ? "Sending OTP..." : "Continue with OTP"}
            </button>
          </form>
        ) : (
          <form className="login-signup-form" onSubmit={handleVerifyOtp}>
            <div className="form-group mb-3">
              <label className="pb-1">Enter OTP</label>
              <div className="input-group input-group-merge">
                <div className="input-icon">
                  <span className="ti-lock color-primary"></span>
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
                We sent a 6-digit code to {phone}
              </small>
            </div>

            {devOtp && (
              <div className="alert alert-warning py-2 mb-3">
                <small className="mb-0 fw-bold">Dev Mode OTP: {devOtp}</small>
              </div>
            )}

            {error && <p className="small text-danger mb-2">{error}</p>}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn btn-lg d-block w-100 solid-btn border-radius mt-4 mb-3"
            >
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("info");
                setOtp("");
                setError(null);
                setDevOtp(null);
              }}
              className="btn btn-link text-muted p-0 border-0"
              style={{ fontSize: "0.85rem" }}
            >
              &larr; Go back
            </button>
          </form>
        )}
      </div>
      <div className="card-footer bg-transparent border-top px-md-5">
        <small>Already have an account?</small>
        <Link href="/login" className="small"> Log in</Link>
      </div>
    </div>
  );
}

export function SignupView() {
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
                <h1 className="text-white">Create Account</h1>
                <p className="lead">
                  Start managing your GST billing, inventory, and accounting today.
                  Join thousands of businesses streamlining their operations.
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
                <SignupForm />
              </Suspense>
            </div>
          </div>
        </div>
        <div className="bottom-img-absolute">
          {/* Using img tag because Next/Image won't easily work with static SVGs loaded this way without dimensions */}
          <img src="/assets/hero-bg-shape-1.svg" alt="wave shape" className="img-fluid" />
        </div>
      </section>
    </>
  );
}
