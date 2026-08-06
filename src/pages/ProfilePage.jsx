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
import { formatCurrency } from "../utils/format";

export default function ProfilePage() {
  const navigate = useNavigate();
  const showToast = useStore((state) => (state.toast ? state.showToast : null));
  const getTotals = useStore((state) => state.getTotals);
  const getMonthlyExpense = useStore((state) => state.getMonthlyExpense);
  const appContext = useApp();

  // Load User Data from context or localStorage
  const initialUser = appContext?.user || {
    name: "Suresh Kumar",
    email: "suresh@myfinpal.com",
    memberSince: "Jan 2026",
    accountType: "Premium",
    avatarUrl: "",
  };

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("myfinpal_user_profile");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      /* ignore */
    }
    return initialUser;
  });

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
    if (showToast) showToast("Profile updated successfully! ✨");
  };

  // Change Password
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      if (showToast) showToast("Please fill in all password fields");
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
    if (showToast) showToast("Password changed successfully! 🔒");
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
        if (showToast) showToast("Profile picture updated! 📷");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Logout - Completely wipe local data and hard reset to landing page /
  const handleLogout = (e) => {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }
    try {
      authService.logout();
      if (appContext && typeof appContext.logout === "function") {
        appContext.logout();
      }
      localStorage.clear();
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
        maxWidth: "960px",
        margin: "0 auto",
        padding: "1.5rem 1rem 3rem",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Page Title & Subtitle */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.85rem",
            fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            color: "var(--color-text-primary, #0F172A)",
            letterSpacing: "-0.02em",
            marginBottom: "0.25rem",
          }}
        >
          Profile
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted, #64748B)", fontWeight: 500 }}>
          Manage your account.
        </p>
      </div>

      {/* ── CENTERED PROFILE CARD (WHITE GLASSMORPHISM 24px ROUNDED) ── */}
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        style={{
          maxWidth: "600px",
          margin: "0 auto 2.5rem",
          borderRadius: "24px",
          background: "var(--color-surface, rgba(255, 255, 255, 0.85))",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--color-border, rgba(226, 232, 240, 0.8))",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.06), 0 10px 20px -10px rgba(0, 0, 0, 0.04)",
          padding: "2.5rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient Top Subtle Emerald Accent Line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "#3EC3D5",
          }}
        />

        {/* Large Circular Profile Picture with Camera Icon Overlay */}
        <div style={{ position: "relative", marginBottom: "1.25rem" }}>
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid #3AE6C3",
                boxShadow: "0 8px 24px rgba(58, 230, 195, 0.3)",
              }}
            />
          ) : (
            <div
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #101010 0%, #1E293B 100%)",
                color: "#3AE6C3",
                fontSize: "2.25rem",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "4px solid #3AE6C3",
                boxShadow: "0 8px 24px rgba(58, 230, 195, 0.25)",
                letterSpacing: "0.05em",
              }}
            >
              {getInitials(user.name)}
            </div>
          )}

          {/* Camera Upload Icon */}
          <label
            htmlFor="avatar-upload"
            style={{
              position: "absolute",
              bottom: "2px",
              right: "2px",
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              backgroundColor: "#101010",
              color: "#3AE6C3",
              border: "2px solid #FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              transition: "transform 0.15s ease",
            }}
            title="Change profile photo"
          >
            <Camera size={16} />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {/* Full Name */}
        <h2
          style={{
            fontSize: "1.65rem",
            fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            color: "var(--color-text-primary, #0F172A)",
            marginBottom: "0.25rem",
            letterSpacing: "-0.02em",
          }}
        >
          {user.name}
        </h2>

        {/* Email Address */}
        <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted, #64748B)", fontWeight: 500, marginBottom: "1.5rem" }}>
          {user.email}
        </p>

        {/* ── THREE BUTTONS ONLY ── */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {/* Edit Profile */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditName(user.name);
              setEditEmail(user.email);
              setIsEditModalOpen(true);
            }}
            style={{
              width: "100%",
              padding: "0.875rem 1.25rem",
              borderRadius: "14px",
              border: "1px solid var(--color-border, #E2E8F0)",
              backgroundColor: "var(--color-surface, #FFFFFF)",
              color: "var(--color-text-primary, #0F172A)",
              fontWeight: 700,
              fontSize: "0.925rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.625rem",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              transition: "all 0.2s ease",
            }}
          >
            <Edit3 size={18} color="#3EC3D5" />
            <span>Edit Profile</span>
          </motion.button>

          {/* Change Password */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsPasswordModalOpen(true)}
            style={{
              width: "100%",
              padding: "0.875rem 1.25rem",
              borderRadius: "14px",
              border: "1px solid var(--color-border, #E2E8F0)",
              backgroundColor: "var(--color-surface, #FFFFFF)",
              color: "var(--color-text-primary, #0F172A)",
              fontWeight: 700,
              fontSize: "0.925rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.625rem",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              transition: "all 0.2s ease",
            }}
          >
            <Lock size={18} color="#3EC3D5" />
            <span>Change Password</span>
          </motion.button>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "0.875rem 1.25rem",
              borderRadius: "14px",
              border: "1px solid #F87171",
              backgroundColor: "#FEF2F2",
              color: "#DC2626",
              fontWeight: 700,
              fontSize: "0.925rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.625rem",
              transition: "all 0.2s ease",
              position: "relative",
              zIndex: 10,
            }}
          >
            <LogOut size={18} color="#DC2626" />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>

      {/* ── ACCOUNT OVERVIEW SECTION (3 COLORFUL STAT CARDS) ── */}
      <div style={{ marginTop: "1rem" }}>
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            color: "var(--color-text-primary, #0F172A)",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>Account Overview</span>
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {/* Card 1: Total Balance */}
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            style={{
              borderRadius: "16px",
              background: "#FFFFFF",
              border: "1px solid #E8E8EA",
              borderLeft: "4px solid #4F5DED",
              color: "#1A1A1E",
              padding: "1.25rem 1.5rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "130px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", color: "#6B6B72", textTransform: "uppercase" }}>
                TOTAL BALANCE
              </span>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "#F1F1F8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Wallet size={18} color="#4F5DED" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: "#1A1A1E" }}>
                {formatCurrency(currentBalance)}
              </div>
              <span style={{ fontSize: "0.725rem", color: "#6B6B72", fontWeight: 500 }}>
                Across all active wallets
              </span>
            </div>
          </motion.div>

          {/* Card 2: Monthly Income */}
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            style={{
              borderRadius: "16px",
              background: "#FFFFFF",
              border: "1px solid #E8E8EA",
              borderLeft: "4px solid #2E9E6D",
              color: "#1A1A1E",
              padding: "1.25rem 1.5rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "130px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", color: "#6B6B72", textTransform: "uppercase" }}>
                MONTHLY INCOME
              </span>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "#E6F4EA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingUp size={18} color="#2E9E6D" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: "#1A1A1E" }}>
                {formatCurrency(monthlyIncome)}
              </div>
              <span style={{ fontSize: "0.725rem", color: "#2E9E6D", fontWeight: 600 }}>
                ↑ Verified Cash Inflow
              </span>
            </div>
          </motion.div>

          {/* Card 3: Monthly Expenses */}
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            style={{
              borderRadius: "16px",
              background: "#FFFFFF",
              border: "1px solid #E8E8EA",
              borderLeft: "4px solid #D65A5A",
              color: "#1A1A1E",
              padding: "1.25rem 1.5rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "130px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", color: "#6B6B72", textTransform: "uppercase" }}>
                MONTHLY EXPENSES
              </span>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "#FCE8E6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingDown size={18} color="#D65A5A" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: "#1A1A1E" }}>
                {formatCurrency(displayExpense)}
              </div>
              <span style={{ fontSize: "0.725rem", color: "#D65A5A", fontWeight: 600 }}>
                ↓ Tracked Spending
              </span>
            </div>
          </motion.div>
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
