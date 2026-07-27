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
  ArrowLeft,
  Loader2,
  MapPin,
  Briefcase,
  Building,
  GraduationCap,
  HeartPulse,
  Utensils,
  Truck,
  Monitor
} from "lucide-react";
import Link from "next/link";

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
      if (!res.ok) throw new Error("Failed to send OTP. Please check your number.");
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
      if (!res.ok) throw new Error("Invalid or expired OTP");
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

  const businessTypes = [
    { id: "retail", label: "Retail", icon: Store },
    { id: "wholesale", label: "Wholesale", icon: Building },
    { id: "freelance", label: "Services", icon: Briefcase },
    { id: "school", label: "Education", icon: GraduationCap },
    { id: "restaurant", label: "F&B", icon: Utensils },
    { id: "logistics", label: "Logistics", icon: Truck },
    { id: "healthcare", label: "Healthcare", icon: HeartPulse },
    { id: "tech", label: "Technology", icon: Monitor },
  ];

  return (
    <div className="min-h-screen flex w-full bg-white font-sans">
      
      {/* Left Column - Branding (Zoho Style) */}
      <div className="hidden lg:flex w-[45%] bg-[#1a1b23] text-white flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6730e3] to-[#4a1fb8] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="font-bold text-xl text-white">I</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">InvoiceDotCom</span>
          </div>

          <div className="mt-auto mb-auto">
            <h1 className="text-[2.75rem] leading-[1.15] font-bold mb-6 tracking-tight">
              Manage your entire <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">business</span> in one place.
            </h1>
            <p className="text-gray-400 text-lg mb-12 max-w-md leading-relaxed">
              Join thousands of businesses who trust InvoiceDotCom for their billing, inventory, compliance, and growth.
            </p>
            
            <div className="space-y-6">
              {[
                "GST Billing & E-Invoicing",
                "Real-time Inventory Management",
                "Automated Payment Reminders",
                "Multi-branch & User Access Control"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="text-purple-400 w-4 h-4" />
                  </div>
                  <span className="font-medium text-gray-300 text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-sm text-gray-500 flex items-center gap-4">
            <span>© 2026 InvoiceDotCom Inc.</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute -bottom-[200px] -left-[200px] w-[600px] h-[600px] bg-[#6730e3] rounded-full mix-blend-screen filter blur-[150px] opacity-30 pointer-events-none"></div>
        <div className="absolute -top-[100px] -right-[100px] w-[400px] h-[400px] bg-blue-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20 pointer-events-none"></div>
      </div>

      {/* Right Column - Wizard */}
      <div className="flex-1 flex flex-col bg-white relative h-screen overflow-y-auto">
        
        {/* Progress Bar */}
        <div className="fixed top-0 right-0 left-0 lg:left-[45%] h-1.5 bg-gray-100 z-50">
          <div 
            className="h-full bg-gradient-to-r from-[#6730e3] to-blue-500 transition-all duration-500 ease-out" 
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#6730e3] rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-sm">I</span>
            </div>
            <span className="font-bold text-lg">InvoiceDotCom</span>
          </div>
          <span className="text-sm font-medium text-gray-500">Step {step} of 7</span>
        </div>

        <div className="flex-1 flex flex-col max-w-[560px] mx-auto w-full px-6 py-12 lg:py-24">
          
          {step > 1 && step < 7 && (
            <button 
              onClick={handlePrev} 
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors w-fit mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
          )}
          {step === 1 && <div className="mb-12"></div>}

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Country */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Where is your business located?</h2>
              <p className="text-gray-500 mb-10 text-lg">This helps us apply the correct tax rules and currency.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["India", "United States", "United Kingdom", "Australia", "UAE", "Singapore"].map(c => (
                  <button
                    key={c}
                    onClick={() => { setCountry(c); setTimeout(handleNext, 150); }}
                    className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 group ${
                      country === c 
                        ? 'border-[#6730e3] bg-[#f8f5ff] text-[#6730e3] ring-4 ring-[#6730e3]/10' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <MapPin className={`w-5 h-5 ${country === c ? 'text-[#6730e3]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="font-semibold text-base">{c}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Business Type */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">What best describes your business?</h2>
              <p className="text-gray-500 mb-10 text-lg">We'll customize your dashboard based on your industry.</p>
              
              <div className="grid grid-cols-2 gap-4">
                {businessTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => { setBusinessType(type.id); setTimeout(handleNext, 150); }}
                    className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col gap-3 group ${
                      businessType === type.id 
                        ? 'border-[#6730e3] bg-[#f8f5ff] text-[#6730e3] ring-4 ring-[#6730e3]/10' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <type.icon className={`w-6 h-6 ${businessType === type.id ? 'text-[#6730e3]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="font-semibold">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Organization Info */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Tell us about your organization</h2>
              <p className="text-gray-500 mb-10 text-lg">You can always update these details later in settings.</p>
              
              <div className="space-y-6 flex-1">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Name</label>
                  <input 
                    type="text" 
                    value={orgInfo.name} 
                    onChange={e => setOrgInfo({...orgInfo, name: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6730e3]/20 focus:border-[#6730e3] transition-all outline-none text-gray-900 text-lg"
                    placeholder="e.g. Acme Corporation"
                    autoFocus
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Base Currency</label>
                    <select 
                      value={orgInfo.currency} 
                      onChange={e => setOrgInfo({...orgInfo, currency: e.target.value})}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6730e3]/20 focus:border-[#6730e3] transition-all outline-none text-gray-900 text-lg appearance-none"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="AED">AED (د.إ)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Registration (Optional)</label>
                    <input 
                      type="text" 
                      value={orgInfo.gstin} 
                      onChange={e => setOrgInfo({...orgInfo, gstin: e.target.value})}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6730e3]/20 focus:border-[#6730e3] transition-all outline-none text-gray-900 text-lg uppercase"
                      placeholder="e.g. GSTIN / VAT"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-10">
                <button 
                  onClick={handleNext} 
                  disabled={!orgInfo.name} 
                  className="w-full sm:w-auto px-8 py-4 bg-[#6730e3] hover:bg-[#5527ba] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Owner Account */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your admin profile</h2>
              <p className="text-gray-500 mb-10 text-lg">We use your mobile number to keep your account secure.</p>
              
              <div className="space-y-6 flex-1">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={ownerInfo.name} 
                    onChange={e => setOwnerInfo({...ownerInfo, name: e.target.value})}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6730e3]/20 focus:border-[#6730e3] transition-all outline-none text-gray-900 text-lg"
                    placeholder="John Doe"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                  <div className="flex gap-3">
                    <div className="px-4 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-medium text-lg flex items-center justify-center shrink-0">
                      +91
                    </div>
                    <input 
                      type="tel" 
                      value={ownerInfo.phone} 
                      onChange={e => setOwnerInfo({...ownerInfo, phone: e.target.value.replace(/\D/g, "")})}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6730e3]/20 focus:border-[#6730e3] transition-all outline-none text-gray-900 text-lg tracking-wide"
                      placeholder="98765 43210"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-10">
                <button 
                  onClick={handleSendOtp} 
                  disabled={loading || !ownerInfo.name || ownerInfo.phone.length < 10} 
                  className="w-full sm:w-auto px-8 py-4 bg-[#1a1b23] hover:bg-black text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-xl shadow-gray-900/10"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Verification Code'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Verification */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Check your phone</h2>
              <p className="text-gray-500 mb-10 text-lg">We sent a 6-digit verification code to <span className="font-semibold text-gray-900">+91 {ownerInfo.phone.replace(/(\d{5})(\d{5})/, "$1 $2")}</span>.</p>
              
              <div className="flex-1">
                <input 
                  type="text" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full max-w-[320px] px-4 py-4 text-center text-3xl tracking-[0.5em] font-bold bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-[#6730e3] transition-all outline-none text-gray-900"
                  placeholder="------"
                  autoFocus
                />
                
                <p className="mt-6 text-sm text-gray-500">
                  Didn't receive the code? <button onClick={handleSendOtp} className="text-[#6730e3] font-semibold hover:underline">Resend OTP</button>
                </p>
              </div>

              <div className="pt-10">
                <button 
                  onClick={handleVerifyOtp} 
                  disabled={loading || otp.length !== 6} 
                  className="w-full sm:w-auto px-8 py-4 bg-[#6730e3] hover:bg-[#5527ba] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Subscription */}
          {step === 6 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose your plan</h2>
              <p className="text-gray-500 mb-8 text-lg">Select a plan that scales with your business.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                
                {/* Free Plan */}
                <div 
                  onClick={() => setPlanId("free")}
                  className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all ${
                    planId === "free" 
                      ? "border-[#6730e3] bg-[#f8f5ff] ring-4 ring-[#6730e3]/10" 
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-xl text-gray-900">Starter</h4>
                    {planId === "free" && <div className="w-5 h-5 bg-[#6730e3] rounded-full flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-white" /></div>}
                  </div>
                  <p className="text-4xl font-black text-gray-900 mb-1">₹0</p>
                  <p className="text-sm font-medium text-gray-500 mb-6">Free forever</p>
                  
                  <ul className="space-y-3 text-sm text-gray-700 font-medium">
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/> Unlimited Invoices</li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/> Up to 100 Clients</li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/> Single User</li>
                  </ul>
                </div>
                
                {/* Pro Plan */}
                <div 
                  onClick={() => setPlanId("pro")}
                  className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all ${
                    planId === "pro" 
                      ? "border-[#1a1b23] bg-gray-900 text-white shadow-xl shadow-gray-900/10 ring-4 ring-gray-900/10" 
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className={`font-bold text-xl ${planId === "pro" ? 'text-white' : 'text-gray-900'}`}>Professional</h4>
                    {planId === "pro" && <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-gray-900" /></div>}
                  </div>
                  <p className={`text-4xl font-black mb-1 ${planId === "pro" ? 'text-white' : 'text-gray-900'}`}>₹499</p>
                  <p className={`text-sm font-medium mb-6 ${planId === "pro" ? 'text-gray-400' : 'text-gray-500'}`}>per month, billed annually</p>
                  
                  <ul className={`space-y-3 text-sm font-medium ${planId === "pro" ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0"/> Everything in Starter</li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0"/> Multi-branch & Staff Roles</li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0"/> Advanced Inventory & POS</li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0"/> Dedicated Support</li>
                  </ul>
                </div>
              </div>

              <div className="pt-10">
                <button 
                  onClick={handleNext} 
                  className="w-full sm:w-auto px-8 py-4 bg-[#6730e3] hover:bg-[#5527ba] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
                >
                  Continue to Final Step <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Workspace Creation */}
          {step === 7 && (
            <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center h-full text-center py-12">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 relative z-10">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">You're all set!</h2>
              <p className="text-gray-500 text-lg max-w-md mx-auto mb-12">
                We are ready to provision your secure workspace for <span className="font-semibold text-gray-900">{orgInfo.name}</span> on the <span className="font-semibold text-gray-900 capitalize">{planId === 'free' ? 'Starter' : 'Professional'}</span> plan.
              </p>
              
              <button 
                onClick={handleComplete} 
                disabled={loading}
                className="w-full max-w-sm px-8 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-2xl shadow-gray-900/20 flex items-center justify-center gap-3 text-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {loading ? (
                  <><Loader2 className="w-6 h-6 animate-spin" /> Provisioning...</>
                ) : (
                  'Launch Workspace'
                )}
              </button>
              <p className="mt-6 text-sm text-gray-400">By launching, you agree to our Terms of Service & Privacy Policy.</p>
            </div>
          )}

        </div>
      </div>
      
    </div>
  );
}
