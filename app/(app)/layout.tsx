"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Receipt, 
  Package, 
  Users, 
  Wallet, 
  FilePieChart, 
  Settings, 
  Plus, 
  Building2,
  ChevronRight
} from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "GST Invoices", href: "/invoices", icon: Receipt },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Parties (CRM)", href: "/parties", icon: Users },
    { name: "Expenses", href: "/expenses", icon: Wallet },
    { name: "GST Reports", href: "/reports/gst", icon: FilePieChart },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Profile Indicator */}
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                    InvoiceDotCom
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400 tracking-wide uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Vyapar & Khatabook Edition
                  </span>
                </div>
              </Link>

              {/* Active Business Profile Pill */}
              <div className="hidden md:flex items-center gap-2 pl-4 ml-4 border-l border-slate-800 text-xs text-slate-400 bg-slate-950/50 py-1.5 px-3 rounded-lg border border-slate-800/80">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-medium text-slate-200">Apex Digital Solutions</span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-mono px-1.5 py-0.5 rounded border border-indigo-500/20">
                  27AAACA1234A1Z5
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <Link
                href="/invoices/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New GST Invoice</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Secondary Navigation Bar */}
        <div className="bg-slate-900/60 border-t border-slate-800/60 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 sm:space-x-2 py-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                      isActive
                        ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
