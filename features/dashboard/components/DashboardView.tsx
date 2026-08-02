"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Package, 
  AlertTriangle, 
  Users, 
  Receipt, 
  Plus, 
  Wallet, 
  Send,
  Sparkles,
} from "lucide-react";
import { KpiCard, DashCard, StatusBadge } from "./DashboardUI";

export function DashboardView() {
  const [stats, setStats] = useState<any>({
    totalSales: 0,
    paidSales: 0,
    pendingSales: 0,
    receivableBalance: 0,
    payableBalance: 0,
    inventoryValue: 0,
    lowStockCount: 0,
    totalExpenses: 0,
    recentInvoices: [],
    topParties: [],
    lowStockItems: [],
    loading: true,
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [invRes, partiesRes, itemsRes, expRes] = await Promise.all([
          fetch("/api/invoices"),
          fetch("/api/parties"),
          fetch("/api/items"),
          fetch("/api/expenses"),
        ]);

        const invData = await invRes.json();
        const partiesData = await partiesRes.json();
        const itemsData = await itemsRes.json();
        const expData = await expRes.json();

        const invoices = invData.invoices || [];
        const totalSales = invoices.reduce((acc: number, inv: any) => acc + inv.totalAmount, 0);
        const paidSales = invoices.reduce((acc: number, inv: any) => acc + inv.paidAmount, 0);
        const pendingSales = totalSales - paidSales;

        setStats({
          totalSales,
          paidSales,
          pendingSales,
          receivableBalance: partiesData.summary?.totalReceivable || 0,
          payableBalance: partiesData.summary?.totalPayable || 0,
          inventoryValue: itemsData.summary?.totalStockValuation || 0,
          lowStockCount: itemsData.summary?.lowStockCount || 0,
          totalExpenses: expData.summary?.totalExpense || 0,
          recentInvoices: invoices.slice(0, 5),
          topParties: (partiesData.parties || []).filter((p: any) => p.calculatedBalance > 0).slice(0, 4),
          lowStockItems: (itemsData.items || []).filter((i: any) => i.stockQty <= i.lowStockThreshold).slice(0, 4),
          loading: false,
        });
      } catch (e) {
        console.error("Error loading dashboard data", e);
        setStats((prev: any) => ({ ...prev, loading: false }));
      }
    }

    loadDashboardData();
  }, []);

  if (stats.loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "4px solid #e0d5ff",
              borderTopColor: "#6730e3",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ fontSize: 13, color: "#999", fontWeight: 500 }}>Loading Dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* â•â•â•â•â•â•â• Welcome Banner â•â•â•â•â•â•â• */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 16,
          background: "linear-gradient(135deg, #6730e3 0%, #2563eb 100%)",
          padding: "28px 30px",
          color: "#fff",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -60,
            top: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 60,
            bottom: -40,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    background: "rgba(255,255,255,0.15)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <Sparkles className="w-3 h-3" /> GST Ready
                </span>
                <span style={{ fontSize: 12, opacity: 0.7 }}>Business Profile</span>
              </div>
              <h1
                className="text-xl sm:text-2xl"
                style={{
                  fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: "-0.3px",
                }}
              >
                Business & Accounting Overview
              </h1>
              <p style={{ fontSize: 13, opacity: 0.75, marginTop: 4, maxWidth: 500 }}>
                Track live GST sales, party ledgers, inventory valuations, and expenses in one dashboard.
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, width: '100%' }} className="sm:w-auto">
              <Link
                href="/invoices/new"
                className="flex-1 sm:flex-none justify-center"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 18px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "var(--font-montserrat), sans-serif",
                  background: "#fff",
                  color: "#6730e3",
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                  transition: "all 0.2s",
                }}
              >
                <Plus className="w-4 h-4" /> Create Invoice
              </Link>
              <Link
                href="/parties"
                className="flex-1 sm:flex-none justify-center"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 18px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "var(--font-montserrat), sans-serif",
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.25)",
                  transition: "all 0.2s",
                }}
              >
                <Users className="w-4 h-4" /> Ledger
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* â•â•â•â•â•â•â• KPI Cards Grid â•â•â•â•â•â•â• */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total GST Sales"
          value={`â‚¹${stats.totalSales.toLocaleString("en-IN")}`}
          icon={<Receipt className="w-[18px] h-[18px]" />}
          iconBg="#f3f0ff"
          iconColor="#6730e3"
          borderHover="#6730e3"
          sub={
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4, fontSize: 11, color: "#999", marginTop: 4 }}>
              <span style={{ color: "#2e7d32", fontWeight: 600, display: "flex", alignItems: "center" }}>
                <ArrowUpRight className="w-3 h-3" style={{ marginRight: 2 }} /> â‚¹{stats.paidSales.toLocaleString("en-IN")} Paid
              </span>
              <span className="hidden sm:inline">â€¢</span>
              <span style={{ color: "#ed6c02" }}>â‚¹{stats.pendingSales.toLocaleString("en-IN")} Pending</span>
            </div>
          }
        />

        <KpiCard
          label="You Will Get (Udhaar)"
          value={`â‚¹${stats.receivableBalance.toLocaleString("en-IN")}`}
          icon={<ArrowDownLeft className="w-[18px] h-[18px]" />}
          iconBg="#e8f5e9"
          iconColor="#2e7d32"
          borderHover="#2e7d32"
          labelColor="#2e7d32"
          valueColor="#2e7d32"
          sub={<span style={{ fontSize: 11, color: "#66bb6a" }}>Total credit pending from customers</span>}
        />

        <KpiCard
          label="You Will Give"
          value={`â‚¹${stats.payableBalance.toLocaleString("en-IN")}`}
          icon={<ArrowUpRight className="w-[18px] h-[18px]" />}
          iconBg="#fce4ec"
          iconColor="#c62828"
          borderHover="#c62828"
          labelColor="#c62828"
          valueColor="#c62828"
          sub={<span style={{ fontSize: 11, color: "#ef9a9a" }}>Total payables due to suppliers</span>}
        />

        <KpiCard
          label="Stock Valuation"
          value={`â‚¹${stats.inventoryValue.toLocaleString("en-IN")}`}
          icon={<Package className="w-[18px] h-[18px]" />}
          iconBg="#fff3e0"
          iconColor="#e65100"
          borderHover="#e65100"
          sub={
            stats.lowStockCount > 0 ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#e65100",
                  background: "#fff3e0",
                  padding: "2px 8px",
                  borderRadius: 6,
                  border: "1px solid #ffe0b2",
                }}
              >
                <AlertTriangle className="w-3 h-3" /> {stats.lowStockCount} items low on stock
              </span>
            ) : (
              <span style={{ fontSize: 11, color: "#66bb6a" }}>All items sufficiently stocked</span>
            )
          }
        />
      </div>

      {/* â•â•â•â•â•â•â• Main Content Grid â•â•â•â•â•â•â• */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }} className="lg:!grid-cols-[2fr_1fr]">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <DashCard
            title="Recent GST Invoices"
            titleIcon={<Receipt className="w-4 h-4" style={{ color: "#6730e3" }} />}
            subtitle="Latest sales billing records"
            actionHref="/invoices"
            actionLabel="View All"
          >
            {stats.recentInvoices.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", border: "1px dashed #e8ecf1", borderRadius: 12 }}>
                <Receipt className="w-8 h-8" style={{ color: "#ddd", margin: "0 auto 8px" }} />
                <p style={{ fontSize: 13, color: "#999" }}>No invoices created yet.</p>
                <Link href="/invoices/new" style={{ fontSize: 13, fontWeight: 700, color: "#6730e3", textDecoration: "none" }}>
                  + Create your first invoice
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto w-full no-scrollbar pb-2">
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "500px" }}>
                  <thead>
                    <tr style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f0f0f0" }}>
                      <th className="whitespace-nowrap" style={{ padding: "10px 8px" }}>Invoice No</th>
                      <th className="whitespace-nowrap" style={{ padding: "10px 8px" }}>Party Name</th>
                      <th className="whitespace-nowrap" style={{ padding: "10px 8px" }}>Amount</th>
                      <th className="whitespace-nowrap" style={{ padding: "10px 8px" }}>Status</th>
                      <th className="whitespace-nowrap" style={{ padding: "10px 8px", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentInvoices.map((inv: any) => (
                      <tr key={inv.id} style={{ borderBottom: "1px solid #f8f8f8", fontSize: 13, transition: "background 0.15s" }}>
                        <td className="whitespace-nowrap" style={{ padding: "12px 8px", fontFamily: "monospace", fontWeight: 600, color: "#6730e3" }}>
                          {inv.invoiceNo}
                        </td>
                        <td className="whitespace-nowrap" style={{ padding: "12px 8px", fontWeight: 600, color: "#333" }}>
                          {inv.client?.name || "Client"}
                        </td>
                        <td className="whitespace-nowrap" style={{ padding: "12px 8px", fontWeight: 700, color: "#1f2029" }}>
                          â‚¹{inv.totalAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="whitespace-nowrap" style={{ padding: "12px 8px" }}>
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="whitespace-nowrap" style={{ padding: "12px 8px", textAlign: "right" }}>
                          <Link
                            href={`/invoices/${inv.id}`}
                            style={{ fontSize: 12, fontWeight: 700, color: "#6730e3", textDecoration: "none" }}
                          >
                            View â†’
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashCard>

          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: "20px 24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              border: "1px solid #e8ecf1",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "#f3e5f5",
                  color: "#7b1fa2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" }}>Recorded Expenses</span>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#1f2029", fontFamily: "var(--font-montserrat)" }}>
                  â‚¹{stats.totalExpenses.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
            <Link
              href="/expenses"
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "var(--font-montserrat), sans-serif",
                background: "#f8f9fa",
                color: "#333",
                textDecoration: "none",
                border: "1px solid #e8ecf1",
                transition: "all 0.2s",
              }}
            >
              Manage Expenses
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <DashCard
            title="Pending Udhaar (CRM)"
            titleIcon={<Users className="w-4 h-4" style={{ color: "#2e7d32" }} />}
            actionHref="/parties"
            actionLabel="Passbook"
            actionColor="#2e7d32"
          >
            {stats.topParties.length === 0 ? (
              <p style={{ fontSize: 13, color: "#999", textAlign: "center", padding: "24px 0" }}>No pending customer debts.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {stats.topParties.map((party: any) => (
                  <div
                    key={party.id}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "#f9faf9",
                      border: "1px solid #e8f5e9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>{party.name}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#2e7d32", marginTop: 2 }}>
                        You Get: â‚¹{party.calculatedBalance.toLocaleString("en-IN")}
                      </div>
                    </div>
                    {party.phone && (
                      <a
                        href={`https://wa.me/${party.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Hello ${party.name}, your total outstanding balance at Apex Digital Solutions is â‚¹${party.calculatedBalance.toLocaleString(
                            "en-IN"
                          )}. Kindly settle your dues. Thank you!`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "6px 10px",
                          borderRadius: 8,
                          fontSize: 10,
                          fontWeight: 700,
                          background: "#e8f5e9",
                          color: "#2e7d32",
                          border: "1px solid #c8e6c9",
                          textDecoration: "none",
                          transition: "all 0.2s",
                        }}
                      >
                        <Send className="w-3 h-3" /> WhatsApp
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DashCard>

          <DashCard
            title="Stock Alerts"
            titleIcon={<AlertTriangle className="w-4 h-4" style={{ color: "#e65100" }} />}
            actionHref="/inventory"
            actionLabel="Inventory"
            actionColor="#e65100"
          >
            {stats.lowStockItems.length === 0 ? (
              <p style={{ fontSize: 13, color: "#999", textAlign: "center", padding: "24px 0" }}>All items in stock.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {stats.lowStockItems.map((item: any) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "#fff8f0",
                      border: "1px solid #ffe0b2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>{item.name}</div>
                      <div style={{ fontSize: 10, color: "#e65100", marginTop: 2 }}>
                        Threshold: {item.lowStockThreshold} {item.unit}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 800,
                        background: "#fff3e0",
                        color: "#e65100",
                        border: "1px solid #ffe0b2",
                      }}
                    >
                      {item.stockQty} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DashCard>
        </div>
      </div>
    </div>
  );
}
