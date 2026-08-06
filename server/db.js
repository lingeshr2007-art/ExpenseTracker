// server/db.js
import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "apexfinance.db");
const db = new sqlite3.Database(dbPath);

// Promisified DB helpers
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Initialize DB schema
export async function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // Users Table
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            provider TEXT DEFAULT 'email',
            member_since TEXT,
            account_type TEXT DEFAULT 'Premium',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Transactions Table
        db.run(`
          CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            type TEXT NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL,
            account_id TEXT DEFAULT 'acc-1',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        // Budgets Table
        db.run(`
          CREATE TABLE IF NOT EXISTS budgets (
            user_id TEXT PRIMARY KEY,
            amount REAL NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        // Savings Goals Table
        db.run(`
          CREATE TABLE IF NOT EXISTS savings_goals (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            target_amount REAL NOT NULL,
            current_amount REAL DEFAULT 0,
            target_date TEXT,
            category TEXT,
            color TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        // Savings History Table
        db.run(`
          CREATE TABLE IF NOT EXISTS savings_history (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            goal_id TEXT NOT NULL,
            amount REAL NOT NULL,
            type TEXT NOT NULL,
            date TEXT NOT NULL,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        // Debts Table
        db.run(`
          CREATE TABLE IF NOT EXISTS debts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            friend_name TEXT NOT NULL,
            amount REAL NOT NULL,
            type TEXT NOT NULL,
            due_date TEXT,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        // Reset Tokens Table
        db.run(`
          CREATE TABLE IF NOT EXISTS reset_tokens (
            email TEXT PRIMARY KEY,
            otp_code TEXT NOT NULL,
            reset_token TEXT NOT NULL,
            expires_at INTEGER NOT NULL
          )
        `);

        // Seed Default Admin User if not exists
        const defaultEmail = "suresh@myfinpal.com";
        db.get("SELECT id FROM users WHERE email = ?", [defaultEmail], async (err, row) => {
          if (!row) {
            const defaultPassHash = await bcrypt.hash("FinPal@2026", 10);
            db.run(
              `INSERT INTO users (id, name, email, password_hash, provider, member_since, account_type)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                "usr_default_1",
                "Suresh Kumar",
                defaultEmail,
                defaultPassHash,
                "email",
                "Jan 2026",
                "Premium",
              ]
            );
          }
        });

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
}

export default db;
