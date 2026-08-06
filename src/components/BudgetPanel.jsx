// src/components/BudgetPanel.jsx
import React, { useState } from "react";

export default function BudgetPanel({ budget, setBudget, expense }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(budget);

  const handleSave = () => {
    const num = Number(temp);
    if (!isNaN(num) && num >= 0) {
      setBudget(num);
    }
    setEditing(false);
  };

  const percent = budget > 0 ? Math.min((expense / budget) * 100, 100) : 0;
  const over = expense > budget;

  return (
    <section className="budget-panel card container" style={{ marginTop: "1rem" }}>
      <h2>Monthly Budget</h2>
      {editing ? (
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="number"
            step="100"
            className="input"
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
            min="0"
          />
          <button className="button" onClick={handleSave}>Save</button>
          <button className="button" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <p>{budget > 0 ? `₹${Number(budget).toLocaleString("en-IN")}` : "Not set"}</p>
          <button className="button" onClick={() => setEditing(true)}>Edit</button>
          <button 
            className="button" 
            style={{ backgroundColor: "#4F46E5", color: "#fff" }}
            onClick={() => {
              const topUp = prompt("Enter recharge / top-up amount for budget (INR):", "5000");
              if (topUp) {
                const amt = Number(topUp);
                if (!isNaN(amt) && amt > 0) {
                  setBudget(Number(budget) + amt);
                }
              }
            }}
          >
            ⚡ Recharge
          </button>
        </div>
      )}
      <div className="progress-bar" style={{ marginTop: "0.5rem", height: "8px", borderRadius: "999px", backgroundColor: "#123226" }}>
        <div
          className="fill"
          style={{
            width: `${percent}%`,
            backgroundColor: over ? "#EF4444" : "#00C853",
            backgroundImage: "none",
            borderRadius: "999px"
          }}
        />
      </div>
      <p style={{ marginTop: "0.25rem" }}>
        {budget > 0
          ? over
            ? `Over budget by ₹${(expense - budget).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
            : `₹${(budget - expense).toLocaleString("en-IN", { minimumFractionDigits: 2 })} remaining`
          : "Set a budget to track spending"}
      </p>
    </section>
  );
}
