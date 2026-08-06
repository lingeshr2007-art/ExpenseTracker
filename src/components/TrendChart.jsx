// src/components/TrendChart.jsx
import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { FaChartSimple } from "react-icons/fa6";
import { chartColors } from "../theme/colors";

function formatMonth(monthStr) {
  if (!monthStr) return "";
  const [year, month] = monthStr.split("-");
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'short' });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div 
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          padding: "0.6rem 0.85rem",
          borderRadius: "0.5rem",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "var(--color-text-primary)" }}>
          {label}
        </p>
        <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ fontSize: "0.85rem", color: chartColors.income, fontWeight: 600 }}>
            Income: ₹{payload[0].value.toFixed(2)}
          </span>
          <span style={{ fontSize: "0.85rem", color: chartColors.expense, fontWeight: 600 }}>
            Expense: ₹{payload[1].value.toFixed(2)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function TrendChart({ data = [] }) {
  const formattedData = data.map((d) => ({
    ...d,
    displayMonth: formatMonth(d.month),
  }));

  const hasData = data && data.some(d => d.income > 0 || d.expense > 0);

  return (
    <div className="card trend-chart-card" style={{ display: "flex", flexDirection: "column", minHeight: "340px" }}>
      <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Monthly Trend</h2>
      
      {!hasData ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)" }}>
          <FaChartSimple size={40} style={{ color: "var(--color-primary)", marginBottom: "0.5rem" }} />
          <p style={{ fontSize: "0.9rem" }}>No trend data to display</p>
        </div>
      ) : (
        <div style={{ flex: 1, width: "100%", height: "260px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis 
                dataKey="displayMonth" 
                tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-border)", opacity: 0.15 }} />
              <Legend 
                verticalAlign="bottom" 
                iconSize={10} 
                iconType="circle"
                wrapperStyle={{ 
                  fontSize: "0.8rem", 
                  paddingTop: "10px" 
                }}
              />
              <Bar 
                dataKey="income" 
                name="Income" 
                fill={chartColors.income} 
                radius={[4, 4, 0, 0]} 
                animationDuration={800}
              />
              <Bar 
                dataKey="expense" 
                name="Expense" 
                fill={chartColors.expense} 
                radius={[4, 4, 0, 0]} 
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
