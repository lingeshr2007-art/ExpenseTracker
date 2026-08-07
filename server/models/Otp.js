// server/models/Otp.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    hashedOtp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto TTL index deletion
    },
    attempts: {
      type: Number,
      default: 0,
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    userAgent: {
      type: String,
      default: "Unknown",
    },
  },
  {
    timestamps: true,
  }
);

const Otp = mongoose.models.Otp || mongoose.model("Otp", otpSchema);
export default Otp;
