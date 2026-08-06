// src/types/index.ts

export type TransactionType = "income" | "expense";
export type RecurringInterval = "none" | "daily" | "weekly" | "monthly" | "yearly";
export type AccountType = "Cash" | "Card" | "Bank";
export type NotificationType = "success" | "warning" | "info" | "danger";
export type TransactionStatus = "cleared" | "pending";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  accountId: string; // Belongs to an Account
  tags: string[];
  notes: string;
  recurring: RecurringInterval;
  receiptImage: string | null; // Base64 receipt data
  isFavorite: boolean;
  status: TransactionStatus;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isCustom: boolean;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
  month: string; // YYYY-MM
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  color: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  color: string;
  type: AccountType;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export interface FriendDebt {
  id: string;
  friendName: string;
  amount: number;
  returnedAmount: number;
  borrowDate: string; // YYYY-MM-DD
  dueDate: string;    // YYYY-MM-DD
  status: "Pending" | "Partially Paid" | "Settled";
  notes: string;
}
