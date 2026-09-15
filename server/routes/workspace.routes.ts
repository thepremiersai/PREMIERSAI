import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { optionalAuth, requireAuth } from "../auth";
import { db, recordUsageMetric } from "../db";

export const workspaceRouter = Router();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") return null;
  if (!aiClient) aiClient = new GoogleGenAI({ apiKey });
  return aiClient;
}

// ==========================================
// CATEGORY 4: PROJECTS (31-35)
// ==========================================
workspaceRouter.get("/projects", requireAuth, (req: Request, res: Response): void => {
  try {
    const projects = db.prepare(`
      SELECT p.*,
        (SELECT COUNT(id) FROM project_notes WHERE project_id = p.id) as notes_count,
        (SELECT COUNT(id) FROM project_files WHERE project_id = p.id) as files_count
      FROM projects p
      WHERE p.user_id = ?
      ORDER BY p.updated_at DESC
    `).all(req.user!.id) as any[];

    res.json({
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        color: p.color,
        icon: p.icon,
        notesCount: p.notes_count,
        filesCount: p.files_count,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load projects." });
  }
});

workspaceRouter.post("/projects", requireAuth, (req: Request, res: Response): void => {
  try {
    const { name, description, color, icon } = req.body;
    if (!name) {
      res.status(400).json({ error: "Project name is required." });
      return;
    }
    const id = "proj_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const now = Date.now();

    db.prepare(`
      INSERT INTO projects (id, user_id, name, description, color, icon, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user!.id, String(name).trim(), description || "", color || "#00d4a0", icon || "folder", now, now);

    res.status(201).json({
      project: { id, name, description, color: color || "#00d4a0", icon: icon || "folder", createdAt: now, updatedAt: now },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create project." });
  }
});

workspaceRouter.delete("/projects/:id", requireAuth, (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM project_notes WHERE project_id = ?").run(id);
    db.prepare("DELETE FROM project_files WHERE project_id = ?").run(id);
    db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").run(id, req.user!.id);
    res.json({ success: true, message: "Project deleted." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete project." });
  }
});

// PROJECT NOTES (32)
workspaceRouter.get("/projects/:id/notes", requireAuth, (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const notes = db.prepare("SELECT * FROM project_notes WHERE project_id = ? ORDER BY updated_at DESC").all(id);
    res.json({ notes });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load project notes." });
  }
});

workspaceRouter.post("/projects/:id/notes", requireAuth, (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const noteId = "note_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const now = Date.now();

    db.prepare(`
      INSERT INTO project_notes (id, project_id, title, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(noteId, id, title || "Untitled Note", content || "", now, now);

    db.prepare("UPDATE projects SET updated_at = ? WHERE id = ?").run(now, id);
    res.status(201).json({ note: { id: noteId, projectId: id, title, content, createdAt: now, updatedAt: now } });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create note." });
  }
});

// ==========================================
// CATEGORY 4: SAVED KNOWLEDGE & SNIPPETS (36-40)
// ==========================================
workspaceRouter.get("/knowledge", requireAuth, (req: Request, res: Response): void => {
  try {
    const category = req.query.category ? String(req.query.category) : null;
    let query = "SELECT * FROM saved_knowledge WHERE user_id = ?";
    const params: any[] = [req.user!.id];

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }
    query += " ORDER BY created_at DESC";

    const items = db.prepare(query).all(...params) as any[];
    res.json({
      items: items.map((i) => ({
        ...i,
        tags: JSON.parse(i.tags_json || "[]"),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load knowledge." });
  }
});

workspaceRouter.post("/knowledge", requireAuth, (req: Request, res: Response): void => {
  try {
    const { title, content, category, tags, sourceSessionId } = req.body;
    if (!content) {
      res.status(400).json({ error: "Content is required." });
      return;
    }
    const id = "know_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const now = Date.now();

    db.prepare(`
      INSERT INTO saved_knowledge (id, user_id, title, content, category, tags_json, source_session_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user!.id, title || "Knowledge Snippet", content, category || "general", JSON.stringify(tags || []), sourceSessionId || null, now);

    res.status(201).json({ item: { id, title, content, category, tags, createdAt: now } });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to save knowledge." });
  }
});

workspaceRouter.delete("/knowledge/:id", requireAuth, (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM saved_knowledge WHERE id = ? AND user_id = ?").run(id, req.user!.id);
    res.json({ success: true, message: "Snippet deleted." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete snippet." });
  }
});

// KNOWLEDGE BOARDS (38)
workspaceRouter.get("/boards", requireAuth, (req: Request, res: Response): void => {
  try {
    const boards = db.prepare("SELECT * FROM knowledge_boards WHERE user_id = ? ORDER BY updated_at DESC").all(req.user!.id) as any[];
    res.json({
      boards: boards.map((b) => ({
        ...b,
        cards: JSON.parse(b.cards_json || "[]"),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load boards." });
  }
});

workspaceRouter.post("/boards", requireAuth, (req: Request, res: Response): void => {
  try {
    const { title, cards } = req.body;
    const id = "brd_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const now = Date.now();

    db.prepare(`
      INSERT INTO knowledge_boards (id, user_id, title, cards_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, req.user!.id, title || "Untitled Board", JSON.stringify(cards || []), now, now);

    res.status(201).json({ board: { id, title: title || "Untitled Board", cards: cards || [], createdAt: now, updatedAt: now } });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create board." });
  }
});

workspaceRouter.put("/boards/:id", requireAuth, (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { title, cards } = req.body;
    const now = Date.now();

    db.prepare(`
      UPDATE knowledge_boards SET title = COALESCE(?, title), cards_json = COALESCE(?, cards_json), updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(title, cards ? JSON.stringify(cards) : null, now, id, req.user!.id);

    res.json({ success: true, message: "Board updated." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update board." });
  }
});

// ==========================================
// CATEGORY 8: CUSTOM TEMPLATES (71-80)
// ==========================================
workspaceRouter.get("/templates", optionalAuth, (req: Request, res: Response): void => {
  try {
    const systemTemplates = [
      { id: "tmpl_sys_1", title: "Executive Briefing", description: "Convert raw updates into C-suite ready 1-pager", promptText: "Format the following into an Executive Brief with Objective, Key Metrics, Risks, and Next Actions:\n\n", category: "business", isSystem: true },
      { id: "tmpl_sys_2", title: "Code Security Review", description: "Audit code for SQLi, XSS, and race conditions", promptText: "Analyze this code for security vulnerabilities, OWASP top 10 risks, and suggest hardened fixes:\n\n", category: "coding", isSystem: true },
      { id: "tmpl_sys_3", title: "Blog Post Generator", description: "Write an SEO-optimized engaging article", promptText: "Write an engaging, SEO-optimized 800-word article with a catchy headline, subheadings, and actionable conclusion about:\n\n", category: "writing", isSystem: true },
      { id: "tmpl_sys_4", title: "Cold Outreach Email", description: "High-conversion B2B sales email", promptText: "Write a high-converting cold outreach email to a decision-maker highlighting clear ROI and a low-friction CTA for:\n\n", category: "marketing", isSystem: true },
      { id: "tmpl_sys_5", title: "Socratic Tutor", description: "Interactive pedagogical mentor", promptText: "Guide me through understanding this topic using the Socratic method with questions and analogies:\n\n", category: "study", isSystem: true }
    ];

    let userTemplates: any[] = [];
    if (req.user) {
      userTemplates = db.prepare("SELECT * FROM user_templates WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
    }

    res.json({
      templates: [
        ...systemTemplates,
        ...userTemplates.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          promptText: t.prompt_text,
          category: t.category,
          isSystem: false,
          variables: JSON.parse(t.variables_json || "[]"),
          createdAt: t.created_at,
        })),
      ],
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load templates." });
  }
});

workspaceRouter.post("/templates", requireAuth, (req: Request, res: Response): void => {
  try {
    const { title, description, promptText, category, variables } = req.body;
    if (!title || !promptText) {
      res.status(400).json({ error: "Title and prompt text are required." });
      return;
    }
    const id = "tmpl_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const now = Date.now();

    db.prepare(`
      INSERT INTO user_templates (id, user_id, title, description, prompt_text, category, variables_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user!.id, title, description || "", promptText, category || "general", JSON.stringify(variables || []), now, now);

    res.status(201).json({ template: { id, title, description, promptText, category, variables, createdAt: now } });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create template." });
  }
});

workspaceRouter.delete("/templates/:id", requireAuth, (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM user_templates WHERE id = ? AND user_id = ?").run(id, req.user!.id);
    res.json({ success: true, message: "Template deleted." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete template." });
  }
});

// ==========================================
// CATEGORY 9: TOKEN & COST ESTIMATOR (81-90)
// ==========================================
workspaceRouter.post("/token-estimate", (req: Request, res: Response): void => {
  try {
    const { text, model } = req.body;
    if (!text) {
      res.json({ tokens: 0, estimatedCostUsd: 0, characters: 0, words: 0 });
      return;
    }

    const characters = text.length;
    const words = text.trim().split(/\s+/).length;
    // Rule of thumb: ~4 characters per token in English, ~2 per token in Arabic/Urdu
    const tokens = Math.round(characters / 3.6);

    // Standard Gemini 2.5 Flash pricing: ~$0.075 per 1M input tokens
    const pricePerMillion = 0.075;
    const cost = (tokens / 1_000_000) * pricePerMillion;

    res.json({
      characters,
      words,
      tokens,
      model: model || "gemini-3.8-flash",
      estimatedCostUsd: Number(cost.toFixed(6)),
      readingTimeMinutes: Number((words / 200).toFixed(1)),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to estimate tokens." });
  }
});

// ==========================================
// CATEGORY 10: RECYCLE BIN & DATA MANAGEMENT (91-100)
// ==========================================
workspaceRouter.get("/recycle-bin", requireAuth, (req: Request, res: Response): void => {
  try {
    const items = db.prepare("SELECT * FROM recycle_bin WHERE user_id = ? ORDER BY deleted_at DESC").all(req.user!.id) as any[];
    res.json({
      items: items.map((i) => ({
        id: i.id,
        itemType: i.item_type,
        originalId: i.original_id,
        data: JSON.parse(i.data_json || "{}"),
        deletedAt: i.deleted_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load recycle bin." });
  }
});

// RESTORE FROM RECYCLE BIN
workspaceRouter.post("/recycle-bin/:id/restore", requireAuth, (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const item = db.prepare("SELECT * FROM recycle_bin WHERE id = ? AND user_id = ?").get(id, req.user!.id) as any;
    if (!item) {
      res.status(404).json({ error: "Recycled item not found." });
      return;
    }

    const data = JSON.parse(item.data_json || "{}");
    if (item.item_type === "chat_session" && data.session) {
      const s = data.session;
      db.prepare(`
        INSERT OR REPLACE INTO chat_sessions (id, user_id, title, pinned, language_code, folder_id, tags_json, mode, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(s.id, req.user!.id, s.title, s.pinned, s.language_code, s.folder_id, s.tags_json, s.mode || "general", s.created_at, Date.now());

      if (Array.isArray(data.messages)) {
        for (const m of data.messages) {
          db.prepare(`
            INSERT OR REPLACE INTO chat_messages (id, session_id, role, content, detected_language, language_code, is_rtl, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(m.id, s.id, m.role, m.content, m.detected_language, m.language_code, m.is_rtl, m.created_at);
        }
      }
    }

    db.prepare("DELETE FROM recycle_bin WHERE id = ?").run(id);
    res.json({ success: true, message: "Item successfully restored." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to restore item." });
  }
});

// PERMANENTLY EMPTY RECYCLE BIN
workspaceRouter.delete("/recycle-bin", requireAuth, (req: Request, res: Response): void => {
  try {
    db.prepare("DELETE FROM recycle_bin WHERE user_id = ?").run(req.user!.id);
    res.json({ success: true, message: "Recycle bin emptied permanently." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to empty recycle bin." });
  }
});

// USAGE METRICS (93)
workspaceRouter.get("/usage-metrics", requireAuth, (req: Request, res: Response): void => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const metrics = db.prepare(`
      SELECT metric_type, SUM(metric_value) as total
      FROM usage_metrics
      WHERE user_id = ?
      GROUP BY metric_type
    `).all(req.user!.id) as any[];

    const todayMetrics = db.prepare(`
      SELECT metric_type, SUM(metric_value) as total
      FROM usage_metrics
      WHERE user_id = ? AND date = ?
      GROUP BY metric_type
    `).all(req.user!.id, today) as any[];

    const summary: Record<string, number> = {
      ai_queries_total: 0,
      image_generations_total: 0,
      storage_bytes_total: 0,
      ai_queries_today: 0,
    };

    for (const m of metrics) {
      if (m.metric_type === "ai_query") summary.ai_queries_total = m.total;
      if (m.metric_type === "image_generation") summary.image_generations_total = m.total;
      if (m.metric_type === "storage_bytes") summary.storage_bytes_total = m.total;
    }
    for (const m of todayMetrics) {
      if (m.metric_type === "ai_query") summary.ai_queries_today = m.total;
    }

    res.json({ usage: summary });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load usage metrics." });
  }
});

// FULL DATA ARCHIVE EXPORT (GDPR / COMPLIANCE 99)
workspaceRouter.get("/export-archive", requireAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user!.id;
    const user = db.prepare("SELECT id, email, name, role, created_at FROM users WHERE id = ?").get(userId);
    const sessions = db.prepare("SELECT * FROM chat_sessions WHERE user_id = ?").all(userId);
    const messages = db.prepare(`
      SELECT m.* FROM chat_messages m
      JOIN chat_sessions s ON m.session_id = s.id
      WHERE s.user_id = ?
    `).all(userId);
    const files = db.prepare("SELECT id, filename, filesize, category, created_at FROM user_files WHERE user_id = ?").all(userId);
    const knowledge = db.prepare("SELECT * FROM saved_knowledge WHERE user_id = ?").all(userId);
    const projects = db.prepare("SELECT * FROM projects WHERE user_id = ?").all(userId);

    const archive = {
      exportDate: new Date().toISOString(),
      platform: "PREMIERS AI",
      user,
      sessions,
      messages,
      files,
      knowledge,
      projects,
    };

    res.setHeader("Content-Disposition", `attachment; filename="premiers_ai_archive_${userId}.json"`);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(archive, null, 2));
  } catch (error: any) {
    res.status(500).json({ error: "Failed to export data archive." });
  }
});
