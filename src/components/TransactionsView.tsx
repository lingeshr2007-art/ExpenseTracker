// src/components/TransactionsView.tsx
import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import type { Transaction } from "../types";
import { FaReceipt, FaImage } from "react-icons/fa6";

interface TransactionsViewProps {
  onEditTransaction: (tx: Transaction) => void;
}

export default function TransactionsView({ onEditTransaction }: TransactionsViewProps) {
  const { transactions, categories, accounts, deleteTransaction, updateTransaction, currency } = useApp();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "income" | "expense">("All");
  const [accountFilter, setAccountFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState("All");

  // Sorting State
  const [sortBy, setSortBy] = useState<"date-new" | "date-old" | "amt-high" | "amt-low">("date-new");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(val);
  };

  // Compile all unique tags in the system for filter dropdown
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    transactions.forEach(t => {
      if (t.tags) t.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [transactions]);

  // Filtering Logic
  const filteredTx = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || 
                          (t.notes || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "All" || t.category === categoryFilter;
      const matchType = typeFilter === "All" || t.type === typeFilter;
      const matchAcc = accountFilter === "All" || t.accountId === accountFilter;
      
      let matchDate = true;
      if (startDate) matchDate = matchDate && t.date >= startDate;
      if (endDate) matchDate = matchDate && t.date <= endDate;

      const matchFav = !favoritesOnly || t.isFavorite;
      const matchTag = selectedTag === "All" || (t.tags && t.tags.includes(selectedTag));

      return matchSearch && matchCat && matchType && matchAcc && matchDate && matchFav && matchTag;
    });
  }, [transactions, search, categoryFilter, typeFilter, accountFilter, startDate, endDate, favoritesOnly, selectedTag]);

  // Sorting Logic
  const sortedTx = useMemo(() => {
    const list = [...filteredTx];
    if (sortBy === "date-new") {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === "date-old") {
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === "amt-high") {
      list.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === "amt-low") {
      list.sort((a, b) => a.amount - b.amount);
    }
    return list;
  }, [filteredTx, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedTx.length / itemsPerPage) || 1;
  const paginatedTx = useMemo(() => {
    // clamp page
    const pageIdx = Math.max(1, Math.min(currentPage, totalPages));
    const start = (pageIdx - 1) * itemsPerPage;
    return sortedTx.slice(start, start + itemsPerPage);
  }, [sortedTx, currentPage, itemsPerPage, totalPages]);

  // Toggle favorite trigger
  const handleToggleFavorite = (tx: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    updateTransaction({ ...tx, isFavorite: !tx.isFavorite });
  };

  const getAccountName = (accId: string) => {
    const acc = accounts.find(a => a.id === accId);
    return acc ? acc.name : "Wallet";
  };

  return (
    <div className="tab-content" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", paddingBottom: "2rem" }}>
      
      {/* View Title */}
      <div>
        <h1 style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>Transaction Ledger</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
          Search, filter, and review your historical income and expense transactions.
        </p>
      </div>

      {/* Filters Card */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        {/* Row 1: Search & Type */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "1rem" }} className="filter-grid-row">
          <div className="form-group">
            <label htmlFor="search-desc" className="input-label">Search</label>
            <input
              id="search-desc"
              type="text"
              className="input-field"
              placeholder="Search description, notes..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="filter-type" className="input-label">Type</label>
            <select
              id="filter-type"
              className="input-field"
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value as any); setCurrentPage(1); }}
            >
              <option value="All">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="filter-category" className="input-label">Category</label>
            <select
              id="filter-category"
              className="input-field"
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="filter-account" className="input-label">Wallet</label>
            <select
              id="filter-account"
              className="input-field"
              value={accountFilter}
              onChange={e => { setAccountFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Accounts</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Dates, Tags, Sort, Favorites */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr", gap: "1rem", alignItems: "end" }} className="filter-grid-row">
          <div className="form-group">
            <label htmlFor="start-date" className="input-label">Start Date</label>
            <input
              id="start-date"
              type="date"
              className="input-field"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="end-date" className="input-label">End Date</label>
            <input
              id="end-date"
              type="date"
              className="input-field"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="filter-tag" className="input-label">Tags</label>
            <select
              id="filter-tag"
              className="input-field"
              value={selectedTag}
              onChange={e => { setSelectedTag(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="sort-by" className="input-label">Sort By</label>
            <select
              id="sort-by"
              className="input-field"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
            >
              <option value="date-new">Date: Newest</option>
              <option value="date-old">Date: Oldest</option>
              <option value="amt-high">Amount: Highest</option>
              <option value="amt-low">Amount: Lowest</option>
            </select>
          </div>
          
          <button 
            type="button"
            className="btn btn-secondary"
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            style={{
              width: "100%",
              borderColor: favoritesOnly ? "var(--color-primary)" : "var(--border-color)",
              color: favoritesOnly ? "var(--color-primary)" : "var(--color-text-primary)",
              background: favoritesOnly ? "var(--color-primary-light)" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            {favoritesOnly ? "⭐️ Favorites Only" : "☆ All Items"}
          </button>
        </div>
      </div>

      {/* Ledger Results Card */}
      <div className="glass-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        {paginatedTx.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--color-text-muted)" }}>
            <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>🔍</span>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 600 }}>No Transactions Match Filters</h3>
            <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
              Try loosening your search terms or clearing date filters.
            </p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Fav</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Wallet</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTx.map((tx) => {
                    const isIncome = tx.type === "income";
                    const catObj = categories.find(c => c.name === tx.category);
                    const color = catObj?.color || "#94a3b8";

                    return (
                      <tr 
                        key={tx.id}
                        onClick={() => setSelectedTx(tx)}
                        style={{ cursor: "pointer" }}
                      >
                        {/* Fav Star */}
                        <td style={{ width: "40px", paddingRight: 0 }}>
                          <button 
                            className="btn-icon"
                            onClick={(e) => handleToggleFavorite(tx, e)}
                            style={{ border: "none", background: "none", fontSize: "1.1rem", padding: 0 }}
                            aria-label={tx.isFavorite ? "Unfavorite" : "Favorite"}
                          >
                            {tx.isFavorite ? "⭐️" : "☆"}
                          </button>
                        </td>
                        
                        {/* Date */}
                        <td style={{ whiteSpace: "nowrap", fontSize: "0.9rem" }}>{tx.date}</td>
                        
                        {/* Desc */}
                        <td style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span>{tx.description}</span>
                            {tx.tags && tx.tags.length > 0 && (
                              <div style={{ display: "flex", gap: "0.25rem" }}>
                                {tx.tags.slice(0, 2).map(tag => (
                                  <span key={tag} style={{ fontSize: "0.65rem", padding: "0 0.25rem", borderRadius: "3px", background: "var(--border-color)", color: "var(--color-text-secondary)" }}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Category Badge */}
                        <td>
                          <span 
                            className="badge"
                            style={{
                              backgroundColor: `${color}15`,
                              color
                            }}
                          >
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: color }} />
                            {tx.category}
                          </span>
                        </td>

                        {/* Account wallet */}
                        <td style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                          {getAccountName(tx.accountId)}
                        </td>

                        {/* Amount */}
                        <td style={{ textAlign: "right", fontWeight: 700, fontSize: "0.95rem", color: isIncome ? "var(--color-success)" : "var(--color-text-primary)" }}>
                          {isIncome ? "+" : "-"} {formatCurrency(tx.amount)}
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: "center" }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                            <button 
                              className="btn btn-secondary"
                              style={{ padding: "0.35rem", borderRadius: "0.375rem" }}
                              onClick={() => onEditTransaction(tx)}
                              title="Edit transaction"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn btn-danger"
                              style={{ padding: "0.35rem", borderRadius: "0.375rem" }}
                              onClick={() => deleteTransaction(tx.id)}
                              title="Delete transaction"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                borderTop: "1px solid var(--border-color)", 
                paddingTop: "1rem", 
                flexWrap: "wrap",
                gap: "1rem"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                <span>Show</span>
                <select
                  className="input-field"
                  style={{ width: "70px", padding: "0.25rem" }}
                  value={itemsPerPage}
                  onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  aria-label="Items per page"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>records per page</span>
              </div>

              <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedTx.length)} of {sortedTx.length} items
              </div>

              <div style={{ display: "flex", gap: "0.25rem" }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  ◀ Prev
                </button>
                <span style={{ display: "flex", alignItems: "center", padding: "0 0.75rem", fontSize: "0.85rem", fontWeight: 700 }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Next ▶
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Transaction Details Modal Backdrop Pop */}
      {selectedTx && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(5px)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}
          onClick={() => setSelectedTx(null)}
        >
          <div 
            className="glass-card"
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="badge" style={{ backgroundColor: selectedTx.type === "income" ? "var(--color-success-light)" : "var(--color-danger-light)", color: selectedTx.type === "income" ? "var(--color-success)" : "var(--color-danger)" }}>
                {selectedTx.type}
              </span>
              <button className="btn-icon" onClick={() => setSelectedTx(null)}>✕</button>
            </div>
            
            <div style={{ textAlign: "center", margin: "0.5rem 0" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Amount</span>
              <h3 style={{ fontSize: "2rem", fontWeight: 800, margin: "2px 0 0" }}>
                {selectedTx.type === "income" ? "+" : "-"} {formatCurrency(selectedTx.amount)}
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>Description:</span>{" "}
                <strong style={{ color: "var(--color-text-primary)" }}>{selectedTx.description}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>Date:</span>{" "}
                <strong>{selectedTx.date}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>Category:</span>{" "}
                <strong>{selectedTx.category}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>Billing Account:</span>{" "}
                <strong>{getAccountName(selectedTx.accountId)}</strong>
              </div>
              {selectedTx.recurring !== "none" && (
                <div>
                  <span style={{ color: "var(--color-text-muted)" }}>Schedule:</span>{" "}
                  <strong>Recurring {selectedTx.recurring}</strong>
                </div>
              )}
              {selectedTx.tags && selectedTx.tags.length > 0 && (
                <div>
                  <span style={{ color: "var(--color-text-muted)" }}>Tags:</span>{" "}
                  <div style={{ display: "inline-flex", gap: "0.25rem", marginLeft: "4px" }}>
                    {selectedTx.tags.map(tag => (
                      <span key={tag} style={{ fontSize: "0.7rem", padding: "1px 6px", borderRadius: "3px", background: "var(--border-color)", color: "var(--color-text-secondary)", fontWeight: 600 }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedTx.notes && (
                <div style={{ marginTop: "0.5rem", padding: "0.5rem", borderRadius: "0.25rem", background: "rgba(0, 0, 0, 0.05)" }}>
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", display: "block" }}>Notes:</span>
                  {selectedTx.notes}
                </div>
              )}
              {selectedTx.receiptImage && (
                <div style={{ marginTop: "0.5rem" }}>
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Receipt Attachment:</span>
                  <div style={{ borderRadius: "0.5rem", border: "1px solid var(--color-border)", padding: "0.75rem", background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FaReceipt size={20} color="#10B981" />
                    <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Receipt Attached</span>
                    <FaImage size={18} color="#4F46E5" style={{ marginLeft: "auto" }} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => {
                  onEditTransaction(selectedTx);
                  setSelectedTx(null);
                }}
              >
                ✏️ Edit
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => setSelectedTx(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters responsive styles overrides */}
      <style>{`
        @media (max-width: 768px) {
          .filter-grid-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
