/**
 * PREMIERS AI — Intent Classification & Knowledge Synthesizer
 * 
 * Classifies query intent prior to selecting a generation strategy:
 * - GENERAL_KNOWLEDGE
 * - FACTUAL_QUESTION
 * - CASUAL_CONVERSATION
 * - CURRENT_INFORMATION
 * - DEEP_RESEARCH
 * - MATH
 * - SCIENCE
 * - EDUCATION
 * - TRANSLATION
 * - WRITING
 * - CODING
 * - IMAGE_GENERATION
 * - IMAGE_EDITING
 * - LOGO_DESIGN
 * - THUMBNAIL_DESIGN
 * - POSTER_DESIGN
 * - CHARACTER_GENERATION
 * - OTHER
 */

export type UserIntent =
  | "GENERAL_KNOWLEDGE"
  | "FACTUAL_QUESTION"
  | "CASUAL_CONVERSATION"
  | "CURRENT_INFORMATION"
  | "DEEP_RESEARCH"
  | "MATH"
  | "SCIENCE"
  | "EDUCATION"
  | "TRANSLATION"
  | "WRITING"
  | "CODING"
  | "IMAGE_GENERATION"
  | "IMAGE_EDITING"
  | "LOGO_DESIGN"
  | "THUMBNAIL_DESIGN"
  | "POSTER_DESIGN"
  | "CHARACTER_GENERATION"
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
}

export function classifyUserIntent(
  text: string,
  langInfo: { detectedLanguage: string; code: string; isRTL: boolean },
  hasImageAttachment = false
): IntentClassification {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. IMAGE EDITING
  if (
    hasImageAttachment ||
    lower.includes("is image ko") ||
    lower.includes("iss image ko") ||
    lower.includes("make this image") ||
    lower.includes("edit this image") ||
    lower.includes("filter this image") ||
    lower.includes("cinematic bana") ||
    lower.includes("make it cinematic")
  ) {
    if (
      lower.includes("cinematic") ||
      lower.includes("edit") ||
      lower.includes("filter") ||
      lower.includes("enhance") ||
      lower.includes("banao") ||
      lower.includes("convert")
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
    lower.includes("badge") ||
    lower.includes("mascot");

  const isThumbnail =
    lower.includes("thumbnail") ||
    lower.includes("تھمب نیل") ||
    lower.includes("yt thumb");

  const isPoster =
    lower.includes("poster") ||
    lower.includes("flyer") ||
    lower.includes("billboard") ||
    lower.includes("پوسٹر");

  const isCharacter =
    lower.includes("character") ||
    lower.includes("anime character") ||
    lower.includes("cartoon character") ||
    lower.includes("hoodie");

  const isVisualGeneral =
    isLogo ||
    isThumbnail ||
    isPoster ||
    isCharacter ||
    lower.includes("image banao") ||
    lower.includes("image bana") ||
    lower.includes("tasveer banao") ||
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
    lower.includes("luxury product advertisement") ||
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

  // 3. MATH
  const mathRegex = /^(?:what is\s+|calculate\s+|solve\s+|kitna hota hai\s+|kitna hai\s+)?([0-9\.\s\+\-\*\/\^\(\)\%]+)\??$/i;
  const isUrduMath =
    /\b([0-9]+)\s*[\+\-\*\/]\s*([0-9]+)\s*(?:kitna|kya|equals|\=)/i.test(lower) ||
    /^[0-9\.\s\+\-\*\/\^\(\)\%\=\?]+$/.test(trimmed);

  if (isUrduMath || (mathRegex.test(trimmed) && /[\+\-\*\/]/.test(trimmed) && /[0-9]/.test(trimmed))) {
    return {
      intent: "MATH",
      confidence: 0.98,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 4. CASUAL CONVERSATION (GREETINGS & IDENTITY)
  if (
    /^(hello|hi|hey|greetings|good morning|good afternoon|good evening|salam|assalam|aOA|kaise ho|kese ho)\b/i.test(lower) &&
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
    lower.includes("founders of premiers")
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
    lower.includes("into french")
  ) {
    return {
      intent: "TRANSLATION",
      confidence: 0.92,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 6. CURRENT INFORMATION / NEWS / SEARCH
  const hasCurrentKeywords =
    lower.includes("latest") ||
    lower.includes("today") ||
    lower.includes("current price") ||
    lower.includes("stock price") ||
    lower.includes("weather in") ||
    lower.includes("who won") ||
    lower.includes("exchange rate") ||
    lower.includes("breaking news") ||
    lower.includes("latest news") ||
    lower.includes("ai news") ||
    lower.includes("current president") ||
    lower.includes("what happened today");

  if (hasCurrentKeywords) {
    const isDeep =
      lower.includes("deep research") ||
      lower.includes("comprehensive study") ||
      lower.includes("research paper") ||
      lower.includes("exhaustive breakdown");

    return {
      intent: isDeep ? "DEEP_RESEARCH" : "CURRENT_INFORMATION",
      confidence: 0.9,
      isVisual: false,
      requiresWebSearch: true,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 7. CODING & TECHNICAL
  const isCoding =
    /\b(code|function|react|typescript|javascript|python|sql|html|css|bug|debug|api|endpoint|component|regex|algorithm|class|method)\b/i.test(lower) &&
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
    );

  if (isCoding && !lower.includes("explain html") && !lower.includes("html kya hai") && !lower.includes("what is html")) {
    return {
      intent: "CODING",
      confidence: 0.9,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 8. WRITING
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
      confidence: 0.9,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 9. EDUCATION / EXPLANATION
  if (
    lower.includes("explain photosynthesis") ||
    lower.includes("how does") ||
    lower.includes("why does") ||
    lower.includes("in easy words") ||
    lower.includes("simple words") ||
    lower.includes("aasan alfaz") ||
    lower.includes("samjhao") ||
    lower.includes("wazahat")
  ) {
    return {
      intent: "EDUCATION",
      confidence: 0.9,
      isVisual: false,
      requiresWebSearch: false,
      detectedLanguage: langInfo.detectedLanguage,
      languageCode: langInfo.code,
      isRTL: langInfo.isRTL,
    };
  }

  // 10. FACTUAL QUESTION / GENERAL KNOWLEDGE (Countries, Capital, Presidents, Science, Definitions)
  return {
    intent: "FACTUAL_QUESTION",
    confidence: 0.85,
    isVisual: false,
    requiresWebSearch: false,
    detectedLanguage: langInfo.detectedLanguage,
    languageCode: langInfo.code,
    isRTL: langInfo.isRTL,
  };
}
