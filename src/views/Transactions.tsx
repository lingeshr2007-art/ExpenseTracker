// src/views/Transactions.tsx
import { useState, useMemo, useRef } from "react";
import { useApp } from "../context/AppContext";
import type { Transaction, TransactionStatus } from "../types";
import { FaReceipt, FaImage } from "react-icons/fa6";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  Download, 
  Upload, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface TransactionsProps {
  onEditTransaction: (tx: Transaction) => void;
}

export default function Transactions({ onEditTransaction }: TransactionsProps) {
  const { 
    transactions, 
    categories, 
    accounts, 
    deleteTransaction, 
    updateTransaction, 
    importCSVData, 
    currency 
  } = useApp();

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "income" | "expense">("All");
  const [accountFilter, setAccountFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | TransactionStatus>("All");
  const selectedTag = "All"; // Tag filter reserved for future UI; defaults to all
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [sortBy, setSortBy] = useState<"date-new" | "date-old" | "amt-high" | "amt-low">("date-new");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(val);
  };

  // Tags are used for filter state but allTags memo removed (unused in render)

  // Filtering logic
  const filteredTx = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || 
                          (t.notes || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "All" || t.category === categoryFilter;
      const matchType = typeFilter === "All" || t.type === typeFilter;
      const matchAcc = accountFilter === "All" || t.accountId === accountFilter;
      const matchStatus = statusFilter === "All" || t.status === statusFilter;
      
      let matchDate = true;
      if (startDate) matchDate = matchDate && t.date >= startDate;
      if (endDate) matchDate = matchDate && t.date <= endDate;

      let matchAmt = true;
      if (minAmount) matchAmt = matchAmt && t.amount >= parseFloat(minAmount);
      if (maxAmount) matchAmt = matchAmt && t.amount <= parseFloat(maxAmount);

      const matchFav = !favoritesOnly || t.isFavorite;
      const matchTag = selectedTag === "All" || (t.tags && t.tags.includes(selectedTag));

      return matchSearch && matchCat && matchType && matchAcc && matchDate && matchAmt && matchFav && matchTag && matchStatus;
    });
  }, [transactions, search, categoryFilter, typeFilter, accountFilter, startDate, endDate, minAmount, maxAmount, statusFilter, favoritesOnly, selectedTag]);

  // Sorting logic
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

  // Pagination bounds
  const totalPages = Math.ceil(sortedTx.length / itemsPerPage) || 1;
  const paginatedTx = useMemo(() => {
    const pageIdx = Math.max(1, Math.min(currentPage, totalPages));
    const start = (pageIdx - 1) * itemsPerPage;
    return sortedTx.slice(start, start + itemsPerPage);
  }, [sortedTx, currentPage, itemsPerPage, totalPages]);

  // Toggle favorite star
  const handleToggleFavorite = (tx: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    updateTransaction({ ...tx, isFavorite: !tx.isFavorite });
  };

  // Toggle status cleared/pending
  const handleToggleStatus = (tx: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = tx.status === "cleared" ? "pending" : "cleared";
    updateTransaction({ ...tx, status: newStatus });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteTransaction(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Date", "Description", "Type", "Category", "Amount", "Status"];
    const rows = sortedTx.map(t => [
      t.date,
      `"${(t.description || "").replace(/"/g, '""')}"`,
      t.type,
      t.category,
      t.amount.toFixed(2),
      t.status || "cleared"
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ApexFinance_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV Import parser
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;
        
        try {
          const lines = text.split(/\r?\n/);
          const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
          const list: any[] = [];

          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const obj: any = {};
            for (let j = 0; j < headers.length; j++) {
              let val = currentline[j];
              if (val) {
                val = val.trim().replace(/^["']|["']$/g, "").replace(/""/g, '"');
              }
              obj[headers[j]] = val;
            }
            list.push(obj);
          }

          const formattedImport = list.map((item) => {
            const amount = parseFloat(item["Amount"]) || parseFloat(item["Amount (USD)"]) || 0;
            const typeStr = (item["Type"] || "expense").toLowerCase();
            return {
              description: item["Description"] || "Imported Ledger Record",
              amount,
              type: typeStr === "income" ? "income" : "expense" as any,
              category: item["Category"] || "Other",
              date: item["Date"] || new Date().toISOString().slice(0, 10),
              accountId: accounts[0]?.id || "",
              tags: item["Tags"] ? item["Tags"].split(";") : ["Imported"],
              notes: item["Notes"] || "CSV Ledger Imported",
              recurring: "none" as any,
              receiptImage: null,
              isFavorite: false,
              status: "cleared" as any
            };
          });

          if (formattedImport.length > 0) {
            importCSVData(formattedImport);
          }
        } catch (err) {
          alert("Error parsing CSV ledger. Verify structure standards (Date, Description, Type, Category, Amount).");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-slide-up pb-10">
      
      {/* Title & Import/Export */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            Ledger Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit, filter, and export transaction logs dynamically.
          </p>
        </div>
        
        {/* Ledger Actions */}
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".csv" 
            className="hidden" 
            onChange={handleCSVImport}
            aria-label="CSV Import file selector"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary !py-2 !text-xs flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> Import
          </button>
          <button 
            onClick={handleExportCSV}
            className="btn btn-secondary !py-2 !text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="glass-panel p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Filter className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-350">Search & Filter Matrix</h2>
        </div>

        {/* Row 1: Search, Type, Category, Account */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="form-group">
            <label htmlFor="tx-search" className="input-label">Search Ledger</label>
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                id="tx-search"
                type="text"
                className="input-field !pl-9"
                placeholder="Search desc, tags, notes..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tx-type" className="input-label">Flow Type</label>
            <select
              id="tx-type"
              className="input-field"
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value as any); setCurrentPage(1); }}
            >
              <option value="All">All Transactions</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Inflows Only</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tx-category" className="input-label">Category</label>
            <select
              id="tx-category"
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
            <label htmlFor="tx-wallet" className="input-label">Wallet Account</label>
            <select
              id="tx-wallet"
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

        {/* Row 2: Date, Amount range, Status, Tag */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="form-group">
            <label htmlFor="tx-start" className="input-label">Start Date</label>
            <input
              id="tx-start"
              type="date"
              className="input-field"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tx-end" className="input-label">End Date</label>
            <input
              id="tx-end"
              type="date"
              className="input-field"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tx-min" className="input-label">Min / Max Amount</label>
            <div className="flex gap-2">
              <input
                id="tx-min"
                type="number"
                placeholder="Min"
                className="input-field !py-1.5"
                value={minAmount}
                onChange={e => { setMinAmount(e.target.value); setCurrentPage(1); }}
              />
              <input
                type="number"
                placeholder="Max"
                className="input-field !py-1.5"
                value={maxAmount}
                onChange={e => { setMaxAmount(e.target.value); setCurrentPage(1); }}
                aria-label="Max amount filter"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tx-status" className="input-label">Clearance Status</label>
            <select
              id="tx-status"
              className="input-field"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
            >
              <option value="All">All Statuses</option>
              <option value="cleared">Cleared</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Row 3: Sort, Tag dropdown & Favorites */}
          <div className="flex gap-2 w-full lg:col-span-1">
            <div className="form-group flex-1">
              <label htmlFor="tx-sort" className="input-label">Order By</label>
              <select
                id="tx-sort"
                className="input-field"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
              >
                <option value="date-new">Date: Newest</option>
                <option value="date-old">Date: Oldest</option>
                <option value="amt-high">Amount: High</option>
                <option value="amt-low">Amount: Low</option>
              </select>
            </div>
            
            <button 
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border self-end transition-all ${
                favoritesOnly 
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-sm" 
                  : "bg-slate-50/50 dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/40 text-slate-400 hover:text-slate-600"
              }`}
              title="Show Favorites Only"
              aria-label="Show favorites filter toggle"
            >
              <Star className={`w-5 h-5 ${favoritesOnly ? "fill-amber-400 text-amber-400" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Records Table Card */}
      <div className="glass-panel p-5 flex flex-col gap-4 overflow-hidden">
        {paginatedTx.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No records found</h3>
            <p className="text-xs text-slate-400 mt-1">Adjust search metrics or add items.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th style={{ width: "36px" }}>Fav</th>
                    <th>Status</th>
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
                    const color = catObj?.color || "#6b7280";

                    return (
                      <tr 
                        key={tx.id}
                        onClick={() => setSelectedTx(tx)}
                        className="cursor-pointer"
                      >
                        {/* Fav Star Toggle */}
                        <td onClick={e => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleToggleFavorite(tx, e)}
                            className="p-1 rounded text-slate-400 hover:text-amber-500"
                            aria-label={tx.isFavorite ? "Unfavorite" : "Favorite"}
                          >
                            <Star className={`w-4 h-4 ${tx.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                          </button>
                        </td>

                        {/* Status Toggle */}
                        <td onClick={e => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleToggleStatus(tx, e)}
                            className={`flex items-center justify-center p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800`}
                            title={tx.status === "cleared" ? "Cleared (Click to make pending)" : "Pending (Click to clear)"}
                            aria-label="Change status"
                          >
                            {tx.status === "cleared" ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-500" />
                            )}
                          </button>
                        </td>

                        {/* Date */}
                        <td className="text-xs text-slate-500 dark:text-slate-450 white-space-nowrap">{tx.date}</td>

                        {/* Description */}
                        <td>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{tx.description}</span>
                            {tx.tags && tx.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {tx.tags.map(tag => (
                                  <span 
                                    key={tag} 
                                    className="text-[9px] font-bold px-1.5 py-0.25 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded"
                                  >
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
                            style={{ backgroundColor: `${color}15`, color }}
                          >
                            <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: color }} />
                            {tx.category}
                          </span>
                        </td>

                        {/* Wallet Used */}
                        <td className="text-xs text-slate-500">{accounts.find(a => a.id === tx.accountId)?.name || "Wallet"}</td>

                        {/* Amount */}
                        <td className={`text-right font-extrabold text-sm ${isIncome ? "text-emerald-500" : "text-slate-800 dark:text-slate-200"}`}>
                          {isIncome ? "+" : "-"} {formatCurrency(tx.amount)}
                        </td>

                        {/* Action buttons */}
                        <td onClick={e => e.stopPropagation()} style={{ textAlign: "center" }}>
                          <div className="flex gap-1.5 justify-center">
                            <button
                              onClick={() => setSelectedTx(tx)}
                              className="btn btn-secondary !p-1.5 !rounded-lg"
                              title="Details"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                            <button
                              onClick={() => onEditTransaction(tx)}
                              className="btn btn-secondary !p-1.5 !rounded-lg"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(tx.id)}
                              className="btn btn-danger !p-1.5 !rounded-lg !bg-rose-500/10 hover:!bg-rose-500 hover:text-white"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500 hover:text-white" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4 mt-2 flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Show</span>
                <select
                  className="input-field !py-1"
                  style={{ width: "70px" }}
                  value={itemsPerPage}
                  onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  aria-label="Items per page"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>items per page</span>
              </div>

              <div className="text-xs text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedTx.length)} of {sortedTx.length} items
              </div>

              <div className="flex gap-1">
                <button
                  className="btn btn-secondary !py-1.5 !px-3 !text-xs flex items-center gap-1"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <span className="flex items-center px-3 text-xs font-bold">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary !py-1.5 !px-3 !text-xs flex items-center gap-1"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedTx(null)}
        >
          <div 
            className="glass-panel p-6 w-full max-w-sm flex flex-col gap-4 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <span className={`badge ${selectedTx.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                {selectedTx.type}
              </span>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-850" onClick={() => setSelectedTx(null)}>✕</button>
            </div>
            
            <div className="text-center my-2">
              <span className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">Amount</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {selectedTx.type === "income" ? "+" : "-"} {formatCurrency(selectedTx.amount)}
              </h3>
            </div>

            <div className="flex flex-col gap-2.5 text-xs border-t border-slate-150 dark:border-slate-800 pt-4">
              <div>
                <span className="text-slate-400 font-medium">Description:</span>{" "}
                <strong className="text-slate-800 dark:text-slate-100">{selectedTx.description}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Date Logged:</span>{" "}
                <strong>{selectedTx.date}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Category:</span>{" "}
                <strong>{selectedTx.category}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Billing Wallet:</span>{" "}
                <strong>{accounts.find(a => a.id === selectedTx.accountId)?.name || "Wallet"}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Schedule:</span>{" "}
                <strong className="capitalize">{selectedTx.recurring}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Status:</span>{" "}
                <strong className="capitalize">{selectedTx.status}</strong>
              </div>
              {selectedTx.notes && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/60 rounded-lg text-[11px] leading-relaxed">
                  <span className="text-slate-400 block font-semibold mb-0.5">Notes:</span>
                  {selectedTx.notes}
                </div>
              )}
              {selectedTx.receiptImage && (
                <div>
                  <span className="text-slate-400 block font-semibold mb-1">Receipt Attachment:</span>
                  <div className="rounded-lg p-3 border border-slate-200 dark:border-slate-800 bg-slate-900 flex items-center gap-3">
                    <FaReceipt size={22} style={{ color: "#41DC65" }} />
                    <span className="text-xs font-bold text-slate-200">Receipt Attached</span>
                    <FaImage size={18} style={{ color: "#3EC3D5", marginLeft: "auto" }} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button 
                className="btn btn-secondary flex-1"
                onClick={() => {
                  onEditTransaction(selectedTx);
                  setSelectedTx(null);
                }}
              >
                ✏️ Edit
              </button>
              <button className="btn btn-danger flex-1" onClick={() => setSelectedTx(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Double-Check Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmId !== null}
        title="⚠️ Delete transaction record"
        message="Are you sure you want to permanently delete this transaction? This action will adjust your account balance and cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmId(null)}
      />

    </div>
  );
}
