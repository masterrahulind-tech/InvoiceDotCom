"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Step = "type" | "details" | "payment";

const VERTICALS = [
  { value: "real_estate", label: "Real Estate" },
  { value: "restaurant", label: "Restaurant / Food" },
  { value: "school", label: "School / Education" },
  { value: "retail", label: "Retail / Shop" },
  { value: "freelance", label: "Freelance / Services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "logistics", label: "Logistics / Transport" },
  { value: "events", label: "Events / Wedding Planning" },
  { value: "other", label: "Other" },
];

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("type");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  // Form state
  const [businessType, setBusinessType] = useState<"individual" | "registered">("individual");
  const [businessName, setBusinessName] = useState("");
  const [vertical, setVertical] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [upiId, setUpiId] = useState("");

  // Check for existing profile
  useEffect(() => {
    async function checkProfile() {
      try {
        const res = await fetch("/api/business-profiles");
        const data = await res.json();
        if (data.profiles && data.profiles.length > 0) {
          setHasExistingProfile(true);
          const profile = data.profiles[0];
          setBusinessType(profile.businessType);
          setBusinessName(profile.businessName);
          setVertical(profile.vertical);
          setGstin(profile.gstin || "");
          setPan(profile.pan || "");
          if (profile.paymentMethods?.length > 0) {
            const pm = profile.paymentMethods.find((p: { isDefault: boolean }) => p.isDefault) || profile.paymentMethods[0];
            setUpiId(pm.value);
          }
        }
      } catch {
        // Ignore — will show empty form
      }
    }
    checkProfile();
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/business-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessProfile: {
            businessName,
            businessType,
            vertical,
            gstin: gstin || null,
            pan: pan || null,
          },
          paymentMethod: upiId
            ? { type: "upi", value: upiId, isDefault: true }
            : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save profile");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            {hasExistingProfile ? "Edit Business Profile" : "Set Up Your Business Profile"}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {hasExistingProfile
              ? "Update your business details below."
              : "Tell us about your business so we can customize your invoice templates."}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8 flex items-center gap-2">
          {["type", "details", "payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                  step === s
                    ? "bg-black text-white"
                    : i < ["type", "details", "payment"].indexOf(step)
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && (
                <div
                  className={`h-0.5 w-12 ${
                    i < ["type", "details", "payment"].indexOf(step)
                      ? "bg-green-300"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* Step 1: Business Type */}
          {step === "type" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Are you an individual or a registered business?</h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setBusinessType("individual")}
                  className={`rounded-xl border-2 p-6 text-left transition-all ${
                    businessType === "individual"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">👤</div>
                  <div className="font-medium">Individual</div>
                  <div className="mt-1 text-xs text-gray-500">
                    Freelancer, broker, tutor, vendor
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBusinessType("registered")}
                  className={`rounded-xl border-2 p-6 text-left transition-all ${
                    businessType === "registered"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">🏢</div>
                  <div className="font-medium">Registered Business</div>
                  <div className="mt-1 text-xs text-gray-500">
                    Pvt Ltd, LLP, Proprietorship
                  </div>
                </button>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Business Category
                </label>
                <select
                  value={vertical}
                  onChange={(e) => setVertical(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="">Select your business type</option>
                  {VERTICALS.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setStep("details")}
                disabled={!vertical}
                className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Business Details */}
          {step === "details" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Business Details</h2>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Business Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your business or brand name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  autoFocus
                />
              </div>

              {businessType === "registered" && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      GSTIN <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="22AAAAA0000A1Z5"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      PAN <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="AAAAA0000A"
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("type")}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep("payment")}
                  disabled={!businessName}
                  className="flex-1 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Method */}
          {step === "payment" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Payment Method</h2>
              <p className="text-sm text-gray-600">
                Add your UPI ID so customers can pay you directly via your invoices.
              </p>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  UPI ID
                </label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-400">
                  This will appear on your invoices. You can add more methods later.
                </p>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Complete Setup"}
                </button>
              </div>

              {!upiId && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  Skip for now →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
