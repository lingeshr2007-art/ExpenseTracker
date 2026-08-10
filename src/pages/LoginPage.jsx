// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import GoogleAuthModal from "../components/GoogleAuthModal.jsx";

const FEATURE_SLIDES = [
  {
    id: 1,
    title: "Track Every Transaction",
    subtitle:
      "Manage income, expenses, investments and savings with beautiful AI-powered insights.",
    badge: "AI Powered",
    icon: Sparkles,
  },
  {
    id: 2,
    title: "Smart AI Budget Guard",
    subtitle:
      "Automated spending limits, instant threshold alerts, and real-time cash flow optimization.",
    badge: "Automated Insights",
    icon: ShieldCheck,
  },
  {
    id: 3,
    title: "Growth & Savings Vault",
    subtitle:
      "Visualize portfolio performance, track savings goals, and build wealth with confidence.",
    badge: "Bank-Grade Encryption",
    icon: TrendingUp,
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendOtp, loginWithPassword, loginWithGoogle, isAuthenticated } = useAuth();

  const registeredInput =
    location.state?.registeredEmail ||
    location.state?.registeredUsername ||
    location.state?.email ||
    "";

  // Login Mode: "password" (default) or "otp"
  const [loginMode, setLoginMode] = useState("password");

  // Form Input States
  const [identifier, setIdentifier] = useState(registeredInput);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  // Google OAuth Modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Email Validator Helper
  const isValidEmail = (str) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(str).trim().toLowerCase());
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Auto-rotate feature slides
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % FEATURE_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Form Submit Handler: Username/Password Login
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId) {
      setAuthError("Please enter your username.");
      return;
    }
    if (!cleanPass) {
      setAuthError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      await loginWithPassword(cleanId, cleanPass);
      setIsLoading(false);
      toast.success("Welcome back! Signed in successfully 🎉");
      navigate("/dashboard");
    } catch (err) {
      setIsLoading(false);
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        "Invalid username or password. Please try again.";
      setAuthError(errMsg);
      toast.error(errMsg);
    }
  };

  // Form Submit Handler: Send OTP Flow
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    const cleanEmail = identifier.trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      setAuthError("Please enter a valid Gmail / Email address for OTP code.");
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
        "Failed to send OTP. Please try again.";
      setAuthError(errMsg);
      toast.error(errMsg);
    }
  };

  // Google Auth Success Handler (Direct Verified Email Login via Google)
  const handleGoogleSuccess = async (googleUser) => {
    setIsGoogleModalOpen(false);
    setIsLoading(true);

    try {
      await loginWithGoogle(googleUser.email, googleUser.name);
      setIsLoading(false);
      toast.success(`Signed in with Google as ${googleUser.name} ✓ (Email Verified)`);
      navigate("/dashboard");
    } catch (err) {
      setIsLoading(false);
      toast.error("Google authentication failed. Please try again.");
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
        overflowY: "auto",
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
        }}
      >
        {/* ── LEFT SIDE: Login Form (Username & Password / OTP) ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "2rem 1.75rem",
            gap: "1.25rem",
          }}
        >
          <div>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <img
                src="/nidhitrack-logo.png"
                alt="Nidhi Track Logo"
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "contain",
                  borderRadius: "8px",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "#1A1A1E",
                  letterSpacing: "-0.02em",
                }}
              >
                Nidhi Track
              </span>
            </div>

            {/* Header */}
            <div style={{ marginBottom: "1.25rem" }}>
              <h1
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "1.85rem",
                  fontWeight: 800,
                  color: "#1A1A1E",
                  lineHeight: 1.25,
                  marginBottom: "0.35rem",
                }}
              >
                Welcome Back 👋
              </h1>
              <p style={{ fontSize: "0.85rem", color: "#6B6B72", fontWeight: 500, lineHeight: 1.4 }}>
                Sign in with your username & password.
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
                  setLoginMode("password");
                  setAuthError("");
                }}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  border: "none",
                  backgroundColor: loginMode === "password" ? "#FFFFFF" : "transparent",
                  color: loginMode === "password" ? "#1A1A1E" : "#6B6B72",
                  boxShadow: loginMode === "password" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                }}
              >
                <Lock size={14} />
                <span>Password Login</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMode("otp");
                  setAuthError("");
                }}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  border: "none",
                  backgroundColor: loginMode === "otp" ? "#FFFFFF" : "transparent",
                  color: loginMode === "otp" ? "#1A1A1E" : "#6B6B72",
                  boxShadow: loginMode === "otp" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                }}
              >
                <KeyRound size={14} />
                <span>OTP Login</span>
              </button>
            </div>

            {/* Error Alert */}
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
                  marginBottom: "1.25rem",
                }}
              >
                <AlertCircle size={16} />
                <span>{authError}</span>
              </motion.div>
            )}

            {/* ── FORM 1: Username & Password Login ── */}
            {loginMode === "password" && (
              <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Username / Email Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#1A1A1E",
                    }}
                  >
                    Username
                  </label>
                  <div style={{ position: "relative", width: "100%" }}>
                    <User
                      size={18}
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#6B6B72",
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setAuthError("");
                      }}
                      placeholder="e.g. lingesh"
                      style={{
                        width: "100%",
                        padding: "0.85rem 1rem 0.85rem 2.65rem",
                        backgroundColor: "#FAFAFA",
                        border: "1px solid #E8E8EA",
                        borderRadius: "12px",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "#1A1A1E",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#4F5DED")}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#1A1A1E",
                      }}
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#4F5DED",
                        textDecoration: "none",
                      }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div style={{ position: "relative", width: "100%" }}>
                    <Lock
                      size={18}
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#6B6B72",
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setAuthError("");
                      }}
                      placeholder="Enter your password"
                      style={{
                        width: "100%",
                        padding: "0.85rem 2.65rem 0.85rem 2.65rem",
                        backgroundColor: "#FAFAFA",
                        border: "1px solid #E8E8EA",
                        borderRadius: "12px",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "#1A1A1E",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#4F5DED")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#6B6B72",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "0.875rem",
                    background: "#4F5DED",
                    color: "#FFFFFF",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 6px 16px rgba(79, 93, 237, 0.25)",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "all 0.2s ease",
                    marginTop: "0.25rem",
                  }}
                >
                  {isLoading ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <svg className="animate-spin" style={{ width: "18px", height: "18px", color: "white" }} viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── FORM 2: Passwordless OTP Login ── */}
            {loginMode === "otp" && (
              <form onSubmit={handleOtpSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#1A1A1E",
                    }}
                  >
                    Gmail / Email Address
                  </label>

                  <div style={{ position: "relative", width: "100%" }}>
                    <Mail
                      size={18}
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#6B6B72",
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      type="email"
                      required
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setAuthError("");
                      }}
                      placeholder="e.g. lingesh@gmail.com"
                      style={{
                        width: "100%",
                        padding: "0.85rem 1rem 0.85rem 2.65rem",
                        backgroundColor: "#FAFAFA",
                        border: "1px solid #E8E8EA",
                        borderRadius: "12px",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "#1A1A1E",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#4F5DED")}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isValidEmail(identifier) || isLoading}
                  style={{
                    width: "100%",
                    padding: "0.875rem",
                    background: isValidEmail(identifier) ? "#4F5DED" : "#A5B4FC",
                    color: "#FFFFFF",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: isValidEmail(identifier) ? "0 6px 16px rgba(79, 93, 237, 0.25)" : "none",
                    cursor: isValidEmail(identifier) && !isLoading ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "all 0.2s ease",
                    marginTop: "0.25rem",
                  }}
                >
                  {isLoading ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <svg className="animate-spin" style={{ width: "18px", height: "18px", color: "white" }} viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Sending Security OTP...</span>
                    </div>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}


          </div>

          {/* Footer Navigation Link */}
          <div style={{ textAlign: "center", fontSize: "0.85rem", color: "#6B6B72", marginTop: "0.5rem" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#4F5DED", fontWeight: 700, textDecoration: "none" }}>
              Sign Up
            </Link>
          </div>
        </div>

        {/* ── RIGHT SIDE: Showcase Feature Section ── */}
        <div
          style={{
            backgroundColor: "#F1F1F8",
            borderRadius: "18px",
            padding: "2.25rem 2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "1px solid #E8E8EA",
            position: "relative",
            minHeight: "480px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                backgroundColor: "#FFFFFF",
                color: "#4F5DED",
                border: "1px solid #E8E8EA",
                fontSize: "0.725rem",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#4F5DED" }} />
              {FEATURE_SLIDES[activeSlide].badge}
            </span>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6B6B72" }}>
              0{activeSlide + 1} / 0{FEATURE_SLIDES.length}
            </span>
          </div>

          <div style={{ margin: "2rem 0", position: "relative" }}>
            <div
              style={{
                borderRadius: "16px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E8EA",
                padding: "1.5rem",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#6B6B72", letterSpacing: "0.05em" }}>
                  TOTAL NET WORTH
                </span>
                <span
                  style={{
                    padding: "0.15rem 0.5rem",
                    borderRadius: "6px",
                    backgroundColor: "#E6F4EA",
                    color: "#2E9E6D",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                  }}
                >
                  +24.8%
                </span>
              </div>
              <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "#1A1A1E", marginBottom: "1rem" }}>
                ₹3,84,250.00
              </div>
              <div style={{ height: "60px", width: "100%" }}>
                <svg viewBox="0 0 300 60" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                  <path
                    d="M 0 50 Q 75 10 150 40 T 300 10 L 300 60 L 0 60 Z"
                    fill="rgba(79, 93, 237, 0.08)"
                  />
                  <path
                    d="M 0 50 Q 75 10 150 40 T 300 10"
                    fill="none"
                    stroke="#4F5DED"
                    strokeWidth="3"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
              >
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1A1A1E", marginBottom: "0.35rem" }}>
                  {FEATURE_SLIDES[activeSlide].title}
                </h3>
                <p style={{ fontSize: "0.825rem", color: "#6B6B72", lineHeight: 1.5, marginBottom: "1rem" }}>
                  {FEATURE_SLIDES[activeSlide].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
        onSelectAccount={handleGoogleSuccess}
      />
    </div>
  );
}
