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
  Store,
  LayoutGrid,
  Banknote,
  Receipt
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
    { id: "other", label: "Other", icon: LayoutGrid },
  ];

  return (
    <div className="card login-signup-card shadow-lg mb-0" style={{ maxWidth: '100%', borderRadius: '1.25rem', overflow: 'hidden' }}>
      <div className="card-body px-md-5 py-5" style={{ minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4" style={{ backgroundColor: '#f1f5f9' }}>
          <div className="bg-primary h-2 rounded-full transition-all duration-500 ease-out shadow-sm" style={{ width: `${(step / 5) * 100}%`, backgroundColor: '#6730e3' }}></div>
        </div>

        {step > 1 && step < 5 && (
          <button 
            onClick={handlePrev} 
            className="btn btn-link text-muted p-0 border-0 mb-4 d-flex align-items-center gap-2 transition-all hover-primary"
            style={{ fontSize: "0.9rem", textDecoration: "none", width: 'fit-content' }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}

        {error && (
          <div className="alert alert-danger py-2 mb-4 text-sm shadow-sm rounded-lg border-0 bg-danger text-white">
            <i className="ti-alert mr-2"></i> {error}
          </div>
        )}

        {/* STEP 1: Country */}
        {step === 1 && (
          <div className="animate-in fade-in duration-500 mt-2 flex-grow-1">
            <h5 className="h3 mb-2 font-weight-bold text-dark">Business Location</h5>
            <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>This helps us apply the correct tax rules and currency.</p>
            
            <div className="row g-3">
              {["India", "United States", "United Kingdom", "Australia", "UAE", "Singapore"].map(c => (
                <div className="col-6 mb-3" key={c}>
                  <button
                    onClick={() => { setCountry(c); setTimeout(handleNext, 150); }}
                    className={`w-100 p-3 rounded-lg border text-left transition-all d-flex align-items-center gap-3 ${
                      country === c 
                        ? 'border-primary bg-primary-light text-primary shadow-sm' 
                        : 'border-light hover:border-gray-300 bg-white text-secondary hover-shadow'
                    }`}
                    style={country === c ? { backgroundColor: '#f4efff', borderColor: '#6730e3', color: '#6730e3' } : { backgroundColor: '#f8f9fa', borderColor: '#e9ecef' }}
                  >
                    <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={country === c ? { backgroundColor: 'rgba(103,48,227,0.1)' } : { backgroundColor: '#e9ecef' }}>
                      <MapPin className={`w-4 h-4 ${country === c ? 'text-primary' : 'text-gray-500'}`} style={country === c ? { color: '#6730e3' } : {}} />
                    </div>
                    <span className="font-weight-bold" style={{ fontSize: '0.95rem' }}>{c}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Business Type */}
        {step === 2 && (
          <div className="animate-in fade-in duration-500 mt-2 flex-grow-1">
            <h5 className="h3 mb-2 font-weight-bold text-dark">Business Type</h5>
            <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>We'll customize your dashboard based on your industry.</p>
            
            <div className="row g-2">
              {businessTypes.map(type => (
                <div className="col-4 mb-3" key={type.id}>
                  <button
                    onClick={() => { setBusinessType(type.id); setTimeout(handleNext, 150); }}
                    className={`w-100 p-3 rounded-lg border text-center transition-all d-flex flex-column align-items-center justify-content-center gap-2 h-100 ${
                      businessType === type.id 
                        ? 'border-primary bg-primary-light text-primary shadow-sm' 
                        : 'border-light hover:border-gray-300 bg-white text-secondary hover-shadow'
                    }`}
                    style={businessType === type.id ? { backgroundColor: '#f4efff', borderColor: '#6730e3', color: '#6730e3' } : { backgroundColor: '#f8f9fa', borderColor: '#e9ecef' }}
                  >
                    <type.icon className={`w-6 h-6 mb-1 ${businessType === type.id ? 'text-primary' : 'text-gray-500'}`} style={businessType === type.id ? { color: '#6730e3' } : {}} />
                    <span className="font-weight-bold" style={{ fontSize: '0.8rem' }}>{type.label}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Organization Info */}
        {step === 3 && (
          <div className="animate-in fade-in duration-500 mt-2 flex-grow-1 d-flex flex-column">
            <h5 className="h3 mb-2 font-weight-bold text-dark">Organization Details</h5>
            <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>You can always update these details later in settings.</p>
            
            <div className="flex-grow-1">
              <div className="form-group mb-4">
                <label className="pb-2 font-weight-bold text-dark small text-uppercase tracking-wider">Organization Name</label>
                <div className="position-relative">
                  <div className="position-absolute d-flex align-items-center justify-content-center" style={{ width: '45px', height: '100%', left: 0, top: 0, color: '#6730e3' }}>
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    value={orgInfo.name} 
                    onChange={e => setOrgInfo({...orgInfo, name: e.target.value})}
                    className="form-control form-control-lg border-gray-200 shadow-sm"
                    placeholder="e.g. Acme Corporation"
                    autoFocus
                    style={{ backgroundColor: '#f8f9fa', fontSize: '1.05rem', paddingLeft: '45px', borderRadius: '0.5rem' }}
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-4">
                  <label className="pb-2 font-weight-bold text-dark small text-uppercase tracking-wider">Base Currency</label>
                  <div className="position-relative">
                    <div className="position-absolute d-flex align-items-center justify-content-center" style={{ width: '45px', height: '100%', left: 0, top: 0, color: '#6730e3' }}>
                      <Banknote className="w-5 h-5" />
                    </div>
                    <select 
                      value={orgInfo.currency} 
                      onChange={e => setOrgInfo({...orgInfo, currency: e.target.value})}
                      className="form-control form-control-lg border-gray-200 shadow-sm font-weight-bold"
                      style={{ backgroundColor: '#f8f9fa', paddingLeft: '45px', borderRadius: '0.5rem' }}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="AED">AED (د.إ)</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <label className="pb-2 font-weight-bold text-dark small text-uppercase tracking-wider">Tax Registration</label>
                  <div className="position-relative">
                    <div className="position-absolute d-flex align-items-center justify-content-center" style={{ width: '45px', height: '100%', left: 0, top: 0, color: '#6730e3' }}>
                      <Receipt className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      value={orgInfo.gstin} 
                      onChange={e => setOrgInfo({...orgInfo, gstin: e.target.value})}
                      className="form-control form-control-lg border-gray-200 shadow-sm text-uppercase font-weight-bold"
                      placeholder="e.g. GSTIN / VAT"
                      style={{ backgroundColor: '#f8f9fa', letterSpacing: '1px', paddingLeft: '45px', borderRadius: '0.5rem' }}
                    />
                  </div>
                  <small className="text-muted mt-2 d-block">Optional for now</small>
                </div>
              </div>
            </div>

            <button 
              onClick={handleNext} 
              disabled={!orgInfo.name} 
              className={`btn btn-lg d-block w-100 border-radius mt-auto mb-2 d-flex align-items-center justify-content-center gap-2 shadow-sm transition-all ${!orgInfo.name ? 'btn-light text-muted' : 'solid-btn text-white'}`}
              style={{ padding: '1rem', fontSize: '1.1rem', backgroundColor: orgInfo.name ? '#6730e3' : '#e9ecef', color: orgInfo.name ? '#fff' : '#6c757d' }}
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 4: Subscription */}
        {step === 4 && (
          <div className="animate-in fade-in duration-500 mt-2 flex-grow-1 d-flex flex-column">
            <h5 className="h3 mb-2 font-weight-bold text-dark">Choose your plan</h5>
            <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>Select a plan that scales with your business.</p>
            
            <div className="row g-3 mb-4 flex-grow-1 align-items-stretch">
              {/* Free Plan */}
              <div className="col-sm-6">
                <div 
                  onClick={() => setPlanId("free")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all h-100 d-flex flex-column ${
                    planId === "free" 
                      ? "border-primary shadow" 
                      : "border-light hover-shadow"
                  }`}
                  style={planId === "free" ? { backgroundColor: '#f4efff', borderColor: '#6730e3', transform: 'translateY(-2px)' } : { backgroundColor: '#f8f9fa', borderColor: '#e9ecef' }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="font-weight-bold mb-0 text-dark">Starter</h5>
                    <div className="rounded-circle p-1" style={planId === "free" ? { backgroundColor: '#6730e3' } : { backgroundColor: '#e9ecef' }}>
                      <CheckCircle2 className="w-4 h-4" style={planId === "free" ? { color: '#fff' } : { color: 'transparent' }} />
                    </div>
                  </div>
                  <h2 className="font-weight-bold mb-1 text-dark" style={{ fontSize: '2.5rem' }}>₹0</h2>
                  <small className="text-muted d-block mb-4 font-weight-bold text-uppercase tracking-wider">Free forever</small>
                  
                  <ul className="list-unstyled mb-0 mt-auto" style={{ fontSize: '0.9rem' }}>
                    <li className="mb-3 text-secondary font-weight-medium d-flex align-items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success"/> Unlimited Invoices</li>
                    <li className="mb-3 text-secondary font-weight-medium d-flex align-items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success"/> Up to 100 Clients</li>
                    <li className="text-secondary font-weight-medium d-flex align-items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success"/> Single User</li>
                  </ul>
                </div>
              </div>
              
              {/* Pro Plan */}
              <div className="col-sm-6">
                <div 
                  onClick={() => setPlanId("pro")}
                  className={`position-relative p-4 rounded-xl border cursor-pointer transition-all h-100 d-flex flex-column ${
                    planId === "pro" 
                      ? "border-dark text-white shadow-lg" 
                      : "border-light hover-shadow"
                  }`}
                  style={planId === "pro" ? { background: 'linear-gradient(145deg, #1a1b23 0%, #2d2e3d 100%)', borderColor: '#1a1b23', transform: 'translateY(-2px)' } : { backgroundColor: '#f8f9fa', borderColor: '#e9ecef' }}
                >
                  <span className="badge position-absolute top-0 start-50 translate-middle py-2 px-3 rounded-pill shadow-sm" style={{ fontSize: '0.7rem', backgroundColor: '#f59e0b', color: '#fff', letterSpacing: '1px', fontWeight: 800 }}>MOST POPULAR</span>
                  <div className="d-flex justify-content-between align-items-start mb-3 mt-2">
                    <h5 className={`font-weight-bold mb-0 ${planId === "pro" ? 'text-white' : 'text-dark'}`}>Professional</h5>
                    <div className="rounded-circle p-1" style={planId === "pro" ? { backgroundColor: '#fff' } : { backgroundColor: '#e9ecef' }}>
                      <CheckCircle2 className="w-4 h-4" style={planId === "pro" ? { color: '#1a1b23' } : { color: 'transparent' }} />
                    </div>
                  </div>
                  <h2 className={`font-weight-bold mb-1 ${planId === "pro" ? 'text-white' : 'text-dark'}`} style={{ fontSize: '2.5rem' }}>₹499</h2>
                  <small className={`d-block mb-4 font-weight-bold text-uppercase tracking-wider ${planId === "pro" ? 'text-light' : 'text-muted'}`} style={{ opacity: 0.8 }}>per month</small>
                  
                  <ul className="list-unstyled mb-0 mt-auto" style={{ fontSize: '0.9rem' }}>
                    <li className={`mb-3 font-weight-medium d-flex align-items-center gap-2 ${planId === "pro" ? 'text-white' : 'text-secondary'}`}><CheckCircle2 className="w-4 h-4 text-success"/> Everything in Starter</li>
                    <li className={`mb-3 font-weight-medium d-flex align-items-center gap-2 ${planId === "pro" ? 'text-white' : 'text-secondary'}`}><CheckCircle2 className="w-4 h-4 text-success"/> Multi-branch & Roles</li>
                    <li className={`font-weight-medium d-flex align-items-center gap-2 ${planId === "pro" ? 'text-white' : 'text-secondary'}`}><CheckCircle2 className="w-4 h-4 text-success"/> Adv. Inventory</li>
                  </ul>
                </div>
              </div>
            </div>

            <button 
              onClick={handleNext} 
              className="btn btn-lg d-block w-100 border-radius mt-auto mb-2 d-flex align-items-center justify-content-center gap-2 shadow-sm transition-all"
              style={{ padding: '1rem', fontSize: '1.1rem', backgroundColor: '#6730e3', color: '#fff' }}
            >
              Continue to Final Step <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 5: Workspace Creation */}
        {step === 5 && (
          <div className="animate-in fade-in zoom-in-95 duration-500 d-flex flex-column align-items-center justify-content-center text-center py-5 mt-3 flex-grow-1">
            <div className="position-relative mb-5">
              <div className="position-absolute w-100 h-100 bg-success rounded-circle blur-2xl opacity-20" style={{ filter: 'blur(30px)', transform: 'scale(1.5)' }}></div>
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle position-relative shadow-lg" style={{ width: '100px', height: '100px', backgroundColor: '#10b981', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h2 className="font-weight-bold mb-3 text-dark" style={{ fontSize: '2.2rem', letterSpacing: '-0.5px' }}>You're all set!</h2>
            <p className="text-muted mb-5 px-4" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
              We are ready to provision your secure workspace for <span className="font-weight-bold text-dark px-1 py-1 rounded bg-light">{orgInfo.name}</span> on the <span className="font-weight-bold text-primary px-1 py-1 rounded bg-primary-light text-capitalize">{planId === 'free' ? 'Starter' : 'Professional'}</span> plan.
            </p>
            
            <button 
              onClick={handleComplete} 
              disabled={loading}
              className="btn btn-lg d-block w-100 border-radius d-flex align-items-center justify-content-center gap-3 shadow-lg transition-all hover-transform"
              style={{ backgroundColor: '#1a1b23', color: 'white', padding: '1.25rem', fontSize: '1.15rem' }}
            >
              {loading ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Provisioning Secure Workspace...</>
              ) : (
                'Launch Workspace'
              )}
            </button>
            <small className="text-muted d-block mt-4">By launching, you agree to our Terms of Service & Privacy Policy.</small>
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
              <h1 className="text-white" style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.5rem' }}>Setup Your Workspace</h1>
              <p className="lead" style={{ opacity: 0.9, fontSize: '1.2rem', lineHeight: 1.6 }}>
                Customize your experience to get the most out of InvoiceDotCom. Let's get your business profile ready.
              </p>
              <ul className="list-unstyled text-white mt-5">
                <li className="mb-4 d-flex align-items-center gap-3 font-weight-bold" style={{ fontSize: '1.1rem' }}>
                  <div className="p-2 rounded-circle" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}><CheckCircle2 className="w-5 h-5 text-success"/></div> 
                  Tailored Tax & Currency settings
                </li>
                <li className="mb-4 d-flex align-items-center gap-3 font-weight-bold" style={{ fontSize: '1.1rem' }}>
                  <div className="p-2 rounded-circle" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}><CheckCircle2 className="w-5 h-5 text-success"/></div> 
                  Industry-specific Dashboard
                </li>
                <li className="d-flex align-items-center gap-3 font-weight-bold" style={{ fontSize: '1.1rem' }}>
                  <div className="p-2 rounded-circle" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}><CheckCircle2 className="w-5 h-5 text-success"/></div> 
                  Flexible Subscription Plans
                </li>
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
