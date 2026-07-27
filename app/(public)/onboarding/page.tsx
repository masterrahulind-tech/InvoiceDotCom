"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Globe, 
  Store, 
  Building2, 
  UserCircle, 
  ShieldCheck, 
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2
} from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [country, setCountry] = useState("India");
  const [businessType, setBusinessType] = useState("retail");
  const [orgInfo, setOrgInfo] = useState({ name: "", gstin: "", currency: "INR" });
  const [ownerInfo, setOwnerInfo] = useState({ name: "", phone: "" });
  const [otp, setOtp] = useState("");
  const [planId, setPlanId] = useState("free");

  const handleNext = () => setStep((s) => Math.min(s + 1, 7) as Step);
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const handleSendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: ownerInfo.phone, name: ownerInfo.name }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      handleNext(); // Go to step 5 (Verification)
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: ownerInfo.phone, otp, name: ownerInfo.name }),
      });
      if (!res.ok) throw new Error("Invalid OTP");
      handleNext(); // Go to step 6 (Subscription)
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 7: Create Workspace API Call
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          businessType,
          orgInfo,
          ownerInfo,
          planId
        }),
      });
      if (!res.ok) throw new Error("Failed to provision workspace");
      
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header Progress */}
        <div className="bg-[#1f2029] p-6 text-white text-center">
          <h2 className="text-2xl font-bold tracking-tight">Set up your workspace</h2>
          <div className="flex items-center justify-center mt-6 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div 
                key={s} 
                className={`h-2 w-10 rounded-full ${s <= step ? 'bg-[#6730e3]' : 'bg-white/20'}`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Step {step} of 7</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* STEP 1: Country */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-[#6730e3]" />
                <h3 className="text-xl font-bold text-gray-900">Choose your country</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {["India", "United States", "United Kingdom", "Australia", "UAE", "Singapore"].map(c => (
                  <button
                    key={c}
                    onClick={() => setCountry(c)}
                    className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${
                      country === c ? 'border-[#6730e3] bg-purple-50 text-[#6730e3]' : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="pt-6 flex justify-end">
                <button onClick={handleNext} className="btn-primary flex items-center gap-2">Next <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* STEP 2: Business Type */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Store className="w-6 h-6 text-[#6730e3]" />
                <h3 className="text-xl font-bold text-gray-900">Choose your business type</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["retail", "wholesale", "school", "hospital", "freelance", "restaurant"].map(type => (
                  <button
                    key={type}
                    onClick={() => setBusinessType(type)}
                    className={`p-4 rounded-xl border-2 text-center font-medium capitalize transition-all ${
                      businessType === type ? 'border-[#6730e3] bg-purple-50 text-[#6730e3]' : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="pt-6 flex justify-between">
                <button onClick={handlePrev} className="text-gray-500 font-medium">Back</button>
                <button onClick={handleNext} className="btn-primary flex items-center gap-2">Next <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* STEP 3: Organization Info */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-6 h-6 text-[#6730e3]" />
                <h3 className="text-xl font-bold text-gray-900">Organization Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input 
                    type="text" 
                    value={orgInfo.name} 
                    onChange={e => setOrgInfo({...orgInfo, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6730e3] focus:border-transparent outline-none"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Registration No (Optional)</label>
                  <input 
                    type="text" 
                    value={orgInfo.gstin} 
                    onChange={e => setOrgInfo({...orgInfo, gstin: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6730e3] focus:border-transparent outline-none"
                    placeholder="e.g. 27AAAAA1234A1Z5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Currency</label>
                  <select 
                    value={orgInfo.currency} 
                    onChange={e => setOrgInfo({...orgInfo, currency: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
              <div className="pt-6 flex justify-between">
                <button onClick={handlePrev} className="text-gray-500 font-medium">Back</button>
                <button onClick={handleNext} disabled={!orgInfo.name} className="btn-primary flex items-center gap-2">Next <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* STEP 4: Owner Account */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <UserCircle className="w-6 h-6 text-[#6730e3]" />
                <h3 className="text-xl font-bold text-gray-900">Owner Account Details</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Full Name</label>
                  <input 
                    type="text" 
                    value={ownerInfo.name} 
                    onChange={e => setOwnerInfo({...ownerInfo, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input 
                    type="tel" 
                    value={ownerInfo.phone} 
                    onChange={e => setOwnerInfo({...ownerInfo, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    placeholder="9876543210"
                  />
                </div>
              </div>
              <div className="pt-6 flex justify-between">
                <button onClick={handlePrev} className="text-gray-500 font-medium">Back</button>
                <button 
                  onClick={handleSendOtp} 
                  disabled={loading || !ownerInfo.name || ownerInfo.phone.length < 10} 
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Verification */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-6 h-6 text-[#6730e3]" />
                <h3 className="text-xl font-bold text-gray-900">Verify Mobile Number</h3>
              </div>
              <p className="text-sm text-gray-600">We sent a 6-digit code to {ownerInfo.phone}. Enter it below.</p>
              
              <div className="mt-4">
                <input 
                  type="text" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold border border-gray-300 rounded-lg outline-none"
                  placeholder="000000"
                />
              </div>

              <div className="pt-6 flex justify-between">
                <button onClick={handlePrev} className="text-gray-500 font-medium">Back</button>
                <button 
                  onClick={handleVerifyOtp} 
                  disabled={loading || otp.length !== 6} 
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Subscription */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-[#6730e3]" />
                <h3 className="text-xl font-bold text-gray-900">Choose your Plan</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => setPlanId("free")}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${planId === "free" ? "border-[#6730e3] bg-purple-50" : "border-gray-200"}`}
                >
                  <h4 className="font-bold text-lg">Free</h4>
                  <p className="text-3xl font-black mt-2">₹0<span className="text-sm font-medium text-gray-500">/mo</span></p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Unlimited Invoices</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> 1 Branch</li>
                  </ul>
                </div>
                
                <div 
                  onClick={() => setPlanId("pro")}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${planId === "pro" ? "border-[#6730e3] bg-purple-50" : "border-gray-200"}`}
                >
                  <h4 className="font-bold text-lg">Professional</h4>
                  <p className="text-3xl font-black mt-2">₹499<span className="text-sm font-medium text-gray-500">/mo</span></p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> All Free Features</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Multi-branch Support</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Advanced Analytics</li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 flex justify-between">
                <button onClick={handlePrev} className="text-gray-500 font-medium">Back</button>
                <button onClick={handleNext} className="btn-primary flex items-center gap-2">Next <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* STEP 7: Workspace Creation */}
          {step === 7 && (
            <div className="space-y-6 text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">You're all set!</h3>
              <p className="text-gray-500">
                We are ready to create your workspace for <strong>{orgInfo.name}</strong> on the <strong>{planId.toUpperCase()}</strong> plan.
              </p>
              
              <div className="pt-8 flex justify-center gap-4">
                <button onClick={handlePrev} disabled={loading} className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl">Go Back</button>
                <button 
                  onClick={handleComplete} 
                  disabled={loading}
                  className="px-8 py-3 bg-[#6730e3] text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 flex items-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Provisioning Workspace...</>
                  ) : (
                    'Create My Workspace'
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      
      <style jsx>{`
        .btn-primary {
          padding: 0.75rem 1.5rem;
          background-color: #1f2029;
          color: white;
          font-weight: 600;
          border-radius: 0.75rem;
          transition: all 0.2s;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: #333;
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
