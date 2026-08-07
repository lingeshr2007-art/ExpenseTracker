// server/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import { initDb } from "./db.js";

import authRouter from "./routes/authRoutes.js";
import legacyAuthRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import budgetRoutes from "./routes/budget.js";
import savingsRoutes from "./routes/savings.js";
import debtRoutes from "./routes/debts.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "NidhiTrack Passwordless Email OTP API",
    timestamp: new Date().toISOString(),
  });
});

// Routes Mounting
app.use("/api/auth", authRouter);
app.use("/api/auth", legacyAuthRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/debts", debtRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Frontend Static Bundle in Production
const distPath = path.join(__dirname, "../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Global 404 Handler for API
app.use(/^\/api\/.*/, (req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Backend Error:", err);
  res.status(500).json({ error: "Internal server error occurred." });
});

// Initialize DBs and start server
async function startServer() {
  try {
    await initDb();
    console.log("⚡ [NidhiTrack SQLite DB] Tables & schema initialized successfully.");

    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 [NidhiTrack Backend Server] Listening live at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to initialize database and start server:", err);
    process.exit(1);
  }
}

startServer();
