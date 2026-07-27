"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [businessType, setBusinessType] = useState<"individual" | "registered">("individual");
  const [businessName, setBusinessName] = useState("");
  const [vertical, setVertical] = useState("");
  
  // Localization state
  const [country, setCountry] = useState("India");
  const [currency, setCurrency] = useState("INR");
  
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
          const profile = data.profiles[0];
          setBusinessType(profile.businessType || "individual");
          setBusinessName(profile.businessName || "");
          setVertical(profile.vertical || "");
          setCountry(profile.country || "India");
          setCurrency(profile.currency || "INR");
          setGstin(profile.gstin || "");
          setPan(profile.pan || "");
          if (profile.paymentMethods?.length > 0) {
            const pm = profile.paymentMethods.find((p: { isDefault: boolean }) => p.isDefault) || profile.paymentMethods[0];
            setUpiId(pm.value);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    }
    checkProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/business-profiles", {
        method: "POST", // Upserts the profile
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessProfile: {
            businessName,
            businessType,
            vertical,
            country,
            currency,
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
      
      setSuccessMsg("Profile updated successfully!");
      
      // Auto-hide success message
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1f2029' }}>Organization Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your business details, tax information, and primary currency.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
        
        {/* Section 1: Basic Info */}
        <div>
          <h2 className="text-lg font-semibold border-b pb-2 mb-4" style={{ color: '#1f2029' }}>Basic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Business Name *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Industry / Vertical</label>
              <select
                value={vertical}
                onChange={(e) => setVertical(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select industry</option>
                <option value="retail">Retail / Shop</option>
                <option value="wholesale">Wholesale</option>
                <option value="freelance">Freelance / Services</option>
                <option value="school">School / Education</option>
                <option value="restaurant">Restaurant / F&B</option>
                <option value="logistics">Logistics / Transport</option>
                <option value="healthcare">Healthcare</option>
                <option value="tech">Technology</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Business Type</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as "individual" | "registered")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="individual">Individual (Freelancer, Vendor)</option>
                <option value="registered">Registered Business (LLP, Pvt Ltd)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Localization */}
        <div>
          <h2 className="text-lg font-semibold border-b pb-2 mb-4" style={{ color: '#1f2029' }}>Localization & Currency</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="UAE">UAE</option>
                <option value="Australia">Australia</option>
                <option value="Singapore">Singapore</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Base Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Tax & Payment */}
        <div>
          <h2 className="text-lg font-semibold border-b pb-2 mb-4" style={{ color: '#1f2029' }}>Tax & Payments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">GSTIN / VAT Number</label>
              <input
                type="text"
                placeholder="Tax registration number"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm uppercase focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">UPI ID (Default Payment)</label>
              <input
                type="text"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100"><i className="ti-alert mr-1"></i> {error}</div>}
        {successMsg && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100"><i className="ti-check-box mr-1"></i> {successMsg}</div>}

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={loading || !businessName}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50 shadow-sm"
            style={{ backgroundColor: '#6730e3' }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
