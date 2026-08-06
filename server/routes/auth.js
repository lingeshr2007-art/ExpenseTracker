// server/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getOne, run } from "../db.js";
import { JWT_SECRET, authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Email validator
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanName = (name || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ error: "Please enter your full name (at least 2 characters)." });
    }

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (!cleanPass || cleanPass.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const existing = await getOne("SELECT id FROM users WHERE email = ?", [cleanEmail]);
    if (existing) {
      return res.status(400).json({ error: "An account with this email address already exists." });
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const passwordHash = await bcrypt.hash(cleanPass, 10);
    const memberSince = `${new Date().toLocaleString("en-US", { month: "short" })} 2026`;

    await run(
      `INSERT INTO users (id, name, email, password_hash, provider, member_since, account_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, cleanName, cleanEmail, passwordHash, "email", memberSince, "Premium"]
    );

    const userPayload = { id: userId, name: cleanName, email: cleanEmail, memberSince, accountType: "Premium" };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      message: "Account created successfully!",
      token,
      user: userPayload,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error during registration." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    if (!cleanEmail || !cleanPass) {
      return res.status(400).json({ error: "Email address and password are required." });
    }

    const user = await getOne("SELECT * FROM users WHERE email = ?", [cleanEmail]);
    if (!user) {
      return res.status(400).json({ error: "No account found with this email address." });
    }

    const match = await bcrypt.compare(cleanPass, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: "Incorrect password. Please check your credentials." });
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      memberSince: user.member_since || "Jan 2026",
      accountType: user.account_type || "Premium",
      provider: user.provider || "email",
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      message: "Login successful!",
      token,
      user: userPayload,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error during login." });
  }
});

// GET /api/auth/me
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await getOne("SELECT id, name, email, member_since, account_type, provider FROM users WHERE id = ?", [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        memberSince: user.member_since,
        accountType: user.account_type,
        provider: user.provider,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch user profile." });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const user = await getOne("SELECT id FROM users WHERE email = ?", [cleanEmail]);
    if (!user) {
      return res.status(400).json({ error: "No account found with this email address." });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = `rst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const expiresAt = Date.now() + 15 * 60 * 1000;

    await run(
      `INSERT OR REPLACE INTO reset_tokens (email, otp_code, reset_token, expires_at)
       VALUES (?, ?, ?, ?)`,
      [cleanEmail, otpCode, resetToken, expiresAt]
    );

    return res.json({
      message: `Verification code sent to ${cleanEmail}. (Demo OTP: ${otpCode})`,
      resetToken,
      otpCode,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to request password reset." });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otpCode, newPassword } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanCode = (otpCode || "").trim();
    const cleanPass = (newPassword || "").trim();

    if (!cleanEmail || !cleanCode || !cleanPass) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (cleanPass.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }

    const record = await getOne("SELECT * FROM reset_tokens WHERE email = ?", [cleanEmail]);
    if (!record || record.otp_code !== cleanCode || Date.now() > record.expires_at) {
      return res.status(400).json({ error: "Invalid or expired 6-digit verification code." });
    }

    const newHash = await bcrypt.hash(cleanPass, 10);
    await run("UPDATE users SET password_hash = ? WHERE email = ?", [newHash, cleanEmail]);
    await run("DELETE FROM reset_tokens WHERE email = ?", [cleanEmail]);

    return res.json({ message: "Password reset successful! You can now log in." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to reset password." });
  }
});

export default router;
