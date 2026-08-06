// src/components/TransactionForm.jsx
import React, { useState, useEffect, useRef } from "react";

// Fixed expense categories – can be extended later.
const CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Health",
  "Shopping",
  "Other",
];

export default function TransactionForm({ addTransaction, updateTransaction, editTx, cancelEdit }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense"); // "income" or "expense"
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [errors, setErrors] = useState({});
  const descRef = useRef(null);

  // Populate fields when entering edit mode
  useEffect(() => {
    if (editTx) {
      setDescription(editTx.description);
      setAmount(editTx.amount.toString());
      setType(editTx.type);
      setCategory(editTx.category || CATEGORIES[0]);
      setDate(editTx.date);
    } else {
      // reset to defaults when exiting edit mode
      setDescription("");
      setAmount("");
      setType("expense");
      setCategory(CATEGORIES[0]);
      setDate(new Date().toISOString().slice(0, 10));
    }
    setErrors({});
  }, [editTx]);

  const validate = () => {
    const newErrors = {};
    if (!description.trim()) newErrors.description = "Description required";
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) newErrors.amount = "Enter a positive amount";
    if (type === "expense" && !category) newErrors.category = "Category required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category: type === "income" ? "Income" : category,
      date,
    };
    if (editTx) {
      updateTransaction({ ...payload, id: editTx.id });
    } else {
      addTransaction(payload);
    }
    // clear form for next entry
    setDescription("");
    setAmount("");
    setType("expense");
    setCategory(CATEGORIES[0]);
    setDate(new Date().toISOString().slice(0, 10));
    setErrors({});
    // focus back to description field for fast entry
    if (descRef.current) {
      descRef.current.focus();
    }
  };

  return (
    <section className="transaction-form card container" style={{ marginTop: "1rem" }}>
      <h2>{editTx ? "Edit Transaction" : "Add Transaction"}</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
        <div>
          <label htmlFor="desc" className="input-label">
            Description
          </label>
          <input
            id="desc"
            ref={descRef}
            className="input"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Grocery shopping"
          />
          {errors.description && <p className="error" style={{ color: "var(--color-danger)" }}>{errors.description}</p>}
        </div>
        <div>
          <label htmlFor="amount" className="input-label">
            Amount (USD)
          </label>
          <input
            id="amount"
            className="input"
            type="number"
            step="100"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          {errors.amount && <p className="error" style={{ color: "var(--color-danger)" }}>{errors.amount}</p>}
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <fieldset style={{ border: "none", padding: 0, margin: 0, display: "flex", gap: "1rem", alignItems: "center" }}>
            <legend style={{ fontWeight: "500" }}>Type</legend>
            <label>
              <input
                type="radio"
                name="type"
                value="income"
                checked={type === "income"}
                onChange={() => setType("income")}
              />
              Income
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="expense"
                checked={type === "expense"}
                onChange={() => setType("expense")}
              />
              Expense
            </label>
          </fieldset>
        </div>
        {type === "expense" && (
          <div>
            <label htmlFor="category" className="input-label">
              Category
            </label>
            <select
              id="category"
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <p className="error" style={{ color: "var(--color-danger)" }}>{errors.category}</p>}
          </div>
        )}
        <div>
          <label htmlFor="date" className="input-label">
            Date
          </label>
          <input
            id="date"
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button type="submit" className="button">
            {editTx ? "Save changes" : "Add transaction"}
          </button>
          {editTx && (
            <button type="button" className="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
