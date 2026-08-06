// src/components/GoalsView.tsx
import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function GoalsView() {
  const { goals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, currency } = useApp();

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState("#6366f1");

  // Goals contribution quick adjustment states
  const [addFundsInput, setAddFundsInput] = useState<{ [key: string]: string }>({});
  const [showAddGoal, setShowAddGoal] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(val);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmt = parseFloat(target);
    const currentAmt = parseFloat(current) || 0;
    if (!name.trim() || isNaN(targetAmt) || targetAmt <= 0 || !deadline) return;

    addSavingsGoal(name.trim(), targetAmt, currentAmt, deadline, color);
    
    // reset form
    setName("");
    setTarget("");
    setCurrent("");
    setDeadline("");
    setShowAddGoal(false);
  };

  const handleAddFunds = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    const amount = parseFloat(addFundsInput[goalId]);
    if (!goal || isNaN(amount) || amount <= 0) return;

    const newAmount = parseFloat((goal.currentAmount + amount).toFixed(2));
    updateSavingsGoal({
      ...goal,
      currentAmount: Math.min(goal.targetAmount, newAmount)
    });

    // clear input
    setAddFundsInput(prev => ({ ...prev, [goalId]: "" }));
  };

  const getDaysRemaining = (deadlineDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(deadlineDateStr + "T00:00:00");
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "2rem" }}>
      
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>Savings Targets</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
            Track progress towards major asset goals and target deadlines.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddGoal(!showAddGoal)}>
          {showAddGoal ? "✕ Cancel" : "🎯 New Savings Goal"}
        </button>
      </div>

      {/* Goal creation Form */}
      {showAddGoal && (
        <div className="glass-card" style={{ animation: "fadeIn 0.2s ease-out" }}>
          <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>Create New Savings Target</h2>
          <form onSubmit={handleCreateGoal} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", alignItems: "end" }}>
            <div className="form-group">
              <label htmlFor="goal-name" className="input-label">Target Name</label>
              <input
                id="goal-name"
                type="text"
                className="input-field"
                placeholder="e.g. Dream House Deposit"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="goal-target" className="input-label">Target Amount (USD)</label>
              <input
                id="goal-target"
                type="number"
                step="100"
                min="0"
                className="input-field"
                placeholder="0.00"
                value={target}
                onChange={e => setTarget(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="goal-saved" className="input-label">Starting Amount (USD)</label>
              <input
                id="goal-saved"
                type="number"
                step="100"
                min="0"
                className="input-field"
                placeholder="0.00"
                value={current}
                onChange={e => setCurrent(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="goal-deadline" className="input-label">Target Deadline</label>
              <input
                id="goal-deadline"
                type="date"
                className="input-field"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="goal-color" className="input-label">Theme Color</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  id="goal-color"
                  type="color"
                  className="input-field"
                  style={{ padding: "0.25rem", width: "50px" }}
                  value={color}
                  onChange={e => setColor(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Goal
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Saving targets list grid */}
      {goals.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--color-text-muted)" }}>
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>🎯</span>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 600 }}>No Savings Goals Configured</h3>
          <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
            Click the "New Savings Goal" button above to configure targets.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {goals.map(goal => {
            const percent = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
            const daysLeft = getDaysRemaining(goal.deadline);
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <div 
                key={goal.id} 
                className="glass-card" 
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "1rem", 
                  borderTop: `5px solid ${goal.color}`,
                  opacity: isCompleted ? 0.9 : 1
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                      {goal.name} {isCompleted ? "🎉" : ""}
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      Deadline: {goal.deadline}
                    </span>
                  </div>
                  <button 
                    className="btn-icon" 
                    onClick={() => deleteSavingsGoal(goal.id)}
                    title="Remove goal"
                  >
                    ✕
                  </button>
                </div>

                {/* Progress bar and statistics */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600 }}>
                    <span>Progress: {percent.toFixed(0)}%</span>
                    <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="progress-bar" style={{ height: "8px", borderRadius: "999px", backgroundColor: "#F1F1F8" }}>
                    <div 
                      className="fill" 
                      style={{ 
                        width: `${percent}%`, 
                        backgroundColor: goal.color || "#4F5DED",
                        backgroundImage: "none",
                        borderRadius: "999px"
                      }} 
                    />
                  </div>
                </div>

                {/* Subtext info */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                  <span>
                    {isCompleted ? (
                      <span style={{ color: "var(--color-success)", fontWeight: 700 }}>Target Completed!</span>
                    ) : (
                      `${formatCurrency(goal.targetAmount - goal.currentAmount)} remaining`
                    )}
                  </span>

                  <span>
                    {isCompleted ? (
                      "Completed"
                    ) : daysLeft > 0 ? (
                      `🕒 ${daysLeft} days remaining`
                    ) : (
                      <span style={{ color: "var(--color-danger)" }}>⚠️ Overdue by {Math.abs(daysLeft)} days</span>
                    )}
                  </span>
                </div>

                {/* Quick Add Contribution form */}
                {!isCompleted && (
                  <div 
                    style={{ 
                      display: "flex", 
                      gap: "0.5rem", 
                      borderTop: "1px solid var(--border-color)", 
                      paddingTop: "0.75rem",
                      marginTop: "auto"
                    }}
                  >
                    <input
                      type="number"
                      step="100"
                      min="0"
                      placeholder="Amount"
                      className="input-field"
                      style={{ padding: "0.35rem 0.5rem", fontSize: "0.85rem" }}
                      value={addFundsInput[goal.id] || ""}
                      onChange={e => {
                        const val = e.target.value;
                        setAddFundsInput(prev => ({ ...prev, [goal.id]: val }));
                      }}
                      aria-label="Add funds amount"
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", whiteSpace: "nowrap" }}
                      onClick={() => handleAddFunds(goal.id)}
                    >
                      💰 Save More
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
