/**
 * PREMIERS AI — Intent Classification & Knowledge Synthesizer
 * 
 * Strict Intent Hierarchy & Strategy Selection:
 * 1. IMAGE_EDITING / VISUAL (Logo, Thumbnail, Poster, Character, Image Gen)
 * 2. MATH (Calculations, arithmetic, equations)
 * 3. CASUAL_CONVERSATION (Greetings, identity)
 * 4. CURRENT_INFORMATION / NEWS / WEB_SEARCH / DEEP_RESEARCH
 * 5. TRANSLATION (Language conversion)
 * 6. WRITING / REWRITING / SUMMARIZATION
 * 7. EDUCATION / SCIENCE (Concepts, photosynthesis, definitions like "HTML kya hai")
 * 8. CODING / DEBUGGING / WEB_DEVELOPMENT (Strictly for code generation or bug fixing)
 * 9. GENERAL_KNOWLEDGE / FACTUAL_QUESTION (Countries, capitals, geography, history)
 */

export type UserIntent =
  | "GENERAL_KNOWLEDGE"
  | "FACTUAL_QUESTION"
  | "CASUAL_CONVERSATION"
  | "CURRENT_INFORMATION"
  | "NEWS"
  | "WEB_SEARCH"
  | "DEEP_RESEARCH"
  | "MATH"
  | "SCIENCE"
  | "EDUCATION"
  | "TRANSLATION"
  | "WRITING"
  | "REWRITING"
  | "SUMMARIZATION"
  | "COMPARISON"
  | "RECOMMENDATION"
  | "CODING"
  | "DEBUGGING"
  | "WEB_DEVELOPMENT"
  | "TECHNICAL_SUPPORT"
  | "IMAGE_GENERATION"
  | "IMAGE_EDITING"
  | "LOGO_DESIGN"
  | "THUMBNAIL_DESIGN"
  | "POSTER_DESIGN"
  | "CHARACTER_GENERATION"
  | "FILE_ANALYSIS"
  | "PDF_ANALYSIS"
  | "IMAGE_ANALYSIS"
  | "DATA_ANALYSIS"
  | "BUSINESS"
  | "OTHER";

export interface IntentClassification {
  intent: UserIntent;
  confidence: number;
  subType?: string;
  isVisual: boolean;
  requiresWebSearch: boolean;
  detectedLanguage: string;
  languageCode: string;
  isRTL: boolean;
  visualParams?: {
    brandName?: string;
    category?: string;
    style?: string;
    aspectRatio?: string;
  };
}

export function classifyUserIntent(
  text: string,
  langInfo: { detectedLanguage: string; code: string; isRTL: boolean },
  hasImageAttachment = false
): IntentClassification {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. IMAGE EDITING
  const isImageEditPhrases =
    hasImageAttachment ||
    lower.includes("is image ko") ||
    lower.includes("iss image ko") ||
    lower.includes("is photo ko") ||
    lower.includes("iss photo ko") ||
    lower.includes("is tasveer ko") ||
    lower.includes("make this image") ||
    lower.includes("edit this image") ||
    lower.includes("filter this image") ||
    lower.includes("cinematic bana") ||
    lower.includes("make it cinematic");

  if (isImageEditPhrases) {
    if (
      lower.includes("cinematic") ||
      lower.includes("edit") ||
      lower.includes("filter") ||
      lower.includes("enhance") ||
      lower.includes("banao") ||
      lower.includes("bana do") ||
      lower.includes("convert") ||
      lower.includes("grading") ||
      hasImageAttachment
    ) {
      return {
        intent: "IMAGE_EDITING",
        confidence: 0.95,
        isVisual: true,
        requiresWebSearch: false,
        detectedLanguage: langInfo.detectedLanguage,
        languageCode: langInfo.code,
        isRTL: langInfo.isRTL,
      };
    }
  }

  // 2. IMAGE GENERATION / VISUAL CREATION
  const isLogo =
    lower.includes("logo") ||
    lower.includes("لوگو") ||
    lower.includes("crest") ||
    lower.includes("monogram") ||
    lower.includes("emblem") ||
    lower.includes("wordmark") ||
    lower.includes("lettermark") ||
    lower.includes("badge") ||
    lower.includes("mascot");

  const isThumbnail =
    lower.includes("thumbnail") ||
    lower.includes("تھمب نیل") ||
    lower.includes("yt thumb") ||
    lower.includes("youtube thumb");

  const isPoster =
    lower.includes("poster") ||
    lower.includes("flyer") ||
    lower.includes("billboard") ||
    lower.includes("پوسٹر");

  const isCharacter =
    lower.includes("character") ||
    lower.includes("anime character") ||
    lower.includes("cartoon character") ||
    (lower.includes("wearing") && lower.includes("hoodie")) ||
    (lower.includes("black hoodie") && !lower.includes("buy"));

  const isVisualGeneral =
    isLogo ||
    isThumbnail ||
    isPoster ||
    isCharacter ||
    lower.includes("image banao") ||
    lower.includes("image bana") ||
    lower.includes("tasveer banao") ||
    lower.includes("tasveer bana") ||
    lower.includes("tasveer") ||
    lower.includes("photo banao") ||
    lower.includes("picture banao") ||
    lower.includes("generate image") ||
    lower.includes("generate an image") ||
    lower.includes("create an image") ||
    lower.includes("create image") ||
    lower.includes("make an image") ||
    lower.includes("make image") ||
    lower.includes("draw ") ||
    lower.includes("paint ") ||
    lower.includes("sketch ") ||
    lower.includes("artwork") ||
    lower.includes("wallpaper") ||
    lower.includes("realistic image") ||
    lower.includes("futuristic city") ||
    lower.includes("cyberpunk city") ||
    lower.includes("luxury product advertisement") ||
    lower.includes("product advertisement") ||
    lower.includes("advertisement creative") ||
    lower.includes("perfume advertisement");

  if (isVisualGeneral) {
    let specificIntent: UserIntent = "IMAGE_GENERATION";
    if (isLogo) specificIntent = "LOGO_DESIGN";
    else if (isThumbnail) specificIntent = "THUMBNAIL_DESIGN";
    else if (isPoster) specificIntent = "POSTER_DESIGN";
    else if (isCharacter) specificIntent = "CHARACTER_GENERATION";

    return {
      intent: specificIntent,
      confidence: 0.95,
      isVisual: true,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 3. MATH / ARITHMETIC / EQUATIONS
  const isUrduMath =
    /\b([0-9]+)\s*[\+\-\*\/xX]\s*([0-9]+)\s*(?:kitna|kya|equals|\=)/i.test(lower) ||
    /^[0-9\.\s\+\-\*\/\^\(\)\%\=\?]+$/.test(trimmed) ||
    /^(?:what is\s+|calculate\s+|solve\s+|kitna hota hai\s+|kitna hai\s+)?([0-9\.\s\+\-\*\/\^\(\)\%]+)\??$/i.test(trimmed);

  if (isUrduMath && /[0-9]/.test(trimmed)) {
    return {
      intent: "MATH",
      confidence: 0.99,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 4. CASUAL CONVERSATION (GREETINGS & IDENTITY)
  if (
    /^(hello|hi|hey|greetings|good morning|good afternoon|good evening|salam|assalam|aoa|kaise ho|kese ho)\b/i.test(lower) &&
    lower.length < 35
  ) {
    return {
      intent: "CASUAL_CONVERSATION",
      confidence: 0.95,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  if (
    lower.includes("who are you") ||
    lower.includes("who made you") ||
    lower.includes("who created you") ||
    lower.includes("tum kaun ho") ||
    lower.includes("ap kaun ho") ||
    lower.includes("kisne banaya") ||
    lower.includes("ceo of premiers") ||
    lower.includes("founder of premiers")
  ) {
    return {
      intent: "CASUAL_CONVERSATION",
      confidence: 0.95,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 5. TRANSLATION
  if (
    lower.includes("translate") ||
    lower.includes("tarjuma") ||
    lower.includes("translation") ||
    lower.includes("into urdu") ||
    lower.includes("mein translate") ||
    lower.includes("in english") ||
    lower.includes("into spanish") ||
    lower.includes("into french") ||
    lower.includes("into arabic")
  ) {
    return {
      intent: "TRANSLATION",
      confidence: 0.95,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 6. CURRENT INFORMATION / NEWS / WEB SEARCH
  const hasCurrentKeywords =
    lower.includes("latest") ||
    lower.includes("today") ||
    lower.includes("right now") ||
    lower.includes("breaking news") ||
    lower.includes("latest news") ||
    lower.includes("ai news") ||
    lower.includes("tech news") ||
    lower.includes("current price") ||
    lower.includes("stock price") ||
    lower.includes("gold price") ||
    lower.includes("dollar rate") ||
    lower.includes("weather in") ||
    lower.includes("who won") ||
    lower.includes("current president") ||
    lower.includes("current prime minister") ||
    lower.includes("what happened today");

  if (hasCurrentKeywords) {
    const isDeep =
      lower.includes("deep research") ||
      lower.includes("comprehensive study") ||
      lower.includes("research paper") ||
      lower.includes("exhaustive breakdown");

    return {
      intent: isDeep ? "DEEP_RESEARCH" : lower.includes("news") ? "NEWS" : "CURRENT_INFORMATION",
      confidence: 0.95,
      isVisual: false,
      requiresWebSearch: true,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 7. EDUCATION / SCIENCE / DEFINITION (Photosynthesis, HTML definition, science facts)
  const isDefinitionOrConcept =
    lower.includes("explain photosynthesis") ||
    lower.includes("photosynthesis") ||
    lower.includes("html kya hai") ||
    lower.includes("what is html") ||
    lower.includes("explain html") ||
    lower.includes("in easy words") ||
    lower.includes("simple words") ||
    lower.includes("aasan alfaz") ||
    lower.includes("how does") ||
    lower.includes("why is the sky") ||
    lower.includes("gravity kya hai") ||
    lower.includes("what is gravity") ||
    lower.includes("solar system") ||
    lower.includes("define ");

  if (isDefinitionOrConcept) {
    return {
      intent: lower.includes("photosynthesis") || lower.includes("gravity") || lower.includes("sky") ? "SCIENCE" : "EDUCATION",
      confidence: 0.95,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 8. CODING & TECHNICAL IMPLEMENTATION (Writing code, fixing code, debugging)
  const isCodingRequest =
    (/\b(code|function|react|typescript|javascript|python|sql|bug|debug|api|endpoint|component|regex|algorithm|class|method)\b/i.test(lower) &&
      (
        lower.includes("write") ||
        lower.includes("create") ||
        lower.includes("fix") ||
        lower.includes("debug") ||
        lower.includes("implement") ||
        lower.includes("how to code") ||
        lower.includes("syntax") ||
        lower.includes("karo") ||
        lower.includes("banao")
      )) ||
    lower.includes("fix this react") ||
    lower.includes("debug this") ||
    lower.includes("write a python") ||
    lower.includes("write typescript");

  if (isCodingRequest) {
    const isDebug = lower.includes("fix") || lower.includes("debug") || lower.includes("error") || lower.includes("bug");
    return {
      intent: isDebug ? "DEBUGGING" : "CODING",
      confidence: 0.95,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 9. WRITING / REWRITING / SUMMARIZATION
  if (
    lower.includes("write a message") ||
    lower.includes("birthday message") ||
    lower.includes("write a letter") ||
    lower.includes("write an email") ||
    lower.includes("write a poem") ||
    lower.includes("write a story") ||
    lower.includes("essay on") ||
    lower.includes("write a paragraph")
  ) {
    return {
      intent: "WRITING",
      confidence: 0.95,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  if (lower.includes("summarize") || lower.includes("summary") || lower.includes("khulasa")) {
    return {
      intent: "SUMMARIZATION",
      confidence: 0.92,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  if (lower.includes("rewrite") || lower.includes("rephrase") || lower.includes("paraphrase")) {
    return {
      intent: "REWRITING",
      confidence: 0.92,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 10. COMPARISON & RECOMMENDATION
  const isComparison =
    lower.includes("compare ") ||
    lower.includes("vs ") ||
    lower.includes("versus") ||
    lower.includes("difference between") ||
    lower.includes("which is better") ||
    lower.includes("muwazna") ||
    lower.includes("faraq kya hai");

  if (isComparison) {
    return {
      intent: "COMPARISON",
      confidence: 0.94,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  const isRecommendation =
    lower.includes("recommend") ||
    lower.includes("suggest") ||
    lower.includes("which one should i") ||
    lower.includes("best laptop") ||
    lower.includes("best phone") ||
    lower.includes("kon sa acha hai") ||
    lower.includes("mashwara");

  if (isRecommendation) {
    return {
      intent: "RECOMMENDATION",
      confidence: 0.93,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 11. FILE, PDF, IMAGE & DATA ANALYSIS
  if (lower.includes("pdf") || lower.includes("document analysis")) {
    return {
      intent: "PDF_ANALYSIS",
      confidence: 0.95,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  if (hasImageAttachment || lower.includes("analyze this image") || lower.includes("image analysis") || lower.includes("is photo mein kya hai")) {
    return {
      intent: "IMAGE_ANALYSIS",
      confidence: 0.95,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  if (lower.includes("csv") || lower.includes("dataset") || lower.includes("data analysis") || lower.includes("statistics of")) {
    return {
      intent: "DATA_ANALYSIS",
      confidence: 0.95,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  if (lower.includes("analyze this file") || lower.includes("file analysis")) {
    return {
      intent: "FILE_ANALYSIS",
      confidence: 0.95,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 12. BUSINESS STRATEGY & ROI
  if (
    lower.includes("business plan") ||
    lower.includes("pitch deck") ||
    lower.includes("market size") ||
    lower.includes("roi model") ||
    lower.includes("swot analysis") ||
    lower.includes("business model")
  ) {
    return {
      intent: "BUSINESS",
      confidence: 0.94,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 13. TECHNICAL SUPPORT & WEB DEVELOPMENT
  if (lower.includes("troubleshoot") || lower.includes("printer not working") || lower.includes("wifi not connecting") || lower.includes("technical issue")) {
    return {
      intent: "TECHNICAL_SUPPORT",
      confidence: 0.93,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  if (lower.includes("build a website") || lower.includes("landing page") || lower.includes("responsive design") || lower.includes("html css website")) {
    return {
      intent: "WEB_DEVELOPMENT",
      confidence: 0.93,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 14. GENERAL KNOWLEDGE / FACTUAL QUESTION (Default for countries, geography, capitals, facts)
  const isGeneralKnowledge =
    lower.includes("countries") ||
    lower.includes("duniya") ||
    lower.includes("world") ||
    lower.includes("capital") ||
    lower.includes("mulk") ||
    lower.includes("mumalik") ||
    lower.includes("population") ||
    lower.includes("currency") ||
    lower.includes("president") ||
    lower.includes("history") ||
    lower.includes("kitni") ||
    lower.includes("kitne") ||
    lower.includes("how many") ||
    lower.includes("which is");

  return {
    intent: isGeneralKnowledge ? "GENERAL_KNOWLEDGE" : "FACTUAL_QUESTION",
    confidence: 0.9,
    isVisual: false,
    requiresWebSearch: false,
    detectedLanguage: langInfo.detectedLanguage,
    languageCode: langInfo.code,
    isRTL: langInfo.isRTL,
  };
}
