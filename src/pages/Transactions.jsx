// src/pages/Transactions.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import { formatCurrency, formatDate } from "../utils/format";
import { CategoryIcon } from "../utils/categoryIcons";
import { exportCSV } from "../utils/csv";
import {
  FaMagnifyingGlass,
  FaDownload,
  FaTrashCan,
  FaPen,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaPlus,
} from "react-icons/fa6";

const PER_PAGE = 10;

export default function Transactions() {
  const { transactions, categories, deleteTransaction, showToast, addTransaction } = useStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCat, setFilterCat] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = Array.isArray(transactions) ? transactions.filter(Boolean) : [];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          (t.description || "").toLowerCase().includes(q) ||
          (t.category || "").toLowerCase().includes(q)
      );
    }

    // Type filter
    if (filterType !== "all") {
      list = list.filter((t) => t && t.type === filterType);
    }

    // Category filter
    if (filterCat !== "All") {
      list = list.filter((t) => t && t.category === filterCat);
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") cmp = new Date(a?.date || 0) - new Date(b?.date || 0);
      else if (sortBy === "amount") cmp = (Number(a?.amount) || 0) - (Number(b?.amount) || 0);
      else if (sortBy === "description") cmp = (a?.description || "").localeCompare(b?.description || "");
      return sortDir === "desc" ? -cmp : cmp;
    });

    return list;
  }, [transactions, search, filterType, filterCat, sortBy, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDelete = (tx) => {
    if (!tx || !tx.id) return;
    const removed = tx;
    deleteTransaction(tx.id);
    showToast("Transaction deleted", () => {
      addTransaction({
        description: removed.description || "Restored Transaction",
        amount: Number(removed.amount) || 0,
        type: removed.type || "expense",
        category: removed.category || "Other",
        date: removed.date || new Date().toISOString().slice(0, 10),
      });
    });
    setConfirmDelete(null);
  };

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDir("desc"); }
    setPage(1);
  };

  const usedCategories = useMemo(() => {
    const safeTx = Array.isArray(transactions) ? transactions.filter(Boolean) : [];
    const set = new Set(safeTx.map((t) => t?.category).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [transactions]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Transactions</h2>
          <p className="page-subtitle">{(Array.isArray(transactions) ? transactions.length : 0)} total transactions</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="btn btn-secondary"
            onClick={() => exportCSV(filtered)}
            disabled={!filtered.length}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
          >
            <FaDownload size={13} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/add")} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
            <FaPlus size={13} /> Add New
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card card-p animate-in" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <FaMagnifyingGlass size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
          <input
            className="input-field"
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: "2.25rem" }}
          />
        </div>

        {/* Type chips */}
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {[
            { value: "all", label: "All" },
            { value: "income", label: "Income" },
            { value: "expense", label: "Expense" },
          ].map((opt) => (
            <button
              key={opt.value}
              className={`chip ${filterType === opt.value ? "active" : ""}`}
              onClick={() => { setFilterType(opt.value); setPage(1); }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Category */}
        <select
          className="input-field"
          style={{ width: "auto", minWidth: 130 }}
          value={filterCat}
          onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}
        >
          {usedCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card animate-in" style={{ animationDelay: "0.1s", overflow: "auto" }}>
        {filtered.length > 0 ? (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ cursor: "pointer" }} onClick={() => toggleSort("description")}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      Description <FaSort size={10} />
                    </span>
                  </th>
                  <th>Category</th>
                  <th style={{ cursor: "pointer" }} onClick={() => toggleSort("date")}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      Date <FaSort size={10} />
                    </span>
                  </th>
                  <th style={{ textAlign: "right", cursor: "pointer" }} onClick={() => toggleSort("amount")}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                      Amount <FaSort size={10} />
                    </span>
                  </th>
                  <th style={{ textAlign: "center", width: 80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((tx) => {
                  if (!tx) return null;
                  const cat = (Array.isArray(categories) ? categories : []).find((c) => c && c.name === tx.category);
                  const isIncome = tx.type === "income";
                  return (
                    <tr key={tx.id || `tx_${Math.random()}`}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8, display: "flex",
                            alignItems: "center", justifyContent: "center", flexShrink: 0,
                            background: isIncome ? "rgba(46, 158, 109, 0.12)" : "rgba(214, 90, 90, 0.12)",
                          }}>
                            {isIncome
                              ? <FaArrowTrendUp size={13} color="#2E9E6D" />
                              : <FaArrowTrendDown size={13} color="#D65A5A" />}
                          </div>
                          <span style={{ fontWeight: 600 }}>{tx.description || "Untitled"}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: "#F1F1F8", color: "#4F5DED" }}>
                          <CategoryIcon name={cat?.icon} size={11} />
                          {tx.category || "Other"}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.75rem", color: "#6B6B72" }}>
                        {formatDate(tx.date)}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, fontSize: "0.875rem", color: isIncome ? "#2E9E6D" : "#D65A5A" }}>
                        {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                          <button
                            className="btn btn-icon btn-secondary btn-sm"
                            title="Edit"
                            onClick={() => navigate(`/add?edit=${tx.id}`)}
                          >
                            <FaPen size={12} />
                          </button>
                          <button
                            className="btn btn-icon btn-danger btn-sm"
                            title="Delete"
                            onClick={() => setConfirmDelete(tx)}
                          >
                            <FaTrashCan size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.75rem 1rem", borderTop: "1px solid var(--color-border)",
                fontSize: "0.75rem", color: "var(--color-text-muted)",
              }}>
                <span>
                  Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                </span>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button
                    className="btn btn-icon btn-secondary btn-sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <FaChevronLeft size={12} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && arr[idx - 1] < p - 1 && (
                          <span style={{ padding: "0 0.25rem" }}>…</span>
                        )}
                        <button
                          className={`btn btn-sm ${p === page ? "btn-primary" : "btn-secondary"}`}
                          onClick={() => setPage(p)}
                          style={{ minWidth: 32 }}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))}
                  <button
                    className="btn btn-icon btn-secondary btn-sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <FaChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            className="empty-state"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "4rem 1.5rem",
              borderRadius: "1rem",
              backgroundColor: "#FFFFFF",
            }}
          >
            <div
              style={{
                fontSize: "1.125rem",
                fontWeight: 800,
                color: "#1A1A1E",
                marginBottom: "0.35rem",
                letterSpacing: "-0.01em",
              }}
            >
              {transactions.length === 0 ? "No transactions yet" : "No matching transactions"}
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#6B6B72",
                marginBottom: "1.25rem",
                maxWidth: "360px",
                lineHeight: 1.5,
              }}
            >
              {transactions.length === 0
                ? "Add your first transaction to get started with tracking your finances."
                : "Try adjusting your search query or category filters."}
            </div>
            {transactions.length === 0 && (
              <button
                className="btn btn-primary"
                onClick={() => navigate("/add")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#4F5DED",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                <FaPlus size={14} /> Add Transaction
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Transaction</h3>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "0.875rem" }}>
                Are you sure you want to delete <strong>"{confirmDelete.description}"</strong>?
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                This action can be undone via the toast notification.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete)} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                <FaTrashCan size={13} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
