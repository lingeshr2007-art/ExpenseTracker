// src/pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#161824",
        color: "#F8FAFC",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      {/* ── MINIMAL NAVBAR ── */}
      <header
        style={{
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "1.5rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        {/* Brand Logo Badge */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
          }}
        >
          <img
            src="/nidhitrack-logo.png"
            alt="NidhiTrack Logo"
            style={{
              width: "38px",
              height: "38px",
              objectFit: "contain",
              borderRadius: "6px",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: "1.35rem",
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
            }}
          >
            NidhiTrack
          </span>
        </Link>

        {/* Auth Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <Link
            to="/login"
            style={{
              padding: "0.55rem 1.15rem",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid #2D324B",
              color: "#F8FAFC",
              fontWeight: 600,
              fontSize: "0.875rem",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            style={{
              padding: "0.55rem 1.15rem",
              borderRadius: "10px",
              background: "#4F5DED",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "0.875rem",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(79, 93, 237, 0.35)",
              transition: "all 0.2s ease",
            }}
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "3rem 2rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flex: 1,
          justifyContent: "center",
        }}
      >
        {/* Simple Badge Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "5px 14px",
            borderRadius: "999px",
            background: "rgba(79, 93, 237, 0.12)",
            border: "1px solid rgba(79, 93, 237, 0.3)",
            color: "#4F5DED",
            fontSize: "0.8rem",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "1.5rem",
          }}
        >
          <Sparkles size={15} />
          <span>Smart Personal Finance Tracker</span>
        </motion.div>

        {/* Clean Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: "1.25rem",
            color: "#FFFFFF",
          }}
        >
          Master Your Finances Effortlessly
        </motion.h1>

        {/* Short Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            fontSize: "1.05rem",
            color: "#C8C7CD",
            maxWidth: "580px",
            lineHeight: 1.6,
            marginBottom: "2.25rem",
          }}
        >
          Track daily expenses, set budget goals, and monitor your cash flow from one clean, secure dashboard.
        </motion.p>

        {/* Primary CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: "3.5rem",
          }}
        >
          <Link
            to="/signup"
            style={{
              padding: "0.85rem 1.85rem",
              borderRadius: "12px",
              background: "#4F5DED",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.95rem",
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(79, 93, 237, 0.35)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>Create Free Account</span>
            <ArrowRight size={18} />
          </Link>

          <Link
            to="/login"
            style={{
              padding: "0.85rem 1.85rem",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid #2D324B",
              color: "#F8FAFC",
              fontWeight: 600,
              fontSize: "0.95rem",
              textDecoration: "none",
            }}
          >
            Sign In
          </Link>
        </motion.div>

        {/* 3 Simple Minimal Feature Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.25rem",
            width: "100%",
            maxWidth: "850px",
            textAlign: "left",
          }}
        >
          {/* Feature 1 */}
          <div
            style={{
              background: "#23273C",
              border: "1px solid #2D324B",
              borderRadius: "16px",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(79, 93, 237, 0.15)",
                color: "#4F5DED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "0.85rem",
              }}
            >
              <TrendingUp size={20} />
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.35rem" }}>
              Expense Tracking
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#C8C7CD", lineHeight: 1.5 }}>
              Log transactions instantly with automatic categories and visual graphs.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            style={{
              background: "#23273C",
              border: "1px solid #2D324B",
              borderRadius: "16px",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(62, 195, 213, 0.15)",
                color: "#3EC3D5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "0.85rem",
              }}
            >
              <Zap size={20} />
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.35rem" }}>
              Smart Budget Caps
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#C8C7CD", lineHeight: 1.5 }}>
              Set monthly spending limits and get automated alerts before overspending.
            </p>
          </div>

          {/* Feature 3 */}
          <div
            style={{
              background: "#23273C",
              border: "1px solid #2D324B",
              borderRadius: "16px",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(46, 158, 109, 0.15)",
                color: "#2E9E6D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "0.85rem",
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "0.35rem" }}>
              Private & Secure
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#C8C7CD", lineHeight: 1.5 }}>
              Your records stay private with local encryption and bank-grade data protection.
            </p>
          </div>
        </div>
      </main>

      {/* ── MINIMAL FOOTER ── */}
      <footer
        style={{
          borderTop: "1px solid #2D324B",
          padding: "1.5rem 2rem",
          textAlign: "center",
          color: "#9E9EA5",
          fontSize: "0.825rem",
        }}
      >
        © 2026 NidhiTrack. All rights reserved.
      </footer>
    </div>
  );
}


