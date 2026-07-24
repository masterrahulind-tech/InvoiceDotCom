"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type Step = "phone" | "otp";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [step, setStep] = useState<Step>("phone");
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
        body: JSON.stringify({ phone }),
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
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to verify OTP");
        return;
      }

      router.push(redirect);
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
          <h5 className="h3">Login</h5>
          <p className="text-muted mb-0">Sign in to your account to continue.</p>
        </div>

        {step === "phone" ? (
          <form className="login-signup-form" onSubmit={handleSendOtp}>
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
                  autoFocus
                />
              </div>
            </div>

            {error && <p className="small text-danger mb-2">{error}</p>}

            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="btn btn-lg d-block w-100 solid-btn border-radius mt-4 mb-3"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
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
              {loading ? "Verifying..." : "Verify & Log In"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError(null);
                setDevOtp(null);
              }}
              className="btn btn-link text-muted p-0 border-0"
              style={{ fontSize: "0.85rem" }}
            >
              &larr; Change phone number
            </button>
          </form>
        )}
      </div>
      <div className="card-footer bg-transparent border-top px-md-5">
        <small>Not registered?</small>
        <Link href="/signup" className="small"> Create account</Link>
      </div>
    </div>
  );
}

export function LoginView() {
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
                <h1 className="text-white">Welcome Back!</h1>
                <p className="lead">
                  Keep your business running smoothly with GST-compliant invoicing, inventory
                  management, and party ledgers — all in one place.
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
                <LoginForm />
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
