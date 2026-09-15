import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db, logAuditEvent } from "../db";
import { generateToken, requireAuth, createRateLimiter } from "../auth";
import { sendVerificationEmail, sendPasswordResetEmail } from "../email";
import { logWarn } from "../logger";

export const authRouter = Router();

// Rate limit login and signup attempts (max 20 per 15 mins)
const authLimiter = createRateLimiter(15 * 60 * 1000, 20, "Too many authentication attempts. Please wait a few minutes.");

// POST /api/auth/register
authRouter.post("/register", authLimiter, (req: Request, res: Response): void => {
  try {
    const { email, name, password, country, themePreference } = req.body;

    if (!email || !name || !password) {
      res.status(400).json({ error: "Email, name, and password are required." });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }

    if (String(password).length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters long." });
      return;
    }

    // Check duplicate
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(cleanEmail);
    if (existing) {
      res.status(409).json({ error: "An account with this email address already exists. Please log in instead." });
      return;
    }

    const now = Date.now();
    const userId = "usr_" + now + "_" + Math.random().toString(36).substring(2, 7);
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(String(password), salt);

    // Insert user
    db.prepare(`
      INSERT INTO users (
        id, email, name, password_hash, role, country,
        theme_preference, email_verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'user', ?, ?, 0, ?, ?)
    `).run(
      userId,
      cleanEmail,
      cleanName,
      passwordHash,
      country || "US",
      themePreference || "dark",
      now,
      now
    );

    // Assign free subscription
    const subId = "sub_" + now + "_" + Math.random().toString(36).substring(2, 7);
    db.prepare(`
      INSERT INTO subscriptions (
        id, user_id, plan_id, billing_period, status,
        current_period_start, current_period_end, created_at, updated_at
      ) VALUES (?, ?, 'free', 'monthly', 'active', ?, ?, ?, ?)
    `).run(
      subId,
      userId,
      now,
      now + 30 * 24 * 60 * 60 * 1000,
      now,
      now
    );

    // Send welcome notification
    const notifId = "notif_" + now + "_" + Math.random().toString(36).substring(2, 6);
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
      VALUES (?, ?, ?, ?, 'system', 0, ?)
    `).run(
      notifId,
      userId,
      "Welcome to PREMIERS AI!",
      `Hello ${cleanName}, welcome to PREMIERS AI. You have started on the Free Plan with multilingual reasoning, logo design, and code sandbox access.`,
      now
    );

    // Generate token
    const token = generateToken({ id: userId, email: cleanEmail, role: "user", name: cleanName });

    logAuditEvent(userId, "user_registered", "user", userId, { email: cleanEmail }, req.ip, req.headers["user-agent"]);

    // Dispatch verification email safely
    const verificationToken = crypto.randomBytes(24).toString("hex");
    sendVerificationEmail(cleanEmail, cleanName, verificationToken, userId).catch((e) => logWarn("Verification email dispatch notice:", e));

    res.status(201).json({
      message: "Registration successful.",
      token,
      user: {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        role: "user",
        country: country || "US",
        themePreference: themePreference || "dark",
        emailVerified: false,
        plan: "free",
        createdAt: now,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register account.", details: error?.message });
  }
});

// POST /api/auth/login
authRouter.post("/login", authLimiter, (req: Request, res: Response): void => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const userRow = db.prepare(`
      SELECT id, email, name, password_hash, role, country, theme_preference, email_verified, created_at
      FROM users WHERE email = ?
    `).get(cleanEmail) as any;

    if (!userRow) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const match = bcrypt.compareSync(String(password), userRow.password_hash);
    if (!match) {
      logAuditEvent(userRow.id, "failed_login_attempt", "auth", userRow.id, { email: cleanEmail }, req.ip, req.headers["user-agent"]);
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    // Retrieve active subscription
    const sub = db.prepare(`
      SELECT plan_id, billing_period, status, current_period_end
      FROM subscriptions
      WHERE user_id = ? AND status = 'active'
      ORDER BY created_at DESC LIMIT 1
    `).get(userRow.id) as any;

    const plan = sub?.plan_id || "free";
    const token = generateToken({ id: userRow.id, email: userRow.email, role: userRow.role, name: userRow.name });

    logAuditEvent(userRow.id, "user_logged_in", "auth", userRow.id, { email: cleanEmail }, req.ip, req.headers["user-agent"]);

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: userRow.id,
        email: userRow.email,
        name: userRow.name,
        role: userRow.role,
        country: userRow.country,
        themePreference: userRow.theme_preference,
        emailVerified: Boolean(userRow.email_verified),
        plan,
        createdAt: userRow.created_at,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to log in.", details: error?.message });
  }
});

// GET /api/auth/me
authRouter.get("/me", requireAuth, (req: Request, res: Response): void => {
  try {
    const user = req.user!;
    const userRow = db.prepare(`
      SELECT id, email, name, role, country, theme_preference, email_verified, created_at
      FROM users WHERE id = ?
    `).get(user.id) as any;

    if (!userRow) {
      res.status(404).json({ error: "User account not found." });
      return;
    }

    const sub = db.prepare(`
      SELECT plan_id, billing_period, status, current_period_end
      FROM subscriptions
      WHERE user_id = ? AND status = 'active'
      ORDER BY created_at DESC LIMIT 1
    `).get(user.id) as any;

    // Count unread notifications
    const notifCount = (db.prepare("SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0").get(user.id) as any)?.c || 0;

    res.json({
      user: {
        id: userRow.id,
        email: userRow.email,
        name: userRow.name,
        role: userRow.role,
        country: userRow.country,
        themePreference: userRow.theme_preference,
        emailVerified: Boolean(userRow.email_verified),
        plan: sub?.plan_id || "free",
        subscription: sub || null,
        unreadNotifications: notifCount,
        createdAt: userRow.created_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch user profile.", details: error?.message });
  }
});

// PUT /api/auth/profile
authRouter.put("/profile", requireAuth, (req: Request, res: Response): void => {
  try {
    const user = req.user!;
    const { name, country, themePreference } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (name && typeof name === "string") {
      updates.push("name = ?");
      params.push(name.trim());
    }
    if (country && typeof country === "string") {
      updates.push("country = ?");
      params.push(country.trim().toUpperCase());
    }
    if (themePreference && ["dark", "light", "system"].includes(themePreference)) {
      updates.push("theme_preference = ?");
      params.push(themePreference);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: "No valid fields provided to update." });
      return;
    }

    updates.push("updated_at = ?");
    params.push(Date.now());
    params.push(user.id);

    db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...params);

    logAuditEvent(user.id, "profile_updated", "user", user.id, { fields: updates }, req.ip, req.headers["user-agent"]);

    res.json({ message: "Profile updated successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update profile.", details: error?.message });
  }
});

// PUT /api/auth/password
authRouter.put("/password", requireAuth, (req: Request, res: Response): void => {
  try {
    const user = req.user!;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Current password and new password are required." });
      return;
    }

    if (String(newPassword).length < 8) {
      res.status(400).json({ error: "New password must be at least 8 characters long." });
      return;
    }

    const row = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(user.id) as any;
    if (!row || !bcrypt.compareSync(String(currentPassword), row.password_hash)) {
      res.status(400).json({ error: "Current password is incorrect." });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(String(newPassword), salt);

    db.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(newHash, Date.now(), user.id);

    logAuditEvent(user.id, "password_changed", "auth", user.id, {}, req.ip, req.headers["user-agent"]);

    res.json({ message: "Password changed successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update password.", details: error?.message });
  }
});

// POST /api/auth/forgot-password
authRouter.post("/forgot-password", (req: Request, res: Response): void => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required." });
      return;
    }

    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(String(email).trim().toLowerCase()) as any;
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiry = Date.now() + 60 * 60 * 1000; // 1 hour

      db.prepare("UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?").run(resetToken, expiry, user.id);

      logAuditEvent(user.id, "password_reset_requested", "auth", user.id, {}, req.ip, req.headers["user-agent"]);

      sendPasswordResetEmail(String(email).trim().toLowerCase(), user.name || "Valued User", resetToken, user.id).catch((e) => logWarn("Reset email notice:", e));

      res.json({
        message: "If an account exists for that email, a password reset link has been dispatched.",
        resetTokenPreview: process.env.NODE_ENV !== "production" ? resetToken : undefined,
      });
      return;
    }

    res.json({ message: "If an account exists for that email, a password reset link has been dispatched." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to process password reset request." });
  }
});

// POST /api/auth/reset-password
authRouter.post("/reset-password", (req: Request, res: Response): void => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ error: "Reset token and new password are required." });
      return;
    }

    if (String(newPassword).length < 8) {
      res.status(400).json({ error: "New password must be at least 8 characters long." });
      return;
    }

    const user = db.prepare("SELECT id, reset_token_expiry FROM users WHERE reset_token = ?").get(token) as any;
    if (!user || Date.now() > user.reset_token_expiry) {
      res.status(400).json({ error: "Reset token is invalid or has expired." });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(String(newPassword), salt);

    db.prepare(`
      UPDATE users
      SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = ?
      WHERE id = ?
    `).run(newHash, Date.now(), user.id);

    logAuditEvent(user.id, "password_reset_completed", "auth", user.id, {}, req.ip, req.headers["user-agent"]);

    res.json({ message: "Password has been successfully reset. You may now log in." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to reset password." });
  }
});
