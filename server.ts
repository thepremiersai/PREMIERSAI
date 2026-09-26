import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment configuration
dotenv.config();

// Initialize database
import "./server/db";

// Import API Routers
import { authRouter } from "./server/routes/auth.routes";
import { chatRouter } from "./server/routes/chat.routes";
import { servicesRouter } from "./server/routes/services.routes";
import { paymentsRouter } from "./server/routes/payments.routes";
import { userRouter } from "./server/routes/user.routes";
import { adminRouter } from "./server/routes/admin.routes";
import { productivityRouter } from "./server/routes/productivity.routes";
import { documentRouter } from "./server/routes/document.routes";
import { mediaRouter } from "./server/routes/media.routes";
import { codingRouter } from "./server/routes/coding.routes";
import { researchRouter } from "./server/routes/research.routes";
import { workspaceRouter } from "./server/routes/workspace.routes";
import { enterpriseRouter } from "./server/routes/enterprise.routes";

const app = express();
const PORT = 3000;

// Security & CORS configuration
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Secure Headers & Content Protection Middleware
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// JSON and URL-encoded request body parsing with security payload limits
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// UTF-8 JSON response headers middleware for API routes (except event streams)
app.use("/api", (req, res, next) => {
  if (!req.path.includes("/stream") && !req.headers.accept?.includes("text/event-stream")) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
  }
  next();
});

// Health check API
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    platform: "PREMIERS AI",
    founder: "Syed Muhammad Yasir Abbas Zaidi",
    version: "3.0.0-production-enterprise",
    database: "SQLite WAL Mode Active",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
  });
});

// Supported languages list API
app.get("/api/languages", (_req, res) => {
  res.json({
    languages: [
      { code: "auto", name: "Auto Detect", nativeName: "Auto Detect", isRTL: false },
      { code: "en", name: "English", nativeName: "English", isRTL: false },
      { code: "ur", name: "Urdu", nativeName: "اردو", isRTL: true },
      { code: "ur-Latn", name: "Roman Urdu", nativeName: "Roman Urdu", isRTL: false },
      { code: "ar", name: "Arabic", nativeName: "العربية", isRTL: true },
      { code: "fa", name: "Persian", nativeName: "فارسی", isRTL: true },
      { code: "he", name: "Hebrew", nativeName: "עברית", isRTL: true },
      { code: "hi", name: "Hindi", nativeName: "हिन्दी", isRTL: false },
      { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ / پنجابی", isRTL: false },
      { code: "sd", name: "Sindhi", nativeName: "سنڌي", isRTL: true },
      { code: "ps", name: "Pashto", nativeName: "پښتو", isRTL: true },
      { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文", isRTL: false },
      { code: "ja", name: "Japanese", nativeName: "日本語", isRTL: false },
      { code: "ko", name: "Korean", nativeName: "한국어", isRTL: false },
      { code: "fr", name: "French", nativeName: "Français", isRTL: false },
      { code: "es", name: "Spanish", nativeName: "Español", isRTL: false },
      { code: "de", name: "German", nativeName: "Deutsch", isRTL: false },
      { code: "tr", name: "Turkish", nativeName: "Türkçe", isRTL: false },
      { code: "ru", name: "Russian", nativeName: "Русский", isRTL: false },
      { code: "it", name: "Italian", nativeName: "Italiano", isRTL: false },
      { code: "pt", name: "Portuguese", nativeName: "Português", isRTL: false },
      { code: "bn", name: "Bengali", nativeName: "বাংলা", isRTL: false },
      { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", isRTL: false },
    ],
  });
});

// Mount Production API Routes
app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);
app.use("/api/services", servicesRouter);
app.use("/api/orders", servicesRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/webhooks", paymentsRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/productivity", productivityRouter);
app.use("/api/documents", documentRouter);
app.use("/api/media", mediaRouter);
app.use("/api/coding", codingRouter);
app.use("/api/research", researchRouter);
app.use("/api/workspace", workspaceRouter);
app.use("/api/enterprise", enterpriseRouter);

// Start server with Vite middleware in development or static dist in production
async function startServer() {
  const publicPath = path.join(process.cwd(), "public");

  // Explicit high-priority endpoints for browser favicons & search crawlers
  app.get("/favicon.ico", (_req, res) => {
    res.type("image/x-icon");
    res.sendFile(path.join(publicPath, "favicon.ico"));
  });
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain");
    res.sendFile(path.join(publicPath, "robots.txt"));
  });
  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml");
    res.sendFile(path.join(publicPath, "sitemap.xml"));
  });
  app.get("/site.webmanifest", (_req, res) => {
    res.type("application/manifest+json");
    res.sendFile(path.join(publicPath, "site.webmanifest"));
  });

  app.use(express.static(publicPath));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PREMIERS AI production server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
