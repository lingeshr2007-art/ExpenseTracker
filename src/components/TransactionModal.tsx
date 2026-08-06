// src/components/TransactionModal.tsx
import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import type { Transaction, TransactionType, RecurringInterval, TransactionStatus } from "../types";
import { predictCategory } from "../utils/aiEngine";
import Drawer from "./Drawer";
import {
  FaPlus,
  FaImage,
  FaReceipt,
} from "react-icons/fa6";

interface TransactionModalProps {
  editTx: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionModal({ editTx, isOpen, onClose }: TransactionModalProps) {
  const { 
    categories, 
    accounts, 
    transactions,
    budgets,
    currency,
    addTransaction, 
    updateTransaction,
    addCategory 
  } = useApp();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [accountId, setAccountId] = useState("");
  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [recurring, setRecurring] = useState<RecurringInterval>("none");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [status, setStatus] = useState<TransactionStatus>("cleared");

  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#4F46E5");
  const [newCatIcon, setNewCatIcon] = useState("🏷️");
  const [showAddCat, setShowAddCat] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate or reset form fields
  useEffect(() => {
    if (editTx) {
      setDescription(editTx.description);
      setAmount(editTx.amount.toString());
      setType(editTx.type);
      setCategory(editTx.category);
      setDate(editTx.date);
      setAccountId(editTx.accountId);
      setNotes(editTx.notes || "");
      setTags(editTx.tags || []);
      setRecurring(editTx.recurring || "none");
      setReceiptImage(editTx.receiptImage || null);
      setIsFavorite(editTx.isFavorite || false);
      setStatus(editTx.status || "cleared");
    } else {
      setDescription("");
      setAmount("");
      setType("expense");
      setCategory(categories.find(c => c.name !== "Salary")?.name || categories[0]?.name || "");
      setDate(new Date().toISOString().slice(0, 10));
      setAccountId(accounts[0]?.id || "");
      setNotes("");
      setTags([]);
      setRecurring("none");
      setReceiptImage(null);
      setIsFavorite(false);
      setStatus("cleared");
    }
    setErrors({});
    setShowAddCat(false);
  }, [editTx, isOpen, categories, accounts]);

  // Smart categorization
  const handleDescriptionBlur = () => {
    if (!editTx && description.trim() && type === "expense") {
      const predicted = predictCategory(description, categories);
      if (predicted) {
        setCategory(predicted);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 1.5) {
        alert("Receipt size must be less than 1.5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/,/g, "");
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tToRemove: string) => {
    setTags(tags.filter(t => t !== tToRemove));
  };

  const handleAddCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCategory(newCatName.trim(), newCatColor, newCatIcon);
      setCategory(newCatName.trim());
      setNewCatName("");
      setShowAddCat(false);
    }
  };

  const validate = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!description.trim()) tempErrors.description = "Description is required";
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) tempErrors.amount = "Must be a positive amount";
    if (!accountId) tempErrors.accountId = "Select a billing wallet";
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category: type === "income" ? "Salary" : category,
      date,
      accountId,
      tags,
      notes: notes.trim(),
      recurring,
      receiptImage,
      isFavorite,
      status
    };

    if (editTx) {
      updateTransaction({ ...payload, id: editTx.id });
    } else {
      addTransaction(payload);
    }
    onClose();
  };

  return (
    <Drawer 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editTx ? "✏️ Edit Transaction" : "💰 Add Transaction"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-2">
        {/* Toggle Type buttons */}
        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              type === "expense" 
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
            onClick={() => {
              setType("expense");
              setCategory(categories.find(c => c.name !== "Salary")?.name || "Other");
            }}
          >
            Expense
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              type === "income" 
                ? "bg-emerald-505 bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
            onClick={() => {
              setType("income");
              setCategory("Salary");
            }}
          >
            Income
          </button>
        </div>

        {/* Description Input */}
        <div className="form-group">
          <label htmlFor="modal-desc" className="input-label">Description</label>
          <input
            id="modal-desc"
            type="text"
            className="input-field"
            placeholder="e.g. Whole Foods Market"
            value={description}
            onChange={e => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            required
          />
          {errors.description && <span className="text-xs text-danger font-semibold">{errors.description}</span>}
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            Our AI auto-predicts category as you type!
          </span>
        </div>

        {/* Amount Input */}
        <div className="form-group">
          <label htmlFor="modal-amount" className="input-label">Amount</label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-slate-400 font-bold">₹</span>
            <input
              id="modal-amount"
              type="number"
              step="100"
              min="0"
              className="input-field !pl-8"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>
          {errors.amount && <span className="text-xs text-danger font-semibold">{errors.amount}</span>}

          {/* Quick Amount Step Chips */}
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
            {[100, 500, 1000, 5000].map((preset) => (
              <button
                key={preset}
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem", fontWeight: 700 }}
                onClick={() => {
                  const current = parseFloat(amount) || 0;
                  setAmount((current + preset).toString());
                }}
              >
                +₹{preset.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
        </div>

        {/* Live Warning Banner if Expense exceeds Income or Category Budget */}
        {(() => {
          const numAmount = parseFloat(amount) || 0;
          const currentMonthStr = date ? date.slice(0, 7) : new Date().toISOString().slice(0, 7);
          const currentMonthTx = (transactions || []).filter(t => t.date.slice(0, 7) === currentMonthStr && t.id !== editTx?.id);
          const totalMonthInc = currentMonthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0) + (type === "income" ? numAmount : 0);
          const totalMonthExp = currentMonthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0) + (type === "expense" ? numAmount : 0);
          const isExceedingInc = type === "expense" && numAmount > 0 && totalMonthInc > 0 && totalMonthExp > totalMonthInc;

          const targetBudget = (budgets || []).find(b => b.category === category && b.month === currentMonthStr);
          const catSpent = currentMonthTx.filter(t => t.type === "expense" && t.category === category).reduce((s, t) => s + t.amount, 0) + (type === "expense" ? numAmount : 0);
          const isExceedingCat = type === "expense" && numAmount > 0 && targetBudget && catSpent > targetBudget.limit;

          if (!isExceedingInc && !isExceedingCat) return null;

          return (
            <div className="flex flex-col gap-2">
              {isExceedingInc && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-500 font-bold flex items-center gap-2">
                  <span>🚨 Warning: Total monthly expenses ({currency} {totalMonthExp.toLocaleString()}) will exceed total monthly income ({currency} {totalMonthInc.toLocaleString()})!</span>
                </div>
              )}
              {isExceedingCat && targetBudget && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-500 font-bold flex items-center gap-2">
                  <span>⚠️ Warning: Expense will exceed category budget limit for {category} ({currency} {catSpent.toLocaleString()} / {currency} {targetBudget.limit.toLocaleString()})!</span>
                </div>
              )}
            </div>
          );
        })()}

        {/* Category selector */}
        {type === "expense" && (
          <div className="form-group">
            <div className="flex justify-between items-center">
              <label htmlFor="modal-category" className="input-label">Category</label>
              <button 
                type="button" 
                className="text-[11px] text-primary font-bold hover:underline"
                onClick={() => setShowAddCat(!showAddCat)}
              >
                {showAddCat ? "Cancel" : "+ Add Custom"}
              </button>
            </div>

            {showAddCat ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/60 rounded-xl flex flex-col gap-2 mt-1.5 animate-slide-up">
                <input
                  type="text"
                  placeholder="New Category Name"
                  className="input-field !py-1.5 !text-xs"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                />
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    className="w-10 h-7 rounded border border-slate-200 dark:border-slate-800 p-0 cursor-pointer"
                    value={newCatColor}
                    onChange={e => setNewCatColor(e.target.value)}
                  />
                  <select
                    className="input-field !py-1.5 !text-xs"
                    value={newCatIcon}
                    onChange={e => setNewCatIcon(e.target.value)}
                  >
                    <option value="Circle">Tag</option>
                    <option value="UtensilsCrossed">Food</option>
                    <option value="Car">Transport</option>
                    <option value="ShoppingBag">Shop</option>
                    <option value="Gamepad2">Entertainment</option>
                    <option value="Heart">Medical</option>
                    <option value="Wifi">Utility</option>
                    <option value="BookOpen">Book</option>
                    <option value="Briefcase">Work</option>
                    <option value="TrendingUp">Invest</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-primary !py-1.5 !text-[11px]"
                    onClick={handleAddCustomCategory}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <select
                id="modal-category"
                className="input-field"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {categories.filter(c => c.name !== "Salary").map(c => (
                  <option key={c.id} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Wallet account selection */}
        <div className="form-group">
          <label htmlFor="modal-account" className="input-label">Wallet Account</label>
          <select
            id="modal-account"
            className="input-field"
            value={accountId}
            onChange={e => setAccountId(e.target.value)}
          >
            {accounts.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.balance >= 0 ? "+" : ""}₹{a.balance})
              </option>
            ))}
          </select>
          {errors.accountId && <span className="text-xs text-danger font-semibold">{errors.accountId}</span>}
        </div>

        {/* Date Selector */}
        <div className="form-group">
          <label htmlFor="modal-date" className="input-label">Date</label>
          <input
            id="modal-date"
            type="date"
            className="input-field"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        {/* Status selection */}
        <div className="form-group">
          <label htmlFor="modal-status" className="input-label">Status</label>
          <select
            id="modal-status"
            className="input-field"
            value={status}
            onChange={e => setStatus(e.target.value as TransactionStatus)}
          >
            <option value="cleared">✅ Cleared</option>
            <option value="pending">⏳ Pending</option>
          </select>
        </div>

        {/* Recurring scheduler option */}
        <div className="form-group">
          <label htmlFor="modal-recurring" className="input-label">Recurring Interval</label>
          <select
            id="modal-recurring"
            className="input-field"
            value={recurring}
            onChange={e => setRecurring(e.target.value as RecurringInterval)}
          >
            <option value="none">No Recurrence</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {/* Tags input */}
        <div className="form-group">
          <label htmlFor="modal-tags" className="input-label">Tags (Enter to Add)</label>
          <input
            id="modal-tags"
            type="text"
            placeholder="Add tag..."
            className="input-field"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={addTag}
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map(t => (
                <span 
                  key={t}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary"
                >
                  {t}
                  <button 
                    type="button" 
                    className="hover:text-red-500 font-extrabold text-[13px]" 
                    onClick={() => removeTag(t)}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Notes textarea */}
        <div className="form-group">
          <label htmlFor="modal-notes" className="input-label">Notes (Optional)</label>
          <textarea
            id="modal-notes"
            placeholder="Describe details..."
            className="input-field h-20 resize-none"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Receipt Image selector */}
        <div className="form-group">
          <span className="input-label">🧾 Receipt Attachment</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn btn-secondary !py-2 !text-xs flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <FaPlus style={{ width: "0.875rem", height: "0.875rem" }} /> Upload Image
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {receiptImage && (
              <button
                type="button"
                className="btn btn-danger !py-2 !text-xs"
                onClick={() => setReceiptImage(null)}
              >
                Remove
              </button>
            )}
          </div>
          {receiptImage && (
            <div className="mt-2.5 rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-900 flex items-center gap-3">
              <FaReceipt size={24} style={{ color: "#4F46E5" }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">Receipt Attached</p>
                <p className="text-[10px] text-slate-400">Attached image preview ready</p>
              </div>
              <FaImage size={20} style={{ color: "#94a3b8" }} />
            </div>
          )}
        </div>

        {/* Favorites and Actions row */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-primary"
              checked={isFavorite}
              onChange={e => setIsFavorite(e.target.checked)}
            />
            ⭐️ Add to Favorites
          </label>

          <div className="flex gap-2">
            <button type="button" className="btn btn-secondary !py-2 !px-4" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary !py-2 !px-4 shadow-lg shadow-primary/25">
              {editTx ? "Save Changes" : "Create Transaction"}
            </button>
          </div>
        </div>

      </form>
    </Drawer>
  );
}
