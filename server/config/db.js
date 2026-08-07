// server/config/db.js
import mongoose from "mongoose";

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nidhitrack";

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`🍃 [MongoDB Connected] Host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ [MongoDB Connection Warning] Could not connect to ${mongoUri}: ${error.message}`);
    console.log("ℹ️ Server running with memory database store fallback for Seamless local execution.");
  }
}

export default connectDB;
