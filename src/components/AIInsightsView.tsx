// src/components/AIInsightsView.tsx
import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { calculateHealthScore, predictSpending, detectUnusualSpending, generateInsights } from "../utils/aiEngine";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export default function AIInsightsView() {
  const { transactions, budgets, currency } = useApp();

  // AI Calculations
  const healthStats = useMemo(() => calculateHealthScore(transactions, budgets), [transactions, budgets]);
  const forecasts = useMemo(() => predictSpending(transactions), [transactions]);
  const unusualExpenses = useMemo(() => detectUnusualSpending(transactions), [transactions]);
  const insights = useMemo(() => generateInsights(transactions, budgets), [transactions, budgets]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(val);
  };

  // chatbot states
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    { sender: "ai", text: "Hello! I am your Apex AI Financial Assistant. Ask me about your spending predictions, unusual expenses, or how to improve your financial health score." }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const newUserMessage: ChatMessage = { sender: "user", text: userText };
    setChatLog(prev => [...prev, newUserMessage]);
    setChatInput("");

    // Simulate AI thinking and reply
    setTimeout(() => {
      let aiReply = "";
      const text = userText.toLowerCase();

      if (text.includes("predict") || text.includes("forecast") || text.includes("next month")) {
        aiReply = `Based on your last 6 months of ledger logs, our prediction algorithms project a monthly spending of **${formatCurrency(forecasts.predictedTotal)}** next month (representing a **${forecasts.percentChange}%** trend ${forecasts.trend}). Our confidence level is **${forecasts.confidence}%**.`;
      } else if (text.includes("health") || text.includes("score")) {
        aiReply = `Your overall Financial Health Score is **${healthStats.score}/100**. Your Budget Discipline scored **${healthStats.breakdown.budget}%** and Savings Rate scored **${healthStats.breakdown.savings}%**. To improve your score, try reducing category budget overruns.`;
      } else if (text.includes("unusual") || text.includes("flag") || text.includes("alert")) {
        if (unusualExpenses.length === 0) {
          aiReply = "Great news! Our AI sweep detected no unusual transaction anomalies in your ledger recently. All category spending matches your historical benchmarks.";
        } else {
          const item = unusualExpenses[0];
          aiReply = `Alert: We detected anomalous spending of **${formatCurrency(item.transaction.amount)}** on "${item.transaction.description}" in the ${item.transaction.category} category. This is **${item.multiplier}x** higher than your average of ${formatCurrency(item.average)} in that category.`;
        }
      } else if (text.includes("save") || text.includes("budget") || text.includes("advice")) {
        const topInsight = insights[0] || "Review your transaction log and establish monthly ceilings on categories like Food and Shopping to increase surplus.";
        aiReply = `Here is my recommendation: ${topInsight}`;
      } else {
        aiReply = "I can analyze your spending. Try asking me: 'What is my budget health score?', 'Predict my next month spending', or 'Have I spent unusually recently?'";
      }

      setChatLog(prev => [...prev, { sender: "ai", text: aiReply }]);
    }, 600);
  };

  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "2rem" }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>Apex AI Assistant</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
          Predictive budgets, health analysis, and custom financial advice.
        </p>
      </div>

      {/* Grid Layout: Health Score, Predictions & Interactive chatbot */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "1.5rem" }} id="ai-view-grid">
        
        {/* Left Column: Health and Predictions metrics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Health Score Card */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.15rem", width: "100%", textAlign: "left" }}>Financial Health Standing</h2>
            
            {/* Visual Gauge */}
            <div style={{ position: "relative", width: "120px", height: "120px" }}>
              <svg width="120" height="120" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--border-color)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="3"
                  strokeDasharray={`${healthStats.score}, 100`}
                />
              </svg>
              <div 
                style={{ 
                  position: "absolute", 
                  inset: 0, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  fontFamily: "var(--font-heading)"
                }}
              >
                {healthStats.score}%
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
              Calculated based on your monthly surplus savings rate and category budget adherence.
            </p>
          </div>

          {/* Predictions Forecasting Card */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h2 style={{ fontSize: "1.15rem" }}>Next 30 Days Forecast</h2>
            
            <div style={{ padding: "0.75rem", borderRadius: "0.5rem", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Estimated Spend</span>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800 }}>{formatCurrency(forecasts.predictedTotal)}</h3>
              </div>
              <span 
                className="badge"
                style={{ 
                  backgroundColor: forecasts.trend === "up" ? "var(--color-danger-light)" : forecasts.trend === "down" ? "var(--color-success-light)" : "var(--color-primary-light)",
                  color: forecasts.trend === "up" ? "var(--color-danger)" : forecasts.trend === "down" ? "var(--color-success)" : "var(--color-primary)"
                }}
              >
                {forecasts.trend === "up" ? "📈 Rising" : forecasts.trend === "down" ? "📉 Falling" : "Flat"} ({Math.abs(forecasts.percentChange)}%)
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
              <span>Confidence Rating:</span>
              <strong style={{ color: "var(--color-primary)" }}>{forecasts.confidence}%</strong>
            </div>
            
            <div className="progress-bar" style={{ height: "8px", borderRadius: "999px", backgroundColor: "#123226" }}>
              <div className="fill" style={{ width: `${forecasts.confidence}%`, backgroundColor: "#00C853", backgroundImage: "none", borderRadius: "999px" }} />
            </div>
          </div>

          {/* Unusual Activity List */}
          {unusualExpenses.length > 0 && (
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", borderLeft: "4px solid var(--color-danger)" }}>
              <h3 style={{ fontSize: "0.95rem", color: "var(--color-danger)" }}>⚠️ Unusual Spends Detected</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {unusualExpenses.map((item, idx) => (
                  <div key={idx} style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>
                    We flagged **{formatCurrency(item.transaction.amount)}** on "{item.transaction.description}" as **{item.multiplier}x** larger than average spending in {item.transaction.category}.
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Chatbot assistant */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "480px" }}>
          <h2 style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>AI Conversation Assistant</h2>
          
          {/* Chat log view */}
          <div 
            style={{ 
              flex: 1, 
              overflowY: "auto", 
              display: "flex", 
              flexDirection: "column", 
              gap: "0.75rem", 
              padding: "1rem", 
              borderRadius: "0.5rem", 
              border: "1px solid var(--border-color)",
              background: "rgba(0,0,0,0.05)",
              marginBottom: "1rem"
            }}
          >
            {chatLog.map((msg, idx) => {
              const isAi = msg.sender === "ai";
              return (
                <div 
                  key={idx}
                  style={{
                    alignSelf: isAi ? "flex-start" : "flex-end",
                    maxWidth: "85%",
                    padding: "0.625rem 0.875rem",
                    borderRadius: "0.5rem",
                    backgroundColor: isAi ? "var(--bg-surface)" : "var(--color-primary)",
                    color: isAi ? "var(--color-text-primary)" : "#ffffff",
                    fontSize: "0.85rem",
                    lineHeight: "1.4",
                    boxShadow: "var(--shadow-sm)",
                    border: isAi ? "1px solid var(--border-color)" : "none"
                  }}
                >
                  {msg.text}
                </div>
              );
            })}
          </div>

          {/* Input Sender Form */}
          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              placeholder="Ask AI: 'predict my spending' or 'how can I save more?'"
              className="input-field"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              required
              aria-label="Chat input field"
            />
            <button type="submit" className="btn btn-primary" style={{ padding: "0.625rem 1.25rem" }}>
              Send
            </button>
          </form>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          #ai-view-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
