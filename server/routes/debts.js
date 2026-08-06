// server/routes/debts.js
import express from "express";
import { query, getOne, run } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticateToken);

// GET /api/debts — List debts
router.get("/", async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, friend_name as friendName, amount, type, due_date as dueDate, status, notes, created_at as createdAt
       FROM debts
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch debts." });
  }
});

// POST /api/debts — Create debt
router.post("/", async (req, res) => {
  try {
    const { id, friendName, amount, type, dueDate, status, notes } = req.body;
    if (!friendName || !amount || !type) {
      return res.status(400).json({ error: "Friend name, amount, and type are required." });
    }

    const debtId = id || `debt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    await run(
      `INSERT INTO debts (id, user_id, friend_name, amount, type, due_date, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        debtId,
        req.user.id,
        friendName.trim(),
        parseFloat(amount),
        type,
        dueDate || null,
        status || "pending",
        notes || "",
      ]
    );

    const created = await getOne(
      `SELECT id, friend_name as friendName, amount, type, due_date as dueDate, status, notes, created_at as createdAt
       FROM debts WHERE id = ?`,
      [debtId]
    );

    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: "Failed to add debt record." });
  }
});

// PUT /api/debts/:id — Edit / Toggle status of debt
router.put("/:id", async (req, res) => {
  try {
    const debtId = req.params.id;
    const { friendName, amount, type, dueDate, status, notes } = req.body;

    const existing = await getOne("SELECT * FROM debts WHERE id = ? AND user_id = ?", [debtId, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: "Debt record not found." });
    }

    await run(
      `UPDATE debts
       SET friend_name = ?, amount = ?, type = ?, due_date = ?, status = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [
        friendName ? friendName.trim() : existing.friend_name,
        amount !== undefined ? parseFloat(amount) : existing.amount,
        type || existing.type,
        dueDate !== undefined ? dueDate : existing.due_date,
        status || existing.status,
        notes !== undefined ? notes : existing.notes,
        debtId,
        req.user.id,
      ]
    );

    const updated = await getOne(
      `SELECT id, friend_name as friendName, amount, type, due_date as dueDate, status, notes, created_at as createdAt
       FROM debts WHERE id = ?`,
      [debtId]
    );

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update debt record." });
  }
});

// DELETE /api/debts/:id — Remove debt record
router.delete("/:id", async (req, res) => {
  try {
    const debtId = req.params.id;
    await run("DELETE FROM debts WHERE id = ? AND user_id = ?", [debtId, req.user.id]);
    return res.json({ message: "Debt record deleted." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete debt record." });
  }
});

export default router;
