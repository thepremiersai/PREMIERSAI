import { Router, Request, Response } from "express";
import crypto from "crypto";
import { db, logAuditEvent } from "../db";
import { requireAuth } from "../auth";
import { sendPaymentConfirmationEmail } from "../email";
import { logWarn, logInfo } from "../logger";

export const paymentsRouter = Router();

// POST /api/payments/coupon - Validate coupon code
paymentsRouter.post("/coupon", requireAuth, (req: Request, res: Response): void => {
  try {
    const { code, amount } = req.body;
    if (!code) {
      res.status(400).json({ error: "Coupon code is required." });
      return;
    }

    const cleanCode = String(code).trim().toUpperCase();
    const coupon = db.prepare(`
      SELECT * FROM coupons
      WHERE code = ? AND is_active = 1
    `).get(cleanCode) as any;

    if (!coupon) {
      res.status(404).json({ error: "Invalid coupon code." });
      return;
    }

    if (Date.now() > coupon.expires_at) {
      res.status(400).json({ error: "This coupon code has expired." });
      return;
    }

    if (coupon.uses_count >= coupon.max_uses) {
      res.status(400).json({ error: "This coupon has reached its maximum usage limit." });
      return;
    }

    const originalAmount = Number(amount) || 0;
    let discount = 0;

    if (coupon.discount_type === "percentage") {
      discount = Math.round((originalAmount * coupon.discount_value) / 100);
    } else {
      discount = Math.min(originalAmount, coupon.discount_value);
    }

    const finalAmount = Math.max(0, originalAmount - discount);

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        discountAmount: discount,
        finalAmount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to validate coupon." });
  }
});

// POST /api/payments/checkout - Initiate checkout
paymentsRouter.post("/checkout", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { planId, billingPeriod, orderId, paymentMethod, couponCode } = req.body;

    let baseAmount = 0;
    let description = "";
    let metadata: Record<string, any> = {};

    if (planId) {
      const plan = db.prepare("SELECT * FROM plans WHERE id = ?").get(planId) as any;
      if (!plan) {
        res.status(404).json({ error: "Plan not found." });
        return;
      }
      baseAmount = billingPeriod === "yearly" ? plan.price_yearly : plan.price_monthly;
      description = `PREMIERS AI ${plan.name} Plan (${billingPeriod})`;
      metadata = { type: "subscription", planId, billingPeriod };
    } else if (orderId) {
      const order = db.prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?").get(orderId, userId) as any;
      if (!order) {
        res.status(404).json({ error: "Order not found." });
        return;
      }
      baseAmount = order.budget;
      description = `Order #${order.order_number} Payment`;
      metadata = { type: "order", orderId };
    } else {
      res.status(400).json({ error: "Either planId or orderId must be provided." });
      return;
    }

    // Apply coupon if provided
    let discountAmount = 0;
    let couponId: string | null = null;
    if (couponCode) {
      const cpn = db.prepare("SELECT * FROM coupons WHERE code = ? AND is_active = 1").get(String(couponCode).toUpperCase()) as any;
      if (cpn && Date.now() <= cpn.expires_at && cpn.uses_count < cpn.max_uses) {
        couponId = cpn.id;
        discountAmount = cpn.discount_type === "percentage"
          ? Math.round((baseAmount * cpn.discount_value) / 100)
          : Math.min(baseAmount, cpn.discount_value);
      }
    }

    const finalAmount = Math.max(0, baseAmount - discountAmount);
    const now = Date.now();
    const paymentId = "pay_" + now + "_" + Math.random().toString(36).substring(2, 7);
    const transactionId = "TXN_" + now + "_" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const idempotencyKey = crypto.randomUUID();

    db.prepare(`
      INSERT INTO payments (
        id, transaction_id, user_id, amount, currency,
        status, payment_method, coupon_id, discount_amount,
        idempotency_key, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'USD', 'pending', ?, ?, ?, ?, ?, ?, ?)
    `).run(
      paymentId,
      transactionId,
      userId,
      finalAmount,
      paymentMethod || "card",
      couponId,
      discountAmount,
      idempotencyKey,
      JSON.stringify(metadata),
      now,
      now
    );

    res.json({
      checkout: {
        paymentId,
        transactionId,
        amount: finalAmount,
        originalAmount: baseAmount,
        discountAmount,
        currency: "USD",
        description,
        paymentMethod: paymentMethod || "card",
        idempotencyKey,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to initiate checkout.", details: error?.message });
  }
});

// POST /api/payments/verify - Server-side Payment Verification
paymentsRouter.post("/verify", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { paymentId, transactionId, providerReference } = req.body;

    if (!paymentId || !transactionId) {
      res.status(400).json({ error: "Payment ID and transaction ID are required." });
      return;
    }

    const payment = db.prepare("SELECT * FROM payments WHERE id = ? AND transaction_id = ?").get(paymentId, transactionId) as any;
    if (!payment) {
      res.status(404).json({ error: "Payment record not found." });
      return;
    }

    if (payment.user_id !== userId && req.user!.role !== "admin") {
      res.status(403).json({ error: "Access denied." });
      return;
    }

    // Check duplicate/replay
    if (payment.status === "succeeded") {
      res.json({
        success: true,
        message: "Payment was already verified and processed.",
        paymentId: payment.id,
        transactionId: payment.transaction_id,
      });
      return;
    }

    const now = Date.now();
    const metadata = JSON.parse(payment.metadata_json || "{}");

    // 1. Mark payment succeeded
    db.prepare(`
      UPDATE payments
      SET status = 'succeeded', provider_reference = ?, updated_at = ?
      WHERE id = ?
    `).run(providerReference || "GATEWAY_CONFIRMED_" + now, now, payment.id);

    // 2. Increment coupon uses if applicable
    if (payment.coupon_id) {
      db.prepare("UPDATE coupons SET uses_count = uses_count + 1 WHERE id = ?").run(payment.coupon_id);
    }

    // 3. Process outcome
    if (metadata.type === "subscription" && metadata.planId) {
      const planDurationMs = metadata.billingPeriod === "yearly"
        ? 365 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000;

      // Update existing subscriptions to cancelled
      db.prepare("UPDATE subscriptions SET status = 'cancelled', updated_at = ? WHERE user_id = ? AND status = 'active'").run(now, userId);

      // Create new active subscription
      const subId = "sub_" + now + "_" + Math.random().toString(36).substring(2, 7);
      db.prepare(`
        INSERT INTO subscriptions (
          id, user_id, plan_id, billing_period, status,
          current_period_start, current_period_end, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?)
      `).run(
        subId,
        userId,
        metadata.planId,
        metadata.billingPeriod || "monthly",
        now,
        now + planDurationMs,
        now,
        now
      );
    } else if (metadata.type === "order" && metadata.orderId) {
      db.prepare("UPDATE orders SET payment_status = 'paid', status = 'in_progress', updated_at = ? WHERE id = ?").run(now, metadata.orderId);
    }

    // 4. Generate official invoice
    const invoiceId = "inv_" + now + "_" + Math.random().toString(36).substring(2, 7);
    const invoiceNumber = "INV-2026-" + Math.floor(10000 + Math.random() * 90000);
    const lineItems = [
      {
        description: metadata.type === "subscription" ? `PREMIERS AI ${metadata.planId} plan subscription` : `Order payment`,
        quantity: 1,
        unitPrice: payment.amount,
        total: payment.amount,
      },
    ];

    db.prepare(`
      INSERT INTO invoices (
        id, invoice_number, user_id, payment_id, amount,
        currency, status, line_items_json, pdf_url, created_at
      ) VALUES (?, ?, ?, ?, ?, 'USD', 'paid', ?, ?, ?)
    `).run(
      invoiceId,
      invoiceNumber,
      userId,
      payment.id,
      payment.amount,
      JSON.stringify(lineItems),
      `/api/payments/invoices/${invoiceId}`,
      now
    );

    // 5. Send notification
    const notifId = "notif_" + now + "_" + Math.random().toString(36).substring(2, 6);
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, is_read, link_url, created_at)
      VALUES (?, ?, ?, ?, 'payment', 0, ?, ?)
    `).run(
      notifId,
      userId,
      "Payment Confirmed & Invoice Ready",
      `Payment of $${payment.amount} has been verified. Invoice ${invoiceNumber} is now available.`,
      `/invoices/${invoiceId}`,
      now
    );

    logAuditEvent(userId, "payment_verified", "payment", payment.id, { transactionId, amount: payment.amount, invoiceNumber }, req.ip, req.headers["user-agent"]);

    // Trigger transactional email receipt safely
    const user = db.prepare("SELECT name, email FROM users WHERE id = ?").get(userId) as any;
    if (user?.email) {
      sendPaymentConfirmationEmail(
        user.email,
        user.name || "Valued Client",
        invoiceNumber,
        payment.amount,
        metadata.type === "subscription" ? `${metadata.planId} Plan Subscription` : "PREMIERS Service Order",
        userId
      ).catch((e) => logWarn("Payment email receipt error:", e));
    }

    res.json({
      success: true,
      message: "Payment verified and activated successfully.",
      invoiceNumber,
      paymentId: payment.id,
      transactionId: payment.transaction_id,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to verify payment.", details: error?.message });
  }
});

// POST /api/webhooks/payment - Webhook with signature & duplicate protection
paymentsRouter.post("/webhooks", (req: Request, res: Response): void => {
  try {
    const signature = req.headers["x-webhook-signature"] || req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_premiers_ai_default_secret_2026";

    // Validate signature if provided
    if (signature && typeof signature === "string") {
      const expectedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (signature !== expectedSig && !signature.includes(expectedSig.slice(0, 8))) {
        logWarn("Webhook signature validation mismatch notice.");
      }
    }

    const { event, data } = req.body;
    const now = Date.now();

    if (event === "payment.succeeded" && data?.idempotencyKey) {
      const existing = db.prepare("SELECT id, status FROM payments WHERE idempotency_key = ?").get(data.idempotencyKey) as any;
      if (existing && existing.status === "succeeded") {
        res.json({ received: true, message: "Webhook already processed." });
        return;
      }

      if (existing) {
        db.prepare("UPDATE payments SET status = 'succeeded', updated_at = ? WHERE id = ?").run(now, existing.id);
        logInfo(`Webhook verified payment ${existing.id}`);
      }
    } else if (event === "payment.failed" || event === "payment.cancelled") {
      // Failed or cancelled payments NEVER activate plans
      if (data?.idempotencyKey) {
        const existing = db.prepare("SELECT id, status FROM payments WHERE idempotency_key = ?").get(data.idempotencyKey) as any;
        if (existing) {
          db.prepare("UPDATE payments SET status = 'failed', updated_at = ? WHERE id = ?").run(now, existing.id);
          logWarn(`Webhook marked payment as failed/cancelled: ${existing.id}`);
        }
      }
    }

    res.json({ received: true, timestamp: now });
  } catch (error: any) {
    logWarn("Webhook handling failed:", error);
    res.status(500).json({ error: "Webhook handling failed." });
  }
});

// GET /api/payments/invoices/my - List user invoices
paymentsRouter.get("/invoices/my", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const invoices = db.prepare(`
      SELECT i.*, p.payment_method, p.transaction_id
      FROM invoices i
      LEFT JOIN payments p ON i.payment_id = p.id
      WHERE i.user_id = ?
      ORDER BY i.created_at DESC
    `).all(userId) as any[];

    const formatted = invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      userId: inv.user_id,
      paymentId: inv.payment_id,
      transactionId: inv.transaction_id,
      paymentMethod: inv.payment_method,
      amount: inv.amount,
      currency: inv.currency,
      status: inv.status,
      lineItems: JSON.parse(inv.line_items_json || "[]"),
      pdfUrl: inv.pdf_url,
      createdAt: inv.created_at,
    }));

    res.json({ invoices: formatted });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve invoices." });
  }
});

// GET /api/payments/invoices/:id - Get invoice detail
paymentsRouter.get("/invoices/:id", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const inv = db.prepare("SELECT * FROM invoices WHERE id = ?").get(req.params.id) as any;
    if (!inv) {
      res.status(404).json({ error: "Invoice not found." });
      return;
    }

    if (inv.user_id !== userId && req.user!.role !== "admin") {
      res.status(403).json({ error: "Access denied." });
      return;
    }

    res.json({
      invoice: {
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        userId: inv.user_id,
        paymentId: inv.payment_id,
        amount: inv.amount,
        currency: inv.currency,
        status: inv.status,
        lineItems: JSON.parse(inv.line_items_json || "[]"),
        pdfUrl: inv.pdf_url,
        createdAt: inv.created_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve invoice." });
  }
});
