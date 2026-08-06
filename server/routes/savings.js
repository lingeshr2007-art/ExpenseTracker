// server/routes/savings.js
import express from "express";
import { query, getOne, run } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticateToken);

// GET /api/savings/goals — List savings goals
router.get("/goals", async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, title, target_amount as targetAmount, current_amount as currentAmount, target_date as targetDate, category, color, created_at as createdAt
       FROM savings_goals
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch savings goals." });
  }
});

// POST /api/savings/goals — Create goal
router.post("/goals", async (req, res) => {
  try {
    const { id, title, targetAmount, currentAmount, targetDate, category, color } = req.body;
    if (!title || !targetAmount) {
      return res.status(400).json({ error: "Title and target amount are required." });
    }

    const goalId = id || `goal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    await run(
      `INSERT INTO savings_goals (id, user_id, title, target_amount, current_amount, target_date, category, color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        goalId,
        req.user.id,
        title.trim(),
        parseFloat(targetAmount),
        parseFloat(currentAmount || 0),
        targetDate || null,
        category || "General",
        color || "#3EC3D5",
      ]
    );

    const goal = await getOne(
      `SELECT id, title, target_amount as targetAmount, current_amount as currentAmount, target_date as targetDate, category, color, created_at as createdAt
       FROM savings_goals WHERE id = ?`,
      [goalId]
    );

    return res.status(201).json(goal);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create savings goal." });
  }
});

// PUT /api/savings/goals/:id — Update goal
router.put("/goals/:id", async (req, res) => {
  try {
    const goalId = req.params.id;
    const { title, targetAmount, currentAmount, targetDate, category, color } = req.body;

    await run(
      `UPDATE savings_goals
       SET title = ?, target_amount = ?, current_amount = ?, target_date = ?, category = ?, color = ?
       WHERE id = ? AND user_id = ?`,
      [
        title.trim(),
        parseFloat(targetAmount),
        parseFloat(currentAmount),
        targetDate || null,
        category || "General",
        color || "#3EC3D5",
        goalId,
        req.user.id,
      ]
    );

    const updated = await getOne(
      `SELECT id, title, target_amount as targetAmount, current_amount as currentAmount, target_date as targetDate, category, color, created_at as createdAt
       FROM savings_goals WHERE id = ?`,
      [goalId]
    );

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update goal." });
  }
});

// DELETE /api/savings/goals/:id — Delete goal
router.delete("/goals/:id", async (req, res) => {
  try {
    const goalId = req.params.id;
    await run("DELETE FROM savings_goals WHERE id = ? AND user_id = ?", [goalId, req.user.id]);
    await run("DELETE FROM savings_history WHERE goal_id = ? AND user_id = ?", [goalId, req.user.id]);
    return res.json({ message: "Savings goal deleted." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete savings goal." });
  }
});

// GET /api/savings/history — List savings history
router.get("/history", async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, goal_id as goalId, amount, type, date, note, created_at as createdAt
       FROM savings_history
       WHERE user_id = ?
       ORDER BY date DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch savings history." });
  }
});

// POST /api/savings/history — Deposit / Withdraw history entry
router.post("/history", async (req, res) => {
  try {
    const { id, goalId, amount, type, date, note } = req.body;
    if (!goalId || !amount || !type) {
      return res.status(400).json({ error: "Goal ID, amount, and type are required." });
    }

    const historyId = id || `sh_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const numAmount = parseFloat(amount);

    await run(
      `INSERT INTO savings_history (id, user_id, goal_id, amount, type, date, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [historyId, req.user.id, goalId, numAmount, type, date || new Date().toISOString(), note || ""]
    );

    // Update goal current_amount
    const goal = await getOne("SELECT current_amount FROM savings_goals WHERE id = ? AND user_id = ?", [goalId, req.user.id]);
    if (goal) {
      const delta = type === "deposit" ? numAmount : -numAmount;
      const newAmount = Math.max(0, (goal.current_amount || 0) + delta);
      await run("UPDATE savings_goals SET current_amount = ? WHERE id = ?", [newAmount, goalId]);
    }

    return res.status(201).json({ id: historyId, goalId, amount: numAmount, type, date, note });
  } catch (err) {
    return res.status(500).json({ error: "Failed to record savings action." });
  }
});

export default router;
