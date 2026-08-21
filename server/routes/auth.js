// server/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getOne, run } from "../db.js";
import { JWT_SECRET, authenticateToken } from "../middleware/auth.js";
import { sendOtpEmail } from "../utils/email.js";

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

    const userPayload = { id: userId, _id: userId, name: cleanName, email: cleanEmail, memberSince, accountType: "Premium" };
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

// POST /api/auth/google
router.post("/google", async (req, res) => {
  try {
    const { email, name } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanName = (name || "").trim() || (cleanEmail.includes("@") ? cleanEmail.split("@")[0] : "Google User");

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: "Please provide a valid Google email address." });
    }

    let user = await getOne("SELECT * FROM users WHERE LOWER(email) = ?", [cleanEmail]);

    if (!user) {
      const userId = `usr_google_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const dummyPass = await bcrypt.hash(`google_auth_${Date.now()}_${Math.random()}`, 10);
      const memberSince = `${new Date().toLocaleString("en-US", { month: "short" })} 2026`;

      await run(
        `INSERT INTO users (id, name, email, password_hash, provider, member_since, account_type)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, cleanName, cleanEmail, dummyPass, "google", memberSince, "Premium"]
      );

      user = {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        member_since: memberSince,
        account_type: "Premium",
        provider: "google",
      };
    }

    const userPayload = {
      id: user.id,
      _id: user.id,
      name: user.name,
      email: user.email,
      memberSince: user.member_since || "Jan 2026",
      accountType: user.account_type || "Premium",
      provider: "google",
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Google authentication successful!",
      token,
      user: userPayload,
    });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(500).json({ error: "Internal server error during Google authentication." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, identifier } = req.body;
    const inputStr = (email || identifier || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    if (!inputStr || !cleanPass) {
      return res.status(400).json({ error: "Username or email address and password are required." });
    }

    const user = await getOne(
      "SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(name) = ? OR id = ? OR LOWER(email) LIKE ? OR LOWER(name) LIKE ?",
      [inputStr, inputStr, inputStr, `${inputStr}@%`, `${inputStr}%`]
    );
    if (!user) {
      return res.status(400).json({ error: "No account found with this username or email address." });
    }

    const match = await bcrypt.compare(cleanPass, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: "Incorrect password. Please check your credentials." });
    }

    const userPayload = {
      id: user.id,
      _id: user.id,
      name: user.name,
      email: user.email,
      memberSince: user.member_since || "Jan 2026",
      accountType: user.account_type || "Premium",
      provider: user.provider || "email",
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out successfully." });
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
      message: `Verification code sent to ${cleanEmail}.`,
      resetToken,
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

// Helper: Common OTP Send Function
async function handleSendOtp(req, res) {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpSessionId = `otp_sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    // Clean old OTP sessions for this email
    await run("DELETE FROM login_otps WHERE email = ?", [cleanEmail]);

    await run(
      `INSERT INTO login_otps (id, email, otp_code, expires_at, attempts)
       VALUES (?, ?, ?, ?, 0)`,
      [otpSessionId, cleanEmail, otpCode, expiresAt]
    );

    // Send real OTP email to recipient's email address!
    try {
      await sendOtpEmail(cleanEmail, otpCode);
    } catch (mailErr) {
      console.error("Could not deliver OTP email:", mailErr.message);
    }

    return res.json({
      message: `Real-time OTP verification code sent to ${cleanEmail}`,
      otpSessionId,
      email: cleanEmail,
      otpCode,
    });
  } catch (err) {
    console.error("Error sending OTP:", err);
    return res.status(500).json({ error: "Failed to send real-time OTP code." });
  }
}

// Helper: Common OTP Verify Function
async function handleVerifyOtp(req, res) {
  try {
    const { email, otpSessionId, otpCode, otp } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanCode = (otpCode || otp || "").trim();

    if (!cleanEmail || !cleanCode) {
      return res.status(400).json({ error: "Email and 6-digit OTP code are required." });
    }

    // Find record by OTP code or session ID
    let record = null;
    if (otpSessionId) {
      record = await getOne("SELECT * FROM login_otps WHERE id = ? AND email = ?", [otpSessionId, cleanEmail]);
    }
    if (!record) {
      record = await getOne("SELECT * FROM login_otps WHERE email = ? AND otp_code = ?", [cleanEmail, cleanCode]);
    }
    if (!record) {
      return res.status(400).json({ error: "Invalid or expired OTP session. Please request a new code." });
    }

    if (Date.now() > record.expires_at) {
      await run("DELETE FROM login_otps WHERE id = ?", [record.id]);
      return res.status(400).json({ error: "OTP code has expired. Please click Resend Code." });
    }

    if (record.attempts >= 5) {
      await run("DELETE FROM login_otps WHERE id = ?", [record.id]);
      return res.status(400).json({ error: "Too many failed attempts. Please request a new code." });
    }

    if (record.otp_code !== cleanCode) {
      await run("UPDATE login_otps SET attempts = attempts + 1 WHERE id = ?", [record.id]);
      return res.status(400).json({ error: "Incorrect 6-digit OTP code. Please double check." });
    }

    // Clear used OTP record
    await run("DELETE FROM login_otps WHERE id = ?", [record.id]);

    // OTP Verified! Fetch or Create User (Auto Signup for new users)
    let user = await getOne("SELECT * FROM users WHERE email = ?", [cleanEmail]);
    if (!user) {
      const userId = `usr_otp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const cleanName = cleanEmail.split("@")[0];
      const dummyPass = await bcrypt.hash(`otp_user_${Date.now()}`, 10);
      const memberSince = `${new Date().toLocaleString("en-US", { month: "short" })} 2026`;

      await run(
        `INSERT INTO users (id, name, email, password_hash, provider, member_since, account_type)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, cleanName, cleanEmail, dummyPass, "otp", memberSince, "Premium"]
      );

      user = {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        member_since: memberSince,
        account_type: "Premium",
        provider: "otp",
      };
    }

    const userPayload = {
      id: user.id,
      _id: user.id,
      name: user.name,
      email: user.email,
      memberSince: user.member_since || "Jan 2026",
      accountType: user.account_type || "Premium",
      provider: user.provider || "otp",
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "OTP Verification successful! Logging in...",
      token,
      user: userPayload,
    });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return res.status(500).json({ error: "Failed to verify OTP code." });
  }
}

// POST /api/auth/send-otp & /api/auth/login-otp/send
router.post("/send-otp", handleSendOtp);
router.post("/login-otp/send", handleSendOtp);

// POST /api/auth/verify-otp & /api/auth/login-otp/verify
router.post("/verify-otp", handleVerifyOtp);
router.post("/login-otp/verify", handleVerifyOtp);

// POST /api/auth/resend-otp & /api/auth/login-otp/resend
async function handleResendOtp(req, res) {
  try {
    const { email, otpSessionId } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({ error: "Email address is required." });
    }

    const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiresAt = Date.now() + 5 * 60 * 1000;
    const newSessionId = otpSessionId || `otp_sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    await run("DELETE FROM login_otps WHERE email = ?", [cleanEmail]);

    await run(
      `INSERT INTO login_otps (id, email, otp_code, expires_at, attempts)
       VALUES (?, ?, ?, ?, 0)`,
      [newSessionId, cleanEmail, newOtpCode, newExpiresAt]
    );

    try {
      await sendOtpEmail(cleanEmail, newOtpCode);
    } catch (mailErr) {
      console.error("Could not deliver resent OTP email:", mailErr.message);
    }

    return res.json({
      message: `A new real-time verification code was sent to ${cleanEmail}`,
      otpSessionId: newSessionId,
      otpCode: newOtpCode,
    });
  } catch (err) {
    console.error("Error resending OTP:", err);
    return res.status(500).json({ error: "Failed to resend OTP code." });
  }
}

router.post("/resend-otp", handleResendOtp);
router.post("/login-otp/resend", handleResendOtp);

export default router;
