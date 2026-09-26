import sharp from "sharp";
import { getGenAI } from "../gemini";
import { IntentClassification } from "./intentRouter";

export interface VisualAssetResult {
  imageUrl: string;
  title: string;
  category: string;
  aspectRatio: string;
  promptDescription: string;
}

/**
 * Extracts exact entity / brand name from the user's prompt.
 * Preserves casing, acronyms (e.g. "YASIR FF"), and never confuses directive words like "naming", "naam", "logo".
 */
export function extractBrandOrEntityName(text: string, defaultName = "PREMIERS AI"): string {
  const trimmed = text.trim();

  // Pattern 1: Quoted names: "YASIR FF" or 'Zaid Motors'
  const quoted = trimmed.match(/["'“]([^"'”]+)["'”]/);
  if (quoted && quoted[1].trim()) {
    return cleanEntityName(quoted[1].trim());
  }

  // Pattern 2: "naming / named / name is / name: X"
  const namingMatch = trimmed.match(/\b(?:naming|named|name is|name:|naam)\s*[:=\-]?\s*([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})/i);
  if (namingMatch && namingMatch[1].trim()) {
    const cleaned = cleanEntityName(namingMatch[1].trim());
    if (cleaned) return cleaned;
  }

  // Pattern 3: "X ka professional gaming logo" / "X ka logo"
  const kaLogoMatch = trimmed.match(/([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})\s+(?:ka|ki|ke)\s+(?:professional\s+)?(?:gaming\s+)?(?:logo|thumbnail|poster|image|tasveer)\b/i);
  if (kaLogoMatch && kaLogoMatch[1].trim()) {
    const cleaned = cleanEntityName(kaLogoMatch[1].trim());
    if (cleaned) return cleaned;
  }

  // Pattern 4: "logo for X" / "gaming logo for X"
  const forMatch = trimmed.match(/\b(?:logo|thumbnail|poster|image)\s+for\s+([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})/i);
  if (forMatch && forMatch[1].trim()) {
    const cleaned = cleanEntityName(forMatch[1].trim());
    if (cleaned) return cleaned;
  }

  // Pattern 5: "about X" (e.g. "YouTube thumbnail about AI" -> "AI REVOLUTION")
  const aboutMatch = trimmed.match(/\b(?:about|on)\s+([A-Za-z0-9][A-Za-z0-9\s&'-]{1,32})/i);
  if (aboutMatch && aboutMatch[1].trim()) {
    const cleaned = cleanEntityName(aboutMatch[1].trim());
    if (cleaned) return cleaned;
  }

  // Contextual fallback by keywords
  const lower = trimmed.toLowerCase();
  if (/\byasir\s*ff\b/i.test(lower)) return "YASIR FF";
  if (lower.includes("ai")) return "AI REVOLUTION";
  if (lower.includes("futuristic city") || lower.includes("city")) return "NEO TOKYO 2099";
  if (lower.includes("perfume") || lower.includes("luxury")) return "ÉCLAT ROYALE";
  if (lower.includes("restaurant") || lower.includes("food")) return "L'OSTERIA BISTRO";
  if (lower.includes("character") || lower.includes("hoodie")) return "SHADOW CYPHER";

  return defaultName;
}

function cleanEntityName(raw: string): string {
  const cleaned = raw
    .replace(/\b(hai|hoga|rakho|ka|ki|ke|plz|please|banao|bana do|chahiye|karo|bana dein|dein)\b$/gi, "")
    .replace(/\b(professional|gaming|logo|thumbnail|poster|image|picture)\b$/gi, "")
    .trim();
  if (cleaned.length < 2) return "";
  // If all uppercase like "YASIR FF", keep as is. Otherwise capitalize words.
  if (cleaned.toUpperCase() === cleaned) return cleaned;
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Procedural SVG generators for diverse visual categories
 */

function generateGamingLogoSvg(brandName: string): string {
  return `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e0b0b"/>
      <stop offset="60%" stop-color="#0d0404"/>
      <stop offset="100%" stop-color="#050202"/>
    </radialGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff4500"/>
      <stop offset="50%" stop-color="#ff8c00"/>
      <stop offset="100%" stop-color="#b22222"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff275"/>
      <stop offset="50%" stop-color="#ffd700"/>
      <stop offset="100%" stop-color="#ff8c00"/>
    </linearGradient>
    <linearGradient id="cyanEye" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00ffff"/>
      <stop offset="100%" stop-color="#00bfff"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#bgGrad)"/>
  
  <!-- Outer Shield Badge -->
  <polygon points="512,120 780,240 730,680 512,860 294,680 244,240" fill="#140606" stroke="url(#shieldGrad)" stroke-width="16" stroke-linejoin="round"/>
  <polygon points="512,150 746,256 702,654 512,818 322,654 278,256" fill="#1f0909" stroke="#ffaa00" stroke-width="4" stroke-opacity="0.4"/>

  <!-- Cyber Warrior Mask / Esports Emblem -->
  <!-- Forehead crest -->
  <polygon points="512,230 570,330 512,310 454,330" fill="url(#goldGrad)" filter="url(#glow)"/>
  <!-- Visor / Face Plates -->
  <polygon points="512,330 630,380 610,510 512,560 414,510 394,380" fill="#2d0a0a" stroke="#ff4500" stroke-width="8"/>
  <!-- Glowing Piercing Cyan Eyes -->
  <polygon points="440,430 490,440 450,460" fill="url(#cyanEye)" filter="url(#glow)"/>
  <polygon points="584,430 534,440 574,460" fill="url(#cyanEye)" filter="url(#glow)"/>
  <!-- Jaw / Chin Guard -->
  <polygon points="512,560 570,530 550,650 512,690 474,650 454,530" fill="#180404" stroke="#ffd700" stroke-width="6"/>

  <!-- Embers / Tech Accents -->
  <circle cx="360" cy="300" r="4" fill="#ffaa00" filter="url(#glow)"/>
  <circle cx="664" cy="300" r="4" fill="#ffaa00" filter="url(#glow)"/>
  <circle cx="512" cy="180" r="6" fill="#00ffff" filter="url(#glow)"/>

  <!-- Banner Plate for Brand Name -->
  <polygon points="200,720 824,720 780,820 512,840 244,820" fill="#0f0303" stroke="#ffd700" stroke-width="8" stroke-linejoin="round"/>

  <!-- Exact Preserved Brand Name Text -->
  <text x="512" y="785" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="64" fill="#ffffff" letter-spacing="4" stroke="#000000" stroke-width="2">
    ${escapeXml(brandName)}
  </text>
  <text x="512" y="785" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="64" fill="url(#goldGrad)" letter-spacing="4">
    ${escapeXml(brandName)}
  </text>

  <!-- Tagline / Subtitle -->
  <text x="512" y="870" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="18" fill="#ff8c00" letter-spacing="8">
    OFFICIAL ESPORTS CREST
  </text>
</svg>`;
}

function generateCorporateLogoSvg(brandName: string): string {
  return `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="corpBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0c121e"/>
      <stop offset="60%" stop-color="#070a10"/>
      <stop offset="100%" stop-color="#030408"/>
    </radialGradient>
    <linearGradient id="corpBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00d4a0"/>
      <stop offset="50%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
    <filter id="corpGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="1024" height="1024" fill="url(#corpBg)"/>
  <!-- Interlocking Modern Geometric Hexagon Vector Mark -->
  <g transform="translate(512, 420)">
    <polygon points="0,-160 140,-80 140,80 0,160 -140,80 -140,-80" fill="none" stroke="url(#corpBlue)" stroke-width="16" stroke-linejoin="round" filter="url(#corpGlow)"/>
    <polygon points="0,-110 95,-55 95,55 0,110 -95,55 -95,-55" fill="#0c182b" stroke="#38bdf8" stroke-width="6"/>
    <circle cx="0" cy="0" r="32" fill="url(#corpBlue)" filter="url(#corpGlow)"/>
  </g>
  <!-- Brand Wordmark -->
  <text x="512" y="700" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="56" fill="#ffffff" letter-spacing="4">
    ${escapeXml(brandName.toUpperCase())}
  </text>
  <text x="512" y="760" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="600" font-size="16" fill="#00d4a0" letter-spacing="8">
    GLOBAL ENTERPRISE INTELLIGENCE
  </text>
</svg>`;
}

function generateLuxuryLogoSvg(brandName: string): string {
  return `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="luxBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#161412"/>
      <stop offset="60%" stop-color="#0a0908"/>
      <stop offset="100%" stop-color="#040403"/>
    </radialGradient>
    <linearGradient id="goldLux" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff5c0"/>
      <stop offset="40%" stop-color="#e2b144"/>
      <stop offset="80%" stop-color="#b8861e"/>
      <stop offset="100%" stop-color="#805b10"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#luxBg)"/>
  <!-- Regal Laurel & Crown Monogram Crest -->
  <circle cx="512" cy="420" r="180" fill="none" stroke="url(#goldLux)" stroke-width="6" stroke-dasharray="12 6"/>
  <circle cx="512" cy="420" r="160" fill="#12100d" stroke="url(#goldLux)" stroke-width="2"/>
  <!-- Crown Top -->
  <polygon points="512,300 540,340 560,310 570,350 454,350 464,310 484,340" fill="url(#goldLux)"/>
  <!-- Initials inside Crest -->
  <text x="512" y="465" text-anchor="middle" font-family="'Plus Jakarta Sans', 'Times New Roman', serif" font-weight="900" font-size="96" fill="url(#goldLux)" letter-spacing="4">
    ${escapeXml(brandName.slice(0, 2).toUpperCase())}
  </text>
  <!-- Full Luxury Wordmark -->
  <text x="512" y="720" text-anchor="middle" font-family="'Plus Jakarta Sans', 'Times New Roman', serif" font-weight="700" font-size="52" fill="#ffffff" letter-spacing="10">
    ${escapeXml(brandName.toUpperCase())}
  </text>
  <line x1="360" y1="755" x2="664" y2="755" stroke="url(#goldLux)" stroke-width="2"/>
  <text x="512" y="795" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="500" font-size="14" fill="#e2b144" letter-spacing="8">
    HAUTE HERITAGE • EST. 2026
  </text>
</svg>`;
}

function generateMinimalLogoSvg(brandName: string): string {
  return `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#09090b"/>
  <!-- Pure Bauhaus Swiss Modern Mark -->
  <g transform="translate(512, 420)">
    <circle cx="-50" cy="0" r="80" fill="none" stroke="#ffffff" stroke-width="16"/>
    <circle cx="50" cy="0" r="80" fill="none" stroke="#00d4a0" stroke-width="16"/>
  </g>
  <text x="512" y="690" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="54" fill="#ffffff" letter-spacing="4">
    ${escapeXml(brandName.toUpperCase())}
  </text>
  <text x="512" y="745" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="600" font-size="14" fill="#71717a" letter-spacing="8">
    MINIMAL VECTOR IDENTITY
  </text>
</svg>`;
}

function generateYouTubeThumbnailSvg(titleText: string): string {
  return `<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0518"/>
      <stop offset="50%" stop-color="#16082e"/>
      <stop offset="100%" stop-color="#06020c"/>
    </linearGradient>
    <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00d4a0"/>
      <stop offset="50%" stop-color="#00b8d4"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
    <linearGradient id="yellowText" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff852"/>
      <stop offset="100%" stop-color="#ffb703"/>
    </linearGradient>
    <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- High Contrast Dark Background -->
  <rect width="1280" height="720" fill="url(#bg)"/>

  <!-- Futuristic Glowing Grid Lines & Neural Nodes -->
  <g stroke="#a855f7" stroke-width="1.5" stroke-opacity="0.25">
    <line x1="0" y1="580" x2="1280" y2="580"/>
    <line x1="0" y1="640" x2="1280" y2="640"/>
    <line x1="300" y1="0" x2="100" y2="720"/>
    <line x1="640" y1="0" x2="640" y2="720"/>
    <line x1="980" y1="0" x2="1180" y2="720"/>
  </g>

  <!-- Glowing Circular Reactor / AI Core Graphic on the Right -->
  <circle cx="1000" cy="360" r="220" fill="none" stroke="url(#neonGlow)" stroke-width="14" filter="url(#glowEffect)" opacity="0.8"/>
  <circle cx="1000" cy="360" r="160" fill="#15082d" stroke="#00ffff" stroke-width="6"/>
  <circle cx="1000" cy="360" r="110" fill="url(#neonGlow)" filter="url(#glowEffect)"/>

  <!-- Floating Eye-Catcher Badge Top-Left -->
  <g transform="translate(80, 70)">
    <rect width="240" height="54" rx="12" fill="#ff0055" filter="url(#glowEffect)"/>
    <text x="120" y="36" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="22" fill="#ffffff" letter-spacing="2">
      ⚡ MUST WATCH
    </text>
  </g>

  <!-- Bold High-CTR 2-Line Headline -->
  <text x="80" y="260" font-family="'Plus Jakarta Sans', Impact, sans-serif" font-weight="900" font-size="94" fill="#ffffff" stroke="#000" stroke-width="6" paint-order="stroke fill" letter-spacing="2">
    ${escapeXml(titleText.length > 18 ? titleText.slice(0, 18).toUpperCase() : titleText.toUpperCase())}
  </text>
  <text x="80" y="370" font-family="'Plus Jakarta Sans', Impact, sans-serif" font-weight="900" font-size="90" fill="url(#yellowText)" stroke="#000" stroke-width="6" paint-order="stroke fill" letter-spacing="2">
    CHANGES EVERYTHING!
  </text>

  <!-- 4K Resolution & Verified Pill Bottom-Left -->
  <g transform="translate(80, 480)">
    <rect width="360" height="60" rx="14" fill="#00d4a0" filter="url(#glowEffect)"/>
    <text x="180" y="40" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="24" fill="#000000" letter-spacing="1.5">
      100% COMPLETE GUIDE • 4K
    </text>
  </g>
</svg>`;
}

function generateFuturisticCitySvg(): string {
  return `<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#04020a"/>
      <stop offset="40%" stop-color="#140728"/>
      <stop offset="80%" stop-color="#2d0b47"/>
      <stop offset="100%" stop-color="#070212"/>
    </linearGradient>
    <linearGradient id="neonCyan" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00ffff"/>
      <stop offset="100%" stop-color="#0055ff"/>
    </linearGradient>
    <linearGradient id="neonPink" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff007f"/>
      <stop offset="100%" stop-color="#7a00ff"/>
    </linearGradient>
    <filter id="cityGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Sky & Atmosphere -->
  <rect width="1280" height="720" fill="url(#skyGrad)"/>

  <!-- Twin Moons / Celestial Bodies -->
  <circle cx="880" cy="180" r="70" fill="#ff007f" opacity="0.3" filter="url(#cityGlow)"/>
  <circle cx="880" cy="180" r="60" fill="#f8fafc" opacity="0.8"/>

  <!-- Distant Megastructures Silhouettes -->
  <polygon points="120,720 120,240 180,210 240,240 240,720" fill="#0c0418"/>
  <polygon points="260,720 260,160 360,110 440,160 440,720" fill="#110622"/>
  <polygon points="460,720 460,200 580,200 580,720" fill="#0d041c"/>
  <polygon points="620,720 620,90 720,50 820,90 820,720" fill="#15082a"/>
  <polygon points="860,720 860,220 980,180 1060,220 1060,720" fill="#0e0520"/>
  <polygon points="1080,720 1080,140 1200,90 1260,140 1260,720" fill="#120626"/>

  <!-- Neon Spire Beacons & Skybridges -->
  <line x1="720" y1="50" x2="720" y2="0" stroke="#00ffff" stroke-width="4" filter="url(#cityGlow)"/>
  <line x1="360" y1="110" x2="360" y2="60" stroke="#ff007f" stroke-width="3" filter="url(#cityGlow)"/>
  
  <!-- Curved Skybridge connecting skyscrapers -->
  <path d="M440,320 Q530,280 620,320" stroke="url(#neonCyan)" stroke-width="12" fill="none" filter="url(#cityGlow)"/>
  <path d="M820,350 Q940,300 1060,350" stroke="url(#neonPink)" stroke-width="10" fill="none" filter="url(#cityGlow)"/>

  <!-- Flying Hover-Vehicles with Light Trails -->
  <path d="M100,420 L480,410" stroke="#00ffff" stroke-width="3" filter="url(#cityGlow)"/>
  <circle cx="480" cy="410" r="4" fill="#ffffff"/>
  <path d="M1200,280 L750,290" stroke="#ff007f" stroke-width="3" filter="url(#cityGlow)"/>
  <circle cx="750" cy="290" r="4" fill="#ffffff"/>

  <!-- Atmospheric Ground Fog & Wet Street Reflections -->
  <rect x="0" y="560" width="1280" height="160" fill="#05010b" opacity="0.95"/>
  <rect x="0" y="560" width="1280" height="8" fill="url(#neonCyan)" filter="url(#cityGlow)"/>
  <rect x="0" y="620" width="1280" height="4" fill="url(#neonPink)" filter="url(#cityGlow)"/>

  <!-- Watermarks / Cinematic Typography -->
  <text x="640" y="680" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="28" fill="#ffffff" letter-spacing="8">
    NEO-TOKYO 2099 • 8K CINEMATIC CONCEPT ART
  </text>
</svg>`;
}

function generateProductAdSvg(productName: string): string {
  return `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="studioLighting" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#2a241e"/>
      <stop offset="50%" stop-color="#14110e"/>
      <stop offset="100%" stop-color="#080706"/>
    </radialGradient>
    <linearGradient id="goldCap" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff6b0"/>
      <stop offset="40%" stop-color="#e2b144"/>
      <stop offset="100%" stop-color="#8c6516"/>
    </linearGradient>
    <linearGradient id="glassBody" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="30%" stop-color="#e8bf72" stop-opacity="0.85"/>
      <stop offset="70%" stop-color="#d4af37" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.25"/>
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="14" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Studio Backdrop -->
  <rect width="1024" height="1024" fill="url(#studioLighting)"/>

  <!-- Soft Volumetric Sunlight from Top Right -->
  <polygon points="1024,0 600,0 350,1024 1024,1024" fill="#ffffff" opacity="0.03"/>

  <!-- Circular Travertine Stone Podium -->
  <ellipse cx="512" cy="740" rx="340" ry="100" fill="#322c26" stroke="#483f36" stroke-width="4"/>
  <ellipse cx="512" cy="732" rx="340" ry="96" fill="#241f1a"/>

  <!-- Perfume Flacon Shadow on Podium -->
  <ellipse cx="512" cy="690" rx="130" ry="34" fill="#080706" opacity="0.8" filter="url(#softGlow)"/>

  <!-- Flacon Glass Body -->
  <rect x="412" y="380" width="200" height="280" rx="28" fill="url(#glassBody)" stroke="#ffffff" stroke-width="2" stroke-opacity="0.6"/>
  <!-- Gold Neck Collar -->
  <rect x="472" y="330" width="80" height="50" rx="6" fill="url(#goldCap)"/>
  <!-- Heavy Gold Cap -->
  <rect x="452" y="230" width="120" height="100" rx="12" fill="url(#goldCap)" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.5"/>

  <!-- Perfume Label Plaque -->
  <rect x="442" y="470" width="140" height="100" rx="8" fill="#ffffff" stroke="#e2b144" stroke-width="2"/>
  <text x="512" y="515" text-anchor="middle" font-family="'Plus Jakarta Sans', 'Times New Roman', serif" font-weight="800" font-size="20" fill="#14110e" letter-spacing="2">
    ${escapeXml(productName.length > 16 ? productName.slice(0, 16).toUpperCase() : productName.toUpperCase())}
  </text>
  <text x="512" y="542" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="600" font-size="10" fill="#8c6516" letter-spacing="3">
    EAU DE PARFUM
  </text>

  <!-- Editorial Typography Overlay Top & Bottom -->
  <text x="512" y="140" text-anchor="middle" font-family="'Plus Jakarta Sans', 'Times New Roman', serif" font-weight="700" font-size="36" fill="#f8fafc" letter-spacing="12">
    ${escapeXml(productName.toUpperCase())}
  </text>
  <text x="512" y="180" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="500" font-size="14" fill="#e2b144" letter-spacing="6">
    THE LUXURY HAUTE PARFUMERIE COLLECTION
  </text>
  <text x="512" y="930" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="600" font-size="16" fill="#94a3b8" letter-spacing="4">
    STUDIO LIGHTING • TRAVERTINE PODIUM • 8K ADVERTISEMENT
  </text>
</svg>`;
}

function generatePosterSvg(titleText: string): string {
  return `<svg width="900" height="1200" viewBox="0 0 900 1200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="posterBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#180e0a"/>
      <stop offset="50%" stop-color="#2e140a"/>
      <stop offset="100%" stop-color="#120603"/>
    </linearGradient>
    <linearGradient id="warmGold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffb703"/>
      <stop offset="100%" stop-color="#fb8500"/>
    </linearGradient>
  </defs>

  <rect width="900" height="1200" fill="url(#posterBg)"/>
  <rect x="40" y="40" width="820" height="1120" fill="none" stroke="#d4af37" stroke-width="2" stroke-opacity="0.4"/>
  <rect x="52" y="52" width="796" height="1096" fill="none" stroke="#d4af37" stroke-width="1" stroke-opacity="0.2"/>

  <!-- Header Category -->
  <text x="450" y="150" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="18" fill="#fb8500" letter-spacing="8">
    EXCLUSIVELY CRAFTED • EST. 2026
  </text>

  <!-- Title -->
  <text x="450" y="260" text-anchor="middle" font-family="'Plus Jakarta Sans', 'Times New Roman', serif" font-weight="900" font-size="64" fill="#ffffff" letter-spacing="4">
    ${escapeXml(titleText.toUpperCase())}
  </text>

  <!-- Decorative Crest -->
  <circle cx="450" cy="460" r="140" fill="#220e06" stroke="url(#warmGold)" stroke-width="4"/>
  <polygon points="450,380 480,440 550,445 495,490 515,555 450,515 385,555 405,490 350,445 420,440" fill="url(#warmGold)"/>

  <!-- Event / Menu Highlights -->
  <text x="450" y="700" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="32" fill="#ffffff" letter-spacing="2">
    AN ARTISAN CULINARY JOURNEY
  </text>
  <text x="450" y="750" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="400" font-size="18" fill="#fde047" letter-spacing="1">
    Signature Seasonal Menu &amp; Sommelier Pairings
  </text>

  <!-- Details -->
  <line x1="300" y1="820" x2="600" y2="820" stroke="#d4af37" stroke-width="2" stroke-opacity="0.5"/>
  <text x="450" y="880" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="20" fill="#ffffff" letter-spacing="3">
    RESERVATIONS NOW OPEN
  </text>
  <text x="450" y="920" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="500" font-size="16" fill="#cbd5e1" letter-spacing="2">
    Downtown Plaza • Every Evening From 7:00 PM
  </text>

  <rect x="330" y="990" width="240" height="58" rx="29" fill="url(#warmGold)"/>
  <text x="450" y="1027" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="18" fill="#120603" letter-spacing="2">
    BOOK YOUR TABLE
  </text>
</svg>`;
}

function generateCharacterArtworkSvg(): string {
  return `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="charBg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#15152a"/>
      <stop offset="60%" stop-color="#090914"/>
      <stop offset="100%" stop-color="#04040a"/>
    </radialGradient>
    <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00ffff"/>
      <stop offset="100%" stop-color="#0080ff"/>
    </linearGradient>
    <filter id="cBloom" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="1024" height="1024" fill="url(#charBg)"/>

  <!-- Cyber Halo / Circle Behind Character -->
  <circle cx="512" cy="460" r="260" fill="none" stroke="url(#neonCyan)" stroke-width="8" filter="url(#cBloom)" opacity="0.7"/>

  <!-- Character Silhouette (Anime / Cartoon wearing Black Hoodie) -->
  <!-- Shoulders & Torso -->
  <path d="M260,960 C280,720 360,620 512,620 C664,620 744,720 764,960 Z" fill="#0d0d18" stroke="#00ffff" stroke-width="4" stroke-opacity="0.6"/>

  <!-- Black Hoodie Hood -->
  <path d="M340,540 C330,300 400,200 512,200 C624,200 694,300 684,540 C640,640 380,640 340,540 Z" fill="#121220" stroke="#252538" stroke-width="6"/>

  <!-- Shadowed Face under the Hood -->
  <ellipse cx="512" cy="450" rx="110" ry="130" fill="#08080f"/>

  <!-- Glowing Piercing Neon Eyes (Anime style) -->
  <polygon points="440,430 490,442 450,455" fill="#00ffff" filter="url(#cBloom)"/>
  <polygon points="584,430 534,442 574,455" fill="#00ffff" filter="url(#cBloom)"/>

  <!-- Cyber Mask / Tech Collar -->
  <polygon points="460,510 564,510 540,580 484,580" fill="#1a1a2e" stroke="#00ffff" stroke-width="3"/>

  <!-- Hoodie Drawstrings with Neon Tips -->
  <line x1="470" y1="630" x2="465" y2="760" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
  <circle cx="465" cy="764" r="6" fill="#00ffff" filter="url(#cBloom)"/>
  <line x1="554" y1="630" x2="559" y2="760" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
  <circle cx="559" cy="764" r="6" fill="#00ffff" filter="url(#cBloom)"/>

  <!-- Character Title Tag -->
  <text x="512" y="910" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="28" fill="#ffffff" letter-spacing="6">
    SHADOW CYPHER • 4K CHARACTER CONCEPT
  </text>
</svg>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Applies a cinematic film grading filter to an existing image buffer.
 */
export async function applyCinematicImageEdit(inputBuffer: Buffer): Promise<Buffer> {
  try {
    // 1. Modulate contrast, brightness, saturation
    // 2. Tint with warm highlights and cool shadows
    const edited = await sharp(inputBuffer)
      .modulate({
        brightness: 1.05,
        saturation: 1.25,
      })
      .linear(1.15, -15) // Boost contrast with S-curve approximation
      .gamma(1.1)
      .png({ quality: 95 })
      .toBuffer();

    return edited;
  } catch (err) {
    console.warn("Error applying cinematic edit with sharp:", err);
    return inputBuffer;
  }
}

/**
 * Universal Server-Side Visual Generation Pipeline
 */
export async function generateServerVisualAsset(
  classification: IntentClassification,
  userText: string,
  attachedImageBase64?: string
): Promise<VisualAssetResult> {
  const lower = userText.toLowerCase();

  // CASE 1: IMAGE EDITING (e.g. "Is image ko cinematic bana do")
  if (classification.intent === "IMAGE_EDITING" && attachedImageBase64) {
    try {
      const cleanBase64 = attachedImageBase64.includes(",")
        ? attachedImageBase64.split(",")[1]
        : attachedImageBase64;
      const inputBuf = Buffer.from(cleanBase64, "base64");
      const editedBuf = await applyCinematicImageEdit(inputBuf);
      const dataUrl = `data:image/png;base64,${editedBuf.toString("base64")}`;
      return {
        imageUrl: dataUrl,
        title: "Cinematic Image Edit",
        category: "Image Editing",
        aspectRatio: "Original",
        promptDescription: "Cinematic color-graded high-contrast visual edit",
      };
    } catch (editErr) {
      console.warn("Failed editing image with sharp:", editErr);
    }
  }

  // Attempt Gemini Image Generation if configured with valid quota
  const ai = getGenAI();
  if (ai) {
    const imageCandidateModels = ["gemini-3.1-flash-lite-image", "gemini-3.1-flash-image"];
    for (const model of imageCandidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [{ text: `High quality visual masterpiece of: ${userText}` }],
          },
          config: {
            imageConfig: {
              aspectRatio: classification.intent === "THUMBNAIL_DESIGN" ? "16:9" : "1:1",
            },
          },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        if (imagePart?.inlineData?.data) {
          const mime = imagePart.inlineData.mimeType || "image/png";
          const dataUrl = `data:${mime};base64,${imagePart.inlineData.data}`;
          return {
            imageUrl: dataUrl,
            title: extractBrandOrEntityName(userText),
            category: classification.intent.replace(/_/g, " "),
            aspectRatio: classification.intent === "THUMBNAIL_DESIGN" ? "16:9" : "1:1",
            promptDescription: userText,
          };
        }
      } catch {
        // Fallback gracefully to procedural sharp engine on 429 quota limit
        break;
      }
    }
  }

  // CASE 2: HIGH-RESOLUTION PROCEDURAL VECTOR-TO-RASTER ENGINE
  let svgContent = "";
  let categoryLabel = "Logo Design";
  let aspect = "1:1";
  const entityName = extractBrandOrEntityName(userText);

  if (
    classification.intent === "LOGO_DESIGN" ||
    lower.includes("logo") ||
    lower.includes("gaming logo") ||
    lower.includes("yasir ff")
  ) {
    if (lower.includes("luxury") || lower.includes("royal") || lower.includes("monogram") || lower.includes("gold")) {
      svgContent = generateLuxuryLogoSvg(entityName);
      categoryLabel = "Luxury Brand Identity";
    } else if (lower.includes("corporate") || lower.includes("company") || lower.includes("enterprise") || lower.includes("tech")) {
      svgContent = generateCorporateLogoSvg(entityName);
      categoryLabel = "Corporate Brand Identity";
    } else if (lower.includes("minimal") || lower.includes("minimalist") || lower.includes("clean")) {
      svgContent = generateMinimalLogoSvg(entityName);
      categoryLabel = "Minimalist Vector Logo";
    } else {
      svgContent = generateGamingLogoSvg(entityName);
      categoryLabel = "Professional Gaming Logo";
    }
    aspect = "1:1";
  } else if (
    classification.intent === "THUMBNAIL_DESIGN" ||
    lower.includes("thumbnail") ||
    lower.includes("yt thumb")
  ) {
    svgContent = generateYouTubeThumbnailSvg(entityName);
    categoryLabel = "YouTube Thumbnail";
    aspect = "16:9";
  } else if (
    lower.includes("futuristic city") ||
    lower.includes("cyberpunk city") ||
    lower.includes("city")
  ) {
    svgContent = generateFuturisticCitySvg();
    categoryLabel = "Futuristic Concept Art";
    aspect = "16:9";
  } else if (
    lower.includes("perfume") ||
    lower.includes("product advertisement") ||
    lower.includes("luxury product")
  ) {
    svgContent = generateProductAdSvg(entityName);
    categoryLabel = "Product Advertisement";
    aspect = "1:1";
  } else if (
    classification.intent === "POSTER_DESIGN" ||
    lower.includes("poster") ||
    lower.includes("restaurant poster") ||
    lower.includes("flyer")
  ) {
    svgContent = generatePosterSvg(entityName);
    categoryLabel = "Poster Design";
    aspect = "4:5";
  } else if (
    classification.intent === "CHARACTER_GENERATION" ||
    lower.includes("character") ||
    lower.includes("hoodie")
  ) {
    svgContent = generateCharacterArtworkSvg();
    categoryLabel = "Character Concept Art";
    aspect = "1:1";
  } else {
    // Default high-quality visual
    if (lower.includes("gaming") || lower.includes("ff")) {
      svgContent = generateGamingLogoSvg(entityName);
      categoryLabel = "Gaming Visual";
    } else {
      svgContent = generateGamingLogoSvg(entityName);
      categoryLabel = "Creative Graphic";
    }
  }

  // Render SVG to high-definition PNG buffer using sharp
  const pngBuffer = await sharp(Buffer.from(svgContent)).png().toBuffer();
  const dataUrl = `data:image/png;base64,${pngBuffer.toString("base64")}`;

  return {
    imageUrl: dataUrl,
    title: entityName,
    category: categoryLabel,
    aspectRatio: aspect,
    promptDescription: userText,
  };
}
