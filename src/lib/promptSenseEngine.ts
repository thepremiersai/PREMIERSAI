import {
  generateFitnessWebsiteHtml,
  generateMedicalWebsiteHtml,
  generateCryptoWebsiteHtml,
  generateRealEstateWebsiteHtml,
} from "./websiteTemplates";

/**
 * PREMIERS AI — Prompt Sense Engine
 * Intelligently analyzes user messages to detect:
 * 1. Creative Visual Requests (Logos, Free Fire / Gaming mascot crests, YouTube logos, Thumbnails, Posters)
 * 2. Website Development Requests (Interactive multi-section web apps with live preview)
 */

export interface CreativeIntentResult {
  isCreative: boolean;
  category: "logo" | "image" | "thumbnail" | "poster" | "banner";
  theme:
    | "company_logo"
    | "tech"
    | "car"
    | "landscape"
    | "cyber_city"
    | "space"
    | "animal"
    | "anime"
    | "architecture"
    | "food"
    | "luxury"
    | "abstract"
    | "fitness"
    | "crypto"
    | "medical"
    | "robotics"
    | "fantasy"
    | "portrait"
    | "universal"
    | "free_fire"
    | "youtube"
    | "cyber_gaming"
    | "standard";
  title: string;
  subtitle: string;
  promptDescription: string;
}

export interface WebsiteIntentResult {
  isWebsite: boolean;
  industry:
    | "gaming"
    | "coffee"
    | "portfolio"
    | "saas"
    | "restaurant"
    | "ecommerce"
    | "agency"
    | "fitness"
    | "medical"
    | "realestate"
    | "crypto"
    | "general";
  title: string;
  htmlCode: string;
}

/**
 * Clean and extract the brand or entity name from user prompt
 */
function extractBrandName(rawText: string, theme: string): string {
  // 1. Quoted string priority: e.g. 'Horizon' or "Nexus Tech"
  const quoted = rawText.match(/["'“]([^"'”]+)["'”]/);
  if (quoted && quoted[1].trim()) {
    return quoted[1].trim();
  }

  // 2. Explicit identifier priority: "named X", "called X", "brand X", "company X"
  const namedMatch = rawText.match(/\b(?:named|called|brand|company|for)\s+([A-Za-z0-9][A-Za-z0-9\s&'-]{1,26})/i);
  if (namedMatch && namedMatch[1].trim()) {
    const candidate = namedMatch[1].trim().replace(/\b(a|an|the|with|and|in)\b$/gi, "").trim();
    if (candidate.length >= 2 && !["logo", "image", "website", "banner", "poster"].includes(candidate.toLowerCase())) {
      return candidate
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
  }

  // 3. Clean out common command & trigger words to preserve the actual subject
  let cleaned = rawText
    .replace(/\b(create|make|generate|design|build|draw|give|want|need|show|paint|render)\b/gi, "")
    .replace(/\b(a|an|the|for|my|our|with|using|in|of|on|at|and|please|plz|banao|bana do|bana dein|chahiye)\b/gi, "")
    .replace(/\b(logo|logos|لوگو|شعار|thumbnail|banner|poster|avatar|badge|icon|picture|image|photo|wallpaper|art|render|tasveer|تصویر)\b/gi, "")
    .replace(/\b(free fire|freefire|ff|yt|youtube|gaming|esports|bg|background)\b/gi, "")
    .trim();

  // If uppercase acronym exists (e.g. BMW, AI, NASA, APEX)
  const capsMatch = rawText.match(/\b([A-Z0-9]{3,12})\b/);
  if (capsMatch && capsMatch[1] && !["LOGO", "FREE", "FIRE", "MAKE", "WITH", "IMAGE", "CREATE", "DESIGN"].includes(capsMatch[1])) {
    return capsMatch[1];
  }

  // Remove trailing punctuation
  cleaned = cleaned.replace(/[.,?!:;]/g, "").trim();

  if (cleaned.length >= 2 && cleaned.length <= 34) {
    return cleaned
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  // Thematic fallback defaults (clean, professional, brand-appropriate)
  if (theme === "car") return "APEX HYPERCAR GT";
  if (theme === "landscape") return "ALPINE SUNSET HORIZON";
  if (theme === "cyber_city") return "NEO CYBER CITY 2099";
  if (theme === "space") return "COSMIC ODYSSEY";
  if (theme === "animal") return "MAJESTIC GOLDEN LION";
  if (theme === "anime") return "CYBER SHINOBI";
  if (theme === "architecture") return "MODERN GLASS VILLA";
  if (theme === "food") return "ARTISANAL GOURMET";
  if (theme === "abstract") return "PRISMATIC CHROME";
  if (theme === "company_logo") return "NEXUS ENTERPRISE";
  if (theme === "luxury") return "AURA ROYAL HERITAGE";
  if (theme === "tech") return "QUANTUM TECH CORP";
  if (theme === "fitness") return "TITAN IRON ATHLETICS";
  if (theme === "crypto") return "GENESIS BLOCKCHAIN";
  if (theme === "medical") return "NOVA HEALTH CLINIC";
  if (theme === "robotics") return "SYNTHETIC AI CORE";
  if (theme === "fantasy") return "ASTRAL CITADEL";
  if (theme === "portrait") return "CYBERNETIC MUSE";
  if (theme === "free_fire") return "APEX BATTLE ROYALE";
  if (theme === "youtube") return "CREATOR STUDIO PRO";
  if (theme === "cyber_gaming") return "NEXUS ESPORTS ARENA";
  return "PREMIERS VISUAL CORE";
}

/**
 * Intelligent Sense Engine for Creative Visuals (Logos, Images, Landscapes, Cars, Space, etc.)
 */
export function detectCreativeIntent(text: string): CreativeIntentResult | null {
  const lower = text.toLowerCase();

  // Primary triggers for visual generation
  const isLogo =
    lower.includes("logo") ||
    lower.includes("لوگو") ||
    lower.includes("شعار") ||
    lower.includes("emblem") ||
    lower.includes("avatar") ||
    lower.includes("badge") ||
    lower.includes("mascot");

  const isThumbnail =
    lower.includes("thumbnail") ||
    lower.includes("تھمب نیل") ||
    lower.includes("صورة مصغرة");

  const isBanner =
    lower.includes("banner") ||
    lower.includes("بینر") ||
    lower.includes("بانر") ||
    lower.includes("header");

  const isPoster =
    lower.includes("poster") ||
    lower.includes("پوسٹر") ||
    lower.includes("ملصق");

  const isGenericImage =
    lower.includes("image") ||
    lower.includes("picture") ||
    lower.includes("photo") ||
    lower.includes("pic") ||
    lower.includes("wallpaper") ||
    lower.includes("drawing") ||
    lower.includes("artwork") ||
    lower.includes("tasveer") ||
    lower.includes("تصویر") ||
    lower.includes("عکس") ||
    lower.includes("صورة") ||
    lower.includes("paint") ||
    lower.includes("render");

  if (!isLogo && !isThumbnail && !isBanner && !isPoster && !isGenericImage) {
    return null;
  }

  // 1. Detect Category
  let category: "logo" | "image" | "thumbnail" | "poster" | "banner" = "image";
  if (isLogo) category = "logo";
  else if (isThumbnail) category = "thumbnail";
  else if (isBanner) category = "banner";
  else if (isPoster) category = "poster";

  // 2. Detect Theme & Specific Sensitivities
  let theme: CreativeIntentResult["theme"] = category === "logo" ? "company_logo" : "landscape";

  const isCar =
    lower.includes("car") ||
    lower.includes("supercar") ||
    lower.includes("sports car") ||
    lower.includes("hypercar") ||
    lower.includes("vehicle") ||
    lower.includes("racing") ||
    lower.includes("automotive") ||
    lower.includes("bmw") ||
    lower.includes("lamborghini") ||
    lower.includes("ferrari") ||
    lower.includes("porsche");

  const isLandscape =
    lower.includes("landscape") ||
    lower.includes("mountain") ||
    lower.includes("sunset") ||
    lower.includes("sunrise") ||
    lower.includes("nature") ||
    lower.includes("lake") ||
    lower.includes("river") ||
    lower.includes("forest") ||
    lower.includes("beach") ||
    lower.includes("scenery") ||
    lower.includes("horizon");

  const isSpace =
    lower.includes("space") ||
    lower.includes("astronaut") ||
    lower.includes("planet") ||
    lower.includes("galaxy") ||
    lower.includes("nebula") ||
    lower.includes("moon") ||
    lower.includes("mars") ||
    lower.includes("stars") ||
    lower.includes("cosmos");

  const isCyberCity =
    lower.includes("cyberpunk") ||
    lower.includes("neon city") ||
    lower.includes("metropolis") ||
    lower.includes("skyline") ||
    lower.includes("futuristic city") ||
    lower.includes("city") ||
    lower.includes("tokyo");

  const isAnimal =
    lower.includes("animal") ||
    lower.includes("lion") ||
    lower.includes("tiger") ||
    lower.includes("wolf") ||
    lower.includes("eagle") ||
    lower.includes("dragon") ||
    lower.includes("bird") ||
    lower.includes("horse") ||
    lower.includes("cat") ||
    lower.includes("dog") ||
    lower.includes("phoenix") ||
    lower.includes("wildlife") ||
    lower.includes("sher");

  const isAnime =
    lower.includes("anime") ||
    lower.includes("manga") ||
    lower.includes("samurai") ||
    lower.includes("katana") ||
    lower.includes("ninja") ||
    lower.includes("character") ||
    lower.includes("hero");

  const isArchitecture =
    lower.includes("villa") ||
    lower.includes("mansion") ||
    lower.includes("house") ||
    lower.includes("architecture") ||
    lower.includes("building") ||
    lower.includes("penthouse");

  const isFood =
    lower.includes("food") ||
    lower.includes("coffee") ||
    lower.includes("cafe") ||
    lower.includes("burger") ||
    lower.includes("pizza") ||
    lower.includes("dessert") ||
    lower.includes("restaurant") ||
    lower.includes("kitchen");

  const isAbstract =
    lower.includes("abstract") ||
    lower.includes("3d render") ||
    lower.includes("geometric") ||
    lower.includes("chrome") ||
    lower.includes("hologram") ||
    lower.includes("prism");

  const isCompanyLogo =
    lower.includes("company") ||
    lower.includes("corporate") ||
    lower.includes("business") ||
    lower.includes("brand") ||
    lower.includes("enterprise") ||
    lower.includes("agency") ||
    lower.includes("firm") ||
    lower.includes("startup") ||
    (isLogo && !lower.includes("ff") && !lower.includes("fire") && !lower.includes("yt") && !lower.includes("gaming"));

  const isFreeFire =
    lower.includes("ff") ||
    lower.includes("free fire") ||
    lower.includes("freefire") ||
    lower.includes("garena") ||
    lower.includes("booyah") ||
    lower.includes("pubg") ||
    lower.includes("battle royale");

  const isYouTube =
    lower.includes("yt") ||
    lower.includes("youtube") ||
    lower.includes("channel") ||
    lower.includes("vlog") ||
    lower.includes("streamer");

  const isCyberGaming =
    lower.includes("gaming") ||
    lower.includes("esports") ||
    lower.includes("clan") ||
    lower.includes("gamer") ||
    lower.includes("discord");

  const isLuxury =
    lower.includes("luxury") ||
    lower.includes("royal") ||
    lower.includes("gold") ||
    lower.includes("jewelry") ||
    lower.includes("real estate") ||
    lower.includes("vip");

  const isTech =
    lower.includes("tech") ||
    lower.includes("ai") ||
    lower.includes("software") ||
    lower.includes("code") ||
    lower.includes("quantum");

  const isFitness =
    lower.includes("fitness") ||
    lower.includes("gym") ||
    lower.includes("workout") ||
    lower.includes("bodybuilding") ||
    lower.includes("muscle") ||
    lower.includes("crossfit") ||
    lower.includes("athletics");

  const isCrypto =
    lower.includes("crypto") ||
    lower.includes("bitcoin") ||
    lower.includes("btc") ||
    lower.includes("ethereum") ||
    lower.includes("eth") ||
    lower.includes("blockchain") ||
    lower.includes("web3") ||
    lower.includes("nft") ||
    lower.includes("token");

  const isMedical =
    lower.includes("medical") ||
    lower.includes("doctor") ||
    lower.includes("hospital") ||
    lower.includes("clinic") ||
    lower.includes("healthcare") ||
    lower.includes("dental") ||
    lower.includes("pharma") ||
    lower.includes("health");

  const isRobotics =
    lower.includes("robot") ||
    lower.includes("robotics") ||
    lower.includes("android") ||
    lower.includes("cyborg") ||
    lower.includes("mecha") ||
    lower.includes("automaton");

  const isFantasy =
    lower.includes("fantasy") ||
    lower.includes("magic") ||
    lower.includes("wizard") ||
    lower.includes("castle") ||
    lower.includes("dragon") ||
    lower.includes("spire") ||
    lower.includes("mythic");

  const isPortrait =
    lower.includes("portrait") ||
    lower.includes("face") ||
    lower.includes("headshot") ||
    lower.includes("fashion model") ||
    lower.includes("cybernetic person");

  if (isCar) theme = "car";
  else if (isLandscape) theme = "landscape";
  else if (isSpace) theme = "space";
  else if (isCyberCity) theme = "cyber_city";
  else if (isAnimal) theme = "animal";
  else if (isAnime) theme = "anime";
  else if (isArchitecture) theme = "architecture";
  else if (isFood) theme = "food";
  else if (isAbstract) theme = "abstract";
  else if (isFitness) theme = "fitness";
  else if (isCrypto) theme = "crypto";
  else if (isMedical) theme = "medical";
  else if (isRobotics) theme = "robotics";
  else if (isFantasy) theme = "fantasy";
  else if (isPortrait) theme = "portrait";
  else if (isCompanyLogo) theme = "company_logo";
  else if (isFreeFire) theme = "free_fire";
  else if (isYouTube) theme = "youtube";
  else if (isCyberGaming) theme = "cyber_gaming";
  else if (isLuxury) theme = "luxury";
  else if (isTech) theme = "tech";
  else {
    theme = category === "logo" ? "company_logo" : "universal";
  }

  // 3. Extract Entity Name
  const brandName = extractBrandName(text, theme);

  // 4. Determine Dynamic Subtitle
  let subtitle = "UNIVERSAL CREATIVE SUITE";
  if (theme === "car") subtitle = "AERODYNAMIC PRECISION • 4K HIGH DEFINITION";
  else if (theme === "landscape") subtitle = "4K CINEMATIC SUNSET HORIZON";
  else if (theme === "space") subtitle = "DEEP SPACE DISCOVERY • PREMIERS AI";
  else if (theme === "cyber_city") subtitle = "FUTURISTIC METROPOLIS • 4K RENDER";
  else if (theme === "animal") subtitle = "WILDLIFE ARTWORK • PREMIERS AI";
  else if (theme === "anime") subtitle = "MANGA & ANIME ART • PREMIERS AI";
  else if (theme === "architecture") subtitle = "LUXURY ARCHITECTURAL DESIGN";
  else if (theme === "food") subtitle = "CULINARY EXCELLENCE • PREMIERS AI";
  else if (theme === "abstract") subtitle = "3D HOLOGRAPHIC GEOMETRY";
  else if (theme === "fitness") subtitle = "ELITE ATHLETICS & HIGH PERFORMANCE";
  else if (theme === "crypto") subtitle = "DECENTRALIZED PROTOCOL & WEB3 SMART CORE";
  else if (theme === "medical") subtitle = "ADVANCED HEALTHCARE & BIOMEDICAL PRECISION";
  else if (theme === "robotics") subtitle = "AUTONOMOUS CYBERNETICS & AI CORE";
  else if (theme === "fantasy") subtitle = "ETHEREAL CITADEL & MYTHIC REALM";
  else if (theme === "portrait") subtitle = "CINEMATIC FASHION PORTRAIT • 4K HIGH FIDELITY";
  else if (theme === "company_logo") subtitle = "GLOBAL INNOVATION & TECHNOLOGY ENTERPRISE";
  else if (theme === "free_fire") subtitle = "BATTLE ROYALE PRO ESPORTS CLAN";
  else if (theme === "youtube") subtitle = "OFFICIAL YOUTUBE CHANNEL • VERIFIED CREATOR";
  else if (theme === "cyber_gaming") subtitle = "CHAMPIONSHIP ESPORTS & GAMING GUILD";
  else if (theme === "luxury") subtitle = "PRESTIGE & BESPOKE COLLECTION";
  else if (theme === "tech") subtitle = "NEXT-GENERATION ARTIFICIAL INTELLIGENCE";
  else subtitle = "PREMIERS AI UNIVERSAL ART ENGINE";

  const promptDescription = `Generated ${theme.replace("_", " ").toUpperCase()} ${category.toUpperCase()} for "${brandName}" with customized lighting, atmospheric geometry, and high-definition canvas rendering.`;

  return {
    isCreative: true,
    category,
    theme,
    title: brandName,
    subtitle,
    promptDescription,
  };
}

/**
 * Intelligent Sense Engine for Interactive Website Development
 */
export function detectWebsiteIntent(text: string): WebsiteIntentResult | null {
  const lower = text.toLowerCase();

  const isWebReq =
    lower.includes("website") ||
    lower.includes("landing page") ||
    lower.includes("web app") ||
    lower.includes("portfolio") ||
    lower.includes("ویب سائٹ") ||
    lower.includes("موقع") ||
    lower.includes("build site") ||
    lower.includes("create site");

  if (!isWebReq) return null;

  // Extract explicit brand or business name if provided by user
  const namedMatch = text.match(/\b(?:for|named|called|brand|company|startup|firm)\s+([A-Za-z0-9][A-Za-z0-9\s&'-]{1,24})/i);
  let customBrand = "";
  if (namedMatch && namedMatch[1].trim()) {
    const candidate = namedMatch[1].trim().replace(/\b(a|an|the|with|and|in)\b$/gi, "").trim();
    if (candidate.length >= 2 && !["website", "landing page", "web app", "portfolio"].includes(candidate.toLowerCase())) {
      customBrand = candidate
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
  }

  let industry: WebsiteIntentResult["industry"] = "general";
  let title = customBrand ? `${customBrand} — Interactive Platform` : "PREMIERS Interactive Platform";

  if (lower.includes("free fire") || lower.includes("booyah")) {
    industry = "gaming";
    title = customBrand ? `${customBrand} — Battle Royale Clan` : "Vanguard — Battle Royale Championship Guild";
  } else if (lower.includes("gaming") || lower.includes("esports") || lower.includes("clan") || lower.includes("tournament")) {
    industry = "gaming";
    title = customBrand ? `${customBrand} — Championship Arena` : "Nexus Esports — Championship Gaming Arena";
  } else if (lower.includes("fitness") || lower.includes("gym") || lower.includes("workout") || lower.includes("crossfit") || lower.includes("athletic")) {
    industry = "fitness";
    title = customBrand ? `${customBrand} — Elite Athletic Club` : "Apex Fitness — Elite Strength & Conditioning";
  } else if (lower.includes("medical") || lower.includes("doctor") || lower.includes("hospital") || lower.includes("clinic") || lower.includes("dental") || lower.includes("health")) {
    industry = "medical";
    title = customBrand ? `${customBrand} — Healthcare Center` : "Nova Health — Modern Multispecialty Medical Center";
  } else if (lower.includes("real estate") || lower.includes("property") || lower.includes("villa") || lower.includes("realty") || lower.includes("penthouse") || lower.includes("apartment")) {
    industry = "realestate";
    title = customBrand ? `${customBrand} — Luxury Residences` : "Aura Estates — Luxury Modern Residences & Penthouses";
  } else if (lower.includes("crypto") || lower.includes("blockchain") || lower.includes("web3") || lower.includes("defi") || lower.includes("token") || lower.includes("bitcoin")) {
    industry = "crypto";
    title = customBrand ? `${customBrand} — DeFi Protocol` : "Decentral AI — Web3 DeFi & Digital Asset Protocol";
  } else if (lower.includes("coffee") || lower.includes("cafe") || lower.includes("espresso") || lower.includes("bakery")) {
    industry = "coffee";
    title = customBrand ? `${customBrand} — Artisanal Roastery` : "Aura Roasters — Artisanal Coffee Bar";
  } else if (lower.includes("portfolio") || lower.includes("resume") || lower.includes("developer") || lower.includes("designer")) {
    industry = "portfolio";
    title = customBrand ? `${customBrand} — Portfolio & Engineering` : "Alex Vance — Full Stack Engineer & Designer";
  } else if (lower.includes("restaurant") || lower.includes("burger") || lower.includes("pizza") || lower.includes("dining") || lower.includes("bistro")) {
    industry = "restaurant";
    title = customBrand ? `${customBrand} — Gourmet Dining` : "Savor Bistro — Modern Gourmet Kitchen";
  } else if (lower.includes("shop") || lower.includes("store") || lower.includes("ecommerce") || lower.includes("boutique") || lower.includes("apparel")) {
    industry = "ecommerce";
    title = customBrand ? `${customBrand} — Curated Store` : "Luxe Store — Minimalist Apparel & Goods";
  } else if (lower.includes("agency") || lower.includes("marketing") || lower.includes("consulting")) {
    industry = "agency";
    title = customBrand ? `${customBrand} — Creative Agency` : "Vanguard — Global Creative & AI Agency";
  } else if (customBrand) {
    industry = "general";
    title = `${customBrand} — Official Platform`;
  } else {
    industry = "saas";
    title = "NextGen AI — Universal Intelligent Workspace";
  }

  // Generate complete, robust, self-contained interactive website code
  const htmlCode = generateIndustryWebsiteHtml(industry, title);

  return {
    isWebsite: true,
    industry,
    title,
    htmlCode,
  };
}

/**
 * Builds realistic, multi-section, interactive HTML websites with full in-page event systems,
 * cart mechanics, filter engines, interactive modals, and toast notifications (avoiding broken iframe alerts).
 */
function generateIndustryWebsiteHtml(
  industry: WebsiteIntentResult["industry"],
  title: string
): string {
  const currentYear = new Date().getFullYear();

  if (industry === "fitness") {
    return generateFitnessWebsiteHtml(title, currentYear);
  }
  if (industry === "medical") {
    return generateMedicalWebsiteHtml(title, currentYear);
  }
  if (industry === "crypto") {
    return generateCryptoWebsiteHtml(title, currentYear);
  }
  if (industry === "realestate") {
    return generateRealEstateWebsiteHtml(title, currentYear);
  }

  if (industry === "gaming") {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background:#0a0505; color:#f5f5f7; font-family:system-ui,-apple-system,sans-serif; }
    .fire-glow { text-shadow: 0 0 24px rgba(255, 77, 0, 0.8); }
    .neon-border { box-shadow: 0 0 15px rgba(239, 68, 68, 0.2); }
  </style>
</head>
<body class="min-h-screen flex flex-col relative pb-12">
  <!-- Toast Notification Container -->
  <div id="toast" class="fixed top-5 right-5 z-50 transform translate-y-[-120%] opacity-0 transition-all duration-300 pointer-events-none max-w-sm w-full bg-zinc-900/95 border border-orange-500/60 p-4 rounded-xl shadow-2xl flex items-start gap-3">
    <div class="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center font-black shrink-0 text-sm">🔥</div>
    <div>
      <h4 id="toastTitle" class="text-sm font-bold text-white">Notification</h4>
      <p id="toastMessage" class="text-xs text-gray-300 mt-0.5 leading-relaxed">Status update</p>
    </div>
  </div>

  <!-- Navigation -->
  <nav class="border-b border-red-950 bg-black/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-2.5 font-black tracking-wider text-xl text-orange-500">
      <span class="text-2xl">🔥</span>
      <span>${title.toUpperCase()}</span>
    </div>
    <div class="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-gray-300">
      <a href="#roster" class="hover:text-orange-400 transition">Roster</a>
      <a href="#tournaments" class="hover:text-orange-400 transition">Tournaments</a>
      <a href="#recruitment" class="hover:text-orange-400 transition">Recruitment</a>
    </div>
    <div class="flex items-center gap-3">
      <button onclick="openTryoutModal()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-xs tracking-wider uppercase transition shadow-lg shadow-orange-600/30 active:scale-95">
        Join Tryouts
      </button>
    </div>
  </nav>

  <!-- Hero -->
  <header class="relative px-6 py-16 text-center max-w-4xl mx-auto flex flex-col items-center">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/20 border border-orange-500/40 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
      <span>✦ Grandmaster Tier Esports Division</span>
    </div>
    <h1 class="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
      UNLEASH UNDISPUTED <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-amber-400 fire-glow">DOMINANCE</span>
    </h1>
    <p class="text-gray-300 text-sm sm:text-base max-w-2xl mb-8 leading-relaxed">
      Welcome to the official arena of ${title}. Explore active tournament statistics, recruit our roster of elite sharpshooters, or register for seasonal squad tryouts.
    </p>
    <div class="flex flex-wrap items-center justify-center gap-4">
      <button onclick="openTryoutModal()" class="px-7 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-xl shadow-orange-500/30 active:scale-95">
        ⚡ Apply for Tryouts
      </button>
      <button onclick="toggleStatsDrawer()" class="px-7 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95">
        📊 View Live Guild Stats
      </button>
    </div>
  </header>

  <!-- Interactive Stats Counter Bar -->
  <section id="tournaments" class="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
    <div class="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center neon-border">
      <div class="text-3xl font-black text-orange-500 mb-1" id="statWinrate">96.4%</div>
      <div class="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Tournament Winrate</div>
    </div>
    <div class="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center neon-border">
      <div class="text-3xl font-black text-red-500 mb-1" id="statBooyahs">1,840+</div>
      <div class="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Booyahs Claimed</div>
    </div>
    <div class="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center neon-border">
      <div class="text-3xl font-black text-amber-400 mb-1">Top 5</div>
      <div class="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">National Rank</div>
    </div>
    <div class="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center neon-border">
      <div class="text-3xl font-black text-cyan-400 mb-1" id="statMembers">48 / 50</div>
      <div class="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Active Roster</div>
    </div>
  </section>

  <!-- Interactive Squad Roster with Category Filter & Search -->
  <section id="roster" class="max-w-5xl mx-auto px-6 py-10 w-full">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h2 class="text-2xl font-black text-white flex items-center gap-2">
        <span class="text-orange-500">✦</span> Elite Squad Lineup
      </h2>
      <!-- Search & Filters -->
      <div class="flex items-center gap-2">
        <input 
          id="playerSearch" 
          type="text" 
          placeholder="Filter player or weapon..." 
          oninput="filterPlayers()"
          class="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 w-44"
        />
        <div class="flex gap-1">
          <button onclick="setRoleFilter('all')" class="role-btn px-2.5 py-1 rounded-md text-xs font-bold bg-orange-600 text-white" data-role="all">All</button>
          <button onclick="setRoleFilter('sniper')" class="role-btn px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-800 text-gray-300 hover:text-white" data-role="sniper">Sniper</button>
          <button onclick="setRoleFilter('rusher')" class="role-btn px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-800 text-gray-300 hover:text-white" data-role="rusher">Rusher</button>
        </div>
      </div>
    </div>

    <div id="playersGrid" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="player-card p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-orange-500/50 transition group" data-role="sniper" data-name="Phantom Alpha" data-weapon="AWM Barrett">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold text-xl">🎯</div>
          <span class="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[10px] font-bold uppercase">Sniper Lead</span>
        </div>
        <h3 class="text-lg font-extrabold text-white group-hover:text-orange-400 transition">Phantom Alpha</h3>
        <p class="text-xs text-gray-400 mt-1">AWM & Barrett Specialist. 79% Headshot accuracy in regional tournament cups.</p>
        <div class="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <span class="text-gray-400">K/D: <strong class="text-white">6.84</strong></span>
          <button onclick="salutePlayer('Phantom Alpha')" class="px-2.5 py-1 rounded bg-zinc-800 hover:bg-orange-600 text-white text-[11px] font-bold transition">🔥 Salute</button>
        </div>
      </div>

      <div class="player-card p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-red-500/50 transition group" data-role="rusher" data-name="Viper Blaze" data-weapon="MP40 Shotgun">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xl">⚡</div>
          <span class="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase">Entry Rusher</span>
        </div>
        <h3 class="text-lg font-extrabold text-white group-hover:text-red-400 transition">Viper Blaze</h3>
        <p class="text-xs text-gray-400 mt-1">MP40 & Double Barrel rusher. Aggressive point capture and zone perimeter denial.</p>
        <div class="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <span class="text-gray-400">K/D: <strong class="text-white">7.12</strong></span>
          <button onclick="salutePlayer('Viper Blaze')" class="px-2.5 py-1 rounded bg-zinc-800 hover:bg-red-600 text-white text-[11px] font-bold transition">⚡ Salute</button>
        </div>
      </div>

      <div class="player-card p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-cyan-500/50 transition group" data-role="support" data-name="Shadow IGL" data-weapon="SCAR Gloo Wall">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-xl">🛡️</div>
          <span class="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold uppercase">Tactical IGL</span>
        </div>
        <h3 class="text-lg font-extrabold text-white group-hover:text-cyan-400 transition">Shadow IGL</h3>
        <p class="text-xs text-gray-400 mt-1">Tactical circle rotations, gloo-wall defense matrices, and end-game flank control.</p>
        <div class="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <span class="text-gray-400">K/D: <strong class="text-white">5.95</strong></span>
          <button onclick="salutePlayer('Shadow IGL')" class="px-2.5 py-1 rounded bg-zinc-800 hover:bg-cyan-600 text-white text-[11px] font-bold transition">🛡️ Salute</button>
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive Tryout Application Modal -->
  <div id="tryoutModal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div class="bg-zinc-900 border border-orange-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in-50 duration-200">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-black text-white flex items-center gap-2">
          <span>🔥</span> Register for Tryouts
        </h3>
        <button onclick="closeTryoutModal()" class="text-gray-400 hover:text-white text-lg font-bold">✕</button>
      </div>
      <form onsubmit="handleTryoutSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">In-Game Name (IGN)</label>
          <input required id="ignInput" type="text" placeholder="e.g. ApexLegend99" class="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-orange-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">Player UID (8-10 digits)</label>
          <input required id="uidInput" type="text" placeholder="e.g. 192837465" class="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-orange-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">Primary Role</label>
          <select id="roleInput" class="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-orange-500">
            <option value="Sniper">Sniper Specialist (AWM/Barrett)</option>
            <option value="Rusher">Aggressive Rusher (Shotgun/SMG)</option>
            <option value="IGL">Tactical IGL / Flanker</option>
            <option value="Support">Support & Medic Gloo Specialist</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">Current Ranked Tier</label>
          <select id="rankInput" class="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-orange-500">
            <option value="Grandmaster">Grandmaster (3,200+ pts)</option>
            <option value="Heroic">Heroic Tier</option>
            <option value="Diamond">Diamond IV</option>
          </select>
        </div>
        <div class="flex gap-2 pt-2">
          <button type="button" onclick="closeTryoutModal()" class="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold">Cancel</button>
          <button type="submit" class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold shadow-lg shadow-orange-600/30">Submit Tryout</button>
        </div>
      </form>
    </div>
  </div>

  <footer class="mt-auto border-t border-zinc-900 py-6 text-center text-xs text-gray-500">
    © ${currentYear} ${title} • Built with PREMIERS AI Interactive Platform
  </footer>

  <script>
    // Toast Notification Dispatcher
    function showToast(title, message) {
      const toast = document.getElementById('toast');
      document.getElementById('toastTitle').textContent = title;
      document.getElementById('toastMessage').textContent = message;
      toast.classList.remove('translate-y-[-120%]', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-[-120%]', 'opacity-0');
      }, 3500);
    }

    // Tryouts Modal Management
    function openTryoutModal() {
      document.getElementById('tryoutModal').classList.remove('hidden');
    }
    function closeTryoutModal() {
      document.getElementById('tryoutModal').classList.add('hidden');
    }
    function handleTryoutSubmit(e) {
      e.preventDefault();
      const ign = document.getElementById('ignInput').value;
      const role = document.getElementById('roleInput').value;
      closeTryoutModal();
      showToast('Application Received!', 'Tryout registered for ' + ign + ' (' + role + '). Clan leaders will review your KD in-game.');
      document.getElementById('statMembers').textContent = '49 / 50';
    }

    // Role Filtering
    let currentRole = 'all';
    function setRoleFilter(role) {
      currentRole = role;
      document.querySelectorAll('.role-btn').forEach(btn => {
        if (btn.dataset.role === role) {
          btn.className = 'role-btn px-2.5 py-1 rounded-md text-xs font-bold bg-orange-600 text-white';
        } else {
          btn.className = 'role-btn px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-800 text-gray-300 hover:text-white';
        }
      });
      filterPlayers();
    }

    function filterPlayers() {
      const search = document.getElementById('playerSearch').value.toLowerCase();
      document.querySelectorAll('.player-card').forEach(card => {
        const role = card.dataset.role;
        const name = card.dataset.name.toLowerCase();
        const weapon = card.dataset.weapon.toLowerCase();
        const matchesRole = currentRole === 'all' || role === currentRole;
        const matchesSearch = !search || name.includes(search) || weapon.includes(search);
        card.style.display = matchesRole && matchesSearch ? 'block' : 'none';
      });
    }

    // Interactive Salutes
    function salutePlayer(name) {
      showToast('Player Saluted!', 'You gave respect to ' + name + ' with an esports trophy token!');
    }

    // Guild Stats Drawer
    function toggleStatsDrawer() {
      showToast('Live Guild Stats Loaded', 'Season Kills: 9,240 • Winrate: 96.4% • Tier: Grandmaster Regional Top 5');
    }
  </script>
</body>
</html>`;
  }

  if (industry === "coffee") {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0e0d0b] text-[#f2efe9] min-h-screen flex flex-col font-sans relative pb-12">
  <!-- Interactive Toast Notification -->
  <div id="toast" class="fixed top-5 right-5 z-50 transform translate-y-[-120%] opacity-0 transition-all duration-300 pointer-events-none max-w-sm w-full bg-[#1c1914] border border-[#d4af37]/60 p-4 rounded-2xl shadow-2xl flex items-start gap-3">
    <div class="w-8 h-8 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center font-black shrink-0 text-sm">☕</div>
    <div>
      <h4 id="toastTitle" class="text-sm font-bold text-[#f2efe9]">Order Notification</h4>
      <p id="toastMessage" class="text-xs text-[#a39e93] mt-0.5 leading-relaxed">Status updated</p>
    </div>
  </div>

  <!-- Navigation -->
  <nav class="border-b border-[#2d2922] bg-[#14120e]/90 backdrop-blur sticky top-0 px-6 py-4 flex items-center justify-between z-40">
    <div class="text-lg font-serif font-bold tracking-wider text-[#d4af37] flex items-center gap-2">
      <span>☕</span>
      <span>${title.toUpperCase()}</span>
    </div>
    <div class="hidden sm:flex items-center gap-6 text-xs tracking-widest uppercase text-[#a39e93]">
      <a href="#menu" class="hover:text-[#d4af37] transition">Menu</a>
      <a href="#origins" class="hover:text-[#d4af37] transition">Origins</a>
      <a href="#about" class="hover:text-[#d4af37] transition">Roastery</a>
    </div>
    <button onclick="toggleCart()" class="relative px-4 py-2 rounded-full bg-[#d4af37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#ebd06b] transition active:scale-95 flex items-center gap-1.5 shadow-lg shadow-[#d4af37]/20">
      <span>🛍️ Bag</span>
      <span id="cartCountBadge" class="w-5 h-5 rounded-full bg-black text-[#d4af37] flex items-center justify-center text-[10px] font-black">0</span>
    </button>
  </nav>

  <!-- Hero -->
  <header class="px-6 py-16 text-center max-w-3xl mx-auto flex flex-col items-center">
    <span class="text-xs uppercase tracking-widest text-[#d4af37] font-semibold block mb-3">Slow-Crafted Artisanal Micro Roastery</span>
    <h1 class="text-4xl sm:text-5xl font-serif text-[#f2efe9] mb-6 leading-tight">
      Savor Every Single Origin Pour
    </h1>
    <p class="text-[#a39e93] text-sm sm:text-base leading-relaxed mb-8">
      Sustainably sourced from volcanic elevations of Huila, Colombia and Yirgacheffe, Ethiopia. Small batch wood-roasted daily for pure aromatic depth.
    </p>
    <div class="flex flex-wrap items-center justify-center gap-4">
      <a href="#menu" class="px-7 py-3 rounded-full bg-[#d4af37] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#ebd06b] transition shadow-lg shadow-[#d4af37]/20 active:scale-95">
        Explore Daily Brews
      </a>
      <button onclick="openTableBookingModal()" class="px-7 py-3 rounded-full bg-[#1c1914] border border-[#3d372e] text-[#f2efe9] font-bold text-xs uppercase tracking-widest hover:bg-[#2a241b] transition active:scale-95">
        Reserve Tasting Table
      </button>
    </div>
  </header>

  <!-- Interactive Menu with Live Cart Actions -->
  <section id="menu" class="max-w-4xl mx-auto px-6 py-10 w-full">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-2xl font-serif text-[#f2efe9]">Signature Brews & Pastries</h2>
      <div class="flex gap-2">
        <button onclick="filterCoffee('all')" class="c-filter px-3 py-1 rounded-full text-xs font-semibold bg-[#d4af37] text-black" data-cat="all">All</button>
        <button onclick="filterCoffee('brew')" class="c-filter px-3 py-1 rounded-full text-xs font-semibold bg-[#1c1914] text-[#a39e93] hover:text-white" data-cat="brew">Single Origin</button>
        <button onclick="filterCoffee('espresso')" class="c-filter px-3 py-1 rounded-full text-xs font-semibold bg-[#1c1914] text-[#a39e93] hover:text-white" data-cat="espresso">Espresso Bar</button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="coffee-card p-5 rounded-2xl bg-[#171410] border border-[#2d2922] flex justify-between items-center group hover:border-[#d4af37]/40 transition" data-cat="brew">
        <div>
          <h3 class="font-bold text-[#f2efe9] text-base group-hover:text-[#d4af37] transition">Yirgacheffe Floral Pour-Over</h3>
          <p class="text-xs text-[#a39e93] mt-1">Jasmine blossom, bergamot, golden peach nectar</p>
          <span class="font-serif font-bold text-[#d4af37] text-base inline-block mt-2">$6.50</span>
        </div>
        <button onclick="addToCart('Yirgacheffe Pour-Over', 6.50)" class="px-3.5 py-2 rounded-xl bg-[#241f17] hover:bg-[#d4af37] hover:text-black text-[#d4af37] font-bold text-xs transition active:scale-95">
          + Add
        </button>
      </div>

      <div class="coffee-card p-5 rounded-2xl bg-[#171410] border border-[#2d2922] flex justify-between items-center group hover:border-[#d4af37]/40 transition" data-cat="espresso">
        <div>
          <h3 class="font-bold text-[#f2efe9] text-base group-hover:text-[#d4af37] transition">Madagascar Vanilla Cortado</h3>
          <p class="text-xs text-[#a39e93] mt-1">Double ristretto, house-cured Bourbon vanilla bean</p>
          <span class="font-serif font-bold text-[#d4af37] text-base inline-block mt-2">$5.75</span>
        </div>
        <button onclick="addToCart('Vanilla Cortado', 5.75)" class="px-3.5 py-2 rounded-xl bg-[#241f17] hover:bg-[#d4af37] hover:text-black text-[#d4af37] font-bold text-xs transition active:scale-95">
          + Add
        </button>
      </div>

      <div class="coffee-card p-5 rounded-2xl bg-[#171410] border border-[#2d2922] flex justify-between items-center group hover:border-[#d4af37]/40 transition" data-cat="brew">
        <div>
          <h3 class="font-bold text-[#f2efe9] text-base group-hover:text-[#d4af37] transition">Geisha Reserve Cold Drip</h3>
          <p class="text-xs text-[#a39e93] mt-1">16-hour slow ice drip, notes of white grape & candied lemon</p>
          <span class="font-serif font-bold text-[#d4af37] text-base inline-block mt-2">$8.00</span>
        </div>
        <button onclick="addToCart('Geisha Cold Drip', 8.00)" class="px-3.5 py-2 rounded-xl bg-[#241f17] hover:bg-[#d4af37] hover:text-black text-[#d4af37] font-bold text-xs transition active:scale-95">
          + Add
        </button>
      </div>

      <div class="coffee-card p-5 rounded-2xl bg-[#171410] border border-[#2d2922] flex justify-between items-center group hover:border-[#d4af37]/40 transition" data-cat="espresso">
        <div>
          <h3 class="font-bold text-[#f2efe9] text-base group-hover:text-[#d4af37] transition">Smoked Sea Salt Caramel Flat White</h3>
          <p class="text-xs text-[#a39e93] mt-1">Micro-foamed oat milk, fleur de sel, dark cacao dust</p>
          <span class="font-serif font-bold text-[#d4af37] text-base inline-block mt-2">$6.25</span>
        </div>
        <button onclick="addToCart('Salted Caramel Flat White', 6.25)" class="px-3.5 py-2 rounded-xl bg-[#241f17] hover:bg-[#d4af37] hover:text-black text-[#d4af37] font-bold text-xs transition active:scale-95">
          + Add
        </button>
      </div>
    </div>
  </section>

  <!-- Interactive Slide-over Cart Drawer -->
  <div id="cartDrawer" class="fixed inset-0 z-50 hidden">
    <div onclick="toggleCart()" class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
    <div class="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#161410] border-l border-[#2d2922] p-6 flex flex-col shadow-2xl">
      <div class="flex items-center justify-between pb-4 border-b border-[#2d2922]">
        <h3 class="text-lg font-serif font-bold text-[#f2efe9]">Your Roastery Order</h3>
        <button onclick="toggleCart()" class="text-gray-400 hover:text-white font-bold text-lg">✕</button>
      </div>
      <div id="cartItemsList" class="flex-1 overflow-y-auto py-4 space-y-3">
        <p class="text-xs text-[#a39e93] text-center py-10">Your bag is currently empty. Add your favorite roast!</p>
      </div>
      <div class="pt-4 border-t border-[#2d2922]">
        <div class="flex justify-between items-center mb-4">
          <span class="text-xs uppercase tracking-wider text-[#a39e93]">Subtotal</span>
          <span id="cartSubtotal" class="font-serif text-xl font-bold text-[#d4af37]">$0.00</span>
        </div>
        <button onclick="checkoutCart()" class="w-full py-3.5 rounded-full bg-[#d4af37] hover:bg-[#ebd06b] text-black font-bold text-xs uppercase tracking-widest transition active:scale-95">
          Place Counter Order
        </button>
      </div>
    </div>
  </div>

  <!-- Interactive Tasting Table Booking Modal -->
  <div id="tableModal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div class="bg-[#171410] border border-[#d4af37]/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-serif font-bold text-[#f2efe9]">Reserve Tasting Table</h3>
        <button onclick="closeTableBookingModal()" class="text-gray-400 hover:text-white font-bold text-lg">✕</button>
      </div>
      <form onsubmit="handleTableReserve(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-[#a39e93] mb-1">Your Full Name</label>
          <input required id="bookName" type="text" placeholder="e.g. Eleanor Vance" class="w-full px-3 py-2 rounded-xl bg-[#201c16] border border-[#3d372e] text-xs text-white focus:outline-none focus:border-[#d4af37]" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-[#a39e93] mb-1">Number of Guests</label>
          <select id="bookGuests" class="w-full px-3 py-2 rounded-xl bg-[#201c16] border border-[#3d372e] text-xs text-white focus:outline-none focus:border-[#d4af37]">
            <option value="2 Guests">2 Guests (Intimate Tasting Bar)</option>
            <option value="4 Guests">4 Guests (Private Corner Table)</option>
            <option value="6+ Guests">6+ Guests (Master Cupping Flight)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-[#a39e93] mb-1">Preferred Time Window</label>
          <select id="bookTime" class="w-full px-3 py-2 rounded-xl bg-[#201c16] border border-[#3d372e] text-xs text-white focus:outline-none focus:border-[#d4af37]">
            <option value="Morning 09:00 AM">Morning 09:00 AM</option>
            <option value="Noon 12:30 PM">Noon 12:30 PM</option>
            <option value="Afternoon 03:00 PM">Afternoon 03:00 PM</option>
          </select>
        </div>
        <div class="flex gap-2 pt-2">
          <button type="button" onclick="closeTableBookingModal()" class="flex-1 py-2.5 rounded-full bg-[#241f17] text-white text-xs font-bold">Cancel</button>
          <button type="submit" class="flex-1 py-2.5 rounded-full bg-[#d4af37] text-black text-xs font-bold hover:bg-[#ebd06b]">Confirm Reservation</button>
        </div>
      </form>
    </div>
  </div>

  <footer class="mt-auto border-t border-[#2d2922] py-6 text-center text-xs text-[#6e685c]">
    © ${currentYear} ${title} • Crafted with PREMIERS AI Interactive Platform
  </footer>

  <script>
    // Toast Notification Engine
    function showToast(title, message) {
      const toast = document.getElementById('toast');
      document.getElementById('toastTitle').textContent = title;
      document.getElementById('toastMessage').textContent = message;
      toast.classList.remove('translate-y-[-120%]', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-[-120%]', 'opacity-0');
      }, 3500);
    }

    // Cart Management Engine
    const cart = [];
    function addToCart(name, price) {
      const existing = cart.find(item => item.name === name);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ name, price, qty: 1 });
      }
      updateCartUI();
      showToast('Added to Bag', name + ' has been added to your coffee order.');
    }

    function updateCartUI() {
      const count = cart.reduce((acc, item) => acc + item.qty, 0);
      document.getElementById('cartCountBadge').textContent = count;
      const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
      document.getElementById('cartSubtotal').textContent = '$' + subtotal.toFixed(2);

      const list = document.getElementById('cartItemsList');
      if (cart.length === 0) {
        list.innerHTML = '<p class="text-xs text-[#a39e93] text-center py-10">Your bag is currently empty. Add your favorite roast!</p>';
        return;
      }
      list.innerHTML = cart.map((item, idx) => \`
        <div class="p-3 rounded-xl bg-[#201c16] border border-[#2d2922] flex items-center justify-between">
          <div>
            <h4 class="text-xs font-bold text-white">\${item.name}</h4>
            <span class="text-[11px] text-[#d4af37] font-serif">$\${item.price.toFixed(2)} each</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="changeQty(\${idx}, -1)" class="w-6 h-6 rounded bg-[#2c261e] text-white text-xs font-bold flex items-center justify-center">-</button>
            <span class="text-xs font-bold text-white">\${item.qty}</span>
            <button onclick="changeQty(\${idx}, 1)" class="w-6 h-6 rounded bg-[#2c261e] text-white text-xs font-bold flex items-center justify-center">+</button>
          </div>
        </div>
      \`).join('');
    }

    function changeQty(idx, delta) {
      cart[idx].qty += delta;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
      updateCartUI();
    }

    function toggleCart() {
      const drawer = document.getElementById('cartDrawer');
      drawer.classList.toggle('hidden');
    }

    function checkoutCart() {
      if (cart.length === 0) {
        showToast('Empty Bag', 'Please add items to your bag before checking out.');
        return;
      }
      toggleCart();
      showToast('Order Placed Successfully!', 'Your order has been sent to our barista counter. Freshly brewing now!');
      cart.length = 0;
      updateCartUI();
    }

    // Filter Logic
    function filterCoffee(cat) {
      document.querySelectorAll('.c-filter').forEach(btn => {
        if (btn.dataset.cat === cat) {
          btn.className = 'c-filter px-3 py-1 rounded-full text-xs font-semibold bg-[#d4af37] text-black';
        } else {
          btn.className = 'c-filter px-3 py-1 rounded-full text-xs font-semibold bg-[#1c1914] text-[#a39e93] hover:text-white';
        }
      });
      document.querySelectorAll('.coffee-card').forEach(card => {
        card.style.display = (cat === 'all' || card.dataset.cat === cat) ? 'flex' : 'none';
      });
    }

    // Table Reservation Modal
    function openTableBookingModal() {
      document.getElementById('tableModal').classList.remove('hidden');
    }
    function closeTableBookingModal() {
      document.getElementById('tableModal').classList.add('hidden');
    }
    function handleTableReserve(e) {
      e.preventDefault();
      const name = document.getElementById('bookName').value;
      const guests = document.getElementById('bookGuests').value;
      const time = document.getElementById('bookTime').value;
      closeTableBookingModal();
      showToast('Tasting Table Reserved!', 'Welcome ' + name + '! Reserved for ' + guests + ' at ' + time + '.');
    }
  </script>
</body>
</html>`;
  }

  // Default SaaS, Enterprise, and Corporate Platform
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #0b0c10; color: #e5e7eb; font-family: system-ui, -apple-system, sans-serif; }
    .neon-glow { box-shadow: 0 0 30px rgba(0, 212, 160, 0.22); }
  </style>
</head>
<body class="min-h-screen flex flex-col relative pb-12">
  <!-- Interactive Toast Notification -->
  <div id="toast" class="fixed top-5 right-5 z-50 transform translate-y-[-120%] opacity-0 transition-all duration-300 pointer-events-none max-w-sm w-full bg-[#12151d] border border-[#00d4a0]/60 p-4 rounded-xl shadow-2xl flex items-start gap-3">
    <div class="w-8 h-8 rounded-lg bg-[#00d4a0]/20 text-[#00d4a0] flex items-center justify-center font-black shrink-0 text-sm">⚡</div>
    <div>
      <h4 id="toastTitle" class="text-sm font-bold text-white">System Notice</h4>
      <p id="toastMessage" class="text-xs text-gray-300 mt-0.5 leading-relaxed">Status updated</p>
    </div>
  </div>

  <!-- Nav -->
  <nav class="border-b border-[#1f2430] bg-[#0b0c10]/90 backdrop-blur sticky top-0 px-6 py-4 flex items-center justify-between z-40">
    <div class="flex items-center gap-2.5 font-black text-lg text-white">
      <span class="w-8 h-8 rounded-xl bg-[#00d4a0] text-black flex items-center justify-center font-bold text-sm">✦</span>
      <span>${title}</span>
    </div>
    <div class="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-400">
      <a href="#features" class="hover:text-[#00d4a0] transition">Capabilities</a>
      <a href="#pricing" class="hover:text-[#00d4a0] transition">Pricing</a>
      <a href="#faq" class="hover:text-[#00d4a0] transition">Architecture FAQ</a>
    </div>
    <button onclick="openDemoModal()" class="px-4 py-2 rounded-xl bg-[#00d4a0] hover:bg-[#00f0b5] text-black font-bold text-xs transition shadow-lg shadow-[#00d4a0]/20 active:scale-95">
      Book Live Demo
    </button>
  </nav>

  <!-- Hero -->
  <header class="px-6 py-16 text-center max-w-4xl mx-auto flex flex-col items-center">
    <div class="px-3.5 py-1 rounded-full bg-[#00d4a0]/10 border border-[#00d4a0]/30 text-[#00d4a0] text-xs font-bold uppercase tracking-wider mb-6">
      Enterprise Next-Generation Platform
    </div>
    <h1 class="text-4xl sm:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
      Accelerate Digital Innovation with <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4a0] via-[#38bdf8] to-[#818cf8]">Intelligent Systems</span>
    </h1>
    <p class="text-gray-400 text-sm sm:text-base max-w-2xl mb-8 leading-relaxed">
      Transform complex concepts into production-grade infrastructure, high-fidelity corporate brand assets, and multi-language services in real time.
    </p>
    <div class="flex flex-wrap items-center justify-center gap-4">
      <button onclick="openDemoModal()" class="px-7 py-3 rounded-xl bg-[#00d4a0] hover:bg-[#00f0b5] text-black font-bold text-xs uppercase tracking-wider transition neon-glow active:scale-95">
        Start Free Trial
      </button>
      <button onclick="simulateDeploy()" class="px-7 py-3 rounded-xl bg-[#161a23] hover:bg-[#1e2330] border border-[#2b3244] text-white font-semibold text-xs transition active:scale-95">
        Test Instant Sandbox
      </button>
    </div>
  </header>

  <!-- Feature Capabilities Grid with Filter -->
  <section id="features" class="max-w-6xl mx-auto px-6 py-10 w-full">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-2xl font-bold text-white">Platform Core Capabilities</h2>
      <div class="flex gap-2">
        <button onclick="filterCards('all')" class="f-filter px-3 py-1 rounded-lg text-xs font-bold bg-[#00d4a0] text-black" data-tab="all">All</button>
        <button onclick="filterCards('ai')" class="f-filter px-3 py-1 rounded-lg text-xs font-bold bg-[#141720] text-gray-400 hover:text-white" data-tab="ai">Intelligence</button>
        <button onclick="filterCards('cloud')" class="f-filter px-3 py-1 rounded-lg text-xs font-bold bg-[#141720] text-gray-400 hover:text-white" data-tab="cloud">Security & Cloud</button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="feat-card p-6 rounded-2xl bg-[#12151d] border border-[#1f2430] hover:border-[#00d4a0]/40 transition" data-tab="ai">
        <div class="w-10 h-10 rounded-xl bg-[#00d4a0]/15 text-[#00d4a0] flex items-center justify-center font-bold text-lg mb-4">⚡</div>
        <h3 class="text-lg font-bold text-white mb-2">Automated Code Generation</h3>
        <p class="text-xs text-gray-400 leading-relaxed mb-4">Generate full-stack TypeScript, frontend UI components, and API routes in seconds.</p>
        <button onclick="triggerAction('Code Engine Provisioned')" class="text-xs font-bold text-[#00d4a0] hover:underline">Explore Specs →</button>
      </div>

      <div class="feat-card p-6 rounded-2xl bg-[#12151d] border border-[#1f2430] hover:border-[#38bdf8]/40 transition" data-tab="ai">
        <div class="w-10 h-10 rounded-xl bg-[#38bdf8]/15 text-[#38bdf8] flex items-center justify-center font-bold text-lg mb-4">🌐</div>
        <h3 class="text-lg font-bold text-white mb-2">Multilingual Intelligence</h3>
        <p class="text-xs text-gray-400 leading-relaxed mb-4">Bidirectional RTL/LTR support across 100+ dialects including Urdu, Arabic, Spanish, and English.</p>
        <button onclick="triggerAction('Multilingual Gateway Active')" class="text-xs font-bold text-[#38bdf8] hover:underline">Explore Dialects →</button>
      </div>

      <div class="feat-card p-6 rounded-2xl bg-[#12151d] border border-[#1f2430] hover:border-[#a855f7]/40 transition" data-tab="cloud">
        <div class="w-10 h-10 rounded-xl bg-[#a855f7]/15 text-[#a855f7] flex items-center justify-center font-bold text-lg mb-4">🛡️</div>
        <h3 class="text-lg font-bold text-white mb-2">Zero-Trust Security</h3>
        <p class="text-xs text-gray-400 leading-relaxed mb-4">Enterprise role-based governance, end-to-end credential isolation, and audit logging.</p>
        <button onclick="triggerAction('Security Vault Verified')" class="text-xs font-bold text-[#a855f7] hover:underline">View Compliance →</button>
      </div>
    </div>
  </section>

  <!-- Interactive Accordion FAQ -->
  <section id="faq" class="max-w-4xl mx-auto px-6 py-10 w-full">
    <h2 class="text-2xl font-bold text-white mb-6 text-center">Frequently Asked Questions</h2>
    <div class="space-y-3">
      <div class="p-4 rounded-xl bg-[#12151d] border border-[#1f2430] cursor-pointer" onclick="toggleFaq(this)">
        <div class="flex justify-between items-center text-sm font-bold text-white">
          <span>How does real-time sandbox execution work?</span>
          <span class="faq-icon text-[#00d4a0]">+</span>
        </div>
        <p class="faq-body hidden text-xs text-gray-400 mt-2 leading-relaxed">
          The platform boots isolated containers with sub-second provisioning, rendering frontend layouts and backend APIs with zero cold-start delay.
        </p>
      </div>
      <div class="p-4 rounded-xl bg-[#12151d] border border-[#1f2430] cursor-pointer" onclick="toggleFaq(this)">
        <div class="flex justify-between items-center text-sm font-bold text-white">
          <span>Can I integrate my existing API keys and schemas?</span>
          <span class="faq-icon text-[#00d4a0]">+</span>
        </div>
        <p class="faq-body hidden text-xs text-gray-400 mt-2 leading-relaxed">
          Yes! Seamlessly connect Gemini API, Stripe, Firebase, or Cloud SQL directly through secure server-side environment variables.
        </p>
      </div>
    </div>
  </section>

  <!-- Interactive Demo Booking Modal -->
  <div id="demoModal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div class="bg-[#12151d] border border-[#00d4a0]/50 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in-50 duration-200">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <span>⚡</span> Schedule Enterprise Demo
        </h3>
        <button onclick="closeDemoModal()" class="text-gray-400 hover:text-white font-bold text-lg">✕</button>
      </div>
      <form onsubmit="handleDemoSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">Company / Organization</label>
          <input required id="demoCompany" type="text" placeholder="e.g. Acme Innovations" class="w-full px-3 py-2 rounded-xl bg-[#1c2230] border border-[#2b3346] text-xs text-white focus:outline-none focus:border-[#00d4a0]" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">Work Email</label>
          <input required id="demoEmail" type="email" placeholder="e.g. lead@acme.com" class="w-full px-3 py-2 rounded-xl bg-[#1c2230] border border-[#2b3346] text-xs text-white focus:outline-none focus:border-[#00d4a0]" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">Estimated Team Size</label>
          <select id="demoSize" class="w-full px-3 py-2 rounded-xl bg-[#1c2230] border border-[#2b3346] text-xs text-white focus:outline-none focus:border-[#00d4a0]">
            <option value="1-10 Members">1 - 10 Members</option>
            <option value="11-50 Members">11 - 50 Members</option>
            <option value="50+ Enterprise">50+ Enterprise Organization</option>
          </select>
        </div>
        <div class="flex gap-2 pt-2">
          <button type="button" onclick="closeDemoModal()" class="flex-1 py-2.5 rounded-xl bg-[#1a1f2c] text-white text-xs font-bold">Cancel</button>
          <button type="submit" class="flex-1 py-2.5 rounded-xl bg-[#00d4a0] hover:bg-[#00f0b5] text-black text-xs font-bold shadow-lg shadow-[#00d4a0]/20">Confirm Demo</button>
        </div>
      </form>
    </div>
  </div>

  <footer class="mt-auto border-t border-[#1f2430] py-6 text-center text-xs text-gray-500">
    © ${currentYear} ${title} • Built with PREMIERS AI Interactive Platform
  </footer>

  <script>
    // Toast System
    function showToast(title, message) {
      const toast = document.getElementById('toast');
      document.getElementById('toastTitle').textContent = title;
      document.getElementById('toastMessage').textContent = message;
      toast.classList.remove('translate-y-[-120%]', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-[-120%]', 'opacity-0');
      }, 3500);
    }

    // Modal Control
    function openDemoModal() {
      document.getElementById('demoModal').classList.remove('hidden');
    }
    function closeDemoModal() {
      document.getElementById('demoModal').classList.add('hidden');
    }
    function handleDemoSubmit(e) {
      e.preventDefault();
      const comp = document.getElementById('demoCompany').value;
      const email = document.getElementById('demoEmail').value;
      closeDemoModal();
      showToast('Demo Confirmed!', 'Invitation and sandbox access sent to ' + email + ' for ' + comp + '.');
    }

    // Interactive Card Actions
    function triggerAction(actionName) {
      showToast('Module Activated', actionName + ' is currently operational in your sandbox session.');
    }
    function simulateDeploy() {
      showToast('Sandbox Provisioned', 'Live cluster online. Zero latency routing established.');
    }

    // Filter Logic
    function filterCards(tab) {
      document.querySelectorAll('.f-filter').forEach(btn => {
        if (btn.dataset.tab === tab) {
          btn.className = 'f-filter px-3 py-1 rounded-lg text-xs font-bold bg-[#00d4a0] text-black';
        } else {
          btn.className = 'f-filter px-3 py-1 rounded-lg text-xs font-bold bg-[#141720] text-gray-400 hover:text-white';
        }
      });
      document.querySelectorAll('.feat-card').forEach(card => {
        card.style.display = (tab === 'all' || card.dataset.tab === tab) ? 'block' : 'none';
      });
    }

    // FAQ Accordion Toggle
    function toggleFaq(el) {
      const body = el.querySelector('.faq-body');
      const icon = el.querySelector('.faq-icon');
      const isHidden = body.classList.contains('hidden');
      body.classList.toggle('hidden');
      icon.textContent = isHidden ? '−' : '+';
    }
  </script>
</body>
</html>`;
}
