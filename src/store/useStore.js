// src/store/useStore.js
import { create } from "zustand";
import api from "../services/api";

// ── Constants & Helpers ──
function getUserStorageKey(userId = null) {
  try {
    if (userId) return `apexfinance_data_${userId}`;
    const activeRaw = localStorage.getItem("myfinpal_active_user");
    if (activeRaw) {
      const u = JSON.parse(activeRaw);
      const uid = u?.id || u?._id || u?.email;
      if (uid) return `apexfinance_data_${uid}`;
    }
  } catch (e) {}
  return "apexfinance_data_guest";
}

const DEFAULT_CATEGORIES = [
  { name: "Food", icon: "UtensilsCrossed", color: "#4F5DED" },
  { name: "Transport", icon: "Car", color: "#4F5DED" },
  { name: "Shopping", icon: "ShoppingBag", color: "#4F5DED" },
  { name: "Entertainment", icon: "Gamepad2", color: "#4F5DED" },
  { name: "Medical", icon: "Heart", color: "#4F5DED" },
  { name: "Bills", icon: "Receipt", color: "#4F5DED" },
  { name: "Education", icon: "GraduationCap", color: "#4F5DED" },
  { name: "Salary", icon: "Briefcase", color: "#2E9E6D" },
  { name: "Investment", icon: "TrendingUp", color: "#4F5DED" },
  { name: "Other", icon: "MoreHorizontal", color: "#4F5DED" },
];

function loadState(userId = null) {
  try {
    const key = getUserStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

function persist(state) {
  try {
    const key = getUserStorageKey();
    const { transactions, budget, theme, sidebarHidden, categories, debts, savingsGoals, savingsHistory, readNotificationIds, deletedNotificationIds } = state;
    localStorage.setItem(
      key,
      JSON.stringify({ transactions, budget, theme, sidebarHidden, categories, debts, savingsGoals, savingsHistory, readNotificationIds, deletedNotificationIds })
    );
  } catch {
    /* ignore */
  }
}

let idCounter = Date.now();
function generateId() {
  return `tx_${(idCounter++).toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Store ──
const saved = loadState();

const useStore = create((set, get) => ({
  // ─ User Store Management ─
  resetForUser: async (userId) => {
    const loaded = loadState(userId);
    set(() => ({
      transactions: Array.isArray(loaded?.transactions) ? loaded.transactions : [],
      budget: typeof loaded?.budget === "number" ? loaded.budget : 0,
      debts: Array.isArray(loaded?.debts) ? loaded.debts : [],
      savingsGoals: Array.isArray(loaded?.savingsGoals) ? loaded.savingsGoals : [],
      savingsHistory: Array.isArray(loaded?.savingsHistory) ? loaded.savingsHistory : [],
    }));
    await get().fetchFromApi();
  },

  clearStore: () => {
    set({
      transactions: [],
      budget: 0,
      debts: [],
      savingsGoals: [],
      savingsHistory: [],
    });
  },

  // ─ Async API Sync ─
  fetchFromApi: async () => {
    try {
      const [txs, bRes, goals, history, debtsList] = await Promise.allSettled([
        api.getTransactions(),
        api.getBudget(),
        api.getSavingsGoals(),
        api.getSavingsHistory(),
        api.getDebts(),
      ]);

      set((s) => {
        const next = {
          transactions: txs.status === "fulfilled" && Array.isArray(txs.value) ? txs.value : s.transactions,
          budget: bRes.status === "fulfilled" && typeof bRes.value?.budget === "number" ? bRes.value.budget : s.budget,
          savingsGoals: goals.status === "fulfilled" && Array.isArray(goals.value) ? goals.value : s.savingsGoals,
          savingsHistory: history.status === "fulfilled" && Array.isArray(history.value) ? history.value : s.savingsHistory,
          debts: debtsList.status === "fulfilled" && Array.isArray(debtsList.value) ? debtsList.value : s.debts,
        };
        persist({ ...s, ...next });
        return next;
      });
    } catch (e) {
      /* ignore offline errors */
    }
  },

  // ─ Transactions ─
  transactions: Array.isArray(saved?.transactions) ? saved.transactions : [],
  budget: typeof saved?.budget === "number" ? saved.budget : 0,
  debts: Array.isArray(saved?.debts) ? saved.debts : [],
  savingsGoals: Array.isArray(saved?.savingsGoals) ? saved.savingsGoals : [],
  savingsHistory: Array.isArray(saved?.savingsHistory) ? saved.savingsHistory : [],

  addTransaction: (data) => {
    const tx = {
      ...data,
      id: data.id || generateId(),
      createdAt: new Date().toISOString(),
    };
    set((s) => {
      const next = { transactions: [tx, ...s.transactions] };
      persist({ ...s, ...next });
      return next;
    });

    // Background sync to backend API
    api.addTransaction(tx).catch(() => {/* fallback stored locally */});
    return tx;
  },

  updateTransaction: (updated) => {
    set((s) => {
      const next = {
        transactions: s.transactions.map((t) =>
          t.id === updated.id ? { ...t, ...updated } : t
        ),
      };
      persist({ ...s, ...next });
      return next;
    });
    api.updateTransaction(updated.id, updated).catch(() => {});
  },

  deleteTransaction: (id) => {
    set((s) => {
      const next = { transactions: s.transactions.filter((t) => t.id !== id) };
      persist({ ...s, ...next });
      return next;
    });
    api.deleteTransaction(id).catch(() => {});
  },

  // ─ Budget ─
  setBudget: (amount) => {
    const oldBudget = get().budget;
    set((s) => {
      const next = { budget: amount };
      persist({ ...s, ...next });
      return next;
    });
    if (amount > oldBudget) {
      const added = amount - oldBudget;
      get().showToast(`Budget Recharged by ₹${added.toLocaleString("en-IN")}! New Limit: ₹${amount.toLocaleString("en-IN")}`);
    }
    api.setBudget(amount).catch(() => {});
  },

  rechargeBudget: (topUpAmount) => {
    if (topUpAmount <= 0) return;
    const current = get().budget;
    const newAmount = current + topUpAmount;
    set((s) => {
      const next = { budget: newAmount };
      persist({ ...s, ...next });
      return next;
    });
    get().showToast(`Budget Recharged by ₹${topUpAmount.toLocaleString("en-IN")}! New Limit: ₹${newAmount.toLocaleString("en-IN")}`);
  },

  // ─ Friends & Debts ─
  debts: Array.isArray(saved?.debts) ? saved.debts : [],

  addFriendDebt: (data) => {
    const debt = {
      ...data,
      id: `debt_${Date.now().toString(36)}`,
      returnedAmount: 0,
      status: "Pending"
    };
    set((s) => {
      const next = { debts: [debt, ...(s.debts || [])] };
      persist({ ...s, ...next });
      return next;
    });
    get().showToast(`Borrowed ₹${Number(data.amount).toLocaleString("en-IN")} from ${data.friendName}`);
  },

  recordDebtReturn: (id, returnAmount, recordAsExpense = true) => {
    const { debts, addTransaction } = get();
    const target = (debts || []).find(d => d.id === id);
    if (!target || returnAmount <= 0) return;

    const newReturned = Math.min(target.amount, target.returnedAmount + returnAmount);
    const newStatus = newReturned >= target.amount ? "Settled" : "Partially Paid";

    set((s) => {
      const next = {
        debts: (s.debts || []).map(d => d.id === id ? { ...d, returnedAmount: newReturned, status: newStatus } : d)
      };
      persist({ ...s, ...next });
      return next;
    });

    if (recordAsExpense && addTransaction) {
      addTransaction({
        description: `Payback to ${target.friendName}`,
        amount: returnAmount,
        type: "expense",
        category: "Bills",
        date: new Date().toISOString().slice(0, 10),
        notes: `Returned ₹${returnAmount} to ${target.friendName}`
      });
    }

    if (newStatus === "Settled") {
      get().showToast(`Fully Settled! Paid back ₹${target.amount.toLocaleString("en-IN")} to ${target.friendName}`);
    } else {
      get().showToast(`Returned ₹${returnAmount.toLocaleString("en-IN")} to ${target.friendName}`);
    }
  },

  deleteFriendDebt: (id) => {
    set((s) => {
      const next = { debts: (s.debts || []).filter(d => d.id !== id) };
      persist({ ...s, ...next });
      return next;
    });
    get().showToast("Debt record removed");
  },

  // ─ Theme & Navigation (Light Mode Only) ─
  theme: "light",

  toggleTheme: () => {
    set((s) => {
      const next = { theme: "light" };
      persist({ ...s, ...next });
      return next;
    });
  },

  setTheme: () => {
    set((s) => {
      const next = { theme: "light" };
      persist({ ...s, ...next });
      return next;
    });
  },

  sidebarHidden: typeof saved?.sidebarHidden === "boolean" ? saved.sidebarHidden : false,

  toggleSidebar: () => {
    set((s) => {
      const next = { sidebarHidden: !s.sidebarHidden };
      persist({ ...s, ...next });
      return next;
    });
  },

  setSidebarHidden: (hidden) => {
    set((s) => {
      const next = { sidebarHidden: !!hidden };
      persist({ ...s, ...next });
      return next;
    });
  },

  // ─ Categories ─
  categories: Array.isArray(saved?.categories) && saved.categories.length > 0 ? saved.categories : DEFAULT_CATEGORIES,

  // ─ Notifications ─
  readNotificationIds: Array.isArray(saved?.readNotificationIds) ? saved.readNotificationIds : [],
  deletedNotificationIds: Array.isArray(saved?.deletedNotificationIds) ? saved.deletedNotificationIds : [],

  getNotifications: () => {
    const { transactions, budget, debts, savingsGoals, readNotificationIds, deletedNotificationIds } = get();
    const list = [];

    // 1. Budget Alerts
    const monthlyExpense = get().getMonthlyExpense();
    if (budget > 0) {
      if (monthlyExpense > budget) {
        list.push({
          id: "notif-budget-exceeded",
          type: "error",
          title: "Budget Exceeded",
          description: `You have spent ₹${monthlyExpense.toLocaleString("en-IN")} exceeding your limit of ₹${budget.toLocaleString("en-IN")}.`,
          timestamp: "Just now",
          actionText: "Adjust Budget",
          actionLink: "/budget",
        });
      } else if (monthlyExpense > budget * 0.85) {
        list.push({
          id: "notif-budget-warning",
          type: "warning",
          title: "Budget Warning",
          description: `You have used ${Math.round((monthlyExpense / budget) * 100)}% of your monthly budget.`,
          timestamp: "Today",
          actionText: "View Budget",
          actionLink: "/budget",
        });
      }
    }

    // 2. Debts / Loans Reminders
    if (Array.isArray(debts)) {
      debts.forEach((d) => {
        const remaining = d.amount - (d.returnedAmount || 0);
        if (remaining > 0) {
          list.push({
            id: `notif-debt-${d.id}`,
            type: "info",
            title: `Debt Pending: ${d.friendName}`,
            description: `Remaining to return: ₹${remaining.toLocaleString("en-IN")}${d.dueDate ? ` (Due ${d.dueDate})` : ""}`,
            timestamp: d.dueDate || "Pending",
            actionText: "Settle Up",
            actionLink: "/debts",
          });
        }
      });
    }

    // 3. Savings Goals Progress
    if (Array.isArray(savingsGoals)) {
      savingsGoals.forEach((g) => {
        const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
        if (pct >= 100) {
          list.push({
            id: `notif-goal-${g.id}`,
            type: "success",
            title: `Goal Achieved: ${g.name}! 🎉`,
            description: `Target of ₹${g.targetAmount.toLocaleString("en-IN")} reached!`,
            timestamp: "Completed",
            actionText: "View Savings",
            actionLink: "/savings",
          });
        }
      });
    }

    // 4. Default info if empty
    if (list.length === 0) {
      list.push({
        id: "notif-welcome",
        type: "success",
        title: "All Systems Normal",
        description: "Your financial health is on track. No urgent alerts.",
        timestamp: "Now",
      });
    }

    return list
      .filter((n) => !deletedNotificationIds.includes(n.id))
      .map((n) => ({
        ...n,
        read: readNotificationIds.includes(n.id),
      }));
  },

  markNotificationRead: (id) => {
    set((s) => {
      if (s.readNotificationIds.includes(id)) return {};
      const next = { readNotificationIds: [...s.readNotificationIds, id] };
      persist({ ...s, ...next });
      return next;
    });
  },

  markAllNotificationsRead: () => {
    const notifs = get().getNotifications();
    const ids = notifs.map((n) => n.id);
    set((s) => {
      const next = { readNotificationIds: Array.from(new Set([...s.readNotificationIds, ...ids])) };
      persist({ ...s, ...next });
      return next;
    });
  },

  deleteNotification: (id) => {
    set((s) => {
      if (s.deletedNotificationIds.includes(id)) return {};
      const next = { deletedNotificationIds: [...s.deletedNotificationIds, id] };
      persist({ ...s, ...next });
      return next;
    });
  },

  // ─ Toast ─
  toast: null,
  showToast: (message, action = null, duration = 4000, type = null) => {
    set({ toast: { message, action, duration, type, id: Date.now() } });
    if (!action) {
      setTimeout(() => {
        set((s) => {
          if (s.toast && s.toast.message === message) return { toast: null };
          return {};
        });
      }, duration);
    }
  },
  clearToast: () => set({ toast: null }),

  // ─ Derived helpers ─
  getTotals: () => {
    const { transactions } = get();
    const safeTx = Array.isArray(transactions) ? transactions : [];
    const income = safeTx
      .filter((t) => t && t.type === "income")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const expense = safeTx
      .filter((t) => t && t.type === "expense")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    return { income, expense, balance: income - expense };
  },

  getMonthlyExpense: () => {
    const { transactions } = get();
    const safeTx = Array.isArray(transactions) ? transactions : [];
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return safeTx
      .filter((t) => {
        if (!t || t.type !== "expense" || !t.date) return false;
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  },

  getCategoryBreakdown: () => {
    const { transactions, categories } = get();
    const safeTx = Array.isArray(transactions) ? transactions : [];
    const safeCats = Array.isArray(categories) ? categories : [];
    const map = {};
    safeTx
      .filter((t) => t && t.type === "expense")
      .forEach((t) => {
        const catName = t.category || "Other";
        map[catName] = (map[catName] || 0) + (Number(t.amount) || 0);
      });
    return Object.entries(map)
      .map(([name, value]) => {
        const cat = safeCats.find((c) => c && c.name === name);
        return { name, value, color: cat?.color || "#64748b", icon: cat?.icon || "Circle" };
      })
      .sort((a, b) => b.value - a.value);
  },

  getTrendData: (months = 6) => {
    const { transactions } = get();
    const safeTx = Array.isArray(transactions) ? transactions : [];
    const now = new Date();
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${y}-${m}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      result.push({ month: key, label, income: 0, expense: 0 });
    }
    safeTx.forEach((t) => {
      if (!t) return;
      const mk = (t.date || "").slice(0, 7);
      const entry = result.find((r) => r.month === mk);
      if (entry) {
        if (t.type === "income") entry.income += Number(t.amount) || 0;
        else entry.expense += Number(t.amount) || 0;
      }
    });
    result.forEach((r) => {
      r.balance = r.income - r.expense;
    });
    return result;
  },

  getBalanceOverTime: () => {
    const { transactions } = get();
    const safeTx = Array.isArray(transactions) ? transactions : [];
    if (!safeTx.length) return [];

    // Group net daily changes by unique date string (YYYY-MM-DD)
    const dateMap = {};
    safeTx.forEach((t) => {
      if (!t) return;
      const dKey = (t.date || new Date().toISOString().slice(0, 10)).slice(0, 10);
      const amt = Number(t.amount) || 0;
      const val = t.type === "income" ? amt : -amt;
      dateMap[dKey] = (dateMap[dKey] || 0) + val;
    });

    // Sort unique dates chronologically
    const sortedDates = Object.keys(dateMap).sort(
      (a, b) => new Date(a + "T00:00:00").getTime() - new Date(b + "T00:00:00").getTime()
    );

    let runningBalance = 0;
    const result = [];

    // If there's only 1 active date, add a zero starting point for the prior day
    if (sortedDates.length === 1) {
      const firstDateObj = new Date(sortedDates[0] + "T00:00:00");
      const prevDateObj = new Date(firstDateObj);
      prevDateObj.setDate(prevDateObj.getDate() - 1);
      const prevLabel = prevDateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      result.push({
        date: prevDateObj.toISOString().slice(0, 10),
        balance: 0,
        label: prevLabel,
      });
    }

    sortedDates.forEach((dStr) => {
      runningBalance += dateMap[dStr];
      const dObj = new Date(dStr + "T00:00:00");
      const label = dObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      result.push({
        date: dStr,
        balance: Math.round(runningBalance * 100) / 100,
        label,
      });
    });

    return result;
  },

  // ─ Savings Goals & History ─
  savingsGoals: Array.isArray(saved?.savingsGoals) ? saved.savingsGoals : [],
  savingsHistory: Array.isArray(saved?.savingsHistory) ? saved.savingsHistory : [],

  addSavingsGoal: (goalData) => {
    const newGoal = {
      ...goalData,
      id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      target: Number(goalData.target) || 0,
      current: Number(goalData.current) || 0,
      createdAt: goalData.createdAt || new Date().toISOString().slice(0, 10),
      lastMilestone: 0
    };
    set((s) => {
      const next = { savingsGoals: [newGoal, ...s.savingsGoals] };
      persist({ ...s, ...next });
      return next;
    });
    return newGoal;
  },

  updateSavingsGoal: (updated) => {
    set((s) => {
      const next = {
        savingsGoals: s.savingsGoals.map((g) =>
          g.id === updated.id ? { ...g, ...updated, target: Number(updated.target), current: Number(updated.current) } : g
        ),
      };
      persist({ ...s, ...next });
      return next;
    });
  },

  deleteSavingsGoal: (goalId) => {
    set((s) => {
      const next = {
        savingsGoals: s.savingsGoals.filter((g) => g.id !== goalId),
        savingsHistory: s.savingsHistory.filter((h) => h.goalId !== goalId)
      };
      persist({ ...s, ...next });
      return next;
    });
  },

  depositToGoal: (goalId, amount, date, method, notes) => {
    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) return { newMilestone: false };

    let newMilestone = 0;
    let goalName = "";

    set((s) => {
      const updatedGoals = s.savingsGoals.map((g) => {
        if (g.id === goalId) {
          goalName = g.name;
          const updatedCurrent = g.current + numAmount;
          const percent = (updatedCurrent / g.target) * 100;
          
          // Check milestone threshold
          if (percent >= 100 && (g.lastMilestone || 0) < 100) newMilestone = 100;
          else if (percent >= 75 && (g.lastMilestone || 0) < 75) newMilestone = 75;
          else if (percent >= 50 && (g.lastMilestone || 0) < 50) newMilestone = 50;
          else if (percent >= 25 && (g.lastMilestone || 0) < 25) newMilestone = 25;

          return {
            ...g,
            current: updatedCurrent,
            lastMilestone: Math.max(g.lastMilestone || 0, newMilestone)
          };
        }
        return g;
      });

      const historyEntry = {
        id: `sh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        goalId,
        goalName,
        type: "deposit",
        amount: numAmount,
        date: date || new Date().toISOString().slice(0, 10),
        method: method || "Bank Transfer",
        notes: notes || "Deposit"
      };

      const next = {
        savingsGoals: updatedGoals,
        savingsHistory: [historyEntry, ...s.savingsHistory]
      };
      persist({ ...s, ...next });
      return next;
    });

    return { newMilestone, goalName };
  },

  withdrawFromGoal: (goalId, amount, date, reason) => {
    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) return;

    set((s) => {
      let goalName = "";
      const updatedGoals = s.savingsGoals.map((g) => {
        if (g.id === goalId) {
          goalName = g.name;
          return {
            ...g,
            current: Math.max(0, g.current - numAmount)
          };
        }
        return g;
      });

      const historyEntry = {
        id: `sh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        goalId,
        goalName,
        type: "withdraw",
        amount: numAmount,
        date: date || new Date().toISOString().slice(0, 10),
        method: "Manual Withdrawal",
        notes: reason || "Withdrawal"
      };

      const next = {
        savingsGoals: updatedGoals,
        savingsHistory: [historyEntry, ...s.savingsHistory]
      };
      persist({ ...s, ...next });
      return next;
    });
  },

  // ── Notification Center Actions ──
  readNotificationIds: saved?.readNotificationIds || [],
  deletedNotificationIds: saved?.deletedNotificationIds || [],

  markNotificationRead: (id) => {
    set((s) => {
      const next = { readNotificationIds: Array.from(new Set([...s.readNotificationIds, id])) };
      persist({ ...s, ...next });
      return next;
    });
  },

  markAllNotificationsRead: () => {
    const allIds = get().getNotifications().map((n) => n.id);
    set((s) => {
      const next = { readNotificationIds: Array.from(new Set([...s.readNotificationIds, ...allIds])) };
      persist({ ...s, ...next });
      return next;
    });
  },

  deleteNotification: (id) => {
    set((s) => {
      const next = { deletedNotificationIds: Array.from(new Set([...s.deletedNotificationIds, id])) };
      persist({ ...s, ...next });
      return next;
    });
  },

  getNotifications: () => {
    const s = get();
    const totals = s.getTotals ? s.getTotals() : { income: 0, expense: 0, balance: 0 };
    const monthlyExp = s.getMonthlyExpense ? s.getMonthlyExpense() : 0;
    const budget = s.budget || 0;
    const deleted = new Set(Array.isArray(s.deletedNotificationIds) ? s.deletedNotificationIds : []);
    const readSet = new Set(Array.isArray(s.readNotificationIds) ? s.readNotificationIds : []);
    const now = new Date();

    const list = [];

    // 1. Due Date Near & Overdue Friend Debt Notifications
    (s.debts || []).forEach((d) => {
      if (d.status !== "Settled" && d.dueDate) {
        const due = new Date(d.dueDate);
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
        const remaining = (d.amount || 0) - (d.returnedAmount || 0);

        if (diffDays < 0) {
          // Bill Overdue
          const id = `notif_due_overdue_${d.id}`;
          if (!deleted.has(id)) {
            list.push({
              id,
              type: "error",
              title: `Bill Overdue: Payback to ${d.friendName}`,
              description: `Bro... Payback to ${d.friendName} (₹${remaining.toLocaleString("en-IN")}) is ${Math.abs(diffDays)} day(s) overdue! Pay before friendship leaves the chat!`,
              timestamp: "Overdue Alert",
              read: readSet.has(id),
              actionText: "Return Money >",
              actionLink: "/debts",
              priority: 1,
            });
          }
        } else if (diffDays <= 2) {
          // Bill Due Tomorrow / Due Near
          const id = `notif_due_near_${d.id}`;
          if (!deleted.has(id)) {
            list.push({
              id,
              type: "warning",
              title: `Due Date Near: Payback to ${d.friendName}`,
              description: `Hey Bestie! Payback of ₹${remaining.toLocaleString("en-IN")} is due ${diffDays === 0 ? "today" : diffDays === 1 ? "tomorrow" : "in 2 days"}! Settle up before emotional damage occurs.`,
              timestamp: "Due Soon",
              read: readSet.has(id),
              actionText: "Settle Debt >",
              actionLink: "/debts",
              priority: 2,
            });
          }
        }
      }
    });

    // 2. Goal Deadline Approaching
    (s.savingsGoals || []).forEach((g) => {
      if (g.target > 0 && g.current < g.target && g.deadline) {
        const dLine = new Date(g.deadline);
        const diffDays = Math.ceil((dLine.getTime() - now.getTime()) / (1000 * 3600 * 24));
        const remTarget = g.target - g.current;

        if (diffDays <= 5 && diffDays >= 0) {
          const id = `notif_goal_due_near_${g.id}`;
          if (!deleted.has(id)) {
            list.push({
              id,
              type: "warning",
              title: `Goal Deadline Approaching: "${g.name}"`,
              description: `Yo Main Character! Only ${diffDays} day(s) left to save ₹${remTarget.toLocaleString("en-IN")} for "${g.name}". Mission Failed Successfully if you don't top up!`,
              timestamp: "Goal Alert",
              read: readSet.has(id),
              actionText: "Deposit Funds >",
              actionLink: "/savings",
              priority: 2,
            });
          }
        }
      }
    });

    // 3. Error: Income Exceeded / Overspending Roast
    if (totals.expense > totals.income) {
      const diff = totals.expense - totals.income;
      const id = "notif_err_income_exceeded";
      if (!deleted.has(id)) {
        list.push({
          id,
          type: "error",
          title: "Achievement Unlocked: Wallet Left The Chat",
          description: `Level 4 Roast: Congratulations! You're spending like a millionaire with an intern's salary! Expenses exceed income by ₹${diff.toLocaleString("en-IN")}.`,
          timestamp: "Just now",
          read: readSet.has(id),
          actionText: "+ Add Income",
          actionLink: "/add?type=income",
          priority: 1,
        });
      }
    }

    // 4. Warning: Budget Limit Exceeded
    if (budget > 0 && monthlyExp > budget) {
      const diff = monthlyExp - budget;
      const id = "notif_warn_budget_exceeded";
      if (!deleted.has(id)) {
        list.push({
          id,
          type: "warning",
          title: "Budget Overspending Alert",
          description: `Bro... Your budget is starting to lose faith in you! Monthly spending exceeds limit by ₹${diff.toLocaleString("en-IN")}.`,
          timestamp: "Today",
          read: readSet.has(id),
          actionText: "Recharge Budget >",
          actionLink: "/budget",
          priority: 2,
        });
      }
    }

    // 5. Warning: Low Account Balance
    if (totals.balance < 2000 && totals.income > 0) {
      const id = "notif_warn_low_balance";
      if (!deleted.has(id)) {
        list.push({
          id,
          type: "warning",
          title: "Low Account Balance Alert",
          description: `Level 2 Roast: Bro... Bank balance is under ₹2,000! NPC behavior detected if you buy another coffee today.`,
          timestamp: "Balance Alert",
          read: readSet.has(id),
          actionText: "View Dashboard >",
          actionLink: "/",
          priority: 2,
        });
      }
    }

    // 6. Success: Savings Goal Milestones
    (s.savingsGoals || []).forEach((g) => {
      if (g.target > 0) {
        const pct = Math.round((g.current / g.target) * 100);
        if (pct >= 50) {
          const id = `notif_succ_goal_${g.id}_${pct >= 100 ? 100 : pct >= 75 ? 75 : 50}`;
          if (!deleted.has(id)) {
            list.push({
              id,
              type: "success",
              title: `Main Character Energy: "${g.name}" at ${pct}%`,
              description: `Yo Legend! Saved ₹${g.current.toLocaleString("en-IN")} of ₹${g.target.toLocaleString("en-IN")}. Duolingo owl approves this financial discipline!`,
              timestamp: "Milestone",
              read: readSet.has(id),
              actionText: "View Progress >",
              actionLink: "/savings",
              priority: 4,
            });
          }
        }
      }
    });

    // 7. Information: Weekend Spending Alert
    const idWeekend = "notif_info_weekend_mindset";
    if (!deleted.has(idWeekend)) {
      list.push({
        id: idWeekend,
        type: "info",
        title: "Weekend Spending Alert",
        description: "Hey Bestie! Watch out for sneaky weekend splurges. Don't let Monday-you regret Friday-you's decisions!",
        timestamp: "Daily Mindset",
        read: readSet.has(idWeekend),
        actionText: "Check Analytics >",
        actionLink: "/analytics",
        priority: 5,
      });
    }

    return list.sort((a, b) => a.priority - b.priority);
  }
}));

export default useStore;
