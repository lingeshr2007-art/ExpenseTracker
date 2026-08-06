// src/components/TransactionList.jsx
import React, { useState, useMemo } from "react";

// Category colors matching App.jsx and adding custom fallback for Income
const CATEGORY_COLORS = {
  Food: "#4F5DED",
  Transport: "#4F5DED",
  Housing: "#4F5DED",
  Entertainment: "#4F5DED",
  Health: "#4F5DED",
  Shopping: "#4F5DED",
  Other: "#4F5DED",
  Income: "#2E9E6D",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(value) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function TransactionList({ transactions = [], setEditTx, deleteTransaction }) {
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest" | "highest" | "lowest"

  // Local sorting logic
  const sortedTransactions = useMemo(() => {
    const list = [...transactions];
    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === "highest") {
      list.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === "lowest") {
      list.sort((a, b) => a.amount - b.amount);
    }
    return list;
  }, [transactions, sortBy]);

  return (
    <section className="transaction-list-section card container" style={{ marginTop: "1rem" }}>
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1rem",
          borderBottom: "1px solid var(--color-border)",
          paddingBottom: "0.75rem"
        }}
      >
        <h2 style={{ margin: 0 }}>Transactions</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label htmlFor="sort-select" style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--color-text-secondary)" }}>
            Sort by:
          </label>
          <select
            id="sort-select"
            className="select"
            style={{ width: "auto", padding: "0.25rem 0.5rem", fontSize: "0.9rem" }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Date: Newest</option>
            <option value="oldest">Date: Oldest</option>
            <option value="highest">Amount: Highest</option>
            <option value="lowest">Amount: Lowest</option>
          </select>
        </div>
      </div>

      {sortedTransactions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-secondary)" }}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--color-border)", marginBottom: "1rem" }}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <p style={{ fontWeight: 500, fontSize: "1.1rem" }}>No transactions found</p>
          <p style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>Try adjusting your filters or add a new transaction above.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--color-border)", color: "var(--color-text-secondary)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "0.75rem 0.5rem" }}>Date</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Description</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Category</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Amount</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((tx) => {
                const isIncome = tx.type === "income";

                return (
                  <tr 
                    key={tx.id} 
                    style={{ 
                      borderBottom: "1px solid var(--color-border)", 
                      transition: "background-color 0.2s"
                    }}
                    className="transaction-row"
                  >
                    <td style={{ padding: "0.75rem 0.5rem", whiteSpace: "nowrap", fontSize: "0.95rem" }}>
                      {formatDate(tx.date)}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", fontWeight: 500, fontSize: "0.95rem" }}>
                      {tx.description}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <span 
                        style={{ 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: "0.375rem",
                          padding: "0.25rem 0.625rem",
                          borderRadius: "9999px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          backgroundColor: "#F1F1F8",
                          color: "#4F5DED"
                        }}
                      >
                        {tx.category}
                      </span>
                    </td>
                    <td 
                      style={{ 
                        padding: "0.75rem 0.5rem", 
                        textAlign: "right", 
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        color: isIncome ? "#2E9E6D" : "#D65A5A"
                      }}
                    >
                      {isIncome ? "+" : "-"} {formatCurrency(tx.amount)}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.375rem", justifyContent: "center" }}>
                        <button
                          onClick={() => setEditTx(tx)}
                          aria-label="Edit transaction"
                          className="button"
                          style={{
                            padding: "0.35rem",
                            borderRadius: "0.375rem",
                            backgroundColor: "transparent",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-text-secondary)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--color-primary)";
                            e.currentTarget.style.borderColor = "var(--color-primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--color-text-secondary)";
                            e.currentTarget.style.borderColor = "var(--color-border)";
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          aria-label="Delete transaction"
                          className="button"
                          style={{
                            padding: "0.35rem",
                            borderRadius: "0.375rem",
                            backgroundColor: "transparent",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-text-secondary)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--color-danger)";
                            e.currentTarget.style.borderColor = "var(--color-danger)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--color-text-secondary)";
                            e.currentTarget.style.borderColor = "var(--color-border)";
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
