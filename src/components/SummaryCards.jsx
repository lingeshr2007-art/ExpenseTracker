// src/components/SummaryCards.jsx
import React from "react";
// Intl is a global object; no import needed

function formatCurrency(value) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function SummaryCards({ totals }) {
  const { balance, income, expense } = totals;
  const balanceClass = balance < 0 ? "balance-negative" : "";

  return (
    <section className="summary-cards container" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <div className="card" style={{ flex: "1 1 200px" }}>
        <h2>Balance</h2>
        <p className={balanceClass}>{formatCurrency(balance)}</p>
      </div>
      <div className="card" style={{ flex: "1 1 200px" }}>
        <h2>Total Income</h2>
        <p>{formatCurrency(income)}</p>
      </div>
      <div className="card" style={{ flex: "1 1 200px" }}>
        <h2>Total Expenses</h2>
        <p>{formatCurrency(expense)}</p>
      </div>
    </section>
  );
}
