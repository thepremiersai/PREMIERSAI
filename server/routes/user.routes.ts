import { Router, Request, Response } from "express";
import { db, logAuditEvent } from "../db";
import { requireAuth } from "../auth";

export const userRouter = Router();

// GET /api/user/notifications - Get user notifications
userRouter.get("/notifications", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 30
    `).all(userId) as any[];

    const unreadCount = (db.prepare("SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0").get(userId) as any)?.c || 0;

    res.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        userId: n.user_id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: Boolean(n.is_read),
        linkUrl: n.link_url,
        createdAt: n.created_at,
      })),
      unreadCount,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load notifications." });
  }
});

// PUT /api/user/notifications/:id/read - Mark notification as read
userRouter.put("/notifications/:id/read", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(req.params.id, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update notification." });
  }
});

// PUT /api/user/notifications/read-all - Mark all as read
userRouter.put("/notifications/read-all", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(userId);
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to mark all as read." });
  }
});

// GET /api/user/plans - List all available pricing plans
userRouter.get("/plans", (_req: Request, res: Response): void => {
  try {
    const plans = db.prepare("SELECT * FROM plans WHERE is_active = 1 ORDER BY price_monthly ASC").all() as any[];

    res.json({
      plans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        priceMonthly: p.price_monthly,
        priceYearly: p.price_yearly,
        popular: Boolean(p.popular),
        features: JSON.parse(p.features_json || "[]"),
        limits: {
          messages: p.messages_limit,
          images: p.images_limit,
          searches: p.searches_limit,
          projects: p.projects_limit,
        },
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load plans." });
  }
});

// GET /api/user/subscription - Current active subscription and limits
userRouter.get("/subscription", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const sub = db.prepare(`
      SELECT s.*, p.name as plan_name, p.messages_limit, p.images_limit, p.features_json
      FROM subscriptions s
      LEFT JOIN plans p ON s.plan_id = p.id
      WHERE s.user_id = ? AND s.status = 'active'
      ORDER BY s.created_at DESC LIMIT 1
    `).get(userId) as any;

    if (!sub) {
      res.json({
        subscription: {
          planId: "free",
          planName: "Free",
          status: "active",
          billingPeriod: "monthly",
          currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
        },
      });
      return;
    }

    res.json({
      subscription: {
        id: sub.id,
        planId: sub.plan_id,
        planName: sub.plan_name,
        billingPeriod: sub.billing_period,
        status: sub.status,
        currentPeriodStart: sub.current_period_start,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
        limits: {
          messages: sub.messages_limit,
          images: sub.images_limit,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load subscription." });
  }
});

// POST /api/user/subscription/cancel - Cancel active subscription
userRouter.post("/subscription/cancel", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const activeSub = db.prepare("SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active'").get(userId) as any;
    if (!activeSub) {
      res.status(404).json({ error: "No active paid subscription found." });
      return;
    }

    db.prepare("UPDATE subscriptions SET cancel_at_period_end = 1, updated_at = ? WHERE id = ?").run(Date.now(), activeSub.id);

    logAuditEvent(userId, "subscription_cancelled", "subscription", activeSub.id, {}, req.ip, req.headers["user-agent"]);

    res.json({ message: "Subscription will be cancelled at the end of the current billing cycle." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to cancel subscription." });
  }
});

// GET /api/user/files - List uploaded files
userRouter.get("/files", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const files = db.prepare("SELECT * FROM user_files WHERE user_id = ? ORDER BY created_at DESC").all(userId) as any[];

    res.json({
      files: files.map((f) => ({
        id: f.id,
        filename: f.filename,
        fileType: f.file_type,
        fileSize: f.file_size,
        publicUrl: f.public_url,
        category: f.category,
        createdAt: f.created_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load files." });
  }
});

// POST /api/user/files - Record uploaded file
userRouter.post("/files", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { filename, fileType, fileSize, dataUrl, category } = req.body;

    if (!filename || !fileType) {
      res.status(400).json({ error: "Filename and fileType are required." });
      return;
    }

    const now = Date.now();
    const fileId = "file_" + now + "_" + Math.random().toString(36).substring(2, 6);
    const publicUrl = dataUrl || `/uploads/${fileId}`;

    db.prepare(`
      INSERT INTO user_files (id, user_id, filename, file_type, file_size, storage_path, public_url, category, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      fileId,
      userId,
      String(filename).slice(0, 100),
      fileType,
      Number(fileSize) || 0,
      "memory_or_local",
      publicUrl,
      category || "document",
      now
    );

    res.status(201).json({
      file: {
        id: fileId,
        filename,
        fileType,
        fileSize,
        publicUrl,
        category,
        createdAt: now,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to record file." });
  }
});

// DELETE /api/user/files/:id - Remove file
userRouter.delete("/files/:id", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    db.prepare("DELETE FROM user_files WHERE id = ? AND user_id = ?").run(id, userId);
    res.json({ success: true, message: "File deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete file." });
  }
});

// GET /api/user/favorites - Get user favorites
userRouter.get("/favorites", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const favorites = db.prepare(`
      SELECT f.id, f.service_id, f.created_at, s.title, s.category, s.starting_price, s.icon
      FROM favorites f
      JOIN services s ON f.service_id = s.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).all(userId) as any[];

    res.json({
      favorites: favorites.map((f) => ({
        id: f.id,
        serviceId: f.service_id,
        title: f.title,
        category: f.category,
        startingPrice: f.starting_price,
        icon: f.icon,
        createdAt: f.created_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load favorites." });
  }
});

// POST /api/user/favorites/toggle - Toggle favorite
userRouter.post("/favorites/toggle", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { serviceId } = req.body;
    if (!serviceId) {
      res.status(400).json({ error: "serviceId is required." });
      return;
    }

    const existing = db.prepare("SELECT id FROM favorites WHERE user_id = ? AND service_id = ?").get(userId, serviceId) as any;
    if (existing) {
      db.prepare("DELETE FROM favorites WHERE id = ?").run(existing.id);
      res.json({ favorited: false, message: "Removed from favorites." });
    } else {
      const favId = "fav_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
      db.prepare("INSERT INTO favorites (id, user_id, service_id, created_at) VALUES (?, ?, ?, ?)").run(favId, userId, serviceId, Date.now());
      res.json({ favorited: true, message: "Added to favorites." });
    }
  } catch (error: any) {
    res.status(500).json({ error: "Failed to toggle favorite." });
  }
});

