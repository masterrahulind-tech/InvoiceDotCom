"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
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
  Monitor,
  Store
} from "lucide-react";
import Link from "next/link";

type Step = 1 | 2 | 3 | 4 | 5;

function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [country, setCountry] = useState("India");
  const [businessType, setBusinessType] = useState("retail");
  const [orgInfo, setOrgInfo] = useState({ name: "", gstin: "", currency: "INR" });
  const [planId, setPlanId] = useState("free");

  const handleNext = () => setStep((s) => Math.min(s + 1, 5) as Step);
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1) as Step);

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
    <div className="card login-signup-card shadow-lg mb-0" style={{ maxWidth: '100%' }}>
      <div className="card-body px-md-5 py-5" style={{ minHeight: '500px' }}>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4" style={{ backgroundColor: '#e2e8f0' }}>
          <div className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${(step / 5) * 100}%`, backgroundColor: '#6730e3' }}></div>
        </div>

        {step > 1 && step < 5 && (
          <button 
            onClick={handlePrev} 
            className="btn btn-link text-muted p-0 border-0 mb-4 d-flex align-items-center gap-2"
            style={{ fontSize: "0.85rem", textDecoration: "none" }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}

        {error && (
          <div className="alert alert-danger py-2 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* STEP 1: Country */}
        {step === 1 && (
          <div className="animate-in fade-in duration-500 mt-4">
            <h5 className="h3 mb-2 font-weight-bold">Business Location</h5>
            <p className="text-muted mb-4">This helps us apply the correct tax rules and currency.</p>
            
            <div className="row g-3">
              {["India", "United States", "United Kingdom", "Australia", "UAE", "Singapore"].map(c => (
                <div className="col-6 mb-3" key={c}>
                  <button
                    onClick={() => { setCountry(c); setTimeout(handleNext, 150); }}
                    className={`w-100 p-3 rounded border text-left transition-all d-flex align-items-center gap-2 ${
                      country === c 
                        ? 'border-primary bg-primary-light text-primary' 
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                    style={country === c ? { backgroundColor: '#f8f5ff', borderColor: '#6730e3', color: '#6730e3' } : {}}
                  >
                    <MapPin className={`w-4 h-4 ${country === c ? 'text-primary' : 'text-gray-400'}`} style={country === c ? { color: '#6730e3' } : {}} />
                    <span className="font-weight-bold" style={{ fontSize: '0.9rem' }}>{c}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Business Type */}
        {step === 2 && (
          <div className="animate-in fade-in duration-500 mt-2">
            <h5 className="h3 mb-2 font-weight-bold">Business Type</h5>
            <p className="text-muted mb-4">We'll customize your dashboard based on your industry.</p>
            
            <div className="row g-3">
              {businessTypes.map(type => (
                <div className="col-4 mb-3" key={type.id}>
                  <button
                    onClick={() => { setBusinessType(type.id); setTimeout(handleNext, 150); }}
                    className={`w-100 p-3 rounded border text-center transition-all d-flex flex-column align-items-center gap-2 ${
                      businessType === type.id 
                        ? 'border-primary bg-primary-light text-primary' 
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                    style={businessType === type.id ? { backgroundColor: '#f8f5ff', borderColor: '#6730e3', color: '#6730e3' } : {}}
                  >
                    <type.icon className={`w-5 h-5 ${businessType === type.id ? 'text-primary' : 'text-gray-400'}`} style={businessType === type.id ? { color: '#6730e3' } : {}} />
                    <span className="font-weight-bold" style={{ fontSize: '0.75rem' }}>{type.label}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Organization Info */}
        {step === 3 && (
          <div className="animate-in fade-in duration-500 mt-2">
            <h5 className="h3 mb-2 font-weight-bold">Organization Details</h5>
            <p className="text-muted mb-4">You can always update these details later in settings.</p>
            
            <div className="form-group mb-4">
              <label className="pb-1 font-weight-bold">Organization Name</label>
              <div className="input-group input-group-merge">
                <div className="input-icon">
                  <span className="ti-briefcase color-primary"></span>
                </div>
                <input 
                  type="text" 
                  value={orgInfo.name} 
                  onChange={e => setOrgInfo({...orgInfo, name: e.target.value})}
                  className="form-control form-control-lg"
                  placeholder="e.g. Acme Corporation"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-4">
                <label className="pb-1 font-weight-bold">Base Currency</label>
                <div className="input-group input-group-merge">
                  <div className="input-icon">
                    <span className="ti-money color-primary"></span>
                  </div>
                  <select 
                    value={orgInfo.currency} 
                    onChange={e => setOrgInfo({...orgInfo, currency: e.target.value})}
                    className="form-control form-control-lg"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="AED">AED (د.إ)</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <label className="pb-1 font-weight-bold">Tax Registration</label>
                <div className="input-group input-group-merge">
                  <div className="input-icon">
                    <span className="ti-receipt color-primary"></span>
                  </div>
                  <input 
                    type="text" 
                    value={orgInfo.gstin} 
                    onChange={e => setOrgInfo({...orgInfo, gstin: e.target.value})}
                    className="form-control form-control-lg text-uppercase"
                    placeholder="e.g. GSTIN / VAT"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleNext} 
              disabled={!orgInfo.name} 
              className="btn btn-lg d-block w-100 solid-btn border-radius mt-2 mb-3 d-flex align-items-center justify-content-center gap-2"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 4: Subscription */}
        {step === 4 && (
          <div className="animate-in fade-in duration-500 mt-2">
            <h5 className="h3 mb-2 font-weight-bold">Choose your plan</h5>
            <p className="text-muted mb-4">Select a plan that scales with your business.</p>
            
            <div className="row g-3 mb-4">
              {/* Free Plan */}
              <div className="col-sm-6">
                <div 
                  onClick={() => setPlanId("free")}
                  className={`p-4 rounded border cursor-pointer transition-all h-100 ${
                    planId === "free" 
                      ? "border-primary" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={planId === "free" ? { backgroundColor: '#f8f5ff', borderColor: '#6730e3' } : { backgroundColor: '#fff' }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="font-weight-bold mb-0">Starter</h6>
                    {planId === "free" && <CheckCircle2 className="w-4 h-4 text-primary" style={{ color: '#6730e3' }} />}
                  </div>
                  <h3 className="font-weight-bold mb-1">₹0</h3>
                  <small className="text-muted d-block mb-3">Free forever</small>
                  
                  <ul className="list-unstyled small mb-0" style={{ fontSize: '0.8rem' }}>
                    <li className="mb-2"><CheckCircle2 className="w-3 h-3 text-success me-1 d-inline"/> Unlimited Invoices</li>
                    <li className="mb-2"><CheckCircle2 className="w-3 h-3 text-success me-1 d-inline"/> Up to 100 Clients</li>
                    <li><CheckCircle2 className="w-3 h-3 text-success me-1 d-inline"/> Single User</li>
                  </ul>
                </div>
              </div>
              
              {/* Pro Plan */}
              <div className="col-sm-6">
                <div 
                  onClick={() => setPlanId("pro")}
                  className={`position-relative p-4 rounded border cursor-pointer transition-all h-100 ${
                    planId === "pro" 
                      ? "border-dark text-white" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={planId === "pro" ? { backgroundColor: '#1a1b23', borderColor: '#1a1b23' } : { backgroundColor: '#fff' }}
                >
                  <span className="badge bg-warning position-absolute top-0 start-50 translate-middle" style={{ fontSize: '0.6rem' }}>MOST POPULAR</span>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className={`font-weight-bold mb-0 ${planId === "pro" ? 'text-white' : ''}`}>Professional</h6>
                    {planId === "pro" && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <h3 className={`font-weight-bold mb-1 ${planId === "pro" ? 'text-white' : ''}`}>₹499</h3>
                  <small className={`d-block mb-3 ${planId === "pro" ? 'text-light' : 'text-muted'}`}>per month</small>
                  
                  <ul className="list-unstyled small mb-0" style={{ fontSize: '0.8rem' }}>
                    <li className="mb-2"><CheckCircle2 className="w-3 h-3 text-success me-1 d-inline"/> Everything in Starter</li>
                    <li className="mb-2"><CheckCircle2 className="w-3 h-3 text-success me-1 d-inline"/> Multi-branch & Roles</li>
                    <li><CheckCircle2 className="w-3 h-3 text-success me-1 d-inline"/> Adv. Inventory</li>
                  </ul>
                </div>
              </div>
            </div>

            <button 
              onClick={handleNext} 
              className="btn btn-lg d-block w-100 solid-btn border-radius mt-4 d-flex align-items-center justify-content-center gap-2"
            >
              Continue to Final Step <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 5: Workspace Creation */}
        {step === 5 && (
          <div className="animate-in fade-in zoom-in-95 duration-500 d-flex flex-column align-items-center justify-content-center text-center py-4 mt-4">
            <div className="mb-4">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: '80px', height: '80px', backgroundColor: '#e8f5e9' }}>
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
            </div>
            
            <h4 className="font-weight-bold mb-2 h3">You're all set!</h4>
            <p className="text-muted mb-5 px-3">
              We are ready to provision your secure workspace for <span className="font-weight-bold text-dark">{orgInfo.name}</span> on the <span className="font-weight-bold text-dark text-capitalize">{planId === 'free' ? 'Starter' : 'Professional'}</span> plan.
            </p>
            
            <button 
              onClick={handleComplete} 
              disabled={loading}
              className="btn btn-lg d-block w-100 border-radius d-flex align-items-center justify-content-center gap-2"
              style={{ backgroundColor: '#1a1b23', color: 'white' }}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Provisioning...</>
              ) : (
                'Launch Workspace'
              )}
            </button>
            <small className="text-muted d-block mt-4">By launching, you agree to our Terms & Privacy Policy.</small>
          </div>
        )}

      </div>
    </div>
  );
}

export default function OnboardingWizardPage() {
  return (
    <section
      className="hero-section ptb-100 background-img full-screen"
      style={{ background: "url('/assets/hero-bg-1.jpg') no-repeat center center / cover" }}
    >
      <div className="container">
        <div className="row align-items-center justify-content-between pt-5 pt-sm-5 pt-md-5 pt-lg-0">
          <div className="col-md-5 col-lg-5 mb-5 mb-md-0">
            <div className="hero-content-left text-white">
              <h1 className="text-white">Setup Your Workspace</h1>
              <p className="lead">
                Customize your experience to get the most out of InvoiceDotCom. Let's get your business profile ready.
              </p>
              <ul className="list-unstyled text-white mt-5" style={{ opacity: 0.9 }}>
                <li className="mb-4 d-flex align-items-center gap-3 font-weight-bold"><CheckCircle2 className="w-6 h-6 text-success"/> Tailored Tax & Currency settings</li>
                <li className="mb-4 d-flex align-items-center gap-3 font-weight-bold"><CheckCircle2 className="w-6 h-6 text-success"/> Industry-specific Dashboard</li>
                <li className="d-flex align-items-center gap-3 font-weight-bold"><CheckCircle2 className="w-6 h-6 text-success"/> Flexible Subscription Plans</li>
              </ul>
            </div>
          </div>
          <div className="col-md-7 col-lg-6">
            <OnboardingForm />
          </div>
        </div>
      </div>
      <div className="bottom-img-absolute">
        <img src="/assets/hero-bg-shape-1.svg" alt="wave shape" className="img-fluid" />
      </div>
    </section>
  );
}
