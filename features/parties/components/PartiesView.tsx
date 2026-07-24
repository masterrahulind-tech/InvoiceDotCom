"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Plus, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Send, 
  Phone, 
  MapPin, 
  X,
  ChevronRight
} from "lucide-react";

export function PartiesView() {
  const [parties, setParties] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalPartiesCount: 0,
    totalReceivable: 0,
    totalPayable: 0,
    netBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [partyTypeFilter, setPartyTypeFilter] = useState(""); // customer | supplier | ""

  const [showAddModal, setShowAddModal] = useState(false);
  const [newParty, setNewParty] = useState({
    name: "",
    partyType: "customer",
    phone: "",
    email: "",
    address: "",
    gstin: "",
    stateCode: "27",
    openingBalance: "0",
    balanceType: "receivable",
    creditLimit: "",
  });

  const loadParties = async () => {
    try {
      setLoading(true);
      const url = `/api/parties?search=${encodeURIComponent(search)}${partyTypeFilter ? `&type=${partyTypeFilter}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setParties(data.parties || []);
      setSummary(data.summary || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParties();
  }, [search, partyTypeFilter]);

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newParty),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewParty({
          name: "",
          partyType: "customer",
          phone: "",
          email: "",
          address: "",
          gstin: "",
          stateCode: "27",
          openingBalance: "0",
          balanceType: "receivable",
          creditLimit: "",
        });
        loadParties();
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
          <h1 className="text-2xl font-extrabold text-[#1f2029] tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" /> Parties & Khatabook Udhaar Ledger (CRM)
          </h1>
          <p className="text-xs text-[#999] mt-1">
            Track customer debts, supplier payables, passbook entries, and send automated WhatsApp reminders.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-[#1f2029] shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Party
        </button>
      </div>

      {/* Khatabook Summary Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* You Will Get Banner */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4" /> You Will Get (Receivable)
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">
            ₹{(summary.totalReceivable || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-emerald-300/70 mt-1">Total pending debt from customers</p>
        </div>

        {/* You Will Give Banner */}
        <div className="bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 p-5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4" /> You Will Give (Payable)
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
          </div>
          <div className="text-3xl font-black text-rose-400 mt-2">
            ₹{(summary.totalPayable || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-rose-300/70 mt-1">Total payable amount to suppliers</p>
        </div>

        {/* Net Udhaar Balance */}
        <div className="bg-white border border-[#e8ecf1] p-5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <span className="text-xs font-bold text-[#999] uppercase">Net Khatabook Position</span>
          <div>
            <div className={`text-3xl font-black ${summary.netBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              ₹{Math.abs(summary.netBalance || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-[#999] mt-1">
              {summary.netBalance >= 0 ? "Overall net positive credit" : "Overall net negative debt"}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Party Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#e8ecf1] p-3 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#999] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search party by name, phone, GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#333] placeholder-[#aaa] focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setPartyTypeFilter("")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              partyTypeFilter === ""
                ? "bg-emerald-600 text-[#1f2029] shadow-md shadow-emerald-600/20"
                : "bg-[#f8f9fa] text-[#999] hover:text-[#333]"
            }`}
          >
            All Parties ({summary.totalPartiesCount || 0})
          </button>
          <button
            onClick={() => setPartyTypeFilter("customer")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              partyTypeFilter === "customer"
                ? "bg-emerald-600 text-[#1f2029] shadow-md shadow-emerald-600/20"
                : "bg-[#f8f9fa] text-[#999] hover:text-[#333]"
            }`}
          >
            Customers Only
          </button>
          <button
            onClick={() => setPartyTypeFilter("supplier")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              partyTypeFilter === "supplier"
                ? "bg-emerald-600 text-[#1f2029] shadow-md shadow-emerald-600/20"
                : "bg-[#f8f9fa] text-[#999] hover:text-[#333]"
            }`}
          >
            Suppliers Only
          </button>
        </div>
      </div>

      {/* Parties Grid List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#999]">Loading party directories...</div>
      ) : parties.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#e8ecf1] rounded-2xl text-[#999]">
          <Users className="w-10 h-10 mx-auto text-[#ccc] mb-2" />
          <p className="text-xs font-medium">No party records found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parties.map((party) => {
            const isReceivable = party.balanceStatus === "receivable";
            const balAmount = party.calculatedBalance || 0;
            return (
              <div
                key={party.id}
                className="bg-white border border-[#e8ecf1] rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-[#e0d5ff] transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#1f2029] group-hover:text-emerald-400 transition-colors">
                        {party.name}
                      </h3>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f8f9fa] text-[#666] capitalize">
                        {party.partyType}
                      </span>
                    </div>

                    {party.gstin ? (
                      <span className="text-[10px] font-mono bg-[#f3f0ff] text-[#6730e3] px-2 py-0.5 rounded border border-[#e0d5ff]">
                        {party.gstin}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#aaa]">Consumer (B2C)</span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-[#999]">
                    {party.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-[#aaa]" />
                        <span>{party.phone}</span>
                      </div>
                    )}
                    {party.address && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#aaa] truncate">
                        <MapPin className="w-3 h-3 text-[#aaa] flex-shrink-0" />
                        <span className="truncate">{party.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Balance Status & Actions */}
                <div className="mt-5 pt-4 border-t border-[#e8ecf1] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#999] font-semibold uppercase">
                      {isReceivable ? "You Will Get" : "You Will Give"}
                    </span>
                    <div className={`text-base font-black ${isReceivable ? "text-emerald-400" : "text-rose-400"}`}>
                      ₹{balAmount.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {party.phone && balAmount > 0 && isReceivable && (
                      <a
                        href={`https://wa.me/${party.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Hello ${party.name}, your total outstanding bill balance at Apex Digital Solutions is ₹${balAmount.toLocaleString(
                            "en-IN"
                          )}. Kindly make the payment via UPI. Thank you!`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> WhatsApp
                      </a>
                    )}
                    <Link
                      href={`/parties/${party.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f8f9fa] hover:bg-[#f0f0f0] text-[#333] border border-[#e0d5ff] flex items-center gap-1"
                    >
                      Ledger <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Party Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e8ecf1] rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
            <div className="p-5 border-b border-[#e8ecf1] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1f2029] flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" /> Add New Party / Customer
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#999] hover:text-[#1f2029]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateParty} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#999] mb-1 font-semibold">Party Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharma Enterprises"
                    value={newParty.name}
                    onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
                    className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[#999] mb-1 font-semibold">Party Type</label>
                  <select
                    value={newParty.partyType}
                    onChange={(e) => setNewParty({ ...newParty, partyType: e.target.value })}
                    className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-emerald-500"
                  >
                    <option value="customer">Customer</option>
                    <option value="supplier">Supplier</option>
                    <option value="both">Both (Customer & Supplier)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#999] mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newParty.phone}
                    onChange={(e) => setNewParty({ ...newParty, phone: e.target.value })}
                    className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[#999] mb-1 font-semibold">GSTIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="27AAAAA0000A1Z5"
                    value={newParty.gstin}
                    onChange={(e) => setNewParty({ ...newParty, gstin: e.target.value })}
                    className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#999] mb-1 font-semibold">Billing Address</label>
                <input
                  type="text"
                  placeholder="Street, City, Pincode"
                  value={newParty.address}
                  onChange={(e) => setNewParty({ ...newParty, address: e.target.value })}
                  className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#999] mb-1 font-semibold">Opening Udhaar Balance (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newParty.openingBalance}
                    onChange={(e) => setNewParty({ ...newParty, openingBalance: e.target.value })}
                    className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[#999] mb-1 font-semibold">Balance Direction</label>
                  <select
                    value={newParty.balanceType}
                    onChange={(e) => setNewParty({ ...newParty, balanceType: e.target.value })}
                    className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none focus:border-emerald-500"
                  >
                    <option value="receivable">You Will Get (Receivable)</option>
                    <option value="payable">You Will Give (Payable)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#e8ecf1]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#f8f9fa] text-[#666] hover:bg-[#f0f0f0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#1f2029] font-bold"
                >
                  Save Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
