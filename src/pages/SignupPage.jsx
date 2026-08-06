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
} from "lucide-react";
import useStore from "../store/useStore";
import { useApp } from "../context/AppContext";
import { authService } from "../services/authService";
import GoogleAuthModal from "../components/GoogleAuthModal";

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

  // Form state
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status state
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  // Google OAuth Modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Auto rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % FEATURE_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
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

      if (showToast) showToast("Account registered successfully! 🎉");

      setTimeout(() => {
        navigate("/login", {
          state: { registeredUsername: username, justRegistered: true },
        });
      }, 700);
    } catch (err) {
      setIsLoading(false);
      setAuthError(err.message || "Registration failed. Please try again.");
    }
  };

  const handleGoogleAccountSelected = (acct) => {
    setIsGoogleModalOpen(false);
    setIsLoading(true);

    authService
      .googleAuth(acct.email, acct.name, acct.avatar)
      .then((res) => {
        setIsLoading(false);
        setIsSuccess(true);

        if (appContext && typeof appContext.login === "function") {
          appContext.login(res.user.name, res.user.email);
        }

        if (showToast) showToast(`Signed up with Google as ${acct.name} ✓`);

        setTimeout(() => {
          navigate("/dashboard");
        }, 700);
      });
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
                src="/nidhitrack-logo.svg"
                alt="NidhiTrack Logo"
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "contain",
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

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
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
              {/* Divider */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0.5rem 0",
                }}
              >
                <div style={{ width: "100%", height: "1px", backgroundColor: "#E8E8EA" }} />
                <span
                  style={{
                    position: "absolute",
                    backgroundColor: "#FFFFFF",
                    padding: "0 0.75rem",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#6B6B72",
                  }}
                >
                  Or continue with
                </span>
              </div>

              {/* Google Signup */}
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E8E8EA",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#1A1A1E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                }}
              >
                <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign Up with Google</span>
              </button>
            </form>
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

      {/* Google OAuth Consent Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleGoogleAccountSelected}
      />
    </div>
  );
}
