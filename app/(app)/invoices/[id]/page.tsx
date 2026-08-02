"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Send, CreditCard, X, CheckCircle2 } from "lucide-react";
import GstInvoiceTemplate from "@/components/invoice-preview/GstInvoiceTemplate";

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Settlement Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("upi");

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/invoices`);
      const data = await res.json();
      const found = (data.invoices || []).find((i: any) => i.id === id);
      setInvoice(found || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice || !payAmount) return;
    try {
      const newPaid = invoice.paidAmount + parseFloat(payAmount);
      const newStatus = newPaid >= invoice.totalAmount ? "paid" : "partially_paid";

      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(payAmount),
          paymentMode: payMode,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to record payment");
      }

      setShowPayModal(false);
      setPayAmount("");
      loadInvoice();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !invoice) {
    return <div className="p-12 text-center text-xs text-[#999]">Loading GST Invoice details...</div>;
  }

  const clientPhone = invoice.client?.phone;
  const whatsappMsg = `Hello ${invoice.client?.name}, here is your GST Invoice #${invoice.invoiceNo} from Apex Digital Solutions for total ₹${invoice.totalAmount.toLocaleString("en-IN")}. Paid: ₹${invoice.paidAmount.toLocaleString("en-IN")}. Thank you!`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link href="/invoices" className="inline-flex items-center gap-1.5 text-xs text-[#999] hover:text-[#1f2029]">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {clientPhone && (
            <a
              href={`https://wa.me/${clientPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMsg)}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-[#1f2029] shadow-md flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Share on WhatsApp
            </a>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#f8f9fa] hover:bg-[#f0f0f0] text-[#333] border border-[#e0d5ff] flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </button>

          {invoice.status !== "paid" && (
            <button
              onClick={() => setShowPayModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6730e3] hover:bg-[#6730e3] text-[#1f2029] shadow-md flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" /> Settle Payment
            </button>
          )}
        </div>
      </div>

      {/* Render Graphic GST Invoice Template */}
      <GstInvoiceTemplate invoice={invoice} />

      {/* Record Payment Settlement Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e8ecf1] rounded-2xl w-full max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
            <div className="p-5 border-b border-[#e8ecf1] flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-bold text-[#1f2029] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> Settle Payment for #{invoice.invoiceNo}
              </h3>
              <button onClick={() => setShowPayModal(false)} className="text-[#999] hover:text-[#1f2029]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e8ecf1] space-y-1">
                <div className="flex justify-between text-[#999]">
                  <span>Total Amount:</span>
                  <span className="text-[#1f2029] font-bold">₹{invoice.totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[#999]">
                  <span>Already Paid:</span>
                  <span className="text-emerald-400 font-bold">₹{invoice.paidAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[#999] font-bold pt-1 border-t border-[#e8ecf1]">
                  <span>Remaining Due:</span>
                  <span className="text-rose-400 font-black">
                    ₹{(invoice.totalAmount - invoice.paidAmount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[#999] mb-1 font-semibold">Payment Amount Received (₹) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="e.g. 5000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] font-bold text-base focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[#999] mb-1 font-semibold">Payment Method</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e8ecf1] rounded-xl px-3 py-2 text-[#1f2029] focus:outline-none"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="bank">Bank Transfer / NEFT</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#e8ecf1]">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#f8f9fa] text-[#666] hover:bg-[#f0f0f0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#1f2029] font-bold"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
