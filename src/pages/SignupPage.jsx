// src/pages/SignupPage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  KeyRound,
} from "lucide-react";
import toast from "react-hot-toast";
import useStore from "../store/useStore";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext.jsx";
import { authService } from "../services/authService";

const FEATURE_SLIDES = [
  {
    id: 1,
    title: "Join NidhiTrack Today",
    subtitle: "Take full control of your money with smart AI tracking, automated budgeting, and goal vaults.",
    badge: "AI Powered",
  },
  {
    id: 2,
    title: "Track Income & Expenses",
    subtitle: "Consolidate cash, card, and bank accounts in one place with real-time categorizations.",
    badge: "Multi-Account Sync",
  },
  {
    id: 3,
    title: "Bank-Grade Encryption",
    subtitle: "Your financial privacy and data integrity are protected by military-grade 256-bit encryption.",
    badge: "100% Secure",
  },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const showToast = useStore((state) => (state.toast ? state.showToast : null));
  const appContext = useApp();
  const { sendOtp } = useAuth();

  // Mode: "password" (default) or "otp"
  const [signupMode, setSignupMode] = useState("password");

  // Form state
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status state
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  // Email Validator Helper
  const isValidEmail = (str) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(str).trim().toLowerCase());
  };

  // Auto rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % FEATURE_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Submit Password Signup
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!agreeTerms) {
      setAuthError("Please agree to the Terms of Service & Privacy Policy.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.signup(fullName, username, password);
      setIsLoading(false);
      setIsSuccess(true);

      if (appContext && typeof appContext.login === "function") {
        appContext.login(res.user?.name || fullName, res.user?.email || `${username}@myfinpal.com`);
      }

      toast.success("Account registered successfully! 🎉");
      if (showToast) showToast("Account registered successfully! 🎉");

      setTimeout(() => {
        navigate("/login", {
          state: { registeredUsername: username, justRegistered: true },
        });
      }, 700);
    } catch (err) {
      setIsLoading(false);
      const errMsg = err.message || "Registration failed. Please try again.";
      setAuthError(errMsg);
      toast.error(errMsg);
    }
  };

  // Submit OTP Signup / Login
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    const cleanEmail = (email || username || "").trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      setAuthError("Please enter a valid Gmail / Email address for OTP verification.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await sendOtp(cleanEmail);
      setIsLoading(false);
      toast.success(res.message || `Security OTP sent to ${cleanEmail}`);
      navigate("/verify-otp", { state: { email: cleanEmail } });
    } catch (err) {
      setIsLoading(false);
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to send OTP code. Please try again.";
      setAuthError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        position: "relative",
        backgroundColor: "#FAFAFA",
        color: "#1A1A1E",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: "1040px",
          borderRadius: "24px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E8E8EA",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.04)",
          padding: "1.25rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.25rem",
          position: "relative",
          zIndex: 10,
          overflow: "hidden",
        }}
      >
        {/* LEFT SECTION: Signup Form */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.5rem 1.5rem", gap: "1rem" }}>
          <div>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <img
                src="/nidhitrack-logo.png"
                alt="NidhiTrack Logo"
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "contain",
                  borderRadius: "6px",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "#1A1A1E" }}>
                NidhiTrack
              </span>
            </div>

            {/* Header */}
            <div style={{ marginBottom: "1.25rem" }}>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "#1A1A1E" }}>
                Create your Account 🚀
              </h1>
              <p style={{ fontSize: "0.85rem", color: "#6B6B72", fontWeight: 500 }}>
                Start managing your personal finances with AI in seconds.
              </p>
            </div>

            {/* Auth Method Toggle Tabs */}
            <div
              style={{
                display: "flex",
                backgroundColor: "#F4F4F6",
                borderRadius: "10px",
                padding: "3px",
                marginBottom: "1.25rem",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setSignupMode("password");
                  setAuthError("");
                }}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  border: "none",
                  backgroundColor: signupMode === "password" ? "#FFFFFF" : "transparent",
                  color: signupMode === "password" ? "#1A1A1E" : "#6B6B72",
                  boxShadow: signupMode === "password" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                }}
              >
                <Lock size={14} />
                <span>Password Signup</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSignupMode("otp");
                  setAuthError("");
                }}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  border: "none",
                  backgroundColor: signupMode === "otp" ? "#FFFFFF" : "transparent",
                  color: signupMode === "otp" ? "#1A1A1E" : "#6B6B72",
                  boxShadow: signupMode === "otp" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                }}
              >
                <KeyRound size={14} />
                <span>OTP Signup</span>
              </button>
            </div>

            {/* Inline Error Alert */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  backgroundColor: "#FCE8E6",
                  border: "1px solid #D65A5A",
                  color: "#D65A5A",
                  fontSize: "0.825rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <AlertCircle size={16} />
                <span>{authError}</span>
              </motion.div>
            )}

            {/* ── FORM 1: Password Signup ── */}
            {signupMode === "password" && (
              <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                {/* Full Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#1A1A1E" }}>
                    Full Name
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6B6B72" }} />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Lingesh R"
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem 0.75rem 2.5rem",
                        backgroundColor: "#FAFAFA",
                        border: "1px solid #E8E8EA",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#1A1A1E",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                {/* Username */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#1A1A1E" }}>
                    Username
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6B6B72" }} />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. Lingesh"
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem 0.75rem 2.5rem",
                        backgroundColor: "#FAFAFA",
                        border: "1px solid #E8E8EA",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#1A1A1E",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#1A1A1E" }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6B6B72" }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      style={{
                        width: "100%",
                        padding: "0.75rem 2.5rem",
                        backgroundColor: "#FAFAFA",
                        border: "1px solid #E8E8EA",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#1A1A1E",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6B6B72", cursor: "pointer" }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#6B6B72", fontSize: "0.78rem", fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ accentColor: "#4F5DED" }}
                  />
                  <span>I agree to the Terms of Service & Privacy Policy</span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    background: "#4F5DED",
                    color: "#FFFFFF",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 6px 16px rgba(79, 93, 237, 0.25)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  {isLoading ? (
                    <span>Registering Account...</span>
                  ) : isSuccess ? (
                    <span>Account Created! Redirecting...</span>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── FORM 2: Passwordless OTP Signup ── */}
            {signupMode === "otp" && (
              <form onSubmit={handleOtpSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#1A1A1E" }}>
                    Gmail / Email Address
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6B6B72" }} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setAuthError("");
                      }}
                      placeholder="e.g. lingesh@gmail.com"
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem 0.75rem 2.5rem",
                        backgroundColor: "#FAFAFA",
                        border: "1px solid #E8E8EA",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#1A1A1E",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <p style={{ fontSize: "0.78rem", color: "#6B6B72", lineHeight: 1.4 }}>
                  We will send a 6-digit security OTP code to your Gmail address for instant account verification.
                </p>

                <button
                  type="submit"
                  disabled={!isValidEmail(email) || isLoading}
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    background: isValidEmail(email) ? "#4F5DED" : "#A5B4FC",
                    color: "#FFFFFF",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: isValidEmail(email) ? "0 6px 16px rgba(79, 93, 237, 0.25)" : "none",
                    cursor: isValidEmail(email) && !isLoading ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  {isLoading ? (
                    <span>Sending Security OTP...</span>
                  ) : (
                    <>
                      <span>Send Verification OTP</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div style={{ textAlign: "center", fontSize: "0.825rem", color: "#6B6B72", marginTop: "0.5rem" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ fontWeight: 700, color: "#4F5DED", textDecoration: "none" }}>
              Sign In
            </Link>
          </div>
        </div>

        {/* RIGHT SECTION: Showcase */}
        <div
          style={{
            backgroundColor: "#F1F1F8",
            borderRadius: "18px",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "1px solid #E8E8EA",
            position: "relative",
            minHeight: "480px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ padding: "5px 12px", borderRadius: "999px", backgroundColor: "#FFFFFF", border: "1px solid #E8E8EA", fontSize: "0.75rem", fontWeight: 700, color: "#4F5DED" }}>
              {FEATURE_SLIDES[activeSlide].badge}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#6B6B72", fontWeight: 700 }}>
              0{activeSlide + 1} / 03
            </span>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8EA", borderRadius: "16px", padding: "1.5rem", margin: "2rem 0" }}>
            <div style={{ fontSize: "0.75rem", color: "#6B6B72" }}>Total Net Worth</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1A1A1E", marginTop: "2px" }}>₹5,12,000.00</div>
            <div style={{ display: "flex", gap: "6px", marginTop: "1rem", height: "45px", alignItems: "flex-end" }}>
              {[30, 55, 40, 75, 60, 95, 80].map((val, idx) => (
                <div key={idx} style={{ flex: 1, height: `${val}%`, backgroundColor: "#4F5DED", borderRadius: "4px" }} />
              ))}
            </div>
          </div>

          <div>
            <AnimatePresence mode="wait">
              <motion.div key={activeSlide} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1A1A1E", marginBottom: "0.4rem" }}>
                  {FEATURE_SLIDES[activeSlide].title}
                </h2>
                <p style={{ fontSize: "0.825rem", color: "#6B6B72", lineHeight: 1.5 }}>
                  {FEATURE_SLIDES[activeSlide].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
