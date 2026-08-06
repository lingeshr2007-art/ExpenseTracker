// src/components/DashboardView.tsx
import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { calculateHealthScore, generateInsights } from "../utils/aiEngine";
import type { Transaction } from "../types";
import { FaReceipt, FaImage } from "react-icons/fa6";

interface DashboardViewProps {
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export default function DashboardView({ onAddTransaction, onEditTransaction }: DashboardViewProps) {
  const { transactions, accounts, budgets, currency } = useApp();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(val);
  };

  const nowObj = new Date();
  const currentMonth = `${nowObj.getFullYear()}-${String(nowObj.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM

  // Top metric totals for current month
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if ((t.date || "").startsWith(currentMonth)) {
        if (t.type === "income") income += Number(t.amount) || 0;
        if (t.type === "expense") expense += Number(t.amount) || 0;
      }
    });

    return {
      income,
      expense,
      balance: income - expense,
      savingsRate: income > 0 ? parseFloat(((income - expense) / income * 100).toFixed(1)) : 0,
    };
  }, [transactions, currentMonth]);

  // Chart 1: Income vs Expense Trend (Last 6 Months)
  const trendData = useMemo(() => {
    const now = new Date();
    const months: { month: string; label: string; Income: number; Expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${y}-${m}`;
      months.push({ month: key, label: d.toLocaleDateString(undefined, { month: 'short' }), Income: 0, Expense: 0 });
    }
    
    transactions.forEach(t => {
      const txMonth = (t.date || "").slice(0, 7);
      const match = months.find(m => m.month === txMonth);
      if (match) {
        if (t.type === "income") match.Income += Number(t.amount) || 0;
        else match.Expense += Number(t.amount) || 0;
      }
    });
    
    return months;
  }, [transactions]);



  // AI Calculations
  const healthStats = useMemo(() => calculateHealthScore(transactions, budgets), [transactions, budgets]);
  const insights = useMemo(() => generateInsights(transactions, budgets), [transactions, budgets]);

  // Recent Transactions (Last 5)
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "2rem" }}>
      
      {/* Header Panel */}
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>Finance Overview</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
            Monthly budget tracking and automated financial analytics
          </p>
        </div>
        <button className="btn btn-primary" onClick={onAddTransaction}>
          <span>➕</span> Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        
        {/* Balance Card */}
        <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderLeft: "4px solid #4F5DED" }}>
          <span style={{ fontSize: "0.75rem", color: "#6B6B72", fontWeight: 700, textTransform: "uppercase" }}>
            Current Balance
          </span>
          <span style={{ fontSize: "1.65rem", fontWeight: 800, color: "#1A1A1E" }}>
            {formatCurrency(totals.balance)}
          </span>
          <span style={{ fontSize: "0.75rem", color: "#6B6B72" }}>
            Aggregated across all wallets
          </span>
        </div>

        {/* Income Card */}
        <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderLeft: "4px solid #2E9E6D" }}>
          <span style={{ fontSize: "0.75rem", color: "#6B6B72", fontWeight: 700, textTransform: "uppercase" }}>
            Total Income
          </span>
          <span style={{ fontSize: "1.65rem", fontWeight: 800, color: "#2E9E6D" }}>
            {formatCurrency(totals.income)}
          </span>
          <span style={{ fontSize: "0.75rem", color: "#6B6B72" }}>
            This Month (Direct Deposit)
          </span>
        </div>

        {/* Expense Card */}
        <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderLeft: "4px solid #D65A5A" }}>
          <span style={{ fontSize: "0.75rem", color: "#6B6B72", fontWeight: 700, textTransform: "uppercase" }}>
            Total Expenses
          </span>
          <span style={{ fontSize: "1.65rem", fontWeight: 800, color: "#D65A5A" }}>
            {formatCurrency(totals.expense)}
          </span>
          <span style={{ fontSize: "0.75rem", color: "#6B6B72" }}>
            Debit Card & Cash spending
          </span>
        </div>

        {/* Savings Rate Card */}
        <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", borderLeft: "4px solid #4F5DED" }}>
          <span style={{ fontSize: "0.75rem", color: "#6B6B72", fontWeight: 700, textTransform: "uppercase" }}>
            Monthly Savings Rate
          </span>
          <span style={{ fontSize: "1.65rem", fontWeight: 800, color: "#4F5DED" }}>
            {totals.savingsRate}%
          </span>
          <div className="progress-bar" style={{ height: "8px", marginTop: "4px", borderRadius: "999px", backgroundColor: "#F1F1F8" }}>
            <div 
              className="fill" 
              style={{ 
                width: `${Math.max(0, Math.min(100, totals.savingsRate))}%`,
                backgroundColor: "#4F5DED",
                backgroundImage: "none",
                borderRadius: "999px"
              }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Charts (Income vs Expense & Category Doughnut) */}
      <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: "1.5rem" }} id="charts-dashboard-row">
        
        {/* Income Trend AreaChart */}
        <div className="card card-p" style={{ height: "340px", display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem", color: "#1A1A1E" }}>Cash Flow Trend</h2>
          <div style={{ flex: 1, width: "100%", height: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E9E6D" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2E9E6D" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D65A5A" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#D65A5A" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8EA" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#6B6B72", fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: "#6B6B72", fontSize: 11 }} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#FFFFFF", 
                    borderColor: "#E8E8EA", 
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
                  }}
                  itemStyle={{ color: "#2E9E6D", fontWeight: 700, fontSize: 13 }}
                  labelStyle={{ color: "#1A1A1E", fontWeight: 800, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="Income" stroke="#2E9E6D" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInc)" />
                <Area type="monotone" dataKey="Expense" stroke="#D65A5A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Recent Transactions & AI Health Advisor */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} id="details-dashboard-row">
        
        {/* Recent Transactions List */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.15rem" }}>Recent Activities</h2>
            <span style={{ fontSize: "0.85rem", color: "var(--color-primary)", fontWeight: 700 }}>
              Live Ledger
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {recentTransactions.map((tx) => {
              const isIncome = tx.type === "income";
              return (
                <div 
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border-color)",
                    background: "rgba(255, 255, 255, 0.01)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--border-color)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.01)"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div 
                      style={{ 
                        width: "32px", 
                        height: "32px", 
                        borderRadius: "50%", 
                        background: isIncome ? "var(--color-success-light)" : "var(--color-danger-light)",
                        color: isIncome ? "var(--color-success)" : "var(--color-danger)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1rem"
                      }}
                    >
                      {isIncome ? "⬇️" : "⬆️"}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{tx.description}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        {tx.date} • {tx.category}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem", color: isIncome ? "var(--color-success)" : "var(--color-text-primary)" }}>
                    {isIncome ? "+" : "-"} {formatCurrency(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Health Advisor */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.15rem" }}>AI Financial Coach</h2>
            <span 
              className="badge" 
              style={{ 
                backgroundColor: "var(--color-primary-light)", 
                color: "var(--color-primary)" 
              }}
            >
              Score: {healthStats.score}/100
            </span>
          </div>

          {/* Health Score Progress Ring Row */}
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            {/* SVG Ring Gauge */}
            <div style={{ position: "relative", width: "80px", height: "80px", flexShrink: 0 }}>
              <svg width="80" height="80" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--border-color)"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="3.5"
                  strokeDasharray={`${healthStats.score}, 100`}
                />
              </svg>
              <div 
                style={{ 
                  position: "absolute", 
                  inset: 0, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  fontFamily: "var(--font-heading)"
                }}
              >
                {healthStats.score}%
              </div>
            </div>

            {/* Health Score Breakdown details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                <span>Budget Discipline</span>
                <span style={{ fontWeight: 700 }}>{healthStats.breakdown.budget}%</span>
              </div>
              <div className="progress-bar" style={{ height: "8px", borderRadius: "999px", backgroundColor: "#123226" }}>
                <div className="fill" style={{ width: `${healthStats.breakdown.budget}%`, backgroundColor: "#8B7CF5", backgroundImage: "none", borderRadius: "999px" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginTop: "4px" }}>
                <span>Savings Consistency</span>
                <span style={{ fontWeight: 700 }}>{healthStats.breakdown.savings}%</span>
              </div>
              <div className="progress-bar" style={{ height: "8px", borderRadius: "999px", backgroundColor: "#123226" }}>
                <div className="fill" style={{ width: `${healthStats.breakdown.savings}%`, backgroundColor: "#00C853", backgroundImage: "none", borderRadius: "999px" }} />
              </div>
            </div>
          </div>

          {/* AI Insights display list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Personalized Recommendations
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "120px", overflowY: "auto", paddingRight: "0.25rem" }}>
              {insights.map((insight, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.375rem",
                    backgroundColor: insight.includes("Alert") || insight.includes("Critical") ? "var(--color-danger-light)" : "var(--color-primary-light)",
                    fontSize: "0.8rem",
                    lineHeight: "1.4",
                    color: insight.includes("Alert") || insight.includes("Critical") ? "var(--color-danger)" : "var(--color-text-primary)",
                    borderLeft: `3px solid ${insight.includes("Alert") || insight.includes("Critical") ? "var(--color-danger)" : "var(--color-primary)"}`
                  }}
                >
                  💡 {insight}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal Backdrop Pop */}
      {selectedTx && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(5px)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}
          onClick={() => setSelectedTx(null)}
        >
          <div 
            className="glass-card"
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="badge" style={{ backgroundColor: selectedTx.type === "income" ? "var(--color-success-light)" : "var(--color-danger-light)", color: selectedTx.type === "income" ? "var(--color-success)" : "var(--color-danger)" }}>
                {selectedTx.type}
              </span>
              <button className="btn-icon" onClick={() => setSelectedTx(null)}>✕</button>
            </div>
            
            <div style={{ textAlign: "center", margin: "0.5rem 0" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Amount</span>
              <h3 style={{ fontSize: "2rem", fontWeight: 800, margin: "2px 0 0" }}>
                {selectedTx.type === "income" ? "+" : "-"} {formatCurrency(selectedTx.amount)}
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>Description:</span>{" "}
                <strong style={{ color: "var(--color-text-primary)" }}>{selectedTx.description}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>Date:</span>{" "}
                <strong>{selectedTx.date}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>Category:</span>{" "}
                <strong>{selectedTx.category}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>Billing Account:</span>{" "}
                <strong>{accounts.find((a: any) => a.id === selectedTx.accountId)?.name || "Wallet"}</strong>
              </div>
              {selectedTx.recurring !== "none" && (
                <div>
                  <span style={{ color: "var(--color-text-muted)" }}>Schedule:</span>{" "}
                  <strong>Recurring {selectedTx.recurring}</strong>
                </div>
              )}
              {selectedTx.notes && (
                <div style={{ marginTop: "0.5rem", padding: "0.5rem", borderRadius: "0.25rem", background: "rgba(0, 0, 0, 0.05)" }}>
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", display: "block" }}>Notes:</span>
                  {selectedTx.notes}
                </div>
              )}
              {selectedTx.receiptImage && (
                <div style={{ marginTop: "0.5rem" }}>
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Receipt Attachment:</span>
                  <div style={{ borderRadius: "0.5rem", border: "1px solid var(--color-border)", padding: "0.75rem", background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FaReceipt size={20} color="#10B981" />
                    <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Receipt Attached</span>
                    <FaImage size={18} color="#4F46E5" style={{ marginLeft: "auto" }} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => {
                  onEditTransaction(selectedTx);
                  setSelectedTx(null);
                }}
              >
                ✏️ Edit
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => setSelectedTx(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive layout CSS handles */}
      <style>{`
        @media (max-width: 991px) {
          #charts-dashboard-row {
            grid-template-columns: 1fr !important;
          }
          #details-dashboard-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
