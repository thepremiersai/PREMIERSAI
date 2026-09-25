import { Router, Request, Response } from "express";
import { db, logAuditEvent, recordUsageMetric, moveToRecycleBin } from "../db";
import { optionalAuth, requireAuth, createRateLimiter } from "../auth";
import { getGenAI, generateAIContent, generateAIContentStream, generateAIAudio, transcribeAIAudio, enhanceAIPrompt } from "../gemini";

export const chatRouter = Router();

// Rate limiter for chat completions (up to 40 per min per IP)
const chatLimiter = createRateLimiter(60 * 1000, 40, "Chat request rate limit exceeded. Please wait a moment.");

// ==========================================
// FEATURE: AI TEXT-TO-SPEECH (GEMINI TTS)
// ==========================================
chatRouter.post("/tts", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, voice } = req.body;
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Text is required for TTS." });
      return;
    }
    const audioData = await generateAIAudio(text, voice || "Kore");
    if (!audioData) {
      res.status(503).json({ error: "AI Speech audio temporarily unavailable." });
      return;
    }
    if (req.user) recordUsageMetric(req.user.id, "ai_query", 1);
    res.json({
      audioUrl: `data:${audioData.mimeType};base64,${audioData.audioBase64}`,
      mimeType: audioData.mimeType,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate AI speech." });
  }
});

// ==========================================
// FEATURE: AI AUDIO TRANSCRIBE (GEMINI STT)
// ==========================================
chatRouter.post("/transcribe", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      res.status(400).json({ error: "Audio base64 data is required." });
      return;
    }
    const cleanBase64 = audioBase64.includes(",") ? audioBase64.split(",")[1] : audioBase64;
    const text = await transcribeAIAudio(cleanBase64, mimeType || "audio/webm");
    if (!text) {
      res.status(503).json({ error: "Voice transcription temporarily unavailable." });
      return;
    }
    if (req.user) recordUsageMetric(req.user.id, "ai_query", 1);
    res.json({ text });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to transcribe audio." });
  }
});

// ==========================================
// FEATURE: AI PROMPT ENHANCER
// ==========================================
chatRouter.post("/enhance-prompt", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Prompt string is required." });
      return;
    }
    const enhanced = await enhanceAIPrompt(prompt);
    res.json({ enhancedPrompt: enhanced || prompt });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to enhance prompt." });
  }
});

function extractServerBrandName(text: string): { brandName: string; isGaming: boolean; isAutomotive: boolean; isLuxury: boolean } {
  const lower = text.toLowerCase();
  const isGaming = /\bff\b/i.test(lower) || lower.includes("free fire") || lower.includes("gaming") || lower.includes("esports") || lower.includes("clan");
  const isAutomotive = lower.includes("motor") || lower.includes("automotive") || lower.includes("car") || lower.includes("racing");
  const isLuxury = lower.includes("luxury") || lower.includes("royal") || lower.includes("gold") || lower.includes("jewelry");

  // Check explicit naming / naam
  const namingMatch = text.match(/\b(?:naming|named|name is|name:|naam)\s*[:=\-]?\s*([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})/i);
  if (namingMatch && namingMatch[1].trim()) {
    let name = namingMatch[1].trim().replace(/\b(hai|hoga|rakho|ka|ki|ke|plz|please|banao|chahiye)\b$/gi, "").trim();
    if (name && !["naming", "naam", "logo"].includes(name.toLowerCase())) {
      const formatted = name.toUpperCase() === name ? name : name.replace(/\b\w/g, (l) => l.toUpperCase());
      return { brandName: formatted, isGaming, isAutomotive, isLuxury };
    }
  }

  // Check quoted string
  const quoted = text.match(/["'“]([^"'”]+)["'”]/);
  if (quoted && quoted[1].trim()) {
    return { brandName: quoted[1].trim(), isGaming, isAutomotive, isLuxury };
  }

  // Check "ke naam ka"
  const keNaam = text.match(/([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})\s+ke\s+naam\s+(?:ka|se|ki)\b/i);
  if (keNaam && keNaam[1].trim()) {
    return { brandName: keNaam[1].trim(), isGaming, isAutomotive, isLuxury };
  }

  // Check "X ka logo"
  const kaLogo = text.match(/([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})\s+(?:ka|ki|ke)\s+logo\b/i);
  if (kaLogo && kaLogo[1].trim()) {
    return { brandName: kaLogo[1].trim(), isGaming, isAutomotive, isLuxury };
  }

  // Check "for X"
  const forMatch = text.match(/\bfor\s+(?:my\s+)?(?:youtube\s+channel|channel|clan|team|startup|business|company)?\s*([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})/i);
  if (forMatch && forMatch[1].trim()) {
    return { brandName: forMatch[1].trim(), isGaming, isAutomotive, isLuxury };
  }

  return {
    brandName: isGaming ? "YASIR FF" : isAutomotive ? "ZAID MOTORS" : "PREMIERS AI",
    isGaming,
    isAutomotive,
    isLuxury,
  };
}

// Language and Script detection
export function detectLanguageAndScript(text: string): {
  detectedLanguage: string;
  isRTL: boolean;
  script: string;
  code: string;
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return { detectedLanguage: "English", isRTL: false, script: "latin", code: "en" };
  }

  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const hebrewRegex = /[\u0590-\u05FF\uFB1D-\uFB4F]/;
  const devanagariRegex = /[\u0900-\u097F]/;
  const gurmukhiRegex = /[\u0A00-\u0A7F]/;
  const cjkRegex = /[\u4E00-\u9FFF\u3400-\u4DBF]/;
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF]/;
  const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF]/;
  const cyrillicRegex = /[\u0400-\u04FF]/;

  let rtlCount = 0;
  let devanagariCount = 0;
  let cjkCount = 0;
  let japaneseCount = 0;
  let koreanCount = 0;
  let cyrillicCount = 0;
  let latinCount = 0;

  for (const char of trimmed) {
    if (arabicRegex.test(char) || hebrewRegex.test(char)) rtlCount++;
    else if (devanagariRegex.test(char)) devanagariCount++;
    else if (japaneseRegex.test(char)) japaneseCount++;
    else if (koreanRegex.test(char)) koreanCount++;
    else if (cjkCount > 0 && cjkRegex.test(char)) cjkCount++;
    else if (cyrillicRegex.test(char)) cyrillicCount++;
    else if (/[a-zA-Z]/.test(char)) latinCount++;
  }

  const urduCharRegex = /[ٹڈڑںےہھچپژگ]/;

  if (rtlCount > 0 && rtlCount >= latinCount) {
    if (hebrewRegex.test(trimmed)) {
      return { detectedLanguage: "Hebrew", isRTL: true, script: "hebrew", code: "he" };
    }
    if (urduCharRegex.test(trimmed)) {
      return { detectedLanguage: "Urdu", isRTL: true, script: "arabic", code: "ur" };
    }
    if (/[گچپژ]/.test(trimmed)) {
      return { detectedLanguage: "Persian", isRTL: true, script: "arabic", code: "fa" };
    }
    return { detectedLanguage: "Arabic", isRTL: true, script: "arabic", code: "ar" };
  }

  if (devanagariCount > 0 && devanagariCount >= latinCount) {
    return { detectedLanguage: "Hindi", isRTL: false, script: "devanagari", code: "hi" };
  }
  if (gurmukhiRegex.test(trimmed)) {
    return { detectedLanguage: "Punjabi", isRTL: false, script: "gurmukhi", code: "pa" };
  }
  if (koreanCount > 0) {
    return { detectedLanguage: "Korean", isRTL: false, script: "hangul", code: "ko" };
  }
  if (japaneseCount > 0) {
    return { detectedLanguage: "Japanese", isRTL: false, script: "japanese", code: "ja" };
  }
  if (cjkCount > 0) {
    return { detectedLanguage: "Chinese", isRTL: false, script: "han", code: "zh" };
  }
  if (cyrillicCount > 0 && cyrillicCount >= latinCount) {
    return { detectedLanguage: "Russian", isRTL: false, script: "cyrillic", code: "ru" };
  }

  // Check Roman Urdu
  const lower = trimmed.toLowerCase();
  const romanUrduWords = [
    "aap", "kaise", "kese", "hain", "kya", "haal", "hai", "mujhe", "chahiye", "bana", "do",
    "batao", "shukriya", "mein", "main", "meri", "mera", "mere", "hum", "tum", "karo", "karna",
    "theek", "bhai", "yaar", "salam", "assalam", "walaikum", "khush", "amadid", "bohot", "boht",
    "acha", "achi", "achha", "zaroor", "shukria", "samajh", "aaya", "aye", "gaya", "hoga"
  ];
  const words = lower.split(/\s+/);
  const matchCount = words.filter(w => romanUrduWords.includes(w.replace(/[.,?!]/g, ""))).length;
  if (matchCount >= 2 || (words.length <= 4 && matchCount >= 1)) {
    return { detectedLanguage: "Roman Urdu", isRTL: false, script: "latin", code: "ur-Latn" };
  }

  if (/\b(bonjour|merci|s'il vous|avec|pourquoi|comment|très|oui|non)\b/i.test(lower)) {
    return { detectedLanguage: "French", isRTL: false, script: "latin", code: "fr" };
  }
  if (/\b(hola|gracias|por favor|cómo|estás|bueno|amigo|usted)\b/i.test(lower)) {
    return { detectedLanguage: "Spanish", isRTL: false, script: "latin", code: "es" };
  }
  if (/\b(hallo|guten|danke|bitte|wie|geht's|deutsch|nicht|ist)\b/i.test(lower)) {
    return { detectedLanguage: "German", isRTL: false, script: "latin", code: "de" };
  }
  if (/\b(merhaba|teşekkürler|nasılsın|lütfen|evet|hayır|güzel)\b/i.test(lower)) {
    return { detectedLanguage: "Turkish", isRTL: false, script: "latin", code: "tr" };
  }

  return { detectedLanguage: "English", isRTL: false, script: "latin", code: "en" };
}

/**
 * Automatic current-information intent detection.
 * Identifies queries requiring real-time web search or up-to-date data.
 */
export function detectCurrentInformationIntent(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  const currentKeywords = [
    "latest", "today", "right now", "current", "breaking", "recently", "upcoming",
    "this week", "this month", "current price", "current prices", "stock price", "crypto price",
    "bitcoin price", "gold price", "dollar rate", "current weather", "weather today",
    "sports result", "score", "scores", "who won", "match result", "tournament",
    "election", "elections", "government announcement", "announcement", "ai news",
    "tech news", "technology news", "cybersecurity news", "scientific discovery",
    "company announcement", "product launch", "current law", "current schedule", "trending", "trend",
    "is this true", "fact check", "verify if", "did it happen", "did he", "did she",
    "what happened to", "who is the current", "who is currently", "release date", "newest"
  ];
  return currentKeywords.some((kw) => lower.includes(kw));
}

/**
 * Fact-checking query detector for "Is this true?" prompts.
 */
export function isFactCheckQuery(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes("is this true") ||
    lower.includes("is it true") ||
    lower.includes("verify if") ||
    lower.includes("fact check") ||
    lower.includes("fact-check") ||
    lower.includes("is it real") ||
    lower.includes("did this actually happen") ||
    lower.includes("kya yeh sach hai") ||
    lower.includes("kya ye sach hai")
  );
}

/**
 * Resilient, multi-dialect contextual fallback generator.
 */
export function generateFallbackResponse(userText: string, detection: any): string {
  const isUrdu = detection.detectedLanguage === "Urdu";
  const isRomanUrdu = detection.detectedLanguage === "Roman Urdu";
  const isArabic = detection.detectedLanguage === "Arabic";
  const isFrench = detection.detectedLanguage === "French";
  const isSpanish = detection.detectedLanguage === "Spanish";
  const isGerman = detection.detectedLanguage === "German";
  const isChinese = detection.detectedLanguage === "Chinese";

  const lower = userText.toLowerCase();

  if (lower.includes("code") || lower.includes("python") || lower.includes("javascript") || lower.includes("function") || lower.includes("react")) {
    return `### Solution & Implementation

Here is a clean, production-grade implementation for your request:

\`\`\`typescript
/**
 * Global Intelligence Platform — Task Implementation
 * Query: ${userText.slice(0, 60)}
 */
export function executeTask(inputData?: any) {
  try {
    console.log("Processing request with precision:", inputData);
    return {
      status: "success",
      timestamp: Date.now(),
      data: inputData || "Task executed successfully",
    };
  } catch (error) {
    console.error("Execution error:", error);
    throw error;
  }
}
\`\`\`

**Key Features:**
- Complete type safety and defensive error handling.
- Modular architecture ready for immediate integration.`;
  } else if (lower.includes("logo") || lower.includes("company") || lower.includes("brand") || lower.includes("design") || lower.includes("naming") || lower.includes("naam")) {
    const { brandName, isGaming, isAutomotive, isLuxury } = extractServerBrandName(userText);
    if (isGaming) {
      if (isRomanUrdu) {
        return `### 🎮 Professional Gaming & Esports Visual Identity: **${brandName}**

Aap ke gaming brand **${brandName}** ke liye high-definition competitive esports crest tayar kiya gaya hai:

1. **Esports Warrior Shield & Mascot Silhouette**:
   - Dynamic angular crest aur cyber-armor visor with piercing glowing cyan eyes.
   - Profile-picture size (Discord, YouTube Gaming, Steam) par 100% optical balance aur clear silhouette.

2. **Typography & Brand Preservation**:
   - Exact brand name **"${brandName}"** ko 3D extruded metallic lettering mein render kiya gaya hai.
   - Zero generic font usage; custom esports display kerning with chamfered cuts.

3. **Color Harmony & Export Readiness**:
   - Competitive Crimson Fire & Ember Gold with Cyan eye illumination.
   - Studio Dark aur Transparent PNG dono formats preview aur download ke liye tayar hain!

Aap ka custom gaming visual asset aur mini brand brief neeche render ho chuka hai!`;
      } else {
        return `### 🎮 Professional Gaming & Esports Brand Identity: **${brandName}**

Here is a world-class competitive esports visual identity engineered specifically for **${brandName}**:

1. **Esports Silhouette & Dynamic Crest**:
   - Angular battle-ready tournament shield featuring an original cyber-warrior mask with piercing cyan specular illumination.
   - Engineered for instant recognition at profile-avatar dimensions (Discord, YouTube Gaming, Steam, Twitch).

2. **Strict Brand Name Preservation**:
   - The exact brand name **"${brandName}"** has been preserved with zero extraneous words.
   - High-impact 3D extruded lettering with faceted metallic chamfers.

3. **Color Direction & Transparent Asset**:
   - Competitive fire orange and crimson against deep titanium slate.
   - Both high-contrast studio presentation and 100% transparent PNG modes are ready to download below.`;
      }
    }

    if (isAutomotive || isLuxury) {
      if (isRomanUrdu) {
        return `### 🏎️ Luxury & High-Performance Marque Identity: **${brandName}**

Aap ke marque **${brandName}** ke liye aerodynamic luxury identity concept tayar kiya gaya hai:

1. **Aerodynamic Winged Crest**:
   - Swept-wing precision emblem jo velocity aur mechanical mastery ko symbolize karta hai.
   - Steering wheel badge aur showroom signage ke liye mathematically balanced proportions.

2. **Typography & Styling**:
   - Forward-slanted italicized precision grotesque typeface with high contrast.
   - Racing Crimson aur Brushed Platinum Silver accents.

Aap ka brand asset aur vector specifications neeche tayar hain!`;
      } else {
        return `### 🏎️ Luxury & High-Performance Marque Identity: **${brandName}**

Here is an executive-grade automotive brand identity engineered for **${brandName}**:

1. **Aerodynamic Swept-Wing Marque**:
   - Precision chrome emblem flanked by symmetrical swept wings symbolizing velocity and engineering poise.
   - Proportioned for vehicle grilles, steering wheel hubs, and digital interfaces.

2. **Typography & Color Harmony**:
   - Dynamic forward-slanted precision grotesque with high optical clarity.
   - Racing Crimson and Platinum Silver against carbon-weave dark tones.

Your high-definition brand asset has been rendered below.`;
      }
    }

    if (isRomanUrdu) {
      return `### 🏢 Modern Brand Identity & Vector Architecture: **${brandName}**

Aap ke enterprise **${brandName}** ke liye world-class visual identity architecture tayar ki gayi hai:

1. **Vector Geometry & Negative Space**:
   - Interlocking precision monogram mark jo innovation aur stability ko represent karta hai.
   - Har scale par optical clarity aur balance.

2. **Color Palette & Typography**:
   - Emerald Teal (#00d4a0) aur Titanium Dark Slate.
   - Plus Jakarta Sans Bold typography with balanced tracking.

Aap ka brand asset aur mini brief neeche tayar hai!`;
    } else {
      return `### 🏢 Modern Brand Identity & Vector Architecture: **${brandName}**

Here is a world-class visual identity architecture engineered for **${brandName}**:

1. **Geometric Vector Mark**:
   - Interlocking precision delta nodes symbolizing intelligence, structural stability, and forward momentum.
   - Balanced negative space passing all optical clarity benchmarks.

2. **Color Palette & Typography**:
   - High-Contrast Emerald Accent (#00d4a0) with Titanium Dark Slate.
   - Verified Brand Identifier with ultra-sharp kerning.

Your high-definition corporate brand visual has been rendered below.`;
    }
  } else if (isUrdu) {
    return `وعلیکم السلام! میں آپ کا ذہین ترین کثیر لسانی AI معاون ہوں۔ آپ کا پیغام "${userText}" موصول ہوا ہے۔

میں آپ کے لیے درج ذیل خدمات پیش کرنے کے لیے ہمہ وقت تیار ہوں:
1. **کثیر لسانی گفتگو**: اردو، رومن اردو، عربی، انگریزی اور دیگر تمام عالمی زبانوں میں مکمل روانی۔
2. **پیشہ ورانہ ڈیزائننگ اور لوگوز**: کارپوریٹ برانڈنگ اور 4K بصری آرٹ۔
3. **کوڈنگ اور لائیو ایپلی کیشنز**: ری ایکٹ، ٹائپ اسکرپٹ اور پائتھون میں مکمل اور محفوظ حل۔
4. **تحقیق اور لائیو ویب سرچ**: تفصیلی اور مستند معلومات برائے تحقیق۔

آپ اس بارے میں مزید کیا بنوانا چاہتے ہیں؟`;
  } else if (isRomanUrdu) {
    return `Salam! Main aap ka universal AI assistant hoon. Aap ka sawal "${userText}" mujhe mil gaya hai.

Main aap ki in cheezon mein madad kar sakta hoon:
- **Company Logos & Brand Identity**: Modern marks, emblems aur 4K visual art.
- **Web Development & Live Coding**: Interactive dynamic sandboxes aur working code.
- **Real-time Web Research**: Live web search aur factual verification.
- **Urdu & Roman Urdu Chat**: Bilkul aam faham aur dostana andaz mein guftagu.

Bataiye agay kya karna chahte hain?`;
  } else if (isArabic) {
    return `مرحباً بك! أنا مساعدك الذكي الشامل. تم استلام طلبك: "${userText}".

أنا على أتم الاستعداد لمساعدتك في:
- **تصميم شعارات الشركات والهويات البصرية الاحترافية**.
- **تطوير التطبيقات وكتابة الأكواد البرمجية الموثوقة**.
- **البحث المباشر والتحقق من الحقائق**.

كيف ترغب في المتابعة؟`;
  } else if (isFrench) {
    return `Bonjour ! J'ai bien traité votre demande concernant : "${userText}". Je suis disponible pour vous assister dans le développement web, l'analyse en temps réel et la rédaction technique.`;
  } else if (isSpanish) {
    return `¡Hola! He procesado su consulta: "${userText}". Estoy a su disposición para ayudarle con programación, búsqueda en tiempo real y asistencia técnica.`;
  } else if (isGerman) {
    return `Hallo! Ihre Anfrage zu "${userText}" wurde verarbeitet. Ich stehe bereit für Programmierung, Echtzeit-Recherche und mehrsprachige Assistenz.`;
  } else if (isChinese) {
    return `您好！已分析您的需求：“${userText}”。我能够协助您完成代码编写、多语言翻译、实时搜索及专业技术咨询。`;
  } else {
    return `I am PREMIERS AI. How can I assist you with your research, engineering, or creative goals?`;
  }
}

export const MODE_INSTRUCTIONS: Record<string, string> = {
  general: "You are PREMIERS AI, an all-around unified intelligent engine, adaptive to any domain or creative request.",
  writing: "You are a master creative writer, editor, and wordsmith. Focus on literary tone, captivating narrative, precise vocabulary, compelling pacing, and flawless grammar.",
  coding: "You are a principal software architect. Provide clean, robust, production-grade code, complete error handling, TypeScript safety, modular design, and step-by-step logic.",
  research: "You are an exhaustive research specialist. Provide structured citations, empirical findings, balanced perspectives, methodology breakdowns, and factual precision.",
  study: "You are a pedagogical mentor and tutor. Explain complex concepts simply, use the Socratic method, provide analogies, memory anchors, practice quizzes, and summaries.",
  business: "You are a C-suite strategic business advisor. Formulate executive summaries, ROI models, SWOT analysis, unit economics, pitch decks, and operational strategies.",
  marketing: "You are a viral growth and brand strategist. Create high-conversion copy, hook frameworks, emotional branding, SEO outlines, campaign roadmaps, and distribution tactics.",
  creative: "You are a visionary art director and brainstorm catalyst. Generate innovative concepts, vivid sensory descriptions, storytelling hooks, and aesthetic design prompts.",
  data_analysis: "You are a senior data scientist. Focus on statistical significance, quantitative insights, trend recognition, tabular structures, and analytical metrics.",
  tech_support: "You are an expert technical diagnostician. Provide clear, empathetic, numbered troubleshooting steps, root cause explanations, and verification tests."
};

const SYSTEM_INSTRUCTION = `You are PREMIERS AI, the unified next-generation universal multimodal intelligence platform founded by Syed Muhammad Yasir Abbas Zaidi (CEO & Founder of PREMIERS).

You are ONE single unified intelligence engine. The user experiences only PREMIERS AI.

CORE PRINCIPLES:
1. DIRECT, FACTUAL & MATHEMATICAL ACCURACY:
- For calculations (e.g. "What is 25 * 48?"), compute the exact mathematical answer immediately (1,200) without evasion or placeholder text.
- For definitions, science, history, and questions (e.g. "Explain artificial intelligence"), provide insightful, well-structured, comprehensive answers.
- For coding queries, write clean, robust, modern, production-grade code with TypeScript/language best practices.
- For research inquiries, provide exhaustive multi-part analysis with clear takeaways.

2. GLOBAL MULTILINGUAL CAPABILITY:
- Automatically detect the user's language.
- Respond fluently in the EXACT SAME LANGUAGE and script used by the user by default (English, Urdu in Nastaliq script, Roman Urdu in natural conversational Latin text, Arabic, Hindi, Persian, French, Spanish, German, Chinese, etc.).
- Never lecture the user on language selection; reply directly and naturally.

3. ZERO PLACEHOLDERS:
- Never return canned fake responses like "I have processed your request" or "How else can I assist you today?". Always deliver real, substantive content.`;

// ==========================================
// FEATURE 2: CONVERSATION FOLDERS
// ==========================================
chatRouter.get("/folders", requireAuth, (req: Request, res: Response): void => {
  try {
    const folders = db.prepare("SELECT * FROM chat_folders WHERE user_id = ? ORDER BY created_at ASC").all(req.user!.id);
    res.json({ folders });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load folders." });
  }
});

chatRouter.post("/folders", requireAuth, (req: Request, res: Response): void => {
  try {
    const { name, color, icon } = req.body;
    if (!name) {
      res.status(400).json({ error: "Folder name is required." });
      return;
    }
    const id = "fold_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    db.prepare(`
      INSERT INTO chat_folders (id, user_id, name, color, icon, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, req.user!.id, String(name).trim().slice(0, 60), color || "#00d4a0", icon || "folder", Date.now());

    res.status(201).json({ folder: { id, userId: req.user!.id, name, color, icon } });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create folder." });
  }
});

chatRouter.put("/folders/:id", requireAuth, (req: Request, res: Response): void => {
  try {
    const { name, color, icon } = req.body;
    const { id } = req.params;
    db.prepare(`
      UPDATE chat_folders SET name = COALESCE(?, name), color = COALESCE(?, color), icon = COALESCE(?, icon)
      WHERE id = ? AND user_id = ?
    `).run(name, color, icon, id, req.user!.id);
    res.json({ success: true, message: "Folder updated." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update folder." });
  }
});

chatRouter.delete("/folders/:id", requireAuth, (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    db.prepare("UPDATE chat_sessions SET folder_id = NULL WHERE folder_id = ? AND user_id = ?").run(id, req.user!.id);
    db.prepare("DELETE FROM chat_folders WHERE id = ? AND user_id = ?").run(id, req.user!.id);
    res.json({ success: true, message: "Folder deleted." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete folder." });
  }
});

// ==========================================
// FEATURE 4: CHAT SEARCH
// ==========================================
chatRouter.get("/search", requireAuth, (req: Request, res: Response): void => {
  try {
    const q = String(req.query.q || "").trim();
    const folderId = req.query.folderId ? String(req.query.folderId) : null;
    const mode = req.query.mode ? String(req.query.mode) : null;
    const tag = req.query.tag ? String(req.query.tag) : null;

    if (!q && !folderId && !mode && !tag) {
      res.json({ results: [] });
      return;
    }

    let query = `
      SELECT DISTINCT s.id, s.title, s.mode, s.folder_id, s.tags_json, s.created_at, s.updated_at,
        (SELECT content FROM chat_messages WHERE session_id = s.id AND content LIKE ? ORDER BY created_at DESC LIMIT 1) as matched_snippet
      FROM chat_sessions s
      LEFT JOIN chat_messages m ON s.id = m.session_id
      WHERE s.user_id = ?
    `;
    const params: any[] = [`%${q}%`, req.user!.id];

    if (q) {
      query += ` AND (s.title LIKE ? OR m.content LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }
    if (folderId) {
      query += ` AND s.folder_id = ?`;
      params.push(folderId);
    }
    if (mode) {
      query += ` AND s.mode = ?`;
      params.push(mode);
    }
    if (tag) {
      query += ` AND s.tags_json LIKE ?`;
      params.push(`%"${tag}"%`);
    }

    query += ` ORDER BY s.updated_at DESC LIMIT 30`;
    const results = db.prepare(query).all(...params) as any[];

    res.json({
      results: results.map((r) => ({
        id: r.id,
        title: r.title,
        mode: r.mode || "general",
        folderId: r.folder_id,
        tags: JSON.parse(r.tags_json || "[]"),
        matchedSnippet: r.matched_snippet || null,
        updatedAt: r.updated_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to search conversations." });
  }
});

// GET /api/chat/sessions - Get user chat sessions (includes modes, tags, folders)
chatRouter.get("/sessions", optionalAuth, (req: Request, res: Response): void => {
  try {
    if (!req.user) {
      res.json({ sessions: [] });
      return;
    }

    const sessions = db.prepare(`
      SELECT s.*, COUNT(m.id) as message_count
      FROM chat_sessions s
      LEFT JOIN chat_messages m ON s.id = m.session_id
      WHERE s.user_id = ? AND (s.is_temporary IS NULL OR s.is_temporary = 0)
      GROUP BY s.id
      ORDER BY s.pinned DESC, s.updated_at DESC LIMIT 100
    `).all(req.user.id) as any[];

    res.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        userId: s.user_id,
        title: s.title,
        pinned: Boolean(s.pinned),
        languageCode: s.language_code,
        folderId: s.folder_id || null,
        tags: JSON.parse(s.tags_json || "[]"),
        mode: s.mode || "general",
        isTemporary: Boolean(s.is_temporary),
        shareToken: s.share_token || null,
        isPublic: Boolean(s.is_public),
        messageCount: s.message_count,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load chat sessions." });
  }
});

// POST /api/chat/sessions - Create chat session (with mode, tags, folder, temporary flag)
chatRouter.post("/sessions", optionalAuth, (req: Request, res: Response): void => {
  try {
    const userId = req.user?.id || "guest_user";
    const { title, languageCode, folderId, tags, mode, isTemporary } = req.body;

    const now = Date.now();
    const sessionId = "ses_" + now + "_" + Math.random().toString(36).substring(2, 6);
    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);
    const validMode = mode && MODE_INSTRUCTIONS[mode] ? mode : "general";

    if (req.user) {
      db.prepare(`
        INSERT INTO chat_sessions (
          id, user_id, title, pinned, language_code, folder_id, tags_json, mode, is_temporary, created_at, updated_at
        ) VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)
      `).run(sessionId, userId, title || "New Conversation", languageCode || "auto", folderId || null, tagsJson, validMode, isTemporary ? 1 : 0, now, now);
    }

    res.status(201).json({
      session: {
        id: sessionId,
        userId,
        title: title || "New Conversation",
        pinned: false,
        languageCode: languageCode || "auto",
        folderId: folderId || null,
        tags: Array.isArray(tags) ? tags : [],
        mode: validMode,
        isTemporary: Boolean(isTemporary),
        createdAt: now,
        updatedAt: now,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create session." });
  }
});

// PUT /api/chat/sessions/:id - Update session (rename, pin, folder, tags, mode)
chatRouter.put("/sessions/:id", optionalAuth, (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { title, pinned, folderId, tags, mode } = req.body;
    const now = Date.now();

    if (req.user) {
      const updates: string[] = [];
      const params: any[] = [];

      if (title !== undefined) {
        updates.push("title = ?");
        params.push(String(title).trim());
      }
      if (pinned !== undefined) {
        updates.push("pinned = ?");
        params.push(pinned ? 1 : 0);
      }
      if (folderId !== undefined) {
        updates.push("folder_id = ?");
        params.push(folderId || null);
      }
      if (tags !== undefined) {
        updates.push("tags_json = ?");
        params.push(JSON.stringify(Array.isArray(tags) ? tags : []));
      }
      if (mode !== undefined) {
        updates.push("mode = ?");
        params.push(mode);
      }

      updates.push("updated_at = ?");
      params.push(now);
      params.push(id);
      params.push(req.user.id);

      db.prepare(`UPDATE chat_sessions SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`).run(...params);
    }

    res.json({ success: true, message: "Session updated." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update session." });
  }
});

// ==========================================
// FEATURE 7: CONVERSATION BRANCHING
// ==========================================
chatRouter.post("/sessions/:id/branch", optionalAuth, (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { messageId } = req.body;
    const userId = req.user?.id || "guest_user";
    const now = Date.now();

    const parentSession = db.prepare("SELECT * FROM chat_sessions WHERE id = ?").get(id) as any;
    if (!parentSession) {
      res.status(404).json({ error: "Parent conversation not found." });
      return;
    }

    const newSessionId = "branch_" + now + "_" + Math.random().toString(36).substring(2, 6);
    const newTitle = `[Fork] ${parentSession.title}`;

    if (req.user) {
      db.prepare(`
        INSERT INTO chat_sessions (
          id, user_id, title, pinned, language_code, folder_id, tags_json, mode, parent_session_id, parent_message_id, created_at, updated_at
        ) VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newSessionId,
        userId,
        newTitle,
        parentSession.language_code,
        parentSession.folder_id,
        parentSession.tags_json,
        parentSession.mode || "general",
        id,
        messageId || null,
        now,
        now
      );

      // Copy messages up to messageId
      let messagesToCopy = db.prepare("SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC").all(id) as any[];
      if (messageId) {
        const targetIdx = messagesToCopy.findIndex((m) => m.id === messageId);
        if (targetIdx !== -1) {
          messagesToCopy = messagesToCopy.slice(0, targetIdx + 1);
        }
      }

      for (const m of messagesToCopy) {
        const copyMsgId = "msg_b_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
        db.prepare(`
          INSERT INTO chat_messages (
            id, session_id, role, content, detected_language, language_code, is_rtl, attachments_json, images_json, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(copyMsgId, newSessionId, m.role, m.content, m.detected_language, m.language_code, m.is_rtl, m.attachments_json, m.images_json, m.created_at);
      }
    }

    res.status(201).json({
      branchSession: {
        id: newSessionId,
        title: newTitle,
        parentSessionId: id,
        createdAt: now,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to branch conversation." });
  }
});

// ==========================================
// FEATURE 10: CHAT SHARING & PUBLIC VIEW
// ==========================================
chatRouter.post("/sessions/:id/share", optionalAuth, (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { isPublic } = req.body;
    const token = "share_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

    if (req.user) {
      db.prepare("UPDATE chat_sessions SET share_token = ?, is_public = ? WHERE id = ? AND user_id = ?").run(
        isPublic !== false ? token : null,
        isPublic !== false ? 1 : 0,
        id,
        req.user.id
      );
    }

    res.json({
      shareToken: isPublic !== false ? token : null,
      shareUrl: isPublic !== false ? `/share/${token}` : null,
      isPublic: isPublic !== false,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate share link." });
  }
});

chatRouter.get("/shared/:token", (req: Request, res: Response): void => {
  try {
    const { token } = req.params;
    const session = db.prepare("SELECT id, title, mode, created_at FROM chat_sessions WHERE share_token = ? AND is_public = 1").get(token) as any;
    if (!session) {
      res.status(404).json({ error: "Shared conversation not found or access revoked." });
      return;
    }

    const messages = db.prepare("SELECT id, role, content, detected_language, is_rtl, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC").all(session.id);
    res.json({ session, messages });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load shared conversation." });
  }
});

// ==========================================
// FEATURE 9: CHAT EXPORT
// ==========================================
chatRouter.get("/sessions/:id/export", optionalAuth, (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const format = String(req.query.format || "markdown").toLowerCase();
    const session = db.prepare("SELECT * FROM chat_sessions WHERE id = ?").get(id) as any;
    const messages = db.prepare("SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC").all(id) as any[];

    const title = session?.title || "Conversation";

    if (format === "json") {
      res.setHeader("Content-Disposition", `attachment; filename="premiers_chat_${id}.json"`);
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify({ session, messages }, null, 2));
      return;
    }

    if (format === "txt") {
      let txt = `PREMIERS AI Conversation: ${title}\nExport Date: ${new Date().toISOString()}\n========================================\n\n`;
      for (const m of messages) {
        txt += `[${m.role.toUpperCase()}] (${new Date(m.created_at).toLocaleString()}):\n${m.content}\n\n----------------------------------------\n\n`;
      }
      res.setHeader("Content-Disposition", `attachment; filename="premiers_chat_${id}.txt"`);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.send(txt);
      return;
    }

    if (format === "html") {
      let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title} - PREMIERS AI</title><style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #111; }
        h1 { color: #008766; border-bottom: 2px solid #eee; padding-bottom: 12px; }
        .msg { margin: 24px 0; padding: 16px; border-radius: 8px; }
        .user { background: #f0f4ff; border-left: 4px solid #3b82f6; }
        .assistant { background: #f0fdf4; border-left: 4px solid #00d4a0; }
        .role { font-weight: bold; font-size: 0.85em; text-transform: uppercase; margin-bottom: 8px; color: #555; }
        pre { background: #1e1e2e; color: #eee; padding: 12px; border-radius: 6px; overflow-x: auto; }
      </style></head><body><h1>${title}</h1><p><small>Exported from PREMIERS AI • ${new Date().toLocaleDateString()}</small></p>`;
      for (const m of messages) {
        html += `<div class="msg ${m.role}"><div class="role">${m.role === "user" ? "You" : "PREMIERS AI"}</div><div>${m.content.replace(/\n/g, "<br/>")}</div></div>`;
      }
      html += `</body></html>`;
      res.setHeader("Content-Disposition", `attachment; filename="premiers_chat_${id}.html"`);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
      return;
    }

    // Default Markdown
    let md = `# ${title}\n\n*Exported from PREMIERS AI on ${new Date().toLocaleString()}*\n\n---\n\n`;
    for (const m of messages) {
      md += `### ${m.role === "user" ? "👤 User" : "✨ PREMIERS AI"}\n\n${m.content}\n\n---\n\n`;
    }
    res.setHeader("Content-Disposition", `attachment; filename="premiers_chat_${id}.md"`);
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.send(md);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to export chat." });
  }
});

// DELETE /api/chat/sessions/:id - Delete session (moves to recycle bin)
chatRouter.delete("/sessions/:id", optionalAuth, (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    if (req.user) {
      const session = db.prepare("SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?").get(id, req.user.id);
      if (session) {
        const msgs = db.prepare("SELECT * FROM chat_messages WHERE session_id = ?").all(id);
        moveToRecycleBin(req.user.id, "chat_session", id, { session, messages: msgs });
      }
      db.prepare("DELETE FROM chat_messages WHERE session_id = ?").run(id);
      db.prepare("DELETE FROM chat_sessions WHERE id = ? AND user_id = ?").run(id, req.user.id);
    }
    res.json({ success: true, message: "Session moved to recycle bin." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete session." });
  }
});

// DELETE /api/chat/sessions/:id/messages - Clear messages in a session
chatRouter.delete("/sessions/:id/messages", optionalAuth, (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    if (req.user) {
      db.prepare("DELETE FROM chat_messages WHERE session_id = ?").run(id);
    }
    res.json({ success: true, message: "Conversation messages cleared." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to clear messages." });
  }
});

// GET /api/chat/sessions/:id/messages - Get session message history (includes versions and saved flags)
chatRouter.get("/sessions/:id/messages", optionalAuth, (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const messages = db.prepare(`
      SELECT * FROM chat_messages
      WHERE session_id = ?
      ORDER BY created_at ASC
    `).all(id) as any[];

    res.json({
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.created_at,
        version: m.version || 1,
        previousVersions: JSON.parse(m.previous_versions_json || "[]"),
        isSaved: Boolean(m.is_saved),
        detectedLanguage: m.detected_language,
        languageCode: m.language_code,
        isRTL: Boolean(m.is_rtl),
        images: JSON.parse(m.images_json || "[]"),
        websiteHtml: m.website_html || undefined,
        attachments: JSON.parse(m.attachments_json || "[]"),
        sources: JSON.parse(m.sources_json || "[]"),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load messages." });
  }
});

// ==========================================
// FEATURE 5 & 6: ADVANCED MESSAGE ACTIONS & VERSIONING
// ==========================================
chatRouter.post("/messages/:id/action", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, targetLanguage } = req.body; // 'regenerate' | 'continue' | 'translate' | 'summarize' | 'explain' | 'save'

    const msg = db.prepare("SELECT * FROM chat_messages WHERE id = ?").get(id) as any;
    if (!msg) {
      res.status(404).json({ error: "Message not found." });
      return;
    }

    if (action === "save") {
      if (req.user) {
        const kid = "know_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
        db.prepare(`
          INSERT INTO saved_knowledge (id, user_id, title, content, category, tags_json, created_at)
          VALUES (?, ?, ?, ?, 'chat_insight', '["saved_chat"]', ?)
        `).run(kid, req.user.id, `Insight: ${msg.content.slice(0, 40)}...`, msg.content, Date.now());
        db.prepare("UPDATE chat_messages SET is_saved = 1 WHERE id = ?").run(id);
      }
      res.json({ success: true, message: "Saved to Personal Knowledge Library." });
      return;
    }

    const ai = getGenAI();
    let prompt = "";
    if (action === "regenerate") {
      prompt = `Please re-write and offer an enhanced, fresh alternative response to this previous query/output:\n\n${msg.content}`;
    } else if (action === "continue") {
      prompt = `Please continue seamlessly directly from where this ended, maintaining exact context and structure:\n\n${msg.content}`;
    } else if (action === "translate") {
      prompt = `Translate the following text into ${targetLanguage || "English"} while maintaining tone, formatting, and cultural nuance:\n\n${msg.content}`;
    } else if (action === "summarize") {
      prompt = `Provide a crisp executive summary with bullet points of the key takeaways from this text:\n\n${msg.content}`;
    } else if (action === "explain") {
      prompt = `Explain this response in clear, step-by-step detail with background concepts and examples:\n\n${msg.content}`;
    }

    let resultText = await generateAIContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    if (!resultText) {
      resultText = `[PREMIERS AI Action Result for ${action}]: Processed request for message.`;
    }

    if (action === "regenerate") {
      const prev = JSON.parse(msg.previous_versions_json || "[]");
      prev.push({ version: msg.version || 1, content: msg.content, timestamp: msg.created_at });
      const newVersion = (msg.version || 1) + 1;
      db.prepare(`
        UPDATE chat_messages SET content = ?, version = ?, previous_versions_json = ? WHERE id = ?
      `).run(resultText, newVersion, JSON.stringify(prev), id);

      res.json({
        updatedMessage: {
          id: msg.id,
          content: resultText,
          version: newVersion,
          previousVersions: prev,
        },
      });
      return;
    }

    res.json({ result: resultText });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to process message action." });
  }
});

// POST /api/chat/stream - Real-time Server-Sent Events Streaming Chat Handler
chatRouter.post("/stream", chatLimiter, optionalAuth, async (req: Request, res: Response): Promise<void> => {
  const { message, conversationHistory, targetLanguage, attachments, sessionId, mode, webSearch, deepThinking } = req.body;

  if (!message && (!attachments || attachments.length === 0)) {
    res.status(400).json({ error: "Message content or attachment is required." });
    return;
  }

  const userText = message || "(User attached media file for analysis)";
  const detection = detectLanguageAndScript(userText);
  const now = Date.now();
  const autoWebSearch = detectCurrentInformationIntent(userText);
  const webSearchNeeded = Boolean(webSearch) || autoWebSearch;
  const factCheck = isFactCheckQuery(userText);
  const thinkingLevel: "HIGH" | undefined = deepThinking ? "HIGH" : undefined;

  // Set up SSE headers
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  let clientDisconnected = false;
  req.on("close", () => {
    clientDisconnected = true;
  });

  // Ensure session exists
  if (sessionId) {
    try {
      const existingSession = db.prepare("SELECT id FROM chat_sessions WHERE id = ?").get(sessionId);
      if (!existingSession) {
        const ownerId = req.user?.id || "usr_guest";
        db.prepare(`
          INSERT OR IGNORE INTO chat_sessions (
            id, user_id, title, pinned, language_code, mode, created_at, updated_at
          ) VALUES (?, ?, ?, 0, ?, ?, ?, ?)
        `).run(
          sessionId,
          ownerId,
          userText.length > 30 ? userText.slice(0, 30) + "…" : userText,
          detection.code || "auto",
          mode || "general",
          now,
          now
        );
      }
    } catch (sessErr: any) {
      console.warn("Could not ensure chat session existence:", sessErr?.message);
    }
  }

  // Persist user message safely
  const userMsgId = "msg_user_" + now;
  if (sessionId) {
    try {
      db.prepare(`
        INSERT OR IGNORE INTO chat_messages (
          id, session_id, role, content, detected_language,
          language_code, is_rtl, attachments_json, created_at
        ) VALUES (?, ?, 'user', ?, ?, ?, ?, ?, ?)
      `).run(
        userMsgId,
        sessionId,
        userText,
        detection.detectedLanguage,
        detection.code,
        detection.isRTL ? 1 : 0,
        JSON.stringify(attachments || []),
        now
      );
      db.prepare("UPDATE chat_sessions SET updated_at = ? WHERE id = ?").run(now, sessionId);
    } catch (msgErr: any) {
      console.warn("Could not persist user message:", msgErr?.message);
    }
  }

  // Send initial start event
  res.write(`data: ${JSON.stringify({
    type: "start",
    sessionId: sessionId || null,
    userMessageId: userMsgId,
    webSearchNeeded,
    detectedLanguage: detection.detectedLanguage
  })}\n\n`);

  if (webSearchNeeded) {
    res.write(`data: ${JSON.stringify({
      type: "status",
      step: "searching",
      message: "Searching live web & official sources..."
    })}\n\n`);
  }

  // Build tailored instruction
  const selectedMode = mode && MODE_INSTRUCTIONS[mode] ? MODE_INSTRUCTIONS[mode] : MODE_INSTRUCTIONS.general;
  let tailoredInstruction = `${SYSTEM_INSTRUCTION}

MODE & DOMAIN SPECIALIZATION:
${selectedMode}

CONTEXT RESOLUTION:
- Actively resolve conversational references from prior turns: pronouns like "this", "that", "the previous answer", "it", "translate this", "make it shorter", "continue".
- When asked to expand, explain, or revise, preserve the thread context seamlessly.

USER LANGUAGE CONTEXT:
Detected: ${detection.detectedLanguage} (${detection.code}).
Explicit target: ${targetLanguage || "match_user"}.
${factCheck ? `FACT CHECKING MANDATE:
- The user is asking to verify or fact-check a claim.
- Cross-check claims with reputable sources.
- Identify primary facts vs conflicting reports.
- Clearly present consensus, nuances, and uncertainties.
- Always cite verified URLs from grounding metadata.` : ""}
${webSearchNeeded ? `REAL-TIME WEB SEARCH & CITATIONS MANDATE:
- Use Google Search Grounding to provide real-time, up-to-date accurate information.
- Cite specific publications, official organizations, or company announcements when applicable.
- Never invent URLs or pretend to browse nonexistent pages.` : ""}
${/\b(logo|naming|naam|brand|crest|monogram|emblem|mascot|wordmark|lettermark|thumbnail|poster|flyer|banner|billboard|photo|wallpaper|artwork)\b/i.test(userText) ? `UNIVERSAL CREATIVE & VISUAL INTELLIGENCE MANDATE:
- The user is requesting creative visual design, brand architecture, thumbnail creation, or artwork.
- ACCURATELY EXTRACT THE ENTITY / BRAND NAME: Never confuse directive words like "naming", "naam", "logo", "called", "banao", "ke naam ka" as the brand itself!
- For requests like "Logo banao, naming YASIR FF", the brand name is strictly "YASIR FF". The word "naming" is a directive specifying the brand, and MUST NEVER appear in the brand or design.
- EXACT PRESERVATION: Preserve exact names, acronyms, and casing given by the user. Do not invent extraneous words unless asked.
- DESIGN DIVERSITY: Understand the user's intended aesthetic (minimalist, luxury, competitive gaming, vintage, corporate, playful, cinematic, photorealistic). Adapt typography, palette, and composition accordingly.
- For YouTube Thumbnails: Focus on high-CTR storytelling, rule-of-thirds subject placement, punchy 2-line headline, and eyecatcher badges.
- For Product Photography: Focus on studio rim lighting, travertine marble podium reflections, and material textures.
- For Brand Logos: Provide structured Mini Brand Brief covering Symbolism, Typography Direction, Color Harmony, and Multi-scale Recognition.` : ""}`;

  // Build contents history
  const contents: any[] = [];
  if (Array.isArray(conversationHistory)) {
    for (const h of conversationHistory.slice(-8)) {
      if (h.role === "user" || h.role === "assistant") {
        contents.push({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content || "" }],
        });
      }
    }
  }

  const currentParts: any[] = [{ text: userText }];
  if (Array.isArray(attachments)) {
    for (const att of attachments) {
      if (att.data && att.type?.startsWith("image/")) {
        const base64Data = att.data.includes(",") ? att.data.split(",")[1] : att.data;
        currentParts.push({
          inlineData: {
            mimeType: att.type,
            data: base64Data,
          },
        });
      }
    }
  }
  contents.push({ role: "user", parts: currentParts });

  let accumulatedText = "";
  let sources: any[] = [];
  let searchQueries: string[] = [];

  try {
    if (webSearchNeeded) {
      res.write(`data: ${JSON.stringify({
        type: "status",
        step: "verifying",
        message: "Verifying information & synthesizing response..."
      })}\n\n`);
    }

    const streamResult = await generateAIContentStream({
      contents,
      systemInstruction: tailoredInstruction,
      temperature: 0.7,
      topP: 0.95,
      enableWebSearch: webSearchNeeded,
      thinkingLevel,
      onChunk: (chunkText) => {
        if (!clientDisconnected) {
          accumulatedText += chunkText;
          res.write(`data: ${JSON.stringify({ type: "chunk", text: chunkText })}\n\n`);
        }
      },
    });

    if (streamResult) {
      accumulatedText = streamResult.fullText || accumulatedText;
      sources = streamResult.sources || [];
      searchQueries = streamResult.searchQueries || [];
    }
  } catch (err: any) {
    console.warn("[Chat Stream] Error during streaming:", err?.message || err);
  }

  // If streaming returned empty, attempt direct content generation failover
  if (!accumulatedText) {
    try {
      const directResult = await generateAIContent({
        contents,
        systemInstruction: tailoredInstruction,
        temperature: 0.7,
        topP: 0.95,
        enableWebSearch: false,
        thinkingLevel,
      });
      if (directResult && directResult.trim()) {
        accumulatedText = directResult.trim();
        res.write(`data: ${JSON.stringify({ type: "chunk", text: accumulatedText })}\n\n`);
      }
    } catch (e: any) {
      console.warn("[Chat Stream] Direct failover also failed:", e?.message);
    }
  }

  // If still empty after all retries, deliver honest error message rather than a fake canned reply
  if (!accumulatedText) {
    accumulatedText = "⚠️ PREMIERS AI is currently experiencing high demand. Please click **Retry** below to regenerate your response.";
    res.write(`data: ${JSON.stringify({ type: "chunk", text: accumulatedText })}\n\n`);
  }

  const replyDetection = detectLanguageAndScript(accumulatedText);
  const asstMsgId = "msg_asst_" + Date.now();

  // Persist assistant message
  if (sessionId) {
    try {
      db.prepare(`
        INSERT OR IGNORE INTO chat_messages (
          id, session_id, role, content, detected_language,
          language_code, is_rtl, sources_json, created_at
        ) VALUES (?, ?, 'assistant', ?, ?, ?, ?, ?, ?)
      `).run(
        asstMsgId,
        sessionId,
        accumulatedText,
        replyDetection.detectedLanguage,
        replyDetection.code,
        replyDetection.isRTL ? 1 : 0,
        JSON.stringify(sources || []),
        Date.now()
      );
    } catch (asstErr: any) {
      console.warn("Could not persist assistant message:", asstErr?.message);
    }
  }

  if (req.user) {
    try {
      logAuditEvent(req.user.id, "ai_chat_streamed", "chat", sessionId || null, { language: replyDetection.detectedLanguage, sourcesCount: sources.length }, req.ip, req.headers["user-agent"]);
      recordUsageMetric(req.user.id, "ai_query", 1);
    } catch (metricErr: any) {}
  }

  // Send final done event
  res.write(`data: ${JSON.stringify({
    type: "done",
    messageId: asstMsgId,
    content: accumulatedText,
    sources,
    searchQueries,
    detectedLanguage: replyDetection.detectedLanguage || detection.detectedLanguage,
    isRTL: replyDetection.isRTL,
    languageCode: replyDetection.code,
    sessionId: sessionId || null,
  })}\n\n`);
  res.end();
});

// POST /api/chat - Main Chat Handler
chatRouter.post("/", chatLimiter, optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, conversationHistory, targetLanguage, attachments, sessionId, mode, webSearch, deepThinking } = req.body;

    if (!message && (!attachments || attachments.length === 0)) {
      res.status(400).json({ error: "Message content or attachment is required." });
      return;
    }

    const userText = message || "(User attached media file for analysis)";
    const detection = detectLanguageAndScript(userText);
    const now = Date.now();
    const autoWebSearch = detectCurrentInformationIntent(userText);
    const webSearchNeeded = Boolean(webSearch) || autoWebSearch;
    const thinkingLevel: "HIGH" | undefined = deepThinking ? "HIGH" : undefined;

    // Ensure session exists in chat_sessions so foreign keys on chat_messages never fail
    if (sessionId) {
      try {
        const existingSession = db.prepare("SELECT id FROM chat_sessions WHERE id = ?").get(sessionId);
        if (!existingSession) {
          const ownerId = req.user?.id || "usr_guest";
          db.prepare(`
            INSERT OR IGNORE INTO chat_sessions (
              id, user_id, title, pinned, language_code, mode, created_at, updated_at
            ) VALUES (?, ?, ?, 0, ?, ?, ?, ?)
          `).run(
            sessionId,
            ownerId,
            userText.length > 30 ? userText.slice(0, 30) + "…" : userText,
            detection.code || "auto",
            mode || "general",
            now,
            now
          );
        }
      } catch (sessErr: any) {
        console.warn("Could not ensure chat session existence:", sessErr?.message);
      }
    }

    // Persist user message safely
    const userMsgId = "msg_user_" + now;
    if (sessionId) {
      try {
        db.prepare(`
          INSERT OR IGNORE INTO chat_messages (
            id, session_id, role, content, detected_language,
            language_code, is_rtl, attachments_json, created_at
          ) VALUES (?, ?, 'user', ?, ?, ?, ?, ?, ?)
        `).run(
          userMsgId,
          sessionId,
          userText,
          detection.detectedLanguage,
          detection.code,
          detection.isRTL ? 1 : 0,
          JSON.stringify(attachments || []),
          now
        );

        db.prepare("UPDATE chat_sessions SET updated_at = ? WHERE id = ?").run(now, sessionId);
      } catch (msgErr: any) {
        console.warn("Could not persist user message:", msgErr?.message);
      }
    }

    // Dynamic system instruction tailoring with Mode
    let tailoredInstruction = SYSTEM_INSTRUCTION;
    const selectedMode = mode && MODE_INSTRUCTIONS[mode] ? mode : "general";
    tailoredInstruction += `\n\nCURRENT SPECIALIZED CONVERSATION MODE: [${selectedMode.toUpperCase()}]\n${MODE_INSTRUCTIONS[selectedMode]}`;

    if (targetLanguage && targetLanguage !== "auto") {
      tailoredInstruction += `\n\nUSER OVERRIDE: The user explicitly requested replies in: ${targetLanguage}. You MUST reply strictly in this requested language.`;
    } else if (detection.detectedLanguage === "Roman Urdu") {
      tailoredInstruction += `\n\nUSER LANGUAGE CONTEXT: The user wrote in Roman Urdu (Urdu written in Latin script). You should understand them completely and respond in natural, friendly Roman Urdu or standard Urdu as appropriate.`;
    }

    if (/\b(logo|naming|naam|brand|crest|monogram|emblem|mascot|wordmark|lettermark|thumbnail|poster|flyer|banner|billboard|photo|wallpaper|artwork)\b/i.test(userText)) {
      tailoredInstruction += `\n\nUNIVERSAL CREATIVE & VISUAL INTELLIGENCE MANDATE:
- The user is requesting creative visual design, brand architecture, thumbnail creation, or artwork.
- ACCURATELY EXTRACT THE ENTITY / BRAND NAME: Never confuse directive words like "naming", "naam", "logo", "called", "banao", "ke naam ka" as the brand itself!
- For requests like "Logo banao, naming YASIR FF", the brand name is strictly "YASIR FF".
- DESIGN DIVERSITY: Adapt typography, color palettes, and composition to the exact requested style (minimal, luxury, gaming, modern, vintage, corporate, playful, photorealistic).`;
    }

    let replyText = "";
    let replyDetection = detection;
    let sources: any[] = [];
    let searchQueries: string[] = [];

    try {
      const contents: any[] = [];

      if (Array.isArray(conversationHistory)) {
        const recent = conversationHistory.slice(-8);
        for (const msg of recent) {
          const role = msg.role === "assistant" ? "model" : "user";
          contents.push({
            role: role,
            parts: [{ text: msg.content || "" }],
          });
        }
      }

      const currentParts: any[] = [{ text: userText }];

      if (Array.isArray(attachments)) {
        for (const att of attachments) {
          if (att.data && att.type?.startsWith("image/")) {
            const base64Data = att.data.includes(",") ? att.data.split(",")[1] : att.data;
            currentParts.push({
              inlineData: {
                mimeType: att.type,
                data: base64Data,
              },
            });
          }
        }
      }

      contents.push({ role: "user", parts: currentParts });

      const aiResult = await generateAIContent({
        contents,
        systemInstruction: tailoredInstruction,
        temperature: 0.7,
        topP: 0.95,
        enableWebSearch: webSearchNeeded,
        thinkingLevel,
      });

      if (aiResult) {
        replyText = aiResult;
        replyDetection = detectLanguageAndScript(replyText);
      }
    } catch (err: any) {
      console.log("[Chat Route] Handled generation dispatch safely");
    }

    if (!replyText) {
      res.status(503).json({
        error: "PREMIERS AI service is temporarily experiencing high demand. Please try again in a moment.",
      });
      return;
    }

    // Persist assistant message safely
    const asstMsgId = "msg_asst_" + Date.now();
    if (sessionId) {
      try {
        db.prepare(`
          INSERT OR IGNORE INTO chat_messages (
            id, session_id, role, content, detected_language,
            language_code, is_rtl, sources_json, created_at
          ) VALUES (?, ?, 'assistant', ?, ?, ?, ?, ?, ?)
        `).run(
          asstMsgId,
          sessionId,
          replyText,
          replyDetection.detectedLanguage,
          replyDetection.code,
          replyDetection.isRTL ? 1 : 0,
          JSON.stringify(sources || []),
          Date.now()
        );
      } catch (asstErr: any) {
        console.warn("Could not persist assistant message:", asstErr?.message);
      }
    }

    if (req.user) {
      try {
        logAuditEvent(req.user.id, "ai_chat_completed", "chat", sessionId || null, { language: replyDetection.detectedLanguage }, req.ip, req.headers["user-agent"]);
        recordUsageMetric(req.user.id, "ai_query", 1);
      } catch (metricErr: any) {
        console.warn("Metric record warning:", metricErr?.message);
      }
    }

    res.json({
      content: replyText,
      detectedLanguage: replyDetection.detectedLanguage || detection.detectedLanguage,
      isRTL: replyDetection.isRTL,
      script: replyDetection.script,
      languageCode: replyDetection.code,
      messageId: asstMsgId,
      sessionId: sessionId || null,
      sources,
      searchQueries,
    });
  } catch (error: any) {
    console.warn("Issue in chat handler:", error?.message || error);
    res.status(500).json({ error: "Failed to generate AI response.", details: error?.message });
  }
});
