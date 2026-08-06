// src/utils/id.js

/**
 * Generate a unique ID for a transaction.
 * Falls back to a simple random string if crypto.randomUUID is unavailable.
 */
export function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback – not cryptographically strong but sufficient for demo.
  return "id-" + Math.random().toString(36).substr(2, 9);
}
