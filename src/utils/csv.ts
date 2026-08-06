// src/utils/csv.ts
import type { Transaction } from "../types";

export function exportCSV(transactions: Transaction[]): void {
  if (!transactions.length) return;
  const headers = ["Date", "Description", "Category", "Type", "Amount"];
  const rows = transactions.map((t) => [
    t.date,
    `"${(t.description || "").replace(/"/g, '""')}"`,
    t.category,
    t.type,
    t.amount.toFixed(2),
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV(transactions: Transaction[], filename: string = "transactions.csv"): void {
  if (!transactions.length) return;
  const headers = ["Date", "Description", "Category", "Type", "Amount", "Status", "Account"];
  const rows = transactions.map((t) => [
    t.date,
    `"${(t.description || "").replace(/"/g, '""')}"`,
    t.category,
    t.type,
    t.amount.toFixed(2),
    t.status || "completed",
    t.accountId || "wallet"
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
