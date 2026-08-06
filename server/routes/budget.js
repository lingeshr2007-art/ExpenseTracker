// server/routes/budget.js
import express from "express";
import { getOne, run } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticateToken);

// GET /api/budget
router.get("/", async (req, res) => {
  try {
    const row = await getOne("SELECT amount FROM budgets WHERE user_id = ?", [req.user.id]);
    return res.json({ budget: row ? row.amount : 0 });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch budget." });
  }
});

// PUT /api/budget
router.put("/", async (req, res) => {
  try {
    const { budget } = req.body;
    const amount = parseFloat(budget);

    if (isNaN(amount) || amount < 0) {
      return res.status(400).json({ error: "Invalid budget amount." });
    }

    await run(
      `INSERT INTO budgets (user_id, amount, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id) DO UPDATE SET amount = excluded.amount, updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, amount]
    );

    return res.json({ budget: amount, message: "Budget updated successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to set budget." });
  }
});

export default router;
