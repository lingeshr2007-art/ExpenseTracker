// src/utils/storage.js (updated with currency persistence)

const TRANSACTIONS_KEY = "transactions";
const BUDGET_KEY = "monthlyBudget";
const THEME_KEY = "theme";
const CURRENCY_KEY = "currency"; // e.g., "USD", "EUR"

export function loadTransactions() {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Failed to parse transactions", e);
    return [];
  }
}

export function saveTransactions(transactions) {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error("Failed to save transactions", e);
  }
}

export function loadBudget() {
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    if (!raw) return 0;
    const value = Number(raw);
    return isNaN(value) ? 0 : value;
  } catch (e) {
    console.warn("Failed to load budget", e);
    return 0;
  }
}

export function saveBudget(budget) {
  try {
    localStorage.setItem(BUDGET_KEY, String(budget));
  } catch (e) {
    console.error("Failed to save budget", e);
  }
}

export function loadTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return raw === "dark" || raw === "light" ? raw : "light";
  } catch (e) {
    console.warn("Failed to load theme", e);
    return "light";
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error("Failed to save theme", e);
  }
}

export function loadCurrency() {
  try {
    const raw = localStorage.getItem(CURRENCY_KEY);
    return raw || "USD";
  } catch (e) {
    console.warn("Failed to load currency", e);
    return "USD";
  }
}

export function saveCurrency(currency) {
  try {
    localStorage.setItem(CURRENCY_KEY, currency);
  } catch (e) {
    console.error("Failed to save currency", e);
  }
}
