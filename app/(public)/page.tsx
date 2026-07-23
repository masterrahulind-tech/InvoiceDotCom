"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ShaderBackground from "@/components/ShaderBackground";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Scroll reveal animation
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    // Smooth header shadow on scroll
    const handleScroll = () => {
      const nav = document.querySelector("nav");
      if (nav) {
        if (window.scrollY > 20) {
          nav.classList.add("shadow-md");
        } else {
          nav.classList.remove("shadow-md");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body-md overflow-x-hidden">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-surface/90 dark:bg-surface-dim/90 backdrop-blur-xl border-b border-outline-variant/20 transition-shadow duration-300">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20">
          <div className="flex items-center gap-10">
            <Link href="/" className="text-xl md:text-2xl font-bold text-primary dark:text-inverse-primary tracking-tight">
              InvoiceDotCom
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <a href="#features" className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all">Features</a>
              <a href="#pricing" className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all">Pricing</a>
              <a href="#testimonials" className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all">Testimonials</a>
              <a href="#about" className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all">About</a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block">
              <button className="px-5 py-2.5 font-semibold text-sm text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all">Login</button>
            </Link>
            <Link href="/signup">
              <button className="px-5 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg shadow-[0_2px_8px_rgba(0,61,155,0.3)] hover:shadow-[0_4px_16px_rgba(0,61,155,0.4)] hover:-translate-y-px transition-all duration-200">Get Started</button>
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-surface-container-low transition-colors" aria-label="Toggle menu">
              <span className="material-symbols-outlined text-on-surface">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface/95 backdrop-blur-xl border-t border-outline-variant/20 px-4 pb-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all">Features</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all">Pricing</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all">Testimonials</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all">About</a>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-on-surface-variant hover:text-primary rounded-lg">Login</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 md:pt-40 pb-12 md:pb-20 overflow-hidden min-h-[921px] flex items-center">
        {/* Shader Background */}
        <div className="absolute inset-0 w-full h-full -z-10 opacity-40 block">
          <ShaderBackground />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="reveal">
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-fixed rounded-full mb-6">
              <span className="material-symbols-outlined text-secondary text-[18px]">
                verified
              </span>
              <span className="text-on-secondary-fixed font-label-md text-[12px] tracking-wider uppercase">
                Official GST Partner
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl mb-6 leading-tight">
              GST-Compliant Invoicing Built for{" "}
              <span className="text-secondary">Modern India</span>.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 max-w-xl">
              Create professional invoices, track payments in ₹, and automate
              your business GST filing. Trusted by 50,000+ Indian entrepreneurs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <button className="bg-primary text-white font-bold px-10 h-14 rounded-xl shadow-[0_4px_14px_rgba(0,61,155,0.35)] hover:shadow-[0_6px_20px_rgba(0,61,155,0.45)] hover:-translate-y-0.5 transition-all duration-300 text-base w-full sm:w-auto">
                  Start Free Trial
                </button>
              </Link>
              <Link href="/signup">
                <button className="border-2 border-primary text-primary font-bold px-10 h-14 rounded-xl hover:bg-primary hover:text-white hover:shadow-[0_4px_14px_rgba(0,61,155,0.3)] transition-all duration-300 text-base w-full sm:w-auto">
                  Book a Demo
                </button>
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-2">
                <img
                  className="w-10 h-10 rounded-full border-2 border-surface object-cover"
                  alt="A close-up, high-quality portrait of a smiling Indian female entrepreneur in a brightly lit, modern co-working office. The background is softly blurred with warm wooden textures and green plants. She has a confident expression, representing a successful business owner. The lighting is natural and inviting, reflecting a professional yet warm SaaS brand aesthetic."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_zT0OHimQ69EggK5uKZ2HHtkeQ6936eB1Su_ICRyVdRunbUrAmmPtJjZAoMQlTQVqk-1VTeoHC5G49txJKeCTpKuz8ATd07yRZ3VGWDadWDdPH_va1s8rnUx2tCGT3RRH86vQraKuIye16tHrz18hz6tiKA4V0OkeuEUwv7cgodweyJMmGF7cJRINlINytr6ddoxG54bGAHeuyts0sJ-m5vjOf_QFrTL4AOnuh_W7Vy_3NML5TvE0_hxAjbR8Rx9wGgFabO4KDvI"
                />
                <img
                  className="w-10 h-10 rounded-full border-2 border-surface object-cover"
                  alt="A portrait of a young Indian male software developer looking focused and professional in a sleek tech office setting. He is wearing a minimalist navy blue polo shirt. The scene is illuminated by cool-toned studio lighting, creating a high-end corporate feel. The aesthetic is clean, minimalist, and trustworthy, consistent with a financial services tool."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAweEMnuEnNNn2Zpdp3QPsjrelS9j8sYk5qvitVOcLqxTRMwoxsqTyoZbQfVd6pTmnyVlCCkwFpUGfcRMwxxLK140gOiTWFDf9GEkH8PFIT08BR7eof5j7RVxntm4E9P-469Qk_K4HzpD7TnZbmC03zjIO-Qqj_5WjyPRuiqUdc5j5WNHSs3IJH3bEOhiYcI10zyPS3bGnYQV7nGIcs9PhwYK2EJlCsIOiM8xf6uOgdx7V3yJkEM5-7ie9-f7NgnAD1EfqLffNrud0"
                />
                <img
                  className="w-10 h-10 rounded-full border-2 border-surface object-cover"
                  alt="A portrait of a middle-aged Indian small business owner in a clean, modern retail environment. He looks proud and satisfied, wearing professional attire. The background shows hints of a well-organized boutique. The overall mood is one of secure reliability and dynamic efficiency, matching the brand pillars of a modern fintech platform."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAM4vN-3qG7eRr-36FrcK_KSh_0Q_csOCOdr6ItmZgSgVga9HEOCiwI98zRIM4pOI9cR8w0VeEJ8i_SyGBepNVPHO7KrMOYRnkYV7Uc7hnCJjog3OMnbnkzzemm8DUN1su81DlnqzueWuXHaR5oMnL_KEumW4g6ooJF9iuNmC8MViAKn9_URkAiNanPZyZ0j0k-KqaafYbb8JdsCuZy-_yLVgVR-nEcnXs_-PUH60LVSBJwXRb5vrRBYh9QhvWDd8caZTp8nYwmH2c"
                />
              </div>
              <span className="text-body-sm text-on-surface-variant font-medium">
                Join 50k+ Indian businesses
              </span>
            </div>
          </div>
          <div className="reveal relative lg:ml-auto">
            <div className="glass-card p-3 rounded-xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                className="rounded-lg shadow-sm border border-outline-variant w-full"
                alt="A sophisticated UI mockup of a GST-compliant invoicing dashboard. The interface shows detailed Indian financial data including HSN codes, IGST, CGST, and SGST breakdowns. The layout is clean and spacious with a predominantly white background and deep blue primary accents. Large, clear typography displays currency in Rupees (₹). The style is professional, high-density, and evokes a sense of financial clarity."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_sdgGw08N3YAGxxRh-aPeQ-0YZDPE_Ph3EcqXVKC0vsqViwqJ0PrKHlrIWcBb99ZAxdFoVCMS3cG3yqkndjw-NS7iggi5p-p1cuHeUCpb2_lpTNBDbuTj_mlZNR8rxiagPeAxc6aYEgkdYGISEpmIiN4WlHFEutp5p3cumMoK1JxTAjiC5lbxP2kAkglE5UfEiy2XLu5g7h2ERRiPFnSVyBlJcpfsWbjAWeC2i5zQzFNdZW8Ys0_mOCz_EXGZ3oLXOyD0oXhr27M"
              />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-10 -left-10 glass-card p-5 rounded-xl shadow-xl hidden md:block max-w-[240px]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-success/20 text-emerald-600 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined">
                    check_circle
                  </span>
                </div>
                <div>
                  <p className="text-label-md font-bold">Payment Received</p>
                  <p className="text-body-sm text-on-surface-variant">
                    Inv #29342
                  </p>
                </div>
              </div>
              <p className="text-headline-md font-currency-display text-primary">
                ₹1,20,000.00
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Bar */}
      <section className="py-12 bg-surface-container-low reveal">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center font-label-md text-label-md text-outline uppercase tracking-widest mb-12">
            Powering growth for India's best
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="flex items-center gap-1 font-bold text-headline-md">
              <span className="material-symbols-outlined">database</span> Medium
            </div>
            <div className="flex items-center gap-1 font-bold text-headline-md">
              <span className="material-symbols-outlined">mail</span> Mailchimp
            </div>
            <div className="flex items-center gap-1 font-bold text-headline-md">
              <span className="material-symbols-outlined">payments</span> Square
            </div>
            <div className="flex items-center gap-1 font-bold text-headline-md">
              <span className="material-symbols-outlined">cloud_download</span>{" "}
              Dropbox
            </div>
            <div className="flex items-center gap-1 font-bold text-headline-md">
              <span className="material-symbols-outlined">linear_scale</span>{" "}
              Linear
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-20 reveal scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-headline-lg text-headline-lg mb-3">
              Everything your <span className="text-secondary">Finance</span>{" "}
              needs
            </h2>
            <p className="text-on-surface-variant font-body-lg max-w-2xl mx-auto">
              Stop wasting time on spreadsheets and manual calculations. Automate
              your billing flow today.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large Feature */}
            <div className="md:col-span-8 glass-card p-8 rounded-xl flex flex-col justify-between group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div>
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">
                    receipt_long
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-3">
                  Smart GST Invoicing
                </h3>
                <p className="text-on-surface-variant font-body-md max-w-md">
                  Automatic HSN/SAC code lookup and GST rate calculation. Stay
                  compliant with the latest government regulations without the
                  headache.
                </p>
              </div>
              <div className="mt-12 border-t border-outline-variant/30 pt-6 flex items-center justify-between">
                <span className="text-label-md text-primary font-bold">
                  EXPLORE GST FEATURES
                </span>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
            {/* Small Feature */}
            <div className="md:col-span-4 bg-primary text-on-primary p-8 rounded-xl flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(0,61,155,0.3)] transition-all duration-300">
              <div>
                <div className="w-12 h-12 bg-white/10 text-white rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined">
                    account_balance_wallet
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-3">
                  One-Click INR Payments
                </h3>
                <p className="text-primary-fixed-dim font-body-md">
                  Seamless support for UPI, Net Banking, and local Cards. Get
                  paid 2x faster.
                </p>
              </div>
              <img
                className="mt-6 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity"
                alt="A highly detailed and minimalist digital illustration of a sleek smartphone screen displaying a successful UPI payment confirmation in India. The UI features iconic Indian payment brand colors but in a generic, professional style. The background is a soft, deep blue gradient that matches the fintech brand's palette. Glowing light effects around the phone suggest a fast and secure transaction."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKcfoYOYEz0D47Qtu7c-dNcmVE6UZHzY6a3-DfX3Lq9ctrKmOKv6WovqhhYgzNINnpV7niZMhYVdDEIb9RZR5DkdIudpLmuYYwD4tJTFatlukYjMjRLJvI7MFFlb9UbawW8bAXHwQjFTiT9YFaIgg2QVt1aikU6F60n41KhXX3Dka-62Hj-CUuB5I0qLpKyiejeECrI1Y_ExQXj-24Iu-YwIGZB149fFr9epZtod7OWOkcZLLhri4lecVishUI92PS1Nf8DldZA_Y"
              />
            </div>
            {/* Square Feature */}
            <div className="md:col-span-6 glass-card p-8 rounded-xl hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border-l-4 border-l-secondary">
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center mb-6">
                <span className="material-symbols-outlined">
                  notifications_active
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-3">
                Automated Follow-ups
              </h3>
              <p className="text-on-surface-variant font-body-md">
                Send WhatsApp and Email reminders for pending payments. Reduce
                overdue invoices by up to 40% with smart scheduling.
              </p>
            </div>
            {/* Square Feature */}
            <div className="md:col-span-6 glass-card p-8 rounded-xl hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div className="w-12 h-12 bg-tertiary/10 text-tertiary rounded-lg flex items-center justify-center mb-6">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-3">
                Inventory Sync
              </h3>
              <p className="text-on-surface-variant font-body-md">
                Real-time stock tracking with low-stock alerts. Automatically
                update your inventory as soon as an invoice is generated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-surface-container-lowest reveal scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-headline-lg text-headline-lg mb-3">
              Simple, Transparent <span className="text-secondary">Pricing</span>
            </h2>
            <p className="text-on-surface-variant font-body-lg">
              Choose the plan that fits your business stage.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Basic */}
            <div className="p-8 rounded-2xl border border-outline-variant hover:border-primary hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 bg-surface flex flex-col">
              <p className="font-semibold text-xs text-outline uppercase tracking-widest mb-3">
                Starter
              </p>
              <h3 className="text-3xl font-bold mb-2">Free</h3>
              <p className="text-on-surface-variant text-sm mb-8">
                For freelancers just starting out.
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                    check_circle
                  </span>{" "}
                  Up to 3 invoices/month
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                    check_circle
                  </span>{" "}
                  Basic GST Templates
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                    check_circle
                  </span>{" "}
                  Email Support
                </li>
              </ul>
              <Link href="/signup">
                <button className="w-full py-3.5 border-2 border-outline text-on-surface font-bold rounded-xl hover:bg-surface-container-low hover:border-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 text-sm">
                  Start Free
                </button>
              </Link>
            </div>
            {/* Popular */}
            <div className="p-8 pt-10 rounded-2xl border-2 border-primary relative shadow-2xl bg-surface md:scale-105 z-10 flex flex-col">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-white px-5 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase shadow-lg">
                Most Popular
              </div>
              <p className="font-semibold text-xs text-primary uppercase tracking-widest mb-3">
                Professional
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold">₹999</span>
                <span className="text-on-surface-variant text-sm">/mo</span>
              </div>
              <p className="text-on-surface-variant text-sm mb-8">
                For growing agencies &amp; studios.
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm font-semibold">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    check_circle
                  </span>{" "}
                  Unlimited Invoices
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    check_circle
                  </span>{" "}
                  Custom Branding
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    check_circle
                  </span>{" "}
                  Recurring Billing
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    check_circle
                  </span>{" "}
                  WhatsApp Reminders
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    check_circle
                  </span>{" "}
                  Inventory Management
                </li>
              </ul>
              <Link href="/signup">
                <button className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(0,61,155,0.35)] hover:shadow-[0_6px_20px_rgba(0,61,155,0.45)] hover:-translate-y-px transition-all duration-300 text-sm">
                  Go Professional
                </button>
              </Link>
            </div>
            {/* Enterprise */}
            <div className="p-8 rounded-2xl border border-outline-variant hover:border-primary hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 bg-surface flex flex-col">
              <p className="font-semibold text-xs text-outline uppercase tracking-widest mb-3">
                Enterprise
              </p>
              <h3 className="text-3xl font-bold mb-2">
                Custom
              </h3>
              <p className="text-on-surface-variant text-sm mb-8">
                For established businesses.
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                    check_circle
                  </span>{" "}
                  Dedicated Account Manager
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                    check_circle
                  </span>{" "}
                  Custom API Integration
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                    check_circle
                  </span>{" "}
                  Bulk GST Filing
                </li>
              </ul>
              <Link href="/signup">
                <button className="w-full py-3.5 border-2 border-outline text-on-surface font-bold rounded-xl hover:bg-surface-container-low hover:border-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 text-sm">
                  Contact Sales
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 reveal scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="font-label-md text-label-md text-secondary uppercase tracking-widest mb-1">
              Testimonials
            </p>
            <h2 className="font-headline-lg text-headline-lg">
              Trusted by <span className="text-secondary">Modern Freelancers</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-xl italic text-on-surface-variant hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
              <p className="mb-12">
                "InvoiceDotCom has transformed my invoicing process. I can send
                professional GST invoices on the go and track payments
                effortlessly."
              </p>
              <div className="flex items-center gap-3 not-italic">
                <img
                  className="w-12 h-12 rounded-full object-cover"
                  alt="A portrait of a cheerful Indian male tech founder in his 30s, dressed in a smart casual grey blazer. He is standing in a brightly lit, high-tech office with large glass windows. The overall lighting is natural and crisp, emphasizing a successful and trustworthy persona. The style is modern, professional, and vibrant, mirroring the energetic Indian SaaS landscape."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxccJ7efu11TrUxk8FH86GtWp3FwNcUZ4KY_ZSXDDQZp640UNbEOyHEaDkWHvE-rAF62Xce8wiUYgnlzWjzkvCZmlKYxUfiyIf187z8ICFGF0MWNfz7ntl3n7EnlS9p-tSydbOibO3x-hqkszpcSJ1ftmM32WHVRutEWmYMWiZfvMHeiACVWbfZaFptUG2fuV8v99rPv86asc3z90VW1T-3OVedfg-Vbuftzi5OlVGkB0TFWMHQShdJWX0BNkUenD_tJhQa1Yst6U"
                />
                <div>
                  <p className="font-bold">Aarav Patel</p>
                  <p className="text-body-sm opacity-60">Tech Founder</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-6 rounded-xl italic text-on-surface-variant hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
              <p className="mb-12">
                "The automated payment reminders have significantly reduced my
                overdue invoices. It's like having a virtual accountant that
                never sleeps!"
              </p>
              <div className="flex items-center gap-3 not-italic">
                <img
                  className="w-12 h-12 rounded-full object-cover"
                  alt="A professional portrait of an Indian female boutique owner in her late 20s. She is elegantly dressed in modern traditional attire, standing in her beautifully designed, well-lit studio. The background features fabric swatches and high-end decor. The lighting is warm and soft, creating a friendly yet 'buttoned-up' tone. The aesthetic aligns with clutther-free clarity and professional warmth."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtnVpcCk-vg1KTOSleNLi3uGkfvRr1ylZTjsttiS1Za_EMUET6F0q4cM92v75J6rcG5dPnvcEfCBSwZT_LdiTcSreglkGKxxYFxQv_Tl0NMi-fRkpqQag5_RKj0KC0sJdvlhcS57CkgHCGDqjpkUP6vDpvvcPO_46cD2oWdY-kyXkXb9-M4F_PDEdD9AiMhO8FsgX7I_JADOhDOZtJdbq5vhvs-_iuvwlADG43EB1hD5YBGHMiHPDqI6OhqDfVt7gKNN6t5ZnhoOU"
                />
                <div>
                  <p className="font-bold">Priya Sharma</p>
                  <p className="text-body-sm opacity-60">Boutique Owner</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-6 rounded-xl italic text-on-surface-variant hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
              <p className="mb-12">
                "The live preview feature is top-notch. I can ensure every
                calculation is correct before the client even sees it. Best
                investment for my agency."
              </p>
              <div className="flex items-center gap-3 not-italic">
                <img
                  className="w-12 h-12 rounded-full object-cover"
                  alt="A close-up portrait of a senior Indian male consultant with a kind and experienced face. He is wearing a crisp white shirt and is in a modern, professional library-like setting with blurred books in the background. The lighting is high-key and clean, suggesting deep reliability and wisdom. This visual supports the brand pillar of secure reliability and professional trust."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_pS794wE0EJfRHmJUIEk5YuGrOwrGRHZv33K19mCwzFJj-OTr1k6V5te2GEU3K74kvVywTn-ixFEt65gkkjNPv31YY54i6t2WESWw6FrRFVzzFQY9_gFYTb4eY0X_MLhHiEXIC1d1T5xyA85lD4Uu7qIowr7TgxHjfOIPk5_bgzqI3N2j-E1iisrJwmMmZZQQaUi0NzX-qnR94B57dc1Rp7p_rXIx3fKf88F4D3QgWKjM1YweU6EEQwZT1-SGYAkf6A2IdEcmK2M"
                />
                <div>
                  <p className="font-bold">Vikram Mehta</p>
                  <p className="text-body-sm opacity-60">
                    Business Consultant
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-primary rounded-3xl px-6 py-16 md:p-20 text-center text-on-primary relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-secondary-container rounded-full blur-[80px] md:blur-[120px] -top-1/2 -left-1/4"></div>
              <div className="absolute w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-tertiary-container rounded-full blur-[80px] md:blur-[120px] -bottom-1/2 -right-1/4"></div>
            </div>
            <div className="relative z-10">
              <h2 className="font-headline-xl text-headline-xl mb-6">
                Stop wasting time on invoices.
              </h2>
              <p className="text-primary-fixed-dim font-body-lg mb-12 max-w-2xl mx-auto">
                Ready to streamline your invoicing? Get started in 2 minutes
                and join the future of Indian business finance.
              </p>
              <Link href="/signup">
                <button className="bg-white text-primary font-bold px-12 md:px-20 h-14 md:h-16 rounded-xl shadow-[0_8px_30px_rgba(255,255,255,0.25)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.35)] hover:scale-[1.03] transition-all duration-300 text-base">
                  Start Your Free 14-Day Trial
                </button>
              </Link>
              <p className="mt-6 text-body-sm opacity-60">
                No credit card required. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-surface-container-lowest dark:bg-inverse-surface w-full pt-20 pb-6 border-t border-outline-variant/50 scroll-mt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto px-6">
          <div className="md:col-span-1">
            <Link
              href="/"
              className="text-headline-md font-headline-md font-bold text-primary dark:text-inverse-primary block mb-6"
            >
              InvoiceDotCom
            </Link>
            <p className="text-on-surface-variant dark:text-outline-variant font-body-sm mb-6">
              GST Compliant Invoicing for the Modern Enterprise. Made with ❤️ in
              India.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-outline hover:text-primary transition-colors">
                <span className="material-symbols-outlined">share</span>
              </a>
              <a href="#" className="text-outline hover:text-primary transition-colors">
                <span className="material-symbols-outlined">public</span>
              </a>
              <a href="#" className="text-outline hover:text-primary transition-colors">
                <span className="material-symbols-outlined">chat</span>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-label-md text-label-md text-on-surface dark:text-inverse-on-surface mb-6">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-on-surface-variant dark:text-outline-variant hover:text-secondary transition-colors font-body-sm hover:underline">Product Tour</a>
              </li>
              <li>
                <a href="#features" className="text-on-surface-variant dark:text-outline-variant hover:text-secondary transition-colors font-body-sm hover:underline">GST Invoicing</a>
              </li>
              <li>
                <a href="#features" className="text-on-surface-variant dark:text-outline-variant hover:text-secondary transition-colors font-body-sm hover:underline">Inventory</a>
              </li>
              <li>
                <a href="#pricing" className="text-on-surface-variant dark:text-outline-variant hover:text-secondary transition-colors font-body-sm hover:underline">Pricing</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-label-md text-label-md text-on-surface dark:text-inverse-on-surface mb-6">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-on-surface-variant dark:text-outline-variant hover:text-secondary transition-colors font-body-sm hover:underline"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-on-surface-variant dark:text-outline-variant hover:text-secondary transition-colors font-body-sm hover:underline"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-on-surface-variant dark:text-outline-variant hover:text-secondary transition-colors font-body-sm hover:underline"
                >
                  Security
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-on-surface-variant dark:text-outline-variant hover:text-secondary transition-colors font-body-sm hover:underline"
                >
                  Help Center
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-label-md text-label-md text-on-surface dark:text-inverse-on-surface mb-6">
              Newsletter
            </h4>
            <p className="text-on-surface-variant dark:text-outline-variant font-body-sm mb-3">
              Get billing tips in your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="bg-surface-container border-none rounded-lg text-sm px-4 py-3 w-full focus:ring-2 focus:ring-primary"
              />
              <button className="p-3 bg-primary text-white rounded-lg shadow-[0_2px_8px_rgba(0,61,155,0.3)] hover:shadow-[0_4px_14px_rgba(0,61,155,0.4)] hover:-translate-y-px transition-all duration-200 flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-6 border-t border-outline-variant/30 text-center">
          <p className="text-on-surface-variant dark:text-outline-variant font-body-sm">
            © 2024 InvoiceDotCom. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
