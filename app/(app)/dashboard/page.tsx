"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Package, 
  AlertTriangle, 
  Users, 
  Receipt, 
  Plus, 
  Wallet, 
  Send,
  Building2,
  FileCheck2,
  ChevronRight,
  Sparkles,
  BarChart3,
  DollarSign
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({
    totalSales: 0,
    paidSales: 0,
    pendingSales: 0,
    receivableBalance: 0,
    payableBalance: 0,
    inventoryValue: 0,
    lowStockCount: 0,
    totalExpenses: 0,
    recentInvoices: [],
    topParties: [],
    lowStockItems: [],
    loading: true,
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [invRes, partiesRes, itemsRes, expRes] = await Promise.all([
          fetch("/api/invoices"),
          fetch("/api/parties"),
          fetch("/api/items"),
          fetch("/api/expenses"),
        ]);

        const invData = await invRes.json();
        const partiesData = await partiesRes.json();
        const itemsData = await itemsRes.json();
        const expData = await expRes.json();

        const invoices = invData.invoices || [];
        const totalSales = invoices.reduce((acc: number, inv: any) => acc + inv.totalAmount, 0);
        const paidSales = invoices.reduce((acc: number, inv: any) => acc + inv.paidAmount, 0);
        const pendingSales = totalSales - paidSales;

        setStats({
          totalSales,
          paidSales,
          pendingSales,
          receivableBalance: partiesData.summary?.totalReceivable || 0,
          payableBalance: partiesData.summary?.totalPayable || 0,
          inventoryValue: itemsData.summary?.totalStockValuation || 0,
          lowStockCount: itemsData.summary?.lowStockCount || 0,
          totalExpenses: expData.summary?.totalExpense || 0,
          recentInvoices: invoices.slice(0, 5),
          topParties: (partiesData.parties || []).filter((p: any) => p.calculatedBalance > 0).slice(0, 4),
          lowStockItems: (itemsData.items || []).filter((i: any) => i.stockQty <= i.lowStockThreshold).slice(0, 4),
          loading: false,
        });
      } catch (e) {
        console.error("Error loading dashboard data", e);
        setStats((prev: any) => ({ ...prev, loading: false }));
      }
    }

    loadDashboardData();
  }, []);

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium animate-pulse">Loading Vyapar Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-blue-900/40 to-slate-900 border border-indigo-500/20 p-6 shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" /> GST Ready
              </span>
              <span className="text-xs text-slate-400">Apex Digital Solutions & Traders</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Business & Accounting Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Track live GST sales, Khatabook party ledgers, real-time inventory stock valuations, and expenses in one graphic dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/invoices/new"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Create GST Invoice
            </Link>
            <Link
              href="/parties"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Users className="w-4 h-4 text-emerald-400" /> Khatabook Ledger
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (Vyapar & Khatabook Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total GST Sales</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              ₹{stats.totalSales.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-semibold flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> ₹{stats.paidSales.toLocaleString("en-IN")} Paid
              </span>
              <span>•</span>
              <span className="text-amber-400">₹{stats.pendingSales.toLocaleString("en-IN")} Pending</span>
            </div>
          </div>
        </div>

        {/* You'll Receive (Khatabook Green Card) */}
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/60 transition-all bg-gradient-to-br from-emerald-950/20 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">You Will Get (Udhaar)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              ₹{stats.receivableBalance.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-emerald-300/70 mt-1">
              Total credit pending from customers
            </p>
          </div>
        </div>

        {/* You'll Give (Khatabook Red Card) */}
        <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-rose-500/60 transition-all bg-gradient-to-br from-rose-950/20 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">You Will Give</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-400 tracking-tight">
              ₹{stats.payableBalance.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-rose-300/70 mt-1">
              Total payables due to suppliers
            </p>
          </div>
        </div>

        {/* Stock Valuation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock Valuation</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              ₹{stats.inventoryValue.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px]">
              {stats.lowStockCount > 0 ? (
                <span className="text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <AlertTriangle className="w-3 h-3" /> {stats.lowStockCount} items low on stock
                </span>
              ) : (
                <span className="text-emerald-400">All items sufficiently stocked</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Recent GST Invoices - 2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Invoices Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-400" /> Recent GST Invoices
                </h2>
                <p className="text-xs text-slate-400">Latest sales billing records</p>
              </div>
              <Link
                href="/invoices"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {stats.recentInvoices.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
                <Receipt className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No invoices created yet.</p>
                <Link href="/invoices/new" className="inline-block text-xs font-bold text-indigo-400 mt-2 hover:underline">
                  + Create your first invoice
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                      <th className="pb-3 px-2">Invoice No</th>
                      <th className="pb-3 px-2">Party Name</th>
                      <th className="pb-3 px-2">Amount</th>
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {stats.recentInvoices.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-2 font-mono font-medium text-indigo-300">
                          {inv.invoiceNo}
                        </td>
                        <td className="py-3 px-2 text-slate-200 font-medium">
                          {inv.client?.name || "Client"}
                        </td>
                        <td className="py-3 px-2 font-bold text-white">
                          ₹{inv.totalAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              inv.status === "paid"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : inv.status === "partially_paid"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Business Expense Summary Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Recorded Expenses</span>
                <div className="text-xl font-bold text-white">₹{stats.totalExpenses.toLocaleString("en-IN")}</div>
              </div>
            </div>
            <Link
              href="/expenses"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              Manage Expenses
            </Link>
          </div>
        </div>

        {/* Right Column (Khatabook Udhaar Reminders & Low Stock Alerts) */}
        <div className="space-y-6">
          {/* Khatabook Udhaar Outstanding Parties */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" /> Pending Udhaar (CRM)
              </h2>
              <Link href="/parties" className="text-xs font-semibold text-emerald-400 hover:underline">
                Passbook
              </Link>
            </div>

            {stats.topParties.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No pending customer debts.</p>
            ) : (
              <div className="space-y-3">
                {stats.topParties.map((party: any) => (
                  <div key={party.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">{party.name}</div>
                      <div className="text-[11px] font-semibold text-emerald-400 mt-0.5">
                        You Get: ₹{party.calculatedBalance.toLocaleString("en-IN")}
                      </div>
                    </div>
                    {party.phone && (
                      <a
                        href={`https://wa.me/${party.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Hello ${party.name}, your total outstanding balance at Apex Digital Solutions is ₹${party.calculatedBalance.toLocaleString(
                            "en-IN"
                          )}. Kindly settle your dues. Thank you!`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> WhatsApp
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Warning Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Stock Alerts
              </h2>
              <Link href="/inventory" className="text-xs font-semibold text-amber-400 hover:underline">
                Inventory
              </Link>
            </div>

            {stats.lowStockItems.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">All items in stock.</p>
            ) : (
              <div className="space-y-2.5">
                {stats.lowStockItems.map((item: any) => (
                  <div key={item.id} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">{item.name}</div>
                      <div className="text-[10px] text-amber-300 mt-0.5">
                        Threshold: {item.lowStockThreshold} {item.unit}
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-md text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {item.stockQty} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
