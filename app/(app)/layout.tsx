"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Receipt, 
  Package, 
  Users, 
  Wallet, 
  FilePieChart, 
  Settings, 
  Plus, 
  Building2,
  Bell,
  Search,
  LogOut
} from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "GST Invoices", href: "/invoices", icon: Receipt },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Parties (CRM)", href: "/parties", icon: Users },
    { name: "Expenses", href: "/expenses", icon: Wallet },
    { name: "GST Reports", href: "/reports/gst", icon: FilePieChart },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif", background: "#f4f7fa" }}>
      {/* ═══════ Top Header ═══════ */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "#fff",
          borderBottom: "1px solid #e8ecf1",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            {/* Brand + Profile */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #6730e3, #2563eb)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(103,48,227,0.3)",
                  }}
                >
                  <Receipt className="w-[18px] h-[18px] text-white" />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                      fontWeight: 800,
                      fontSize: 17,
                      color: "#1f2029",
                      letterSpacing: "-0.3px",
                    }}
                  >
                    Invoice<span style={{ fontWeight: 400, color: "#6730e3" }}>DotCom</span>
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#6730e3", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Vyapar & Khatabook Edition
                  </span>
                </div>
              </Link>

              {/* Active Business Pill — desktop only */}
              <div
                className="hidden md:flex"
                style={{
                  alignItems: "center",
                  gap: 8,
                  marginLeft: 16,
                  paddingLeft: 16,
                  borderLeft: "1px solid #e8ecf1",
                  fontSize: 12,
                  color: "#6c757d",
                }}
              >
                <Building2 className="w-[14px] h-[14px]" style={{ color: "#6730e3" }} />
                <span style={{ fontWeight: 600, color: "#1f2029" }}>Apex Digital Solutions</span>
                <span
                  style={{
                    fontSize: 10,
                    background: "#f3f0ff",
                    color: "#6730e3",
                    fontFamily: "monospace",
                    padding: "2px 8px",
                    borderRadius: 4,
                    border: "1px solid #e0d5ff",
                  }}
                >
                  27AAACA1234A1Z5
                </span>
              </div>
            </div>

            {/* Right Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "1px solid #e8ecf1",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#6c757d",
                  transition: "all 0.2s",
                }}
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "1px solid #e8ecf1",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#6c757d",
                  position: "relative",
                }}
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#ff416c",
                    border: "2px solid #fff",
                  }}
                />
              </button>
              <Link
                href="/invoices/new"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "var(--font-montserrat), sans-serif",
                  background: "linear-gradient(135deg, #6730e3, #2563eb)",
                  color: "#fff",
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(103,48,227,0.3)",
                  transition: "all 0.2s",
                }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Invoice</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ═══════ Navigation Bar ═══════ */}
        <div style={{ borderTop: "1px solid #f0f0f0", background: "#fafbfc" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
            <nav style={{ display: "flex", gap: 2, padding: "8px 0", overflowX: "auto" }} className="no-scrollbar">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "8px 14px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      fontFamily: "var(--font-montserrat), sans-serif",
                      whiteSpace: "nowrap",
                      textDecoration: "none",
                      transition: "all 0.2s",
                      background: isActive ? "#f3f0ff" : "transparent",
                      color: isActive ? "#6730e3" : "#6c757d",
                      border: isActive ? "1px solid #e0d5ff" : "1px solid transparent",
                    }}
                  >
                    <Icon style={{ width: 16, height: 16, color: isActive ? "#6730e3" : "#aaa" }} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* ═══════ Main Content ═══════ */}
      <main style={{ flex: 1, maxWidth: 1200, width: "100%", margin: "0 auto", padding: "24px 20px" }}>
        {children}
      </main>
    </div>
  );
}
