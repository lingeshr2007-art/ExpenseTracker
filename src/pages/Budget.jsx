// src/pages/Budget.jsx
import React, { useState } from "react";
import useStore from "../store/useStore";
import { formatCurrency } from "../utils/format";
import {
  FaFloppyDisk,
  FaLightbulb,
  FaClipboardList,
  FaBullseye,
  FaArrowTrendDown,
  FaBell,
  FaBolt,
} from "react-icons/fa6";

const DEFAULT_ALLOCATIONS = [
  { id: "food", name: "Food & Dining", pct: 30, color: "#3EC3D5" },
  { id: "housing", name: "Housing & Rent", pct: 25, color: "#4F5DED" },
  { id: "shopping", name: "Shopping & Lifestyle", pct: 15, color: "#F59E0B" },
  { id: "transport", name: "Transportation", pct: 10, color: "#8B5CF6" },
  { id: "bills", name: "Bills & Utilities", pct: 10, color: "#EC4899" },
  { id: "savings", name: "Emergency & Savings", pct: 10, color: "#2E9E6D" },
];

export default function BudgetPage() {
  const { budget, setBudget, rechargeBudget, getMonthlyExpense, showToast, transactions } =
    useStore();
  const monthlyExpense = getMonthlyExpense();
  const [inputValue, setInputValue] = useState(budget.toString());
  const [saved, setSaved] = useState(false);

  const [allocations, setAllocations] = useState(() => {
    try {
      const savedAlloc = localStorage.getItem("nidhi_budget_allocations");
      return savedAlloc ? JSON.parse(savedAlloc) : DEFAULT_ALLOCATIONS;
    } catch (e) {
      return DEFAULT_ALLOCATIONS;
    }
  });

  const safeTx = Array.isArray(transactions) ? transactions.filter(Boolean) : [];

  const getCategorySpent = (categoryName, id) => {
    const normTarget = (categoryName || "").toLowerCase();
    
    return safeTx
      .filter((t) => {
        if (!t || t.type !== "expense") return false;
        const cat = (t.category || "").toLowerCase();
        if (!cat) return false;

        if (cat === normTarget) return true;
        if (normTarget.includes(cat) || cat.includes(normTarget)) return true;

        if (id === "food" || normTarget.includes("food")) {
          return cat.includes("food") || cat.includes("dining") || cat.includes("grocery") || cat.includes("restaurant");
        }
        if (id === "housing" || normTarget.includes("housing")) {
          return cat.includes("housing") || cat.includes("rent") || cat.includes("mortgage") || cat.includes("home");
        }
        if (id === "shopping" || normTarget.includes("shopping")) {
          return cat.includes("shopping") || cat.includes("lifestyle") || cat.includes("cloth") || cat.includes("store");
        }
        if (id === "transport" || normTarget.includes("transport")) {
          return cat.includes("transport") || cat.includes("travel") || cat.includes("cab") || cat.includes("fuel") || cat.includes("bus");
        }
        if (id === "bills" || normTarget.includes("bills")) {
          return cat.includes("bill") || cat.includes("util") || cat.includes("electricity") || cat.includes("water") || cat.includes("phone") || cat.includes("internet");
        }
        if (id === "savings" || normTarget.includes("savings")) {
          return cat.includes("save") || cat.includes("saving") || cat.includes("emergency") || cat.includes("invest");
        }

        return false;
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  const handlePctChange = (id, newPct) => {
    const updated = allocations.map((item) =>
      item.id === id ? { ...item, pct: Number(newPct) } : item
    );
    setAllocations(updated);
    try {
      localStorage.setItem("nidhi_budget_allocations", JSON.stringify(updated));
    } catch (e) {}
    if (showToast) {
      showToast("Category allocation updated ✓");
    }
  };

  const totalAllocatedPct = allocations.reduce((acc, curr) => acc + curr.pct, 0);

  const handleRecharge = (topUp) => {
    if (rechargeBudget) {
      rechargeBudget(topUp);
    } else {
      setBudget(budget + topUp);
    }
  };

  const budgetPercent =
    budget > 0 ? Math.round((monthlyExpense / budget) * 100) : 0;
  const remaining = budget - monthlyExpense;

  const handleSave = () => {
    const val = Number(inputValue);
    if (isNaN(val) || val < 0) return;
    setBudget(val);
    showToast("Budget updated ✓");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Ring params
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, budgetPercent);
  const offset = circumference * (1 - clampedPercent / 100);
  const ringColor =
    budgetPercent >= 90 ? "#D65A5A" : budgetPercent >= 70 ? "#D9A441" : "#4F5DED";

  return (
    <div
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        width: "100%",
      }}
    >
      <div className="page-header" style={{ marginBottom: "0.5rem" }}>
        <div>
          <h2 className="page-title">Budget Management & Planning</h2>
          <p className="page-subtitle">Set monthly spending limits, monitor progress, and recharge allocations</p>
        </div>
      </div>

      {/* 2-Column Responsive Dashboard Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        
        {/* ── LEFT COLUMN: RING GAUGE & BUDGET INPUT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Budget Ring Card */}
          <div
            className="card card-p animate-in"
            style={{
              textAlign: "center",
              padding: "2rem 1.5rem",
              borderRadius: "1.25rem",
            }}
          >
            <div className="ring-container" style={{ margin: "0 auto 1.5rem" }}>
              <svg className="ring-svg" width={200} height={200}>
                <circle
                  className="ring-track"
                  cx={100}
                  cy={100}
                  r={radius}
                  strokeWidth={14}
                  fill="none"
                />
                <circle
                  className="ring-fill"
                  cx={100}
                  cy={100}
                  r={radius}
                  strokeWidth={14}
                  stroke={ringColor}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  fill="none"
                  style={
                    budgetPercent >= 100
                      ? { filter: "drop-shadow(0 0 6px rgba(255, 84, 96, 0.5))" }
                      : {}
                  }
                />
              </svg>
              <div className="ring-label">
                <div
                  style={{
                    fontSize: "2.25rem",
                    fontWeight: 800,
                    lineHeight: 1,
                    color: budgetPercent >= 100 ? "#FF5460" : "var(--color-text)",
                  }}
                >
                  {budgetPercent}%
                </div>
                <div
                  style={{
                    fontSize: "0.8125rem",
                    color: budgetPercent >= 100 ? "#FF5460" : "var(--color-text-muted)",
                    marginTop: "0.375rem",
                    fontWeight: 700,
                  }}
                >
                  {budgetPercent >= 100 ? "exceeded!" : "used"}
                </div>
              </div>
            </div>

            {/* Metrics List */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.875rem",
                textAlign: "left",
                marginTop: "1.5rem",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>
                  Spent
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    color: "var(--color-text)",
                    fontSize: "0.9375rem",
                  }}
                >
                  {formatCurrency(monthlyExpense)}
                </span>
              </div>

              {/* Progress bar line */}
              <div
                className="progress-bar"
                style={{
                  height: "8px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(148, 163, 184, 0.2)",
                  overflow: "hidden",
                }}
              >
                <div
                  className="fill"
                  style={{
                    width: `${Math.min(budgetPercent, 100)}%`,
                    height: "100%",
                    backgroundColor: ringColor,
                    borderRadius: "999px",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>
                  Budget
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    color: "var(--color-text)",
                    fontSize: "0.9375rem",
                  }}
                >
                  {formatCurrency(budget)}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>
                  Remaining
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    color: remaining < 0 ? "#FF5460" : "#41DC65",
                    fontSize: "0.9375rem",
                  }}
                >
                  {remaining < 0
                    ? `-${formatCurrency(Math.abs(remaining))}`
                    : formatCurrency(remaining)}
                </span>
              </div>
            </div>
          </div>

          {/* Set Budget Input Card */}
          <div
            className="card card-p animate-in"
            style={{ animationDelay: "0.15s", borderRadius: "1.25rem" }}
          >
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "1rem" }}>
              Set Monthly Budget Limit
            </h3>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="input-label" htmlFor="budget-input">
                  Amount (INR / ₹)
                </label>
                <input
                  id="budget-input"
                  className="input-field"
                  type="number"
                  step="100"
                  min="0"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
              </div>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSave}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  borderRadius: "9999px",
                }}
              >
                <FaFloppyDisk size={16} />
                {saved ? "Saved!" : "Save"}
              </button>
            </div>

            {/* Quick Presets */}
            <div style={{ marginTop: "1rem" }}>
              <span className="input-label">Quick Set Target Cap</span>
              <div
                style={{
                  display: "flex",
                  gap: "0.375rem",
                  marginTop: "0.375rem",
                  flexWrap: "wrap",
                }}
              >
                {[10000, 25000, 50000, 75000, 100000, 150000].map((val) => (
                  <button
                    key={val}
                    className={`chip ${Number(inputValue) === val ? "active" : ""}`}
                    onClick={() => setInputValue(val.toString())}
                  >
                    ₹{val.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Recharge Top-Up */}
            <div
              style={{
                marginTop: "1.25rem",
                paddingTop: "1rem",
                borderTop: "1px dashed var(--border-color)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  marginBottom: "0.5rem",
                }}
              >
                <FaBolt size={14} color="#3EC3D5" />
                <span className="input-label" style={{ marginBottom: 0 }}>
                  Top Up / Recharge Budget
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                {[2000, 5000, 10000, 25000].map((topUp) => (
                  <button
                    key={topUp}
                    className="btn btn-secondary"
                    style={{
                      padding: "0.35rem 0.75rem",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      borderRadius: "9999px",
                    }}
                    onClick={() => handleRecharge(topUp)}
                  >
                    +₹{topUp.toLocaleString("en-IN")} Recharge
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: CATEGORY ALLOCATIONS & TIPS ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Category Budget Breakdown & Recommendations */}
          <div
            className="card card-p animate-in"
            style={{ borderRadius: "1.25rem" }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Category Budget Allocations</span>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.2rem 0.55rem",
                  borderRadius: "9999px",
                  backgroundColor: totalAllocatedPct === 100 ? "rgba(46, 158, 109, 0.12)" : "rgba(245, 158, 11, 0.12)",
                  color: totalAllocatedPct === 100 ? "#2E9E6D" : "#D97706",
                  border: totalAllocatedPct === 100 ? "1px solid rgba(46, 158, 109, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)"
                }}
              >
                Total: {totalAllocatedPct}%
              </span>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {allocations.map((item) => {
                const spent = getCategorySpent(item.name, item.id);
                const allocated = Math.round((budget * item.pct) / 100);
                const spentPctOfAllocated = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : (spent > 0 ? 100 : 0);
                const isOverCategory = allocated > 0 && spent > allocated;

                return (
                  <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.825rem", fontWeight: 600 }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ color: "var(--color-text-primary)" }}>{item.name}</span>
                        <span style={{ fontSize: "0.725rem", color: isOverCategory ? "#FF5460" : "var(--color-text-muted)", fontWeight: 500 }}>
                          {allocated > 0 
                            ? `Spent: ${formatCurrency(spent)} of ${formatCurrency(allocated)} cap` 
                            : `Spent: ${formatCurrency(spent)}`}
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ color: isOverCategory ? "#FF5460" : "var(--color-text-primary)", fontWeight: 800, fontSize: "0.9rem" }}>
                          {formatCurrency(spent)}
                        </span>
                        
                        <select
                          value={item.pct}
                          onChange={(e) => handlePctChange(item.id, e.target.value)}
                          style={{
                            padding: "0.2rem 0.45rem",
                            borderRadius: "8px",
                            border: "1px solid var(--color-border, #CBD5E1)",
                            backgroundColor: "var(--color-surface, #FFFFFF)",
                            color: item.color,
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            outline: "none",
                            cursor: "pointer",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                          }}
                          title={`Select target percentage for ${item.name}`}
                        >
                          {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100].map((p) => (
                            <option key={p} value={p}>
                              {p}% Target
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ width: "100%", height: "7px", backgroundColor: "rgba(148, 163, 184, 0.15)", borderRadius: "999px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${allocated > 0 ? spentPctOfAllocated : (spent > 0 ? 100 : item.pct)}%`,
                          height: "100%",
                          backgroundColor: isOverCategory ? "#FF5460" : item.color,
                          borderRadius: "999px",
                          transition: "width 0.3s ease"
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Budget Tips Card */}
          <div
            className="card card-p animate-in"
            style={{ animationDelay: "0.25s", borderRadius: "1.25rem" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <FaLightbulb size={16} color="#7C3AED" />
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700 }}>Smart Budgeting Guidelines</h3>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                fontSize: "0.8125rem",
                color: "var(--color-text-muted)",
              }}
            >
              <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
                <FaClipboardList size={14} color="#7C3AED" />
                <span>
                  Follow the <strong>50/30/20 rule</strong>: 50% needs, 30% wants, 20% savings
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
                <FaBullseye size={14} color="#3EC3D5" />
                <span>
                  Set a realistic budget based on your last 3 months of average spending
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
                <FaArrowTrendDown size={14} color="#FF5460" />
                <span>
                  Review your top spending categories on Analytics to locate savings opportunities
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
                <FaBell size={14} color="#7C3AED" />
                <span>Get automated notifications when spending hits 70% and 90% of budget</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
