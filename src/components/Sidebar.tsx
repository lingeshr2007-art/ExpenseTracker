import { useState } from "react";
import { useApp } from "../context/AppContext";
import { LayoutDashboard, ReceiptText, TrendingUp, ShieldCheck, Target, FileSpreadsheet, Sparkles, Zap } from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
  const { accounts, user, logout, theme, setTheme, currency, setCurrency } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "transactions", label: "Transactions", icon: ReceiptText },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "budgets", label: "Budgets", icon: ShieldCheck },
    { id: "goals", label: "Savings Goals", icon: Target },
    { id: "reports", label: "Reports", icon: FileSpreadsheet },
    { id: "ai", label: "AI Insights", icon: Sparkles },
  ];

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <>
      {/* Mobile Header */}
      <div 
        className="no-print"
        style={{
          display: "none",
          width: "100%",
          padding: "1rem",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-color)",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 100,
          position: "sticky",
          top: 0
        }}
        id="mobile-header"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.5rem" }}>⚡</span>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>
            ApexFinance
          </span>
        </div>
        <button 
          className="btn-icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Sidebar Drawer Container */}
      <aside 
        className={`no-print ${mobileOpen ? "open" : ""}`}
        style={{
          width: "280px",
          minWidth: "280px",
          height: "100vh",
          background: "var(--bg-sidebar)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid var(--border-color)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          zIndex: 200,
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        id="sidebar-container"
      >
        {/* Brand Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0 0.5rem" }}>
          <div 
            style={{ 
              width: "36px", 
              height: "36px", 
              borderRadius: "0.5rem", 
              background: "#3EC3D5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: "1.25rem",
              boxShadow: "0 4px 10px rgba(62, 195, 213, 0.25)"
            }}
          >
            <Zap size={20} />
          </div>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.35rem", letterSpacing: "-0.03em" }}>
            ApexFinance
          </span>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const IconComp = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  background: isActive ? "rgba(62, 195, 213, 0.18)" : "transparent",
                  color: isActive ? "#3EC3D5" : "rgba(255, 255, 255, 0.8)",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(62, 195, 213, 0.1)";
                    e.currentTarget.style.color = "#3EC3D5";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                  }
                }}
              >
                <IconComp size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Accounts / Wallets Overview */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: "0.5rem" }}>
            My Wallets
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "160px", overflowY: "auto", paddingRight: "0.25rem" }}>
            {accounts.map((acc) => (
              <div 
                key={acc.id}
                style={{
                  padding: "0.625rem 0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border-color)",
                  background: "rgba(255, 255, 255, 0.02)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  borderLeft: `4px solid ${acc.color}`
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{acc.name}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{acc.type}</span>
                </div>
                <span style={{ fontWeight: 700, color: acc.balance < 0 ? "var(--color-danger)" : "var(--color-text-primary)" }}>
                  {formatBalance(acc.balance)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Settings Panel */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
            {/* Theme Toggle */}
            <button
              className="btn btn-secondary"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              style={{ flex: 1, padding: "0.5rem", fontSize: "0.85rem" }}
              aria-label="Toggle Dark/Light Mode"
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>

            {/* Currency Selector */}
            <select
              className="input-field"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ width: "90px", padding: "0.5rem", fontSize: "0.85rem" }}
              aria-label="Select Currency"
            >
              <option value="INR">₹ INR</option>
            </select>
          </div>

          {/* User Profile */}
          {user && (
            <div 
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 0.5rem 0",
                borderTop: "1px solid var(--border-color)",
                marginTop: "0.5rem"
              }}
            >
              <div 
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  border: "1px solid var(--color-primary)"
                }}
              >
                {user.name ? user.name.split(" ").map(n => n[0]).join("") : "U"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", overflow: "hidden", textOverflow: "ellipsis" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>
                  {user.name}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                  {user.email}
                </span>
              </div>
              <button 
                onClick={logout}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  marginLeft: "auto",
                  padding: "0.25rem",
                  fontSize: "1.1rem"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-danger)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
                title="Log out"
              >
                🚪
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* CSS overrides for responsive drawer layout */}
      <style>{`
        @media (max-width: 991px) {
          #sidebar-container {
            position: fixed;
            top: 60px;
            left: 0;
            height: calc(100vh - 60px);
            transform: translateX(-100%);
            box-shadow: none;
          }
          #sidebar-container.open {
            transform: translateX(0);
            box-shadow: 10px 0 30px rgba(0, 0, 0, 0.2);
          }
          #mobile-header {
            display: flex !important;
          }
          #main-layout {
            flex-direction: column !important;
            height: calc(100vh - 60px) !important;
          }
        }
      `}</style>
    </>
  );
}
