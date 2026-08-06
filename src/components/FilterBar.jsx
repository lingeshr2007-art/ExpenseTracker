// src/components/FilterBar.jsx
import React from "react";
import { saveAs } from "file-saver";
import { exportToCSV } from "../utils/csv.js";

const CATEGORIES = [
  "All",
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Health",
  "Shopping",
  "Other",
];

export default function FilterBar({ filters, setFilters, transactions }) {
  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleCategoryChange = (e) => {
    setFilters({ ...filters, category: e.target.value });
  };

  const handleExport = () => {
    const csvBlob = exportToCSV(transactions || []);
    const timestamp = new Date().toISOString().split("T")[0];
    saveAs(csvBlob, `transactions_${timestamp}.csv`);
  };

  return (
    <section className="filter-bar card container" style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
      <input
        type="text"
        className="input"
        placeholder="Search description..."
        value={filters.search}
        onChange={handleSearchChange}
        aria-label="Search transactions"
      />
      <select className="select" value={filters.category} onChange={handleCategoryChange} aria-label="Filter by category">
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <button className="button" onClick={handleExport} disabled={!transactions || transactions.length === 0}>
        Export CSV
      </button>
    </section>
  );
}
