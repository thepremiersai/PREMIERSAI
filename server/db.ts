import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, "premiers.db");

// Initialize SQLite database with WAL mode
export const db = new DatabaseSync(DB_PATH);

// Configure pragmas for high concurrency and referential integrity
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA synchronous = NORMAL;
`);

// Run database migrations and create tables
export function initDatabase() {
  db.exec(`
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      avatar TEXT,
      phone TEXT,
      country TEXT DEFAULT 'US',
      theme_preference TEXT DEFAULT 'dark' CHECK(theme_preference IN ('dark', 'light', 'system')),
      email_verified INTEGER DEFAULT 0,
      reset_token TEXT,
      reset_token_expiry INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

    -- Plans Table
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price_monthly REAL NOT NULL,
      price_yearly REAL NOT NULL,
      popular INTEGER DEFAULT 0,
      messages_limit INTEGER NOT NULL,
      images_limit INTEGER NOT NULL,
      searches_limit INTEGER NOT NULL,
      projects_limit INTEGER NOT NULL,
      features_json TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL
    );

    -- Subscriptions Table
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      billing_period TEXT NOT NULL CHECK(billing_period IN ('monthly', 'yearly')),
      status TEXT NOT NULL CHECK(status IN ('active', 'cancelled', 'past_due', 'expired')),
      current_period_start INTEGER NOT NULL,
      current_period_end INTEGER NOT NULL,
      cancel_at_period_end INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(plan_id) REFERENCES plans(id)
    );

    CREATE INDEX IF NOT EXISTS idx_subs_user_id ON subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_subs_status ON subscriptions(status);

    -- Payments Table
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      transaction_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT NOT NULL CHECK(status IN ('pending', 'succeeded', 'failed', 'refunded')),
      payment_method TEXT NOT NULL,
      provider_reference TEXT,
      coupon_id TEXT,
      discount_amount REAL DEFAULT 0,
      idempotency_key TEXT UNIQUE,
      metadata_json TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
    CREATE INDEX IF NOT EXISTS idx_payments_tx ON payments(transaction_id);
    CREATE INDEX IF NOT EXISTS idx_payments_idempotency ON payments(idempotency_key);

    -- Invoices Table
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      payment_id TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT NOT NULL CHECK(status IN ('paid', 'pending', 'void')),
      line_items_json TEXT NOT NULL,
      pdf_url TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(payment_id) REFERENCES payments(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);

    -- Services Marketplace Table
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      badge TEXT,
      starting_price REAL NOT NULL,
      features_json TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL
    );

    -- Service Packages Table
    CREATE TABLE IF NOT EXISTS service_packages (
      id TEXT PRIMARY KEY,
      service_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      delivery_days INTEGER NOT NULL,
      revisions INTEGER NOT NULL,
      features_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_packages_service ON service_packages(service_id);

    -- Orders / Service Requests Table
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      package_id TEXT,
      title TEXT NOT NULL,
      requirements TEXT NOT NULL,
      deadline TEXT,
      budget REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted', 'in_progress', 'review', 'completed', 'cancelled')),
      payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid', 'paid', 'refunded')),
      files_json TEXT DEFAULT '[]',
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(service_id) REFERENCES services(id)
    );

    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

    -- User Favorites Table
    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE(user_id, service_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_fav_user ON favorites(user_id);

    -- Chat Sessions Table
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      pinned INTEGER DEFAULT 0,
      language_code TEXT DEFAULT 'auto',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_sessions(user_id);

    -- Chat Messages Table
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      detected_language TEXT,
      language_code TEXT,
      is_rtl INTEGER DEFAULT 0,
      images_json TEXT,
      website_html TEXT,
      attachments_json TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages(session_id);

    -- Notifications Table
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'system' CHECK(type IN ('system', 'order', 'payment', 'security', 'promo')),
      is_read INTEGER DEFAULT 0,
      link_url TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read);

    -- User Uploaded Files Table
    CREATE TABLE IF NOT EXISTS user_files (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      storage_path TEXT NOT NULL,
      public_url TEXT NOT NULL,
      category TEXT DEFAULT 'document',
      created_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_files_user ON user_files(user_id);

    -- Coupons Table
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL CHECK(discount_type IN ('percentage', 'fixed')),
      discount_value REAL NOT NULL,
      max_uses INTEGER DEFAULT 1000,
      uses_count INTEGER DEFAULT 0,
      expires_at INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

    -- Audit Logs Table
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      ip_address TEXT,
      user_agent TEXT,
      details_json TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(created_at);

    -- System Settings Table
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- Folders Table for organizing chats
    CREATE TABLE IF NOT EXISTS chat_folders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#00d4a0',
      icon TEXT DEFAULT 'folder',
      created_at INTEGER NOT NULL
    );

    -- AI Projects Table
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      deadline TEXT,
      tags_json TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- Project Notes
    CREATE TABLE IF NOT EXISTS project_notes (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- Project Files
    CREATE TABLE IF NOT EXISTS project_files (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      file_id TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    -- Saved Knowledge Library
    CREATE TABLE IF NOT EXISTS saved_knowledge (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      tags_json TEXT,
      source_url TEXT,
      created_at INTEGER NOT NULL
    );

    -- Research Projects Table
    CREATE TABLE IF NOT EXISTS research_projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      summary TEXT,
      sources_json TEXT,
      notes_json TEXT,
      citations_json TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- Knowledge Boards Table
    CREATE TABLE IF NOT EXISTS knowledge_boards (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      columns_json TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- User Prompt & System Templates
    CREATE TABLE IF NOT EXISTS user_templates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      prompt_text TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      is_preset INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    -- Active User Sessions & Security Center
    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL,
      device TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      last_active INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    -- Document Q&A History
    CREATE TABLE IF NOT EXISTS document_qa (
      id TEXT PRIMARY KEY,
      file_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    -- Recycle Bin / Recently Deleted
    CREATE TABLE IF NOT EXISTS recycle_bin (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      item_type TEXT NOT NULL,
      item_id TEXT NOT NULL,
      item_data_json TEXT NOT NULL,
      deleted_at INTEGER NOT NULL
    );

    -- Real-time Usage Metrics Tracker
    CREATE TABLE IF NOT EXISTS usage_metrics (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      period_month TEXT NOT NULL,
      ai_queries INTEGER DEFAULT 0,
      images_generated INTEGER DEFAULT 0,
      storage_bytes INTEGER DEFAULT 0,
      updated_at INTEGER NOT NULL
    );

    -- 1-50: Advanced Personalization Profiles
    CREATE TABLE IF NOT EXISTS enterprise_profiles (
      user_id TEXT PRIMARY KEY,
      density TEXT DEFAULT 'medium',
      creativity REAL DEFAULT 0.7,
      personality TEXT DEFAULT 'analytical',
      work_mode TEXT DEFAULT 'general',
      shortcuts_json TEXT DEFAULT '[]',
      widgets_json TEXT DEFAULT '[]',
      streaks_count INTEGER DEFAULT 1,
      productivity_score INTEGER DEFAULT 88,
      badges_json TEXT DEFAULT '[]',
      quiet_mode INTEGER DEFAULT 0,
      workspace_theme TEXT DEFAULT 'neon-cyber',
      updated_at INTEGER NOT NULL
    );

    -- 51-100: AI Workflows & Pipelines
    CREATE TABLE IF NOT EXISTS enterprise_workflows (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      nodes_json TEXT NOT NULL DEFAULT '[]',
      edges_json TEXT NOT NULL DEFAULT '[]',
      variables_json TEXT DEFAULT '{}',
      is_scheduled INTEGER DEFAULT 0,
      schedule_cron TEXT,
      status TEXT DEFAULT 'active',
      version INTEGER DEFAULT 1,
      cost_tokens INTEGER DEFAULT 0,
      success_rate REAL DEFAULT 100.0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- 51-100: Workflow Execution History & Logs
    CREATE TABLE IF NOT EXISTS enterprise_workflow_runs (
      id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL,
      logs_json TEXT NOT NULL DEFAULT '[]',
      tokens_used INTEGER DEFAULT 0,
      duration_ms INTEGER DEFAULT 0,
      output_json TEXT,
      created_at INTEGER NOT NULL
    );

    -- 801-850: Autonomous AI Agents
    CREATE TABLE IF NOT EXISTS enterprise_agents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      system_prompt TEXT NOT NULL,
      tools_json TEXT DEFAULT '[]',
      memory_json TEXT DEFAULT '{}',
      budget_tokens INTEGER DEFAULT 100000,
      status TEXT DEFAULT 'idle',
      version INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- 801-850: Agent Execution Runs & Replays
    CREATE TABLE IF NOT EXISTS enterprise_agent_runs (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      goal TEXT NOT NULL,
      actions_log_json TEXT NOT NULL DEFAULT '[]',
      result TEXT,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    -- 251-300: Enterprise Productivity & Tasks
    CREATE TABLE IF NOT EXISTS enterprise_tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'inbox',
      deadline TEXT,
      estimated_hours REAL DEFAULT 1.0,
      dependencies_json TEXT DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- 451-500: Business Intelligence KPIs
    CREATE TABLE IF NOT EXISTS enterprise_kpis (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      current_value REAL NOT NULL,
      target_value REAL NOT NULL,
      unit TEXT DEFAULT '$',
      history_json TEXT DEFAULT '[]',
      updated_at INTEGER NOT NULL
    );

    -- 501-550: Marketing Campaigns & Content
    CREATE TABLE IF NOT EXISTS enterprise_campaigns (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      channel TEXT DEFAULT 'omnichannel',
      budget REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      target_audience TEXT,
      assets_json TEXT DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- 551-600: Customer & CRM Records
    CREATE TABLE IF NOT EXISTS enterprise_crm_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT DEFAULT 'customer',
      name TEXT NOT NULL,
      email TEXT,
      company TEXT,
      status TEXT DEFAULT 'active',
      sentiment_score REAL DEFAULT 85.0,
      health_score REAL DEFAULT 90.0,
      history_json TEXT DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- 601-650: Collaboration & Shared Workspaces
    CREATE TABLE IF NOT EXISTS enterprise_team_workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      members_json TEXT DEFAULT '[]',
      announcements_json TEXT DEFAULT '[]',
      activity_json TEXT DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- 651-700: Security & API Key Management
    CREATE TABLE IF NOT EXISTS enterprise_security_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      key_prefix TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      permissions_json TEXT DEFAULT '["read", "write"]',
      rate_limit_rpm INTEGER DEFAULT 60,
      expires_at INTEGER,
      last_used_at INTEGER,
      created_at INTEGER NOT NULL
    );

    -- 851-900: Data & Automation Pipelines
    CREATE TABLE IF NOT EXISTS enterprise_data_pipelines (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      source_type TEXT DEFAULT 'csv',
      transformation_rules_json TEXT DEFAULT '[]',
      last_run_at INTEGER,
      status TEXT DEFAULT 'idle',
      schema_json TEXT DEFAULT '{}',
      created_at INTEGER NOT NULL
    );

    -- 901-950: Communication & Content Drafts
    CREATE TABLE IF NOT EXISTS enterprise_content_drafts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT DEFAULT 'email',
      content TEXT NOT NULL,
      tone TEXT DEFAULT 'Professional',
      clarity_score INTEGER DEFAULT 95,
      tags_json TEXT DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- 951-1000: Custom Commands & Tool Extensions
    CREATE TABLE IF NOT EXISTS enterprise_custom_commands (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      command TEXT NOT NULL,
      description TEXT,
      prompt_template TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      is_public INTEGER DEFAULT 1,
      usage_count INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);

  // Run backward-compatible column migrations
  const migrations = [
    "ALTER TABLE chat_sessions ADD COLUMN folder_id TEXT;",
    "ALTER TABLE chat_sessions ADD COLUMN tags_json TEXT;",
    "ALTER TABLE chat_sessions ADD COLUMN mode TEXT DEFAULT 'general';",
    "ALTER TABLE chat_sessions ADD COLUMN is_temporary INTEGER DEFAULT 0;",
    "ALTER TABLE chat_sessions ADD COLUMN parent_session_id TEXT;",
    "ALTER TABLE chat_sessions ADD COLUMN parent_message_id TEXT;",
    "ALTER TABLE chat_sessions ADD COLUMN share_token TEXT;",
    "ALTER TABLE chat_sessions ADD COLUMN is_public INTEGER DEFAULT 0;",
    "ALTER TABLE chat_messages ADD COLUMN version INTEGER DEFAULT 1;",
    "ALTER TABLE chat_messages ADD COLUMN previous_versions_json TEXT;",
    "ALTER TABLE chat_messages ADD COLUMN is_saved INTEGER DEFAULT 0;",
    "ALTER TABLE chat_messages ADD COLUMN sources_json TEXT;",
    "ALTER TABLE chat_messages ADD COLUMN images_json TEXT;",
    "ALTER TABLE chat_messages ADD COLUMN website_html TEXT;",
    "ALTER TABLE users ADD COLUMN suspended INTEGER DEFAULT 0;",
    "ALTER TABLE users ADD COLUMN permissions_json TEXT;",
    "ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0;",
    "ALTER TABLE service_orders ADD COLUMN revision_requested INTEGER DEFAULT 0;",
    "ALTER TABLE service_orders ADD COLUMN revision_notes TEXT;",
    "ALTER TABLE service_orders ADD COLUMN milestones_json TEXT;"
  ];

  for (const mig of migrations) {
    try {
      db.exec(mig);
    } catch {
      // Column already exists or table updated
    }
  }

  // Seed default database entities
  seedDatabase();
}

function seedDatabase() {
  const now = Date.now();

  // 1. Seed Plans
  const plansStmt = db.prepare(`
    INSERT OR IGNORE INTO plans (
      id, name, price_monthly, price_yearly, popular,
      messages_limit, images_limit, searches_limit, projects_limit,
      features_json, is_active, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  const plans = [
    {
      id: "free",
      name: "Free",
      price_monthly: 0,
      price_yearly: 0,
      popular: 0,
      messages: 50,
      images: 5,
      searches: 3,
      projects: 1,
      features: [
        "Multilingual AI chat in 100+ languages",
        "5 vision image analyses per month",
        "3 real-time web searches",
        "Basic code syntax generation",
        "Standard community response speed",
        "Unicode & RTL text rendering",
      ],
    },
    {
      id: "starter",
      name: "Starter",
      price_monthly: 9,
      price_yearly: 86,
      popular: 0,
      messages: 200,
      images: 20,
      searches: 25,
      projects: 3,
      features: [
        "Everything in Free plan",
        "200 AI chat messages per month",
        "20 high-res logo and image creations",
        "3 active website projects",
        "Fast Gemini 3.8 inference lane",
      ],
    },
    {
      id: "professional",
      name: "Professional",
      price_monthly: 19,
      price_yearly: 182,
      popular: 1,
      messages: 1000,
      images: 100,
      searches: 999999,
      projects: 15,
      features: [
        "Everything in Starter plan",
        "100 high-res AI logo & thumbnail creations",
        "Unlimited real-time web searches & grounding",
        "Full interactive website sandboxing & preview",
        "15 saved projects and unlimited chat history",
        "YouTube thumbnail generator (1280x720)",
        "Priority Gemini Flash model processing",
        "Export code & high-res SVG/PNG assets",
      ],
    },
    {
      id: "business",
      name: "Business",
      price_monthly: 49,
      price_yearly: 470,
      popular: 0,
      messages: 5000,
      images: 500,
      searches: 999999,
      projects: 50,
      features: [
        "Everything in Professional plan",
        "500 high-res graphics and brand kits",
        "Team workspace collaboration & file sharing",
        "Advanced deep strategic research reports",
        "Custom brand typography & vector guidelines",
        "Priority queueing with 99.9% uptime SLA",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price_monthly: 149,
      price_yearly: 1430,
      popular: 0,
      messages: 999999,
      images: 999999,
      searches: 999999,
      projects: 999999,
      features: [
        "Unlimited AI chat, image generation, and vision OCR",
        "Dedicated isolated compute instance & priority support",
        "Custom fine-tuned multilingual domain models",
        "Enterprise SSO, audit log export, and compliance",
        "Dedicated account manager & 24/7 technical hotline",
      ],
    },
  ];

  for (const p of plans) {
    plansStmt.run(
      p.id,
      p.name,
      p.price_monthly,
      p.price_yearly,
      p.popular,
      p.messages,
      p.images,
      p.searches,
      p.projects,
      JSON.stringify(p.features),
      now
    );
  }

  // 2. Seed Default Admin User
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@premiers.ai").toLowerCase();
  const existingAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);
  if (!existingAdmin) {
    const defaultPass = process.env.ADMIN_INITIAL_PASSWORD || "Admin@Premiers2026!";
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(defaultPass, salt);
    const adminId = "usr_admin_premiers";

    db.prepare(`
      INSERT INTO users (
        id, email, name, password_hash, role, country,
        theme_preference, email_verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'admin', 'US', 'dark', 1, ?, ?)
    `).run(
      adminId,
      adminEmail,
      process.env.ADMIN_NAME || "Syed Muhammad Yasir Abbas Zaidi",
      hash,
      now,
      now
    );

    // Give admin an enterprise subscription
    db.prepare(`
      INSERT INTO subscriptions (
        id, user_id, plan_id, billing_period, status,
        current_period_start, current_period_end, created_at, updated_at
      ) VALUES (?, ?, 'enterprise', 'yearly', 'active', ?, ?, ?, ?)
    `).run(
      "sub_admin_enterprise",
      adminId,
      now,
      now + 365 * 24 * 60 * 60 * 1000,
      now,
      now
    );
  }

  // Ensure default guest accounts exist for unauthenticated / demo explorers
  const guestAccounts = [
    { id: "usr_guest", email: "guest@premiers.ai", name: "Guest Explorer" },
    { id: "guest_user", email: "guest_user@premiers.ai", name: "Guest User" },
  ];
  for (const ga of guestAccounts) {
    db.prepare(`
      INSERT OR IGNORE INTO users (
        id, email, name, password_hash, role, country,
        theme_preference, email_verified, created_at, updated_at
      ) VALUES (?, ?, ?, 'none', 'user', 'US', 'dark', 1, ?, ?)
    `).run(ga.id, ga.email, ga.name, now, now);
  }

  // 3. Seed Services and Service Packages
  const serviceCount = (db.prepare("SELECT COUNT(*) as count FROM services").get() as any)?.count || 0;
  if (serviceCount === 0) {
    const servicesData = [
      {
        id: "srv_branding",
        slug: "brand-identity-vector-logo",
        title: "Brand Identity & Vector Logo Suite",
        category: "AI Visuals",
        description: "Generate cohesive brand marks, geometric logos, typography pairings, and complete color palettes tailored to your global business.",
        icon: "🎨",
        badge: "Most Popular",
        starting_price: 29,
        features: [
          "Custom vector & geometric mark options",
          "Palette generation (Emerald, Cyber, Luxury, Sunset)",
          "High-resolution PNG/SVG download",
          "Social media avatar & favicon dimensions",
          "Multilingual typography guidance (Latin, Arabic, Urdu, CJK)",
        ],
        packages: [
          { name: "Starter", price: 29, deliveryDays: 1, revisions: 2, features: ["2 Logo Concepts", "PNG & SVG Formats", "1 Revision Round"] },
          { name: "Professional", price: 79, deliveryDays: 2, revisions: 5, features: ["5 Logo Concepts", "Brand Guidelines PDF", "Favicons & App Icons", "Social Media Kit"] },
          { name: "Enterprise", price: 199, deliveryDays: 3, revisions: 99, features: ["Complete Brand Suite", "Vector Source Files", "Stationery Mockups", "Copyright Transfer Agreement"] },
        ],
      },
      {
        id: "srv_thumbnails",
        slug: "youtube-thumbnails",
        title: "High-CTR YouTube Thumbnails",
        category: "AI Visuals",
        description: "Catchy 1280x720 video thumbnails crafted for maximum viewer retention, high click-through rates, and bold readable text.",
        icon: "🎬",
        badge: "Trending",
        starting_price: 19,
        features: [
          "16:9 standard YouTube HD resolution",
          "High-contrast color styling & depth drop-shadows",
          "Bold multi-language headline typography",
          "Subject framing and gradient ambient orbs",
          "Direct in-chat preview and download",
        ],
        packages: [
          { name: "Starter", price: 19, deliveryDays: 1, revisions: 2, features: ["1 High-CTR Thumbnail", "Full 1080p Export", "Headline Hook Styling"] },
          { name: "Professional", price: 49, deliveryDays: 1, revisions: 5, features: ["3 Thumbnail Variants for A/B Testing", "Source Assets", "CTR Optimization Audit"] },
          { name: "Enterprise", price: 129, deliveryDays: 2, revisions: 10, features: ["10 Custom Thumbnails Pack", "Dedicated Channel Art", "Thumbnail Strategy Consultation"] },
        ],
      },
      {
        id: "srv_multilingual",
        slug: "multilingual-localization",
        title: "Global Multilingual Content Localization",
        category: "Multilingual AI",
        description: "Translate, localize, and adapt full marketing campaigns, technical documentation, and product descriptions across 100+ world languages.",
        icon: "🌍",
        badge: "Global",
        starting_price: 39,
        features: [
          "Native tone translation in Urdu, Arabic, French, Spanish, Chinese",
          "Culturally sensitive idioms and nuance handling",
          "RTL / LTR format preservation",
          "Preserves technical terminology and brand names",
          "Bidirectional conversational validation",
        ],
        packages: [
          { name: "Starter", price: 39, deliveryDays: 1, revisions: 3, features: ["Up to 1,500 words", "2 Language Pairs", "Tone & Grammar Validation"] },
          { name: "Professional", price: 99, deliveryDays: 2, revisions: 5, features: ["Up to 5,000 words", "5 Language Pairs", "RTL Document Alignment", "SEO Keywords Localization"] },
          { name: "Enterprise", price: 249, deliveryDays: 3, revisions: 99, features: ["Up to 20,000 words", "Unlimited Language Pairs", "Multilingual API Content Integration"] },
        ],
      },
      {
        id: "srv_vision",
        slug: "vision-technical-inspection",
        title: "Multimodal Vision & Technical Inspection",
        category: "AI Visuals",
        description: "Upload screenshots of software UI, architecture blueprints, data charts, or error screens for instant diagnostic breakdown.",
        icon: "🔍",
        starting_price: 25,
        features: [
          "OCR text and code extraction from images",
          "UI/UX accessibility and hierarchy critique",
          "System flow diagram interpretation",
          "Document and spreadsheet data summaries",
        ],
        packages: [
          { name: "Starter", price: 25, deliveryDays: 1, revisions: 1, features: ["5 Screenshot / Diagram Audits", "Actionable Fix Checklist", "OCR Transcription"] },
          { name: "Professional", price: 69, deliveryDays: 2, revisions: 3, features: ["20 Diagram Audits", "Full UI/UX Teardown", "Accessibility & Contrast Report"] },
          { name: "Enterprise", price: 169, deliveryDays: 3, revisions: 10, features: ["Comprehensive Architecture Audit", "Automated Image Batch Diagnostics", "Executive Summary Presentation"] },
        ],
      },
      {
        id: "srv_fullstack",
        slug: "fullstack-website-prototyping",
        title: "Rapid Website Prototyping & Live Sandbox",
        category: "Development",
        description: "Turn natural language prompts into complete, responsive HTML/CSS/JavaScript websites with interactive iframe sandboxes.",
        icon: "💻",
        badge: "Pro",
        starting_price: 99,
        features: [
          "Clean modular code structures with file trees",
          "Interactive live preview directly inside chat",
          "Responsive layout for mobile, tablet, and desktop",
          "One-click full screen viewer",
        ],
        packages: [
          { name: "Starter", price: 99, deliveryDays: 2, revisions: 3, features: ["Single Page Responsive Website", "Tailwind CSS Styling", "Interactive Sandbox Preview"] },
          { name: "Professional", price: 199, deliveryDays: 3, revisions: 5, features: ["Multi-Page Interactive Website", "Contact Form Logic", "Mobile Optimized", "Complete Source Zip"] },
          { name: "Enterprise", price: 499, deliveryDays: 5, revisions: 10, features: ["Full-Stack App Prototype", "API Endpoints & State Store", "Production Ready Dockerfile & Deploy Guide"] },
        ],
      },
      {
        id: "srv_copywriting",
        slug: "copywriting-script-studio",
        title: "Viral Copywriting & Script Studio",
        category: "Content Creation",
        description: "Produce high-converting ad copy, viral social media posts, hook-heavy video scripts, and long-form thought leadership blogs.",
        icon: "✍️",
        starting_price: 29,
        features: [
          "Viral hooks and retention framework formulas",
          "SEO optimized article drafts with headings",
          "Multi-platform format variants (X, LinkedIn, Instagram)",
          "Tone matching from playful to corporate elegance",
        ],
        packages: [
          { name: "Starter", price: 29, deliveryDays: 1, revisions: 2, features: ["5 Ad Copy Variants", "10 Social Media Hooks", "Target Audience Angle"] },
          { name: "Professional", price: 69, deliveryDays: 2, revisions: 4, features: ["Full 10-Minute Video Script", "3 SEO Articles", "Multi-Platform Repurposing Kit"] },
          { name: "Enterprise", price: 179, deliveryDays: 3, revisions: 10, features: ["Complete 30-Day Content Matrix", "Sales Funnel Email Sequence", "Ghostwritten Thought Leadership Piece"] },
        ],
      },
    ];

    const insertService = db.prepare(`
      INSERT INTO services (
        id, slug, title, category, description,
        icon, badge, starting_price, features_json, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    const insertPkg = db.prepare(`
      INSERT INTO service_packages (
        id, service_id, name, price, delivery_days, revisions, features_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const s of servicesData) {
      insertService.run(
        s.id,
        s.slug,
        s.title,
        s.category,
        s.description,
        s.icon,
        s.badge || null,
        s.starting_price,
        JSON.stringify(s.features),
        now
      );

      for (const p of s.packages) {
        insertPkg.run(
          `pkg_${s.id}_${p.name.toLowerCase()}`,
          s.id,
          p.name,
          p.price,
          p.deliveryDays,
          p.revisions,
          JSON.stringify(p.features),
          now
        );
      }
    }
  }

  // 4. Seed Coupons
  const couponCount = (db.prepare("SELECT COUNT(*) as count FROM coupons").get() as any)?.count || 0;
  if (couponCount === 0) {
    const insertCoupon = db.prepare(`
      INSERT INTO coupons (
        id, code, discount_type, discount_value, max_uses, uses_count, expires_at, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, 0, ?, 1, ?)
    `);

    const oneYearLater = now + 365 * 24 * 60 * 60 * 1000;
    insertCoupon.run("cpn_save10", "SAVE10", "percentage", 10, 5000, oneYearLater, now);
    insertCoupon.run("cpn_save20", "SAVE20", "percentage", 20, 2500, oneYearLater, now);
    insertCoupon.run("cpn_premier50", "PREMIER50", "percentage", 50, 1000, oneYearLater, now);
    insertCoupon.run("cpn_freemonth", "FREEMONTH", "fixed", 19, 500, oneYearLater, now);
  }

  // 5. Seed System Settings
  const settingsCount = (db.prepare("SELECT COUNT(*) as count FROM system_settings").get() as any)?.count || 0;
  if (settingsCount === 0) {
    const insertSetting = db.prepare(`
      INSERT INTO system_settings (key, value, updated_at) VALUES (?, ?, ?)
    `);
    insertSetting.run("site_name", "PREMIERS AI", now);
    insertSetting.run("maintenance_mode", "false", now);
    insertSetting.run("ai_model_default", "gemini-3.8-flash", now);
    insertSetting.run("enable_registrations", "true", now);
    insertSetting.run("payment_gateway_mode", "production", now);
  }
}

// Audit Logger Helper
export function logAuditEvent(
  userId: string | null,
  action: string,
  resourceType: string,
  resourceId: string | null = null,
  details: Record<string, any> = {},
  ipAddress: string = "127.0.0.1",
  userAgent: string = "system"
) {
  try {
    const id = "audit_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
    db.prepare(`
      INSERT INTO audit_logs (
        id, user_id, action, resource_type, resource_id,
        ip_address, user_agent, details_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      action,
      resourceType,
      resourceId,
      ipAddress,
      userAgent,
      JSON.stringify(details),
      Date.now()
    );
  } catch (err) {
    console.warn("Failed to write audit log:", err);
  }
}

// Track usage metrics for user (e.g. AI queries, image credits, storage bytes)
export function recordUsageMetric(userId: string, type: "ai_query" | "image_generation" | "storage", amount: number = 1) {
  try {
    const d = new Date();
    const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const id = `usage_${userId}_${period}`;
    const now = Date.now();

    const existing = db.prepare("SELECT * FROM usage_metrics WHERE id = ?").get(id) as any;
    if (!existing) {
      db.prepare(`
        INSERT INTO usage_metrics (id, user_id, period_month, ai_queries, images_generated, storage_bytes, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        userId,
        period,
        type === "ai_query" ? amount : 0,
        type === "image_generation" ? amount : 0,
        type === "storage" ? amount : 0,
        now
      );
    } else {
      if (type === "ai_query") {
        db.prepare("UPDATE usage_metrics SET ai_queries = ai_queries + ?, updated_at = ? WHERE id = ?").run(amount, now, id);
      } else if (type === "image_generation") {
        db.prepare("UPDATE usage_metrics SET images_generated = images_generated + ?, updated_at = ? WHERE id = ?").run(amount, now, id);
      } else if (type === "storage") {
        db.prepare("UPDATE usage_metrics SET storage_bytes = storage_bytes + ?, updated_at = ? WHERE id = ?").run(amount, now, id);
      }
    }
  } catch (e) {
    console.warn("Failed to record usage metric:", e);
  }
}

// Recycle Bin Helpers
export function moveToRecycleBin(userId: string, itemType: string, itemId: string, data: any) {
  try {
    const id = "trash_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    db.prepare(`
      INSERT INTO recycle_bin (id, user_id, item_type, item_id, item_data_json, deleted_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, itemType, itemId, JSON.stringify(data), Date.now());
    return id;
  } catch (err) {
    console.warn("Failed to move to recycle bin:", err);
    return null;
  }
}

// Run DB Initialization on module import
initDatabase();
