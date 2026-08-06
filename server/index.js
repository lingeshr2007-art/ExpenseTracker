// server/index.js
import express from "express";
import cors from "cors";
import { initDb } from "./db.js";

import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import budgetRoutes from "./routes/budget.js";
import savingsRoutes from "./routes/savings.js";
import debtRoutes from "./routes/debts.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ApexFinance REST API Backend",
    timestamp: new Date().toISOString(),
  });
});

// Routes Mounting
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/debts", debtRoutes);

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

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

// Initialize DB and start server
async function startServer() {
  try {
    await initDb();
    console.log("⚡ [ApexFinance SQLite DB] Tables & schema initialized successfully.");

    app.listen(PORT, () => {
      console.log(`🚀 [ApexFinance Backend Server] Listening live at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to initialize database and start server:", err);
    process.exit(1);
  }
}

startServer();
