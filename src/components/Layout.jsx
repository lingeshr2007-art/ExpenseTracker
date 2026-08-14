// src/components/Layout.jsx
import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext.jsx";
import { authService } from "../services/authService";
import NotificationBell from "./NotificationBell";
import Toast from "./Toast";
import {
  FaTableColumns,
  FaPlus,
  FaRightLeft,
  FaChartSimple,
  FaPiggyBank,
  FaBullseye,
  FaSun,
  FaMoon,
  FaBars,
  FaXmark,
  FaBolt,
  FaHandshake,
  FaUser,
  FaAnglesLeft,
  FaAnglesRight,
  FaRightFromBracket,
} from "react-icons/fa6";

const NAV_ITEMS = [
  { to: "/dashboard", icon: FaTableColumns, label: "Dashboard" },
  { to: "/add", icon: FaPlus, label: "Add Transaction" },
  { to: "/transactions", icon: FaRightLeft, label: "Transactions" },
  { to: "/analytics", icon: FaChartSimple, label: "Analytics" },
  { to: "/budget", icon: FaPiggyBank, label: "Budget" },
  { to: "/savings", icon: FaBullseye, label: "Savings & Goals" },
  { to: "/debts", icon: FaHandshake, label: "Friends & Debts" },
];

function SidebarContent({ onNavigate, onToggleSidebar, sidebarHidden }) {
  const location = useLocation();

  const handleCrossClick = (e) => {
    if (e) {
      e.stopPropagation();
    }
    if (onToggleSidebar) {
      onToggleSidebar();
    }
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <>
      {/* Logo Header with Top-Right Cross Symbol */}
      <div className="logo" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <img
            src="/nidhitrack-logo.png"
            alt="NidhiTrack"
            style={{
              width: "36px",
              height: "36px",
              objectFit: "contain",
              borderRadius: "6px",
              flexShrink: 0,
            }}
          />
          <span className="logo-text">NidhiTrack</span>
        </div>

        <button
          className="sidebar-cross-btn"
          onClick={handleCrossClick}
          title="Collapse menu / Hide names"
          aria-label="Hide menu names"
          style={{
            background: "transparent",
            border: "none",
            color: "#94A3B8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.35rem",
            borderRadius: "0.375rem",
            transition: "all 0.2s ease"
          }}
        >
          <FaXmark size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1, width: "100%" }}>
        <span className="nav-section-label">Menu</span>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={onNavigate}
            title={item.label}
          >
            <item.icon size={18} className="nav-link-icon" style={{ flexShrink: 0 }} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer-text" style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", textAlign: "center", padding: "0.5rem" }}>
        © 2026 NidhiTrack
      </div>
    </>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const showToast = useStore((state) => (state.toast ? state.showToast : null));
  const appContext = useApp();
  const { logout: authLogout } = useAuth();
  const { theme, toggleTheme, sidebarHidden, toggleSidebar, getTotals, getMonthlyExpense, budget, fetchFromApi } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async (e) => {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }
    try {
      if (authLogout) await authLogout();
      authService.logout();
      if (appContext && typeof appContext.logout === "function") {
        appContext.logout();
      }
      useStore.getState().clearStore();
      localStorage.clear();
      sessionStorage.clear();
    } catch (err) {
      console.error("Logout error:", err);
    }
    window.location.href = "/";
  };

  // Fetch initial data from backend API on mount
  useEffect(() => {
    if (fetchFromApi) {
      fetchFromApi();
    }
  }, [fetchFromApi]);

  const totals = getTotals();
  const monthlyExpense = getMonthlyExpense();
  const overIncome = totals.expense > totals.income;
  const overBudget = budget > 0 && monthlyExpense > budget;

  // Always enforce clean light mode
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle menu bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // Get page title
  const pageTitle = NAV_ITEMS.find((item) =>
    location.pathname === item.to || (item.to !== "/dashboard" && location.pathname.startsWith(item.to))
  )?.label || "Dashboard";

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <aside className={`sidebar ${sidebarHidden ? "collapsed" : ""}`}>
        <SidebarContent onToggleSidebar={toggleSidebar} sidebarHidden={sidebarHidden} />
      </aside>
      <style>{`
        @media (min-width: 641px) {
          .app-shell > .sidebar {
            display: flex !important;
          }
          .desktop-toggle-menu-btn {
            display: flex !important;
          }
        }
      `}</style>

      {/* Mobile Nav Overlay & Drawer */}
      <div
        className={`mobile-nav-overlay ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />
      <aside className={`mobile-sidebar ${mobileOpen ? "open" : ""}`}>
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Main Container */}
      <div className="main-area">
        {/* Top Bar */}
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Mobile Navigation Toggle */}
            <button
              className="btn btn-icon mobile-nav-btn"
              style={{
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "0.625rem",
                backgroundColor: "#F1F5F9",
                border: "1px solid #E2E8F0",
                color: "#4F46E5",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <FaBars size={18} color="#4F46E5" />
            </button>

            {/* Desktop Hide/Unhide Menu Bar Button (Icon-only) */}
            <button
              className="btn btn-icon desktop-toggle-menu-btn"
              onClick={toggleSidebar}
              title={sidebarHidden ? "Expand Menu (Ctrl+B)" : "Collapse Menu (Ctrl+B)"}
              aria-label={sidebarHidden ? "Expand Menu" : "Collapse Menu"}
              style={{
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "0.625rem",
                backgroundColor: "#F1F5F9",
                border: "1px solid #E2E8F0",
                color: "#4F46E5",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <FaBars size={18} color="#4F46E5" />
            </button>

            <h1 style={{ fontSize: "1rem", fontWeight: 700 }}>{pageTitle}</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <NotificationBell />
            <NavLink
              to="/profile"
              className="btn btn-icon btn-secondary"
              title="My Profile"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#3EC3D5",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(62, 195, 213, 0.3)",
              }}
            >
              <FaUser size={14} color="#FFFFFF" />
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Toast */}
      <Toast />
    </div>
  );
}



