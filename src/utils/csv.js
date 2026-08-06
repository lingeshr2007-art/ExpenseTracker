// src/utils/csv.js
export function exportCSV(transactions) {
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
