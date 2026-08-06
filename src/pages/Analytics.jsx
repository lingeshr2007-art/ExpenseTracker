// src/pages/Analytics.jsx
import React, { useMemo } from "react";
import useStore from "../store/useStore";
import { formatCurrency } from "../utils/format";
import { CategoryIcon } from "../utils/categoryIcons";
import { getPastelCategoryColors } from "../utils/categoryColors";
import { FaChartLine, FaChartPie, FaTrophy } from "react-icons/fa6";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

const TOOLTIP_STYLE = {
  backgroundColor: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
  padding: "8px 12px",
};
const TOOLTIP_ITEM_STYLE = { color: "#3EC3D5", fontWeight: 700, fontSize: 13 };
const TOOLTIP_LABEL_STYLE = {
  color: "var(--color-text)",
  fontWeight: 800,
  fontSize: 12,
  marginBottom: 4,
};

const AESTHETIC_PALETTE = [
  "#8B5CF6", // Soft Lavender
  "#FB923C", // Soft Light Peach
  "#34D399", // Soft Mint Green
  "#60A5FA", // Soft Sky Blue
  "#F472B6", // Soft Rose Pink
  "#A78BFA", // Soft Lilac
  "#F59E0B", // Soft Warm Amber
  "#818CF8", // Soft Periwinkle
];

export default function Analytics() {
  const {
    budget,
    categories,
    getMonthlyExpense,
    getCategoryBreakdown,
    getBalanceOverTime,
  } = useStore();

  const monthlyExpense = getMonthlyExpense();
  const rawCategoryData = getCategoryBreakdown();
  const balanceData = getBalanceOverTime();

  const budgetPercent =
    budget > 0 ? Math.round((monthlyExpense / budget) * 100) : 0;
  const remaining = budget - monthlyExpense;

  const categoryData = useMemo(() => {
    return rawCategoryData.map((cat, idx) => {
      const matchObj = categories?.find(
        (c) => c.name.toLowerCase() === cat.name.toLowerCase()
      );
      return {
        ...cat,
        color: matchObj?.color || AESTHETIC_PALETTE[idx % AESTHETIC_PALETTE.length],
      };
    });
  }, [rawCategoryData, categories]);

  // Ring params
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, budgetPercent);
  const offset = circumference * (1 - clampedPercent / 100);
  const ringColor =
    budgetPercent >= 90 ? "#D65A5A" : budgetPercent >= 70 ? "#D9A441" : "#4F5DED";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Page Header */}
      <div>
        <h2 className="page-title">Analytics</h2>
        <p className="page-subtitle">Insights into your financial health</p>
      </div>

      {/* Row 1: Balance Line Chart + Monthly Budget Card */}
      <div className="grid-2">
        {/* Balance Over Time Chart Card (Matching Reference Photo) */}
        <div
          className="card card-p animate-in"
          style={{
            borderRadius: "1.25rem",
            background: "linear-gradient(180deg, #EFF4FF 0%, #E5EFFF 100%)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "1rem",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "1.0625rem",
                  fontWeight: 800,
                  color: "#1E1B4B",
                  marginBottom: "0.25rem",
                }}
              >
                Balance Over Time
              </h3>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#64748B",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                }}
              >
                Total this month
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <span
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    color: "#1E1B4B",
                    lineHeight: 1,
                  }}
                >
                  {formatCurrency(balanceData[balanceData.length - 1]?.balance || 59690)}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    background: "#4F5DED",
                    color: "#FFFFFF",
                    padding: "2px 8px",
                    borderRadius: "6px",
                  }}
                >
                  ↑ 13.4%
                </span>
              </div>
            </div>

            <select
              style={{
                background: "#FFFFFF",
                border: "1px solid #CBD5E1",
                borderRadius: "8px",
                padding: "4px 10px",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#1E1B4B",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="August">August ▾</option>
              <option value="July">July ▾</option>
              <option value="June">June ▾</option>
            </select>
          </div>

          {balanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={balanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="blueWaveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#64748B", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748B", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    border: "none",
                    borderRadius: 8,
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "12px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                    padding: "6px 12px",
                  }}
                  itemStyle={{ color: "#3B82F6", fontWeight: 800 }}
                  labelStyle={{ color: "#94A3B8", fontWeight: 600, fontSize: "11px", marginBottom: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#3B82F6"
                  fill="url(#blueWaveGrad)"
                  strokeWidth={3.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-icon" style={{ color: "#3B82F6" }}>
                <FaChartLine size={36} />
              </div>
              <div className="empty-desc">No transactions to track</div>
            </div>
          )}
        </div>

        {/* Monthly Budget Card (Matching Reference Picture 2) */}
        <div
          className="card card-p animate-in"
          style={{ animationDelay: "0.1s", borderRadius: "1.25rem" }}
        >
          <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, marginBottom: "1rem" }}>
            Monthly Budget
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.25rem",
            }}
          >
            {/* SVG Circular Ring */}
            <div className="ring-container" style={{ width: 180, height: 180 }}>
              <svg className="ring-svg" width={180} height={180}>
                <circle
                  className="ring-track"
                  cx={90}
                  cy={90}
                  r={radius}
                  strokeWidth={12}
                  fill="none"
                />
                <circle
                  className="ring-fill"
                  cx={90}
                  cy={90}
                  r={radius}
                  strokeWidth={12}
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
                    fontSize: "2rem",
                    fontWeight: 800,
                    lineHeight: 1,
                    color: budgetPercent >= 100 ? "#FF5460" : "var(--color-text)",
                  }}
                >
                  {budgetPercent}%
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: budgetPercent >= 100 ? "#FF5460" : "var(--color-text-muted)",
                    marginTop: "0.25rem",
                    fontWeight: 700,
                  }}
                >
                  {budgetPercent >= 100 ? "exceeded!" : "used"}
                </div>
              </div>
            </div>

            {/* Spent, Progress Bar, Budget, Remaining List */}
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8125rem",
                }}
              >
                <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>
                  Spent
                </span>
                <span style={{ fontWeight: 800, color: "var(--color-text)" }}>
                  {formatCurrency(monthlyExpense)}
                </span>
              </div>

              <div
                className="progress-bar"
                style={{
                  height: "8px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(148,163,184,0.2)",
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
                  fontSize: "0.8125rem",
                }}
              >
                <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>
                  Budget
                </span>
                <span style={{ fontWeight: 800, color: "var(--color-text)" }}>
                  {formatCurrency(budget)}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8125rem",
                }}
              >
                <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>
                  Remaining
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    color: remaining < 0 ? "#D65A5A" : "#4F5DED",
                  }}
                >
                  {remaining < 0
                    ? `-${formatCurrency(Math.abs(remaining))}`
                    : formatCurrency(remaining)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Top Spending Categories Ranking Card */}
      <div
        className="card card-p animate-in"
        style={{ animationDelay: "0.2s", borderRadius: "1.25rem", border: "1px solid #E8E8EA" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#1A1A1E" }}>
              Top Spending Categories
            </h3>
            <p style={{ fontSize: "0.75rem", color: "#6B6B72", marginTop: "0.125rem" }}>
              Ranked by total monthly expenses
            </p>
          </div>
        </div>

        {categoryData.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {categoryData.map((cat, idx) => {
              const max = categoryData[0]?.value || 1;
              const pct = Math.round((cat.value / max) * 100);
              const palette = getPastelCategoryColors(cat.name, idx);

              return (
                <div
                  key={cat.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.875rem",
                    border: `1px solid ${palette.border}`,
                    background: palette.bg,
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#FFFFFF",
                      border: `1px solid ${palette.border}`,
                      color: palette.primary,
                      flexShrink: 0,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    }}
                  >
                    <CategoryIcon name={cat.icon} size={18} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.4rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "0.875rem",
                            color: "#1A1A1E",
                          }}
                        >
                          {cat.name}
                        </span>
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            padding: "1px 7px",
                            borderRadius: "9999px",
                            border: `1px solid ${palette.border}`,
                            background: "#FFFFFF",
                            color: palette.primary,
                            fontWeight: 700,
                          }}
                        >
                          {pct}%
                        </span>
                      </div>

                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: "0.9375rem",
                          color: "#1A1A1E",
                        }}
                      >
                        {formatCurrency(cat.value)}
                      </span>
                    </div>

                    <div
                      className="progress-bar"
                      style={{
                        height: "5px",
                        borderRadius: "9999px",
                        backgroundColor: "#FFFFFF",
                        border: `1px solid ${palette.border}`,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        className="fill"
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          backgroundColor: palette.primary,
                          borderRadius: "9999px",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2.5rem 1rem" }}>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "#1A1A1E", marginBottom: "0.25rem" }}>
              No spending data available
            </div>
            <div style={{ fontSize: "0.8125rem", color: "#6B6B72" }}>
              Record your expenses to see top categories
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
