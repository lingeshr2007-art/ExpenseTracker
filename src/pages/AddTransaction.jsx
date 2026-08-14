// src/pages/AddTransaction.jsx
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useStore from "../store/useStore";
import { CategoryIcon } from "../utils/categoryIcons";
import { FaCheck, FaArrowLeft, FaCircleExclamation, FaTriangleExclamation } from "react-icons/fa6";

export default function AddTransaction() {
  const { categories, addTransaction, showToast, getTotals, getMonthlyExpense, budget } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editId = searchParams.get("edit");
  const initialType = searchParams.get("type");
  const existingTx = editId ? useStore.getState().transactions.find((t) => t.id === editId) : null;

  const [description, setDescription] = useState(existingTx?.description || "");
  const [amount, setAmount] = useState(existingTx?.amount?.toString() || "");
  const [type, setType] = useState(existingTx?.type || (initialType === "income" ? "income" : "expense"));
  const [category, setCategory] = useState(existingTx?.category || (type === "income" ? "Salary" : "Food"));
  const [date, setDate] = useState(existingTx?.date || new Date().toISOString().slice(0, 10));
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const totals = getTotals();
  const monthlyExp = getMonthlyExpense();

  const numAmount = Number(amount) || 0;
  const oldAmount = existingTx ? existingTx.amount : 0;
  const oldType = existingTx ? existingTx.type : "";

  const projectedIncome = totals.income + (type === "income" ? numAmount - oldAmount : (oldType === "income" ? -oldAmount : 0));
  const projectedExpense = totals.expense + (type === "expense" ? numAmount - oldAmount : (oldType === "expense" ? -oldAmount : 0));
  const projectedMonthlyExpense = monthlyExp + (type === "expense" ? numAmount - oldAmount : (oldType === "expense" ? -oldAmount : 0));

  const isExceedingIncome = type === "expense" && numAmount > 0 && projectedIncome > 0 && projectedExpense > projectedIncome;
  const isExceedingBudget = type === "expense" && numAmount > 0 && budget > 0 && projectedMonthlyExpense > budget;

  const validate = () => {
    const errs = {};
    if (!description.trim()) errs.description = "Required";
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) errs.amount = "Enter a valid amount";
    if (!date) errs.date = "Required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    if (existingTx) {
      useStore.getState().updateTransaction({
        ...existingTx,
        description: description.trim(),
        amount: Number(amount),
        type,
        category,
        date,
      });
      showToast("Transaction updated ✓");
    } else {
      addTransaction({
        description: description.trim(),
        amount: Number(amount),
        type,
        category,
        date,
      });
      showToast("Transaction added ✓");
    }

    setSubmitted(true);
    setTimeout(() => navigate("/transactions"), 800);
  };

  if (submitted) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
        <div className="card card-p animate-in" style={{ textAlign: "center", padding: "3rem 2rem", maxWidth: 400 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", background: "rgba(65, 220, 101, 0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem",
          }}>
            <FaCheck size={28} color="#41DC65" />
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            {existingTx ? "Updated!" : "Added!"}
          </h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
            Redirecting to transactions...
          </p>
        </div>
      </div>
    );
  }

  const incomeCategories = ["Salary", "Investment", "Other"];
  const expenseCategories = categories.map((c) => c.name).filter((c) => !incomeCategories.includes(c) || c === "Other");
  const availableCategories = type === "income" ? incomeCategories : expenseCategories;

  const storeTransactions = useStore((state) => state.transactions || []);
  const recentTx = storeTransactions.slice(0, 4);

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%" }}>
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <div>
          <h2 className="page-title">{existingTx ? "Edit Transaction" : "Add New Transaction"}</h2>
          <p className="page-subtitle">
            {existingTx ? "Update the transaction details below" : "Record a new income or expense item"}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.4rem 0.85rem",
            borderRadius: "0.5rem",
            border: "1px solid #E8E8EA",
            backgroundColor: "#FFFFFF",
            color: "#1A1A1E",
            fontSize: "0.8125rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <FaArrowLeft size={13} /> Back
        </button>
      </div>

      {/* 2-Column Dashboard Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        
        {/* ── LEFT COLUMN: ENTRY FORM ── */}
        <div className="card card-p animate-in">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Type Toggle */}
            <div className="form-group">
              <label className="input-label">Type</label>
              <div className="type-toggle">
                <button
                  type="button"
                  className={`type-btn income ${type === "income" ? "active" : ""}`}
                  onClick={() => {
                    setType("income");
                    setCategory("Salary");
                  }}
                >
                  Income
                </button>
                <button
                  type="button"
                  className={`type-btn expense ${type === "expense" ? "active" : ""}`}
                  onClick={() => {
                    setType("expense");
                    setCategory("Food");
                  }}
                >
                  Expense
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="input-label" htmlFor="description">Description</label>
              <input
                id="description"
                className={`input-field ${errors.description ? "error" : ""}`}
                type="text"
                placeholder="e.g. Grocery shopping, Monthly salary..."
                value={description}
                onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: "" })); }}
                autoFocus
              />
              {errors.description && <span className="input-error">{errors.description}</span>}
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="input-label" htmlFor="amount">Amount (INR / ₹)</label>
              <input
                id="amount"
                className={`input-field ${errors.amount ? "error" : ""}`}
                type="number"
                step="100"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: "" })); }}
              />
              {errors.amount && <span className="input-error">{errors.amount}</span>}

              {/* Quick Amount Step Chips */}
              <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                {[100, 500, 1000, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", fontWeight: 700 }}
                    onClick={() => {
                      const current = Number(amount) || 0;
                      setAmount((current + preset).toString());
                      setErrors((p) => ({ ...p, amount: "" }));
                    }}
                  >
                    +₹{preset.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Warning Alert Banners */}
            {isExceedingIncome && (
              <div style={{
                background: "#FFF1F2",
                border: "1.5px solid #F43F5E",
                borderRadius: "0.625rem",
                padding: "0.75rem 1rem",
                color: "#E11D48",
                fontSize: "0.8125rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <FaCircleExclamation size={20} color="#EF4444" />
                <div>
                  <div>Income Exceeded Warning!</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 500, opacity: 0.9 }}>
                    Total expenses (₹{projectedExpense.toLocaleString("en-IN")}) will exceed total income (₹{projectedIncome.toLocaleString("en-IN")}) by ₹{(projectedExpense - projectedIncome).toLocaleString("en-IN")}!
                  </div>
                </div>
              </div>
            )}

            {isExceedingBudget && !isExceedingIncome && (
              <div style={{
                background: "#FFFBEB",
                border: "1.5px solid #FDE68A",
                borderRadius: "0.625rem",
                padding: "0.75rem 1rem",
                color: "#D97706",
                fontSize: "0.8125rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <FaTriangleExclamation size={20} color="#F59E0B" />
                <div>
                  <div>Budget Limit Exceeded Warning!</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 500, opacity: 0.9 }}>
                    Monthly expenses (₹{projectedMonthlyExpense.toLocaleString("en-IN")}) will exceed your monthly budget (₹{budget.toLocaleString("en-IN")}) by ₹{(projectedMonthlyExpense - budget).toLocaleString("en-IN")}!
                  </div>
                </div>
              </div>
            )}

            {/* Category */}
            <div className="form-group">
              <label className="input-label" htmlFor="category">Category</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {availableCategories.map((cat) => {
                  const catObj = categories.find((c) => c.name === cat);
                  const isActive = category === cat;
                  const activeColor = type === "income" ? "#41DC65" : "#FF5460";
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`chip ${isActive ? "active" : ""}`}
                      style={isActive ? { background: `${activeColor}18`, borderColor: activeColor, color: activeColor, fontWeight: 700 } : {}}
                      onClick={() => setCategory(cat)}
                    >
                      <CategoryIcon name={catObj?.icon} size={14} />
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="input-label" htmlFor="date">Date</label>
              <input
                id="date"
                className={`input-field ${errors.date ? "error" : ""}`}
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: "" })); }}
              />
              {errors.date && <span className="input-error">{errors.date}</span>}
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: "0.5rem", display: "inline-flex", alignItems: "center", gap: "0.375rem", justifyContent: "center" }}>
              <FaCheck size={16} />
              {existingTx ? "Update Transaction" : "Save Transaction"}
            </button>
          </form>
        </div>

        {/* ── RIGHT COLUMN: LIVE FINANCIAL IMPACT & RECENT FEED ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Live Impact Card */}
          <div className="card card-p animate-in" style={{ borderRadius: "1.25rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--color-text-primary)" }}>
              Live Financial Impact
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Current Net Balance</span>
                <span style={{ fontWeight: 700 }}>₹{totals.balance.toLocaleString("en-IN")}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Entry Amount</span>
                <span style={{ fontWeight: 700, color: type === "income" ? "#2E9E6D" : "#D65A5A" }}>
                  {type === "income" ? "+" : "-"}₹{numAmount.toLocaleString("en-IN")}
                </span>
              </div>

              <hr style={{ border: 0, borderTop: "1px solid var(--color-border, #E8E8EA)" }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.925rem" }}>
                <span style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>Projected Balance</span>
                <span style={{ fontWeight: 800, fontSize: "1.1rem", color: (totals.balance + (type === "income" ? numAmount : -numAmount)) < 0 ? "#FF5460" : "#4F5DED" }}>
                  ₹{(totals.balance + (type === "income" ? numAmount : -numAmount)).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Transactions Feed */}
          <div className="card card-p animate-in" style={{ borderRadius: "1.25rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Recent Activity</span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Last 4 Entries</span>
            </h3>

            {recentTx.length === 0 ? (
              <p style={{ fontSize: "0.825rem", color: "var(--color-text-muted)" }}>No recent transactions found.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {recentTx.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "10px",
                      backgroundColor: "var(--color-bg, #FAFAFA)",
                      border: "1px solid var(--color-border, #E8E8EA)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-primary)" }}>{tx.description}</div>
                      <div style={{ fontSize: "0.725rem", color: "var(--color-text-muted)" }}>{tx.category} • {tx.date}</div>
                    </div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 800, color: tx.type === "income" ? "#2E9E6D" : "#D65A5A" }}>
                      {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
