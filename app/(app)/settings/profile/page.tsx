"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Step = "type" | "localization" | "details" | "payment";

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
  
  // Localization state
  const [country, setCountry] = useState("India");
  const [currency, setCurrency] = useState("INR");
  const [language, setLanguage] = useState("English");
  const [timeZone, setTimeZone] = useState("Asia/Kolkata");
  const [taxSystem, setTaxSystem] = useState("GST");
  
  // Tax and payment details
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
          setCountry(profile.country || "India");
          setCurrency(profile.currency || "INR");
          setLanguage(profile.language || "English");
          setTimeZone(profile.timeZone || "Asia/Kolkata");
          setTaxSystem(profile.taxSystem || "GST");
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
            country,
            currency,
            language,
            timeZone,
            taxSystem,
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
    <div className="w-full">
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
        {["type", "localization", "details", "payment"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                step === s
                  ? "bg-black text-white"
                  : i < ["type", "localization", "details", "payment"].indexOf(step)
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {i + 1}
            </div>
            {i < 3 && (
              <div
                className={`h-0.5 w-8 sm:w-12 ${
                  i < ["type", "localization", "details", "payment"].indexOf(step)
                    ? "bg-green-300"
                    : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div>
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
              onClick={() => setStep("localization")}
              disabled={!vertical}
              className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 1.5: Localization */}
        {step === "localization" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Global Settings</h2>
            <p className="text-sm text-gray-600">
              These settings determine your currency, time zone, and primary tax system.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="UAE">UAE</option>
                  <option value="Australia">Australia</option>
                  <option value="Canada">Canada</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="GBP">£ GBP (British Pound)</option>
                  <option value="AED">د.إ AED (UAE Dirham)</option>
                  <option value="AUD">$ AUD (Australian Dollar)</option>
                  <option value="CAD">$ CAD (Canadian Dollar)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tax System</label>
                <select
                  value={taxSystem}
                  onChange={(e) => setTaxSystem(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="GST">GST (India, Canada, Australia)</option>
                  <option value="VAT">VAT (UK, UAE)</option>
                  <option value="SalesTax">Sales Tax (US)</option>
                  <option value="None">No Tax</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep("type")}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep("details")}
                className="flex-1 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                Continue
              </button>
            </div>
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

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep("localization")}
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
  );
}
