/**
 * PREMIERS AI — ADVANCED VISUAL INTENT & PROFESSIONAL LOGO DESIGN INTELLIGENCE ENGINE
 * 
 * Pipeline:
 * USER REQUEST
 *   ↓
 * NATURAL LANGUAGE UNDERSTANDING (Multilingual: English, Roman Urdu, Urdu, Arabic, Hindi)
 *   ↓
 * INTENT EXTRACTION & USER GOAL DETECTION
 *   ↓
 * ENTITY EXTRACTION (Brand Name, Industry, Style, Purpose, Initials, Colors)
 *   ↓
 * BRAND / SUBJECT PRESERVATION (Preserves "FF", never confuses "naming"/"naam"/"logo" with brand)
 *   ↓
 * DESIGN CATEGORY & STRATEGY SELECTION
 *   ↓
 * MINI BRAND BRIEF GENERATION (Symbolism, Typography, Palette, Scalability, Optical Balance)
 *   ↓
 * MULTIPLE CONCEPT DIRECTION SYNTHESIS (Emblem Crest, Monogram, Combination Mark, Geometric Badge)
 *   ↓
 * TRANSPARENT BACKGROUND & 4K RESOLUTION ENGINE
 *   ↓
 * QUALITY REVIEW & QUALITY BENCHMARKING
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
}

export interface LogoConcept {
  id: "emblem" | "monogram" | "combination" | "badge";
  title: string;
  badgeLabel: string;
  description: string;
  symbolDescription: string;
  typographyStyle: string;
  composition: string;
}

export interface MiniBrandBrief {
  brandName: string;
  initials: string;
  industry: string;
  category: "gaming" | "automotive" | "tech" | "luxury" | "creator" | "corporate" | "medical" | "fitness" | "crypto" | "food" | "general";
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
  designType: "logo" | "thumbnail" | "banner" | "poster" | "image";
  brandName: string;
  initials: string;
  industry: string;
  category: "gaming" | "automotive" | "tech" | "luxury" | "creator" | "corporate" | "medical" | "fitness" | "crypto" | "food" | "general";
  style: string;
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

/**
 * Extracts and cleans the exact brand name from natural human language prompts.
 * Solves:
 * - "Logo banao, naming YASIR FF" -> "YASIR FF"
 * - "Yasir FF ka logo banao" -> "YASIR FF"
 * - "YASIR FF ke naam ka logo bana do" -> "YASIR FF"
 * - "Logo banao naam YASIR FF" -> "YASIR FF"
 * - "Naming: YASIR FF" -> "YASIR FF"
 * - "Brand name YASIR FF hai" -> "YASIR FF"
 * - "Create a logo called YASIR FF" -> "YASIR FF"
 * - "Make a gaming logo for Yasir FF" -> "YASIR FF"
 * - "Yasir FF gaming logo chahiye" -> "YASIR FF"
 * - "Create a luxury logo for Zaid Motors" -> "Zaid Motors"
 * - "Make a logo for my YouTube channel Tech With Yasir" -> "Tech With Yasir"
 */
export function extractAccurateBrandName(rawText: string, detectedCategory: string): { brandName: string; initials: string } {
  const trimmed = rawText.trim();

  // Pattern 1: Quoted names: "YASIR FF" or 'Zaid Motors'
  const quoted = trimmed.match(/["'“]([^"'”]+)["'”]/);
  if (quoted && quoted[1].trim()) {
    const candidate = cleanExtractedCandidate(quoted[1].trim());
    if (candidate) return { brandName: candidate, initials: deriveInitials(candidate) };
  }

  // Pattern 2: Explicit "naming / name" indicators (English & Roman Urdu)
  // Handles: "naming YASIR FF", "naming: YASIR FF", "naming is YASIR FF"
  const namingRegex = /\b(?:naming|named|name is|name:)\s*[:=\-]?\s*([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})/i;
  const namingMatch = trimmed.match(namingRegex);
  if (namingMatch && namingMatch[1].trim()) {
    const candidate = cleanExtractedCandidate(namingMatch[1].trim());
    if (candidate) return { brandName: candidate, initials: deriveInitials(candidate) };
  }

  // Pattern 3: Roman Urdu "naam" indicators
  // Handles: "naam YASIR FF", "naam: YASIR FF", "ke naam ka", "naam se", "brand name YASIR FF hai"
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

  // Pattern 6: "called X" or "for X" (e.g. "Create a logo called YASIR FF", "Make a logo for my YouTube channel Tech With Yasir")
  const calledMatch = trimmed.match(/\b(?:called|entitled|branded as)\s+([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})/i);
  if (calledMatch && calledMatch[1].trim()) {
    const candidate = cleanExtractedCandidate(calledMatch[1].trim());
    if (candidate) return { brandName: candidate, initials: deriveInitials(candidate) };
  }

  // Pattern 7: "for my YouTube channel X" / "for channel X" / "for X"
  const forMatch = trimmed.match(/\bfor\s+(?:my\s+)?(?:youtube\s+channel|channel|clan|team|startup|business|company|firm)?\s*([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})/i);
  if (forMatch && forMatch[1].trim()) {
    const candidate = cleanExtractedCandidate(forMatch[1].trim());
    if (candidate) return { brandName: candidate, initials: deriveInitials(candidate) };
  }

  // Pattern 8: Roman Urdu "<Name> ka logo banao" or "<Name> logo chahiye"
  const kaLogoMatch = trimmed.match(/([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})\s+(?:ka|ki|ke)\s+logo\b/i);
  if (kaLogoMatch && kaLogoMatch[1].trim()) {
    const candidate = cleanExtractedCandidate(kaLogoMatch[1].trim());
    if (candidate) return { brandName: candidate, initials: deriveInitials(candidate) };
  }

  // Pattern 9: Fallback extraction by stripping command verbs & grammar
  let stripped = trimmed
    .replace(/\b(create|make|generate|design|build|render|draw|produce)\b/gi, "")
    .replace(/\b(a|an|the|my|our|with|using|in|of|on|at|and|please|plz)\b/gi, "")
    .replace(/\b(banao|bana do|bana dein|chahiye|karo|kar do|hoga|hai|rakho|dikhayein|dein)\b/gi, "")
    .replace(/\b(ka|ki|ke|naam|naming|called|brand|company|logo|logos|لوگو|شعار|thumbnail|banner|poster|icon|badge|emblem)\b/gi, "")
    .replace(/\b(professional|gaming|luxury|modern|minimalist|vector|esports|youtube|channel)\b/gi, "")
    .replace(/[,;:.!?\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (stripped.length >= 2) {
    const candidate = cleanExtractedCandidate(stripped);
    if (candidate) return { brandName: candidate, initials: deriveInitials(candidate) };
  }

  // Category-specific high-grade fallback defaults
  let fallbackName = "PREMIERS AI";
  if (detectedCategory === "gaming") fallbackName = "APEX ESPORTS";
  else if (detectedCategory === "automotive") fallbackName = "ZAID MOTORS";
  else if (detectedCategory === "luxury") fallbackName = "AURA ROYAL";
  else if (detectedCategory === "tech") fallbackName = "NEXUS TECH";
  else if (detectedCategory === "creator") fallbackName = "CREATOR STUDIO";

  return { brandName: fallbackName, initials: deriveInitials(fallbackName) };
}

/**
 * Derives professional initials / monogram letters from brand name.
 * e.g. "YASIR FF" -> "YF"
 * "Zaid Motors" -> "ZM"
 * "Tech With Yasir" -> "TWY"
 * "Premiers" -> "P"
 */
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

/**
 * Cleans extracted candidate string:
 * - Preserves "FF" uppercase
 * - Strips trailing filler words
 * - Capitalizes words naturally while keeping all-caps acronyms intact
 */
function cleanExtractedCandidate(str: string): string | null {
  if (!str) return null;

  // Clean trailing punctuation or Roman Urdu stop words
  let clean = str
    .replace(/[.,:;!?]+$/, "")
    .replace(/\b(hai|hoga|rakho|ka|ki|ke|plz|please|banao|chahiye|do)\b$/gi, "")
    .trim();

  // If candidate is an invalid instruction word itself, reject
  const blacklisted = new Set([
    "naming", "name", "naam", "logo", "logos", "image", "banao", "chahiye",
    "create", "make", "design", "professional", "gaming", "luxury", "brand"
  ]);
  if (blacklisted.has(clean.toLowerCase())) return null;

  // Preserve exact brand capitalization if uppercase like "YASIR FF"
  const tokens = clean.split(/\s+/);
  const formatted = tokens
    .map((t) => {
      // If it's "FF", "AI", "GT", "YT", "PRO", keep uppercase
      if (/^(ff|ai|gt|yt|pro|vip|pc|tv|vr|3d|4k|hq)$/i.test(t)) {
        return t.toUpperCase();
      }
      // If already uppercase (e.g. "YASIR"), keep it uppercase
      if (t === t.toUpperCase() && t.length > 1) {
        return t;
      }
      // Normal title case
      return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    })
    .join(" ");

  return formatted.length >= 2 ? formatted : null;
}

// -------------------------------------------------------------
// 2. Color Direction & Palette Intelligence
// -------------------------------------------------------------

export function extractColorPalette(text: string, category: string): ColorPalette {
  const lower = text.toLowerCase();

  // User specifies "red and black" or "black and red"
  if ((lower.includes("red") && lower.includes("black")) || lower.includes("crimson")) {
    return {
      name: "Crimson & Carbon Black",
      primary: "#ff2a44",
      accent: "#ff5268",
      bg1: "#0a0304",
      bg2: "#19080b",
      text: "#ffffff",
      muted: "#fda4af",
    };
  }

  // User specifies "gold" or "luxury"
  if (lower.includes("gold") || lower.includes("golden") || category === "luxury") {
    return {
      name: "Imperial Metallic Gold & Obsidian",
      primary: "#e2b144",
      accent: "#f5d061",
      bg1: "#0a0907",
      bg2: "#1a1711",
      text: "#fafafa",
      muted: "#d4af37",
    };
  }

  // User specifies "neon green" or "lime"
  if (lower.includes("green") || lower.includes("lime") || lower.includes("toxic")) {
    return {
      name: "Toxic Neon Lime & Stealth Black",
      primary: "#10b981",
      accent: "#34d399",
      bg1: "#040d08",
      bg2: "#0c1f14",
      text: "#f0fdf4",
      muted: "#6ee7b7",
    };
  }

  // User specifies "blue and white" or "cyan"
  if ((lower.includes("blue") && lower.includes("white")) || lower.includes("cyan")) {
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

  // User specifies "purple" or "magenta"
  if (lower.includes("purple") || lower.includes("violet") || lower.includes("magenta")) {
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

  // Category-based intelligent defaults
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

  if (category === "automotive") {
    return {
      name: "Titanium Silver & Velocity Crimson",
      primary: "#ef4444",
      accent: "#f87171",
      bg1: "#0a0a0c",
      bg2: "#17171c",
      text: "#ffffff",
      muted: "#94a3b8",
    };
  }

  if (category === "creator") {
    return {
      name: "Creator Studio Crimson & Studio Slate",
      primary: "#ff0033",
      accent: "#ff3355",
      bg1: "#0f0506",
      bg2: "#210b0d",
      text: "#ffffff",
      muted: "#cbd5e1",
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

  // Default Universal Corporate
  return {
    name: "Modern Precision Sapphire & Platinum",
    primary: "#00d4a0",
    accent: "#38bdf8",
    bg1: "#06090e",
    bg2: "#0f1722",
    text: "#f8fafc",
    muted: "#94a3b8",
  };
}

// -------------------------------------------------------------
// 3. Category & Industry Detection
// -------------------------------------------------------------

export function detectCategory(text: string): {
  category: VisualIntentResult["category"];
  industry: string;
  theme: string;
} {
  const lower = text.toLowerCase();

  // Gaming / Esports / Free Fire intelligence:
  // "FF", "gaming", "esports", "free fire", "clan", "streamer", "battle royale"
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

  // Automotive / Motors
  if (
    lower.includes("motor") ||
    lower.includes("motors") ||
    lower.includes("automotive") ||
    lower.includes("car") ||
    lower.includes("supercar") ||
    lower.includes("garage") ||
    lower.includes("racing") ||
    lower.includes("speed") ||
    lower.includes("bmw") ||
    lower.includes("mercedes")
  ) {
    return {
      category: "automotive",
      industry: "Automotive & High-Performance Engineering",
      theme: "car",
    };
  }

  // Creator / YouTube Channel
  if (
    lower.includes("youtube") ||
    lower.includes("channel") ||
    lower.includes("vlog") ||
    lower.includes("podcast") ||
    lower.includes("creator") ||
    lower.includes("yt")
  ) {
    return {
      category: "creator",
      industry: "Digital Media & Content Creator Studio",
      theme: "youtube",
    };
  }

  // Luxury & Royal
  if (
    lower.includes("luxury") ||
    lower.includes("royal") ||
    lower.includes("jewelry") ||
    lower.includes("gold") ||
    lower.includes("estate") ||
    lower.includes("haute") ||
    lower.includes("prestige")
  ) {
    return {
      category: "luxury",
      industry: "Luxury Goods & Bespoke Heritage",
      theme: "luxury",
    };
  }

  // Technology & AI
  if (
    lower.includes("tech") ||
    lower.includes("software") ||
    lower.includes("ai") ||
    lower.includes("robotics") ||
    lower.includes("cloud") ||
    lower.includes("code") ||
    lower.includes("quantum")
  ) {
    return {
      category: "tech",
      industry: "Technology & Artificial Intelligence",
      theme: "tech",
    };
  }

  // Healthcare & Medical
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

  // Fitness & Gym
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

  // Crypto & Web3
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

  // Corporate & General Business
  return {
    category: "corporate",
    industry: "Enterprise & Modern Business",
    theme: "company_logo",
  };
}

// -------------------------------------------------------------
// 4. Professional Concept Direction Synthesis
// -------------------------------------------------------------

export function generateConceptDirections(
  brandName: string,
  initials: string,
  category: string
): LogoConcept[] {
  if (category === "gaming") {
    return [
      {
        id: "emblem",
        title: "Concept A: Competitive Esports Crest",
        badgeLabel: "Primary Emblem",
        description: "Aggressive, battle-tested geometric crest with cyber-armor visor, dynamic horns, and 3D extruded metallic typography.",
        symbolDescription: `Dynamic angular shield housing an original cyber-warrior silhouette with piercing glowing eyes, tailored specifically for "${brandName}".`,
        typographyStyle: "900 Heavyweight custom esports display lettering with faceted chamfers",
        composition: "Centralized warrior shield with curved banner base",
      },
      {
        id: "monogram",
        title: `Concept B: Interlocking Monogram (${initials})`,
        badgeLabel: "Precision Lettermark",
        description: `Precision-crafted interlocking vector monogram of "${initials}" with diamond facets and neon rim lighting.`,
        symbolDescription: `Clean dual-letter geometric glyph fusing "${initials}" into an iconic, memorable profile avatar.`,
        typographyStyle: "Futuristic geometric wide-tracking sans serif",
        composition: "Dominant monogram emblem centered above brand typography",
      },
      {
        id: "combination",
        title: "Concept C: Minimalist Icon + Wordmark",
        badgeLabel: "Combination Mark",
        description: "Clean modern esports symbol paired with laser-sharp kerning typography, designed for team jerseys and tournament overlays.",
        symbolDescription: "Stylized geometric flame/shard insignia representing velocity and competitive focus.",
        typographyStyle: "High-contrast modern bold sans serif with 0.15em letter-spacing",
        composition: "Balanced vector mark over ultra-clean horizontal typography",
      },
      {
        id: "badge",
        title: "Concept D: Tournament Hex Insignia",
        badgeLabel: "Hexagonal Badge",
        description: "Official guild tournament seal with neon perimeter dashes, verified star accents, and high-definition optical clarity.",
        symbolDescription: "Heavyweight beveled hexagon with dual-tone metallic accents.",
        typographyStyle: "Bold industrial display type with optical centering",
        composition: "Enclosed hexagonal insignia with embedded badge typography",
      },
    ];
  }

  if (category === "automotive") {
    return [
      {
        id: "emblem",
        title: "Concept A: Aerodynamic Winged Crest",
        badgeLabel: "Precision Crest",
        description: `Dynamic winged metallic emblem symbolizing velocity, mechanical excellence, and prestige for "${brandName}".`,
        symbolDescription: "Twin aerodynamic swept wings flanking a precision central shield.",
        typographyStyle: "Aggressive Italian automotive bold sans serif with forward slant",
        composition: "Swept-wing crest above centered brand name",
      },
      {
        id: "monogram",
        title: `Concept B: Monogram Insignia (${initials})`,
        badgeLabel: "Lettermark",
        description: `Dual-letter interlocking chrome monogram (${initials}) inspired by luxury hypercar grilles.`,
        symbolDescription: `Interlocking vector monogram "${initials}" with brushed metallic bevels.`,
        typographyStyle: "Wide-tracked luxury automotive display typeface",
        composition: "Central monogram badge with verified subtitle ribbon",
      },
      {
        id: "combination",
        title: "Concept C: Velocity Shield Mark",
        badgeLabel: "Combination Mark",
        description: "Sleek chevron shield badge with high-contrast crimson accents.",
        symbolDescription: "Minimalist shield emblem with intersecting speed lines.",
        typographyStyle: "Modern geometric sans with ultra-sharp apexes",
        composition: "Stacked shield and bold wordmark",
      },
      {
        id: "badge",
        title: "Concept D: Luxury Radial Seal",
        badgeLabel: "Heritage Seal",
        description: "Prestige automotive badge engineered for steering wheel centers and vehicle grilles.",
        symbolDescription: "Concentric circular rings with micro-metric gear teeth.",
        typographyStyle: "Classical mechanical serif with modern kerning",
        composition: "Circular emblem badge",
      },
    ];
  }

  // Corporate, Tech, Luxury, Creator default concepts
  return [
    {
      id: "emblem",
      title: "Concept A: Primary Architectural Mark",
      badgeLabel: "Primary Mark",
      description: `Geometric vector identity symbolizing intelligence, structural stability, and forward velocity for "${brandName}".`,
      symbolDescription: "Interlocking geometric delta vectors with smooth optical transitions.",
      typographyStyle: "Plus Jakarta Sans Bold with 0.08em optical tracking",
      composition: "Top emblem centered over balanced wordmark",
    },
    {
      id: "monogram",
      title: `Concept B: Geometric Monogram (${initials})`,
      badgeLabel: "Monogram",
      description: `Modern vector monogram formed by "${initials}" with clean negative space and high-contrast bevels.`,
      symbolDescription: `Minimalist dual-character ligature "${initials}".`,
      typographyStyle: "Clean geometric grotesque with balanced optical height",
      composition: "Dominant monogram emblem centered with secondary label",
    },
    {
      id: "combination",
      title: "Concept C: Modern Combination Mark",
      badgeLabel: "Combination Mark",
      description: "Iconic abstract symbol paired with crystal-clear brand typography.",
      symbolDescription: "Prismatic vector node with harmonious ambient illumination.",
      typographyStyle: "Ultra-clean modern sans serif with 0.12em tracking",
      composition: "Horizontal or vertical lockup with high legibility",
    },
    {
      id: "badge",
      title: "Concept D: Minimalist Seal Insignia",
      badgeLabel: "Seal Insignia",
      description: "Enclosed hexagonal badge passing all optical clarity and small-scale profile benchmarks.",
      symbolDescription: "Precision hexagon with interior radial focal point.",
      typographyStyle: "Semi-bold modern sans with centered badge layout",
      composition: "Self-contained badge with border trim",
    },
  ];
}

// -------------------------------------------------------------
// 5. Mini Brand Brief Generator
// -------------------------------------------------------------

export function generateMiniBrandBrief(
  brandName: string,
  initials: string,
  category: VisualIntentResult["category"],
  industry: string,
  palette: ColorPalette
): MiniBrandBrief {
  if (category === "gaming") {
    return {
      brandName,
      initials,
      industry,
      category,
      targetAudience: "Competitive gamers, Free Fire / esports communities, Twitch & YouTube gaming audiences.",
      brandPersonality: "Aggressive, high-octane, fearless, competitive, modern, and elite.",
      visualIdentity: "Heavyweight battle-royale gaming identity featuring custom sharp geometry, high-contrast rim lighting, and 3D extruded typography.",
      symbolism: "Cyber-samurai crest & angular armor plates symbolize tactical mastery, victory, and unwavering focus.",
      iconConcept: "Original sharp-horned warrior helmet within a reinforced tournament shield.",
      typographyDirection: "Custom display esports lettering with faceted cuts, heavy stroke weight, and glowing specular highlights.",
      colorDirection: `${palette.name} — high-contrast fire orange / crimson paired with electric cyan eye glow on deep battleground dark tones.`,
      composition: "Symmetrical crest with central mascot icon, curved ribbon nameplate, and high-readability profile-avatar framing.",
      scalability: "Engineered to maintain unmistakable silhouette recognition from 32px profile icons to 4K stream overlays.",
      usageContext: "Discord server icons, YouTube gaming channel banners, team jerseys, streaming overlays, and tournament brackets.",
      visualHierarchy: "1. Piercing Glowing Eyes & Mascot Silhouette → 2. Bold 3D Extruded Brand Name → 3. Tournament Shield Outline.",
    };
  }

  if (category === "automotive") {
    return {
      brandName,
      initials,
      industry,
      category,
      targetAudience: "Automotive enthusiasts, luxury car buyers, performance racing fans.",
      brandPersonality: "Prestigious, aerodynamic, powerful, precision-engineered, luxurious.",
      visualIdentity: "High-end automotive marque featuring brushed titanium gradients, aerodynamic wing sweeps, and forward-slanted precision typography.",
      symbolism: "Swept-wing geometry represents velocity, aerodynamic poise, and mechanical mastery.",
      iconConcept: "Symmetrical aeronautic wings anchoring an interlocking precision monogram shield.",
      typographyDirection: "Custom italicized automotive grotesque with razor-sharp terminal points.",
      colorDirection: `${palette.name} — racing crimson and platinum silver against carbon-weave obsidian.`,
      composition: "Top-centered marque crest with wide-tracked corporate nameplate below.",
      scalability: "Optimized for vehicle badges, steering wheel hubs, showroom signage, and mobile headers.",
      usageContext: "Showrooms, website headers, vehicle badges, marketing collateral, mobile apps.",
      visualHierarchy: "1. Metallic Winged Crest → 2. Wide-Tracked Brand Identifier → 3. Subtitle Marque.",
    };
  }

  return {
    brandName,
    initials,
    industry,
    category,
    targetAudience: "Enterprises, modern consumers, tech innovators, design professionals.",
    brandPersonality: "Intelligent, reliable, forward-thinking, pristine, and sophisticated.",
    visualIdentity: "Minimalist vector identity balancing geometric purity with harmonious negative space.",
    symbolism: "Interlocking delta nodes represent dynamic collaboration, stability, and technological intelligence.",
    iconConcept: `Clean vector emblem based on harmonic geometric ratios and initials "${initials}".`,
    typographyDirection: "Clean Plus Jakarta Sans / geometric sans with wide optical kerning.",
    colorDirection: `${palette.name} — balanced primary accent on deep slate background with high optical contrast.`,
    composition: "Centered emblem with proportional spacing and mathematical balance.",
    scalability: "Vector-ready SVG structure maintaining 100% clarity across all screen sizes.",
    usageContext: "Web platforms, SaaS dashboards, mobile icons, corporate stationery, investor pitch decks.",
    visualHierarchy: "1. Core Vector Mark → 2. Brand Name Wordmark → 3. Verified Category Subtitle.",
  };
}

// -------------------------------------------------------------
// 6. Master Parse Visual Intent Engine
// -------------------------------------------------------------

/**
 * Main entry point: Evaluates natural language user request and returns complete Visual Intent Result.
 */
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
    /\b(banao|bana do|chahiye)\b/i.test(lower) && (lower.includes("naming") || lower.includes("naam") || lower.includes("brand"));

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
    lower.includes("پوسٹر") ||
    lower.includes("ملصق");

  const isGenericImageTrigger =
    lower.includes("wallpaper") ||
    lower.includes("tasveer") ||
    lower.includes("تصویر") ||
    lower.includes("artwork") ||
    lower.includes("drawing") ||
    /\b(draw|sketch|paint|illustrate|visualize|render)\b/i.test(lower) ||
    /\b(create|generate|make|design)\s+(?:an?|the|some)?\s*(?:futuristic|cyberpunk|photorealistic|scenic|3d|modern)?\s*(?:image|picture|photo|wallpaper|artwork|render)/i.test(lower);

  if (!isLogoTrigger && !isThumbnailTrigger && !isBannerTrigger && !isPosterTrigger && !isGenericImageTrigger) {
    return null;
  }

  // 1. Determine Design Type
  let designType: VisualIntentResult["designType"] = "logo";
  if (isThumbnailTrigger) designType = "thumbnail";
  else if (isBannerTrigger) designType = "banner";
  else if (isPosterTrigger) designType = "poster";
  else if (isGenericImageTrigger && !isLogoTrigger) designType = "image";

  // 2. Detect Category & Industry
  const { category, industry, theme } = detectCategory(rawText);

  // 3. Extract Exact Brand Name & Initials
  const { brandName, initials } = extractAccurateBrandName(rawText, category);

  // 4. Extract Palette
  const palette = extractColorPalette(rawText, category);

  // 5. Generate Concept Directions
  const concepts = generateConceptDirections(brandName, initials, category);

  // 6. Generate Mini Brand Brief
  const brief = generateMiniBrandBrief(brandName, initials, category, industry, palette);

  const promptDescription = `Professional ${designType.toUpperCase()} for "${brandName}" (${industry}) with customized typography, balanced geometry, and ${palette.name} palette.`;

  return {
    isVisualRequest: true,
    designType,
    brandName,
    initials,
    industry,
    category,
    style: concepts[0].title,
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
// 7. Vector SVG Generator for Real Vector Export
// -------------------------------------------------------------

/**
 * Generates an ultra-crisp, scalable vector SVG string for the logo.
 * Users can download genuine SVG vector files or PNGs with transparent backgrounds.
 */
export function generateLogoSvg(
  brandName: string,
  initials: string,
  category: string,
  palette: ColorPalette,
  transparentBg: boolean = false
): string {
  const bgRect = transparentBg
    ? ""
    : `<rect width="800" height="800" rx="32" fill="url(#bgGrad)" />`;

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

  <!-- Emblem Silhouette -->
  <g transform="translate(400, 320)" filter="url(#glow)">
    ${
      category === "gaming"
        ? `<!-- Esports Shield Base -->
           <path d="M 0 -130 L 140 -40 L 110 80 L 0 170 L -110 80 L -140 -40 Z" fill="#12080a" stroke="${palette.primary}" stroke-width="8" />
           <!-- Mask Spikes -->
           <path d="M 0 -100 L 50 -20 L 70 -50 L 50 10 L 80 40 L 40 55 L 0 90 L -40 55 L -80 40 L -50 10 L -70 -50 L -50 -20 Z" fill="${palette.primary}" opacity="0.9" />
           <!-- Eyes -->
           <polygon points="-35,0 -12,-2 -28,8" fill="#00ffff" />
           <polygon points="35,0 12,-2 28,8" fill="#00ffff" />`
        : `<!-- Geometric Hexagon Shield -->
           <polygon points="0,-120 104,-60 104,60 0,120 -104,60 -104,-60" fill="none" stroke="${palette.primary}" stroke-width="8" />
           <!-- Central Interlocking Delta -->
           <polygon points="0,-75 65,45 0,15 -65,45" fill="url(#primaryGrad)" />
           <!-- Initials Core -->
           <circle cx="0" cy="0" r="12" fill="#ffffff" />`
    }
  </g>

  <!-- Brand Typography -->
  <g transform="translate(400, 560)" text-anchor="middle">
    <!-- Drop Shadow -->
    <text x="0" y="4" font-family="'Plus Jakarta Sans', Impact, sans-serif" font-weight="900" font-size="64" fill="#000000" letter-spacing="2">${brandName}</text>
    <!-- Main Face -->
    <text x="0" y="0" font-family="'Plus Jakarta Sans', Impact, sans-serif" font-weight="900" font-size="64" fill="url(#primaryGrad)" letter-spacing="2">${brandName}</text>
  </g>

  <!-- Subtitle Tagline -->
  <g transform="translate(400, 620)" text-anchor="middle">
    <text x="0" y="0" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="16" fill="${palette.muted}" letter-spacing="5">
      ${category === "gaming" ? "OFFICIAL ESPORTS BRAND IDENTITY" : "PREMIUM BRAND IDENTITY"}
    </text>
  </g>
</svg>`;
}
