// middleware/auth.js
import jwt from "jsonwebtoken";

const COOKIE_NAMES = ["auth", "token"]; 

function readCookie(req) {
  for (const name of COOKIE_NAMES) {
    if (req.cookies && req.cookies[name]) return req.cookies[name];
  }
  return undefined;
}

export function requireAuth(req, res, next) {
  const token = readCookie(req);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    console.error("[requireAuth] token verify error:", err?.message || err);
    return res.status(401).json({ error: "Session expired or invalid token" });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Requires role: ${role}` });
    }
    next();
  };
}

export function optionalAuth(req, res, next) {
  try {
    const token = readCookie(req);
    if (!token) return next(); // continue as guest

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    console.warn("[optionalAuth] invalid token, continuing as guest:", err?.message || err);
    return next();
  }
}
