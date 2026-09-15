import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { db, logAuditEvent } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "premiers_ai_secure_production_secret_key_change_in_prod_2026";
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  country?: string;
  themePreference?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Generate cryptographically signed token
export function generateToken(user: { id: string; email: string; role: string; name: string }): string {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + TOKEN_EXPIRY_MS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

// Verify and decode signed token
export function verifyToken(token: string): { sub: string; email: string; name: string; role: "admin" | "user" } | null {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadB64, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(payloadB64)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

// Authentication Middleware: Require valid session token
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!token) {
    res.status(401).json({ error: "Authentication required. Please provide a valid Bearer token." });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: "Invalid or expired session token. Please log in again." });
    return;
  }

  // Look up user in database
  const userRow = db.prepare("SELECT id, email, name, role, country, theme_preference FROM users WHERE id = ?").get(decoded.sub) as any;
  if (!userRow) {
    res.status(401).json({ error: "User account not found or has been removed." });
    return;
  }

  req.user = {
    id: userRow.id,
    email: userRow.email,
    name: userRow.name,
    role: userRow.role,
    country: userRow.country,
    themePreference: userRow.theme_preference,
  };

  next();
}

// Optional Authentication Middleware: populates req.user if token valid, but allows guest access
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      const userRow = db.prepare("SELECT id, email, name, role, country, theme_preference FROM users WHERE id = ?").get(decoded.sub) as any;
      if (userRow) {
        req.user = {
          id: userRow.id,
          email: userRow.email,
          name: userRow.name,
          role: userRow.role,
          country: userRow.country,
          themePreference: userRow.theme_preference,
        };
      }
    }
  }

  next();
}

// Authorization Middleware: Require 'admin' role
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== "admin") {
    logAuditEvent(
      req.user?.id || null,
      "unauthorized_admin_access_attempt",
      "admin_panel",
      null,
      { path: req.path, method: req.method },
      req.ip || "unknown",
      req.headers["user-agent"] || "unknown"
    );
    res.status(403).json({ error: "Access denied. Administrative privileges required." });
    return;
  }
  next();
}

// In-Memory Sliding Window Rate Limiter
interface RateLimitBucket {
  count: number;
  resetTime: number;
}
const ipBuckets = new Map<string, RateLimitBucket>();

export function createRateLimiter(windowMs: number, maxRequests: number, message = "Too many requests. Please try again later.") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
    const key = `${req.path}_${ip}`;
    const now = Date.now();

    let bucket = ipBuckets.get(key);
    if (!bucket || now > bucket.resetTime) {
      bucket = { count: 1, resetTime: now + windowMs };
      ipBuckets.set(key, bucket);
      next();
      return;
    }

    bucket.count++;
    if (bucket.count > maxRequests) {
      res.setHeader("Retry-After", Math.ceil((bucket.resetTime - now) / 1000));
      res.status(429).json({ error: message });
      return;
    }

    next();
  };
}

// Periodic cleanup of rate limit map every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of ipBuckets.entries()) {
    if (now > bucket.resetTime) {
      ipBuckets.delete(key);
    }
  }
}, 10 * 60 * 1000);
