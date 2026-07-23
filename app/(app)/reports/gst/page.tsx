"use client";

import { useEffect, useState } from "react";
import { 
  FilePieChart, 
  Download, 
  Building2, 
  Receipt, 
  CheckCircle2, 
  Scale, 
  ShieldCheck, 
  HelpCircle,
  BarChart2
} from "lucide-react";

export default function GstReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGstReport() {
      try {
        setLoading(true);
        const res = await fetch("/api/reports/gst");
        const data = await res.json();
        setReport(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadGstReport();
  }, []);

  const handleExportJson = () => {
    if (!report) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GSTR1_Summary_${report.businessGstin}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading || !report) {
    return <div className="p-12 text-center text-xs text-slate-400">Generating GST GSTR-1 compliance reports...</div>;
  }

  const { summary, b2bInvoices = [], hsnSummary = [] } = report;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <FilePieChart className="w-6 h-6 text-indigo-400" /> GST Tax Compliance & GSTR-1 Filing
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              GSTIN: {report.businessGstin}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated tax liability breakdown, CGST / SGST / IGST tax ledgers, and HSN summary table.
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95 self-start md:self-auto"
        >
          <Download className="w-4 h-4" /> Download GSTR-1 JSON
        </button>
      </div>

      {/* Tax Liability Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Output Tax */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Output Tax (Sales)</span>
          <div className="text-2xl font-black text-indigo-400 mt-2">
            ₹{(summary.totalOutputGst || 0).toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
            <span>CGST: ₹{summary.totalCgst?.toLocaleString("en-IN")}</span>
            <span>•</span>
            <span>SGST: ₹{summary.totalSgst?.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Input Tax Credit */}
        <div className="bg-slate-900/80 border border-purple-500/30 p-5 rounded-2xl shadow-xl bg-purple-500/5">
          <span className="text-xs font-bold text-purple-400 uppercase">Input Tax Credit (ITC)</span>
          <div className="text-2xl font-black text-purple-400 mt-2">
            ₹{(summary.totalInputGst || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-purple-300/80 mt-1">Claimed from expense vouchers</p>
        </div>

        {/* Net Tax Liability */}
        <div className="bg-slate-900/80 border border-emerald-500/30 p-5 rounded-2xl shadow-xl bg-emerald-500/5">
          <span className="text-xs font-bold text-emerald-400 uppercase">Net GST Payable Liability</span>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            ₹{(summary.netGstLiability || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-1">Output GST minus Input Tax Credit</p>
        </div>

        {/* Sales Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase">B2B vs B2C Sales</span>
          <div className="text-xl font-bold text-white mt-2">
            B2B: {summary.b2bCount || 0} | B2C: {summary.b2cCount || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            B2B Taxable: ₹{(summary.b2bTaxable || 0).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* GSTR-1 HSN Summary Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" /> HSN / SAC Summary Table (GSTR-1 Table 12)
          </h2>
        </div>

        {hsnSummary.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">No HSN items recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-semibold text-slate-400 bg-slate-950/60 border-b border-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-4">HSN Code</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Total Quantity</th>
                  <th className="py-3 px-4 text-right">Taxable Value</th>
                  <th className="py-3 px-4 text-right">CGST</th>
                  <th className="py-3 px-4 text-right">SGST</th>
                  <th className="py-3 px-4 text-right">IGST</th>
                  <th className="py-3 px-4 text-right">Total Tax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {hsnSummary.map((hsn: any) => (
                  <tr key={hsn.hsnCode} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">{hsn.hsnCode}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{hsn.description}</td>
                    <td className="py-3.5 px-4 text-center text-slate-300 font-bold">{hsn.totalQty}</td>
                    <td className="py-3.5 px-4 text-right text-slate-200">
                      ₹{hsn.taxableValue.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">
                      ₹{hsn.cgst.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">
                      ₹{hsn.sgst.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">
                      ₹{hsn.igst.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-indigo-400">
                      ₹{hsn.totalTax.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GSTR-1 B2B Registered Invoice Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" /> B2B Registered Sales (GSTR-1 Table 4A)
          </h2>
          <span className="text-xs text-slate-400">{b2bInvoices.length} Invoices</span>
        </div>

        {b2bInvoices.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">No B2B invoices recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-semibold text-slate-400 bg-slate-950/60 border-b border-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Buyer GSTIN</th>
                  <th className="py-3 px-4">Party Name</th>
                  <th className="py-3 px-4 text-right">Taxable Amount</th>
                  <th className="py-3 px-4 text-right">CGST</th>
                  <th className="py-3 px-4 text-right">SGST</th>
                  <th className="py-3 px-4 text-right">Total Invoice Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {b2bInvoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">{inv.invoiceNo}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(inv.date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">{inv.clientGstin}</td>
                    <td className="py-3.5 px-4 text-slate-200 font-medium">{inv.clientName}</td>
                    <td className="py-3.5 px-4 text-right text-slate-200">₹{inv.taxableAmount.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4 text-right text-slate-300">₹{inv.cgst.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4 text-right text-slate-300">₹{inv.sgst.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4 text-right font-black text-white">₹{inv.totalAmount.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
