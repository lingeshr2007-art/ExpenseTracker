// src/views/Dashboard.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { calculateHealthScore, generateInsights, detectUnusualSpending } from "../utils/aiEngine";
import type { Transaction } from "../types";
import { FaReceipt, FaImage } from "react-icons/fa6";
import { 
  Wallet, 
  HeartPulse, 
  AlertCircle, 
  Plus, 
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Star
} from "lucide-react";

interface DashboardProps {
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export default function Dashboard({ onAddTransaction, onEditTransaction }: DashboardProps) {
  const { transactions, categories, budgets, currency, user } = useApp();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(val);
  };

  const nowDateObj = new Date();
  const currentMonthStr = `${nowDateObj.getFullYear()}-${String(nowDateObj.getMonth() + 1).padStart(2, "0")}`;

  // Month computations
  const totals = useMemo(() => {
    const monthTx = transactions.filter(t => (t.date || "").slice(0, 7) === currentMonthStr);
    const income = monthTx.filter(t => t.type === "income").reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const expense = monthTx.filter(t => t.type === "expense").reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    return {
      income,
      expense,
      balance: income - expense,
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0
    };
  }, [transactions, currentMonthStr]);

  // Overall Budget metrics
  const budgetSummary = useMemo(() => {
    const totalLimit = budgets.reduce((sum, b) => sum + (Number(b.limit) || 0), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (Number(b.spent) || 0), 0);
    const percent = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;
    return { limit: totalLimit, spent: totalSpent, percent };
  }, [budgets]);

  // Recharts Chart: Monthly Trend Area (Past 6 Months)
  const cashFlowData = useMemo(() => {
    const now = new Date();
    const list: { month: string; label: string; Income: number; Expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${y}-${m}`;
      list.push({
        month: key,
        label: d.toLocaleDateString(undefined, { month: 'short' }),
        Income: 0,
        Expense: 0
      });
    }
    transactions.forEach(t => {
      const mKey = (t.date || "").slice(0, 7);
      const match = list.find(l => l.month === mKey);
      if (match) {
        if (t.type === "income") match.Income += t.amount;
        else match.Expense += t.amount;
      }
    });
    return list;
  }, [transactions]);

  // Recharts Chart: Expense Pie Category
  const pieData = useMemo(() => {
    const map: { [key: string]: number } = {};
    transactions.filter(t => t.type === "expense" && t.date.slice(0, 7) === currentMonthStr).forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => {
      const color = categories.find(c => c.name === name)?.color || "#94a3b8";
      return { name, value, color };
    }).sort((a, b) => b.value - a.value);
  }, [transactions, categories, currentMonthStr]);

  // AI insights & health calculation
  const health = useMemo(() => calculateHealthScore(transactions, budgets), [transactions, budgets]);
  const insights = useMemo(() => generateInsights(transactions, budgets), [transactions, budgets]);
  const unusualAlerts = useMemo(() => detectUnusualSpending(transactions), [transactions]);

  // Seed upcoming bills based on active monthly recurring transactions
  const upcomingBills = useMemo(() => {
    return transactions.filter(t => t.type === "expense" && t.recurring !== "none").slice(0, 3).map(b => {
      // simulate next due date as +30 days after transaction date
      const dateObj = new Date(b.date + "T00:00:00");
      dateObj.setDate(dateObj.getDate() + 30);
      return {
        id: b.id,
        description: b.description,
        amount: b.amount,
        dueDate: dateObj.toISOString().slice(0, 10),
        category: b.category
      };
    });
  }, [transactions]);

  return (
    <div className="flex flex-col gap-6 animate-slide-up relative min-h-full pb-20">
      
      {/* Floating Action Button (FAB) */}
      <button
        onClick={onAddTransaction}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all no-print"
        aria-label="Add transaction floating button"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Welcome Hero Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-primary/10 via-secondary/15 to-transparent relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
            Welcome back, {user?.name || "Member"}! 👋
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-lg">
            Apex AI scanned your ledger. Overall health score is <strong className="text-primary">{health.score}%</strong>. Savings rate is up this week!
          </p>
        </div>
        <div className="text-left md:text-right flex-shrink-0">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {new Date().toLocaleDateString(undefined, { weekday: "long" })}
          </p>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Financial Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Balance Card */}
        <div className="glass-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary dark:text-primary-dark flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Savings Balance</span>
            <h3 className="text-xl font-extrabold truncate mt-0.5">{formatCurrency(totals.balance)}</h3>
          </div>
        </div>

        {/* Income Card */}
        <div className="glass-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Monthly Inflow</span>
            <h3 className="text-xl font-extrabold text-emerald-500 truncate mt-0.5">{formatCurrency(totals.income)}</h3>
          </div>
        </div>

        {/* Expense Card */}
        <div className="glass-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Monthly Outflow</span>
            <h3 className="text-xl font-extrabold text-rose-500 truncate mt-0.5">{formatCurrency(totals.expense)}</h3>
          </div>
        </div>

        {/* Overall Budgets Card */}
        <div className="glass-card flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Budget Cap Usage</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {budgetSummary.percent.toFixed(0)}%
            </span>
          </div>
          <h3 className="text-lg font-extrabold truncate">
            {formatCurrency(budgetSummary.spent)} / {formatCurrency(budgetSummary.limit)}
          </h3>
          <div className="progress-bar" style={{ height: "8px", borderRadius: "999px", backgroundColor: "#E1E0E6" }}>
            <div 
              className="fill"
              style={{ 
                width: `${budgetSummary.percent}%`,
                backgroundColor: budgetSummary.percent > 90 ? "#FF5460" : budgetSummary.percent > 75 ? "#F59E0B" : "#41DC65",
                backgroundImage: "none",
                borderRadius: "999px"
              }}
            />
          </div>
        </div>
      </div>

      {/* Grid Row 2: Monthly Trends Area & Category Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cash Flow Line Chart (7/12) */}
        <div className="glass-panel p-5 lg:col-span-7 flex flex-col h-[340px]">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 font-heading">
            Net Cash Flow Trend
          </h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="flowInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="flowExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.1)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#C8C7CD", fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fill: "#C8C7CD", fontSize: 10 }} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#23273C", borderColor: "#2D324B", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }} 
                  itemStyle={{ color: "#3EC3D5", fontWeight: 700, fontSize: 13 }}
                  labelStyle={{ color: "#F8FAFC", fontWeight: 800, fontSize: 12, marginBottom: 4 }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                <Area type="monotone" dataKey="Income" stroke="var(--color-success)" fillOpacity={1} fill="url(#flowInc)" strokeWidth={2} />
                <Area type="monotone" dataKey="Expense" stroke="var(--color-danger)" fillOpacity={1} fill="url(#flowExp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Sectors Doughnut Chart (5/12) */}
        <div className="glass-panel p-5 lg:col-span-5 flex flex-col h-[340px]">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 font-heading">
            Expense Allocation share
          </h2>
          {pieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs italic">
              No expenditures listed for current month
            </div>
          ) : (
            <div className="flex-1 w-full min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#23273C", borderColor: "#2D324B", borderRadius: "0.5rem", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }} 
                    itemStyle={{ color: "#3EC3D5", fontWeight: 700, fontSize: 13 }}
                    labelStyle={{ color: "#F8FAFC", fontWeight: 800, fontSize: 12, marginBottom: 4 }}
                  />
                  <Legend verticalAlign="bottom" align="center" iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Grid Row 3: Details & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Activities (7/12) */}
        <div className="glass-panel p-5 lg:col-span-7 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 font-heading">
              Recent Transactions Ledger
            </h2>
            <Link to="/transactions" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {transactions.slice(0, 5).map(tx => {
              const isIncome = tx.type === "income";
              return (
                <div 
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/40 dark:border-slate-800/40 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                      isIncome ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    }`}>
                      {isIncome ? "⬇️" : "⬆️"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{tx.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{tx.date} • {tx.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-extrabold ${isIncome ? "text-emerald-500" : "text-slate-800 dark:text-slate-200"}`}>
                      {isIncome ? "+" : "-"} {formatCurrency(tx.amount)}
                    </span>
                    {tx.isFavorite && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI health score, insights recommendations (5/12) */}
        <div className="glass-panel p-5 lg:col-span-5 flex flex-col gap-5">
          {/* AI Financial Coach */}
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 font-heading">
              AI Coach Insights
            </h2>
            <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
              <HeartPulse className="w-7 h-7 text-primary" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Health Score</p>
                <p className="text-lg font-extrabold">{health.score} / 100</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
              {insights.slice(0, 3).map((insight, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-250 dark:border-slate-800 text-[11px] leading-normal flex gap-2">
                  <span>💡</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Bills List */}
          {upcomingBills.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Upcoming Bills</h3>
              <div className="flex flex-col gap-2">
                {upcomingBills.map(bill => (
                  <div key={bill.id} className="flex justify-between items-center text-xs p-2 border border-slate-200/50 dark:border-slate-800/60 rounded-lg">
                    <div className="flex flex-col">
                      <strong className="text-slate-700 dark:text-slate-300">{bill.description}</strong>
                      <span className="text-[10px] text-slate-400">Due: {bill.dueDate}</span>
                    </div>
                    <span className="font-bold text-danger">{formatCurrency(bill.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unusual alerts */}
          {unusualAlerts.length > 0 && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl flex gap-2 items-start text-xs leading-relaxed animate-pulse">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Flagged: Unusual expense of **{formatCurrency(unusualAlerts[0].transaction.amount)}** detected recently in {unusualAlerts[0].transaction.category}.
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Transaction Details Modal Backdrop Pop */}
      {selectedTx && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setSelectedTx(null)}
        >
          <div 
            className="glass-panel p-6 w-full max-w-sm flex flex-col gap-4 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <span className={`badge ${selectedTx.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                {selectedTx.type}
              </span>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-850" onClick={() => setSelectedTx(null)}>✕</button>
            </div>
            
            <div className="text-center my-2">
              <span className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">Amount</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {selectedTx.type === "income" ? "+" : "-"} {formatCurrency(selectedTx.amount)}
              </h3>
            </div>

            <div className="flex flex-col gap-2.5 text-xs border-t border-slate-150 dark:border-slate-800 pt-4">
              <div>
                <span className="text-slate-400 font-medium">Description:</span>{" "}
                <strong className="text-slate-800 dark:text-slate-100">{selectedTx.description}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Date Logged:</span>{" "}
                <strong>{selectedTx.date}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Category:</span>{" "}
                <strong>{selectedTx.category}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Schedule:</span>{" "}
                <strong className="capitalize">{selectedTx.recurring}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Status:</span>{" "}
                <strong className="capitalize">{selectedTx.status}</strong>
              </div>
              {selectedTx.notes && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/60 rounded-lg text-[11px] leading-relaxed">
                  <span className="text-slate-400 block font-semibold mb-0.5">Notes:</span>
                  {selectedTx.notes}
                </div>
              )}
              {selectedTx.receiptImage && (
                <div>
                  <span className="text-slate-400 block font-semibold mb-1">Receipt Attachment:</span>
                  <div className="rounded-lg p-3 border border-slate-200 dark:border-slate-800 bg-slate-900 flex items-center gap-3">
                    <FaReceipt size={22} style={{ color: "#10B981" }} />
                    <span className="text-xs font-bold text-slate-200">Receipt Attached</span>
                    <FaImage size={18} style={{ color: "#4F46E5", marginLeft: "auto" }} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button 
                className="btn btn-secondary flex-1"
                onClick={() => {
                  onEditTransaction(selectedTx);
                  setSelectedTx(null);
                }}
              >
                ✏️ Edit
              </button>
              <button className="btn btn-danger flex-1" onClick={() => setSelectedTx(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
