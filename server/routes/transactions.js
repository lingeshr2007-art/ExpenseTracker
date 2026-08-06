// server/routes/transactions.js
import express from "express";
import { query, getOne, run } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Protect all transaction routes with JWT authentication
router.use(authenticateToken);

// GET /api/transactions — List user transactions
router.get("/", async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, description, amount, type, category, date, account_id as accountId, notes, created_at as createdAt
       FROM transactions
       WHERE user_id = ?
       ORDER BY date DESC, created_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (err) {
    console.error("Fetch transactions error:", err);
    return res.status(500).json({ error: "Failed to fetch transactions." });
  }
});

// POST /api/transactions — Add transaction
router.post("/", async (req, res) => {
  try {
    const { id, description, amount, type, category, date, accountId, notes } = req.body;

    if (!description || !amount || !type || !category || !date) {
      return res.status(400).json({ error: "Description, amount, type, category, and date are required." });
    }

    const txId = id || `tx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const txAmount = parseFloat(amount);

    await run(
      `INSERT INTO transactions (id, user_id, description, amount, type, category, date, account_id, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [txId, req.user.id, description.trim(), txAmount, type, category, date, accountId || "acc-1", notes || ""]
    );

    const created = await getOne(
      `SELECT id, description, amount, type, category, date, account_id as accountId, notes, created_at as createdAt
       FROM transactions WHERE id = ?`,
      [txId]
    );

    return res.status(201).json(created);
  } catch (err) {
    console.error("Create transaction error:", err);
    return res.status(500).json({ error: "Failed to add transaction." });
  }
});

// PUT /api/transactions/:id — Edit transaction
router.put("/:id", async (req, res) => {
  try {
    const { description, amount, type, category, date, accountId, notes } = req.body;
    const txId = req.params.id;

    const existing = await getOne("SELECT id FROM transactions WHERE id = ? AND user_id = ?", [txId, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    await run(
      `UPDATE transactions
       SET description = ?, amount = ?, type = ?, category = ?, date = ?, account_id = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [description.trim(), parseFloat(amount), type, category, date, accountId || "acc-1", notes || "", txId, req.user.id]
    );

    const updated = await getOne(
      `SELECT id, description, amount, type, category, date, account_id as accountId, notes, created_at as createdAt
       FROM transactions WHERE id = ?`,
      [txId]
    );

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update transaction." });
  }
});

// DELETE /api/transactions/:id — Delete transaction
router.delete("/:id", async (req, res) => {
  try {
    const txId = req.params.id;
    const result = await run("DELETE FROM transactions WHERE id = ? AND user_id = ?", [txId, req.user.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    return res.json({ message: "Transaction deleted successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete transaction." });
  }
});

export default router;
