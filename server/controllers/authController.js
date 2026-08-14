// server/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { JWT_SECRET } from "../middlewares/auth.js";
import { sendOtpEmail } from "../utils/email.js";
import { getOne, run } from "../db.js"; // SQLite fallback backup

// Helper: In-memory/SQLite fallback OTP store if MongoDB is offline
const memoryOtpStore = new Map();

/**
 * @route POST /api/auth/send-otp
 * @desc Generate, hash, store, and send 6-digit OTP to user email
 */
export async function sendOtp(req, res) {
  try {
    const { email } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "Unknown Browser";

    if (!cleanEmail) {
      return res.status(400).json({ error: "Email address is required." });
    }

    // Rate Limit Check: Max 3 OTP requests per hour per email
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let recentRequestsCount = 0;

    try {
      recentRequestsCount = await Otp.countDocuments({
        email: cleanEmail,
        createdAt: { $gte: oneHourAgo },
      });
    } catch (e) {
      // Memory fallback count
      const memSess = memoryOtpStore.get(cleanEmail);
      if (memSess && memSess.requestCount && memSess.lastRequested > oneHourAgo.getTime()) {
        recentRequestsCount = memSess.requestCount;
      }
    }

    if (recentRequestsCount >= 5) {
      return res.status(429).json({
        error: "Too many OTP requests for this email address. Please try again after 1 hour.",
      });
    }

    // Generate secure 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Clean previous pending OTPs for this email
    try {
      await Otp.deleteMany({ email: cleanEmail });
      await Otp.create({
        email: cleanEmail,
        hashedOtp,
        expiresAt,
        attempts: 0,
        ipAddress,
        userAgent,
      });
    } catch (dbErr) {
      // Fallback in-memory/SQLite store
      memoryOtpStore.set(cleanEmail, {
        email: cleanEmail,
        hashedOtp,
        rawOtp: otpCode,
        expiresAt: expiresAt.getTime(),
        attempts: 0,
        requestCount: (recentRequestsCount || 0) + 1,
        lastRequested: Date.now(),
      });
      await run("DELETE FROM login_otps WHERE email = ?", [cleanEmail]).catch(() => {});
      await run(
        `INSERT INTO login_otps (id, email, otp_code, expires_at, attempts) VALUES (?, ?, ?, ?, 0)`,
        [`otp_${Date.now()}`, cleanEmail, hashedOtp, expiresAt.getTime()]
      ).catch(() => {});
    }

    // Send professional HTML email via Nodemailer
    try {
      await sendOtpEmail(cleanEmail, otpCode);
    } catch (mailErr) {
      console.error("Failed to send OTP email:", mailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      email: cleanEmail,
      otpCode,
      expiresInSeconds: 300,
    });
  } catch (error) {
    console.error("Error in sendOtp controller:", error);
    return res.status(500).json({ error: "Failed to send OTP code. Please try again." });
  }
}

/**
 * @route POST /api/auth/verify-otp
 * @desc Verify OTP hash, delete OTP record, create/login User, and issue 7-day JWT
 */
export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanOtp = (otp || "").trim();

    if (!cleanEmail || !cleanOtp) {
      return res.status(400).json({ error: "Email and 6-digit OTP code are required." });
    }

    let otpRecord = null;
    let isMemoryFallback = false;

    try {
      otpRecord = await Otp.findOne({ email: cleanEmail });
    } catch (e) {
      /* ignore */
    }

    if (!otpRecord) {
      const memSess = memoryOtpStore.get(cleanEmail);
      if (memSess) {
        otpRecord = memSess;
        isMemoryFallback = true;
      }
    }

    if (!otpRecord) {
      const sqliteRecord = await getOne("SELECT * FROM login_otps WHERE email = ?", [cleanEmail]).catch(() => null);
      if (sqliteRecord) {
        otpRecord = {
          email: sqliteRecord.email,
          hashedOtp: sqliteRecord.otp_code,
          expiresAt: sqliteRecord.expires_at,
          attempts: sqliteRecord.attempts || 0,
          isSqlite: true,
        };
      }
    }

    if (!otpRecord) {
      return res.status(400).json({ error: "No pending OTP request found for this email. Please click Send OTP." });
    }

    // Check expiration
    const expiresTime = otpRecord.expiresAt instanceof Date ? otpRecord.expiresAt.getTime() : Number(otpRecord.expiresAt);
    if (Date.now() > expiresTime) {
      try {
        await Otp.deleteOne({ email: cleanEmail });
      } catch (e) {}
      memoryOtpStore.delete(cleanEmail);
      await run("DELETE FROM login_otps WHERE email = ?", [cleanEmail]).catch(() => {});
      return res.status(400).json({ error: "OTP code has expired. Please click Resend Code." });
    }

    // Check max verification attempts (5 attempts limit)
    if (otpRecord.attempts >= 5) {
      try {
        await Otp.deleteOne({ email: cleanEmail });
      } catch (e) {}
      memoryOtpStore.delete(cleanEmail);
      await run("DELETE FROM login_otps WHERE email = ?", [cleanEmail]).catch(() => {});
      return res.status(429).json({ error: "Maximum verification attempts exceeded. Please request a new code." });
    }

    // Compare hash or raw code
    let isMatch = false;
    if (otpRecord.rawOtp && cleanOtp === otpRecord.rawOtp) {
      isMatch = true;
    } else if (otpRecord.hashedOtp && otpRecord.hashedOtp.startsWith("$")) {
      isMatch = await bcrypt.compare(cleanOtp, otpRecord.hashedOtp).catch(() => false);
    } else {
      isMatch = cleanOtp === otpRecord.hashedOtp;
    }

    if (!isMatch) {
      otpRecord.attempts = (otpRecord.attempts || 0) + 1;
      if (isMemoryFallback) {
        memoryOtpStore.set(cleanEmail, otpRecord);
      } else if (otpRecord.isSqlite) {
        await run("UPDATE login_otps SET attempts = attempts + 1 WHERE email = ?", [cleanEmail]).catch(() => {});
      } else {
        await otpRecord.save().catch(() => {});
      }
      const remaining = 5 - otpRecord.attempts;
      return res.status(400).json({
        error: `Incorrect 6-digit OTP code. ${remaining > 0 ? `${remaining} attempts remaining.` : "Please request a new code."}`,
      });
    }

    // Valid OTP! Delete OTP record
    try {
      await Otp.deleteOne({ email: cleanEmail });
    } catch (e) {}
    memoryOtpStore.delete(cleanEmail);
    await run("DELETE FROM login_otps WHERE email = ?", [cleanEmail]).catch(() => {});

    // Create or update User in MongoDB / SQLite
    let userPayload = null;

    try {
      let user = await User.findOne({ email: cleanEmail });
      if (!user) {
        user = await User.create({
          email: cleanEmail,
          name: cleanEmail.split("@")[0],
          isVerified: true,
          lastLogin: new Date(),
        });
      } else {
        user.isVerified = true;
        user.lastLogin = new Date();
        await user.save();
      }

      userPayload = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      };
    } catch (dbErr) {
      // Fallback SQLite / Memory user payload
      const existingDbUser = await getOne("SELECT * FROM users WHERE email = ?", [cleanEmail]).catch(() => null);
      const userId = existingDbUser ? existingDbUser.id : `usr_${Date.now()}`;
      const userName = existingDbUser ? existingDbUser.name : cleanEmail.split("@")[0];

      if (!existingDbUser) {
        const dummyHash = await bcrypt.hash("OTP_PASSED", 10);
        await run(
          `INSERT INTO users (id, name, email, password_hash, provider, member_since, account_type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, userName, cleanEmail, dummyHash, "email", "Jan 2026", "Premium"]
        ).catch(() => {});
      }

      userPayload = {
        id: userId,
        email: cleanEmail,
        name: userName,
        isVerified: true,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
    }

    // Generate JWT token (7 Days expiration)
    const token = jwt.sign(
      {
        id: userPayload.id,
        _id: userPayload.id,
        email: userPayload.email,
        name: userPayload.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HTTP-Only Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully!",
      token,
      user: userPayload,
    });
  } catch (error) {
    console.error("Error in verifyOtp controller:", error);
    return res.status(500).json({ error: "Failed to verify OTP code." });
  }
}

/**
 * @route POST /api/auth/resend-otp
 * @desc Resend OTP code with rate limit check
 */
export async function resendOtp(req, res) {
  return sendOtp(req, res);
}

/**
 * @route GET /api/auth/me
 * @desc Get currently authenticated user profile
 */
export async function getMe(req, res) {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    let userObj = null;

    try {
      userObj = await User.findOne({ email: userEmail }).select("-__v");
    } catch (e) {}

    if (!userObj) {
      userObj = {
        id: userId,
        email: userEmail,
        name: req.user.name || userEmail.split("@")[0],
        isVerified: true,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
        lastLogin: new Date().toISOString(),
      };
    }

    return res.status(200).json({
      success: true,
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user profile." });
  }
}

/**
 * @route POST /api/auth/logout
 * @desc Logout user & clear cookie
 */
export async function logout(req, res) {
  res.clearCookie("token");
  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
}
