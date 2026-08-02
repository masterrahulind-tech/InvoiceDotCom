"use client";

import React from "react";
import { Building2, Phone, Mail, MapPin, QrCode, CheckCircle2 } from "lucide-react";

export interface GstInvoiceProps {
  invoice: {
    invoiceNo: string;
    documentType?: string;
    createdAt: string | Date;
    dueDate?: string | Date | null;
    billingType?: string;
    placeOfSupply?: string;
    status: string;
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalAmount: number;
    paidAmount: number;
    notes?: string | null;
    terms?: string | null;
    vehicleNo?: string | null;
    ewayBillNo?: string | null;
    transportMode?: string | null;
    businessProfile: {
      businessName: string;
      gstin?: string | null;
      pan?: string | null;
      stateCode?: string | null;
      address?: string | null;
      bankName?: string | null;
      bankAccountNo?: string | null;
      ifscCode?: string | null;
      branchName?: string | null;
      upiId?: string | null;
      logoUrl?: string | null;
    };
    client: {
      name: string;
      phone?: string | null;
      email?: string | null;
      address?: string | null;
      gstin?: string | null;
      stateCode?: string | null;
    };
    lineItems: Array<{
      id?: string;
      description: string;
      hsnCode?: string | null;
      qty: number;
      unit?: string | null;
      rate: number;
      discountPercent?: number;
      taxPercent: number;
      cgstAmount?: number;
      sgstAmount?: number;
      igstAmount?: number;
      amount: number;
    }>;
  };
}

export default function GstInvoiceTemplate({ invoice }: GstInvoiceProps) {
  const { businessProfile, client, lineItems } = invoice;
  const isPaid = invoice.status === "paid";
  const isPartiallyPaid = invoice.status === "partially_paid";
  const dueAmount = invoice.totalAmount - invoice.paidAmount;
  const hasGst = !!businessProfile.gstin;

  // HSN Tax Breakdown Map
  const hsnMap: Record<string, { hsnCode: string; taxable: number; taxRate: number; cgst: number; sgst: number; igst: number; totalTax: number }> = {};

  lineItems.forEach(item => {
    const code = item.hsnCode || "8517";
    if (!hsnMap[code]) {
      hsnMap[code] = {
        hsnCode: code,
        taxable: 0,
        taxRate: item.taxPercent,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalTax: 0,
      };
    }
    hsnMap[code].taxable += item.amount;
    hsnMap[code].cgst += (item.cgstAmount || 0);
    hsnMap[code].sgst += (item.sgstAmount || 0);
    hsnMap[code].igst += (item.igstAmount || 0);
    hsnMap[code].totalTax += ((item.cgstAmount || 0) + (item.sgstAmount || 0) + (item.igstAmount || 0));
  });

  const hsnList = Object.values(hsnMap);

  return (
    <div className="bg-white text-slate-900 font-sans p-6 sm:p-10 rounded-2xl shadow-2xl max-w-4xl mx-auto border border-slate-200 relative overflow-hidden print:p-0 print:shadow-none print:border-none">
      {/* Watermark Status Badge */}
      <div className="absolute right-8 top-8 opacity-10 pointer-events-none uppercase font-black text-6xl tracking-widest rotate-[-12deg] border-4 border-slate-900 px-6 py-2 rounded-xl">
        {invoice.status}
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-slate-900">
        <div>
          <div className="flex items-center gap-3">
            {businessProfile.logoUrl && (
              <img src={businessProfile.logoUrl} alt="Logo" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
            )}
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">{businessProfile.businessName}</h1>
              <span className="text-xs font-extrabold uppercase text-indigo-700 tracking-wider">
                {invoice.documentType === "QUOTATION" ? "QUOTATION" : 
                 invoice.documentType === "PROFORMA" ? "PROFORMA INVOICE" : 
                 invoice.documentType === "CHALLAN" ? "DELIVERY CHALLAN" : 
                 invoice.documentType === "BILL_OF_SUPPLY" ? "BILL OF SUPPLY" :
                 (hasGst ? "TAX INVOICE" : "INVOICE")}
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-600 space-y-0.5 max-w-sm">
            {businessProfile.address && <p>{businessProfile.address}</p>}
            {hasGst && (
              <p className="font-semibold text-slate-900">
                GSTIN: <span className="font-mono text-indigo-900">{businessProfile.gstin}</span> | State Code: {businessProfile.stateCode || "27"}
              </p>
            )}
            {businessProfile.pan && <p>PAN: {businessProfile.pan}</p>}
          </div>
        </div>

        {/* Invoice Metadata Box */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-1.5 min-w-[220px]">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Invoice No:</span>
            <span className="font-mono font-bold text-slate-900">{invoice.invoiceNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Invoice Date:</span>
            <span className="font-semibold text-slate-900">
              {new Date(invoice.createdAt).toLocaleDateString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Place of Supply:</span>
            <span className="font-semibold text-slate-900">{invoice.placeOfSupply || "27 (Maharashtra)"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Billing Type:</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
              {invoice.billingType || "B2B"}
            </span>
          </div>
          {invoice.ewayBillNo && (
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-500 font-medium">E-Way Bill:</span>
              <span className="font-mono font-bold text-slate-900">{invoice.ewayBillNo}</span>
            </div>
          )}
          {invoice.vehicleNo && (
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Vehicle / Mode:</span>
              <span className="font-semibold text-slate-900 uppercase">{invoice.vehicleNo} ({invoice.transportMode || "road"})</span>
            </div>
          )}
        </div>
      </div>

      {/* Bill To / Consignee Section */}
      <div className="py-5 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-200 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Billed To (Buyer)</span>
          <div className="font-extrabold text-sm text-slate-900">{client.name}</div>
          {client.address && <p className="text-slate-600 mt-0.5">{client.address}</p>}
          <div className="mt-1 space-y-0.5 font-medium text-slate-700">
            {client.phone && <p>Phone: {client.phone}</p>}
            {client.email && <p>Email: {client.email}</p>}
            {client.gstin ? (
              <p className="font-bold text-emerald-800">
                GSTIN: <span className="font-mono">{client.gstin}</span> (State Code: {client.stateCode || "27"})
              </p>
            ) : (
              <p className="text-slate-500">Unregistered Consumer (B2C)</p>
            )}
          </div>
        </div>

        {/* Payment QR / Bank Details Box */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 rounded-xl flex items-center justify-between shadow-md">
          <div className="space-y-1 text-xs">
            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Bank & UPI Payment Details</span>
            <p className="font-bold">{businessProfile.bankName || "HDFC Bank"}</p>
            <p className="font-mono text-[11px]">A/C: {businessProfile.bankAccountNo || "50200084920192"}</p>
            <p className="font-mono text-[11px]">IFSC: {businessProfile.ifscCode || "HDFC0000240"}</p>
            {businessProfile.upiId && (
              <p className="text-emerald-400 font-semibold text-[11px]">UPI: {businessProfile.upiId}</p>
            )}
          </div>
          <div className="bg-white p-1.5 rounded-lg flex flex-col items-center">
            <QrCode className="w-12 h-12 text-slate-900" />
            <span className="text-[8px] font-bold text-slate-900 uppercase mt-0.5">Scan to Pay</span>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="py-5">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider">
              <th className="py-2.5 px-3 rounded-l-lg">#</th>
              <th className="py-2.5 px-3">Item Description</th>
              <th className="py-2.5 px-2 text-center">HSN</th>
              <th className="py-2.5 px-2 text-center">Qty</th>
              <th className="py-2.5 px-2 text-right">Rate</th>
              {lineItems.some(item => item.discountPercent && item.discountPercent > 0) && (
                <th className="py-2.5 px-2 text-right">Disc %</th>
              )}
              {hasGst && <th className="py-2.5 px-2 text-right">GST %</th>}
              <th className="py-2.5 px-3 text-right rounded-r-lg">{hasGst ? "Taxable Value" : "Amount"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {lineItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-3 px-3 font-semibold text-slate-500">{idx + 1}</td>
                <td className="py-3 px-3 font-bold text-slate-900">{item.description}</td>
                <td className="py-3 px-2 text-center font-mono text-slate-600">{item.hsnCode || "8517"}</td>
                <td className="py-3 px-2 text-center font-bold text-slate-900">{item.qty} {item.unit || "Pcs"}</td>
                <td className="py-3 px-2 text-right text-slate-700">₹{item.rate.toLocaleString("en-IN")}</td>
                {lineItems.some(i => i.discountPercent && i.discountPercent > 0) && (
                  <td className="py-3 px-2 text-right text-rose-600 font-semibold">{item.discountPercent || 0}%</td>
                )}
                {hasGst && <td className="py-3 px-2 text-right font-semibold text-emerald-700">{item.taxPercent}%</td>}
                <td className="py-3 px-3 text-right font-black text-slate-900">₹{item.amount.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tax Computation & Totals Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
        {/* HSN Summary Mini Table */}
        {hasGst ? (
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              HSN Tax Breakdown Summary
            </span>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-1.5">HSN</th>
                    <th className="p-1.5 text-right">Taxable</th>
                    <th className="p-1.5 text-right">CGST</th>
                    <th className="p-1.5 text-right">SGST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-600 font-mono">
                  {hsnList.map((h, i) => (
                    <tr key={i}>
                      <td className="p-1.5 font-bold text-slate-900">{h.hsnCode}</td>
                      <td className="p-1.5 text-right">₹{h.taxable.toLocaleString("en-IN")}</td>
                      <td className="p-1.5 text-right">₹{h.cgst.toLocaleString("en-IN")}</td>
                      <td className="p-1.5 text-right">₹{h.sgst.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : <div />}

        {/* Calculation Totals Card */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 font-medium text-slate-700">
          <div className="flex justify-between">
            <span>{hasGst ? "Total Taxable Amount:" : "Subtotal:"}</span>
            <span className="font-bold text-slate-900">₹{invoice.taxableAmount.toLocaleString("en-IN")}</span>
          </div>

          {invoice.cgstAmount > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>CGST Total:</span>
              <span>₹{invoice.cgstAmount.toLocaleString("en-IN")}</span>
            </div>
          )}

          {invoice.sgstAmount > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>SGST Total:</span>
              <span>₹{invoice.sgstAmount.toLocaleString("en-IN")}</span>
            </div>
          )}

          {invoice.igstAmount > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>IGST Total:</span>
              <span>₹{invoice.igstAmount.toLocaleString("en-IN")}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t-2 border-slate-900">
            <span>Grand Total{hasGst ? " (Incl. GST)" : ""}:</span>
            <span className="text-indigo-900">₹{invoice.totalAmount.toLocaleString("en-IN")}</span>
          </div>

          <div className="flex justify-between text-xs text-slate-600 pt-1">
            <span>Amount Paid:</span>
            <span className="font-bold text-emerald-700">₹{invoice.paidAmount.toLocaleString("en-IN")}</span>
          </div>

          <div className="flex justify-between text-xs font-bold text-rose-700 pt-1 border-t border-slate-200">
            <span>Balance Payable:</span>
            <span>₹{dueAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Terms & Authorized Signature */}
      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-end justify-between gap-6 text-xs text-slate-600">
        <div className="max-w-md">
          <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1">Terms & Conditions</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {invoice.terms || "Payment is due within 15 days of invoice date. 18% per annum interest applicable on delayed payments."}
          </p>
        </div>

        <div className="text-center sm:text-right border-t sm:border-t-0 border-slate-200 pt-4 sm:pt-0">
          <p className="font-bold text-slate-900 mb-10">For {businessProfile.businessName}</p>
          <div className="border-t border-slate-400 pt-1 text-[10px] text-slate-500 font-semibold uppercase">
            Authorized Signatory
          </div>
        </div>
      </div>
    </div>
  );
}
