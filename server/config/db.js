// server/config/db.js
import mongoose from "mongoose";

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  const isCloudPlatform = !!(process.env.RENDER || process.env.VERCEL || process.env.NODE_ENV === "production");

  // If no MONGODB_URI or pointing to localhost in cloud production, skip gracefully to SQLite
  if (!mongoUri || (isCloudPlatform && (mongoUri.includes("127.0.0.1") || mongoUri.includes("localhost")))) {
    console.log("ℹ️ [Database] Running with SQLite database engine.");
    return null;
  }

  const targetUri = mongoUri || "mongodb://127.0.0.1:27017/nidhitrack";

  try {
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`🍃 [MongoDB Connected] Host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.log(`ℹ️ [Database] MongoDB offline (${error.message}). Using SQLite database engine.`);
    return null;
  }
}

export default connectDB;
