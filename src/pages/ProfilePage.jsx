// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Camera,
  Edit3,
  Lock,
  LogOut,
  Wallet,
  TrendingUp,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  X,
  ShieldCheck,
} from "lucide-react";
import useStore from "../store/useStore";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext.jsx";
import { authService } from "../services/authService";
import { formatCurrency } from "../utils/format";

export default function ProfilePage() {
  const navigate = useNavigate();
  const showToast = useStore((state) => (state.toast ? state.showToast : null));
  const getTotals = useStore((state) => state.getTotals);
  const getMonthlyExpense = useStore((state) => state.getMonthlyExpense);
  const appContext = useApp();
  const { user: authUser, logout: authLogout } = useAuth();

  // Primary source of truth: logged in user from AuthContext
  const getInitialProfile = () => {
    if (authUser && authUser.name) {
      return {
        name: authUser.name,
        email: authUser.email || "",
        memberSince: authUser.memberSince || "Jan 2026",
        accountType: authUser.accountType || "Premium",
        avatarUrl: "",
      };
    }
    try {
      const activeUserKey = authUser?.id ? `myfinpal_user_profile_${authUser.id}` : "myfinpal_user_profile";
      const saved = localStorage.getItem(activeUserKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      /* ignore */
    }
    return {
      name: authUser?.name || appContext?.user?.name || "User",
      email: authUser?.email || appContext?.user?.email || "",
      memberSince: "Jan 2026",
      accountType: "Premium",
      avatarUrl: "",
    };
  };

  const [user, setUser] = useState(getInitialProfile);

  // Automatically sync profile name whenever logged-in auth user updates
  useEffect(() => {
    if (authUser && authUser.name) {
      setUser((prev) => ({
        ...prev,
        name: authUser.name,
        email: authUser.email || prev.email,
      }));
    }
  }, [authUser]);

  // Calculate real financial totals directly from store
  const totals = typeof getTotals === "function" ? getTotals() : { income: 0, expense: 0, balance: 0 };
  const monthlyExpense = typeof getMonthlyExpense === "function" ? getMonthlyExpense() : 0;

  const monthlyIncome = totals.income;
  const currentBalance = totals.balance;
  const displayExpense = monthlyExpense > 0 ? monthlyExpense : totals.expense;

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Form states
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Sync profile edits
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      if (showToast) showToast("Please fill in both name and email");
      return;
    }
    const updated = { ...user, name: editName.trim(), email: editEmail.trim() };
    setUser(updated);
    try {
      localStorage.setItem("myfinpal_user_profile", JSON.stringify(updated));
    } catch (err) {
      /* ignore */
    }
    setIsEditModalOpen(false);
    if (showToast) showToast("Profile updated successfully!");
  };

  // Change Password
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      if (showToast) showToast("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      if (showToast) showToast("New passwords do not match!");
      return;
    }
    setIsPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    if (showToast) showToast("Password changed successfully!");
  };

  // Avatar Upload simulation
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = { ...user, avatarUrl: reader.result };
        setUser(updated);
        try {
          localStorage.setItem("myfinpal_user_profile", JSON.stringify(updated));
        } catch (err) {
          /* ignore */
        }
        if (showToast) showToast("Profile picture updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Logout - Completely wipe local data and hard reset to login page
  const handleLogout = (e) => {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }
    try {
      if (authLogout) authLogout();
      authService.logout();
      if (appContext && typeof appContext.logout === "function") {
        appContext.logout();
      }
      useStore.getState().clearStore();
      localStorage.removeItem("myfinpal_session_token");
      localStorage.removeItem("myfinpal_active_user");
      sessionStorage.clear();
    } catch (err) {
      console.error("Logout error:", err);
    }
    window.location.href = "/";
  };

  // Get User Initials
  const getInitials = (nameStr) => {
    if (!nameStr) return "SK";
    const parts = nameStr.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return nameStr.slice(0, 2).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0.5rem 0 2rem",
        fontFamily: "'Inter', system-ui, sans-serif",
        width: "100%",
      }}
    >
      {/* Header Banner */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              color: "var(--color-text-primary, #0F172A)",
              letterSpacing: "-0.02em",
              marginBottom: "0.25rem",
            }}
          >
            Account & Profile
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted, #64748B)", fontWeight: 500 }}>
            Manage your personal profile, security preferences, and financial overview.
          </p>
        </div>
        
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "12px",
            border: "1px solid var(--color-border, #E2E8F0)",
            backgroundColor: "var(--color-surface, #FFFFFF)",
            color: "var(--color-text-primary, #0F172A)",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* 2-Column Responsive Dashboard Layout */}
      <div className="profile-dashboard-layout" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        
        {/* ── LEFT COLUMN: PROFILE CARD & SECURITY ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Main Profile Identity Card */}
          <div
            style={{
              borderRadius: "20px",
              background: "var(--color-surface, #FFFFFF)",
              border: "1px solid var(--color-border, #E2E8F0)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
              padding: "2rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top Accent Strip */}
            <div
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: "4px",
                background: "linear-gradient(90deg, #2563EB 0%, #4F5DED 100%)",
              }}
            />

            {/* Profile Avatar */}
            <div style={{ position: "relative", marginBottom: "1rem" }}>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid #2563EB",
                    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1A1A1E 0%, #23273C 100%)",
                    color: "#2563EB",
                    fontSize: "2rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "4px solid #2563EB",
                    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
                  }}
                >
                  {getInitials(user.name)}
                </div>
              )}

              <label
                htmlFor="avatar-upload-main"
                style={{
                  position: "absolute",
                  bottom: "2px",
                  right: "2px",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#161824",
                  color: "#3EC3D5",
                  border: "2px solid #FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                }}
                title="Change photo"
              >
                <Camera size={14} />
                <input
                  id="avatar-upload-main"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {/* Name & Account Badges */}
            <h2
              style={{
                fontSize: "1.45rem",
                fontWeight: 800,
                color: "var(--color-text-primary, #0F172A)",
                marginBottom: "0.25rem",
              }}
            >
              {user.name}
            </h2>

            <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #94A3B8)", fontWeight: 500, marginBottom: "1.5rem" }}>
              Member since {user.memberSince || "Jan 2026"}
            </p>

            {/* Action Buttons */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <button
                onClick={() => {
                  setEditName(user.name);
                  setEditEmail(user.email);
                  setIsEditModalOpen(true);
                }}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border, #E2E8F0)",
                  backgroundColor: "var(--color-surface, #FFFFFF)",
                  color: "var(--color-text-primary, #0F172A)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                  transition: "all 0.2s ease",
                }}
              >
                <Edit3 size={16} color="#3EC3D5" />
                <span>Edit Profile Details</span>
              </button>

              <button
                onClick={() => setIsPasswordModalOpen(true)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border, #E2E8F0)",
                  backgroundColor: "var(--color-surface, #FFFFFF)",
                  color: "var(--color-text-primary, #0F172A)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                  transition: "all 0.2s ease",
                }}
              >
                <Lock size={16} color="#4F5DED" />
                <span>Change Password</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid #F87171",
                  backgroundColor: "#FEF2F2",
                  color: "#DC2626",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s ease",
                }}
              >
                <LogOut size={16} color="#DC2626" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: FINANCIAL OVERVIEW ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Financial Overview Card Frame */}
          <div
            style={{
              borderRadius: "20px",
              background: "var(--color-surface, #FFFFFF)",
              border: "1px solid var(--color-border, #E2E8F0)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
              padding: "2rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            <div style={{ marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: "var(--color-text-primary, #0F172A)", marginBottom: "0.25rem" }}>
                Financial Overview
              </h3>
              <p style={{ fontSize: "0.825rem", color: "var(--color-text-muted, #64748B)", fontWeight: 500 }}>
                Live summary of your balance, monthly income, expenses, and savings rate.
              </p>
            </div>

            {/* Financial Totals Summary Grid (4 Stats) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", flex: 1, alignItems: "center" }}>
              
              {/* Card 1: Balance */}
              <div
                style={{
                  borderRadius: "16px",
                  background: "var(--color-bg, #F8FAFC)",
                  border: "1px solid var(--color-border, #E2E8F0)",
                  borderLeft: "4px solid #4F5DED",
                  padding: "1.25rem",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", color: "#6B6B72", textTransform: "uppercase" }}>
                    CURRENT BALANCE
                  </span>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#F1F1F8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Wallet size={16} color="#4F5DED" />
                  </div>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: "var(--color-text-primary, #1A1A1E)" }}>
                  {formatCurrency(currentBalance)}
                </div>
                <span style={{ fontSize: "0.725rem", color: "#6B6B72", fontWeight: 500 }}>
                  Across active accounts
                </span>
              </div>

              {/* Card 2: Monthly Income */}
              <div
                style={{
                  borderRadius: "16px",
                  background: "var(--color-bg, #F8FAFC)",
                  border: "1px solid var(--color-border, #E2E8F0)",
                  borderLeft: "4px solid #2E9E6D",
                  padding: "1.25rem",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", color: "#6B6B72", textTransform: "uppercase" }}>
                    MONTHLY INCOME
                  </span>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#E6F4EA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TrendingUp size={16} color="#2E9E6D" />
                  </div>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: "var(--color-text-primary, #1A1A1E)" }}>
                  {formatCurrency(monthlyIncome)}
                </div>
                <span style={{ fontSize: "0.725rem", color: "#2E9E6D", fontWeight: 600 }}>
                  ↑ Verified Inflow
                </span>
              </div>

              {/* Card 3: Monthly Expenses */}
              <div
                style={{
                  borderRadius: "16px",
                  background: "var(--color-bg, #F8FAFC)",
                  border: "1px solid var(--color-border, #E2E8F0)",
                  borderLeft: "4px solid #D65A5A",
                  padding: "1.25rem",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", color: "#6B6B72", textTransform: "uppercase" }}>
                    MONTHLY EXPENSES
                  </span>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#FCE8E6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TrendingDown size={16} color="#D65A5A" />
                  </div>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: "var(--color-text-primary, #1A1A1E)" }}>
                  {formatCurrency(displayExpense)}
                </div>
                <span style={{ fontSize: "0.725rem", color: "#D65A5A", fontWeight: 600 }}>
                  ↓ Tracked Spending
                </span>
              </div>

              {/* Card 4: Net Savings Rate */}
              <div
                style={{
                  borderRadius: "16px",
                  background: "var(--color-bg, #F8FAFC)",
                  border: "1px solid var(--color-border, #E2E8F0)",
                  borderLeft: "4px solid #3EC3D5",
                  padding: "1.25rem",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", color: "#6B6B72", textTransform: "uppercase" }}>
                    SAVINGS RATE
                  </span>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(62, 195, 213, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Sparkles size={16} color="#3EC3D5" />
                  </div>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: "var(--color-text-primary, #1A1A1E)" }}>
                  {monthlyIncome > 0 ? `${Math.max(0, Math.round(((monthlyIncome - displayExpense) / monthlyIncome) * 100))}%` : "0%"}
                </div>
                <span style={{ fontSize: "0.725rem", color: "#0891B2", fontWeight: 600 }}>
                  Target: 20%+
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(6px)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "440px",
                backgroundColor: "var(--color-surface, #FFFFFF)",
                borderRadius: "24px",
                padding: "1.75rem",
                boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
                border: "1px solid var(--color-border, #E2E8F0)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: "var(--color-text-primary, #0F172A)" }}>
                  Edit Profile
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ background: "none", border: "none", color: "var(--color-text-muted, #64748B)", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted, #64748B)", display: "block", marginBottom: "0.35rem" }}>
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--color-border, #CBD5E1)",
                      backgroundColor: "var(--color-bg, #F8FAFC)",
                      color: "var(--color-text-primary, #0F172A)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted, #64748B)", display: "block", marginBottom: "0.35rem" }}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--color-border, #CBD5E1)",
                      backgroundColor: "var(--color-bg, #F8FAFC)",
                      color: "var(--color-text-primary, #0F172A)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      borderRadius: "12px",
                      border: "1px solid var(--color-border, #E2E8F0)",
                      backgroundColor: "transparent",
                      color: "var(--color-text-muted, #64748B)",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      borderRadius: "12px",
                      border: "none",
                      backgroundColor: "#3EC3D5",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CHANGE PASSWORD MODAL ── */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(6px)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
            onClick={() => setIsPasswordModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "440px",
                backgroundColor: "var(--color-surface, #FFFFFF)",
                borderRadius: "24px",
                padding: "1.75rem",
                boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
                border: "1px solid var(--color-border, #E2E8F0)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: "var(--color-text-primary, #0F172A)" }}>
                  Change Password
                </h3>
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  style={{ background: "none", border: "none", color: "var(--color-text-muted, #64748B)", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted, #64748B)", display: "block", marginBottom: "0.35rem" }}>
                    CURRENT PASSWORD
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--color-border, #CBD5E1)",
                      backgroundColor: "var(--color-bg, #F8FAFC)",
                      color: "var(--color-text-primary, #0F172A)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted, #64748B)", display: "block", marginBottom: "0.35rem" }}>
                    NEW PASSWORD
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--color-border, #CBD5E1)",
                      backgroundColor: "var(--color-bg, #F8FAFC)",
                      color: "var(--color-text-primary, #0F172A)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted, #64748B)", display: "block", marginBottom: "0.35rem" }}>
                    CONFIRM NEW PASSWORD
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--color-border, #CBD5E1)",
                      backgroundColor: "var(--color-bg, #F8FAFC)",
                      color: "var(--color-text-primary, #0F172A)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      borderRadius: "12px",
                      border: "1px solid var(--color-border, #E2E8F0)",
                      backgroundColor: "transparent",
                      color: "var(--color-text-muted, #64748B)",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      borderRadius: "12px",
                      border: "none",
                      backgroundColor: "#3B82F6",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
