// src/components/BudgetsView.tsx
import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function BudgetsView() {
  const { budgets, categories, addBudget, updateBudget, rechargeBudget, deleteBudget, currency } = useApp();

  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || "");
  const [limitInput, setLimitInput] = useState("");
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Quick Recharge Modal State
  const [rechargeModalCat, setRechargeModalCat] = useState<string | null>(null);
  const [rechargeAmountInput, setRechargeAmountInput] = useState("");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(val);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(limitInput);
    if (!selectedCategory || isNaN(limit) || limit <= 0) return;

    // Check if budget already exists for this category
    const exists = budgets.some(b => b.category === selectedCategory);
    if (exists) {
      updateBudget(selectedCategory, limit);
    } else {
      addBudget(selectedCategory, limit);
    }
    setLimitInput("");
    setIsEditing(null);
  };

  const handleStartEdit = (category: string, currentLimit: number) => {
    setIsEditing(category);
    setSelectedCategory(category);
    setLimitInput(currentLimit.toString());
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setLimitInput("");
  };

  const handleQuickRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(rechargeAmountInput);
    if (!rechargeModalCat || isNaN(amount) || amount <= 0) return;

    rechargeBudget(rechargeModalCat, amount);
    setRechargeModalCat(null);
    setRechargeAmountInput("");
  };

  const handleQuickRechargePreset = (category: string, amount: number) => {
    rechargeBudget(category, amount);
    setRechargeModalCat(null);
    setRechargeAmountInput("");
  };

  // Find categories that don't have budgets configured yet
  const unbudgetedCategories = categories.filter(c => {
    if (c.name === "Salary" || c.name === "Investment") return false; // salary is income
    return !budgets.some(b => b.category === c.name);
  });

  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "2rem" }}>
      
      {/* Title & Recharge Info Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>Category Budgets</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
            Set monthly limit ceilings and top up / recharge limits with live notification alerts.
          </p>
        </div>

        <div style={{ 
          background: "rgba(79, 70, 229, 0.08)", 
          border: "1px solid rgba(79, 70, 229, 0.2)", 
          padding: "0.6rem 1rem", 
          borderRadius: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem"
        }}>
          <span style={{ fontSize: "1.2rem" }}>⚡</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--color-primary)" }}>Recharge Alerts Enabled</div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Instant notification dispatched when budget is recharged</div>
          </div>
        </div>
      </div>

      {/* Grid: Forms & Budgets list */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: "1.5rem" }} id="budgets-view-grid">
        
        {/* Left column: Add/Edit Limits Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass-card">
            <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>
              {isEditing ? "✏️ Adjust Category Cap" : "🛡️ Set Category Budget"}
            </h2>
            <form onSubmit={handleSaveBudget} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label htmlFor="budget-cat" className="input-label">Select Category</label>
                <select
                  id="budget-cat"
                  className="input-field"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  disabled={isEditing !== null}
                >
                  {categories.filter(c => c.name !== "Salary").map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="budget-limit" className="input-label">Monthly Limit ({currency})</label>
                <input
                  id="budget-limit"
                  type="number"
                  step="100"
                  min="0"
                  placeholder="0.00"
                  className="input-field"
                  value={limitInput}
                  onChange={e => setLimitInput(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                {isEditing && (
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleCancelEdit}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {isEditing ? "Save Limit" : "Establish Limit"}
                </button>
              </div>
            </form>
          </div>

          {/* Unbudgeted categories list quick contribution links */}
          {unbudgetedCategories.length > 0 && (
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <h3 style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Unbudgeted Sectors
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {unbudgetedCategories.map(c => (
                  <button
                    key={c.id}
                    className="btn btn-secondary"
                    style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}
                    onClick={() => {
                      setSelectedCategory(c.name);
                      setLimitInput("500"); // default suggestion
                      setIsEditing(null);
                    }}
                  >
                    ➕ {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Budgets progress dashboard */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h2 style={{ fontSize: "1.15rem" }}>Current Budget Standings</h2>
          
          {budgets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--color-text-muted)" }}>
              <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>🛡️</span>
              <h3 style={{ fontSize: "1rem" }}>No Budgets Established</h3>
              <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                Select a category on the left to set spending limits.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {budgets.map(b => {
                const percent = b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0;
                const isExceeded = b.spent > b.limit;
                const isWarning = b.spent > b.limit * 0.85 && !isExceeded;
                const catObj = categories.find(c => c.name === b.category);
                const progressColor = isExceeded ? "#D65A5A" : isWarning ? "#D9A441" : "#4F5DED";

                return (
                  <div 
                    key={b.category}
                    style={{
                      padding: "1rem",
                      borderRadius: "0.75rem",
                      border: "1px solid var(--border-color)",
                      background: "rgba(255, 255, 255, 0.01)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "1.1rem" }}>{catObj?.icon || "🏷️"}</span>
                        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{b.category}</span>
                      </div>
                      <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                          onClick={() => {
                            setRechargeModalCat(b.category);
                            setRechargeAmountInput("1000");
                          }}
                          title="Recharge / Top up budget limit"
                        >
                          ⚡ Recharge
                        </button>

                        <button 
                          className="btn-icon" 
                          style={{ padding: "0.25rem" }} 
                          onClick={() => handleStartEdit(b.category, b.limit)}
                          title="Edit Limit"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-icon" 
                          style={{ padding: "0.25rem" }} 
                          onClick={() => deleteBudget(b.category)}
                          title="Delete Limit"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Progress Fill Meter */}
                    <div 
                      className="progress-bar" 
                      data-category={b.category}
                      style={{ height: "8px", borderRadius: "999px", backgroundColor: "#F1F1F8" }}
                    >
                      <div 
                        className="fill" 
                        style={{ 
                          width: `${percent}%`, 
                          backgroundColor: progressColor,
                          backgroundImage: "none",
                          borderRadius: "999px"
                        }} 
                      />
                    </div>

                    {/* Spending statistics breakdown */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", fontSize: "0.85rem" }}>
                      <div>
                        <strong style={{ color: isExceeded ? "var(--color-danger)" : "var(--color-text-primary)" }}>
                          {formatCurrency(b.spent)}
                        </strong>{" "}
                        spent of {formatCurrency(b.limit)}
                      </div>
                      
                      <div style={{ fontWeight: 600, color: progressColor }}>
                        {isExceeded ? (
                          `Over Budget by ${formatCurrency(b.spent - b.limit)}`
                        ) : (
                          `${formatCurrency(b.limit - b.spent)} remaining`
                        )}
                      </div>
                    </div>

                    {/* Banner Alerts inside card */}
                    {isExceeded && (
                      <div style={{ marginTop: "0.5rem", padding: "0.35rem 0.5rem", borderRadius: "0.25rem", backgroundColor: "var(--color-danger-light)", color: "var(--color-danger)", fontSize: "0.75rem", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>⚠️ Category spending exceeded monthly cap.</span>
                        <button 
                          style={{ background: "none", border: "none", color: "var(--color-danger)", textDecoration: "underline", cursor: "pointer", fontWeight: 800 }}
                          onClick={() => {
                            setRechargeModalCat(b.category);
                            setRechargeAmountInput(Math.ceil(b.spent - b.limit + 500).toString());
                          }}
                        >
                          Recharge Now ⚡
                        </button>
                      </div>
                    )}
                    {isWarning && (
                      <div style={{ marginTop: "0.5rem", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", backgroundColor: "var(--color-info-light)", color: "var(--color-accent)", fontSize: "0.75rem", fontWeight: 700 }}>
                        ⚠️ Spending exceeded 85% of category threshold.
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Recharge Modal */}
      {rechargeModalCat && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div className="glass-card" style={{ maxWidth: "420px", width: "100%", padding: "1.5rem", borderRadius: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>⚡ Recharge Budget</h3>
              <button className="btn-icon" onClick={() => setRechargeModalCat(null)}>✕</button>
            </div>
            
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
              Add extra capacity to <strong>{rechargeModalCat}</strong> budget limit. You will receive an instant alert notification when recharged.
            </p>

            <form onSubmit={handleQuickRechargeSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="input-label">Top-Up Amount ({currency})</label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  className="input-field"
                  placeholder="e.g. 1000"
                  value={rechargeAmountInput}
                  onChange={e => setRechargeAmountInput(e.target.value)}
                  required
                />
              </div>

              <div>
                <span className="input-label">Quick Presets</span>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
                  {[500, 1000, 2500, 5000, 10000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                      onClick={() => handleQuickRechargePreset(rechargeModalCat, amt)}
                    >
                      +{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setRechargeModalCat(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  ⚡ Confirm & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          #budgets-view-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

