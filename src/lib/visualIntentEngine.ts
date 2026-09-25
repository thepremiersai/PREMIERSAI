/**
 * PREMIERS AI — ADVANCED VISUAL INTENT & PROFESSIONAL DESIGN INTELLIGENCE ENGINE
 * 
 * Pipeline:
 * USER REQUEST
 *   ↓
 * NATURAL LANGUAGE INTENT & STYLE DETECTION (Multilingual: English, Roman Urdu, Urdu, Arabic, Hindi)
 *   ↓
 * DESIGN CATEGORY & CONCEPT SELECTION (Logos, Wordmarks, Monograms, Badges, Mascots, App Icons, Thumbnails, Posters, Photography)
 *   ↓
 * STYLE IDENTIFIER ("professional", "luxury", "gaming", "modern", "minimal", "realistic", "cinematic", "cartoon", "futuristic", "vintage", "corporate", "playful", "dramatic")
 *   ↓
 * TYPOGRAPHY INTELLIGENCE (Geometric sans, Modern sans, Serif, Display, Condensed, Handwritten, Futuristic, Luxury, Gaming, Playful)
 *   ↓
 * BRAND / SUBJECT PRESERVATION (Never confuses "naming", "naam", "logo" with brand)
 *   ↓
 * MINI BRAND BRIEF GENERATION & MULTI-CONCEPT SYNTHESIS
 *   ↓
 * GENUINE VECTOR SVG & TRANSPARENT PNG PRODUCTION
 */

export interface ColorPalette {
  name: string;
  primary: string;
  accent: string;
  bg1: string;
  bg2: string;
  text: string;
  muted: string;
  isTransparent?: boolean;
  isLightMode?: boolean;
}

export type LogoConceptId =
  | "emblem"
  | "monogram"
  | "wordmark"
  | "lettermark"
  | "combination"
  | "badge"
  | "mascot"
  | "abstract_mark"
  | "minimal_symbol"
  | "app_icon";

export type DesignStyleId =
  | "professional"
  | "luxury"
  | "gaming"
  | "modern"
  | "minimal"
  | "realistic"
  | "cinematic"
  | "cartoon"
  | "futuristic"
  | "premium"
  | "vintage"
  | "corporate"
  | "colorful"
  | "dark"
  | "elegant"
  | "playful"
  | "dramatic";

export type TypographyStyleId =
  | "geometric_sans"
  | "modern_sans"
  | "humanist_sans"
  | "serif"
  | "display"
  | "condensed"
  | "bold_display"
  | "handwritten"
  | "script"
  | "editorial"
  | "futuristic"
  | "technical"
  | "luxury"
  | "gaming"
  | "playful";

export interface LogoConcept {
  id: LogoConceptId;
  title: string;
  badgeLabel: string;
  description: string;
  symbolDescription: string;
  typographyStyle: string;
  composition: string;
  recommendedCategory: string;
}

export interface MiniBrandBrief {
  brandName: string;
  initials: string;
  industry: string;
  category: "gaming" | "automotive" | "tech" | "luxury" | "creator" | "corporate" | "medical" | "fitness" | "crypto" | "food" | "general";
  style: DesignStyleId;
  typography: TypographyStyleId;
  targetAudience: string;
  brandPersonality: string;
  visualIdentity: string;
  symbolism: string;
  iconConcept: string;
  typographyDirection: string;
  colorDirection: string;
  composition: string;
  scalability: string;
  usageContext: string;
  visualHierarchy: string;
}

export interface VisualIntentResult {
  isVisualRequest: boolean;
  designType:
    | "logo"
    | "wordmark"
    | "lettermark"
    | "monogram"
    | "emblem"
    | "badge"
    | "mascot"
    | "icon"
    | "app_icon"
    | "favicon"
    | "thumbnail"
    | "banner"
    | "poster"
    | "flyer"
    | "billboard"
    | "social_post"
    | "social_story"
    | "product_photo"
    | "infographic"
    | "character"
    | "landscape"
    | "sci_fi"
    | "fantasy"
    | "architecture"
    | "portrait"
    | "abstract"
    | "pattern"
    | "diagram"
    | "image";
  brandName: string;
  initials: string;
  industry: string;
  category: "gaming" | "automotive" | "tech" | "luxury" | "creator" | "corporate" | "medical" | "fitness" | "crypto" | "food" | "general";
  style: DesignStyleId;
  typography: TypographyStyleId;
  selectedConceptId: LogoConceptId;
  purpose: string;
  theme: string;
  palette: ColorPalette;
  concepts: LogoConcept[];
  brief: MiniBrandBrief;
  promptDescription: string;
  transparentSupported: boolean;
}

// -------------------------------------------------------------
// 1. Natural Language Intent & Entity Extraction
// -------------------------------------------------------------

export function extractAccurateBrandName(rawText: string, detectedCategory: string): { brandName: string; initials: string } {
  const trimmed = rawText.trim();

  // Pattern 1: Quoted names: "YASIR FF" or 'Zaid Motors'
  const quoted = trimmed.match(/["'“]([^"'”]+)["'”]/);
  if (quoted && quoted[1].trim()) {
    const candidate = cleanExtractedCandidate(quoted[1].trim());
    if (candidate) return { brandName: candidate, initials: deriveInitials(candidate) };
  }

  // Pattern 2: Explicit "naming / name" indicators (English & Roman Urdu)
  const namingRegex = /\b(?:naming|named|name is|name:)\s*[:=\-]?\s*([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})/i;
  const namingMatch = trimmed.match(namingRegex);
  if (namingMatch && namingMatch[1].trim()) {
    const candidate = cleanExtractedCandidate(namingMatch[1].trim());
    if (candidate) return { brandName: candidate, initials: deriveInitials(candidate) };
  }

  // Pattern 3: Roman Urdu "naam" indicators
  const naamRegex = /\b(?:naam|name)\s*[:=\-]?\s*([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})/i;
  const naamMatch = trimmed.match(naamRegex);
  if (naamMatch && naamMatch[1].trim()) {
    const candidate = cleanExtractedCandidate(naamMatch[1].trim());
    if (candidate) return { brandName: candidate, initials: deriveInitials(candidate) };
  }

  // Pattern 4: "ke naam ka" in Roman Urdu: e.g. "YASIR FF ke naam ka logo"
  const keNaamMatch = trimmed.match(/([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})\s+ke\s+naam\s+(?:ka|se|ki)\b/i);
  if (keNaamMatch && keNaamMatch[1].trim()) {
    const candidate = cleanExtractedCandidate(keNaamMatch[1].trim());
    if (candidate) return { brandName: candidate, initials: deriveInitials(candidate) };
  }

  // Pattern 5: "Brand name X hai" or "Brand name is X"
  const brandNameMatch = trimmed.match(/\bbrand(?:\s+name)?\s*[:=\-]?\s*([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})\s*(?:hai|is|hoga|rakho)?/i);
  if (brandNameMatch && brandNameMatch[1].trim()) {
    const candidate = cleanExtractedCandidate(brandNameMatch[1].trim());
    if (candidate) return { brandName: candidate, initials: deriveInitials(candidate) };
  }

  // Pattern 6: "called X" or "for X"
  const calledMatch = trimmed.match(/\b(?:called|entitled|branded as)\s+([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})/i);
  if (calledMatch && calledMatch[1].trim()) {
    const candidate = cleanExtractedCandidate(calledMatch[1].trim());
    if (candidate) return { brandName: candidate, initials: deriveInitials(candidate) };
  }

  // Pattern 7: "for my YouTube channel X" / "for channel X" / "for X"
  const forMatch = trimmed.match(/\bfor\s+(?:my\s+)?(?:youtube\s+channel|channel|clan|team|startup|business|company|firm|app|brand|restaurant|game)?\s*([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})/i);
  if (forMatch && forMatch[1].trim()) {
    const candidate = cleanExtractedCandidate(forMatch[1].trim());
    if (candidate) return { brandName: candidate, initials: deriveInitials(candidate) };
  }

  // Pattern 7b: "about X" / "on X" / "topic X" (e.g. "about AI revolution" or "on futuristic city")
  const aboutMatch = trimmed.match(/\b(?:about|titled|topic|on|concept)\s+([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})/i);
  if (aboutMatch && aboutMatch[1].trim()) {
    const candidate = cleanExtractedCandidate(aboutMatch[1].trim());
    if (candidate) return { brandName: candidate, initials: deriveInitials(candidate) };
  }

  // Pattern 8: Roman Urdu "<Name> ka logo banao" or "<Name> logo chahiye"
  const kaLogoMatch = trimmed.match(/([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})\s+(?:ka|ki|ke)\s+(?:logo|thumbnail|poster)\b/i);
  if (kaLogoMatch && kaLogoMatch[1].trim()) {
    const candidate = cleanExtractedCandidate(kaLogoMatch[1].trim());
    if (candidate) return { brandName: candidate, initials: deriveInitials(candidate) };
  }

  // Pattern 9: Fallback extraction by stripping command verbs & grammar
  const stripped = trimmed
    .replace(/\b(create|make|generate|design|build|render|draw|produce)\b/gi, "")
    .replace(/\b(a|an|the|my|our|with|using|in|of|on|at|and|please|plz)\b/gi, "")
    .replace(/\b(banao|bana do|bana dein|chahiye|karo|kar do|hoga|hai|rakho|dikhayein|dein)\b/gi, "")
    .replace(/\b(ka|ki|ke|naam|naming|called|brand|company|logo|logos|لوگو|شعار|thumbnail|banner|poster|icon|badge|emblem)\b/gi, "")
    .replace(/\b(professional|gaming|luxury|modern|minimalist|minimal|vector|esports|youtube|channel|wordmark|mascot)\b/gi, "")
    .replace(/[,;:.!?\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (stripped.length >= 2) {
    const candidate = cleanExtractedCandidate(stripped);
    if (candidate) return { brandName: candidate, initials: deriveInitials(candidate) };
  }

  // Category & domain-specific smart defaults
  const lowerTrimmed = trimmed.toLowerCase();
  let fallbackName = "PREMIERS AI";
  if (lowerTrimmed.includes("perfume") || lowerTrimmed.includes("fragrance")) fallbackName = "ÉCLAT ROYALE";
  else if (lowerTrimmed.includes("restaurant") || lowerTrimmed.includes("bistro") || lowerTrimmed.includes("cafe")) fallbackName = "L'OSTERIA BISTRO";
  else if (lowerTrimmed.includes("hoodie") || (lowerTrimmed.includes("character") && lowerTrimmed.includes("black"))) fallbackName = "SHADOW CYPHER";
  else if (lowerTrimmed.includes("futuristic city") || lowerTrimmed.includes("cyberpunk city") || lowerTrimmed.includes("city")) fallbackName = "NEO TOKYO 2099";
  else if (lowerTrimmed.includes("ai revolution")) fallbackName = "AI REVOLUTION";
  else if (lowerTrimmed.includes("website hero") || lowerTrimmed.includes("hero image") || lowerTrimmed.includes("hero graphic")) fallbackName = "NEXUS INTELLIGENCE";
  else if (detectedCategory === "gaming") fallbackName = "APEX ESPORTS";
  else if (detectedCategory === "automotive") fallbackName = "ZAID MOTORS";
  else if (detectedCategory === "luxury") fallbackName = "MAISON NOIR";
  else if (detectedCategory === "tech") fallbackName = "NEXUS TECH";
  else if (detectedCategory === "creator") fallbackName = "CREATOR STUDIO";

  return { brandName: fallbackName, initials: deriveInitials(fallbackName) };
}

export function deriveInitials(brandName: string): string {
  if (!brandName) return "P";
  const words = brandName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  if (words.length === 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return (words[0][0] + words[1][0] + (words[2] ? words[2][0] : "")).toUpperCase();
}

function cleanExtractedCandidate(str: string): string | null {
  if (!str) return null;

  let clean = str
    .replace(/[.,:;!?]+$/, "")
    .replace(/\b(hai|hoga|rakho|ka|ki|ke|plz|please|banao|chahiye|do)\b$/gi, "")
    .trim();

  const blacklisted = new Set([
    "naming", "name", "naam", "logo", "logos", "image", "banao", "chahiye",
    "create", "make", "design", "professional", "gaming", "luxury", "brand",
    "minimal", "modern", "wordmark", "thumbnail", "poster", "banner"
  ]);
  if (blacklisted.has(clean.toLowerCase())) return null;

  const tokens = clean.split(/\s+/);
  const formatted = tokens
    .map((t) => {
      if (/^(ff|ai|gt|yt|pro|vip|pc|tv|vr|3d|4k|hq|app|ui)$/i.test(t)) {
        return t.toUpperCase();
      }
      if (t === t.toUpperCase() && t.length > 1) {
        return t;
      }
      return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    })
    .join(" ");

  return formatted.length >= 2 ? formatted : null;
}

// -------------------------------------------------------------
// 2. Automatic Design Style & Typography Detection
// -------------------------------------------------------------

export function detectDesignStyle(text: string, category: string): DesignStyleId {
  const lower = text.toLowerCase();

  if (lower.includes("minimal") || lower.includes("simple") || lower.includes("clean") || lower.includes("flat") || lower.includes("swiss")) {
    return "minimal";
  }
  if (lower.includes("luxury") || lower.includes("premium") || lower.includes("royal") || lower.includes("gold") || lower.includes("heritage") || lower.includes("expensive")) {
    return "luxury";
  }
  if (lower.includes("gaming") || lower.includes("esports") || lower.includes("free fire") || lower.includes("ff") || lower.includes("aggressive") || lower.includes("battle")) {
    return "gaming";
  }
  if (lower.includes("vintage") || lower.includes("retro") || lower.includes("classic") || lower.includes("antique") || lower.includes("heritage") || lower.includes("badge")) {
    return "vintage";
  }
  if (lower.includes("playful") || lower.includes("cartoon") || lower.includes("cute") || lower.includes("fun") || lower.includes("kid") || lower.includes("bubbly")) {
    return "playful";
  }
  if (lower.includes("futuristic") || lower.includes("cyber") || lower.includes("sci-fi") || lower.includes("scifi") || lower.includes("ai") || lower.includes("hologram") || lower.includes("neon")) {
    return "futuristic";
  }
  if (lower.includes("cinematic") || lower.includes("dramatic") || lower.includes("movie") || lower.includes("epic") || lower.includes("moody")) {
    return "cinematic";
  }
  if (lower.includes("realistic") || lower.includes("photorealistic") || lower.includes("photo") || lower.includes("photography") || lower.includes("studio")) {
    return "realistic";
  }
  if (lower.includes("corporate") || lower.includes("enterprise") || lower.includes("business") || lower.includes("company") || lower.includes("formal")) {
    return "corporate";
  }
  if (lower.includes("colorful") || lower.includes("vibrant") || lower.includes("rainbow") || lower.includes("gradient")) {
    return "colorful";
  }
  if (lower.includes("dark") || lower.includes("black") || lower.includes("monochrome") || lower.includes("noir") || lower.includes("shadow")) {
    return "dark";
  }
  if (lower.includes("elegant") || lower.includes("graceful") || lower.includes("refined") || lower.includes("bespoke")) {
    return "elegant";
  }

  // Category fallback
  if (category === "gaming") return "gaming";
  if (category === "luxury") return "luxury";
  if (category === "tech") return "futuristic";
  return "modern";
}

export function detectTypographyStyle(text: string, style: DesignStyleId): TypographyStyleId {
  const lower = text.toLowerCase();

  if (lower.includes("serif") && !lower.includes("sans-serif") && !lower.includes("sans serif")) {
    return "serif";
  }
  if (lower.includes("geometric") || lower.includes("futura")) {
    return "geometric_sans";
  }
  if (lower.includes("condensed") || lower.includes("tall")) {
    return "condensed";
  }
  if (lower.includes("bold") || lower.includes("heavy") || lower.includes("impact")) {
    return "bold_display";
  }
  if (lower.includes("handwritten") || lower.includes("script") || lower.includes("signature") || lower.includes("cursive")) {
    return "script";
  }
  if (lower.includes("editorial") || lower.includes("vogue") || lower.includes("didot")) {
    return "editorial";
  }
  if (lower.includes("mono") || lower.includes("technical") || lower.includes("code")) {
    return "technical";
  }

  // Style fallbacks
  if (style === "luxury" || style === "elegant") return "serif";
  if (style === "gaming") return "gaming";
  if (style === "futuristic") return "futuristic";
  if (style === "minimal") return "geometric_sans";
  if (style === "playful" || style === "cartoon") return "playful";
  if (style === "corporate") return "modern_sans";

  return "modern_sans";
}

// -------------------------------------------------------------
// 3. Color Direction & Palette Intelligence
// -------------------------------------------------------------

export function extractColorPalette(text: string, category: string, style: DesignStyleId): ColorPalette {
  const lower = text.toLowerCase();

  // Explicit user color specifications
  if ((lower.includes("red") && lower.includes("black")) || lower.includes("crimson")) {
    return {
      name: "Competitive Crimson & Titanium Obsidian",
      primary: "#ef4444",
      accent: "#ffaa00",
      bg1: "#0b0506",
      bg2: "#1c0a0c",
      text: "#ffffff",
      muted: "#fda4af",
    };
  }

  if (lower.includes("gold") || lower.includes("luxury") || style === "luxury") {
    return {
      name: "Bespoke Venetian Gold & Pure Champagne",
      primary: "#e2b144",
      accent: "#f5d061",
      bg1: "#08080a",
      bg2: "#18181c",
      text: "#fafafa",
      muted: "#d4af37",
    };
  }

  if (style === "minimal" && (lower.includes("white") || lower.includes("light"))) {
    return {
      name: "Architectural Pure White & Swiss Noir",
      primary: "#09090b",
      accent: "#2563eb",
      bg1: "#ffffff",
      bg2: "#f4f4f5",
      text: "#09090b",
      muted: "#71717a",
      isLightMode: true,
    };
  }

  if (lower.includes("cyan") || lower.includes("blue") || lower.includes("neon")) {
    return {
      name: "Electric Cyan & Glacier White",
      primary: "#00e5ff",
      accent: "#38bdf8",
      bg1: "#030a14",
      bg2: "#07162c",
      text: "#ffffff",
      muted: "#7dd3fc",
    };
  }

  if (lower.includes("purple") || lower.includes("violet") || lower.includes("magenta") || style === "futuristic") {
    return {
      name: "Cyber Violet & Synthwave Pink",
      primary: "#a855f7",
      accent: "#ec4899",
      bg1: "#0c0617",
      bg2: "#1e0e38",
      text: "#ffffff",
      muted: "#d8b4fe",
    };
  }

  if (style === "vintage") {
    return {
      name: "Heritage Rust & Aged Parchment",
      primary: "#b45309",
      accent: "#d97706",
      bg1: "#140e0a",
      bg2: "#261a12",
      text: "#fef3c7",
      muted: "#fde68a",
    };
  }

  if (style === "playful") {
    return {
      name: "Pop Coral & Electric Sunburst",
      primary: "#ff5964",
      accent: "#fec601",
      bg1: "#0e0d16",
      bg2: "#1f1b32",
      text: "#ffffff",
      muted: "#f9a8d4",
    };
  }

  if (category === "gaming") {
    return {
      name: "Competitive Esports Fire & Ember",
      primary: "#ff5500",
      accent: "#ffaa00",
      bg1: "#100404",
      bg2: "#220808",
      text: "#ffffff",
      muted: "#ffcc80",
    };
  }

  if (category === "tech") {
    return {
      name: "Precision Emerald Teal & Deep Titanium",
      primary: "#00d4a0",
      accent: "#00b8d4",
      bg1: "#05080b",
      bg2: "#0c151c",
      text: "#f0f0f5",
      muted: "#94a3b8",
    };
  }

  return {
    name: "Modern Precision Sapphire & Pure Platinum",
    primary: "#00d4a0",
    accent: "#38bdf8",
    bg1: "#06090e",
    bg2: "#0f1722",
    text: "#f8fafc",
    muted: "#94a3b8",
  };
}

// -------------------------------------------------------------
// 4. Category & Industry Detection
// -------------------------------------------------------------

export function detectCategory(text: string): {
  category: VisualIntentResult["category"];
  industry: string;
  theme: string;
} {
  const lower = text.toLowerCase();

  if (
    /\bff\b/i.test(lower) ||
    lower.includes("free fire") ||
    lower.includes("freefire") ||
    lower.includes("gaming") ||
    lower.includes("esports") ||
    lower.includes("clan") ||
    lower.includes("streamer") ||
    lower.includes("gamer") ||
    lower.includes("battle royale") ||
    lower.includes("pubg") ||
    lower.includes("tournament")
  ) {
    return {
      category: "gaming",
      industry: "Gaming & Competitive Esports",
      theme: "free_fire",
    };
  }

  if (
    lower.includes("motor") ||
    lower.includes("motors") ||
    lower.includes("automotive") ||
    lower.includes("car") ||
    lower.includes("supercar") ||
    lower.includes("garage") ||
    lower.includes("racing") ||
    lower.includes("speed")
  ) {
    return {
      category: "automotive",
      industry: "Automotive & High-Performance Engineering",
      theme: "car",
    };
  }

  if (
    lower.includes("youtube") ||
    lower.includes("channel") ||
    lower.includes("vlog") ||
    lower.includes("podcast") ||
    lower.includes("creator") ||
    lower.includes("thumbnail") ||
    lower.includes("yt")
  ) {
    return {
      category: "creator",
      industry: "Digital Media & Content Creator Studio",
      theme: "youtube",
    };
  }

  if (
    lower.includes("luxury") ||
    lower.includes("royal") ||
    lower.includes("jewelry") ||
    lower.includes("gold") ||
    lower.includes("estate") ||
    lower.includes("haute") ||
    lower.includes("prestige") ||
    lower.includes("perfume")
  ) {
    return {
      category: "luxury",
      industry: "Luxury Goods & Bespoke Heritage",
      theme: "luxury",
    };
  }

  if (
    lower.includes("tech") ||
    lower.includes("software") ||
    lower.includes("ai") ||
    lower.includes("robotics") ||
    lower.includes("cloud") ||
    lower.includes("code") ||
    lower.includes("quantum") ||
    lower.includes("app") ||
    lower.includes("saas")
  ) {
    return {
      category: "tech",
      industry: "Technology & Artificial Intelligence",
      theme: "tech",
    };
  }

  if (
    lower.includes("medical") ||
    lower.includes("doctor") ||
    lower.includes("clinic") ||
    lower.includes("health") ||
    lower.includes("hospital") ||
    lower.includes("dental")
  ) {
    return {
      category: "medical",
      industry: "Healthcare & Biomedical Sciences",
      theme: "medical",
    };
  }

  if (
    lower.includes("fitness") ||
    lower.includes("gym") ||
    lower.includes("workout") ||
    lower.includes("crossfit") ||
    lower.includes("athletics")
  ) {
    return {
      category: "fitness",
      industry: "Athletics & Physical Performance",
      theme: "fitness",
    };
  }

  if (
    lower.includes("crypto") ||
    lower.includes("bitcoin") ||
    lower.includes("blockchain") ||
    lower.includes("web3") ||
    lower.includes("nft")
  ) {
    return {
      category: "crypto",
      industry: "Blockchain & Decentralized Finance",
      theme: "crypto",
    };
  }

  return {
    category: "corporate",
    industry: "Enterprise & Modern Business",
    theme: "company_logo",
  };
}

// -------------------------------------------------------------
// 5. Universal Concept Direction Generator (10 Comprehensive Concepts)
// -------------------------------------------------------------

export function generateConceptDirections(
  brandName: string,
  initials: string,
  category: string,
  style: DesignStyleId,
  typography: TypographyStyleId
): LogoConcept[] {
  const isGaming = category === "gaming" || style === "gaming";
  const isLuxury = category === "luxury" || style === "luxury";

  return [
    {
      id: "wordmark",
      title: "Concept 1: Bespoke Typographic Wordmark",
      badgeLabel: "Wordmark",
      description: `Pure, award-winning typographic signature for "${brandName}" with customized letterform geometry, optical balance, and subtle ligatures.`,
      symbolDescription: "Direct typographic mastery with precision kerning and custom character terminals.",
      typographyStyle: isLuxury ? "Roman high-contrast serif with refined hairlines" : "Clean geometric sans with wide optical tracking",
      composition: "Balanced horizontal signature with optional modern baseline accent",
      recommendedCategory: "Modern tech, luxury fashion, corporate branding",
    },
    {
      id: "minimal_symbol",
      title: "Concept 2: Swiss Bauhaus Minimalist Mark",
      badgeLabel: "Minimal Symbol",
      description: "Ultra-reduced flat geometric vector mark passing all optical recognition tests from 16px to stadium billboards.",
      symbolDescription: "Harmonic golden-ratio geometry (delta / interlocking loop / circle intersection).",
      typographyStyle: "Ultra-clean grotesque sans serif with 0.1em tracking",
      composition: "Isolated vector glyph with centered wordmark underneath",
      recommendedCategory: "Modern startups, digital products, high-end design",
    },
    {
      id: "monogram",
      title: `Concept 3: Interlocking Monogram (${initials})`,
      badgeLabel: "Monogram",
      description: `Precision-crafted dual-character monogram ligature fusing "${initials}" into an iconic, memorable profile avatar.`,
      symbolDescription: `Faceted vector monogram "${initials}" with diamond cuts and specular rim highlights.`,
      typographyStyle: "Futuristic wide-tracking sans serif",
      composition: "Dominant monogram glyph centered above brand typography",
      recommendedCategory: "App avatars, fashion marques, personal branding",
    },
    {
      id: "lettermark",
      title: `Concept 4: Negative-Space Lettermark`,
      badgeLabel: "Lettermark",
      description: `Single or dual initial geometric mark utilizing negative space illusion for instant memorability.`,
      symbolDescription: `Clever silhouette featuring the letter "${initials.charAt(0)}" with embedded optical arrows or nodes.`,
      typographyStyle: "Semi-bold modern sans with proportional spacing",
      composition: "Square lettermark lockup with clean brand nameplate",
      recommendedCategory: "Fintech, software, enterprise identity",
    },
    {
      id: "combination",
      title: "Concept 5: Modern Combination Mark",
      badgeLabel: "Combination Mark",
      description: "Harmonious balance of an iconic vector symbol paired with ultra-clean horizontal brand typography.",
      symbolDescription: "Geometric kinetic prism representing intelligence, growth, and forward momentum.",
      typographyStyle: "High-contrast bold modern sans serif",
      composition: "Symbol to left or stacked above pristine brand wordmark",
      recommendedCategory: "All-purpose flagship brand identities",
    },
    {
      id: "emblem",
      title: isGaming ? "Concept 6: Battle-Tested Tournament Crest" : "Concept 6: Heritage Architectural Emblem",
      badgeLabel: "Emblem Crest",
      description: isGaming
        ? "Aggressive geometric battle shield with cyber-armor visor, dynamic horns, and 3D extruded metallic lettering."
        : "Reinforced geometric crest symbolizing structural stability, trustworthiness, and prestige.",
      symbolDescription: isGaming
        ? `Warrior shield housing cyber-samurai mask with glowing cyan eyes tailored for "${brandName}".`
        : "Symmetrical shield flanked by precision geometric facets.",
      typographyStyle: isGaming ? "900 Heavyweight custom esports display lettering" : "Classical grotesque display typeface",
      composition: "Enclosed crest with embedded or curving banner typography",
      recommendedCategory: "Gaming clans, sports franchises, luxury marques",
    },
    {
      id: "badge",
      title: "Concept 7: Insignia Seal Badge",
      badgeLabel: "Insignia Badge",
      description: "Circular or hexagonal verified seal badge with perimeter micrometric dashes, stars, and established label.",
      symbolDescription: "Concentric precision rings with internal focal glyph.",
      typographyStyle: "Curved or centered industrial badge typeface",
      composition: "Self-contained circular or hexagonal insignia badge",
      recommendedCategory: "Heritage brands, coffee shops, clubs, certifications",
    },
    {
      id: "mascot",
      title: "Concept 8: Expressive Character Mascot",
      badgeLabel: "Mascot Mark",
      description: "Dynamic stylized mascot face (warrior / panther / wolf / falcon / android) with bold vector linework and intense eye lighting.",
      symbolDescription: "High-impact mascot head with aggressive or friendly silhouette.",
      typographyStyle: "Punchy heavyweight stencil or display sans",
      composition: "Frontal mascot portrait with ribbon text below",
      recommendedCategory: "Esports, gaming streamers, lifestyle brands, sports",
    },
    {
      id: "abstract_mark",
      title: "Concept 9: Kinetic Abstract Node",
      badgeLabel: "Abstract Mark",
      description: "Futuristic multi-dimensional vector node representing decentralized networks, neural intelligence, and fluid dynamics.",
      symbolDescription: "Prismatic overlapping transparent vector ribbons with gradient glow.",
      typographyStyle: "Futuristic modern sans serif with 0.15em letter-spacing",
      composition: "Floating kinetic abstract node beside crisp wordmark",
      recommendedCategory: "AI platforms, Web3 protocols, biotech, creative agencies",
    },
    {
      id: "app_icon",
      title: "Concept 10: Glassmorphic App Store Icon",
      badgeLabel: "App Store Icon",
      description: "Apple / Android continuous-radius squircle with frosted glass depth, 3D embossed glyph, and specular rim reflection.",
      symbolDescription: "Beveled squircle with ambient inner shadow and floating central monogram.",
      typographyStyle: "Native iOS / Android system sans typography",
      composition: "Continuous squircle container ready for App Store & Google Play",
      recommendedCategory: "Mobile apps, SaaS platforms, Chrome extensions",
    },
  ];
}

// -------------------------------------------------------------
// 6. Mini Brand Brief Generator
// -------------------------------------------------------------

export function generateMiniBrandBrief(
  brandName: string,
  initials: string,
  category: VisualIntentResult["category"],
  industry: string,
  palette: ColorPalette,
  style: DesignStyleId,
  typography: TypographyStyleId
): MiniBrandBrief {
  const isGaming = category === "gaming" || style === "gaming";
  const isLuxury = category === "luxury" || style === "luxury";
  const isMinimal = style === "minimal";

  return {
    brandName,
    initials,
    industry,
    category,
    style,
    typography,
    targetAudience: isGaming
      ? "Competitive gamers, esports communities, Twitch & YouTube gaming fans."
      : isLuxury
      ? "Discerning high-net-worth clients, luxury collectors, design connoisseurs."
      : "Enterprises, modern consumers, tech innovators, and design-conscious audiences.",
    brandPersonality: isGaming
      ? "High-octane, fearless, competitive, tactical, and elite."
      : isLuxury
      ? "Prestigious, timeless, bespoke, refined, and exquisite."
      : isMinimal
      ? "Clean, uncluttered, focused, pure, and modern."
      : "Intelligent, reliable, forward-thinking, pristine, and sophisticated.",
    visualIdentity: isMinimal
      ? "Swiss Bauhaus minimalism emphasizing negative space, mathematical purity, and zero extraneous decorative noise."
      : isGaming
      ? "Heavyweight battle-royale identity with sharp geometry, high-contrast rim lighting, and 3D extruded typography."
      : isLuxury
      ? "High-end serif and gold-leaf visual identity featuring hairline kerning and regal architectural balance."
      : "Precision vector identity balancing geometric purity with harmonious typography and high-contrast accents.",
    symbolism: isGaming
      ? "Cyber-armor plates and glowing visor symbolize tactical mastery and unwavering focus."
      : isLuxury
      ? "Classical proportions and Roman letterforms symbolize enduring heritage and peerless craftsmanship."
      : "Interlocking delta nodes represent dynamic collaboration, stability, and technological intelligence.",
    iconConcept: isMinimal
      ? `Ultra-clean flat vector glyph derived from harmonic geometric ratios and initials "${initials}".`
      : `Harmonic vector emblem engineered specifically for "${brandName}".`,
    typographyDirection: `${typography.replace(/_/g, " ").toUpperCase()} typography with optical kerning and mathematical line-height calibration.`,
    colorDirection: `${palette.name} — calibrated for high visual impact and optical contrast across both OLED dark and pure light viewports.`,
    composition: "Balanced lockup maintaining unmistakable visual hierarchy from 16px favicons to 4K displays.",
    scalability: "Scalable vector architecture passing all optical recognition and small-scale profile benchmarks.",
    usageContext: "Digital interfaces, mobile apps, social media avatars, video overlays, and physical merchandise.",
    visualHierarchy: "1. Core Vector Mark / Glyph → 2. Primary Brand Wordmark → 3. Verified Subtitle Tagline.",
  };
}

// -------------------------------------------------------------
// 7. Master Parse Visual Intent Engine
// -------------------------------------------------------------

export function parseVisualIntent(rawText: string): VisualIntentResult | null {
  if (!rawText || !rawText.trim()) return null;
  const lower = rawText.toLowerCase();

  // Intent triggers
  const isLogoTrigger =
    lower.includes("logo") ||
    lower.includes("لوگو") ||
    lower.includes("شعار") ||
    lower.includes("emblem") ||
    lower.includes("monogram") ||
    lower.includes("mascot") ||
    lower.includes("crest") ||
    lower.includes("insignia") ||
    lower.includes("badge") ||
    lower.includes("wordmark") ||
    lower.includes("lettermark") ||
    lower.includes("app icon") ||
    lower.includes("favicon") ||
    (/\b(banao|bana do|chahiye)\b/i.test(lower) && (lower.includes("naming") || lower.includes("naam") || lower.includes("brand")));

  const isThumbnailTrigger =
    lower.includes("thumbnail") ||
    lower.includes("تھمب نیل") ||
    lower.includes("صورة مصغرة");

  const isBannerTrigger =
    lower.includes("banner") ||
    lower.includes("بینر") ||
    lower.includes("header");

  const isPosterTrigger =
    lower.includes("poster") ||
    lower.includes("flyer") ||
    lower.includes("billboard") ||
    lower.includes("پوسٹر") ||
    lower.includes("ملصق");

  const isProductPhotoTrigger =
    lower.includes("product photo") ||
    lower.includes("product photography") ||
    lower.includes("product showcase") ||
    lower.includes("commercial photo") ||
    lower.includes("e-commerce image") ||
    lower.includes("ecommerce");

  const isSocialTrigger =
    lower.includes("social post") ||
    lower.includes("instagram post") ||
    lower.includes("story") ||
    lower.includes("reel");

  const isGenericImageTrigger =
    lower.includes("wallpaper") ||
    lower.includes("tasveer") ||
    lower.includes("تصویر") ||
    lower.includes("artwork") ||
    lower.includes("drawing") ||
    lower.includes("character") ||
    lower.includes("landscape") ||
    lower.includes("portrait") ||
    lower.includes("photorealistic") ||
    lower.includes("sci-fi") ||
    lower.includes("fantasy") ||
    lower.includes("illustration") ||
    /\b(draw|sketch|paint|illustrate|visualize|render)\b/i.test(lower) ||
    /\b(create|generate|make|design)\s+(?:an?|the|some)?\s*(?:futuristic|cyberpunk|photorealistic|scenic|3d|modern|minimal|luxury)?\s*(?:image|picture|photo|wallpaper|artwork|render|visual)/i.test(lower);

  const isHeroTrigger =
    lower.includes("hero") ||
    lower.includes("website hero") ||
    lower.includes("hero image") ||
    lower.includes("hero graphic") ||
    lower.includes("website background") ||
    lower.includes("website banner");

  const isAdTrigger =
    lower.includes("advertisement") ||
    lower.includes("ad creative") ||
    lower.includes("perfume") ||
    lower.includes("product ad") ||
    lower.includes("commercial creative") ||
    lower.includes("product advertisement");

  const isCharacterTrigger =
    lower.includes("character") ||
    lower.includes("hoodie") ||
    lower.includes("cartoon") ||
    lower.includes("anime") ||
    lower.includes("mascot");

  const isSceneTrigger =
    lower.includes("city") ||
    lower.includes("futuristic city") ||
    lower.includes("cyberpunk") ||
    lower.includes("sci-fi") ||
    lower.includes("landscape") ||
    lower.includes("architecture");

  if (
    !isLogoTrigger &&
    !isThumbnailTrigger &&
    !isBannerTrigger &&
    !isPosterTrigger &&
    !isProductPhotoTrigger &&
    !isSocialTrigger &&
    !isGenericImageTrigger &&
    !isHeroTrigger &&
    !isAdTrigger &&
    !isCharacterTrigger &&
    !isSceneTrigger
  ) {
    return null;
  }

  // 1. Determine Design Type
  let designType: VisualIntentResult["designType"] = "logo";
  if (lower.includes("wordmark")) designType = "wordmark";
  else if (lower.includes("lettermark")) designType = "lettermark";
  else if (lower.includes("monogram")) designType = "monogram";
  else if (lower.includes("emblem") || lower.includes("crest")) designType = "emblem";
  else if (lower.includes("badge") || lower.includes("insignia")) designType = "badge";
  else if (lower.includes("mascot")) designType = "mascot";
  else if (lower.includes("app icon") || lower.includes("appstore")) designType = "app_icon";
  else if (lower.includes("favicon")) designType = "favicon";
  else if (isThumbnailTrigger) designType = "thumbnail";
  else if (isHeroTrigger) designType = "banner";
  else if (isBannerTrigger) designType = "banner";
  else if (isPosterTrigger || (lower.includes("restaurant") && (lower.includes("poster") || lower.includes("design")))) designType = "poster";
  else if (isAdTrigger || isProductPhotoTrigger) designType = "product_photo";
  else if (isSocialTrigger) designType = "social_post";
  else if (isCharacterTrigger && !isLogoTrigger) designType = "character";
  else if (lower.includes("landscape") || lower.includes("nature") || lower.includes("mountain")) designType = "landscape";
  else if (lower.includes("architecture") || lower.includes("building") || lower.includes("villa")) designType = "architecture";
  else if (isGenericImageTrigger && !isLogoTrigger) designType = "image";

  // 2. Detect Category & Industry
  const { category, industry, theme } = detectCategory(rawText);

  // 3. Detect Style & Typography
  const style = detectDesignStyle(rawText, category);
  const typography = detectTypographyStyle(rawText, style);

  // 4. Extract Exact Brand Name & Initials
  const { brandName, initials } = extractAccurateBrandName(rawText, category);

  // 5. Extract Palette
  const palette = extractColorPalette(rawText, category, style);

  // 6. Generate 10 Comprehensive Concept Directions
  const concepts = generateConceptDirections(brandName, initials, category, style, typography);

  // 7. Select appropriate default concept
  let selectedConceptId: LogoConceptId = "emblem";
  if (designType === "wordmark") selectedConceptId = "wordmark";
  else if (designType === "lettermark") selectedConceptId = "lettermark";
  else if (designType === "monogram") selectedConceptId = "monogram";
  else if (designType === "badge") selectedConceptId = "badge";
  else if (designType === "mascot") selectedConceptId = "mascot";
  else if (designType === "app_icon" || designType === "favicon") selectedConceptId = "app_icon";
  else if (style === "minimal") selectedConceptId = "minimal_symbol";
  else if (style === "luxury") selectedConceptId = "wordmark";
  else if (style === "gaming") selectedConceptId = "emblem";
  else selectedConceptId = "combination";

  // 8. Generate Mini Brand Brief
  const brief = generateMiniBrandBrief(brandName, initials, category, industry, palette, style, typography);

  const promptDescription = `Professional ${designType.toUpperCase()} for "${brandName}" (${industry}) with ${style.toUpperCase()} styling, ${typography.toUpperCase()} typography, and ${palette.name} palette.`;

  return {
    isVisualRequest: true,
    designType,
    brandName,
    initials,
    industry,
    category,
    style,
    typography,
    selectedConceptId,
    purpose: category === "gaming" ? "Competitive Esports & Clan Identity" : "Official Brand & Enterprise Identity",
    theme,
    palette,
    concepts,
    brief,
    promptDescription,
    transparentSupported: true,
  };
}

// -------------------------------------------------------------
// 8. Vector SVG Generator for Real Vector Export
// -------------------------------------------------------------

export function generateLogoSvg(
  brandName: string,
  initials: string,
  conceptId: LogoConceptId,
  palette: ColorPalette,
  transparentBg: boolean = false,
  style: DesignStyleId = "modern"
): string {
  const bgRect = transparentBg
    ? ""
    : `<rect width="800" height="800" rx="32" fill="url(#bgGrad)" />`;

  let symbolMarkup = "";

  if (conceptId === "wordmark") {
    symbolMarkup = `
      <!-- Pure Typographic Wordmark -->
      <g transform="translate(400, 390)" text-anchor="middle">
        <text x="0" y="0" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-weight="900" font-size="76" fill="url(#primaryGrad)" letter-spacing="4">${brandName}</text>
        <line x1="-120" y1="28" x2="120" y2="28" stroke="${palette.accent}" stroke-width="4" stroke-linecap="round" />
        <circle cx="0" cy="28" r="6" fill="${palette.primary}" />
      </g>
    `;
  } else if (conceptId === "minimal_symbol") {
    symbolMarkup = `
      <!-- Minimalist Swiss Geometric Mark -->
      <g transform="translate(400, 310)">
        <circle cx="0" cy="0" r="90" fill="none" stroke="${palette.primary}" stroke-width="8" />
        <polygon points="0,-60 52,30 -52,30" fill="url(#primaryGrad)" />
        <circle cx="0" cy="5" r="16" fill="${palette.bg1 || "#0c0a12"}" />
      </g>
    `;
  } else if (conceptId === "monogram") {
    symbolMarkup = `
      <!-- Interlocking Monogram Glyph -->
      <g transform="translate(400, 310)">
        <polygon points="0,-110 95,0 0,110 -95,0" fill="none" stroke="${palette.primary}" stroke-width="8" />
        <text x="0" y="32" text-anchor="middle" font-family="'Plus Jakarta Sans', Impact, sans-serif" font-weight="900" font-size="108" fill="url(#primaryGrad)">${initials}</text>
      </g>
    `;
  } else if (conceptId === "app_icon") {
    symbolMarkup = `
      <!-- Glassmorphic App Store Squircle -->
      <g transform="translate(260, 170)">
        <rect width="280" height="280" rx="64" fill="url(#primaryGrad)" filter="url(#glow)" />
        <rect x="12" y="12" width="256" height="256" rx="52" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="3" />
        <text x="140" y="175" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="110" fill="#ffffff">${initials}</text>
      </g>
    `;
  } else if (conceptId === "badge") {
    symbolMarkup = `
      <!-- Tournament / Heritage Seal Badge -->
      <g transform="translate(400, 310)">
        <circle cx="0" cy="0" r="110" fill="none" stroke="${palette.primary}" stroke-width="6" stroke-dasharray="8 6" />
        <circle cx="0" cy="0" r="96" fill="url(#primaryGrad)" opacity="0.15" />
        <circle cx="0" cy="0" r="96" fill="none" stroke="${palette.accent}" stroke-width="3" />
        <text x="0" y="24" text-anchor="middle" font-family="'Plus Jakarta Sans', Impact, sans-serif" font-weight="900" font-size="70" fill="url(#primaryGrad)">${initials}</text>
      </g>
    `;
  } else if (conceptId === "mascot") {
    symbolMarkup = `
      <!-- Stylized Mascot Head Silhouette -->
      <g transform="translate(400, 310)" filter="url(#glow)">
        <path d="M 0 -120 L 60 -40 L 110 -20 L 80 50 L 0 120 L -80 50 L -110 -20 L -60 -40 Z" fill="${palette.bg1 || "#110708"}" stroke="${palette.primary}" stroke-width="8" />
        <polygon points="-35,-10 -15,-15 -28,5" fill="#00ffff" />
        <polygon points="35,-10 15,-15 28,5" fill="#00ffff" />
        <path d="M 0 -60 L 25 10 L 0 45 L -25 10 Z" fill="${palette.primary}" />
      </g>
    `;
  } else if (conceptId === "abstract_mark") {
    symbolMarkup = `
      <!-- Kinetic Abstract Polyhedron Node -->
      <g transform="translate(400, 310)" filter="url(#glow)">
        <polygon points="0,-100 86,-50 86,50 0,100 -86,50 -86,-50" fill="none" stroke="${palette.primary}" stroke-width="7" />
        <line x1="0" y1="-100" x2="0" y2="100" stroke="${palette.accent}" stroke-width="3" />
        <line x1="-86" y1="-50" x2="86" y2="50" stroke="${palette.accent}" stroke-width="3" />
        <line x1="-86" y1="50" x2="86" y2="-50" stroke="${palette.accent}" stroke-width="3" />
        <circle cx="0" cy="0" r="28" fill="url(#primaryGrad)" />
      </g>
    `;
  } else {
    // Default Emblem / Combination
    symbolMarkup = `
      <!-- Precision Architectural Crest -->
      <g transform="translate(400, 310)" filter="url(#glow)">
        <polygon points="0,-120 104,-60 104,60 0,120 -104,60 -104,-60" fill="none" stroke="${palette.primary}" stroke-width="8" />
        <polygon points="0,-75 65,45 0,15 -65,45" fill="url(#primaryGrad)" />
        <circle cx="0" cy="0" r="14" fill="#ffffff" />
      </g>
    `;
  }

  const typographyY = conceptId === "wordmark" ? 520 : 560;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bg1}" />
      <stop offset="100%" stop-color="${palette.bg2}" />
    </linearGradient>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.primary}" />
      <stop offset="100%" stop-color="${palette.accent}" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  ${bgRect}

  ${symbolMarkup}

  <!-- Brand Typography -->
  <g transform="translate(400, ${typographyY})" text-anchor="middle">
    <text x="0" y="4" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="60" fill="#000000" opacity="0.6" letter-spacing="2">${brandName}</text>
    <text x="0" y="0" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="60" fill="url(#primaryGrad)" letter-spacing="2">${brandName}</text>
  </g>

  <!-- Subtitle Tagline -->
  <g transform="translate(400, ${typographyY + 54})" text-anchor="middle">
    <text x="0" y="0" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="15" fill="${palette.muted}" letter-spacing="5">
      ${style === "gaming" ? "OFFICIAL ESPORTS BRAND IDENTITY" : style === "luxury" ? "BESPOKE LUXURY IDENTITY" : "PREMIUM BRAND IDENTITY"}
    </text>
  </g>
</svg>`;
}
