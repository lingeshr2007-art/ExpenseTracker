// src/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, KeyRound, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, Zap, ShieldCheck, TrendingUp } from "lucide-react";
import { authService } from "../services/authService";
import useStore from "../store/useStore";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const showToast = useStore((state) => (state.toast ? state.showToast : null));

  // Step 1: Email, Step 2: OTP Verification & New Password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [demoOTP, setDemoOTP] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Step 1: Request OTP Reset Code
  const handleRequestReset = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    authService
      .requestPasswordReset(email)
      .then((res) => {
        setIsLoading(false);
        setDemoOTP(res.otpCode);
        setStep(2);
        if (showToast) showToast(`Verification code sent to ${email} ✓`);
      })
      .catch((err) => {
        setIsLoading(false);
        setErrorMsg(err.message || "Failed to request password reset.");
      });
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match!");
      return;
    }

    setIsLoading(true);

    authService
      .resetPassword(email, otpCode, newPassword)
      .then(() => {
        setIsLoading(false);
        setIsSuccess(true);
        if (showToast) showToast("Password updated successfully! 🔒");
        setTimeout(() => navigate("/login"), 1200);
      })
      .catch((err) => {
        setIsLoading(false);
        setErrorMsg(err.message || "Error resetting password.");
      });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#161824",
        color: "#F8FAFC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#23273C",
          border: "1px solid #2D324B",
          borderRadius: "24px",
          padding: "2rem",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        {/* Back Link */}
        <Link
          to="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.825rem",
            fontWeight: 600,
            color: "#C8C7CD",
            textDecoration: "none",
            marginBottom: "1.5rem",
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Sign In</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <img
            src="/nidhitrack-logo.svg"
            alt="NidhiTrack Logo"
            style={{
              width: "38px",
              height: "38px",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "#F8FAFC" }}>
            NidhiTrack
          </span>
        </div>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.35rem", color: "#F8FAFC" }}>
          Reset Password
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#C8C7CD", marginBottom: "1.5rem", lineHeight: 1.5 }}>
          {step === 1
            ? "Enter your registered email address to receive a secure 6-digit verification code."
            : `Enter the 6-digit code sent to ${email} and choose a new password.`}
        </p>

        {/* Inline Error Alert */}
        {errorMsg && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              backgroundColor: "rgba(255, 84, 96, 0.12)",
              border: "1px solid rgba(255, 84, 96, 0.3)",
              color: "#FF5460",
              fontSize: "0.825rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.25rem",
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Demo OTP Banner */}
        {demoOTP && step === 2 && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              backgroundColor: "rgba(62, 195, 213, 0.12)",
              border: "1px solid rgba(62, 195, 213, 0.3)",
              color: "#3EC3D5",
              fontSize: "0.825rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ShieldCheck size={18} />
              <span>Security Demo OTP Code:</span>
            </div>
            <span style={{ fontSize: "1.1rem", fontFamily: "monospace", letterSpacing: "0.1em", fontWeight: 800 }}>
              {demoOTP}
            </span>
          </div>
        )}

        {/* Step 1 Form */}
        {step === 1 && (
          <form onSubmit={handleRequestReset} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#CBD5E1", display: "block", marginBottom: "0.4rem" }}>
                REGISTERED EMAIL ADDRESS
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#C8C7CD" }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="suresh@myfinpal.com"
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem 0.8rem 2.65rem",
                    backgroundColor: "#161824",
                    border: "1px solid #2D324B",
                    borderRadius: "12px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#F8FAFC",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "0.875rem",
                background: "#3EC3D5",
                color: "#FFFFFF",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.9375rem",
                fontWeight: 700,
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              {isLoading ? <span>Sending Code...</span> : <><span>Send Verification Code</span> <ArrowRight size={18} /></>}
            </button>
          </form>
        )}

        {/* Step 2 Form */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#CBD5E1", display: "block", marginBottom: "0.4rem" }}>
                6-DIGIT VERIFICATION CODE
              </label>
              <div style={{ position: "relative" }}>
                <KeyRound size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#C8C7CD" }} />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="849201"
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem 0.8rem 2.65rem",
                    backgroundColor: "#161824",
                    border: "1px solid #2D324B",
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    color: "#F8FAFC",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#CBD5E1", display: "block", marginBottom: "0.4rem" }}>
                NEW PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#C8C7CD" }} />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem 0.8rem 2.65rem",
                    backgroundColor: "#161824",
                    border: "1px solid #2D324B",
                    borderRadius: "12px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#F8FAFC",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#CBD5E1", display: "block", marginBottom: "0.4rem" }}>
                CONFIRM NEW PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#C8C7CD" }} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem 0.8rem 2.65rem",
                    backgroundColor: "#161824",
                    border: "1px solid #2D324B",
                    borderRadius: "12px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#F8FAFC",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              style={{
                width: "100%",
                padding: "0.875rem",
                background: "#3EC3D5",
                color: "#FFFFFF",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.9375rem",
                fontWeight: 700,
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              {isLoading ? (
                <span>Updating Password...</span>
              ) : isSuccess ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <CheckCircle2 size={18} />
                  <span>Password Reset! Redirecting to Sign In...</span>
                </div>
              ) : (
                <span>Reset & Update Password</span>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
