// server/middlewares/auth.js
import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "nidhitrack_secret_jwt_key_2026";

export function protect(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired or invalid token. Please log in again." });
  }
}
