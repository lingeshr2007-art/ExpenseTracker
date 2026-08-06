// src/components/CategoryChart.jsx
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { FaChartPie } from "react-icons/fa6";
import { chartColors } from "../theme/colors";

const THREE_MAJOR_COLORS = [chartColors.primary, chartColors.expense, chartColors.income];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div 
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          padding: "0.5rem 0.75rem",
          borderRadius: "0.5rem",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "var(--color-text-primary)" }}>
          {payload[0].name}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: "0.9rem", color: chartColors.primary, fontWeight: 700 }}>
          ₹{payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export default function CategoryChart({ data = [] }) {
  const hasData = data && data.length > 0 && data.some(d => d.value > 0);

  const formattedData = data.map((entry, idx) => ({
    ...entry,
    color: idx === 0 ? "#4F5DED" : "#D8D8DD",
  }));

  return (
    <div className="card category-chart-card" style={{ display: "flex", flexDirection: "column", minHeight: "340px" }}>
      <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Expense by Category</h2>
      
      {!hasData ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)" }}>
          <FaChartPie size={40} style={{ color: "var(--color-primary)", marginBottom: "0.5rem" }} />
          <p style={{ fontSize: "0.9rem" }}>No expense data to display</p>
        </div>
      ) : (
        <div style={{ flex: 1, width: "100%", height: "260px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                animationDuration={800}
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                iconSize={10} 
                iconType="circle"
                wrapperStyle={{ 
                  fontSize: "0.8rem", 
                  paddingTop: "10px" 
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
