"use client";

import { useEffect, useState } from "react";
import { 
  Wallet, 
  Plus, 
  Receipt, 
  Building2, 
  Calendar, 
  Tag, 
  X,
  CreditCard,
  Percent
} from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalExpensesCount: 0,
    totalExpense: 0,
    totalInputGst: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newExpense, setNewExpense] = useState({
    category: "Rent",
    amount: "",
    taxAmount: "",
    vendorName: "",
    gstin: "",
    paymentMode: "bank",
    notes: "",
  });

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/expenses");
      const data = await res.json();
      setExpenses(data.expenses || []);
      setSummary(data.summary || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewExpense({
          category: "Rent",
          amount: "",
          taxAmount: "",
          vendorName: "",
          gstin: "",
          paymentMode: "bank",
          notes: "",
        });
        loadExpenses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-purple-400" /> Business Expenses & Input GST (ITC)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Record operational overheads, utility bills, rent, and claim Input Tax Credit on vendor invoices.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Record New Expense
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Expenses</span>
          <div className="text-3xl font-black text-white mt-2">
            ₹{(summary.totalExpense || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{summary.totalExpensesCount || 0} expense vouchers logged</p>
        </div>

        <div className="bg-slate-900/80 border border-purple-500/30 p-5 rounded-2xl shadow-xl bg-purple-500/5">
          <span className="text-xs font-bold text-purple-400 uppercase flex items-center gap-1">
            <Percent className="w-3.5 h-3.5" /> Total Input GST Credit (ITC)
          </span>
          <div className="text-3xl font-black text-purple-400 mt-2">
            ₹{(summary.totalInputGst || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-purple-300/80 mt-1">Eligible to offset against GSTR-3B liability</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase">Net Business Profit Margin</span>
          <div className="text-3xl font-black text-emerald-400 mt-2">Active</div>
          <p className="text-[11px] text-slate-400 mt-1">Expenses synced with tax reports</p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-purple-400" /> Expense Vouchers List
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No business expenses recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-semibold text-slate-400 bg-slate-950/60 border-b border-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Vendor Name & GSTIN</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4 text-right">Input GST</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(exp.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{exp.vendorName || "General Vendor"}</div>
                      {exp.gstin && <div className="text-[10px] font-mono text-slate-400">GSTIN: {exp.gstin}</div>}
                    </td>
                    <td className="py-3.5 px-4 uppercase text-slate-300 text-[11px]">
                      {exp.paymentMode}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-purple-400">
                      ₹{exp.taxAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-white">
                      ₹{exp.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-purple-400" /> Record Business Expense
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Expense Category *</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Rent">Rent & Real Estate</option>
                    <option value="Utility">Electricity & Utility</option>
                    <option value="Salary">Salary & Staff Expenses</option>
                    <option value="Transport">Transport & Logistics</option>
                    <option value="Office">Office Supplies & Stationery</option>
                    <option value="Maintenance">Repair & Maintenance</option>
                    <option value="Purchase">Vendor Purchase</option>
                    <option value="Other">Other Miscellaneous</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Total Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="25000"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Vendor / Beneficiary Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Airtel Broadband"
                    value={newExpense.vendorName}
                    onChange={(e) => setNewExpense({ ...newExpense, vendorName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Vendor GSTIN (For ITC)</label>
                  <input
                    type="text"
                    placeholder="27AAACG0000A1Z2"
                    value={newExpense.gstin}
                    onChange={(e) => setNewExpense({ ...newExpense, gstin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Input GST Tax Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="4500"
                    value={newExpense.taxAmount}
                    onChange={(e) => setNewExpense({ ...newExpense, taxAmount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Payment Mode</label>
                  <select
                    value={newExpense.paymentMode}
                    onChange={(e) => setNewExpense({ ...newExpense, paymentMode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="bank">Bank Transfer / Cheque</option>
                    <option value="upi">UPI / GPay / PhonePe</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Notes / Voucher Description</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly office rent for July 2026"
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Save Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
