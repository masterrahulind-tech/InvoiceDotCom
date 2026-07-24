import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

export function KpiCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  borderHover,
  sub,
  labelColor,
  valueColor,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  borderHover: string;
  sub?: React.ReactNode;
  labelColor?: string;
  valueColor?: string;
}) {
  return (
    <div
      className="group"
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "20px 22px",
        border: "1px solid #e8ecf1",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        transition: "all 0.25s",
        cursor: "default",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = borderHover + "40")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e8ecf1")}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: labelColor || "#999", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: iconBg,
            color: iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: valueColor || "#1f2029",
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            letterSpacing: "-0.3px",
          }}
        >
          {value}
        </div>
        {sub && <div style={{ marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

export function DashCard({
  title,
  titleIcon,
  subtitle,
  actionHref,
  actionLabel,
  actionColor,
  children,
}: {
  title: string;
  titleIcon?: React.ReactNode;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
  actionColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "20px 24px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        border: "1px solid #e8ecf1",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2
            style={{
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              fontSize: 15,
              fontWeight: 700,
              color: "#1f2029",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {titleIcon} {title}
          </h2>
          {subtitle && <p style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{subtitle}</p>}
        </div>
        {actionHref && (
          <Link
            href={actionHref}
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: actionColor || "#6730e3",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {actionLabel} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    paid: { bg: "#e8f5e9", color: "#2e7d32", border: "#c8e6c9" },
    partially_paid: { bg: "#fff3e0", color: "#e65100", border: "#ffe0b2" },
    unpaid: { bg: "#fce4ec", color: "#c62828", border: "#f8bbd0" },
    pending: { bg: "#fce4ec", color: "#c62828", border: "#f8bbd0" },
  };
  const s = styles[status] || styles.unpaid;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {status}
    </span>
  );
}
