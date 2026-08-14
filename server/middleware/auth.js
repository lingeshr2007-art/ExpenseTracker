// server/middleware/auth.js
import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "apexfinance_super_secret_jwt_key_2026";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. Token missing." });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    if (req.user && req.user.id && !req.user._id) {
      req.user._id = req.user.id;
    }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}

