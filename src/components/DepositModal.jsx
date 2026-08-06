// src/components/DepositModal.jsx
import React, { useState, useEffect } from "react";
import { FaWallet, FaCreditCard } from "react-icons/fa6";

export default function DepositModal({ isOpen, onClose, onDeposit, goal }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState("Bank Transfer");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
    setMethod("Bank Transfer");
    setNotes("");
    setError("");
  }, [goal, isOpen]);

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.target - goal.current);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid deposit amount > 0");
      return;
    }

    onDeposit(goal.id, numAmount, date, method, notes);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        className="card card-p animate-in"
        style={{
          maxWidth: "440px",
          width: "100%",
          borderRadius: "1rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FaWallet size={22} color="#3EC3D5" />
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>Deposit Funds</h3>
              <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{goal.name}</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        {/* Goal Summary Box */}
        {(() => {
          const dLine = new Date(goal.deadline);
          const daysLeft = Math.max(1, Math.ceil((dLine.getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
          const mthsLeft = Math.max(0.1, parseFloat((daysLeft / 30.4375).toFixed(1)));
          const dailyTarget = remaining > 0 ? Math.ceil(remaining / daysLeft) : 0;
          const monthlyTarget = remaining > 0 ? Math.ceil(remaining / mthsLeft) : 0;

          return (
            <div
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                backgroundColor: "var(--color-primary-light)",
                border: "1px solid var(--border-color)",
                marginBottom: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Current Saved</span>
                  <strong style={{ fontSize: "1rem", color: "var(--color-text-primary)" }}>₹{goal.current.toLocaleString("en-IN")}</strong>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Remaining Goal</span>
                  <strong style={{ fontSize: "1rem", color: "var(--color-primary)" }}>₹{remaining.toLocaleString("en-IN")}</strong>
                </div>
              </div>

              {remaining > 0 && (
                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.4rem", display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                  <span>Required Daily: <strong style={{ color: "var(--color-text-primary)" }}>₹{dailyTarget.toLocaleString("en-IN")}/day</strong></span>
                  <span>Required Monthly: <strong style={{ color: "var(--color-primary)" }}>₹{monthlyTarget.toLocaleString("en-IN")}/month</strong></span>
                </div>
              )}
            </div>
          );
        })()}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Deposit Amount */}
          <div className="form-group">
            <label htmlFor="deposit-amount" className="input-label">Deposit Amount (INR / ₹)</label>
            <input
              id="deposit-amount"
              type="number"
              step="100"
              min="0"
              className={`input-field ${error ? "error" : ""}`}
              placeholder="0.00"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(""); }}
              required
            />
            {error && <span className="input-error">{error}</span>}

            {/* Quick Step Chips */}
            <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
              {[100, 500, 1000, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.75rem", fontWeight: 600 }}
                  onClick={() => setAmount(((parseFloat(amount) || 0) + preset).toString())}
                >
                  +₹{preset.toLocaleString("en-IN")}
                </button>
              ))}
              {remaining > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-primary)" }}
                  onClick={() => setAmount(remaining.toString())}
                >
                  Fill Remaining (₹{remaining.toLocaleString("en-IN")})
                </button>
              )}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group">
              <label htmlFor="deposit-date" className="input-label">Deposit Date</label>
              <input
                id="deposit-date"
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="deposit-method" className="input-label">Payment Source</label>
              <select
                id="deposit-method"
                className="input-field"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI Payment</option>
                <option value="Auto-Deduct">Salary Auto-Deduct</option>
                <option value="Cash Deposit">Cash Deposit</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="deposit-notes" className="input-label">Deposit Note (Optional)</label>
            <input
              id="deposit-notes"
              type="text"
              className="input-field"
              placeholder="e.g. July monthly contribution, Freelance bonus..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: "#3EC3D5", borderColor: "#3EC3D5", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
              <FaCreditCard size={14} /> Deposit Funds
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
