// src/components/GoogleAuthModal.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ShieldCheck, User } from "lucide-react";

export default function GoogleAuthModal({ isOpen, onClose, onSelectAccount }) {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const ACCOUNTS = [
    { name: "Suresh Kumar", email: "suresh@myfinpal.com", avatar: "SK" },
    { name: "Suresh (Personal)", email: "suresh.kumar@gmail.com", avatar: "S" },
  ];

  const handleChoose = (account) => {
    setSelectedEmail(account.email);
    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      onSelectAccount(account);
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(8px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: "420px",
            backgroundColor: "#FFFFFF",
            color: "#1F2937",
            borderRadius: "20px",
            padding: "1.75rem",
            boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
            border: "1px solid #E5E7EB",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <svg style={{ width: "24px", height: "24px" }} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", margin: 0 }}>
                  Sign in with Google
                </h3>
                <p style={{ fontSize: "0.78rem", color: "#6B7280", margin: "2px 0 0" }}>
                  Choose an account to continue to <strong style={{ color: "#3EC3D5" }}>NidhiTrack</strong>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isAuthenticating}
              style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer" }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ height: "1px", backgroundColor: "#E5E7EB", margin: "1rem 0" }} />

          {/* Account Selection List */}
          {isAuthenticating ? (
            <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
              <div style={{ display: "inline-block", marginBottom: "1rem" }}>
                <svg className="animate-spin" style={{ width: "32px", height: "32px", color: "#4285F4" }} viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#111827", marginBottom: "0.25rem" }}>
                Authenticating OAuth 2.0...
              </h4>
              <p style={{ fontSize: "0.78rem", color: "#6B7280" }}>
                Verifying Google identity token for {selectedEmail}...
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleChoose(acc)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.875rem",
                    width: "100%",
                    padding: "0.75rem 0.875rem",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    backgroundColor: "#F9FAFB",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "#3EC3D5",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {acc.avatar}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>{acc.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis" }}>{acc.email}</div>
                  </div>
                </button>
              ))}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontSize: "0.75rem",
                  color: "#6B7280",
                  marginTop: "0.75rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid #F3F4F6",
                }}
              >
                <ShieldCheck size={16} color="#3EC3D5" />
                <span>To continue, Google will share your name and email with NidhiTrack.</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
