// src/components/AnalyticsView.tsx
import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

export default function AnalyticsView() {
  const { transactions, currency } = useApp();
  const [chartTab, setChartTab] = useState<"cashflow" | "weekly" | "categories" | "savings" | "heatmap">("cashflow");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(val);
  };

  // 1. Calculations: Cash Flow Trend (Last 6 Months)
  const cashFlowData = useMemo(() => {
    const now = new Date();
    const months: { month: string; label: string; Income: number; Expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${y}-${m}`;
      months.push({ 
        month: key, 
        label: d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }), 
        Income: 0, 
        Expense: 0 
      });
    }

    transactions.forEach(t => {
      const mKey = (t.date || "").slice(0, 7);
      const match = months.find(m => m.month === mKey);
      if (match) {
        if (t.type === "income") match.Income += Number(t.amount) || 0;
        else match.Expense += Number(t.amount) || 0;
      }
    });

    return months;
  }, [transactions]);

  // 2. Calculations: Weekly Distribution (Bar Chart of Mon-Sun)
  const weeklyData = useMemo(() => {
    const days = [
      { name: "Mon", Expense: 0 },
      { name: "Tue", Expense: 0 },
      { name: "Wed", Expense: 0 },
      { name: "Thu", Expense: 0 },
      { name: "Fri", Expense: 0 },
      { name: "Sat", Expense: 0 },
      { name: "Sun", Expense: 0 },
    ];

    transactions.forEach(t => {
      if (t.type === "expense") {
        const dateObj = new Date(t.date + "T00:00:00");
        let dayIdx = dateObj.getDay(); // 0 is Sunday, 1 is Monday...
        // map Sunday to index 6, Monday to index 0
        const mappedIdx = dayIdx === 0 ? 6 : dayIdx - 1;
        if (days[mappedIdx]) {
          days[mappedIdx].Expense += t.amount;
        }
      }
    });

    return days.map(d => ({ ...d, Expense: parseFloat(d.Expense.toFixed(2)) }));
  }, [transactions]);

  // 3. Calculations: Categories Pie Chart
  const pieData = useMemo(() => {
    const sums: { [key: string]: number } = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      sums[t.category] = (sums[t.category] || 0) + t.amount;
    });

    return Object.entries(sums).map(([name, value], idx) => {
      return {
        name,
        value: parseFloat(value.toFixed(2)),
        color: idx === 0 ? "#4F5DED" : "#D8D8DD"
      };
    }).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // 4. Calculations: Cumulative Savings Line Chart
  const savingsCumulativeData = useMemo(() => {
    let cumulative = 0;
    // Sort transactions chronologically
    const chronoTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Group net savings by date
    const dailySavings: { [key: string]: number } = {};
    chronoTx.forEach(t => {
      const amt = Number(t.amount) || 0;
      const delta = t.type === "income" ? amt : -amt;
      const dKey = (t.date || "").slice(0, 10);
      dailySavings[dKey] = (dailySavings[dKey] || 0) + delta;
    });

    const dates = Object.keys(dailySavings).sort();
    const result: { date: string; Savings: number }[] = [];

    if (dates.length === 1) {
      const firstD = new Date(dates[0] + "T00:00:00");
      const prevD = new Date(firstD);
      prevD.setDate(prevD.getDate() - 1);
      result.push({
        date: prevD.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        Savings: 0
      });
    }

    dates.forEach(date => {
      cumulative += dailySavings[date];
      const dObj = new Date(date + "T00:00:00");
      const label = dObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      result.push({
        date: label,
        Savings: parseFloat(cumulative.toFixed(2))
      });
    });

    return result.slice(-30); // show last 30 active days
  }, [transactions]);

  // 5. Calculations: Custom Heatmap (intensity of spending by category vs day-of-week)
  const heatmapData = useMemo(() => {
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const cats = ["Food", "Transport", "Shopping", "Entertainment", "Bills"];
    
    // Initialize matrix
    const matrix: { [key: string]: { [key: string]: number } } = {};
    cats.forEach(c => {
      matrix[c] = {};
      weekdays.forEach(w => {
        matrix[c][w] = 0;
      });
    });

    // Populate matrix
    transactions.forEach(t => {
      if (t.type === "expense" && cats.includes(t.category)) {
        const dObj = new Date(t.date + "T00:00:00");
        const dIdx = dObj.getDay();
        const wName = weekdays[dIdx === 0 ? 6 : dIdx - 1];
        matrix[t.category][wName] += t.amount;
      }
    });

    // Find max value in matrix for opacity relative scaling
    let maxVal = 1;
    cats.forEach(c => {
      weekdays.forEach(w => {
        if (matrix[c][w] > maxVal) maxVal = matrix[c][w];
      });
    });

    return {
      matrix,
      cats,
      weekdays,
      maxVal
    };
  }, [transactions]);

  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "2rem" }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>Advanced Financial Analytics</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
          In-depth behavioral charts and cash flow distributions
        </p>
      </div>

      {/* Sub tabs Menu */}
      <div 
        className="glass-card" 
        style={{ 
          display: "flex", 
          gap: "0.5rem", 
          padding: "0.5rem", 
          flexWrap: "wrap", 
          borderRadius: "0.5rem",
          background: "var(--bg-surface)" 
        }}
      >
        {[
          { id: "cashflow", label: "📈 Cash Flow", icon: "" },
          { id: "weekly", label: "📅 Weekly Report", icon: "" },
          { id: "categories", label: "🍕 Category Share", icon: "" },
          { id: "savings", label: "🎯 Savings Growth", icon: "" },
          { id: "heatmap", label: "🔥 Spending Heatmap", icon: "" },
        ].map(tab => (
          <button
            key={tab.id}
            className="btn"
            onClick={() => setChartTab(tab.id as any)}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
              background: chartTab === tab.id ? "var(--color-primary)" : "transparent",
              color: chartTab === tab.id ? "#ffffff" : "var(--color-text-secondary)",
              boxShadow: chartTab === tab.id ? "var(--shadow-md)" : "none"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Active Chart Window */}
      <div className="glass-card" style={{ minHeight: "400px", display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        {/* Render Tab: Cashflow Area Chart */}
        {chartTab === "cashflow" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem" }}>Monthly Cash Flow Overview</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                Income vs Expense accumulation trend across the last 6 months.
              </p>
            </div>
            <div style={{ flex: 1, width: "100%", height: "320px", marginTop: "1rem" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="flowInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="flowExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "0.5rem", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
                    itemStyle={{ color: "#38BDF8", fontWeight: 700, fontSize: 13 }}
                    labelStyle={{ color: "#F8FAFC", fontWeight: 800, fontSize: 12, marginBottom: 4 }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="Income" stroke="var(--color-success)" fillOpacity={1} fill="url(#flowInc)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="Expense" stroke="var(--color-danger)" fillOpacity={1} fill="url(#flowExp)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Render Tab: Weekly Bar Chart */}
        {chartTab === "weekly" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem" }}>Weekly Expense Distribution</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                Aggregated expenses by day of the week to analyze shopping patterns.
              </p>
            </div>
            <div style={{ flex: 1, width: "100%", height: "320px", marginTop: "1rem" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "0.5rem", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
                    itemStyle={{ color: "#38BDF8", fontWeight: 700, fontSize: 13 }}
                    labelStyle={{ color: "#F8FAFC", fontWeight: 800, fontSize: 12, marginBottom: 4 }}
                    cursor={{ fill: "var(--border-color)", opacity: 0.15 }}
                  />
                  <Legend />
                  <Bar dataKey="Expense" name="Expenses (USD)" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Render Tab: Category share Pie Chart */}
        {chartTab === "categories" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem" }}>Expense Breakdowns By Categories</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                Aggregated historical expenses split by sector category.
              </p>
            </div>
            {pieData.length === 0 ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}>
                No expenses found to chart.
              </div>
            ) : (
              <div style={{ flex: 1, width: "100%", height: "320px", marginTop: "1rem" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="48%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                    contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "0.5rem", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
                    itemStyle={{ color: "#38BDF8", fontWeight: 700, fontSize: 13 }}
                    labelStyle={{ color: "#F8FAFC", fontWeight: 800, fontSize: 12, marginBottom: 4 }}
                  />
                    <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" wrapperStyle={{ fontSize: "0.8rem" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Render Tab: Cumulative Savings growth Line Chart */}
        {chartTab === "savings" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem" }}>Cumulative Net Asset Growth</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                Calculates daily net balance changes and aggregates total asset growth over time.
              </p>
            </div>
            {savingsCumulativeData.length === 0 ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}>
                Insufficient transaction records to plot growth.
              </div>
            ) : (
              <div style={{ flex: 1, width: "100%", height: "320px", marginTop: "1rem" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={savingsCumulativeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }} tickLine={false} />
                    <Tooltip 
                    contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "0.5rem", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
                    itemStyle={{ color: "#38BDF8", fontWeight: 700, fontSize: 13 }}
                    labelStyle={{ color: "#F8FAFC", fontWeight: 800, fontSize: 12, marginBottom: 4 }}
                  />
                    <Legend />
                    <Line type="monotone" dataKey="Savings" name="Net Value" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Render Tab: Spend Heatmap grid matrix */}
        {chartTab === "heatmap" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem" }}>🔥 Spending Activity Heatmap</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
                Correlates expense amount totals by sector category against weekdays.
              </p>
            </div>

            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: "500px", padding: "0.5rem" }}>
                {/* Heatmap Grid Header */}
                <div style={{ display: "grid", gridTemplateColumns: "100px repeat(7, 1fr)", gap: "4px", textAlign: "center", fontWeight: 700, fontSize: "0.8rem", marginBottom: "4px" }}>
                  <div style={{ textAlign: "left" }}>Category</div>
                  {heatmapData.weekdays.map(w => (
                    <div key={w} style={{ padding: "0.5rem", color: "var(--color-text-secondary)" }}>{w}</div>
                  ))}
                </div>

                {/* Heatmap Rows */}
                {heatmapData.cats.map(cat => (
                  <div key={cat} style={{ display: "grid", gridTemplateColumns: "100px repeat(7, 1fr)", gap: "4px", alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem", textAlign: "left" }}>{cat}</div>
                    {heatmapData.weekdays.map(w => {
                      const val = heatmapData.matrix[cat][w];
                      const opacity = val > 0 ? Math.max(0.12, Math.min(1.0, val / heatmapData.maxVal)) : 0;
                      const bgColor = val > 0 ? `rgba(99, 102, 241, ${opacity})` : "var(--border-color)";
                      const color = opacity > 0.5 ? "#ffffff" : "var(--color-text-primary)";

                      return (
                        <div
                          key={w}
                          style={{
                            backgroundColor: bgColor,
                            color,
                            padding: "0.75rem 0.25rem",
                            borderRadius: "0.375rem",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textAlign: "center",
                            transition: "all 0.2s"
                          }}
                          title={`${cat} spent on ${w}: ${formatCurrency(val)}`}
                        >
                          {val > 0 ? `₹${val.toFixed(0)}` : "-"}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Legend scale indicator */}
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "flex-end", marginTop: "1rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              <span>Low Spending</span>
              <div style={{ width: "60px", height: "10px", borderRadius: "2px", background: "linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 1))" }} />
              <span>High Spending</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
