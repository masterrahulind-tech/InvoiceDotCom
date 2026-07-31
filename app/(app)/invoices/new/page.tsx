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
  Camera
} from "lucide-react";
import { usePhysicalBarcodeScanner } from "@/lib/usePhysicalBarcodeScanner";
import { BarcodeScannerModal } from "@/components/BarcodeScannerModal";

function InvoiceBuilderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId") || "";

  const [parties, setParties] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScannerModal, setShowScannerModal] = useState(false);

  // Form State
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId);
  const [billingType, setBillingType] = useState<"B2B" | "B2C" | "EXPORT">("B2B");
  const [placeOfSupply, setPlaceOfSupply] = useState("27");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [documentType, setDocumentType] = useState<"INVOICE" | "QUOTATION" | "PROFORMA" | "CHALLAN">("INVOICE");
  const [notes, setNotes] = useState("Thank you for your business!");
  const [terms, setTerms] = useState("Payment due within 15 days of invoice date.");
  const [paidAmount, setPaidAmount] = useState("0");
  
  // Logistics
  const [vehicleNo, setVehicleNo] = useState("");
  const [ewayBillNo, setEwayBillNo] = useState("");
  const [transportMode, setTransportMode] = useState<"road" | "rail" | "air" | "ship">("road");

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

  const handleBarcodeScan = (barcode: string) => {
    const invItem = items.find(i => i.sku === barcode || i.id === barcode);
    if (invItem) {
      // Create new line item for the scanned product
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
      
      // If the last item is completely empty, replace it, otherwise append
      const lastItem = lineItems[lineItems.length - 1];
      if (!lastItem.itemId && !lastItem.description) {
        const updated = [...lineItems];
        updated[updated.length - 1] = newItem;
        setLineItems(updated);
      } else {
        setLineItems([...lineItems, newItem]);
      }
    } else {
      alert(`No item found for barcode/SKU: ${barcode}`);
    }
  };

  usePhysicalBarcodeScanner(handleBarcodeScan);

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
        alert(data.error || "Failed to create GST invoice");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error saving invoice");
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-[#999]">Loading invoice form...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Customer & Billing Details */}
      <div className="bg-white border border-[#e8ecf1] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
        <h2 className="text-sm font-bold text-[#1f2029] flex items-center gap-2 border-b border-[#e8ecf1] pb-3">
          <Users className="w-4 h-4 text-emerald-400" /> Customer & GST Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[#999] mb-1 font-semibold">Select Customer / Party *</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] font-medium focus:outline-none focus:border-[#6730e3]"
            >
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.gstin ? `(${p.gstin})` : "(B2C Consumer)"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#999] mb-1 font-semibold">Billing Type</label>
            <select
              value={billingType}
              onChange={(e) => setBillingType(e.target.value as any)}
              className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] font-medium focus:outline-none focus:border-[#6730e3]"
            >
              <option value="B2B">B2B (Registered Buyer with GSTIN)</option>
              <option value="B2C">B2C (Retail Consumer)</option>
              <option value="EXPORT">EXPORT / SEZ (Zero Rated)</option>
            </select>
          </div>

          <div>
            <label className="block text-[#999] mb-1 font-semibold">Invoice No (Optional)</label>
            <input
              type="text"
              placeholder="Auto-generated if empty"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] font-mono focus:outline-none focus:border-[#6730e3]"
            />
          </div>

          <div>
            <label className="block text-[#999] mb-1 font-semibold">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as any)}
              className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] font-medium focus:outline-none focus:border-[#6730e3]"
            >
              <option value="INVOICE">Tax Invoice</option>
              <option value="QUOTATION">Quotation / Estimate</option>
              <option value="PROFORMA">Proforma Invoice</option>
              <option value="CHALLAN">Delivery Challan</option>
            </select>
          </div>
        </div>

        {selectedParty && (
          <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e8ecf1] flex flex-col sm:flex-row sm:items-center justify-between text-[#666] gap-3">
            <div>
              <span className="font-bold text-[#1f2029]">{selectedParty.name}</span>
              {selectedParty.gstin && (
                <span className="ml-2 font-mono text-[11px] bg-[#f3f0ff] text-[#6730e3] px-2 py-0.5 rounded border border-[#e0d5ff]">
                  GSTIN: {selectedParty.gstin}
                </span>
              )}
              {selectedParty.address && <p className="text-[11px] text-[#999]">{selectedParty.address}</p>}
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-[#999] uppercase font-semibold">GST Tax Mode</span>
              <div className={`font-bold ${isIntraState ? "text-emerald-400" : "text-amber-400"}`}>
                {isIntraState ? "Intra-State (CGST + SGST)" : "Inter-State (IGST)"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Line Items Builder */}
      <div className="bg-white border border-[#e8ecf1] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8ecf1] pb-3">
          <h2 className="text-sm font-bold text-[#1f2029] flex items-center gap-2">
            <Package className="w-4 h-4 text-[#6730e3]" /> Line Items & HSN Tax Rates
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowScannerModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-[#6730e3] hover:bg-[#f8f9fa] border border-[#e0d5ff] flex items-center gap-1 shadow-sm transition-all"
            >
              <Camera className="w-3.5 h-3.5" /> Scan Barcode
            </button>
            <button
              type="button"
              onClick={addLineItem}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#6730e3]/20 text-[#6730e3] hover:bg-[#6730e3]/30 border border-[#e0d5ff] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Line
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {lineItems.map((item, idx) => {
            const matchedInvItem = items.find(i => i.id === item.itemId);
            const availableStock = matchedInvItem ? matchedInvItem.stockQty : null;

            return (
              <div key={idx} className="p-4 bg-[#f8f9fa] rounded-xl border border-[#e8ecf1] space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[#999] mb-1 font-semibold">Pick from Inventory OR Type Description *</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={item.itemId}
                        onChange={(e) => handleItemSelect(idx, e.target.value)}
                        className="bg-white border border-[#e8ecf1] rounded-xl px-2.5 py-1.5 text-[#333] text-xs focus:outline-none sm:w-1/3"
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
                        className="flex-1 bg-white border border-[#e8ecf1] rounded-xl px-3 py-1.5 text-[#1f2029] font-medium focus:outline-none focus:border-[#6730e3]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#999] mb-1 font-semibold">HSN Code</label>
                    <input
                      type="text"
                      placeholder="8517"
                      value={item.hsnCode}
                      onChange={(e) => handleLineChange(idx, "hsnCode", e.target.value)}
                      className="w-full bg-white border border-[#e8ecf1] rounded-xl px-3 py-1.5 text-[#1f2029] font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#999] mb-1 font-semibold">GST Rate (%)</label>
                    <select
                      value={item.taxPercent}
                      onChange={(e) => handleLineChange(idx, "taxPercent", parseFloat(e.target.value))}
                      className="w-full bg-white border border-[#e8ecf1] rounded-xl px-3 py-1.5 text-[#1f2029] focus:outline-none"
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 items-center">
                  <div>
                    <label className="block text-[#999] mb-1 font-semibold">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleLineChange(idx, "qty", parseFloat(e.target.value))}
                      className="w-full bg-white border border-[#e8ecf1] rounded-xl px-3 py-1.5 text-[#1f2029] font-bold focus:outline-none"
                    />
                    {availableStock !== null && (
                      <span className={`text-[10px] ${availableStock < item.qty ? "text-amber-400 font-bold" : "text-[#999]"}`}>
                        Available Stock: {availableStock}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#999] mb-1 font-semibold">Rate (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => handleLineChange(idx, "rate", parseFloat(e.target.value))}
                      className="w-full bg-white border border-[#e8ecf1] rounded-xl px-3 py-1.5 text-[#1f2029] font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#999] mb-1 font-semibold">Taxable Value</label>
                    <div className="text-sm font-black text-[#1f2029] pt-1">
                      ₹{(item.amount || 0).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#999] mb-1 font-semibold">Discount (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={item.discountPercent}
                      onChange={(e) => handleLineChange(idx, "discountPercent", parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-[#e8ecf1] rounded-xl px-3 py-1.5 text-[#1f2029] font-bold focus:outline-none text-rose-500"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-4 md:col-span-1 text-right pt-2 md:pt-4">
                    <button
                      type="button"
                      onClick={() => removeLineItem(idx)}
                      className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logistics & E-Way Bill Section */}
      <div className="bg-white border border-[#e8ecf1] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
        <h2 className="text-sm font-bold text-[#1f2029] flex items-center gap-2 border-b border-[#e8ecf1] pb-3">
          <Package className="w-4 h-4 text-amber-500" /> Shipping & Logistics Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[#999] mb-1 font-semibold">Vehicle No (Optional)</label>
            <input
              type="text"
              placeholder="e.g. MH 12 AB 1234"
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] font-medium focus:outline-none focus:border-[#6730e3]"
            />
          </div>
          <div>
            <label className="block text-[#999] mb-1 font-semibold">E-Way Bill No (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 123456789012"
              value={ewayBillNo}
              onChange={(e) => setEwayBillNo(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] font-medium focus:outline-none focus:border-[#6730e3]"
            />
          </div>
          <div>
            <label className="block text-[#999] mb-1 font-semibold">Transport Mode</label>
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value as any)}
              className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] font-medium focus:outline-none focus:border-[#6730e3]"
            >
              <option value="road">Road</option>
              <option value="rail">Rail</option>
              <option value="air">Air</option>
              <option value="ship">Ship</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calculation Totals & Upfront Payment Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#e8ecf1] rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
          <h2 className="text-sm font-bold text-[#1f2029]">Invoice Notes & Payment Received</h2>
          <div>
            <label className="block text-[#999] mb-1 font-semibold">Upfront Payment Received Now (₹)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3.5 py-2 text-[#1f2029] font-bold text-sm focus:outline-none focus:border-[#6730e3]"
            />
          </div>
          <div>
            <label className="block text-[#999] mb-1 font-semibold">Invoice Footnote</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-white border border-[#e0d5ff] rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-2 bg-gradient-to-br from-indigo-950/20 to-slate-900">
          <div className="flex justify-between text-[#666]">
            <span>Total Taxable Subtotal:</span>
            <span className="font-bold text-[#1f2029]">₹{totalTaxable.toLocaleString("en-IN")}</span>
          </div>

          {isIntraState ? (
            <>
              <div className="flex justify-between text-[#999]">
                <span>CGST (9% / 2.5%):</span>
                <span>₹{(totalTax / 2).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[#999]">
                <span>SGST (9% / 2.5%):</span>
                <span>₹{(totalTax / 2).toLocaleString("en-IN")}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-[#999]">
              <span>IGST (18% / 12%):</span>
              <span>₹{totalTax.toLocaleString("en-IN")}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-black text-[#1f2029] pt-2 border-t border-[#e8ecf1]">
            <span>Grand Total:</span>
            <span className="text-[#6730e3]">₹{grandTotal.toLocaleString("en-IN")}</span>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-[#1f2029] font-extrabold shadow-lg shadow-[#6730e340] transition-all active:scale-95 text-sm"
            >
              Save & Generate {documentType === "INVOICE" ? "GST Invoice" : documentType}
            </button>
          </div>
        </div>
      </div>

      {showScannerModal && (
        <BarcodeScannerModal
          onClose={() => setShowScannerModal(false)}
          onScan={(barcode) => {
            handleBarcodeScan(barcode);
            setShowScannerModal(false);
          }}
        />
      )}
    </form>
  );
}

export default function NewGstInvoicePage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link href="/invoices" className="inline-flex items-center gap-1.5 text-xs text-[#999] hover:text-[#1f2029]">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1f2029] tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#6730e3]" /> Create GST Sales Invoice
          </h1>
          <p className="text-xs text-[#999] mt-1">
            Auto-calculates CGST/SGST vs IGST, deducts item stock, and posts to Khatabook party ledger.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#f3f0ff] text-[#6730e3] border border-[#e0d5ff] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Vyapar GST Engine
        </span>
      </div>

      <Suspense fallback={<div className="p-12 text-center text-xs text-[#999]">Loading invoice form...</div>}>
        <InvoiceBuilderForm />
      </Suspense>
    </div>
  );
}
