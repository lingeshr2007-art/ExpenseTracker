// src/pages/Dashboard.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import useStore from "../store/useStore";
import NotificationCenter from "../components/NotificationCenter";
import { formatCurrency, getRelativeDate } from "../utils/format";
import { CategoryIcon } from "../utils/categoryIcons";
import { getPastelCategoryColors } from "../utils/categoryColors";
import {
  FaWallet,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaPiggyBank,
  FaArrowRight,
  FaPlus,
  FaChartLine,
  FaChartPie,
  FaCreditCard,
} from "react-icons/fa6";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AESTHETIC_PALETTE = [
  "#3EC3D5", // Primary Accent
  "#41DC65", // Income
  "#FF5460", // Expense
  "#23273C", // Primary
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#C8C7CD", // Muted
];

const STAT_CARDS = [
  {
    key: "balance",
    label: "BALANCE",
    icon: FaWallet,
    borderLeft: "4px solid #4F5DED",
    iconColor: "#4F5DED",
    iconBg: "#F1F1F8",
  },
  {
    key: "income",
    label: "TOTAL INCOME",
    icon: FaArrowTrendUp,
    borderLeft: "4px solid #2E9E6D",
    iconColor: "#2E9E6D",
    iconBg: "rgba(46, 158, 109, 0.12)",
  },
  {
    key: "expense",
    label: "TOTAL EXPENSES",
    icon: FaArrowTrendDown,
    borderLeft: "4px solid #D65A5A",
    iconColor: "#D65A5A",
    iconBg: "rgba(214, 90, 90, 0.12)",
  },
  {
    key: "budget",
    label: "BUDGET LEFT",
    icon: FaPiggyBank,
    borderLeft: "4px solid #D9A441",
    iconColor: "#D9A441",
    iconBg: "rgba(217, 164, 65, 0.12)",
  },
];

export default function Dashboard() {
  const {
    transactions,
    budget,
    categories,
    getTotals,
    getMonthlyExpense,
    getCategoryBreakdown,
    getTrendData,
  } = useStore();

  const totals = getTotals();
  const monthlyExpense = getMonthlyExpense();
  const budgetLeft = budget - monthlyExpense;
  const rawCategoryData = getCategoryBreakdown();
  const trendData = getTrendData(6);

  // Map category data to pastel theme palette
  const categoryData = useMemo(() => {
    return (rawCategoryData || []).map((cat, idx) => {
      const palette = getPastelCategoryColors(cat?.name, idx);
      return {
        ...cat,
        color: palette?.primary || "#6366F1",
        bg: palette?.bg || "#EEF2FF",
        border: palette?.border || "#E0E7FF",
      };
    });
  }, [rawCategoryData]);

  const statValues = {
    balance: totals?.balance || 0,
    income: totals?.income || 0,
    expense: totals?.expense || 0,
    budget: budgetLeft || 0,
  };

  const recentTx = useMemo(
    () =>
      (Array.isArray(transactions) ? transactions : [])
        .filter(Boolean)
        .sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0))
        .slice(0, 5),
    [transactions]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Unified Compact Notification Summary Card */}
      <NotificationCenter />

      {/* 2x2 Stat Cards Grid */}
      <div className="grid-4">
        {STAT_CARDS.map((card, i) => (
          <div
            key={card.key}
            className="animate-in"
            style={{
              animationDelay: `${i * 0.08}s`,
              background: "#FFFFFF",
              color: "#1A1A1E",
              borderRadius: "0.875rem",
              padding: "1.25rem 1.5rem",
              border: "1px solid #E8E8EA",
              borderLeft: card.borderLeft,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: card.iconBg,
                color: card.iconColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <card.icon size={20} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#6B6B72",
                  marginBottom: "0.25rem",
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  color: "#1A1A1E",
                }}
              >
                {formatCurrency(statValues[card.key])}
              </div>

              {card.key === "budget" && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#6B6B72",
                    marginTop: "0.25rem",
                    fontWeight: 600,
                  }}
                >
                  {budget > 0
                    ? `${Math.round((monthlyExpense / budget) * 100)}% of ${formatCurrency(
                        budget
                      )} used`
                    : "No budget set"}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 2 Main Charts Row */}
      <div className="grid-2">
        {/* Income vs Expenses Trend Chart Card */}
        <div
          className="card card-p animate-in"
          style={{ animationDelay: "0.3s", borderRadius: "0.875rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#1A1A1E" }}>
                Income vs Expenses
              </h3>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#6B6B72",
                  marginTop: "0.125rem",
                }}
              >
                Last 6 months
              </p>
            </div>
            <Link
              to="/analytics"
              className="btn btn-sm btn-secondary"
              style={{
                borderRadius: "9999px",
                padding: "0.375rem 0.875rem",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              View All <FaArrowRight size={12} />
            </Link>
          </div>

          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2E9E6D" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#2E9E6D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D65A5A" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#D65A5A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8EA" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#6B6B72" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6B6B72" }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E8E8EA",
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    padding: "8px 12px",
                  }}
                  itemStyle={{ color: "#2E9E6D", fontWeight: 700, fontSize: 13 }}
                  labelStyle={{
                    color: "#1A1A1E",
                    fontWeight: 800,
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#2E9E6D"
                  fill="url(#gradIncome)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#D65A5A"
                  fill="url(#gradExpense)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-icon" style={{ color: "#4F5DED" }}>
                <FaChartLine size={40} />
              </div>
              <div className="empty-title">No data yet</div>
              <div className="empty-desc">Add transactions to see trends</div>
            </div>
          )}
        </div>

        {/* Expense Breakdown Donut Chart Card */}
        <div
          className="card card-p animate-in"
          style={{ animationDelay: "0.4s", borderRadius: "0.875rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#1A1A1E" }}>
                Expense Breakdown
              </h3>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#6B6B72",
                  marginTop: "0.125rem",
                }}
              >
                By category
              </p>
            </div>
          </div>

          {categoryData.length > 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                marginTop: "0.5rem",
              }}
            >
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, idx) => (
                      <Cell key={idx} fill={entry?.color || "#4F5DED"} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatCurrency(v)}
                    contentStyle={{
                      background: "#FFFFFF",
                      border: "1px solid #E8E8EA",
                      borderRadius: 8,
                      color: "#1A1A1E",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {categoryData.slice(0, 5).map((cat) => (
                  <div
                    key={cat.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      padding: "0.35rem 0.625rem",
                      borderRadius: "0.5rem",
                      border: `1px solid ${cat.border}`,
                      background: cat.bg,
                      fontSize: "0.8125rem",
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: cat.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontWeight: 600,
                        color: "#1A1A1E",
                      }}
                    >
                      {cat.name}
                    </span>
                    <span
                      style={{
                        fontWeight: 800,
                        color: "#1A1A1E",
                      }}
                    >
                      {formatCurrency(cat.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2.5rem 1rem" }}>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "#1A1A1E", marginBottom: "0.25rem" }}>
                No expenses recorded yet
              </div>
              <div style={{ fontSize: "0.8125rem", color: "#6B6B72" }}>
                Add expense transactions to view category distribution
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div
        className="card animate-in"
        style={{ animationDelay: "0.5s", borderRadius: "1.25rem" }}
      >
        <div
          className="card-p"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <h3 style={{ fontSize: "1.0625rem", fontWeight: 800 }}>
            Recent Transactions
          </h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link
              to="/add"
              className="btn btn-sm btn-primary"
              style={{
                borderRadius: "9999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <FaPlus size={12} /> Add
            </Link>
            <Link
              to="/transactions"
              className="btn btn-sm btn-secondary"
              style={{
                borderRadius: "9999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              View All <FaArrowRight size={12} />
            </Link>
          </div>
        </div>

        {recentTx.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTx.map((tx) => {
                const cat = categories.find((c) => c.name === tx.category);
                const isIncome = tx.type === "income";
                return (
                  <tr key={tx.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.625rem",
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            background: isIncome
                              ? "rgba(16,185,129,0.1)"
                              : "rgba(244,63,94,0.1)",
                          }}
                        >
                          {isIncome ? (
                            <FaArrowTrendUp size={15} color="#10B981" />
                          ) : (
                            <FaArrowTrendDown size={15} color="#EF4444" />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                            {tx.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: isIncome
                            ? "rgba(16,185,129,0.12)"
                            : "rgba(239,68,68,0.12)",
                          color: isIncome ? "#10B981" : "#EF4444",
                        }}
                      >
                        <CategoryIcon name={cat?.icon} size={12} />
                        {tx.category}
                      </span>
                    </td>
                    <td
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {getRelativeDate(tx.date)}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: 700,
                        color: isIncome ? "#10B981" : "#EF4444",
                      }}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "3rem 1.5rem" }}>
            <div style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#1A1A1E", marginBottom: "0.35rem" }}>
              No transactions recorded yet
            </div>
            <div style={{ fontSize: "0.85rem", color: "#6B6B72", marginBottom: "1.25rem" }}>
              Click below to record your first transaction
            </div>
            <Link
              to="/add"
              className="btn btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1.25rem",
                borderRadius: "0.5rem",
                backgroundColor: "#4F5DED",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              <FaPlus size={14} /> Add Transaction
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
