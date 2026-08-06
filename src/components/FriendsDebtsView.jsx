// src/components/FriendsDebtsView.jsx
import React, { useState } from "react";
import useStore from "../store/useStore";
import { formatCurrency } from "../utils/format";
import { FaHandshake, FaPlus, FaCheck, FaTrash, FaCheckDouble, FaArrowUpRightFromSquare } from "react-icons/fa6";

export default function FriendsDebtsView() {
  const store = useStore();

  const debts = store.debts || [
    { id: "debt-1", friendName: "Rahul Sharma", amount: 5000, returnedAmount: 2000, borrowDate: "2026-07-10", dueDate: "2026-08-15", status: "Partially Paid", notes: "Weekend getaway expense split" },
    { id: "debt-2", friendName: "Priya Patel", amount: 2500, returnedAmount: 0, borrowDate: "2026-07-20", dueDate: "2026-08-05", status: "Pending", notes: "Concert tickets advance" }
  ];

  const addFriendDebt = store.addFriendDebt || (() => {});
  const recordDebtReturn = store.recordDebtReturn || (() => {});
  const deleteFriendDebt = store.deleteFriendDebt || (() => {});

  // Form state for adding new borrowed money
  const [friendName, setFriendName] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  // Payback Modal state
  const [selectedDebtId, setSelectedDebtId] = useState(null);
  const [paybackInput, setPaybackInput] = useState("");
  const [recordExpense, setRecordExpense] = useState(true);

  // Status Filter state
  const [filterStatus, setFilterStatus] = useState("All");

  const handleAddDebt = (e) => {
    e.preventDefault();
    const amount = parseFloat(amountInput);
    if (!friendName.trim() || isNaN(amount) || amount <= 0) return;

    addFriendDebt({
      friendName: friendName.trim(),
      amount,
      borrowDate: borrowDate || new Date().toISOString().slice(0, 10),
      dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      notes: notes.trim()
    });

    setFriendName("");
    setAmountInput("");
    setNotes("");
  };

  const handlePaybackSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(paybackInput);
    if (!selectedDebtId || isNaN(amount) || amount <= 0) return;

    recordDebtReturn(selectedDebtId, amount, recordExpense);
    setSelectedDebtId(null);
    setPaybackInput("");
  };

  // Calculations
  const debtList = debts || [];
  const totalBorrowed = debtList.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalReturned = debtList.reduce((sum, d) => sum + (d.returnedAmount || 0), 0);
  const totalPending = totalBorrowed - totalReturned;
  const activeDebtsCount = debtList.filter(d => d.status !== "Settled").length;

  const filteredDebts = debtList.filter(d => {
    if (filterStatus === "All") return true;
    return d.status === filterStatus;
  });

  const selectedDebt = debtList.find(d => d.id === selectedDebtId);

  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "2rem" }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>Friends & Borrowed Money Ledger</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
          Track money received from friends and manage payments returned back to them.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        
        <div className="card card-p" style={{ borderLeft: "4px solid #3EC3D5" }}>
          <div style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", fontWeight: 700 }}>
            Total Borrowed
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: "0.25rem", color: "#3EC3D5" }}>
            {formatCurrency(totalBorrowed)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Money received from friends
          </div>
        </div>

        <div className="card card-p" style={{ borderLeft: "4px solid #41DC65" }}>
          <div style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", fontWeight: 700 }}>
            Total Returned
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: "0.25rem", color: "#41DC65" }}>
            {formatCurrency(totalReturned)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Paid back to friends
          </div>
        </div>

        <div className="card card-p" style={{ borderLeft: "4px solid #3B82F6" }}>
          <div style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", fontWeight: 700 }}>
            Pending Balance
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: "0.25rem", color: "#3B82F6" }}>
            {formatCurrency(totalPending)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            {activeDebtsCount} active record{activeDebtsCount === 1 ? "" : "s"}
          </div>
        </div>

      </div>

      {/* Main Grid: Form + List */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }} id="friends-debts-grid">
        
        {/* Left Column: Record Borrowed Money Form */}
        <div className="card card-p" style={{ display: "flex", flexDirection: "column", gap: "1rem", height: "fit-content" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <FaHandshake size={20} color="#3EC3D5" /> Record Borrowed Money
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            Log an amount you received from a friend to return back later.
          </p>

          <form onSubmit={handleAddDebt} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
            <div className="form-group">
              <label htmlFor="friend-name" className="input-label">Friend's Name</label>
              <input
                id="friend-name"
                type="text"
                className="input-field"
                placeholder="e.g. Rahul, Priya, Alex"
                value={friendName}
                onChange={e => setFriendName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="borrow-amount" className="input-label">Amount Borrowed (INR / ₹)</label>
              <input
                id="borrow-amount"
                type="number"
                step="100"
                min="0"
                className="input-field"
                placeholder="0.00"
                value={amountInput}
                onChange={e => setAmountInput(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className="form-group">
                <label htmlFor="borrow-date" className="input-label">Date Received</label>
                <input
                  id="borrow-date"
                  type="date"
                  className="input-field"
                  value={borrowDate}
                  onChange={e => setBorrowDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="due-date" className="input-label">Payback Due Date</label>
                <input
                  id="due-date"
                  type="date"
                  className="input-field"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="borrow-notes" className="input-label">Notes / Reason (Optional)</label>
              <input
                id="borrow-notes"
                type="text"
                className="input-field"
                placeholder="e.g. Concert ticket, dinner split"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: "0.5rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
              <FaHandshake size={18} /> Save Borrow Record
            </button>
          </form>
        </div>

        {/* Right Column: Debt History & Payback List */}
        <div className="card card-p" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {/* Header & Filter Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Debts & Return Status</h2>

            <div style={{ display: "flex", gap: "0.35rem" }}>
              {["All", "Pending", "Partially Paid", "Settled"].map(st => (
                <button
                  key={st}
                  type="button"
                  className={`chip ${filterStatus === st ? "active" : ""}`}
                  style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                  onClick={() => setFilterStatus(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          {filteredDebts.length === 0 ? (
            <div className="empty-state" style={{ padding: "3rem 1rem", textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: "rgba(0,179,134,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem",
              }}>
                <FaHandshake size={32} color="#3EC3D5" />
              </div>
              <div className="empty-title" style={{ fontWeight: 800, fontSize: "1.1rem" }}>No Debt Records Found</div>
              <div className="empty-desc" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                Add money borrowed from a friend on the left to track paybacks.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {filteredDebts.map(d => {
                const percent = Math.min(100, Math.round(((d.returnedAmount || 0) / (d.amount || 1)) * 100));
                const remaining = (d.amount || 0) - (d.returnedAmount || 0);
                const isSettled = d.status === "Settled";
                const isPartial = d.status === "Partially Paid";

                const badgeBg = isSettled ? "rgba(65, 220, 101, 0.15)" : isPartial ? "rgba(62, 195, 213, 0.15)" : "rgba(255, 84, 96, 0.15)";
                const badgeColor = isSettled ? "#41DC65" : isPartial ? "#3EC3D5" : "#FF5460";

                return (
                  <div
                    key={d.id}
                    style={{
                      padding: "1.1rem",
                      borderRadius: "0.75rem",
                      border: "1px solid var(--color-border)",
                      background: "var(--bg-surface)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontWeight: 800, fontSize: "1.05rem" }}>{d.friendName}</span>
                          <span style={{
                            padding: "0.2rem 0.5rem",
                            borderRadius: "0.35rem",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            backgroundColor: badgeBg,
                            color: badgeColor
                          }}>
                            {d.status}
                          </span>
                        </div>
                        {d.notes && (
                          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                            {d.notes}
                          </div>
                        )}
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                          Received: {d.borrowDate} • Due: {d.dueDate}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#FF5460" }}>
                          {formatCurrency(d.amount)}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#41DC65", fontWeight: 600 }}>
                          {formatCurrency(d.returnedAmount || 0)} returned
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-bar" style={{ height: "8px", borderRadius: "999px", backgroundColor: "#E1E0E6" }}>
                      <div
                        className="fill"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: isSettled ? "#41DC65" : isPartial ? "#3EC3D5" : "#FF5460",
                          backgroundImage: "none",
                          borderRadius: "999px"
                        }}
                      />
                    </div>

                    {/* Bottom Action Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.2rem" }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600, color: remaining > 0 ? "#FF5460" : "#41DC65", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                        {remaining > 0 ? `Remaining to return: ${formatCurrency(remaining)}` : <><FaCheckDouble size={13} color="#41DC65" /> Fully Settled</>}
                      </div>

                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {!isSettled && (
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                            onClick={() => {
                              setSelectedDebtId(d.id);
                              setPaybackInput(remaining.toString());
                            }}
                          >
                            <FaArrowUpRightFromSquare size={11} /> Return Money
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-secondary"
                          style={{ padding: "0.3rem 0.6rem", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          onClick={() => deleteFriendDebt(d.id)}
                          title="Delete debt record"
                        >
                          <FaTrash size={12} color="#EF4444" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Payback Return Modal */}
      {selectedDebtId && selectedDebt && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div className="card card-p" style={{ maxWidth: "420px", width: "100%", borderRadius: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FaHandshake size={20} color="#3EC3D5" /> Return Money to {selectedDebt.friendName}
              </h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setSelectedDebtId(null)}>✕</button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              Total Borrowed: <strong>{formatCurrency(selectedDebt.amount)}</strong> • Remaining Owed: <strong>{formatCurrency(selectedDebt.amount - selectedDebt.returnedAmount)}</strong>
            </p>

            <form onSubmit={handlePaybackSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="input-label">Payback Amount (INR / ₹)</label>
                <input
                  type="number"
                  step="100"
                  className="input-field"
                  placeholder="0.00"
                  value={paybackInput}
                  onChange={e => setPaybackInput(e.target.value)}
                  max={selectedDebt.amount - selectedDebt.returnedAmount}
                  min="0"
                  required
                />
              </div>

              {/* Quick payback percentage buttons */}
              <div>
                <span className="input-label">Quick Amount</span>
                <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.3rem" }}>
                  {[0.25, 0.5, 1].map(ratio => {
                    const remainingOwed = selectedDebt.amount - selectedDebt.returnedAmount;
                    const val = Math.round(remainingOwed * ratio);
                    return (
                      <button
                        key={ratio}
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => setPaybackInput(val.toString())}
                      >
                        {ratio === 1 ? "Full (100%)" : `${ratio * 100}% (${val})`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                <input
                  id="record-exp-check"
                  type="checkbox"
                  checked={recordExpense}
                  onChange={e => setRecordExpense(e.target.checked)}
                />
                <label htmlFor="record-exp-check" style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", cursor: "pointer" }}>
                  Record payback as an expense transaction
                </label>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedDebtId(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}>
                  <FaCheck size={14} /> Confirm Payback
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          #friends-debts-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
