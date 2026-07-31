"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to log in");
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

        <form className="login-signup-form" onSubmit={handleLogin}>
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

          <div className="form-group mb-3">
            <div className="d-flex justify-content-between align-items-center pb-1">
              <label className="mb-0">Password</label>
              <Link href="/forgot-password" className="small text-primary">
                Forgot Password?
              </Link>
            </div>
            <div className="input-group input-group-merge">
              <div className="input-icon">
                <span className="ti-lock color-primary"></span>
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="small text-danger mb-2">{error}</p>}

          <button
            type="submit"
            disabled={loading || identifier.length < 5 || !password}
            className="btn btn-lg d-block w-100 solid-btn border-radius mt-4 mb-3"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
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
