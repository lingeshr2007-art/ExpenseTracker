// src/context/AppContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { Transaction, Category, Budget, SavingsGoal, Account, Notification, User, FriendDebt } from "../types";
import { authService } from "../services/authService";

interface AppContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  goals: SavingsGoal[];
  debts: FriendDebt[];
  currency: string;
  theme: "light" | "dark";
  language: string;
  notificationsEnabled: boolean;
  user: User | null;
  notifications: Notification[];
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (name: string, color: string, icon: string) => void;
  addAccount: (name: string, type: "Cash" | "Card" | "Bank", balance: number, color: string) => void;
  addSavingsGoal: (name: string, targetAmount: number, currentAmount: number, deadline: string, color: string) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;
  addBudget: (category: string, limit: number) => void;
  updateBudget: (category: string, limit: number) => void;
  rechargeBudget: (category: string, topUpAmount: number) => void;
  deleteBudget: (category: string) => void;
  addFriendDebt: (debt: Omit<FriendDebt, "id" | "returnedAmount" | "status">) => void;
  updateFriendDebt: (debt: FriendDebt) => void;
  recordDebtReturn: (id: string, returnAmount: number, recordAsExpense?: boolean) => void;
  deleteFriendDebt: (id: string) => void;
  setCurrency: (currency: string) => void;
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (lang: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  addNotification: (type: Notification["type"], message: string) => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  login: (name: string, email: string) => void;
  logout: () => void;
  importCSVData: (imported: Array<Omit<Transaction, "id">>) => void;
  exportBackup: () => string;
  importBackup: (backupStr: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Food", color: "#3EC3D5", icon: "Utensils", isCustom: false },
  { id: "cat-2", name: "Transport", color: "#23273C", icon: "Car", isCustom: false },
  { id: "cat-3", name: "Shopping", color: "#EC4899", icon: "Bag", isCustom: false },
  { id: "cat-4", name: "Entertainment", color: "#F59E0B", icon: "Gamepad", isCustom: false },
  { id: "cat-5", name: "Medical", color: "#FF5460", icon: "Heart", isCustom: false },
  { id: "cat-6", name: "Bills", color: "#8B5CF6", icon: "Receipt", isCustom: false },
  { id: "cat-7", name: "Education", color: "#06B6D4", icon: "Book", isCustom: false },
  { id: "cat-8", name: "Salary", color: "#41DC65", icon: "Briefcase", isCustom: false },
  { id: "cat-9", name: "Investment", color: "#3EC3D5", icon: "Chart", isCustom: false },
  { id: "cat-10", name: "Other", color: "#C8C7CD", icon: "Gear", isCustom: false },
];

const DEFAULT_ACCOUNTS: Account[] = [
  { id: "acc-1", name: "Chase Checking", balance: 12450.00, type: "Bank", color: "#3EC3D5" },
  { id: "acc-2", name: "Cash Wallet", balance: 640.00, type: "Cash", color: "#41DC65" },
  { id: "acc-3", name: "Amex Premium Card", balance: -2480.00, type: "Card", color: "#FF5460" },
];

const SEED_TRANSACTIONS = (): Transaction[] => {
  const list: Transaction[] = [];
  const now = new Date();
  const accountsList = ["acc-1", "acc-2", "acc-3"];
  
  // Seed Salary incomes
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    list.push({
      id: `seed-salary-${i}`,
      description: "Google Direct Deposit",
      amount: 6000,
      type: "income",
      category: "Salary",
      date: d.toISOString().slice(0, 10),
      accountId: "acc-1",
      tags: ["Primary", "Job"],
      notes: "Main payroll paycheck",
      recurring: "monthly",
      receiptImage: null,
      isFavorite: true,
      status: "cleared"
    });

    const freelanceDate = new Date(now.getFullYear(), now.getMonth() - i, 18);
    list.push({
      id: `seed-freelance-${i}`,
      description: "Mobile App Contract Payment",
      amount: 1500,
      type: "income",
      category: "Salary",
      date: freelanceDate.toISOString().slice(0, 10),
      accountId: "acc-1",
      tags: ["SideHustle", "Contract"],
      notes: "Client invoice payout",
      recurring: "none",
      receiptImage: null,
      isFavorite: false,
      status: "cleared"
    });
  }

  // Seed expenses
  const expensesPool: { [key: string]: { descs: string[], range: [number, number] } } = {
    Food: { descs: ["Whole Foods Market", "Sweetgreen Salad", "Blue Bottle Coffee", "Sushi Bar Dinner"], range: [12, 140] },
    Transport: { descs: ["Gas Station Fuel", "Uber Lyft Rides", "City Parking Meter"], range: [8, 55] },
    Shopping: { descs: ["Apple Online Store", "Uniqlo Clothing", "Amazon Electronics"], range: [20, 320] },
    Entertainment: { descs: ["Netflix Premium", "Spotify Premium", "Steam Store Game"], range: [9, 60] },
    Bills: { descs: ["Utility Electric bill", "Comcast High-Speed Internet", "Landlord Rent Payment"], range: [50, 1500] },
    Medical: { descs: ["Walgreens Pharmacy", "Dental Cleaning Care"], range: [15, 120] }
  };

  for (let i = 5; i >= 0; i--) {
    const monthIndex = now.getMonth() - i;
    Object.keys(expensesPool).forEach((cat) => {
      const pool = expensesPool[cat];
      const count = Math.random() > 0.4 ? 2 : 1;
      
      for (let j = 0; j < count; j++) {
        const desc = pool.descs[Math.floor(Math.random() * pool.descs.length)];
        const amount = parseFloat((Math.random() * (pool.range[1] - pool.range[0]) + pool.range[0]).toFixed(2));
        const day = Math.floor(Math.random() * 26) + 2;
        const d = new Date(now.getFullYear(), monthIndex, day);
        
        list.push({
          id: `seed-expense-${i}-${cat}-${j}`,
          description: desc,
          amount,
          type: "expense",
          category: cat,
          date: d.toISOString().slice(0, 10),
          accountId: accountsList[Math.floor(Math.random() * accountsList.length)],
          tags: ["Personal"],
          notes: "Automated historical record",
          recurring: desc.includes("Premium") || desc.includes("Internet") || desc.includes("Rent") ? "monthly" : "none",
          receiptImage: null,
          isFavorite: Math.random() > 0.85,
          status: "cleared"
        });
      }
    });
  }

  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const DEFAULT_BUDGETS: Budget[] = [
  { category: "Food", limit: 800, spent: 0, month: new Date().toISOString().slice(0, 7) },
  { category: "Shopping", limit: 500, spent: 0, month: new Date().toISOString().slice(0, 7) },
  { category: "Transport", limit: 300, spent: 0, month: new Date().toISOString().slice(0, 7) },
  { category: "Bills", limit: 2000, spent: 0, month: new Date().toISOString().slice(0, 7) },
];

const DEFAULT_GOALS: SavingsGoal[] = [
  { id: "goal-1", name: "Emergency Rainy Day Fund", targetAmount: 15000, currentAmount: 11200, deadline: "2026-12-31", color: "#4F46E5" },
  { id: "goal-2", name: "Europe Summer Vacation", targetAmount: 5000, currentAmount: 2450, deadline: "2027-06-30", color: "#7C3AED" },
];

const DEFAULT_DEBTS: FriendDebt[] = [
  { id: "debt-1", friendName: "Rahul Sharma", amount: 5000, returnedAmount: 2000, borrowDate: "2026-07-10", dueDate: "2026-08-15", status: "Partially Paid", notes: "Weekend getaway expense split" },
  { id: "debt-2", friendName: "Priya Patel", amount: 2500, returnedAmount: 0, borrowDate: "2026-07-20", dueDate: "2026-08-05", status: "Pending", notes: "Concert tickets advance" }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const raw = localStorage.getItem("premium_transactions");
    return raw ? JSON.parse(raw) : SEED_TRANSACTIONS();
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const raw = localStorage.getItem("premium_categories");
    return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const raw = localStorage.getItem("premium_accounts");
    return raw ? JSON.parse(raw) : DEFAULT_ACCOUNTS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const raw = localStorage.getItem("premium_budgets");
    return raw ? JSON.parse(raw) : DEFAULT_BUDGETS;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const raw = localStorage.getItem("premium_goals");
    return raw ? JSON.parse(raw) : DEFAULT_GOALS;
  });

  const [debts, setDebts] = useState<FriendDebt[]>(() => {
    const raw = localStorage.getItem("premium_debts");
    return raw ? JSON.parse(raw) : DEFAULT_DEBTS;
  });

  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem("premium_currency") || "INR";
  });

  const [theme] = useState<"light" | "dark">("light");

  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem("premium_language") || "English";
  });

  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(() => {
    const raw = localStorage.getItem("premium_notif_enabled");
    return raw !== "false";
  });

  const [user, setUser] = useState<User | null>(() => {
    const rawActive = localStorage.getItem("myfinpal_active_user");
    if (rawActive) {
      try {
        const parsed = JSON.parse(rawActive);
        if (parsed && parsed.name) {
          return { id: parsed.id || "user-1", email: parsed.email || "", name: parsed.name, avatar: "" };
        }
      } catch (e) { /* ignore */ }
    }
    const raw = localStorage.getItem("premium_user");
    return raw ? JSON.parse(raw) : null;
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem("premium_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("premium_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("premium_accounts", JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem("premium_budgets", JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem("premium_goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("premium_debts", JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  // Sync active spent values for budgets
  useEffect(() => {
    const updatedBudgets = budgets.map(b => {
      const monthTx = (Array.isArray(transactions) ? transactions : []).filter(t => {
        return t && 
               t.type === "expense" && 
               t.category === b?.category && 
               (t.date || "").slice(0, 7) === b?.month;
      });
      const spent = monthTx.reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);
      return { ...b, spent: parseFloat(spent.toFixed(2)) };
    });
    
    if (JSON.stringify(updatedBudgets) !== JSON.stringify(budgets)) {
      setBudgets(updatedBudgets);
    }
  }, [transactions, budgets]);

  // Notifications triggering
  useEffect(() => {
    if (!notificationsEnabled) return;
    budgets.forEach(b => {
      if (b.spent > b.limit) {
        const alertExists = notifications.some(n => n.message.includes(`exceeded your monthly budget for ${b.category}`));
        if (!alertExists) {
          addNotification("danger", `🚨 Limit Exceeded: You've exceeded your monthly budget for ${b.category} (₹${b.spent} / ₹${b.limit})`);
        }
      } else if (b.spent > b.limit * 0.85) {
        const alertExists = notifications.some(n => n.message.includes(`approaching budget limit for ${b.category}`));
        if (!alertExists) {
          addNotification("warning", `⚠️ Budget Warning: You have spent 85%+ of your budget limit for ${b.category} (₹${b.spent} / ₹${b.limit})`);
        }
      }
    });

    // Check Expense vs Income limit for current month
    const nowLocal = new Date();
    const currentMonth = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, "0")}`;
    const monthTx = transactions.filter(t => (t.date || "").slice(0, 7) === currentMonth);
    const monthIncome = monthTx.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const monthExpense = monthTx.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

    if (monthIncome > 0 && monthExpense > monthIncome) {
      const alertMsg = `🚨 Income Limit Exceeded: Monthly expenses (₹${monthExpense.toLocaleString()}) exceed monthly income (₹${monthIncome.toLocaleString()})!`;
      const alertExists = notifications.some(n => n.message.includes("Income Limit Exceeded"));
      if (!alertExists) {
        addNotification("danger", alertMsg);
      }
    }
  }, [budgets, transactions, notificationsEnabled]);

  const addNotification = (type: Notification["type"], message: string) => {
    if (!notificationsEnabled && type !== "danger") return;
    const newNotif: Notification = {
      id: "notif-" + Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: Date.now()
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const setCurrency = (curr: string) => {
    setCurrencyState(curr);
    localStorage.setItem("premium_currency", curr);
    addNotification("success", `App currency set to ${curr}`);
  };

  const setTheme = (_th: "light" | "dark") => {
    localStorage.setItem("premium_theme", "light");
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("premium_language", lang);
    addNotification("info", `Language set to ${lang}`);
  };

  const setNotificationsEnabled = (enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    localStorage.setItem("premium_notif_enabled", String(enabled));
  };

  // Transaction CRUD Actions
  const addTransaction = (txData: Omit<Transaction, "id">) => {
    const id = "tx-" + Math.random().toString(36).substr(2, 9);
    const newTx: Transaction = { ...txData, id };

    setAccounts(prev => prev.map(acc => {
      if (acc.id === newTx.accountId) {
        const adjustment = newTx.type === "income" ? newTx.amount : -newTx.amount;
        return { ...acc, balance: parseFloat((acc.balance + adjustment).toFixed(2)) };
      }
      return acc;
    }));

    setTransactions(prev => [newTx, ...prev]);
    addNotification("success", `Added Transaction: "${newTx.description}"`);
  };

  const updateTransaction = (updatedTx: Transaction) => {
    const oldTx = transactions.find(t => t.id === updatedTx.id);
    if (!oldTx) return;

    setAccounts(prev => prev.map(acc => {
      let bal = acc.balance;
      if (acc.id === oldTx.accountId) {
        const oldAdjustment = oldTx.type === "income" ? -oldTx.amount : oldTx.amount;
        bal += oldAdjustment;
      }
      if (acc.id === updatedTx.accountId) {
        const newAdjustment = updatedTx.type === "income" ? updatedTx.amount : -updatedTx.amount;
        bal += newAdjustment;
      }
      return { ...acc, balance: parseFloat(bal.toFixed(2)) };
    }));

    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
    addNotification("info", `Updated Transaction: "${updatedTx.description}"`);
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find(t => t.id === id);
    if (!target) return;

    setAccounts(prev => prev.map(acc => {
      if (acc.id === target.accountId) {
        const refundAdjustment = target.type === "income" ? -target.amount : target.amount;
        return { ...acc, balance: parseFloat((acc.balance + refundAdjustment).toFixed(2)) };
      }
      return acc;
    }));

    setTransactions(prev => prev.filter(t => t.id !== id));
    addNotification("warning", `Deleted Transaction: "${target.description}"`);
  };

  const addCategory = (name: string, color: string, icon: string) => {
    const id = "cat-custom-" + Math.random().toString(36).substr(2, 9);
    const newCat: Category = { id, name, color, icon, isCustom: true };
    setCategories(prev => [...prev, newCat]);
    addNotification("success", `Created custom Category: "${name}"`);
  };

  const addAccount = (name: string, type: "Cash" | "Card" | "Bank", balance: number, color: string) => {
    const id = "acc-" + Math.random().toString(36).substr(2, 9);
    const newAcc: Account = { id, name, balance, color, type };
    setAccounts(prev => [...prev, newAcc]);
    addNotification("success", `Added wallet: "${name}"`);
  };

  const addSavingsGoal = (name: string, targetAmount: number, currentAmount: number, deadline: string, color: string) => {
    const id = "goal-" + Math.random().toString(36).substr(2, 9);
    const newGoal: SavingsGoal = { id, name, targetAmount, currentAmount, deadline, color };
    setGoals(prev => [...prev, newGoal]);
    addNotification("success", `Goal Configured: "${name}"`);
  };

  const updateSavingsGoal = (updatedGoal: SavingsGoal) => {
    const oldGoal = goals.find(g => g.id === updatedGoal.id);
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    
    if (oldGoal && updatedGoal.currentAmount >= updatedGoal.targetAmount && oldGoal.currentAmount < oldGoal.targetAmount) {
      addNotification("success", `🎉 Goal Achieved: Congratulations on saving for "${updatedGoal.name}"!`);
    } else {
      addNotification("info", `Updated progress for "${updatedGoal.name}"`);
    }
  };

  const deleteSavingsGoal = (id: string) => {
    const target = goals.find(g => g.id === id);
    setGoals(prev => prev.filter(g => g.id !== id));
    if (target) {
      addNotification("warning", `Removed goal: "${target.name}"`);
    }
  };

  const addBudget = (category: string, limit: number) => {
    const month = new Date().toISOString().slice(0, 7);
    const newBudget: Budget = { category, limit, spent: 0, month };
    setBudgets(prev => [...prev, newBudget]);
    addNotification("success", `Established budget limit for ${category}`);
  };

  const updateBudget = (category: string, limit: number) => {
    const targetBudget = budgets.find(b => b.category === category);
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, limit } : b));
    if (targetBudget && limit > targetBudget.limit) {
      const added = limit - targetBudget.limit;
      addNotification("success", `⚡ Budget Recharged: ${category} limit increased by ${currency} ${added.toLocaleString()} (New Limit: ${currency} ${limit.toLocaleString()})`);
    } else {
      addNotification("info", `Adjusted budget cap for ${category}`);
    }
  };

  const rechargeBudget = (category: string, topUpAmount: number) => {
    if (topUpAmount <= 0) return;
    const targetBudget = budgets.find(b => b.category === category);
    if (targetBudget) {
      const newLimit = parseFloat((targetBudget.limit + topUpAmount).toFixed(2));
      setBudgets(prev => prev.map(b => b.category === category ? { ...b, limit: newLimit } : b));
      addNotification("success", `⚡ Budget Recharged! Top-up of ${currency} ${topUpAmount.toLocaleString()} added to ${category}. New Limit: ${currency} ${newLimit.toLocaleString()}`);
    } else {
      const month = new Date().toISOString().slice(0, 7);
      setBudgets(prev => [...prev, { category, limit: topUpAmount, spent: 0, month }]);
      addNotification("success", `⚡ Budget Recharged! Created ${category} budget with limit of ${currency} ${topUpAmount.toLocaleString()}`);
    }
  };

  const deleteBudget = (category: string) => {
    setBudgets(prev => prev.filter(b => b.category !== category));
    addNotification("warning", `Removed budget threshold for ${category}`);
  };

  const addFriendDebt = (debtData: Omit<FriendDebt, "id" | "returnedAmount" | "status">) => {
    const id = "debt-" + Math.random().toString(36).substr(2, 9);
    const newDebt: FriendDebt = {
      ...debtData,
      id,
      returnedAmount: 0,
      status: "Pending"
    };
    setDebts(prev => [newDebt, ...prev]);
    addNotification("success", `🤝 Added debt record: Borrowed ₹${newDebt.amount.toLocaleString()} from ${newDebt.friendName}`);
  };

  const updateFriendDebt = (updated: FriendDebt) => {
    setDebts(prev => prev.map(d => d.id === updated.id ? updated : d));
    addNotification("info", `Updated debt record for ${updated.friendName}`);
  };

  const recordDebtReturn = (id: string, returnAmount: number, recordAsExpense: boolean = true) => {
    const debt = debts.find(d => d.id === id);
    if (!debt || returnAmount <= 0) return;

    const newReturned = Math.min(debt.amount, debt.returnedAmount + returnAmount);
    const newStatus: FriendDebt["status"] = newReturned >= debt.amount ? "Settled" : "Partially Paid";

    setDebts(prev => prev.map(d => d.id === id ? { ...d, returnedAmount: newReturned, status: newStatus } : d));

    if (recordAsExpense) {
      addTransaction({
        description: `Payback to ${debt.friendName}`,
        amount: returnAmount,
        type: "expense",
        category: "Bills",
        date: new Date().toISOString().slice(0, 10),
        accountId: accounts[0]?.id || "acc-1",
        tags: ["Debt Return", "Friend"],
        notes: `Returned ₹${returnAmount} to ${debt.friendName}`,
        recurring: "none",
        receiptImage: null,
        isFavorite: false,
        status: "cleared"
      });
    }

    if (newStatus === "Settled") {
      addNotification("success", `🎉 Fully Settled! Paid back total ₹${debt.amount.toLocaleString()} to ${debt.friendName}.`);
    } else {
      addNotification("info", `💸 Returned ₹${returnAmount.toLocaleString()} to ${debt.friendName}. Remaining balance: ₹${(debt.amount - newReturned).toLocaleString()}`);
    }
  };

  const deleteFriendDebt = (id: string) => {
    const debt = debts.find(d => d.id === id);
    setDebts(prev => prev.filter(d => d.id !== id));
    if (debt) {
      addNotification("warning", `Removed debt record for ${debt.friendName}`);
    }
  };

  const login = (name: string, email: string) => {
    const newUser = { id: "user-2", name, email, avatar: "" };
    setUser(newUser);
    localStorage.setItem("premium_user", JSON.stringify(newUser));
    addNotification("success", `Logged in as ${name}`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("premium_user");
    authService.logout();
    addNotification("info", "Successfully logged out");
  };

  const importCSVData = (imported: Array<Omit<Transaction, "id">>) => {
    const newTxList = imported.map((tx) => {
      const id = "tx-import-" + Math.random().toString(36).substr(2, 9);
      return { ...tx, id } as Transaction;
    });

    setAccounts(prev => prev.map(acc => {
      let change = 0;
      newTxList.forEach(t => {
        if (t.accountId === acc.id) {
          change += t.type === "income" ? t.amount : -t.amount;
        }
      });
      return { ...acc, balance: parseFloat((acc.balance + change).toFixed(2)) };
    }));

    setTransactions(prev => [...newTxList, ...prev]);
    addNotification("success", `Imported ${newTxList.length} transactions from CSV`);
  };

  // Backups and restoration
  const exportBackup = () => {
    const data = {
      transactions,
      categories,
      accounts,
      budgets,
      goals,
      currency,
      theme,
      language
    };
    return JSON.stringify(data);
  };

  const importBackup = (backupStr: string): boolean => {
    try {
      const data = JSON.parse(backupStr);
      if (data.transactions && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
        if (data.categories) setCategories(data.categories);
        if (data.accounts) setAccounts(data.accounts);
        if (data.budgets) setBudgets(data.budgets);
        if (data.goals) setGoals(data.goals);
        if (data.currency) setCurrencyState(data.currency);
        if (data.language) setLanguageState(data.language);
        addNotification("success", "Backup database restored successfully!");
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        categories,
        accounts,
        budgets,
        goals,
        debts,
        currency,
        theme,
        language,
        notificationsEnabled,
        user,
        notifications,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        addAccount,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        addBudget,
        updateBudget,
        rechargeBudget,
        deleteBudget,
        addFriendDebt,
        updateFriendDebt,
        recordDebtReturn,
        deleteFriendDebt,
        setCurrency,
        setTheme,
        setLanguage,
        setNotificationsEnabled,
        addNotification,
        clearNotification,
        clearAllNotifications,
        login,
        logout,
        importCSVData,
        exportBackup,
        importBackup
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
