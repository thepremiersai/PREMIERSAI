import { Router, Request, Response } from "express";
import { db, logAuditEvent } from "../db";
import { requireAuth, requireAdmin } from "../auth";
import { sendOrderUpdateEmail } from "../email";
import { logWarn } from "../logger";

export const adminRouter = Router();

// Enforce both Authentication and Administrative Authorization
adminRouter.use(requireAuth, requireAdmin);

// GET /api/admin/stats - System Analytics & Metrics
adminRouter.get("/stats", (req: Request, res: Response): void => {
  try {
    const totalUsers = (db.prepare("SELECT COUNT(*) as c FROM users").get() as any)?.c || 0;
    const activeSubs = (db.prepare("SELECT COUNT(*) as c FROM subscriptions WHERE status = 'active'").get() as any)?.c || 0;
    const totalOrders = (db.prepare("SELECT COUNT(*) as c FROM orders").get() as any)?.c || 0;
    const completedOrders = (db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'completed'").get() as any)?.c || 0;
    const revenueRow = db.prepare("SELECT SUM(amount) as s FROM payments WHERE status = 'succeeded'").get() as any;
    const grossRevenue = revenueRow?.s || 0;

    const totalAiQueries = (db.prepare("SELECT COUNT(*) as c FROM chat_messages WHERE role = 'user'").get() as any)?.c || 0;
    const totalImagesGenerated = (db.prepare("SELECT COUNT(*) as c FROM chat_messages WHERE images_json IS NOT NULL AND images_json != '[]'").get() as any)?.c || 0;

    const recentOrders = db.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email, s.title as service_title
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN services s ON o.service_id = s.id
      ORDER BY o.created_at DESC LIMIT 6
    `).all() as any[];

    const recentUsers = db.prepare(`
      SELECT id, email, name, role, country, theme_preference, email_verified, created_at
      FROM users ORDER BY created_at DESC LIMIT 6
    `).all() as any[];

    const recentLogs = db.prepare(`
      SELECT a.*, u.name as user_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC LIMIT 10
    `).all() as any[];

    res.json({
      stats: {
        totalUsers,
        activeSubscriptions: activeSubs,
        totalOrders,
        completedOrders,
        grossRevenue,
        totalAiQueries,
        totalImagesGenerated,
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          orderNumber: o.order_number,
          userId: o.user_id,
          userName: o.user_name || "Unknown",
          userEmail: o.user_email || "",
          serviceId: o.service_id,
          serviceTitle: o.service_title || "Custom Service",
          title: o.title,
          requirements: o.requirements,
          deadline: o.deadline,
          budget: o.budget,
          status: o.status,
          paymentStatus: o.payment_status,
          files: JSON.parse(o.files_json || "[]"),
          notes: o.notes,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
        })),
        recentUsers: recentUsers.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          country: u.country,
          themePreference: u.theme_preference,
          emailVerified: Boolean(u.email_verified),
          createdAt: u.created_at,
        })),
        recentLogs: recentLogs.map((l) => ({
          id: l.id,
          userId: l.user_id,
          userName: l.user_name || "System",
          action: l.action,
          resourceType: l.resource_type,
          resourceId: l.resource_id,
          ipAddress: l.ip_address,
          userAgent: l.user_agent,
          details: JSON.parse(l.details_json || "{}"),
          createdAt: l.created_at,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load admin stats.", details: error?.message });
  }
});

// GET /api/admin/users - User Directory
adminRouter.get("/users", (req: Request, res: Response): void => {
  try {
    const { search } = req.query;
    let query = "SELECT id, email, name, role, country, theme_preference, email_verified, created_at FROM users";
    const params: any[] = [];

    if (search && typeof search === "string" && search.trim()) {
      query += " WHERE email LIKE ? OR name LIKE ?";
      const t = `%${search.trim()}%`;
      params.push(t, t);
    }

    query += " ORDER BY created_at DESC LIMIT 100";
    const users = db.prepare(query).all(...params) as any[];

    res.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        country: u.country,
        themePreference: u.theme_preference,
        emailVerified: Boolean(u.email_verified),
        createdAt: u.created_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load users." });
  }
});

// PUT /api/admin/users/:id/role - Update User Role
adminRouter.put("/users/:id/role", (req: Request, res: Response): void => {
  try {
    const { role } = req.body;
    if (!["admin", "user"].includes(role)) {
      res.status(400).json({ error: "Role must be either 'admin' or 'user'." });
      return;
    }

    db.prepare("UPDATE users SET role = ?, updated_at = ? WHERE id = ?").run(role, Date.now(), req.params.id);

    logAuditEvent(req.user!.id, "admin_updated_user_role", "user", req.params.id, { newRole: role }, req.ip, req.headers["user-agent"]);

    res.json({ message: "User role updated successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update user role." });
  }
});

// GET /api/admin/orders - All Orders
adminRouter.get("/orders", (_req: Request, res: Response): void => {
  try {
    const orders = db.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email, s.title as service_title
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN services s ON o.service_id = s.id
      ORDER BY o.created_at DESC
    `).all() as any[];

    res.json({
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        userId: o.user_id,
        userName: o.user_name || "Unknown",
        userEmail: o.user_email || "",
        serviceId: o.service_id,
        serviceTitle: o.service_title || "Custom Service",
        title: o.title,
        requirements: o.requirements,
        deadline: o.deadline,
        budget: o.budget,
        status: o.status,
        paymentStatus: o.payment_status,
        files: JSON.parse(o.files_json || "[]"),
        notes: o.notes,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

// PUT /api/admin/orders/:id/status - Update Order Status & Notes
adminRouter.put("/orders/:id/status", (req: Request, res: Response): void => {
  try {
    const { status, notes, paymentStatus } = req.body;
    const now = Date.now();

    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id) as any;
    if (!order) {
      res.status(404).json({ error: "Order not found." });
      return;
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (status && ["submitted", "in_progress", "review", "completed", "cancelled"].includes(status)) {
      updates.push("status = ?");
      params.push(status);
    }

    if (paymentStatus && ["unpaid", "paid", "refunded"].includes(paymentStatus)) {
      updates.push("payment_status = ?");
      params.push(paymentStatus);
    }

    if (notes !== undefined) {
      updates.push("notes = ?");
      params.push(String(notes));
    }

    updates.push("updated_at = ?");
    params.push(now);
    params.push(order.id);

    db.prepare(`UPDATE orders SET ${updates.join(", ")} WHERE id = ?`).run(...params);

    // Notify user of status change
    if (status && status !== order.status) {
      const notifId = "notif_" + now + "_" + Math.random().toString(36).substring(2, 6);
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, is_read, link_url, created_at)
        VALUES (?, ?, ?, ?, 'order', 0, ?, ?)
      `).run(
        notifId,
        order.user_id,
        `Order ${order.order_number} Update`,
        `Your order status has been updated to: ${status.toUpperCase().replace("_", " ")}.`,
        `/orders/${order.id}`,
        now
      );

      // Email update to user
      const clientUser = db.prepare("SELECT email, name FROM users WHERE id = ?").get(order.user_id) as any;
      if (clientUser?.email) {
        sendOrderUpdateEmail(clientUser.email, clientUser.name, order.order_number, status, order.user_id).catch((e) => logWarn("Order update email error:", e));
      }
    }

    logAuditEvent(req.user!.id, "admin_updated_order", "order", order.id, { status, notes }, req.ip, req.headers["user-agent"]);

    res.json({ message: "Order updated successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update order." });
  }
});

// GET /api/admin/coupons - List Coupons
adminRouter.get("/coupons", (_req: Request, res: Response): void => {
  try {
    const coupons = db.prepare("SELECT * FROM coupons ORDER BY created_at DESC").all() as any[];
    res.json({
      coupons: coupons.map((c) => ({
        id: c.id,
        code: c.code,
        discountType: c.discount_type,
        discountValue: c.discount_value,
        maxUses: c.max_uses,
        usesCount: c.uses_count,
        expiresAt: c.expires_at,
        isActive: Boolean(c.is_active),
        createdAt: c.created_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load coupons." });
  }
});

// POST /api/admin/coupons - Create Coupon
adminRouter.post("/coupons", (req: Request, res: Response): void => {
  try {
    const { code, discountType, discountValue, maxUses, durationDays } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      res.status(400).json({ error: "Code, discountType, and discountValue are required." });
      return;
    }

    const cleanCode = String(code).trim().toUpperCase();
    const now = Date.now();
    const expiresAt = now + (Number(durationDays) || 30) * 24 * 60 * 60 * 1000;
    const couponId = "cpn_" + now + "_" + Math.random().toString(36).substring(2, 6);

    db.prepare(`
      INSERT INTO coupons (id, code, discount_type, discount_value, max_uses, uses_count, expires_at, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, 1, ?)
    `).run(
      couponId,
      cleanCode,
      discountType,
      Number(discountValue),
      Number(maxUses) || 500,
      expiresAt,
      now
    );

    logAuditEvent(req.user!.id, "admin_created_coupon", "coupon", couponId, { code: cleanCode }, req.ip, req.headers["user-agent"]);

    res.status(201).json({ message: "Coupon created successfully.", couponId });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create coupon." });
  }
});

// GET /api/admin/audit-logs - Audit History
adminRouter.get("/audit-logs", (req: Request, res: Response): void => {
  try {
    const logs = db.prepare(`
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC LIMIT 50
    `).all() as any[];

    res.json({
      logs: logs.map((l) => ({
        id: l.id,
        userId: l.user_id,
        userName: l.user_name || "System/Guest",
        action: l.action,
        resourceType: l.resource_type,
        resourceId: l.resource_id,
        ipAddress: l.ip_address,
        userAgent: l.user_agent,
        details: JSON.parse(l.details_json || "{}"),
        createdAt: l.created_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch audit logs." });
  }
});
