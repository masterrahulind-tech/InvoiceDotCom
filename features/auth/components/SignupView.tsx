"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account");
        return;
      }

      // After successful signup, go to onboarding to complete business profile
      router.push("/onboarding");
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
          <h6 className="h3">Create account</h6>
          <p className="text-muted mb-0">Made with love by developers for developers.</p>
        </div>

        <form className="login-signup-form" onSubmit={handleSignup}>
          <div className="form-group mb-3">
            <label className="pb-1">Your Name</label>
            <div className="input-group input-group-merge">
              <div className="input-icon">
                <span className="ti-user color-primary"></span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group mb-3">
            <label className="pb-1">Email or Phone Number</label>
            <div className="input-group input-group-merge">
              <div className="input-icon">
                <span className="ti-email color-primary"></span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group mb-3">
            <label className="pb-1">Password</label>
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
                minLength={6}
              />
            </div>
          </div>

          <div className="my-4">
            <div className="custom-control custom-checkbox mb-3">
              <input type="checkbox" className="custom-control-input" id="check-terms" required />
              <label className="custom-control-label" htmlFor="check-terms">
                I agree to the <Link href="#">terms and conditions</Link>
              </label>
            </div>
          </div>

          {error && <p className="small text-danger mb-2">{error}</p>}

          <button
            type="submit"
            disabled={loading || identifier.length < 5 || !name || password.length < 6}
            className="btn btn-lg d-block w-100 solid-btn border-radius mt-4 mb-3"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
      </div>
      <div className="card-footer px-md-5 bg-transparent border-top">
        <small>Already have an account?</small>
        <Link href="/login" className="small"> Sign in</Link>
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
                <h1 className="text-white">Create Your Account</h1>
                <p className="lead">
                  Keep your face always toward the sunshine - and shadows will fall behind you.
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
          <img src="/assets/hero-bg-shape-1.svg" alt="wave shape" className="img-fluid" />
        </div>
      </section>
    </>
  );
}
