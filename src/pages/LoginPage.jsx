// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  User,
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
  const showToast = useStore((state) => (state.toast ? state.showToast : null));
  const appContext = useApp();

  const registeredUsername = location.state?.registeredUsername || location.state?.registeredEmail || "";
  const justRegistered = location.state?.justRegistered || false;

  // Form State - empty by default, with clear example placeholders
  const [username, setUsername] = useState(registeredUsername || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isCapsLock, setIsCapsLock] = useState(false);

  // Status & Error Alert State
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  // Google OAuth Modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Auto-rotate feature slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % FEATURE_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Redirect to landing page ('/') when user clicks browser Back button on /login page
  useEffect(() => {
    const handlePopState = () => {
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  // Keyboard Event: Check Caps Lock Status
  const handleKeyDown = (e) => {
    if (e.getModifierState) {
      setIsCapsLock(e.getModifierState("CapsLock"));
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!username.trim()) {
      setAuthError("Please enter your username.");
      return;
    }
    if (!password.trim()) {
      setAuthError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.login(username, password);
      setIsLoading(false);
      setIsSuccess(true);

      if (appContext && typeof appContext.login === "function") {
        appContext.login(res.user.name, res.user.email);
      }

      if (showToast) showToast(`Welcome back, ${res.user.name}! 👋`);

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (err) {
      setIsLoading(false);
      setAuthError(err.message || "Invalid credentials. Please try again.");
    }
  };

  // Google Authentication Success Handler
  const handleGoogleSuccess = async (googleUser) => {
    setIsLoading(true);
    authService
      .googleAuth(googleUser.email, googleUser.name, googleUser.picture)
      .then((res) => {
        setIsLoading(false);
        setIsSuccess(true);

        if (appContext && typeof appContext.login === "function") {
          appContext.login(res.user.name, res.user.email);
        }

        if (showToast) showToast(`Signed in with Google as ${res.user.name} ✓`);

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
      {/* Main Centered Minimal Light Container */}
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
        {/* ── LEFT SIDE: Form Section ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "2rem 1.75rem",
            gap: "1.5rem",
          }}
        >
          <div>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
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
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "#1A1A1E",
                  letterSpacing: "-0.02em",
                }}
              >
                NidhiTrack
              </span>
            </div>

            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h1
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "#1A1A1E",
                  lineHeight: 1.25,
                  marginBottom: "0.5rem",
                }}
              >
                Welcome Back 👋
              </h1>
              <p style={{ fontSize: "0.875rem", color: "#6B6B72", fontWeight: 500 }}>
                Sign in to securely manage your finances.
              </p>
            </div>

            {/* Inline Registration Success Banner */}
            {justRegistered && !authError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  backgroundColor: "#E6F4EA",
                  border: "1px solid #2E9E6D",
                  color: "#2E9E6D",
                  fontSize: "0.825rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1.25rem",
                }}
              >
                <CheckCircle2 size={16} />
                <span>Account created successfully! Please sign in below.</span>
              </motion.div>
            )}

            {/* Inline Security Error Alert */}
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

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Username Input */}
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
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Lingesh"
                    style={{
                      width: "100%",
                      padding: "0.8rem 1rem 0.8rem 2.65rem",
                      backgroundColor: "#FAFAFA",
                      border: "1px solid #E8E8EA",
                      borderRadius: "12px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#1A1A1E",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#4F5DED")}
                    onBlur={(e) => (e.target.style.borderColor = "#E8E8EA")}
                  />
                </div>
              </div>

              {/* Password Input */}
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
                  {isCapsLock && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        color: "#D9A441",
                        backgroundColor: "#FFFBEB",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      <AlertCircle size={11} /> CAPS LOCK ON
                    </span>
                  )}
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
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. Ling@123"
                    style={{
                      width: "100%",
                      padding: "0.8rem 2.65rem 0.8rem 2.65rem",
                      backgroundColor: "#FAFAFA",
                      border: "1px solid #E8E8EA",
                      borderRadius: "12px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#1A1A1E",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#4F5DED")}
                    onBlur={(e) => (e.target.style.borderColor = "#E8E8EA")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      color: "#6B6B72",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.8125rem",
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#6B6B72", fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "#4F5DED", cursor: "pointer" }}
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  style={{ fontWeight: 600, color: "#4F5DED", textDecoration: "none" }}
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading || isSuccess}
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
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "transform 0.15s, opacity 0.15s",
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
                ) : isSuccess ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#FFFFFF" }}>
                    <CheckCircle2 size={18} />
                    <span>Signed In Successfully!</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In</span>
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

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E8E8EA",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#1A1A1E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.625rem",
                  cursor: "pointer",
                  transition: "border-color 0.2s, background-color 0.2s",
                }}
              >
                <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          </div>

          {/* Footer Link */}
          <div style={{ textAlign: "center", fontSize: "0.8125rem", color: "#6B6B72" }}>
            Don’t have an account?{" "}
            <Link
              to="/signup"
              style={{ fontWeight: 700, color: "#4F5DED", textDecoration: "none" }}
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* ── RIGHT SIDE: Showcase Section ── */}
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
          {/* Top Tag & Slide Counter */}
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

          {/* Center Interactive Mockup Graphic */}
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
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                {["Food & Dining", "Bills & Utilities", "Investments"].map((tag, idx) => (
                  <span
                    key={tag}
                    style={{
                      padding: "0.2rem 0.5rem",
                      borderRadius: "6px",
                      backgroundColor: idx === 0 ? "#F1F1F8" : "#FAFAFA",
                      border: "1px solid #E8E8EA",
                      color: idx === 0 ? "#4F5DED" : "#6B6B72",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Slide Description & Indicators */}
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

            <div style={{ display: "flex", gap: "0.4rem" }}>
              {FEATURE_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSlide(idx)}
                  style={{
                    height: "4px",
                    width: activeSlide === idx ? "24px" : "8px",
                    borderRadius: "9999px",
                    backgroundColor: activeSlide === idx ? "#4F5DED" : "#E8E8EA",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Google OAuth Modal Component */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
      />
    </div>
  );
}
