"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  ArrowLeft, 
  Send, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Receipt, 
  Phone, 
  Mail, 
  MapPin,
  X,
  CheckCircle2
} from "lucide-react";

export default function PartyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [partyData, setPartyData] = useState<any>(null);
  const [statement, setStatement] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState<"GAVE" | "GOT">("GAVE");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [notes, setNotes] = useState("");

  const loadPartyDetails = async () => {
    try {
      setLoading(true);
      const [partyRes, ledgerRes] = await Promise.all([
        fetch(`/api/parties/${id}`),
        fetch(`/api/parties/${id}/ledger`),
      ]);
      const party = await partyRes.json();
      const ledger = await ledgerRes.json();

      setPartyData(party);
      setStatement(ledger.statement || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartyDetails();
  }, [id]);

  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    try {
      const res = await fetch(`/api/parties/${id}/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: txType,
          amount,
          paymentMode,
          notes,
        }),
      });
      if (res.ok) {
        setShowTxModal(false);
        setAmount("");
        setNotes("");
        loadPartyDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !partyData) {
    return <div className="p-12 text-center text-xs text-[#999]">Loading party ledger...</div>;
  }

  const isReceivable = partyData.balanceStatus === "receivable";

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link href="/parties" className="inline-flex items-center gap-1.5 text-xs text-[#999] hover:text-[#1f2029]">
          <ArrowLeft className="w-4 h-4" /> Back to Parties
        </Link>
      </div>

      {/* Party Info Header Card */}
      <div className="bg-white border border-[#e8ecf1] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#1f2029]">{partyData.name}</h1>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#f3f0ff] text-[#6730e3] uppercase border border-[#e0d5ff]">
                {partyData.partyType}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#999]">
              {partyData.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#aaa]" /> {partyData.phone}
                </div>
              )}
              {partyData.gstin && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono bg-[#f8f9fa] text-[#666] px-2 py-0.5 rounded">
                    GSTIN: {partyData.gstin}
                  </span>
                </div>
              )}
              {partyData.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#aaa]" /> {partyData.address}
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2">
            {partyData.phone && partyData.calculatedBalance > 0 && isReceivable && (
              <a
                href={`https://wa.me/${partyData.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Hello ${partyData.name}, your total outstanding dues at Apex Digital Solutions is ₹${partyData.calculatedBalance.toLocaleString(
                    "en-IN"
                  )}. Please make the payment via UPI. Thank you!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-[#1f2029] shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" /> Send WhatsApp Reminder
              </a>
            )}
            <button
              onClick={() => {
                setTxType("GAVE");
                setShowTxModal(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-[#1f2029] shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> You Gave (Udhaar)
            </button>
            <button
              onClick={() => {
                setTxType("GOT");
                setShowTxModal(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-[#1f2029] shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> You Got (Payment In)
            </button>
          </div>
        </div>

        {/* Current Net Balance Banner */}
        <div className="mt-6 p-4 rounded-xl bg-[#f8f9fa]/80 border border-[#e8ecf1] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#999] uppercase font-semibold">Net Passbook Balance</span>
            <div className={`text-2xl font-black ${isReceivable ? "text-emerald-400" : "text-rose-400"}`}>
              {isReceivable ? "You Will Get: " : "You Will Give: "} ₹{partyData.calculatedBalance.toLocaleString("en-IN")}
            </div>
          </div>
          <Link
            href={`/invoices/new?clientId=${partyData.id}`}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#6730e3] hover:bg-[#6730e3] text-[#1f2029] flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4" /> Create GST Invoice
          </Link>
        </div>
      </div>

      {/* Khatabook Passbook Statement Table */}
      <div className="bg-white border border-[#e8ecf1] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="p-4 border-b border-[#e8ecf1] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1f2029] flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" /> Passbook Transaction Statement
          </h2>
          <span className="text-xs text-[#999]">{statement.length} Records</span>
        </div>

        {statement.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#999]">No transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-semibold text-[#999] bg-[#fafbfc] border-b border-[#e8ecf1] uppercase tracking-wider">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Transaction / Note</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4 text-right">You Gave (Out)</th>
                  <th className="py-3 px-4 text-right">You Got (In)</th>
                  <th className="py-3 px-4 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0] text-xs">
                {statement.map((entry) => {
                  const isGave = entry.type === "GAVE";
                  return (
                    <tr key={entry.id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="py-3.5 px-4 text-[#999]">
                        {new Date(entry.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1f2029]">
                        <div>{entry.title}</div>
                        {entry.notes && <div className="text-[10px] text-[#999] font-normal">{entry.notes}</div>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-[#f8f9fa] text-[10px] text-[#666] uppercase">
                          {entry.paymentMode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-400">
                        {isGave ? `₹${entry.amount.toLocaleString("en-IN")}` : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        {!isGave ? `₹${entry.amount.toLocaleString("en-IN")}` : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#333]">
                        ₹{entry.runningBalance.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Entry Modal */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e8ecf1] rounded-2xl w-full max-w-md overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
            <div className="p-5 border-b border-[#e8ecf1] flex items-center justify-between">
              <h3 className={`text-base font-bold flex items-center gap-2 ${txType === "GAVE" ? "text-rose-400" : "text-emerald-400"}`}>
                {txType === "GAVE" ? "Record You Gave (Udhaar)" : "Record You Got (Payment In)"}
              </h3>
              <button onClick={() => setShowTxModal(false)} className="text-[#999] hover:text-[#1f2029]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordTransaction} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[#999] mb-1 font-semibold">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="e.g. 5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3.5 py-2.5 text-[#1f2029] font-mono text-base focus:outline-none focus:border-[#6730e3]"
                />
              </div>

              <div>
                <label className="block text-[#999] mb-1 font-semibold">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-[#6730e3]"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="bank">Bank Transfer / NEFT</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-[#999] mb-1 font-semibold">Notes / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Received partial cash against pending bill"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-[#6730e3]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#e8ecf1]">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#f8f9fa] text-[#666] hover:bg-[#f0f0f0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl font-bold text-[#1f2029] ${
                    txType === "GAVE" ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"
                  }`}
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
