// src/pages/VerifyOtpPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Mail,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp, isAuthenticated } = useAuth();

  const email = location.state?.email || "";
  const initialOtpCode = location.state?.otpCode || "";

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // If no email passed in location state, redirect back to login
  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  // 6 Digits State (empty on load, user must type code from email inbox)
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  
  // 5 Min Expiry Timer (300s)
  const [expiryTimer, setExpiryTimer] = useState(300);
  
  // 60s Resend Lock Timer
  const [resendTimer, setResendTimer] = useState(60);

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];



  // 5 Min Expiry Timer Countdown
  useEffect(() => {
    let timer;
    if (expiryTimer > 0) {
      timer = setInterval(() => {
        setExpiryTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [expiryTimer]);

  // 60s Resend Lock Timer Countdown
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Focus first input box on mount
  useEffect(() => {
    setTimeout(() => {
      if (inputRefs[0]?.current) {
        inputRefs[0].current.focus();
      }
    }, 150);
  }, []);

  // Format Seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Digit Input Handler
  const handleDigitChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, "");

    // Pasted string handling
    if (cleanVal.length > 1) {
      const pastedDigits = cleanVal.slice(0, 6).split("");
      const newDigits = [...otpDigits];
      pastedDigits.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setOtpDigits(newDigits);

      const nextFocusIdx = Math.min(pastedDigits.length, 5);
      if (inputRefs[nextFocusIdx]?.current) {
        inputRefs[nextFocusIdx].current.focus();
      }

      if (pastedDigits.length === 6) {
        handleVerify(newDigits.join(""));
      }
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Focus next box automatically
    if (cleanVal && index < 5) {
      if (inputRefs[index + 1]?.current) {
        inputRefs[index + 1].current.focus();
      }
    }

    // Auto-verify when 6 digits are complete
    if (cleanVal && newDigits.every((d) => d !== "")) {
      handleVerify(newDigits.join(""));
    }
  };

  // Backspace key handler
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      if (inputRefs[index - 1]?.current) {
        inputRefs[index - 1].current.focus();
      }
    }
  };

  // Clipboard Paste handler
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (pastedText) {
      const digits = pastedText.slice(0, 6).split("");
      const newDigits = ["", "", "", "", "", ""];
      digits.forEach((d, i) => {
        newDigits[i] = d;
      });
      setOtpDigits(newDigits);

      if (digits.length === 6) {
        handleVerify(newDigits.join(""));
      } else if (inputRefs[digits.length]?.current) {
        inputRefs[digits.length].current.focus();
      }
    }
  };

  // Submit Verification
  const handleVerify = async (codeOverride) => {
    const code = codeOverride || otpDigits.join("");
    setErrorMsg("");

    if (code.length < 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await verifyOtp(email, code);
      setIsLoading(false);
      toast.success(res.message || "OTP verified! Logging in...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err) {
      setIsLoading(false);
      const errMsg = err.response?.data?.error || err.message || "Invalid OTP code. Please try again.";
      setErrorMsg(errMsg);
      toast.error(errMsg);
    }
  };

  // Resend OTP handler
  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;
    setErrorMsg("");
    setIsResending(true);

    try {
      const res = await resendOtp(email);
      setIsResending(false);
      setExpiryTimer(300);
      setResendTimer(60);
      setOtpDigits(["", "", "", "", "", ""]);
      toast.success(res.message || `New OTP code sent to your email inbox: ${email}`);

      if (inputRefs[0]?.current) {
        inputRefs[0].current.focus();
      }
    } catch (err) {
      setIsResending(false);
      const errMsg = err.response?.data?.error || err.message || "Failed to resend OTP code.";
      setErrorMsg(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#0F172A",
        color: "#F8FAFC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "'Inter', system-ui, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#1E293B",
          border: "1px solid #334155",
          borderRadius: "24px",
          padding: "2.25rem 2rem",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Back Link */}
        <Link
          to="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "#818CF8",
            fontSize: "0.825rem",
            fontWeight: 700,
            textDecoration: "none",
            width: "fit-content",
          }}
        >
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        {/* Header */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "#818CF8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mail size={22} />
            </div>
            <div>
              <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#818CF8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                2-FACTOR AUTH
              </span>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#F8FAFC", margin: 0 }}>
                Enter Security Code
              </h1>
            </div>
          </div>

          <p style={{ fontSize: "0.875rem", color: "#94A3B8", lineHeight: 1.5, marginTop: "0.5rem" }}>
            We've sent a 6-digit verification code to your registered email:{" "}
            <strong style={{ color: "#F8FAFC" }}>{email}</strong>
          </p>
        </div>



        {/* Error Alert */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              border: "1px solid #EF4444",
              color: "#FCA5A5",
              fontSize: "0.825rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* 6 Digit Inputs Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#CBD5E1", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              6-Digit OTP Code
            </label>

            {/* Countdown timer */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", fontWeight: 700, color: expiryTimer > 0 ? "#818CF8" : "#EF4444" }}>
              <Clock size={13} />
              <span>{expiryTimer > 0 ? formatTime(expiryTimer) : "Expired"}</span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "0.5rem",
              marginTop: "0.25rem",
            }}
            onPaste={handlePaste}
          >
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                maxLength={6}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                style={{
                  width: "100%",
                  height: "56px",
                  textAlign: "center",
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "#F8FAFC",
                  backgroundColor: "#0F172A",
                  border: digit ? "2px solid #6366F1" : "1px solid #334155",
                  borderRadius: "12px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                onBlur={(e) => {
                  if (!otpDigits[idx]) e.target.style.borderColor = "#334155";
                }}
              />
            ))}
          </div>
        </div>

        {/* Verify Button */}
        <button
          type="button"
          onClick={() => handleVerify()}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "0.875rem",
            backgroundColor: "#6366F1",
            color: "#FFFFFF",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.95rem",
            fontWeight: 700,
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 6px 20px rgba(99, 102, 241, 0.35)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            transition: "all 0.2s",
          }}
        >
          {isLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg className="animate-spin" style={{ width: "18px", height: "18px", color: "white" }} viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Verifying Code...</span>
            </div>
          ) : (
            <>
              <span>Verify & Complete Sign In</span>
              <ShieldCheck size={18} />
            </>
          )}
        </button>

        {/* Resend Section */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8125rem", color: "#94A3B8", paddingTop: "0.5rem", borderTop: "1px solid #334155" }}>
          <div>
            {resendTimer > 0 ? (
              <span>Resend in <strong style={{ color: "#F8FAFC" }}>{resendTimer}s</strong></span>
            ) : (
              <span>Didn't receive email?</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendTimer > 0 || isResending}
            style={{
              background: "transparent",
              border: "none",
              color: resendTimer > 0 ? "#64748B" : "#818CF8",
              fontWeight: 700,
              cursor: resendTimer > 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <RefreshCw size={14} className={isResending ? "animate-spin" : ""} />
            <span>{isResending ? "Sending..." : "Resend OTP Email"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
