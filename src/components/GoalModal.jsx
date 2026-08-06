// src/components/GoalModal.jsx
import React, { useState, useEffect } from "react";
import GoalIcon from "./GoalIcon";

const CATEGORIES = [
  { name: "Emergency", icon: "Emergency", color: "#FF5460" },
  { name: "Vacation", icon: "Vacation", color: "#3EC3D5" },
  { name: "House", icon: "House", color: "#41DC65" },
  { name: "Vehicle", icon: "Vehicle", color: "#3EC3D5" },
  { name: "Education", icon: "Education", color: "#06B6D4" },
  { name: "Laptop", icon: "Laptop", color: "#3EC3D5" },
  { name: "Mobile", icon: "Mobile", color: "#3EC3D5" },
  { name: "Wedding", icon: "Wedding", color: "#EC4899" },
  { name: "Business", icon: "Business", color: "#41DC65" },
  { name: "Investment", icon: "Investment", color: "#3EC3D5" },
  { name: "Healthcare", icon: "Healthcare", color: "#FF5460" },
  { name: "Gaming", icon: "Gaming", color: "#8B5CF6" },
  { name: "Custom", icon: "Custom", color: "#C8C7CD" },
];

const ICONS = ["Custom", "Emergency", "Vacation", "House", "Vehicle", "Education", "Laptop", "Mobile", "Wedding", "Business", "Investment", "Healthcare", "Gaming", "Beach", "Ring", "Rocket"];
const COLORS = ["#3EC3D5", "#41DC65", "#FF5460", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#C8C7CD"];

export default function GoalModal({ isOpen, onClose, onSave, editGoal }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Emergency");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [color, setColor] = useState("#4F46E5");
  const [icon, setIcon] = useState("🎯");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editGoal) {
      setName(editGoal.name || "");
      setCategory(editGoal.category || "Emergency");
      setTarget(editGoal.target?.toString() || "");
      setCurrent(editGoal.current?.toString() || "0");
      setDeadline(editGoal.deadline || "");
      setPriority(editGoal.priority || "Medium");
      setColor(editGoal.color || "#4F46E5");
      setIcon(editGoal.icon || "🎯");
    } else {
      setName("");
      setCategory("Emergency");
      setTarget("");
      setCurrent("0");
      setDeadline(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 6);
        return d.toISOString().slice(0, 10);
      });
      setPriority("Medium");
      setColor("#4F46E5");
      setIcon("🎯");
    }
    setErrors({});
  }, [editGoal, isOpen]);

  const handleCategorySelect = (catName) => {
    setCategory(catName);
    const catObj = CATEGORIES.find((c) => c.name === catName);
    if (catObj) {
      setColor(catObj.color);
      setIcon(catObj.icon);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Goal name is required";
    const numTarget = parseFloat(target);
    if (isNaN(numTarget) || numTarget <= 0) newErrors.target = "Target amount must be > 0";
    if (!deadline) newErrors.deadline = "Target deadline is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...(editGoal ? { id: editGoal.id } : {}),
      name: name.trim(),
      category,
      target: numTarget,
      current: parseFloat(current) || 0,
      deadline,
      priority,
      color,
      icon,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        className="card card-p animate-in"
        style={{
          maxWidth: "520px",
          width: "100%",
          borderRadius: "1rem",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "0.5rem", backgroundColor: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GoalIcon icon={icon} name={category} size={18} color={color} />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>
              {editGoal ? "Edit Savings Goal" : "Create Savings Goal"}
            </h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Category Badges Grid */}
          <div className="form-group">
            <label className="input-label">Select Goal Category</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.25rem" }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategorySelect(cat.name)}
                  style={{
                    padding: "0.35rem 0.65rem",
                    borderRadius: "0.4rem",
                    border: category === cat.name ? `2px solid ${cat.color}` : "1px solid var(--border-color)",
                    background: category === cat.name ? `${cat.color}20` : "transparent",
                    color: category === cat.name ? cat.color : "var(--color-text-secondary)",
                    fontWeight: category === cat.name ? 700 : 500,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <GoalIcon icon={cat.icon} name={cat.name} size={14} color={category === cat.name ? cat.color : "var(--color-text-secondary)"} />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Goal Name */}
          <div className="form-group">
            <label htmlFor="goal-name" className="input-label">Goal Name</label>
            <input
              id="goal-name"
              type="text"
              className={`input-field ${errors.name ? "error" : ""}`}
              placeholder="e.g. Dream House Deposit, New Laptop..."
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
              required
            />
            {errors.name && <span className="input-error">{errors.name}</span>}
          </div>

          {/* Target Amount */}
          <div className="form-group">
            <label htmlFor="goal-target" className="input-label">Target Amount (INR / ₹)</label>
            <input
              id="goal-target"
              type="number"
              step="100"
              min="0"
              className={`input-field ${errors.target ? "error" : ""}`}
              placeholder="e.g. 100000"
              value={target}
              onChange={(e) => { setTarget(e.target.value); setErrors((p) => ({ ...p, target: "" })); }}
              required
            />
            {errors.target && <span className="input-error">{errors.target}</span>}
            <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
              {[1000, 5000, 25000, 100000, 500000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.75rem", fontWeight: 600 }}
                  onClick={() => setTarget(((parseFloat(target) || 0) + preset).toString())}
                >
                  +₹{preset.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          {/* Starting Saved */}
          <div className="form-group">
            <label htmlFor="goal-current" className="input-label">Initial Amount Saved (INR / ₹)</label>
            <input
              id="goal-current"
              type="number"
              step="100"
              min="0"
              className="input-field"
              placeholder="0.00"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>

          {/* Deadline & Priority */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group">
              <label htmlFor="goal-deadline" className="input-label">Target Deadline</label>
              <input
                id="goal-deadline"
                type="date"
                className={`input-field ${errors.deadline ? "error" : ""}`}
                value={deadline}
                onChange={(e) => { setDeadline(e.target.value); setErrors((p) => ({ ...p, deadline: "" })); }}
                required
              />
              {errors.deadline && <span className="input-error">{errors.deadline}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="goal-priority" className="input-label">Priority Level</label>
              <select
                id="goal-priority"
                className="input-field"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Live Required Deposit Target Preview */}
          {(() => {
            const tgt = parseFloat(target) || 0;
            const cur = parseFloat(current) || 0;
            const rem = Math.max(0, tgt - cur);
            if (rem <= 0 || !deadline) return null;

            const dLine = new Date(deadline);
            const daysLeft = Math.max(1, Math.ceil((dLine.getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
            const mthsLeft = Math.max(0.1, parseFloat((daysLeft / 30.4375).toFixed(1)));
            const daily = Math.ceil(rem / daysLeft);
            const monthly = Math.ceil(rem / mthsLeft);

            return (
              <div
                style={{
                  padding: "0.625rem 0.85rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "var(--color-primary-light)",
                  border: "1px solid var(--border-color)",
                  fontSize: "0.8rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.4rem",
                }}
              >
                <span style={{ color: "var(--color-text-muted)" }}>Target Plan:</span>
                <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>
                  ₹{daily.toLocaleString("en-IN")}/day • ₹{monthly.toLocaleString("en-IN")}/month
                </span>
              </div>
            );
          })()}

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {editGoal ? "Save Goal Changes" : "Create Savings Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
