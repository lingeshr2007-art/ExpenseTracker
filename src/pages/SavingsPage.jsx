// src/pages/SavingsPage.jsx
import React, { useState, useMemo } from "react";
import useStore from "../store/useStore";
import GoalModal from "../components/GoalModal";
import DepositModal from "../components/DepositModal";
import WithdrawModal from "../components/WithdrawModal";
import Confetti from "../components/Confetti";
import GoalIcon from "../components/GoalIcon";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  FaPiggyBank,
  FaBullseye,
  FaPlus,
  FaChartLine,
  FaBrain,
  FaCalendarDays,
  FaTrophy,
  FaClockRotateLeft,
  FaCalculator,
  FaFilter,
  FaFileCsv,
  FaFire,
  FaCheckDouble,
  FaArrowTrendUp,
  FaTriangleExclamation,
  FaRegLightbulb,
  FaPen,
  FaTrash,
  FaArrowDown,
  FaArrowUp,
  FaMedal,
  FaGem,
} from "react-icons/fa6";

const TOOLTIP_STYLE = {
  backgroundColor: "#0F172A",
  borderColor: "#334155",
  borderRadius: "10px",
  color: "#F8FAFC",
  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
  padding: "10px 14px",
};
const TOOLTIP_ITEM_STYLE = { color: "#38BDF8", fontWeight: 700 };
const TOOLTIP_LABEL_STYLE = { color: "#F8FAFC", fontWeight: 800 };



export default function SavingsPage() {
  const {
    savingsGoals = [],
    savingsHistory = [],
    transactions = [],
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    depositToGoal,
    withdrawFromGoal,
  } = useStore();

  const [activeTab, setActiveTab] = useState("goals");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal States
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState(null);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawGoal, setWithdrawGoal] = useState(null);

  // Confetti State
  const [confettiActive, setConfettiActive] = useState(false);
  const [milestoneMsg, setMilestoneMsg] = useState(null);

  // Calculator State
  const [calcTarget, setCalcTarget] = useState("100000");
  const [calcCurrent, setCalcCurrent] = useState("20000");
  const [calcMonthly, setCalcMonthly] = useState("10000");

  // Format Currency Helper
  const fmt = (val) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

  // Top Summary Metrics
  const metrics = useMemo(() => {
    const totalSavings = savingsGoals.reduce((sum, g) => sum + (Number(g.current) || 0), 0);
    const totalTargets = savingsGoals.reduce((sum, g) => sum + (Number(g.target) || 0), 0);

    const nowStr = new Date().toISOString().slice(0, 7);
    const monthlyDeposits = savingsHistory
      .filter((h) => h.type === "deposit" && (h.date || "").startsWith(nowStr))
      .reduce((sum, h) => sum + (Number(h.amount) || 0), 0);

    const activeGoalsCount = savingsGoals.filter((g) => g.current < g.target).length;

    // Monthly Income
    const monthIncome = transactions
      .filter((t) => (t.date || "").startsWith(nowStr) && t.type === "income")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const savingsRate = monthIncome > 0 ? ((monthlyDeposits / monthIncome) * 100).toFixed(1) : "18.5";

    let totalDailyTarget = 0;
    let totalMonthlyTarget = 0;
    const nowDate = new Date();

    savingsGoals.forEach((g) => {
      if (g.current < g.target) {
        const rem = Math.max(0, g.target - g.current);
        const dLine = new Date(g.deadline);
        const days = Math.max(1, Math.ceil((dLine.getTime() - nowDate.getTime()) / (1000 * 3600 * 24)));
        const mths = Math.max(0.1, parseFloat((days / 30.4375).toFixed(1)));
        totalDailyTarget += Math.ceil(rem / days);
        totalMonthlyTarget += Math.ceil(rem / mths);
      }
    });

    return {
      totalSavings,
      totalTargets,
      monthlyDeposits,
      activeGoalsCount,
      savingsRate,
      streakMonths: 7,
      totalDailyTarget,
      totalMonthlyTarget,
    };
  }, [savingsGoals, savingsHistory, transactions]);

  // Filtered Goals
  const filteredGoals = useMemo(() => {
    return savingsGoals.filter((g) => {
      const matchCat = selectedCategory === "All" || g.category === selectedCategory;
      const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [savingsGoals, selectedCategory, searchQuery]);

  // Deposit Handler with Milestone Celebration Trigger
  const handleDepositSubmit = (goalId, amount, date, method, notes) => {
    const result = depositToGoal(goalId, amount, date, method, notes);
    if (result && result.newMilestone > 0) {
      setConfettiActive(true);
      setMilestoneMsg(`🎉 Milestone Achieved! ${result.goalName} reached ${result.newMilestone}% completion!`);
      setTimeout(() => setMilestoneMsg(null), 5000);
    }
  };

  // Export History CSV
  const handleExportCSV = () => {
    if (!savingsHistory.length) return;
    const headers = "ID,Goal Name,Type,Amount,Date,Method,Notes\n";
    const rows = savingsHistory
      .map(
        (h) => `"${h.id}","${h.goalName}","${h.type}",${h.amount},"${h.date}","${h.method || ""}","${h.notes || ""}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `savings_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Calculator Prediction Result
  const calcResult = useMemo(() => {
    const tgt = parseFloat(calcTarget) || 0;
    const cur = parseFloat(calcCurrent) || 0;
    const mth = parseFloat(calcMonthly) || 0;

    if (mth <= 0 || tgt <= cur) return { months: 0, dateStr: "Goal already achieved!" };
    const monthsNeeded = Math.ceil((tgt - cur) / mth);
    const compDate = new Date();
    compDate.setMonth(compDate.getMonth() + monthsNeeded);
    return {
      months: monthsNeeded,
      dateStr: compDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    };
  }, [calcTarget, calcCurrent, calcMonthly]);

  // Recharts Monthly Trend Data (Past 6 Months)
  const monthlySavingsTrend = useMemo(() => {
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${y}-${m}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

      const dep = savingsHistory
        .filter((h) => h.type === "deposit" && (h.date || "").startsWith(key))
        .reduce((sum, h) => sum + (Number(h.amount) || 0), 0);

      const exp = transactions
        .filter((t) => t.type === "expense" && (t.date || "").startsWith(key))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const inc = transactions
        .filter((t) => t.type === "income" && (t.date || "").startsWith(key))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      result.push({ month: key, label, Savings: dep, Expenses: exp, Income: inc });
    }
    return result;
  }, [savingsHistory, transactions]);

  // Recharts Category Distribution Data
  const categoryPieData = useMemo(() => {
    const map = {};
    savingsGoals.forEach((g) => {
      map[g.category] = (map[g.category] || 0) + (g.current || 0);
    });
    return Object.keys(map).map((cat) => ({ name: cat, value: map[cat] }));
  }, [savingsGoals]);

  const PIE_COLORS = ["#3EC3D5", "#41DC65", "#FF5460", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#C8C7CD"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Milestone Celebration Banner */}
      {milestoneMsg && (
        <div
          className="animate-in"
          style={{
            padding: "0.875rem 1.25rem",
            borderRadius: "0.75rem",
            backgroundColor: "rgba(65, 220, 101, 0.15)",
            border: "1px solid #41DC65",
            color: "#41DC65",
            fontWeight: 700,
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{milestoneMsg}</span>
          <button className="btn-icon" onClick={() => setMilestoneMsg(null)}>✕</button>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Savings & Goals Module</h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
            AI-assisted wealth accumulation dashboard, milestone celebrations & financial planning.
          </p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => { setEditingGoal(null); setGoalModalOpen(true); }}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          <FaPlus size={16} />
          Create New Goal
        </button>
      </div>

      {/* Top 5 Metric Summary Cards */}
      <div className="grid-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {/* Total Savings */}
        <div className="card card-p animate-in" style={{ animationDelay: "0.05s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Total Savings</span>
            <div style={{ width: "32px", height: "32px", borderRadius: "0.5rem", background: "rgba(62, 195, 213, 0.12)", color: "#3EC3D5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaPiggyBank size={16} />
            </div>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0.35rem 0" }}>{fmt(metrics.totalSavings)}</div>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Target: {fmt(metrics.totalTargets)}</span>
        </div>

        {/* Monthly Savings */}
        <div className="card card-p animate-in" style={{ animationDelay: "0.1s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Monthly Savings</span>
            <div style={{ width: "32px", height: "32px", borderRadius: "0.5rem", background: "rgba(62, 195, 213, 0.12)", color: "#3EC3D5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaArrowTrendUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0.35rem 0" }}>{fmt(metrics.monthlyDeposits)}</div>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Deposits this month</span>
        </div>

        {/* Active Goals */}
        <div className="card card-p animate-in" style={{ animationDelay: "0.15s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Active Goals</span>
            <div style={{ width: "32px", height: "32px", borderRadius: "0.5rem", background: "rgba(59, 130, 246, 0.1)", color: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaBullseye size={16} />
            </div>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0.35rem 0" }}>{metrics.activeGoalsCount}</div>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Out of {savingsGoals.length} total goals</span>
        </div>

        {/* Required Deposit Target */}
        <div className="card card-p animate-in" style={{ animationDelay: "0.18s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Required Deposit</span>
            <div style={{ width: "32px", height: "32px", borderRadius: "0.5rem", background: "rgba(62, 195, 213, 0.12)", color: "#3EC3D5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaCalendarDays size={16} />
            </div>
          </div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0.35rem 0", color: "#3EC3D5" }}>
            {fmt(metrics.totalDailyTarget)} <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--color-text-muted)" }}>/ day</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{fmt(metrics.totalMonthlyTarget)} / month across goals</span>
        </div>


      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.25rem", borderBottom: "1px solid var(--border-color)" }}>
        {[
          { id: "goals", label: "Goals Dashboard", icon: FaBullseye },
          { id: "analytics", label: "Savings Analytics", icon: FaChartLine },
          { id: "ai", label: "AI Insights", icon: FaBrain },
          { id: "calendar", label: "Calendar & Reminders", icon: FaCalendarDays },
          { id: "history", label: "History Ledger", icon: FaClockRotateLeft },
          { id: "calculator", label: "Savings Calculator", icon: FaCalculator },
        ].map((tab) => {
          const active = activeTab === tab.id;
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              className={`btn ${active ? "btn-primary" : "btn-secondary"}`}
              style={{
                padding: "0.5rem 0.85rem",
                fontSize: "0.85rem",
                fontWeight: active ? 700 : 500,
                whiteSpace: "nowrap",
                borderRadius: "0.5rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              <IconComp size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─────────────────── TAB 1: GOALS DASHBOARD ─────────────────── */}
      {activeTab === "goals" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Filters & Search */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
              {["All", "Emergency", "Vacation", "House", "Laptop", "Vehicle"].map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: "0.35rem 0.85rem",
                      borderRadius: "0.5rem",
                      border: isSelected ? "1px solid #4F5DED" : "1px solid #E8E8EA",
                      background: isSelected ? "#F1F1F8" : "#FFFFFF",
                      color: isSelected ? "#4F5DED" : "#6B6B72",
                      fontSize: "0.8125rem",
                      fontWeight: isSelected ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              placeholder="Search savings goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                maxWidth: "240px",
                padding: "0.4rem 0.85rem",
                borderRadius: "0.5rem",
                border: "1px solid #E8E8EA",
                background: "#FFFFFF",
                color: "#1A1A1E",
                fontSize: "0.8125rem",
                outline: "none",
              }}
            />
          </div>

          {/* Goal Cards Grid */}
          {filteredGoals.length === 0 ? (
            <div
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "3.5rem 1.5rem",
                borderRadius: "1rem",
                border: "1px solid #E8E8EA",
                background: "#FFFFFF",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#F1F1F8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <FaBullseye size={26} color="#4F5DED" />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1A1A1E" }}>
                No Savings Goals Found
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#6B6B72", marginTop: "0.25rem" }}>
                Click "Create New Goal" above to configure your targets.
              </p>
            </div>
          ) : (
            <div className="grid-2">
              {filteredGoals.map((g) => {
                const percent = Math.min(100, Math.round(((g.current || 0) / (g.target || 1)) * 100));
                const remaining = Math.max(0, g.target - g.current);
                const isCompleted = g.current >= g.target;

                // Days left
                const deadlineDate = new Date(g.deadline);
                const now = new Date();
                const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

                return (
                  <div
                    key={g.id}
                    className="card card-p animate-in"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                      position: "relative",
                      overflow: "hidden",
                      borderLeft: g.priority === "Urgent" ? "4px solid #FF5460" : "4px solid #41DC65",
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "0.75rem",
                            backgroundColor: "rgba(62, 195, 213, 0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <GoalIcon icon={g.icon} name={g.category} size={22} color="#3EC3D5" />
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>{g.name}</h3>
                            <span
                              style={{
                                padding: "0.15rem 0.5rem",
                                borderRadius: "0.35rem",
                                backgroundColor: g.priority === "Urgent" ? "rgba(255, 84, 96, 0.15)" : "rgba(65, 220, 101, 0.15)",
                                color: g.priority === "Urgent" ? "#FF5460" : "#41DC65",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                              }}
                            >
                              {g.priority}
                            </span>
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                            Category: {g.category} • Target Date: {new Date(g.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        <button
                          className="btn-icon"
                          onClick={() => { setEditingGoal(g); setGoalModalOpen(true); }}
                          title="Edit Goal"
                        >
                          <FaPen size={13} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => deleteSavingsGoal(g.id)}
                          title="Delete Goal"
                          style={{ color: "var(--color-danger)" }}
                        >
                          <FaTrash size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Circular + Progress Metrics */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Current Progress</span>
                        <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#41DC65" }}>
                          {fmt(g.current)} <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontWeight: 500 }}>/ {fmt(g.target)}</span>
                        </div>
                      </div>

                      {/* Circular Badge Indicator */}
                      <div
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "50%",
                          background: `conic-gradient(#4F5DED ${percent * 3.6}deg, var(--border-color) 0deg)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "var(--bg-surface)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "0.8rem",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {percent}%
                        </div>
                      </div>
                    </div>

                    {/* Linear Progress Bar */}
                    <div className="progress-bar" style={{ height: "8px", borderRadius: "999px", backgroundColor: "#E1E0E6" }}>
                      <div
                        className="fill"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: "#4F5DED",
                          backgroundImage: "none",
                          borderRadius: "999px"
                        }}
                      />
                    </div>

                    {/* Remaining & Days Left */}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                      <span>Remaining: <strong style={{ color: "var(--color-text-primary)" }}>{fmt(remaining)}</strong></span>
                      <span>
                        {isCompleted ? (
                          <strong style={{ color: "#4F5DED", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                            <FaCheckDouble size={12} /> Completed!
                          </strong>
                        ) : (
                          `${daysLeft > 0 ? `${daysLeft} Days Left` : "Overdue"}`
                        )}
                      </span>
                    </div>

                    {/* Required Daily & Monthly Deposit Target Box */}
                    {(() => {
                      const reqDays = Math.max(1, daysLeft);
                      const reqMonths = Math.max(0.1, parseFloat((reqDays / 30.4375).toFixed(1)));
                      const dailyNeeded = isCompleted ? 0 : Math.ceil(remaining / reqDays);
                      const monthlyNeeded = isCompleted ? 0 : Math.ceil(remaining / reqMonths);

                      return (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "0.5rem",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "0.5rem",
                            backgroundColor: "var(--color-primary-light)",
                            border: "1px solid var(--border-color)",
                            fontSize: "0.8rem",
                          }}
                        >
                          <div>
                            <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", display: "block" }}>Daily Deposit Needed</span>
                            <strong style={{ color: "var(--color-text-primary)" }}>
                              {fmt(dailyNeeded)} <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--color-text-muted)" }}>/ day</span>
                            </strong>
                          </div>
                          <div>
                            <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", display: "block" }}>Monthly Deposit Needed</span>
                            <strong style={{ color: "var(--color-primary)" }}>
                              {fmt(monthlyNeeded)} <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--color-text-muted)" }}>/ month</span>
                            </strong>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1, padding: "0.45rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}
                        onClick={() => { setDepositGoal(g); setDepositModalOpen(true); }}
                      >
                        <FaArrowUp size={13} /> Deposit
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: "0.45rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}
                        onClick={() => { setWithdrawGoal(g); setWithdrawModalOpen(true); }}
                        disabled={g.current <= 0}
                      >
                        <FaArrowDown size={13} /> Withdraw
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────── TAB 2: SAVINGS ANALYTICS ─────────────────── */}
      {activeTab === "analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="grid-2">
            {/* Monthly Savings Trend */}
            <div className="card card-p animate-in">
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Monthly Savings Growth Trend</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlySavingsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={55} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
                  <Line type="monotone" dataKey="Savings" stroke="#41DC65" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Savings vs Expenses Comparison */}
            <div className="card card-p animate-in">
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Savings vs Expenses Comparison</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlySavingsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={55} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
                  <Legend />
                  <Bar dataKey="Savings" fill="#41DC65" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#FF5460" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid-2">
            {/* Goal Allocation Distribution */}
            <div className="card card-p animate-in">
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Goal Allocation Distribution</h3>
              {categoryPieData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={categoryPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={(e) => e.name}>
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Income vs Savings Area Comparison */}
            <div className="card card-p animate-in">
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Income vs Savings Rate Flow</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlySavingsTrend}>
                  <defs>
                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3EC3D5" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3EC3D5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#41DC65" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#41DC65" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={55} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
                  <Area type="monotone" dataKey="Income" stroke="#3EC3D5" fillOpacity={1} fill="url(#incGrad)" />
                  <Area type="monotone" dataKey="Savings" stroke="#41DC65" fillOpacity={1} fill="url(#savGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────── TAB 3: AI INSIGHTS ─────────────────── */}
      {activeTab === "ai" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card card-p animate-in" style={{ background: "linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)", border: "1px solid var(--color-primary-light)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "0.5rem", backgroundColor: "var(--color-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FaBrain size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Apex AI Financial Advisory</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Real-time wealth accumulation recommendations based on spending velocity.</p>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card card-p animate-in">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", color: "#10B981" }}>
                <FaRegLightbulb size={18} />
                <h4 style={{ fontWeight: 800, fontSize: "0.95rem" }}>Smart Saving Opportunities</h4>
              </div>
              <ul style={{ paddingLeft: "1.25rem", fontSize: "0.85rem", lineHeight: "1.6", color: "var(--color-text-secondary)" }}>
                <li>Setting up automated transfers of <strong>₹5,000</strong> on salary day will accelerate your <strong>MacBook Pro</strong> goal by 45 days.</li>
                <li>Dining expenses were 18% lower this month. Transferring that <strong>₹2,400</strong> difference directly into your Emergency Fund will boost security.</li>
              </ul>
            </div>

            <div className="card card-p animate-in">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", color: "#3B82F6" }}>
                <FaArrowTrendUp size={18} />
                <h4 style={{ fontWeight: 800, fontSize: "0.95rem" }}>Goal Completion Predictions</h4>
              </div>
              <ul style={{ paddingLeft: "1.25rem", fontSize: "0.85rem", lineHeight: "1.6", color: "var(--color-text-secondary)" }}>
                <li>At your current savings velocity, <strong>Vacation to Bali</strong> will be 100% funded on <strong>September 28, 2026</strong> (17 days ahead of deadline!).</li>
                <li><strong>Home Down Payment</strong> requires an additional ₹8,500/month to meet your target June 2027 deadline.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────── TAB 4: CALENDAR & REMINDERS ─────────────────── */}
      {activeTab === "calendar" && (
        <div className="card card-p animate-in" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Savings Schedule & Reminders</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {savingsGoals.map((g) => (
              <div
                key={g.id}
                style={{
                  padding: "0.85rem 1rem",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <FaBullseye size={20} color="#3EC3D5" />
                  <div>
                    <strong style={{ fontSize: "0.95rem" }}>{g.name}</strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                      Target Date: {new Date(g.deadline).toLocaleDateString()} • Target: {fmt(g.target)}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ padding: "0.25rem 0.6rem", borderRadius: "0.35rem", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", fontSize: "0.75rem", fontWeight: 700 }}>
                    Active Deposit Reminder
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* ─────────────────── TAB 6: HISTORY LEDGER ─────────────────── */}
      {activeTab === "history" && (
        <div className="card card-p animate-in" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Savings Transaction History</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Detailed deposit and withdrawal logs.</p>
            </div>

            <button className="btn btn-secondary" onClick={handleExportCSV} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <FaFileCsv size={16} /> Export CSV
            </button>
          </div>

          {savingsHistory.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>No transaction history found</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                    <th style={{ padding: "0.6rem" }}>Date</th>
                    <th style={{ padding: "0.6rem" }}>Goal Name</th>
                    <th style={{ padding: "0.6rem" }}>Type</th>
                    <th style={{ padding: "0.6rem" }}>Amount</th>
                    <th style={{ padding: "0.6rem" }}>Payment Source</th>
                    <th style={{ padding: "0.6rem" }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {savingsHistory.map((h) => (
                    <tr key={h.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "0.6rem" }}>{h.date}</td>
                      <td style={{ padding: "0.6rem", fontWeight: 700 }}>{h.goalName}</td>
                      <td style={{ padding: "0.6rem" }}>
                        <span style={{ padding: "0.15rem 0.45rem", borderRadius: "0.25rem", fontSize: "0.75rem", fontWeight: 700, backgroundColor: h.type === "deposit" ? "rgba(65, 220, 101, 0.15)" : "rgba(255, 84, 96, 0.15)", color: h.type === "deposit" ? "#41DC65" : "#FF5460" }}>
                          {h.type === "deposit" ? "Deposit" : "Withdraw"}
                        </span>
                      </td>
                      <td style={{ padding: "0.6rem", fontWeight: 800, color: h.type === "deposit" ? "#41DC65" : "#FF5460" }}>
                        {h.type === "deposit" ? "+" : "-"}{fmt(h.amount)}
                      </td>
                      <td style={{ padding: "0.6rem", color: "var(--color-text-muted)" }}>{h.method}</td>
                      <td style={{ padding: "0.6rem", color: "var(--color-text-muted)" }}>{h.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────── TAB 7: SAVINGS CALCULATOR ─────────────────── */}
      {activeTab === "calculator" && (
        <div className="card card-p animate-in" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Interactive Savings Target Calculator</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>Estimate completion timelines based on your target and monthly saving rate.</p>
          </div>

          <div className="grid-2">
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="input-label">Target Amount (INR / ₹)</label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  className="input-field"
                  value={calcTarget}
                  onChange={(e) => setCalcTarget(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="input-label">Current Saved Balance (INR / ₹)</label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  className="input-field"
                  value={calcCurrent}
                  onChange={(e) => setCalcCurrent(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="input-label">Planned Monthly Contribution (INR / ₹)</label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  className="input-field"
                  value={calcMonthly}
                  onChange={(e) => setCalcMonthly(e.target.value)}
                />
              </div>
            </div>

            <div
              style={{
                padding: "1.5rem",
                borderRadius: "1rem",
                backgroundColor: "var(--color-primary-light)",
                border: "1px solid var(--color-primary)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "1rem",
              }}
            >
              <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--color-primary)" }}>Estimated Goal Timeline</h4>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Months Required</span>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-primary)" }}>
                  {calcResult.months} <span style={{ fontSize: "1rem", fontWeight: 500 }}>Months</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Estimated Completion Date</span>
                <strong style={{ fontSize: "1.1rem", color: "#41DC65" }}>{calcResult.dateStr}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSave={(data) => {
          if (editingGoal) updateSavingsGoal(data);
          else addSavingsGoal(data);
        }}
        editGoal={editingGoal}
      />

      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onDeposit={handleDepositSubmit}
        goal={depositGoal}
      />

      <WithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        onWithdraw={withdrawFromGoal}
        goal={withdrawGoal}
      />

      {/* CONFETTI */}
      <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />
    </div>
  );
}
