"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Receipt, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Users, 
  Package, 
  Sparkles
} from "lucide-react";

function InvoiceBuilderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId") || "";

  const [parties, setParties] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId);
  const [billingType, setBillingType] = useState<"B2B" | "B2C" | "EXPORT">("B2B");
  const [placeOfSupply, setPlaceOfSupply] = useState("27");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [notes, setNotes] = useState("Thank you for your business!");
  const [terms, setTerms] = useState("Payment due within 15 days of invoice date.");
  const [paidAmount, setPaidAmount] = useState("0");

  const [lineItems, setLineItems] = useState<any[]>([
    {
      itemId: "",
      description: "",
      hsnCode: "8517",
      qty: 1,
      unit: "Pcs",
      rate: 0,
      discountPercent: 0,
      taxPercent: 18,
      amount: 0,
    }
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [partiesRes, itemsRes] = await Promise.all([
          fetch("/api/parties"),
          fetch("/api/items"),
        ]);
        const pData = await partiesRes.json();
        const iData = await itemsRes.json();

        setParties(pData.parties || []);
        setItems(iData.items || []);

        if (preselectedClientId) {
          setSelectedClientId(preselectedClientId);
        } else if (pData.parties && pData.parties.length > 0) {
          setSelectedClientId(pData.parties[0].id);
        }
      } catch (e) {
        console.error(e);
      } fontFinally: {
        setLoading(false);
      }
    }
    loadData();
  }, [preselectedClientId]);

  // Selected party object
  const selectedParty = parties.find(p => p.id === selectedClientId);

  // Handle Item Select from Inventory
  const handleItemSelect = (index: number, itemId: string) => {
    const invItem = items.find(i => i.id === itemId);
    const updated = [...lineItems];
    if (invItem) {
      updated[index] = {
        ...updated[index],
        itemId: invItem.id,
        description: invItem.name,
        hsnCode: invItem.hsnCode || "8517",
        unit: invItem.unit || "Pcs",
        rate: invItem.salePrice || 0,
        taxPercent: invItem.taxRate || 18,
        amount: (invItem.salePrice || 0) * (updated[index].qty || 1),
      };
    } else {
      updated[index].itemId = "";
    }
    setLineItems(updated);
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };

    const qty = parseFloat(updated[index].qty) || 0;
    const rate = parseFloat(updated[index].rate) || 0;
    const disc = parseFloat(updated[index].discountPercent) || 0;

    const base = qty * rate;
    const taxable = base - (base * (disc / 100));
    updated[index].amount = taxable;

    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        itemId: "",
        description: "",
        hsnCode: "8517",
        qty: 1,
        unit: "Pcs",
        rate: 0,
        discountPercent: 0,
        taxPercent: 18,
        amount: 0,
      }
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Calculation totals
  const totalTaxable = lineItems.reduce((acc, item) => acc + (item.amount || 0), 0);
  const supplierStateCode = "27";
  const partyStateCode = selectedParty?.stateCode || placeOfSupply || supplierStateCode;
  const isIntraState = supplierStateCode === partyStateCode;

  const totalTax = lineItems.reduce((acc, item) => {
    const taxVal = (item.amount || 0) * ((item.taxPercent || 0) / 100);
    return acc + taxVal;
  }, 0);

  const grandTotal = totalTaxable + totalTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      alert("Please select a customer party");
      return;
    }

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          billingType,
          placeOfSupply: partyStateCode,
          invoiceNo: invoiceNo || undefined,
          lineItems,
          totalAmount: grandTotal,
          paidAmount: parseFloat(paidAmount) || 0,
          notes,
          terms,
        }),
      });

      const data = await res.json();
      if (res.ok && data.invoice) {
        router.push(`/invoices/${data.invoice.id}`);
      } else {
        alert(data.error || "Failed to create GST invoice");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error saving invoice");
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading invoice form...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Customer & Billing Details */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Users className="w-4 h-4 text-emerald-400" /> Customer & GST Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Select Customer / Party *</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-indigo-500"
            >
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.gstin ? `(${p.gstin})` : "(B2C Consumer)"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Billing Type</label>
            <select
              value={billingType}
              onChange={(e) => setBillingType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="B2B">B2B (Registered Buyer with GSTIN)</option>
              <option value="B2C">B2C (Retail Consumer)</option>
              <option value="EXPORT">EXPORT / SEZ (Zero Rated)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Invoice No (Optional)</label>
            <input
              type="text"
              placeholder="Auto-generated if empty"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {selectedParty && (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-slate-300">
            <div>
              <span className="font-bold text-white">{selectedParty.name}</span>
              {selectedParty.gstin && (
                <span className="ml-2 font-mono text-[11px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">
                  GSTIN: {selectedParty.gstin}
                </span>
              )}
              {selectedParty.address && <p className="text-[11px] text-slate-400">{selectedParty.address}</p>}
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">GST Tax Mode</span>
              <div className={`font-bold ${isIntraState ? "text-emerald-400" : "text-amber-400"}`}>
                {isIntraState ? "Intra-State (CGST + SGST)" : "Inter-State (IGST)"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Line Items Builder */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-400" /> Line Items & HSN Tax Rates
          </h2>
          <button
            type="button"
            onClick={addLineItem}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Line
          </button>
        </div>

        <div className="space-y-3">
          {lineItems.map((item, idx) => {
            const matchedInvItem = items.find(i => i.id === item.itemId);
            const availableStock = matchedInvItem ? matchedInvItem.stockQty : null;

            return (
              <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 mb-1 font-semibold">Pick from Inventory OR Type Description *</label>
                    <div className="flex gap-2">
                      <select
                        value={item.itemId}
                        onChange={(e) => handleItemSelect(idx, e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none"
                      >
                        <option value="">Custom Item</option>
                        {items.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({i.stockQty} in stock)
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        required
                        placeholder="Item Description"
                        value={item.description}
                        onChange={(e) => handleLineChange(idx, "description", e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">HSN Code</label>
                    <input
                      type="text"
                      placeholder="8517"
                      value={item.hsnCode}
                      onChange={(e) => handleLineChange(idx, "hsnCode", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">GST Rate (%)</label>
                    <select
                      value={item.taxPercent}
                      onChange={(e) => handleLineChange(idx, "taxPercent", parseFloat(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none"
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 items-center">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleLineChange(idx, "qty", parseFloat(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold focus:outline-none"
                    />
                    {availableStock !== null && (
                      <span className={`text-[10px] ${availableStock < item.qty ? "text-amber-400 font-bold" : "text-slate-400"}`}>
                        Available Stock: {availableStock}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Rate (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => handleLineChange(idx, "rate", parseFloat(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Taxable Value</label>
                    <div className="text-sm font-black text-white pt-1">
                      ₹{(item.amount || 0).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="text-right pt-4">
                    <button
                      type="button"
                      onClick={() => removeLineItem(idx)}
                      className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calculation Totals & Upfront Payment Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-white">Invoice Notes & Payment Received</h2>
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Upfront Payment Received Now (₹)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Invoice Footnote</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 shadow-xl space-y-2 bg-gradient-to-br from-indigo-950/20 to-slate-900">
          <div className="flex justify-between text-slate-300">
            <span>Total Taxable Subtotal:</span>
            <span className="font-bold text-white">₹{totalTaxable.toLocaleString("en-IN")}</span>
          </div>

          {isIntraState ? (
            <>
              <div className="flex justify-between text-slate-400">
                <span>CGST (9% / 2.5%):</span>
                <span>₹{(totalTax / 2).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SGST (9% / 2.5%):</span>
                <span>₹{(totalTax / 2).toLocaleString("en-IN")}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-slate-400">
              <span>IGST (18% / 12%):</span>
              <span>₹{totalTax.toLocaleString("en-IN")}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-slate-800">
            <span>Grand Total:</span>
            <span className="text-indigo-400">₹{grandTotal.toLocaleString("en-IN")}</span>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 text-sm"
            >
              Save & Generate Vyapar GST Invoice
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function NewGstInvoicePage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link href="/invoices" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-400" /> Create GST Sales Invoice
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Auto-calculates CGST/SGST vs IGST, deducts item stock, and posts to Khatabook party ledger.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Vyapar GST Engine
        </span>
      </div>

      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading invoice form...</div>}>
        <InvoiceBuilderForm />
      </Suspense>
    </div>
  );
}
