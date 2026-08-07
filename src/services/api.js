// src/services/api.js
/**
 * ApexFinance API Client Layer
 * Connects frontend to Express/SQLite Backend REST API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SESSION_TOKEN_KEY = "myfinpal_session_token";


// Helper: Get Auth Headers
function getHeaders() {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// Helper: Generic fetch handler
async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    const contentType = res.headers.get("content-type");
    let data = {};
    if (contentType && contentType.includes("application/json")) {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } else {
      throw new Error(`API Endpoint Unavailable (${res.status})`);
    }

    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.warn(`[API Client Warning] ${endpoint}:`, err.message);
    throw new Error(err.message || "Network request failed");
  }
}

export const api = {
  // ── Auth ──
  signup: (name, email, password) => request("/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  login: (email, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  sendLoginOtp: (email, password) => request("/auth/login-otp/send", { method: "POST", body: JSON.stringify({ email, password }) }),
  verifyLoginOtp: (email, otpSessionId, otpCode) => request("/auth/login-otp/verify", { method: "POST", body: JSON.stringify({ email, otpSessionId, otpCode }) }),
  resendLoginOtp: (email, otpSessionId) => request("/auth/login-otp/resend", { method: "POST", body: JSON.stringify({ email, otpSessionId }) }),
  getProfile: () => request("/auth/me"),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (email, otpCode, newPassword) => request("/auth/reset-password", { method: "POST", body: JSON.stringify({ email, otpCode, newPassword }) }),

  // ── Transactions ──
  getTransactions: () => request("/transactions"),
  addTransaction: (tx) => request("/transactions", { method: "POST", body: JSON.stringify(tx) }),
  updateTransaction: (id, tx) => request(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(tx) }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: "DELETE" }),

  // ── Budget ──
  getBudget: () => request("/budget"),
  setBudget: (budget) => request("/budget", { method: "PUT", body: JSON.stringify({ budget }) }),

  // ── Savings Goals & History ──
  getSavingsGoals: () => request("/savings/goals"),
  addSavingsGoal: (goal) => request("/savings/goals", { method: "POST", body: JSON.stringify(goal) }),
  updateSavingsGoal: (id, goal) => request(`/savings/goals/${id}`, { method: "PUT", body: JSON.stringify(goal) }),
  deleteSavingsGoal: (id) => request(`/savings/goals/${id}`, { method: "DELETE" }),

  getSavingsHistory: () => request("/savings/history"),
  addSavingsHistory: (entry) => request("/savings/history", { method: "POST", body: JSON.stringify(entry) }),

  // ── Debts ──
  getDebts: () => request("/debts"),
  addDebt: (debt) => request("/debts", { method: "POST", body: JSON.stringify(debt) }),
  updateDebt: (id, debt) => request(`/debts/${id}`, { method: "PUT", body: JSON.stringify(debt) }),
  deleteDebt: (id) => request(`/debts/${id}`, { method: "DELETE" }),
};

export default api;
