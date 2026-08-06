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

export default function BudgetPage() {
  const { budget, setBudget, rechargeBudget, getMonthlyExpense, showToast } =
    useStore();
  const monthlyExpense = getMonthlyExpense();
  const [inputValue, setInputValue] = useState(budget.toString());
  const [saved, setSaved] = useState(false);

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
        maxWidth: 640,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <div className="page-header">
        <div>
          <h2 className="page-title">Budget Settings</h2>
          <p className="page-subtitle">Set and track your monthly spending limit</p>
        </div>
      </div>

      {/* Budget Ring Card (Matching Reference Picture) */}
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

        {/* Metrics List (Spent, Bar, Budget, Remaining) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.875rem",
            textAlign: "left",
            marginTop: "1.5rem",
            maxWidth: 440,
            margin: "1.5rem auto 0",
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
          Set Monthly Budget
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
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 700 }}>Budget Tips</h3>
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
              Set a realistic budget based on your last 3 months of spending
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
            <FaArrowTrendDown size={14} color="#FF5460" />
            <span>
              Review your top spending categories on the Analytics page to find savings
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
            <FaBell size={14} color="#7C3AED" />
            <span>Get alerted when you reach 70% and 90% of your budget</span>
          </div>
        </div>
      </div>
    </div>
  );
}
