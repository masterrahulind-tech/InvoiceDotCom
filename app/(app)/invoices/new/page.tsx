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
  Sparkles,
  Camera,
  FileText,
  Truck,
  CreditCard,
  ChevronDown
} from "lucide-react";
import { usePhysicalBarcodeScanner } from "@/lib/usePhysicalBarcodeScanner";
import { useScannerStore } from "@/lib/store/useScannerStore";

function InvoiceBuilderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId") || "";

  const [parties, setParties] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const openScanner = useScannerStore(s => s.openScanner);

  // Form State
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId);
  const [billingType, setBillingType] = useState<"B2B" | "B2C" | "EXPORT">("B2B");
  const [placeOfSupply, setPlaceOfSupply] = useState("27");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [documentType, setDocumentType] = useState<"INVOICE" | "QUOTATION" | "PROFORMA" | "CHALLAN">("INVOICE");
  const [notes, setNotes] = useState("Thank you for your business!");
  const [terms, setTerms] = useState("Payment due within 15 days.");
  const [paidAmount, setPaidAmount] = useState("0");
  
  // Logistics
  const [vehicleNo, setVehicleNo] = useState("");
  const [ewayBillNo, setEwayBillNo] = useState("");
  const [transportMode, setTransportMode] = useState<"road" | "rail" | "air" | "ship">("road");

  const [lineItems, setLineItems] = useState<any[]>([
    {
      itemId: "",
      description: "",
      hsnCode: "",
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
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [preselectedClientId]);

  const selectedParty = parties.find(p => p.id === selectedClientId);

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
        hsnCode: "",
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

  const handleBarcodeScan = (barcode: string) => {
    const invItem = items.find(i => i.sku === barcode || i.id === barcode);
    if (invItem) {
      const newItem = {
        itemId: invItem.id,
        description: invItem.name,
        hsnCode: invItem.hsnCode || "8517",
        qty: 1,
        unit: invItem.unit || "Pcs",
        rate: invItem.salePrice || 0,
        discountPercent: 0,
        taxPercent: invItem.taxRate || 18,
        amount: invItem.salePrice || 0,
      };
      
      const lastItem = lineItems[lineItems.length - 1];
      if (!lastItem.itemId && !lastItem.description) {
        const updated = [...lineItems];
        updated[updated.length - 1] = newItem;
        setLineItems(updated);
      } else {
        setLineItems([...lineItems, newItem]);
      }
    }
  };

  usePhysicalBarcodeScanner(handleBarcodeScan);

  const totalTaxable = lineItems.reduce((acc, item) => acc + (item.amount || 0), 0);
  const supplierStateCode = "27";
  const partyStateCode = selectedParty?.stateCode || placeOfSupply || supplierStateCode;
  const isIntraState = supplierStateCode === partyStateCode;

  const totalTax = lineItems.reduce((acc, item) => {
    return acc + ((item.amount || 0) * ((item.taxPercent || 0) / 100));
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
          documentType,
          billingType,
          placeOfSupply: partyStateCode,
          invoiceNo: invoiceNo || undefined,
          lineItems,
          totalAmount: grandTotal,
          paidAmount: parseFloat(paidAmount) || 0,
          notes,
          terms,
          vehicleNo: vehicleNo || undefined,
          ewayBillNo: ewayBillNo || undefined,
          transportMode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.invoice) {
        router.push(`/invoices/${data.invoice.id}`);
      } else {
        alert(data.error || "Failed to create invoice");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving invoice");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          <span className="text-sm font-medium text-slate-400">Loading Pro Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: THE ENGINE */}
      <div className="xl:col-span-7 space-y-6 pb-32">
        
        {/* Document Header Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">Document Details</h2>
              <p className="text-xs font-medium text-slate-500">Configure client and invoice parameters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Client / Party</label>
              <div className="relative">
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full appearance-none bg-slate-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all cursor-pointer"
                >
                  <option value="" disabled>Select Client...</option>
                  {parties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.gstin ? `(${p.gstin})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {selectedParty?.gstin && (
                <div className="mt-2 text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> GSTIN: {selectedParty.gstin}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Document Type</label>
              <div className="relative">
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                  className="w-full appearance-none bg-slate-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all cursor-pointer"
                >
                  <option value="INVOICE">Tax Invoice</option>
                  <option value="QUOTATION">Quotation / Estimate</option>
                  <option value="PROFORMA">Proforma Invoice</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Invoice Number</label>
              <input
                type="text"
                placeholder="Auto-generated"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Billing Profile</label>
              <div className="relative">
                <select
                  value={billingType}
                  onChange={(e) => setBillingType(e.target.value as any)}
                  className="w-full appearance-none bg-slate-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all cursor-pointer"
                >
                  <option value="B2B">B2B (Registered)</option>
                  <option value="B2C">B2C (Retail)</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* The Grid: Line Items */}
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-1 shadow-sm overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-fuchsia-50 flex items-center justify-center border border-fuchsia-100/50">
                <Package className="w-5 h-5 text-fuchsia-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 tracking-tight">Line Items Grid</h2>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Press Tab to navigate cells</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openScanner(handleBarcodeScan)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 shadow-sm transition-all flex items-center gap-2 group"
            >
              <Camera className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" /> Scan Barcode
            </button>
          </div>

          <div className="overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[35%]">Item Details</th>
                  <th className="px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[12%]">HSN</th>
                  <th className="px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[12%]">Qty</th>
                  <th className="px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[15%]">Rate</th>
                  <th className="px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[12%]">Tax %</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right w-[14%]">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="p-2 pl-4">
                      <div className="relative">
                        <select
                          value={item.itemId}
                          onChange={(e) => handleItemSelect(idx, e.target.value)}
                          className="absolute inset-y-0 left-0 w-8 opacity-0 cursor-pointer z-10"
                        >
                          <option value="">+</option>
                          {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                        <input
                          type="text"
                          placeholder="Search or type description..."
                          value={item.description}
                          onChange={(e) => handleLineChange(idx, "description", e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-600/20 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-all"
                        />
                      </div>
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="8517"
                        value={item.hsnCode}
                        onChange={(e) => handleLineChange(idx, "hsnCode", e.target.value)}
                        className="w-full bg-transparent border-0 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-600/20 rounded-lg px-2 py-2 text-sm font-mono text-slate-600 transition-all"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleLineChange(idx, "qty", parseFloat(e.target.value))}
                        className="w-full bg-transparent border-0 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-600/20 rounded-lg px-2 py-2 text-sm font-bold text-slate-700 transition-all text-center"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => handleLineChange(idx, "rate", parseFloat(e.target.value))}
                        className="w-full bg-transparent border-0 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-600/20 rounded-lg px-2 py-2 text-sm font-bold text-slate-700 transition-all text-right"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={item.taxPercent}
                        onChange={(e) => handleLineChange(idx, "taxPercent", parseFloat(e.target.value))}
                        className="w-full bg-transparent border-0 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-600/20 rounded-lg px-1 py-2 text-sm font-bold text-slate-700 transition-all appearance-none cursor-pointer text-center"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </td>
                    <td className="p-2 pr-4 relative">
                      <div className="text-sm font-black text-slate-800 text-right pr-6">
                        {(item.amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl">
            <button
              type="button"
              onClick={addLineItem}
              className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Row
            </button>
          </div>
        </div>

        {/* E-way & Settings */}
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100/50">
              <Truck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">Logistics & E-Way Bill</h2>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Optional shipping details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Vehicle No.</label>
              <input
                type="text"
                placeholder="MH 12 AB 1234"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">E-Way Bill</label>
              <input
                type="text"
                value={ewayBillNo}
                onChange={(e) => setEwayBillNo(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Transport</label>
              <div className="relative">
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value as any)}
                  className="w-full appearance-none bg-slate-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all cursor-pointer"
                >
                  <option value="road">Road Transport</option>
                  <option value="rail">Rail Transport</option>
                  <option value="air">Air Cargo</option>
                  <option value="ship">Ship / Sea</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
        
      </div>

      {/* RIGHT COLUMN: LIVE CANVAS & SUMMARY */}
      <div className="xl:col-span-5 sticky top-8 space-y-6">
        
        {/* Dynamic Summary Card */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-1 shadow-2xl shadow-indigo-900/20 overflow-hidden">
          <div className="p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-opacity-10 relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Sparkles className="w-24 h-24 text-white" />
            </div>
            
            <h2 className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-4">Invoice Summary</h2>
            
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between text-white/80 text-sm">
                <span>Taxable Subtotal</span>
                <span className="font-mono">₹{totalTaxable.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
              </div>
              
              {isIntraState ? (
                <>
                  <div className="flex justify-between text-white/70 text-sm">
                    <span>CGST</span>
                    <span className="font-mono">₹{(totalTax / 2).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-white/70 text-sm">
                    <span>SGST</span>
                    <span className="font-mono">₹{(totalTax / 2).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-white/70 text-sm">
                  <span>IGST</span>
                  <span className="font-mono">₹{totalTax.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-end relative z-10">
              <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Grand Total</span>
              <span className="text-4xl font-black text-white tracking-tight">₹{grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="p-3 bg-white/5 backdrop-blur-md flex flex-col gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <input
                type="number"
                placeholder="Upfront Payment Received (₹)"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" /> Generate {documentType} Now
            </button>
          </div>
        </div>

        {/* Live PDF Preview Canvas */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[400px] flex flex-col hidden lg:flex">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Live Document Preview
            </span>
            <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Syncing
            </span>
          </div>

          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-[10px] text-slate-600 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />
            
            <div className="flex justify-between items-start mb-8 pt-2">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{documentType}</h1>
                <p className="text-slate-400 font-mono mt-0.5">{invoiceNo || "INV-XXXX"}</p>
              </div>
              <div className="text-right text-[10px] text-slate-500 max-w-[140px]">
                <p className="font-bold text-slate-800 uppercase tracking-wider mb-1 text-[9px]">Billed To</p>
                <p className="font-semibold text-slate-700 truncate">{selectedParty?.name || "Client Name"}</p>
                {selectedParty?.gstin && <p className="truncate">GSTIN: {selectedParty.gstin}</p>}
                {selectedParty?.address && <p className="truncate">{selectedParty.address}</p>}
              </div>
            </div>

            <div className="border-t border-b border-slate-200 py-2 mb-4 flex font-bold text-slate-800 uppercase tracking-wider text-[9px]">
              <div className="flex-1">Description</div>
              <div className="w-10 text-right">Qty</div>
              <div className="w-16 text-right">Rate</div>
              <div className="w-16 text-right">Total</div>
            </div>

            <div className="space-y-3 min-h-[100px]">
              {lineItems.map((item, idx) => (
                <div key={idx} className="flex text-slate-600 font-medium text-[11px]">
                  <div className="flex-1 truncate pr-2">{item.description || "—"}</div>
                  <div className="w-10 text-right">{item.qty || "0"}</div>
                  <div className="w-16 text-right">{item.rate || "0"}</div>
                  <div className="w-16 text-right text-slate-800 font-bold">{(item.amount || 0).toLocaleString("en-IN")}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-4 mt-auto flex justify-end">
              <div className="w-48 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span>{totalTaxable.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>GST Tax</span>
                  <span>{totalTax.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-black text-indigo-600 text-sm border-t border-slate-200 pt-2 mt-2">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </form>
  );
}

export default function NewGstInvoicePage() {
  return (
    <div className="max-w-[1400px] mx-auto pt-2 pb-12">
      <div className="mb-8">
        <Link href="/invoices" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-800 uppercase tracking-widest transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Workspace
        </Link>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Billing Engine
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-widest">
                Pro
              </span>
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1.5">
              Keyboard-driven document creation with real-time tax compilation.
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={
        <div className="h-64 flex items-center justify-center">
           <div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
        </div>
      }>
        <InvoiceBuilderForm />
      </Suspense>
    </div>
  );
}
