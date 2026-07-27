"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Receipt, 
  Plus, 
  Search, 
} from "lucide-react";
import { StatusBadge } from "@/features/dashboard/components/DashboardUI";

export function InvoicesView() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadInvoices() {
      try {
        setLoading(true);
        const url = `/api/invoices${statusFilter ? `?status=${statusFilter}` : ""}`;
        const res = await fetch(url);
        const data = await res.json();
        setInvoices(data.invoices || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, [statusFilter]);

  const filteredInvoices = invoices.filter((inv) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      inv.invoiceNo.toLowerCase().includes(s) ||
      inv.client?.name?.toLowerCase().includes(s) ||
      inv.client?.gstin?.toLowerCase().includes(s)
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Title & Actions */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1
            style={{
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              fontSize: 22,
              fontWeight: 800,
              color: "#1f2029",
              display: "flex",
              alignItems: "center",
              gap: 8,
              margin: 0,
            }}
          >
            <Receipt className="w-5 h-5" style={{ color: "#6730e3" }} /> GST Billing & Sales Invoices
          </h1>
          <p style={{ fontSize: 13, color: "#999", marginTop: 4 }}>
            Manage tax bills, track payment settlements, and export GST compliance data.
          </p>
        </div>

        <Link
          href="/invoices/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "var(--font-montserrat), sans-serif",
            background: "linear-gradient(135deg, #6730e3, #2563eb)",
            color: "#fff",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(103,48,227,0.3)",
          }}
        >
          <Plus className="w-4 h-4" /> Create GST Invoice
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          background: "#fff",
          border: "1px solid #e8ecf1",
          padding: 14,
          borderRadius: 14,
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ position: "relative", width: "100%", maxWidth: 320 }}>
          <Search className="w-4 h-4" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
          <input
            type="text"
            placeholder="Search by Invoice No, Customer, GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "#f8f9fa",
              border: "1px solid #e8ecf1",
              borderRadius: 10,
              paddingLeft: 36,
              paddingRight: 12,
              paddingTop: 9,
              paddingBottom: 9,
              fontSize: 13,
              color: "#333",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { label: "All Invoices", value: "", activeColor: "#6730e3" },
            { label: "Paid", value: "paid", activeColor: "#2e7d32" },
            { label: "Partial", value: "partially_paid", activeColor: "#e65100" },
            { label: "Pending", value: "pending", activeColor: "#c62828" },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setStatusFilter(btn.value)}
              style={{
                padding: "7px 14px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "var(--font-montserrat), sans-serif",
                border: "1px solid",
                cursor: "pointer",
                transition: "all 0.2s",
                ...(statusFilter === btn.value
                  ? { background: btn.activeColor, color: "#fff", borderColor: btn.activeColor, boxShadow: `0 3px 10px ${btn.activeColor}30` }
                  : { background: "#f8f9fa", color: "#6c757d", borderColor: "#e8ecf1" }),
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8ecf1",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", fontSize: 13, color: "#999" }}>Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#999" }}>
            <Receipt className="w-10 h-10" style={{ color: "#ddd", margin: "0 auto 8px" }} />
            <p style={{ fontSize: 13 }}>No invoices found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full no-scrollbar pb-2">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "800px" }}>
              <thead>
                <tr
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#999",
                    background: "#fafbfc",
                    borderBottom: "1px solid #f0f0f0",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <th className="whitespace-nowrap" style={{ padding: "12px 16px" }}>Invoice No</th>
                  <th className="whitespace-nowrap" style={{ padding: "12px 16px" }}>Date</th>
                  <th className="whitespace-nowrap" style={{ padding: "12px 16px" }}>Customer Party</th>
                  <th className="whitespace-nowrap" style={{ padding: "12px 16px" }}>GST Type</th>
                  <th className="whitespace-nowrap" style={{ padding: "12px 16px", textAlign: "right" }}>Taxable</th>
                  <th className="whitespace-nowrap" style={{ padding: "12px 16px", textAlign: "right" }}>Total Amount</th>
                  <th className="whitespace-nowrap" style={{ padding: "12px 16px", textAlign: "center" }}>Status</th>
                  <th className="whitespace-nowrap" style={{ padding: "12px 16px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: "1px solid #f8f8f8", fontSize: 13, transition: "background 0.15s" }}>
                    <td className="whitespace-nowrap" style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: 700, color: "#6730e3" }}>
                      {inv.invoiceNo}
                    </td>
                    <td className="whitespace-nowrap" style={{ padding: "14px 16px", color: "#999" }}>
                      {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="whitespace-nowrap" style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700, color: "#333" }}>{inv.client?.name || "Client"}</div>
                      {inv.client?.gstin && (
                        <div style={{ fontSize: 10, fontFamily: "monospace", color: "#2e7d32" }}>GSTIN: {inv.client.gstin}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap" style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 700,
                          background: "#f3f0ff",
                          color: "#6730e3",
                          border: "1px solid #e0d5ff",
                        }}
                      >
                        {inv.billingType || "B2B"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap" style={{ padding: "14px 16px", textAlign: "right", color: "#666" }}>
                      ₹{inv.taxableAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="whitespace-nowrap" style={{ padding: "14px 16px", textAlign: "right", fontWeight: 800, color: "#1f2029" }}>
                      ₹{inv.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="whitespace-nowrap" style={{ padding: "14px 16px", textAlign: "center" }}>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="whitespace-nowrap" style={{ padding: "14px 16px", textAlign: "right" }}>
                      <Link
                        href={`/invoices/${inv.id}`}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: "var(--font-montserrat), sans-serif",
                          background: "#f3f0ff",
                          color: "#6730e3",
                          border: "1px solid #e0d5ff",
                          textDecoration: "none",
                        }}
                      >
                        View & Print
                      </Link>
                    </td>
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
