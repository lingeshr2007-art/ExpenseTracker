// server/routes/authRoutes.js
import express from "express";
import {
  sendOtp,
  verifyOtp,
  resendOtp,
  getMe,
  logout,
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";
import { validateSendOtp, validateVerifyOtp } from "../middlewares/validator.js";
import { sendOtpRateLimiter, verifyOtpRateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Public Routes
router.post("/send-otp", sendOtpRateLimiter, validateSendOtp, sendOtp);
router.post("/verify-otp", verifyOtpRateLimiter, validateVerifyOtp, verifyOtp);
router.post("/resend-otp", sendOtpRateLimiter, validateSendOtp, resendOtp);

// Protected Routes
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;
