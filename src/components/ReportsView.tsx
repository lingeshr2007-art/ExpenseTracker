// src/components/ReportsView.tsx
import { useState, useMemo, useRef, type ChangeEvent } from "react";
import { useApp } from "../context/AppContext";
import { saveAs } from "file-saver";
import type { Transaction } from "../types";

export default function ReportsView() {
  const { transactions, accounts, importCSVData, currency } = useApp();
  const [reportType, setReportType] = useState<"weekly" | "monthly" | "yearly" | "custom">("monthly");
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString()); // YYYY
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(val);
  };

  // Compile Report Date Range based on selectors
  const dateRange = useMemo(() => {
    let start = "";
    let end = "";

    const now = new Date();
    if (reportType === "weekly") {
      // Last 7 days
      const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      start = lastWeek.toISOString().slice(0, 10);
      end = now.toISOString().slice(0, 10);
    } else if (reportType === "monthly") {
      // Full month
      start = `${selectedMonth}-01`;
      const [y, m] = selectedMonth.split("-").map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      end = `${selectedMonth}-${lastDay}`;
    } else if (reportType === "yearly") {
      // Full year
      start = `${selectedYear}-01-01`;
      end = `${selectedYear}-12-31`;
    } else {
      start = startDate;
      end = endDate;
    }

    return { start, end };
  }, [reportType, selectedMonth, selectedYear, startDate, endDate]);

  // Filter transactions in date range
  const reportTransactions = useMemo(() => {
    const { start, end } = dateRange;
    return transactions.filter(t => {
      let match = true;
      if (start) match = match && t.date >= start;
      if (end) match = match && t.date <= end;
      return match;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, dateRange]);

  // Derived financials calculations
  const reportMetrics = useMemo(() => {
    const income = reportTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expense = reportTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense,
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0
    };
  }, [reportTransactions]);

  // Categorized breakdown summary table
  const categorySummary = useMemo(() => {
    const map: { [key: string]: number } = {};
    reportTransactions.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, spent]) => ({
      name,
      spent,
      percent: reportMetrics.expense > 0 ? (spent / reportMetrics.expense) * 100 : 0
    })).sort((a, b) => b.spent - a.spent);
  }, [reportTransactions, reportMetrics]);

  // Export handlers
  const handleExportCSV = () => {
    const headers = ["Date", "Description", "Type", "Category", "Amount", "Status"];
    const rows = reportTransactions.map(t => [
      t.date,
      `"${(t.description || "").replace(/"/g, '""')}"`,
      t.type,
      t.category,
      t.amount.toFixed(2),
      t.status || "cleared"
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const filename = `ApexFinance_Report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;
    saveAs(blob, filename);
  };

  const handleExportExcel = () => {
    // Generate clean tab-separated spreadsheet data labeled as .xls
    const headers = ["Date", "Description", "Type", "Category", "Wallet", "Amount (USD)", "Notes"];
    const rows = reportTransactions.map(t => [
      t.date,
      t.description,
      t.type,
      t.category,
      accounts.find(a => a.id === t.accountId)?.name || "Wallet",
      t.amount.toString(),
      t.notes || ""
    ]);

    const content = [
      headers.join("\t"),
      ...rows.map(row => row.map(v => v.replace(/\t/g, " ")).join("\t"))
    ].join("\r\n");

    const blob = new Blob([content], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const filename = `ApexFinance_Spreadsheet_${reportType}_${new Date().toISOString().slice(0, 10)}.xls`;
    saveAs(blob, filename);
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  // CSV Import handler
  const handleCSVImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;
        
        try {
          const lines = text.split(/\r?\n/);
          const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
          const list: Record<string, string>[] = [];

          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            // Match comma separators ignoring commas inside quotes
            const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const obj: Record<string, string> = {};
            for (let j = 0; j < headers.length; j++) {
              let val = currentline[j] ?? "";
              val = val.trim().replace(/^["']|["']$/g, "").replace(/""/g, '"');
              obj[headers[j]] = val;
            }
            list.push(obj);
          }

          // Map rows to App Transaction Schema
          const formattedImport: Omit<Transaction, "id">[] = list.map((item) => {
            const amount = parseFloat(item["Amount"] ?? "0") || parseFloat(item["Amount (USD)"] ?? "0") || 0;
            const typeStr = (item["Type"] || "expense").toLowerCase();
            return {
              description: item["Description"] || "Imported Transaction",
              amount,
              type: (typeStr === "income" ? "income" : "expense") as Transaction["type"],
              category: item["Category"] || "Other",
              date: item["Date"] || new Date().toISOString().slice(0, 10),
              accountId: accounts[0]?.id || "", // default to first wallet
              tags: item["Tags"] ? item["Tags"].split(";") : ["Imported"],
              notes: item["Notes"] || "Imported via CSV file",
              recurring: "none" as Transaction["recurring"],
              receiptImage: null,
              isFavorite: false,
              status: "cleared" as Transaction["status"]
            };
          });

          if (formattedImport.length > 0) {
            importCSVData(formattedImport);
          }
        } catch (_err) {
          alert("Error parsing CSV. Please verify that the CSV format conforms to the standard columns (Date, Description, Type, Category, Amount).");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "2rem" }}>
      
      {/* Title Panel */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>Financial Reports Exporter</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
            Generate executive printable balance sheets and spreadsheet files.
          </p>
        </div>

        {/* CSV Import integration */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".csv" 
            style={{ display: "none" }} 
            onChange={handleCSVImport}
            aria-label="CSV Import file selector"
          />
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            📥 Import CSV Ledger
          </button>
        </div>
      </div>

      {/* Exporter Controls Card */}
      <div className="glass-card no-print" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2 style={{ fontSize: "1.15rem" }}>Configure Scope Parameters</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 2fr", gap: "1.5rem", alignItems: "end" }} className="reports-grid-filters">
          <div className="form-group">
            <label htmlFor="report-scope" className="input-label">Report Scope</label>
            <select
              id="report-scope"
              className="input-field"
              value={reportType}
              onChange={e => setReportType(e.target.value as any)}
            >
              <option value="weekly">Weekly Report (Last 7 Days)</option>
              <option value="monthly">Monthly Report (Select Month)</option>
              <option value="yearly">Yearly Report (Select Year)</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Conditional Sub-selectors */}
          <div className="form-group">
            {reportType === "monthly" && (
              <>
                <label htmlFor="month-select" className="input-label">Select Month</label>
                <input
                  id="month-select"
                  type="month"
                  className="input-field"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                />
              </>
            )}
            {reportType === "yearly" && (
              <>
                <label htmlFor="year-select" className="input-label">Select Year</label>
                <select
                  id="year-select"
                  className="input-field"
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2025">2025</option>
                </select>
              </>
            )}
            {reportType === "custom" && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="custom-start" className="input-label">Start</label>
                  <input
                    id="custom-start"
                    type="date"
                    className="input-field"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="custom-end" className="input-label">End</label>
                  <input
                    id="custom-end"
                    type="date"
                    className="input-field"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Export Action Triggers */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleTriggerPrint}>
              🖨️ PDF/Print
            </button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleExportCSV}>
              📄 CSV
            </button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleExportExcel}>
              📊 Excel
            </button>
          </div>
        </div>
      </div>

      {/* Report Preview Document */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "3rem 2.5rem" }} id="printable-report-card">
        {/* Document Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2.5px solid var(--color-primary)", paddingBottom: "1.25rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontFamily: "var(--font-heading)" }}>APEXFINANCE EXECUTIVE REPORT</h1>
            <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
              Generated on: {new Date().toLocaleDateString(undefined, { dateStyle: "long" })}
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: "1.2rem", color: "var(--color-primary)" }}>APEXFINANCE CORP</h2>
            <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              Type: {reportType.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Date Scope Subtitle */}
        <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", fontStyle: "italic" }}>
          Financial ledger scope coverage: <strong>{dateRange.start || "Beginning"}</strong> through <strong>{dateRange.end || "Today"}</strong>
        </p>

        {/* Metrics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1.5rem" }} className="report-doc-metrics">
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)" }}>TOTAL INFLOW</span>
            <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--color-success)" }}>{formatCurrency(reportMetrics.income)}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)" }}>TOTAL OUTFLOW</span>
            <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--color-danger)" }}>{formatCurrency(reportMetrics.expense)}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)" }}>NET SURPLUS</span>
            <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--color-primary)" }}>{formatCurrency(reportMetrics.balance)}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)" }}>NET SAVINGS RATE</span>
            <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--color-accent)" }}>{reportMetrics.savingsRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Categories Breakdown Section */}
        {categorySummary.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h3 style={{ fontSize: "1.05rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.35rem" }}>Categorical Expense Ceilings</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--border-color)", color: "var(--color-text-secondary)", textAlign: "left", fontWeight: 700 }}>
                  <th style={{ padding: "0.5rem" }}>Category</th>
                  <th style={{ padding: "0.5rem", textAlign: "right" }}>Total Outflow</th>
                  <th style={{ padding: "0.5rem", textAlign: "right" }}>Outflow Share</th>
                </tr>
              </thead>
              <tbody>
                {categorySummary.map(item => (
                  <tr key={item.name} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "0.5rem", fontWeight: 600 }}>{item.name}</td>
                    <td style={{ padding: "0.5rem", textAlign: "right" }}>{formatCurrency(item.spent)}</td>
                    <td style={{ padding: "0.5rem", textAlign: "right" }}>{item.percent.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Ledger list section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h3 style={{ fontSize: "1.05rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.35rem" }}>Transaction Log Summary</h3>
          {reportTransactions.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
              No transactions recorded inside the specified date parameters.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--border-color)", color: "var(--color-text-secondary)", textAlign: "left" }}>
                  <th style={{ padding: "0.5rem" }}>Date</th>
                  <th style={{ padding: "0.5rem" }}>Description</th>
                  <th style={{ padding: "0.5rem" }}>Category</th>
                  <th style={{ padding: "0.5rem", textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {reportTransactions.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>{tx.date}</td>
                    <td style={{ padding: "0.5rem", fontWeight: 600 }}>{tx.description}</td>
                    <td style={{ padding: "0.5rem" }}>{tx.category}</td>
                    <td 
                      style={{ 
                        padding: "0.5rem", 
                        textAlign: "right", 
                        fontWeight: 700, 
                        color: tx.type === "income" ? "var(--color-success)" : "var(--color-text-primary)"
                      }}
                    >
                      {tx.type === "income" ? "+" : "-"} {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Document Footer Signature */}
        <div 
          style={{ 
            marginTop: "3rem", 
            borderTop: "1px solid var(--border-color)", 
            paddingTop: "1rem", 
            display: "flex", 
            justifyContent: "space-between", 
            fontSize: "0.75rem", 
            color: "var(--color-text-muted)" 
          }}
        >
          <span>ApexFinance Inc Report Management Service</span>
          <span>Security Tag: SEC-90382-XF</span>
        </div>
      </div>

      {/* Responsive print layouts adjustments CSS styles overrides */}
      <style>{`
        @media (max-width: 768px) {
          .reports-grid-filters {
            grid-template-columns: 1fr !important;
          }
          .report-doc-metrics {
            grid-template-columns: 1fr 1fr !important;
            gap: 1rem !important;
          }
        }
        @media print {
          #sidebar-container {
            display: none !important;
          }
          #printable-report-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            background: transparent !important;
          }
        }
      `}</style>
    </div>
  );
}
