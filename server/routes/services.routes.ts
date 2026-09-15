import { Router, Request, Response } from "express";
import { db, logAuditEvent } from "../db";
import { requireAuth, optionalAuth } from "../auth";

export const servicesRouter = Router();

// GET /api/services - list all services with their packages
servicesRouter.get("/", optionalAuth, (req: Request, res: Response): void => {
  try {
    const { category, search, sort } = req.query;
    let query = "SELECT * FROM services WHERE is_active = 1";
    const params: any[] = [];

    if (category && category !== "All") {
      query += " AND category = ?";
      params.push(String(category));
    }

    if (search && typeof search === "string" && search.trim()) {
      query += " AND (title LIKE ? OR description LIKE ? OR category LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (sort === "price_asc") {
      query += " ORDER BY starting_price ASC";
    } else if (sort === "price_desc") {
      query += " ORDER BY starting_price DESC";
    } else {
      query += " ORDER BY created_at ASC";
    }

    const services = db.prepare(query).all(...params) as any[];

    // Fetch user favorites if logged in
    const userFavorites = new Set<string>();
    if (req.user) {
      const favs = db.prepare("SELECT service_id FROM favorites WHERE user_id = ?").all(req.user.id) as any[];
      favs.forEach((f) => userFavorites.add(f.service_id));
    }

    // Attach packages and parse features
    const allPackages = db.prepare("SELECT * FROM service_packages ORDER BY price ASC").all() as any[];
    const packagesByService = new Map<string, any[]>();
    for (const pkg of allPackages) {
      if (!packagesByService.has(pkg.service_id)) {
        packagesByService.set(pkg.service_id, []);
      }
      packagesByService.get(pkg.service_id)!.push({
        id: pkg.id,
        serviceId: pkg.service_id,
        name: pkg.name,
        price: pkg.price,
        deliveryDays: pkg.delivery_days,
        revisions: pkg.revisions,
        features: JSON.parse(pkg.features_json || "[]"),
      });
    }

    const formatted = services.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      category: s.category,
      description: s.description,
      icon: s.icon,
      badge: s.badge || undefined,
      price: `$${s.starting_price}`,
      startingPrice: s.starting_price,
      features: JSON.parse(s.features_json || "[]"),
      packages: packagesByService.get(s.id) || [],
      isFavorite: userFavorites.has(s.id),
    }));

    res.json({ services: formatted });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve services.", details: error?.message });
  }
});

// GET /api/services/:id - service detail
servicesRouter.get("/:id", optionalAuth, (req: Request, res: Response): void => {
  try {
    const s = db.prepare("SELECT * FROM services WHERE id = ? OR slug = ?").get(req.params.id, req.params.id) as any;
    if (!s) {
      res.status(404).json({ error: "Service not found." });
      return;
    }

    const packages = db.prepare("SELECT * FROM service_packages WHERE service_id = ? ORDER BY price ASC").all(s.id) as any[];
    const formattedPackages = packages.map((pkg) => ({
      id: pkg.id,
      serviceId: pkg.service_id,
      name: pkg.name,
      price: pkg.price,
      deliveryDays: pkg.delivery_days,
      revisions: pkg.revisions,
      features: JSON.parse(pkg.features_json || "[]"),
    }));

    let isFavorite = false;
    if (req.user) {
      const fav = db.prepare("SELECT id FROM favorites WHERE user_id = ? AND service_id = ?").get(req.user.id, s.id);
      isFavorite = Boolean(fav);
    }

    res.json({
      service: {
        id: s.id,
        slug: s.slug,
        title: s.title,
        category: s.category,
        description: s.description,
        icon: s.icon,
        badge: s.badge || undefined,
        price: `$${s.starting_price}`,
        startingPrice: s.starting_price,
        features: JSON.parse(s.features_json || "[]"),
        packages: formattedPackages,
        isFavorite,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load service detail.", details: error?.message });
  }
});

// POST /api/services/favorites/:serviceId - toggle favorite
servicesRouter.post("/favorites/:serviceId", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { serviceId } = req.params;

    const existing = db.prepare("SELECT id FROM favorites WHERE user_id = ? AND service_id = ?").get(userId, serviceId) as any;
    if (existing) {
      db.prepare("DELETE FROM favorites WHERE id = ?").run(existing.id);
      res.json({ favorited: false, message: "Removed from favorites." });
      return;
    }

    const favId = "fav_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    db.prepare("INSERT INTO favorites (id, user_id, service_id, created_at) VALUES (?, ?, ?, ?)").run(
      favId,
      userId,
      serviceId,
      Date.now()
    );

    res.json({ favorited: true, message: "Added to favorites." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to toggle favorite.", details: error?.message });
  }
});

// GET /api/services/favorites/my - list user's favorite services
servicesRouter.get("/favorites/my", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const favs = db.prepare(`
      SELECT s.* FROM services s
      INNER JOIN favorites f ON f.service_id = s.id
      WHERE f.user_id = ?
    `).all(userId) as any[];

    const formatted = favs.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      category: s.category,
      description: s.description,
      icon: s.icon,
      badge: s.badge || undefined,
      price: `$${s.starting_price}`,
      features: JSON.parse(s.features_json || "[]"),
      isFavorite: true,
    }));

    res.json({ favorites: formatted });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch favorites." });
  }
});

// POST /api/orders - create service request / order
servicesRouter.post("/orders", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { serviceId, packageId, title, requirements, deadline, budget, files } = req.body;

    if (!serviceId || !title || !requirements) {
      res.status(400).json({ error: "Service ID, title, and requirements are required." });
      return;
    }

    const service = db.prepare("SELECT title, starting_price FROM services WHERE id = ?").get(serviceId) as any;
    if (!service) {
      res.status(404).json({ error: "Selected service does not exist." });
      return;
    }

    let resolvedBudget = Number(budget) || service.starting_price;
    if (packageId) {
      const pkg = db.prepare("SELECT price FROM service_packages WHERE id = ?").get(packageId) as any;
      if (pkg) resolvedBudget = pkg.price;
    }

    const now = Date.now();
    const orderId = "ord_" + now + "_" + Math.random().toString(36).substring(2, 7);
    const orderNumber = "PRM-" + Math.floor(100000 + Math.random() * 900000);

    db.prepare(`
      INSERT INTO orders (
        id, order_number, user_id, service_id, package_id,
        title, requirements, deadline, budget, status,
        payment_status, files_json, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', 'unpaid', ?, '', ?, ?)
    `).run(
      orderId,
      orderNumber,
      userId,
      serviceId,
      packageId || null,
      String(title).trim(),
      String(requirements).trim(),
      deadline ? String(deadline).trim() : null,
      resolvedBudget,
      JSON.stringify(files || []),
      now,
      now
    );

    // Notify user
    const notifId = "notif_" + now + "_" + Math.random().toString(36).substring(2, 6);
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, is_read, link_url, created_at)
      VALUES (?, ?, ?, ?, 'order', 0, ?, ?)
    `).run(
      notifId,
      userId,
      `Order ${orderNumber} Submitted`,
      `Your request for "${service.title}" has been received. Our team will review the requirements immediately.`,
      `/orders/${orderId}`,
      now
    );

    logAuditEvent(userId, "order_created", "order", orderId, { orderNumber, budget: resolvedBudget }, req.ip, req.headers["user-agent"]);

    res.status(201).json({
      message: "Order request created successfully.",
      order: {
        id: orderId,
        orderNumber,
        serviceId,
        title,
        budget: resolvedBudget,
        status: "submitted",
        paymentStatus: "unpaid",
        createdAt: now,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create order.", details: error?.message });
  }
});

// GET /api/orders/my - get user orders
servicesRouter.get("/orders/my", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const orders = db.prepare(`
      SELECT o.*, s.title as service_title, p.name as package_name
      FROM orders o
      LEFT JOIN services s ON o.service_id = s.id
      LEFT JOIN service_packages p ON o.package_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `).all(userId) as any[];

    const formatted = orders.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      userId: o.user_id,
      serviceId: o.service_id,
      serviceTitle: o.service_title,
      packageId: o.package_id,
      packageName: o.package_name,
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
    }));

    res.json({ orders: formatted });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve orders." });
  }
});

// PUT /api/orders/:id/cancel
servicesRouter.put("/orders/:id/cancel", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const order = db.prepare("SELECT id, user_id, status FROM orders WHERE id = ?").get(id) as any;
    if (!order) {
      res.status(404).json({ error: "Order not found." });
      return;
    }

    if (order.user_id !== userId && req.user!.role !== "admin") {
      res.status(403).json({ error: "Access denied." });
      return;
    }

    if (["completed", "cancelled"].includes(order.status)) {
      res.status(400).json({ error: `Cannot cancel an order that is already ${order.status}.` });
      return;
    }

    const now = Date.now();
    db.prepare("UPDATE orders SET status = 'cancelled', updated_at = ? WHERE id = ?").run(now, id);

    logAuditEvent(userId, "order_cancelled", "order", id, {}, req.ip, req.headers["user-agent"]);

    res.json({ message: "Order cancelled successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to cancel order." });
  }
});
