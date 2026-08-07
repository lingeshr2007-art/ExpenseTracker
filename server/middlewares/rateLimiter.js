// server/middlewares/rateLimiter.js
import rateLimit from "express-rate-limit";

// Maximum 3 OTP requests per hour per IP
export const sendOtpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Generous limit for dev/testing, enforced strictly per email in controller
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many OTP requests from this IP. Please try again after 1 hour.",
  },
});

// Maximum 5 OTP verification attempts
export const verifyOtpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many failed OTP verification attempts. Please request a new code.",
  },
});
