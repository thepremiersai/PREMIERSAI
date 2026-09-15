import { LanguageOption } from "../types";

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "auto", name: "Auto-Detect Language", nativeName: "Auto-Detect (خودکار تشخیص)", isRTL: false, script: "latin" },
  { code: "en", name: "English", nativeName: "English", isRTL: false, script: "latin", samplePrompt: "Explain artificial intelligence simply" },
  { code: "ur", name: "Urdu", nativeName: "اردو", isRTL: true, script: "arabic", samplePrompt: "مصنوعی ذہانت کے بارے میں تفصیل سے بتائیں" },
  { code: "ur-Latn", name: "Roman Urdu", nativeName: "Roman Urdu", isRTL: false, script: "latin", samplePrompt: "Mujhe ek modern business logo ka concept bana do" },
  { code: "ar", name: "Arabic", nativeName: "العربية", isRTL: true, script: "arabic", samplePrompt: "ما هي أحدث تطورات الذكاء الاصطناعي؟" },
  { code: "fa", name: "Persian", nativeName: "فارسی", isRTL: true, script: "arabic", samplePrompt: "درباره هوش مصنوعی و کاربردهای آن توضیح دهید" },
  { code: "he", name: "Hebrew", nativeName: "עברית", isRTL: true, script: "hebrew", samplePrompt: "הסבר על בינה מלאכותית" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", isRTL: false, script: "devanagari", samplePrompt: "कृत्रिम बुद्धिमत्ता के फायदे और नुकसान बताएं" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ / پنجابی", isRTL: false, script: "gurmukhi", samplePrompt: "ਆਰਟੀਫੀਸ਼ੀਅਲ ਇੰਟੈਲੀਜੈਂਸ ਬਾਰੇ ਦੱਸੋ" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي", isRTL: true, script: "arabic", samplePrompt: "مصنوعي ذهانت جي باري ۾ ٻڌايو" },
  { code: "ps", name: "Pashto", nativeName: "پښتو", isRTL: true, script: "arabic", samplePrompt: "د مصنوعي ذهانت په اړه معلومات راکړئ" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文", isRTL: false, script: "han", samplePrompt: "请简要解释人工智能的应用前景" },
  { code: "ja", name: "Japanese", nativeName: "日本語", isRTL: false, script: "japanese", samplePrompt: "人工知能の基本概念について説明してください" },
  { code: "ko", name: "Korean", nativeName: "한국어", isRTL: false, script: "hangul", samplePrompt: "인공지능의 미래 전망을 설명해주세요" },
  { code: "fr", name: "French", nativeName: "Français", isRTL: false, script: "latin", samplePrompt: "Expliquez les principes de l'intelligence artificielle" },
  { code: "es", name: "Spanish", nativeName: "Español", isRTL: false, script: "latin", samplePrompt: "Explica la inteligencia artificial de forma sencilla" },
  { code: "de", name: "German", nativeName: "Deutsch", isRTL: false, script: "latin", samplePrompt: "Erkläre künstliche Intelligenz in einfachen Worten" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", isRTL: false, script: "latin", samplePrompt: "Yapay zeka hakkında genel bilgi ver" },
  { code: "ru", name: "Russian", nativeName: "Русский", isRTL: false, script: "cyrillic", samplePrompt: "Объясните основы искусственного интеллекта" },
  { code: "it", name: "Italian", nativeName: "Italiano", isRTL: false, script: "latin", samplePrompt: "Spiega l'intelligenza artificiale in modo semplice" },
  { code: "pt", name: "Portuguese", nativeName: "Português", isRTL: false, script: "latin", samplePrompt: "Explique a inteligência artificial de forma clara" },
];

export function isTextRTL(text: string): boolean {
  if (!text) return false;
  // Arabic, Urdu, Persian, Pashto, Sindhi, Hebrew Unicode ranges
  const rtlChars = /[\u0590-\u08FF\uFB50-\uFDFD\uFE70-\uFEFC]/;
  const ltrChars = /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590]/;

  let rtlCount = 0;
  let ltrCount = 0;

  for (let i = 0; i < Math.min(text.length, 300); i++) {
    const char = text[i];
    if (rtlChars.test(char)) rtlCount++;
    else if (ltrChars.test(char)) ltrCount++;
  }

  return rtlCount > 0 && rtlCount >= ltrCount;
}

export function detectLanguageLabel(text: string): { name: string; isRTL: boolean } {
  if (!text || !text.trim()) return { name: "English", isRTL: false };

  const isRtl = isTextRTL(text);
  if (isRtl) {
    if (/[\u0590-\u05FF]/.test(text)) return { name: "Hebrew (עברית)", isRTL: true };
    // Urdu characters like ٹ, ڈ, ڑ, ں, ے, ہ
    if (/[ٹڈڑںےہھچپژگ]/.test(text)) return { name: "Urdu (اردو)", isRTL: true };
    if (/[گچپژ]/.test(text)) return { name: "Persian (فارسی)", isRTL: true };
    return { name: "Arabic (العربية)", isRTL: true };
  }

  // Devanagari (Hindi)
  if (/[\u0900-\u097F]/.test(text)) return { name: "Hindi (हिन्दी)", isRTL: false };
  // Gurmukhi (Punjabi)
  if (/[\u0A00-\u0A7F]/.test(text)) return { name: "Punjabi (ਪੰਜਾਬੀ)", isRTL: false };
  // Korean
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(text)) return { name: "Korean (한국어)", isRTL: false };
  // Japanese
  if (/[\u3040-\u30FF]/.test(text)) return { name: "Japanese (日本語)", isRTL: false };
  // Chinese
  if (/[\u4E00-\u9FFF]/.test(text)) return { name: "Chinese (中文)", isRTL: false };
  // Cyrillic
  if (/[\u0400-\u04FF]/.test(text)) return { name: "Russian (Русский)", isRTL: false };

  // Roman Urdu words
  const lower = text.toLowerCase();
  const romanUrduTokens = ["aap", "kaise", "kese", "hain", "kya", "haal", "hai", "mujhe", "chahiye", "bana", "do", "batao", "shukriya", "mein", "main", "meri", "theek", "salam", "bohot", "acha"];
  const tokens = lower.split(/\s+/);
  const match = tokens.filter(t => romanUrduTokens.includes(t.replace(/[.,?!]/g, ""))).length;
  if (match >= 2 || (tokens.length <= 4 && match >= 1)) {
    return { name: "Roman Urdu", isRTL: false };
  }

  if (/\b(bonjour|merci|avec|comment|oui)\b/i.test(lower)) return { name: "French (Français)", isRTL: false };
  if (/\b(hola|gracias|por favor|cómo)\b/i.test(lower)) return { name: "Spanish (Español)", isRTL: false };
  if (/\b(hallo|guten|danke|bitte)\b/i.test(lower)) return { name: "German (Deutsch)", isRTL: false };
  if (/\b(merhaba|teşekkürler|lütfen)\b/i.test(lower)) return { name: "Turkish (Türkçe)", isRTL: false };

  return { name: "English", isRTL: false };
}
