// src/components/WithdrawModal.jsx
import React, { useState, useEffect } from "react";
import { FaArrowRightFromBracket, FaTriangleExclamation } from "react-icons/fa6";

export default function WithdrawModal({ isOpen, onClose, onWithdraw, goal }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
    setReason("");
    setConfirmed(false);
    setError("");
  }, [goal, isOpen]);

  if (!isOpen || !goal) return null;

  const maxWithdraw = goal.current || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid withdrawal amount > 0");
      return;
    }
    if (numAmount > maxWithdraw) {
      setError(`Cannot withdraw more than available saved balance (₹${maxWithdraw.toLocaleString("en-IN")})`);
      return;
    }
    if (!confirmed) {
      setError("Please check the confirmation checkbox to proceed");
      return;
    }

    onWithdraw(goal.id, numAmount, date, reason);
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
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FaArrowRightFromBracket size={20} color="#EF4444" />
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>Withdraw Funds</h3>
              <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{goal.name}</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        {/* Available Balance Box */}
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Available Balance</span>
            <strong style={{ fontSize: "1.1rem", color: "var(--color-danger)" }}>₹{maxWithdraw.toLocaleString("en-IN")}</strong>
          </div>
          <FaTriangleExclamation size={20} color="#EF4444" />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Withdrawal Amount */}
          <div className="form-group">
            <label htmlFor="withdraw-amount" className="input-label">Withdrawal Amount (INR / ₹)</label>
            <input
              id="withdraw-amount"
              type="number"
              step="100"
              min="0"
              max={maxWithdraw}
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
              {maxWithdraw > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-danger)" }}
                  onClick={() => setAmount(maxWithdraw.toString())}
                >
                  Withdraw All (₹{maxWithdraw.toLocaleString("en-IN")})
                </button>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="form-group">
            <label htmlFor="withdraw-date" className="input-label">Withdrawal Date</label>
            <input
              id="withdraw-date"
              type="date"
              className="input-field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Reason */}
          <div className="form-group">
            <label htmlFor="withdraw-reason" className="input-label">Reason for Withdrawal</label>
            <input
              id="withdraw-reason"
              type="text"
              className="input-field"
              placeholder="e.g. Emergency medical expense, Planned purchase..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          {/* Confirmation Checkbox */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              id="withdraw-confirm"
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            <label htmlFor="withdraw-confirm" style={{ fontSize: "0.85rem", color: "var(--color-text-primary)", cursor: "pointer", userSelect: "none" }}>
              I confirm withdrawing ₹{parseFloat(amount) || 0} from this goal.
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
              <FaArrowRightFromBracket size={14} /> Confirm Withdrawal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
