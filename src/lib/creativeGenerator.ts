/**
 * PREMIERS AI — Master Procedural Creative Visual & Graphic Generator
 * Generates photorealistic, eye-opening logos, YouTube graphics, Free Fire / Gaming mascot crests,
 * thumbnails, posters, and banners with high-definition canvas rendering.
 */

export interface GraphicOptions {
  title: string;
  subtitle?: string;
  category?: "logo" | "image" | "thumbnail" | "poster" | "banner";
  theme?:
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
  palette?: "emerald" | "cyber" | "sunset" | "luxury" | "ocean" | "fire" | "neon";
  width?: number;
  height?: number;
}

const PALETTES = {
  emerald: {
    bg1: "#06090c",
    bg2: "#0f171f",
    primary: "#00d4a0",
    accent: "#00b8d4",
    text: "#f0f0f5",
    muted: "#94a3b8",
  },
  cyber: {
    bg1: "#0a0614",
    bg2: "#190e2e",
    primary: "#a855f7",
    accent: "#ec4899",
    text: "#ffffff",
    muted: "#cbd5e1",
  },
  sunset: {
    bg1: "#120808",
    bg2: "#2a0e0e",
    primary: "#f97316",
    accent: "#eab308",
    text: "#fffbeb",
    muted: "#fcd34d",
  },
  luxury: {
    bg1: "#08080a",
    bg2: "#18181c",
    primary: "#e2b144",
    accent: "#f5d061",
    text: "#fafafa",
    muted: "#d4af37",
  },
  ocean: {
    bg1: "#030712",
    bg2: "#0f172a",
    primary: "#38bdf8",
    accent: "#818cf8",
    text: "#f8fafc",
    muted: "#94a3b8",
  },
  fire: {
    bg1: "#100404",
    bg2: "#2d0a0a",
    primary: "#ff4d00",
    accent: "#ffaa00",
    text: "#ffffff",
    muted: "#ffcc66",
  },
};

export function generateCreativeGraphic(options: GraphicOptions): string {
  const category = options.category || "logo";
  const theme = options.theme || "standard";
  const palKey = theme === "free_fire" ? "fire" : theme === "luxury" ? "luxury" : options.palette || "emerald";
  const palette = PALETTES[palKey] || PALETTES.emerald;
  const title = (options.title || "PREMIERS AI").toUpperCase();

  let width = options.width || 1000;
  let height = options.height || 1000;

  if (category === "thumbnail") {
    width = 1280;
    height = 720;
  } else if (category === "banner") {
    width = 1200;
    height = 450;
  } else if (category === "poster") {
    width = 900;
    height = 1200;
  } else if (category === "image") {
    if (theme === "landscape" || theme === "cyber_city" || theme === "car" || theme === "architecture") {
      width = 1280;
      height = 720;
    } else {
      width = 1024;
      height = 1024;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) return "";

  // 1. Render Specific Theme or Category
  if (category === "logo") {
    if (theme === "company_logo" || theme === "tech") {
      drawCompanyLogo(ctx, width, height, title, options.subtitle, palette);
    } else if (theme === "luxury") {
      drawLuxuryLogo(ctx, width, height, title, options.subtitle);
    } else if (theme === "crypto") {
      drawCryptoBlockchain(ctx, width, height, title, options.subtitle);
    } else if (theme === "medical") {
      drawMedicalClinic(ctx, width, height, title, options.subtitle);
    } else if (theme === "fitness") {
      drawFitnessGym(ctx, width, height, title, options.subtitle);
    } else if (theme === "free_fire") {
      drawFreeFireLogo(ctx, width, height, title, options.subtitle);
    } else if (theme === "youtube") {
      drawYouTubeLogo(ctx, width, height, title, options.subtitle);
    } else if (theme === "cyber_gaming") {
      drawCyberGamingLogo(ctx, width, height, title, options.subtitle);
    } else {
      drawModernBrandLogo(ctx, width, height, title, options.subtitle, palette);
    }
  } else if (
    category === "image" ||
    theme === "landscape" ||
    theme === "car" ||
    theme === "cyber_city" ||
    theme === "space" ||
    theme === "animal" ||
    theme === "anime" ||
    theme === "architecture" ||
    theme === "food" ||
    theme === "abstract" ||
    theme === "fitness" ||
    theme === "crypto" ||
    theme === "medical" ||
    theme === "robotics" ||
    theme === "fantasy" ||
    theme === "portrait" ||
    theme === "universal"
  ) {
    if (theme === "landscape") {
      drawLandscape(ctx, width, height, title, options.subtitle);
    } else if (theme === "car") {
      drawSupercar(ctx, width, height, title, options.subtitle);
    } else if (theme === "cyber_city") {
      drawCyberCity(ctx, width, height, title, options.subtitle);
    } else if (theme === "space") {
      drawDeepSpace(ctx, width, height, title, options.subtitle);
    } else if (theme === "animal") {
      drawMajesticAnimal(ctx, width, height, title, options.subtitle);
    } else if (theme === "anime") {
      drawAnimeCharacter(ctx, width, height, title, options.subtitle);
    } else if (theme === "architecture") {
      drawModernArchitecture(ctx, width, height, title, options.subtitle);
    } else if (theme === "food") {
      drawGourmetFood(ctx, width, height, title, options.subtitle);
    } else if (theme === "abstract") {
      drawAbstract3D(ctx, width, height, title, options.subtitle);
    } else if (theme === "fitness") {
      drawFitnessGym(ctx, width, height, title, options.subtitle);
    } else if (theme === "crypto") {
      drawCryptoBlockchain(ctx, width, height, title, options.subtitle);
    } else if (theme === "medical") {
      drawMedicalClinic(ctx, width, height, title, options.subtitle);
    } else if (theme === "robotics") {
      drawRoboticsAndroid(ctx, width, height, title, options.subtitle);
    } else if (theme === "fantasy") {
      drawFantasyCastle(ctx, width, height, title, options.subtitle);
    } else if (theme === "portrait") {
      drawStylizedPortrait(ctx, width, height, title, options.subtitle);
    } else {
      drawUniversalProceduralArt(ctx, width, height, title, options.subtitle, theme, palette);
    }
  } else if (category === "thumbnail") {
    drawProThumbnail(ctx, width, height, title, options.subtitle, theme, palette);
  } else if (category === "poster") {
    drawProPoster(ctx, width, height, title, options.subtitle, palette);
  } else {
    drawProBanner(ctx, width, height, title, options.subtitle, palette);
  }

  return canvas.toDataURL("image/png");
}

/**
 * =======================================================================
 * BATTLE ROYALE / ESPORTS MASCOT LOGO
 * Designed for competitive esports teams, gaming guilds, and tournaments.
 * Features realistic burning battlefield background, fiery embers,
 * angular metallic esports shield, cyber-demon helmet mascot, and 3D extruded lettering.
 * =======================================================================
 */
function drawFreeFireLogo(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string,
  subtitle?: string
) {
  const cx = w / 2;
  const cy = h / 2 - 20;

  // 1. Volcanic Battleground Dark Gradient
  const bgGrad = ctx.createRadialGradient(cx, cy, 60, cx, cy, w * 0.75);
  bgGrad.addColorStop(0, "#2c0909");
  bgGrad.addColorStop(0.4, "#180404");
  bgGrad.addColorStop(1, "#0a0202");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Dramatic Backlight Explosion / Rim Glow
  const explosionGrad = ctx.createRadialGradient(cx, cy - 30, 20, cx, cy - 30, w * 0.45);
  explosionGrad.addColorStop(0, "rgba(255, 90, 0, 0.45)");
  explosionGrad.addColorStop(0.5, "rgba(255, 30, 0, 0.18)");
  explosionGrad.addColorStop(1, "transparent");
  ctx.fillStyle = explosionGrad;
  ctx.beginPath();
  ctx.arc(cx, cy - 30, w * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // 3. Dynamic Rising Fire Embers / Sparks (Free Fire Battlefield feel)
  ctx.save();
  for (let i = 0; i < 45; i++) {
    const px = (cx + (Math.sin(i * 13) * w * 0.45) + w) % w;
    const py = (cy + 180 - ((i * 27) % (h * 0.85)));
    const pr = 1.5 + (i % 4) * 1.5;
    const alpha = 0.35 + (i % 5) * 0.12;

    const emberGrad = ctx.createRadialGradient(px, py, 0, px, py, pr * 2.5);
    emberGrad.addColorStop(0, `rgba(255, 220, 100, ${alpha})`);
    emberGrad.addColorStop(0.4, `rgba(255, 80, 0, ${alpha * 0.8})`);
    emberGrad.addColorStop(1, "transparent");

    ctx.fillStyle = emberGrad;
    ctx.beginPath();
    ctx.arc(px, py, pr * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 4. Esports Shield Base
  const shieldW = w * 0.62;
  const shieldH = h * 0.60;
  const topY = cy - shieldH * 0.45;
  const botY = cy + shieldH * 0.40;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, topY - 20); // Top spike
  ctx.lineTo(cx + shieldW * 0.48, topY + 40); // Top-right wing
  ctx.lineTo(cx + shieldW * 0.42, cy + 60); // Mid-right
  ctx.lineTo(cx, botY + 20); // Bottom point
  ctx.lineTo(cx - shieldW * 0.42, cy + 60); // Mid-left
  ctx.lineTo(cx - shieldW * 0.48, topY + 40); // Top-left wing
  ctx.closePath();

  // Outer Fiery Metallic Stroke
  ctx.strokeStyle = "#ff6a00";
  ctx.lineWidth = 10;
  ctx.shadowColor = "#ff3b00";
  ctx.shadowBlur = 35;
  ctx.stroke();

  // Inner Metallic Shield Fill
  const shieldFill = ctx.createLinearGradient(0, topY, 0, botY);
  shieldFill.addColorStop(0, "#1c1c24");
  shieldFill.addColorStop(0.5, "#121218");
  shieldFill.addColorStop(1, "#0c0a0e");
  ctx.fillStyle = shieldFill;
  ctx.shadowBlur = 0;
  ctx.fill();

  // Secondary Gold / Cyan Accent Rim inside Shield
  ctx.strokeStyle = "#00e5ff";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#00e5ff";
  ctx.shadowBlur = 15;
  ctx.stroke();
  ctx.restore();

  // 5. Stylized Fierce Warrior / Cyber Samurai Mascot Face
  ctx.save();
  const headY = cy - 45;

  // Mask Shadow & Silhouette
  ctx.fillStyle = "#ff5500";
  ctx.shadowColor = "#ff2a00";
  ctx.shadowBlur = 25;

  // Angular Horns / Crest spikes
  ctx.beginPath();
  ctx.moveTo(cx, headY - 100);
  ctx.lineTo(cx + 45, headY - 40);
  ctx.lineTo(cx + 80, headY - 70);
  ctx.lineTo(cx + 60, headY - 10);
  ctx.lineTo(cx + 95, headY + 30);
  ctx.lineTo(cx + 50, headY + 45);
  ctx.lineTo(cx, headY + 75);
  ctx.lineTo(cx - 50, headY + 45);
  ctx.lineTo(cx - 95, headY + 30);
  ctx.lineTo(cx - 60, headY - 10);
  ctx.lineTo(cx - 80, headY - 70);
  ctx.lineTo(cx - 45, headY - 40);
  ctx.closePath();
  ctx.fill();

  // Inner Dark Armor Plating
  ctx.fillStyle = "#111116";
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(cx, headY - 80);
  ctx.lineTo(cx + 38, headY - 30);
  ctx.lineTo(cx + 65, headY - 50);
  ctx.lineTo(cx + 48, headY - 5);
  ctx.lineTo(cx + 75, headY + 25);
  ctx.lineTo(cx + 38, headY + 38);
  ctx.lineTo(cx, headY + 62);
  ctx.lineTo(cx - 38, headY + 38);
  ctx.lineTo(cx - 75, headY + 25);
  ctx.lineTo(cx - 48, headY - 5);
  ctx.lineTo(cx - 65, headY - 50);
  ctx.lineTo(cx - 38, headY - 30);
  ctx.closePath();
  ctx.fill();

  // Piercing Glowing Eyes (Cyan / Neon Blue like Free Fire Elite Pass)
  ctx.fillStyle = "#00ffff";
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 20;

  // Left Eye
  ctx.beginPath();
  ctx.moveTo(cx - 38, headY - 5);
  ctx.lineTo(cx - 14, headY - 2);
  ctx.lineTo(cx - 32, headY + 7);
  ctx.closePath();
  ctx.fill();

  // Right Eye
  ctx.beginPath();
  ctx.moveTo(cx + 38, headY - 5);
  ctx.lineTo(cx + 14, headY - 2);
  ctx.lineTo(cx + 32, headY + 7);
  ctx.closePath();
  ctx.fill();

  // Eye trail lens flare
  ctx.strokeStyle = "rgba(0, 255, 255, 0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 55, headY - 10);
  ctx.lineTo(cx - 10, headY);
  ctx.moveTo(cx + 55, headY - 10);
  ctx.lineTo(cx + 10, headY);
  ctx.stroke();
  ctx.restore();

  // 6. Name Ribbon Banner (Below Mascot)
  const bannerY = cy + 130;
  const bannerW = w * 0.72;
  const bannerH = 75;

  ctx.save();
  // Ribbon Polygon
  ctx.beginPath();
  ctx.moveTo(cx - bannerW / 2, bannerY);
  ctx.lineTo(cx + bannerW / 2, bannerY);
  ctx.lineTo(cx + bannerW / 2 - 20, bannerY + bannerH);
  ctx.lineTo(cx, bannerY + bannerH + 12);
  ctx.lineTo(cx - bannerW / 2 + 20, bannerY + bannerH);
  ctx.closePath();

  // Fiery Gold / Metallic Ribbon Gradient
  const ribbonGrad = ctx.createLinearGradient(0, bannerY, 0, bannerY + bannerH);
  ribbonGrad.addColorStop(0, "#220808");
  ribbonGrad.addColorStop(0.5, "#3d1010");
  ribbonGrad.addColorStop(1, "#180404");
  ctx.fillStyle = ribbonGrad;
  ctx.fill();

  ctx.strokeStyle = "#ff8800";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Gold Trim Highlights
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // 7. 3D Bold Extruded Name Typography
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const fontSize = Math.min(Math.floor(w * 0.085), 78);
  ctx.font = `900 ${fontSize}px 'Plus Jakarta Sans', Impact, sans-serif`;

  // Extruded 3D shadow layers
  for (let s = 8; s > 0; s--) {
    ctx.fillStyle = "#000000";
    ctx.fillText(title, cx, bannerY + bannerH / 2 + s);
  }

  // Deep metallic gold/white front face
  const textGrad = ctx.createLinearGradient(0, bannerY, 0, bannerY + bannerH);
  textGrad.addColorStop(0, "#ffffff");
  textGrad.addColorStop(0.35, "#ffd700");
  textGrad.addColorStop(0.7, "#ff8800");
  textGrad.addColorStop(1, "#c44000");

  ctx.fillStyle = textGrad;
  ctx.shadowColor = "rgba(255, 140, 0, 0.9)";
  ctx.shadowBlur = 18;
  ctx.fillText(title, cx, bannerY + bannerH / 2);
  ctx.restore();

  // 8. Subtitle Tag (e.g. "FREE FIRE BATTLEGROUNDS")
  const subText = subtitle || "FREE FIRE BATTLEGROUNDS • PRO ESPORTS";
  ctx.save();
  ctx.fillStyle = "#ffd27d";
  ctx.font = `bold ${Math.floor(w * 0.024)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.textAlign = "center";
  ctx.letterSpacing = "4px";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 10;
  ctx.fillText(subText, cx, bannerY + bannerH + 42);

  // Five Stars rating
  ctx.fillStyle = "#ffd700";
  ctx.font = "bold 20px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("★★★★★", cx, bannerY + bannerH + 70);
  ctx.restore();
}

/**
 * =======================================================================
 * YOUTUBE CREATOR STUDIO LOGO
 * Built with YouTube studio dark mesh, vibrant red illumination,
 * 3D glossy play button emblem with metallic bevels, and channel typography.
 * =======================================================================
 */
function drawYouTubeLogo(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string,
  subtitle?: string
) {
  const cx = w / 2;
  const cy = h / 2 - 35;

  // 1. YouTube Dark Studio Mesh Background
  const bgGrad = ctx.createRadialGradient(cx, cy - 40, 50, cx, cy, w * 0.7);
  bgGrad.addColorStop(0, "#240a0c");
  bgGrad.addColorStop(0.5, "#12080a");
  bgGrad.addColorStop(1, "#080608");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. YouTube Red Studio Backlight Glow
  const redGlow = ctx.createRadialGradient(cx, cy - 20, 20, cx, cy - 20, w * 0.35);
  redGlow.addColorStop(0, "rgba(255, 0, 51, 0.45)");
  redGlow.addColorStop(0.6, "rgba(255, 0, 51, 0.12)");
  redGlow.addColorStop(1, "transparent");
  ctx.fillStyle = redGlow;
  ctx.beginPath();
  ctx.arc(cx, cy - 20, w * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // 3. Outer Circular Glowing Ring
  ctx.save();
  ctx.strokeStyle = "rgba(255, 0, 51, 0.4)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 180, 0, Math.PI * 2);
  ctx.stroke();

  // Dashed Tech Perimeter
  ctx.setLineDash([8, 12]);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 195, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 4. 3D Beveled YouTube Play Button Emblem
  const pbW = 190;
  const pbH = 130;
  const pbx = cx - pbW / 2;
  const pby = cy - pbH / 2;

  ctx.save();
  ctx.shadowColor = "rgba(255, 0, 51, 0.8)";
  ctx.shadowBlur = 35;

  // Button body gradient
  const pbGrad = ctx.createLinearGradient(0, pby, 0, pby + pbH);
  pbGrad.addColorStop(0, "#ff2244");
  pbGrad.addColorStop(0.5, "#cc0022");
  pbGrad.addColorStop(1, "#880011");

  ctx.fillStyle = pbGrad;
  ctx.beginPath();
  ctx.roundRect(pbx, pby, pbW, pbH, 36);
  ctx.fill();

  // Chrome / White Border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Specular Top Sheen
  const sheenGrad = ctx.createLinearGradient(0, pby, 0, pby + pbH * 0.5);
  sheenGrad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
  sheenGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = sheenGrad;
  ctx.beginPath();
  ctx.roundRect(pbx + 4, pby + 4, pbW - 8, pbH * 0.45, 30);
  ctx.fill();

  // Triangle Play Icon in White
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(cx - 22, cy - 30);
  ctx.lineTo(cx + 34, cy);
  ctx.lineTo(cx - 22, cy + 30);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 5. Channel Title Typography
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 ${Math.min(Math.floor(w * 0.065), 56)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.shadowColor = "rgba(255, 0, 51, 0.5)";
  ctx.shadowBlur = 15;
  ctx.fillText(title, cx, cy + 180);

  // 6. Subtitle & 4K Ultra HD Badge
  const sub = subtitle || "OFFICIAL YOUTUBE CHANNEL • VERIFIED CREATOR";
  ctx.fillStyle = "#a8a8c0";
  ctx.font = `600 ${Math.floor(w * 0.022)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.letterSpacing = "3px";
  ctx.shadowBlur = 0;
  ctx.fillText(sub, cx, cy + 225);

  // 4K Ultra HD Pill
  const pillW = 160;
  const pillH = 32;
  ctx.fillStyle = "#ff0033";
  ctx.beginPath();
  ctx.roundRect(cx - pillW / 2, cy + 250, pillW, pillH, 8);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("4K ULTRA HD", cx, cy + 271);
  ctx.restore();
}

/**
 * =======================================================================
 * CYBER GAMING & ESPORTS MASCOT LOGO
 * Neon cyan & magenta futuristic cyber emblem.
 * =======================================================================
 */
function drawCyberGamingLogo(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string,
  subtitle?: string
) {
  const cx = w / 2;
  const cy = h / 2 - 30;

  // Cyber Grid Background
  ctx.fillStyle = "#080612";
  ctx.fillRect(0, 0, w, h);

  // Neon Ambient Glow
  const glow = ctx.createRadialGradient(cx, cy, 30, cx, cy, w * 0.45);
  glow.addColorStop(0, "rgba(168, 85, 247, 0.35)");
  glow.addColorStop(0.5, "rgba(6, 182, 212, 0.18)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Cyber Hexagon Shield
  const r = 160;
  ctx.save();
  ctx.strokeStyle = "#00f0ff";
  ctx.lineWidth = 6;
  ctx.shadowColor = "#00f0ff";
  ctx.shadowBlur = 25;

  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Inner Dark Plate
  ctx.fillStyle = "#120d24";
  ctx.shadowBlur = 0;
  ctx.fill();

  // Neon Mascot Emblem (Cyber Visor / Gamepad)
  ctx.fillStyle = "#ec4899";
  ctx.shadowColor = "#ec4899";
  ctx.shadowBlur = 20;

  // Cyber Helmet visor
  ctx.beginPath();
  ctx.moveTo(cx - 65, cy - 25);
  ctx.lineTo(cx + 65, cy - 25);
  ctx.lineTo(cx + 45, cy + 25);
  ctx.lineTo(cx - 45, cy + 25);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#00f0ff";
  ctx.beginPath();
  ctx.arc(cx - 30, cy, 10, 0, Math.PI * 2);
  ctx.arc(cx + 30, cy, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Typography
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 ${Math.min(Math.floor(w * 0.065), 54)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.shadowColor = "#00f0ff";
  ctx.shadowBlur = 15;
  ctx.fillText(title, cx, cy + 210);

  ctx.fillStyle = "#ec4899";
  ctx.font = `bold ${Math.floor(w * 0.022)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.letterSpacing = "4px";
  ctx.fillText(subtitle || "ESPORTS & STREAMING CLAN", cx, cy + 250);
  ctx.restore();
}

/**
 * =======================================================================
 * LUXURY / ROYAL GOLD BRAND CREST
 * Heraldic gold leaf finish on obsidian matte black.
 * =======================================================================
 */
function drawLuxuryLogo(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string,
  subtitle?: string
) {
  const cx = w / 2;
  const cy = h / 2 - 30;

  ctx.fillStyle = "#09090b";
  ctx.fillRect(0, 0, w, h);

  // Subtle gold vignette
  const goldGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, w * 0.45);
  goldGrad.addColorStop(0, "rgba(226, 177, 68, 0.2)");
  goldGrad.addColorStop(1, "transparent");
  ctx.fillStyle = goldGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Heraldic Golden Crest
  ctx.save();
  ctx.strokeStyle = "#e2b144";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 150, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "#f5d061";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, 162, 0, Math.PI * 2);
  ctx.stroke();

  // Ornate Crown Icon
  ctx.fillStyle = "#e2b144";
  ctx.beginPath();
  ctx.moveTo(cx - 50, cy + 20);
  ctx.lineTo(cx - 40, cy - 40);
  ctx.lineTo(cx - 15, cy - 10);
  ctx.lineTo(cx, cy - 50);
  ctx.lineTo(cx + 15, cy - 10);
  ctx.lineTo(cx + 40, cy - 40);
  ctx.lineTo(cx + 50, cy + 20);
  ctx.closePath();
  ctx.fill();

  // Monogram Initial inside
  ctx.fillStyle = "#09090b";
  ctx.font = "bold 32px 'Plus Jakarta Sans', Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title.charAt(0) || "P", cx, cy);
  ctx.restore();

  // Luxury Serif Typography
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#f5d061";
  ctx.font = `600 ${Math.min(Math.floor(w * 0.055), 44)}px Georgia, 'Plus Jakarta Sans', serif`;
  ctx.letterSpacing = "6px";
  ctx.shadowColor = "rgba(226, 177, 68, 0.4)";
  ctx.shadowBlur = 12;
  ctx.fillText(title, cx, cy + 205);

  ctx.fillStyle = "#a1a1aa";
  ctx.font = `500 ${Math.floor(w * 0.02)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.letterSpacing = "5px";
  ctx.fillText(subtitle || "HAUTE HORLOGERIE & LUXURY ESTATE", cx, cy + 245);
  ctx.restore();
}

/**
 * =======================================================================
 * MODERN VECTOR BRAND LOGO (DEFAULT)
 * Clean geometric mark, glowing ring, bold typography.
 * =======================================================================
 */
function drawModernBrandLogo(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string,
  subtitle: string | undefined,
  pal: typeof PALETTES.emerald
) {
  const cx = w / 2;
  const cy = h / 2 - 35;
  const radius = Math.min(w, h) * 0.18;

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, pal.bg1);
  bgGrad.addColorStop(1, pal.bg2);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Outer Glowing Ring
  ctx.save();
  ctx.strokeStyle = pal.primary + "66";
  ctx.lineWidth = 4;
  ctx.shadowColor = pal.primary;
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 15, 0, Math.PI * 2);
  ctx.stroke();

  // Inner Badge
  const badgeGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  badgeGrad.addColorStop(0, pal.primary + "33");
  badgeGrad.addColorStop(1, pal.accent + "55");
  ctx.fillStyle = badgeGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Initial
  ctx.fillStyle = pal.primary;
  ctx.font = `bold ${Math.floor(radius * 1.1)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title.charAt(0) || "P", cx, cy - 2);
  ctx.restore();

  // Title
  ctx.save();
  ctx.fillStyle = pal.text;
  ctx.font = `bold ${Math.min(Math.floor(w * 0.055), 44)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(title, cx, cy + radius + 65);

  ctx.fillStyle = pal.muted;
  ctx.font = `500 ${Math.min(Math.floor(w * 0.022), 18)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.letterSpacing = "3px";
  ctx.fillText(subtitle || "INTELLIGENT CREATIVE SUITE", cx, cy + radius + 100);
  ctx.restore();
}

/**
 * =======================================================================
 * YOUTUBE & DIGITAL THUMBNAILS
 * =======================================================================
 */
function drawProThumbnail(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string,
  subtitle: string | undefined,
  theme: string,
  pal: typeof PALETTES.emerald
) {
  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, theme === "free_fire" ? "#1e0404" : pal.bg1);
  bgGrad.addColorStop(1, theme === "free_fire" ? "#0a0101" : pal.bg2);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Category Badge
  const badgeW = 200;
  const badgeH = 42;
  ctx.fillStyle = theme === "free_fire" ? "#ff4d00" : pal.primary;
  ctx.beginPath();
  ctx.roundRect(60, 60, badgeW, badgeH, 10);
  ctx.fill();

  ctx.fillStyle = "#000000";
  ctx.font = "bold 18px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(theme === "free_fire" ? "PRO GAMING" : "PREMIERS AI", 60 + badgeW / 2, 87);

  // Big Bold Headline
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${Math.floor(w * 0.052)}px 'Plus Jakarta Sans', Impact, sans-serif`;
  ctx.shadowColor = "rgba(0,0,0,0.85)";
  ctx.shadowBlur = 18;

  const words = title.split(" ");
  let l1 = title;
  let l2 = "";
  if (words.length > 3) {
    const mid = Math.ceil(words.length / 2);
    l1 = words.slice(0, mid).join(" ");
    l2 = words.slice(mid).join(" ");
  }

  ctx.fillText(l1, 60, h * 0.44);
  if (l2) {
    ctx.fillStyle = theme === "free_fire" ? "#ffd700" : pal.accent;
    ctx.fillText(l2, 60, h * 0.58);
  }

  ctx.fillStyle = pal.muted;
  ctx.font = "600 24px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(subtitle || "CLICK TO WATCH NOW • FULL TUTORIAL", 60, h * 0.76);

  // Right Side 3D Orb / Emblem
  const ox = w * 0.80;
  const oy = h * 0.50;
  const or = 130;

  const orbGrad = ctx.createRadialGradient(ox - 25, oy - 25, 20, ox, oy, or);
  orbGrad.addColorStop(0, theme === "free_fire" ? "#ff5500" : pal.primary);
  orbGrad.addColorStop(0.6, theme === "free_fire" ? "#990000" : pal.accent);
  orbGrad.addColorStop(1, "#0a0a14");
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(ox, oy, or, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 80px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(theme === "free_fire" ? "🔥" : "✦", ox, oy);
}

function drawProPoster(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string,
  subtitle: string | undefined,
  pal: typeof PALETTES.emerald
) {
  const cx = w / 2;
  ctx.fillStyle = pal.bg1;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = pal.primary;
  ctx.font = "bold 22px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PREMIERS AI PRESENTS", cx, 80);

  const cy = h * 0.42;
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(cx - 160, cy - 160, 320, 320);

  ctx.fillStyle = pal.text;
  ctx.font = "bold 90px 'Plus Jakarta Sans', sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(title.charAt(0) || "P", cx, cy);

  ctx.textBaseline = "alphabetic";
  ctx.font = `800 ${Math.floor(w * 0.06)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillText(title, cx, h * 0.74);

  ctx.fillStyle = pal.muted;
  ctx.font = "500 22px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(subtitle || "UNIVERSAL INTELLIGENCE PLATFORM", cx, h * 0.81);
}

function drawProBanner(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string,
  subtitle: string | undefined,
  pal: typeof PALETTES.emerald
) {
  ctx.fillStyle = pal.bg1;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = pal.text;
  ctx.textAlign = "left";
  ctx.font = `800 ${Math.floor(h * 0.14)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillText(title, 70, h * 0.48);

  ctx.fillStyle = pal.muted;
  ctx.font = `500 ${Math.floor(h * 0.065)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillText(subtitle || "POWERED BY PREMIERS AI UNIVERSAL ENGINE", 70, h * 0.70);

  const rx = w - 160;
  const ry = h / 2;
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(rx, ry, 70, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = pal.accent;
  ctx.font = "bold 56px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("✦", rx, ry);
}

/**
 * =======================================================================
 * PHOTOREALISTIC LANDSCAPE / SUNSET NATURE ARTWORK
 * =======================================================================
 */
function drawLandscape(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle?: string) {
  // 1. Sky Gradient (Deep Twilight to Fiery Sunset)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.7);
  skyGrad.addColorStop(0, "#16082f");
  skyGrad.addColorStop(0.3, "#3d0e3a");
  skyGrad.addColorStop(0.55, "#a6242c");
  skyGrad.addColorStop(0.75, "#f77f00");
  skyGrad.addColorStop(1, "#fcbf49");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Radiant Sun & Solar Halos
  const sunX = w * 0.65;
  const sunY = h * 0.42;
  const sunR = Math.min(w, h) * 0.12;

  // Sun halo
  const haloGrad = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 3.5);
  haloGrad.addColorStop(0, "rgba(255, 245, 200, 0.85)");
  haloGrad.addColorStop(0.3, "rgba(255, 160, 50, 0.4)");
  haloGrad.addColorStop(1, "transparent");
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR * 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Sun core
  ctx.fillStyle = "#fffef0";
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();

  // 3. Distant Mountains (Atmospheric Purple Haze)
  ctx.fillStyle = "#4a1c4e";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.6);
  ctx.lineTo(w * 0.15, h * 0.44);
  ctx.lineTo(w * 0.32, h * 0.52);
  ctx.lineTo(w * 0.50, h * 0.40);
  ctx.lineTo(w * 0.72, h * 0.48);
  ctx.lineTo(w * 0.88, h * 0.38);
  ctx.lineTo(w, h * 0.54);
  ctx.lineTo(w, h * 0.75);
  ctx.lineTo(0, h * 0.75);
  ctx.closePath();
  ctx.fill();

  // 4. Mid-Ground Mountains (Deep Shadow)
  ctx.fillStyle = "#270c2e";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.65);
  ctx.lineTo(w * 0.20, h * 0.50);
  ctx.lineTo(w * 0.42, h * 0.58);
  ctx.lineTo(w * 0.60, h * 0.47);
  ctx.lineTo(w * 0.82, h * 0.56);
  ctx.lineTo(w, h * 0.49);
  ctx.lineTo(w, h * 0.75);
  ctx.lineTo(0, h * 0.75);
  ctx.closePath();
  ctx.fill();

  // 5. Lake Surface with Golden Sunset Reflection
  const lakeY = h * 0.68;
  const lakeH = h - lakeY;
  const lakeGrad = ctx.createLinearGradient(0, lakeY, 0, h);
  lakeGrad.addColorStop(0, "#c25117");
  lakeGrad.addColorStop(0.3, "#541926");
  lakeGrad.addColorStop(1, "#0d0514");
  ctx.fillStyle = lakeGrad;
  ctx.fillRect(0, lakeY, w, lakeH);

  // Sun reflection on water
  const reflGrad = ctx.createRadialGradient(sunX, lakeY + 20, 10, sunX, lakeY + lakeH * 0.5, sunR * 2.5);
  reflGrad.addColorStop(0, "rgba(255, 230, 150, 0.7)");
  reflGrad.addColorStop(0.4, "rgba(247, 127, 0, 0.35)");
  reflGrad.addColorStop(1, "transparent");
  ctx.fillStyle = reflGrad;
  ctx.fillRect(sunX - sunR * 2.5, lakeY, sunR * 5, lakeH);

  // Horizontal water ripples
  ctx.strokeStyle = "rgba(255, 240, 180, 0.45)";
  ctx.lineWidth = 1.5;
  for (let y = lakeY + 10; y < h - 40; y += 8 + (y - lakeY) * 0.15) {
    const rx = sunX + (Math.sin(y * 0.8) * (y - lakeY) * 0.4);
    const rw = 40 + (y - lakeY) * 1.6;
    ctx.beginPath();
    ctx.moveTo(rx - rw, y);
    ctx.lineTo(rx + rw, y);
    ctx.stroke();
  }

  // 6. Foreground Shoreline & Pine Trees Silhouettes
  ctx.fillStyle = "#0c0412";
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.72);
  ctx.quadraticCurveTo(w * 0.25, h * 0.74, w * 0.45, h * 0.88);
  ctx.lineTo(w * 0.45, h);
  ctx.closePath();
  ctx.fill();

  // Draw pine trees on shoreline
  const treeCount = 14;
  for (let i = 0; i < treeCount; i++) {
    const tx = (i * (w * 0.03)) + 15;
    const ty = h * 0.73 + (i % 3) * 18;
    const th = 60 + (i % 5) * 22;
    const tw = th * 0.35;

    ctx.fillStyle = "#09030e";
    ctx.beginPath();
    ctx.moveTo(tx, ty - th);
    ctx.lineTo(tx + tw, ty);
    ctx.lineTo(tx - tw, ty);
    ctx.closePath();
    ctx.fill();
  }

  // 7. Flocks of Birds in V-Formation
  ctx.strokeStyle = "rgba(40, 15, 45, 0.85)";
  ctx.lineWidth = 2;
  const birds = [
    { x: w * 0.35, y: h * 0.26, s: 8 },
    { x: w * 0.38, y: h * 0.23, s: 7 },
    { x: w * 0.42, y: h * 0.20, s: 9 },
    { x: w * 0.46, y: h * 0.22, s: 8 },
    { x: w * 0.49, y: h * 0.25, s: 6 },
  ];
  for (const b of birds) {
    ctx.beginPath();
    ctx.moveTo(b.x - b.s, b.y);
    ctx.quadraticCurveTo(b.x - b.s * 0.5, b.y - b.s * 0.6, b.x, b.y);
    ctx.quadraticCurveTo(b.x + b.s * 0.5, b.y - b.s * 0.6, b.x + b.s, b.y);
    ctx.stroke();
  }

  // 8. Elegant Atmospheric Caption Watermark (if title)
  if (title) {
    ctx.save();
    ctx.fillStyle = "rgba(10, 4, 16, 0.65)";
    ctx.fillRect(w * 0.05, h - 70, w * 0.9, 48);
    ctx.strokeStyle = "rgba(252, 191, 73, 0.4)";
    ctx.strokeRect(w * 0.05, h - 70, w * 0.9, 48);

    ctx.fillStyle = "#fffef0";
    ctx.font = "bold 18px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`✦ ${title}`, w * 0.07, h - 40);

    ctx.fillStyle = "#fcbf49";
    ctx.font = "500 13px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(subtitle || "4K CINEMATIC ARTWORK • PREMIERS AI", w * 0.93, h - 40);
    ctx.restore();
  }
}

/**
 * =======================================================================
 * PHOTOREALISTIC AERODYNAMIC SUPERCAR / AUTOMOTIVE ARTWORK
 * =======================================================================
 */
function drawSupercar(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle?: string) {
  // 1. Dark Neon Cyber Studio Backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, "#08090d");
  bgGrad.addColorStop(0.5, "#10141f");
  bgGrad.addColorStop(0.7, "#141724");
  bgGrad.addColorStop(1, "#0a0a0f");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Distant City Neon Horizon
  const horizonY = h * 0.52;
  const cityGrad = ctx.createLinearGradient(0, horizonY - 120, 0, horizonY);
  cityGrad.addColorStop(0, "transparent");
  cityGrad.addColorStop(0.6, "rgba(0, 212, 160, 0.12)");
  cityGrad.addColorStop(1, "rgba(0, 184, 212, 0.25)");
  ctx.fillStyle = cityGrad;
  ctx.fillRect(0, horizonY - 120, w, 120);

  // 2. Wet Asphalt Road Surface & Reflections
  const roadGrad = ctx.createLinearGradient(0, horizonY, 0, h);
  roadGrad.addColorStop(0, "#0d0f16");
  roadGrad.addColorStop(0.4, "#151822");
  roadGrad.addColorStop(1, "#07080b");
  ctx.fillStyle = roadGrad;
  ctx.fillRect(0, horizonY, w, h - horizonY);

  // Asphalt perspective speed lines
  ctx.strokeStyle = "rgba(0, 212, 160, 0.18)";
  ctx.lineWidth = 1.5;
  for (let i = -10; i <= 10; i++) {
    ctx.beginPath();
    ctx.moveTo(w * 0.5 + i * 25, horizonY);
    ctx.lineTo(w * 0.5 + i * 160, h);
    ctx.stroke();
  }

  // 3. Supercar Body (Aggressive Low-Slung Hypercar Silhouette)
  const cx = w * 0.5;
  const cy = h * 0.62;
  const carW = w * 0.78;
  const carH = h * 0.28;

  ctx.save();
  // Underglow neon lighting
  const underglow = ctx.createRadialGradient(cx, cy + carH * 0.35, 20, cx, cy + carH * 0.35, carW * 0.5);
  underglow.addColorStop(0, "rgba(0, 255, 200, 0.65)");
  underglow.addColorStop(0.5, "rgba(0, 184, 212, 0.25)");
  underglow.addColorStop(1, "transparent");
  ctx.fillStyle = underglow;
  ctx.fillRect(cx - carW * 0.6, cy + carH * 0.2, carW * 1.2, carH * 0.5);

  // Main Car Body Contour
  ctx.beginPath();
  // Start front bumper
  ctx.moveTo(cx - carW * 0.48, cy + carH * 0.3);
  // Front splitter
  ctx.lineTo(cx - carW * 0.44, cy + carH * 0.34);
  ctx.lineTo(cx - carW * 0.36, cy + carH * 0.34);
  // Front wheel arch
  ctx.lineTo(cx - carW * 0.32, cy + carH * 0.22);
  ctx.lineTo(cx - carW * 0.24, cy + carH * 0.22);
  ctx.lineTo(cx - carW * 0.20, cy + carH * 0.32);
  // Hood curve up to windshield
  ctx.lineTo(cx - carW * 0.10, cy + carH * 0.10);
  ctx.lineTo(cx + carW * 0.02, cy - carH * 0.24); // Windshield peak
  // Low curved aerodynamic roof
  ctx.lineTo(cx + carW * 0.18, cy - carH * 0.24);
  // Rear deck / engine bay
  ctx.lineTo(cx + carW * 0.34, cy + carH * 0.05);
  // High GT wing spoiler
  ctx.lineTo(cx + carW * 0.44, cy - carH * 0.12);
  ctx.lineTo(cx + carW * 0.48, cy - carH * 0.12);
  ctx.lineTo(cx + carW * 0.46, cy + carH * 0.15);
  // Rear diffuser
  ctx.lineTo(cx + carW * 0.46, cy + carH * 0.34);
  ctx.lineTo(cx + carW * 0.38, cy + carH * 0.34);
  // Rear wheel arch
  ctx.lineTo(cx + carW * 0.32, cy + carH * 0.22);
  ctx.lineTo(cx + carW * 0.22, cy + carH * 0.22);
  ctx.lineTo(cx + carW * 0.16, cy + carH * 0.32);
  ctx.closePath();

  // Carbon Metallic Paint Gradient
  const carGrad = ctx.createLinearGradient(0, cy - carH * 0.3, 0, cy + carH * 0.4);
  carGrad.addColorStop(0, "#3a4153");
  carGrad.addColorStop(0.3, "#191c26");
  carGrad.addColorStop(0.7, "#0c0e14");
  carGrad.addColorStop(1, "#050608");
  ctx.fillStyle = carGrad;
  ctx.fill();

  ctx.strokeStyle = "rgba(0, 212, 160, 0.7)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // 4. Tinted Cockpit Glass
  ctx.fillStyle = "#070b12";
  ctx.beginPath();
  ctx.moveTo(cx - carW * 0.08, cy + carH * 0.08);
  ctx.lineTo(cx + carW * 0.01, cy - carH * 0.20);
  ctx.lineTo(cx + carW * 0.16, cy - carH * 0.20);
  ctx.lineTo(cx + carW * 0.24, cy + carH * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 5. Blazing LED Headlights & Volumetric Light Beam
  const hlX = cx - carW * 0.46;
  const hlY = cy + carH * 0.24;

  // Headlight beam projecting left
  const beamGrad = ctx.createRadialGradient(hlX, hlY, 5, hlX - w * 0.35, hlY + 20, w * 0.4);
  beamGrad.addColorStop(0, "rgba(0, 255, 230, 0.85)");
  beamGrad.addColorStop(0.3, "rgba(0, 212, 160, 0.35)");
  beamGrad.addColorStop(1, "transparent");
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(hlX, hlY - 6);
  ctx.lineTo(0, hlY - 40);
  ctx.lineTo(0, hlY + 80);
  ctx.lineTo(hlX, hlY + 6);
  ctx.closePath();
  ctx.fill();

  // LED emitter
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(hlX, hlY, 7, 0, Math.PI * 2);
  ctx.fill();

  // 6. Horizontal Red LED Taillight Blade (Right side)
  const tlX = cx + carW * 0.44;
  const tlY = cy + carH * 0.16;
  ctx.fillStyle = "#ff1e00";
  ctx.shadowColor = "#ff3b00";
  ctx.shadowBlur = 20;
  ctx.fillRect(tlX - 15, tlY - 4, 30, 8);

  // 7. Alloy Wheels & Glowing Calipers
  const wheels = [
    { x: cx - carW * 0.27, y: cy + carH * 0.32, r: carH * 0.32 },
    { x: cx + carW * 0.27, y: cy + carH * 0.32, r: carH * 0.32 },
  ];

  for (const wh of wheels) {
    // Tire
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#08090d";
    ctx.beginPath();
    ctx.arc(wh.x, wh.y, wh.r, 0, Math.PI * 2);
    ctx.fill();

    // Rim edge
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Brake disc & neon caliper
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(wh.x, wh.y, wh.r * 0.65, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#00d4a0";
    ctx.shadowColor = "#00d4a0";
    ctx.shadowBlur = 10;
    ctx.fillRect(wh.x - wh.r * 0.5, wh.y - wh.r * 0.3, wh.r * 0.35, wh.r * 0.3);
    ctx.shadowBlur = 0;

    // Spokes
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2.5;
    for (let a = 0; a < 6; a++) {
      const ang = (a * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(wh.x, wh.y);
      ctx.lineTo(wh.x + Math.cos(ang) * (wh.r * 0.75), wh.y + Math.sin(ang) * (wh.r * 0.75));
      ctx.stroke();
    }
  }

  ctx.restore();

  // 8. Title Header Plaque
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 24px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title || "APEX HYPERCAR", cx, 60);

  ctx.fillStyle = "#00d4a0";
  ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(subtitle || "PRECISION AERODYNAMICS • 4K HIGH DEFINITION", cx, 85);
  ctx.restore();
}

/**
 * =======================================================================
 * NEON CYBERPUNK METROPOLIS / CITYSCAPE
 * =======================================================================
 */
function drawCyberCity(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle?: string) {
  // 1. Cyber Dark Sky with Purple Neon Fog
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, "#06030d");
  skyGrad.addColorStop(0.4, "#130826");
  skyGrad.addColorStop(0.7, "#22093d");
  skyGrad.addColorStop(1, "#0a0414");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Towering Skyscraper Silhouettes
  const buildings = [
    { x: 0, w: w * 0.18, h: h * 0.75, color: "#110620", neon: "#00d4a0" },
    { x: w * 0.15, w: w * 0.22, h: h * 0.88, color: "#19082e", neon: "#ff007f" },
    { x: w * 0.34, w: w * 0.16, h: h * 0.68, color: "#0d041a", neon: "#38bdf8" },
    { x: w * 0.48, w: w * 0.24, h: h * 0.95, color: "#1e0b38", neon: "#ffd700" },
    { x: w * 0.70, w: w * 0.18, h: h * 0.78, color: "#140726", neon: "#00f0ff" },
    { x: w * 0.84, w: w * 0.18, h: h * 0.85, color: "#0f051c", neon: "#ff0055" },
  ];

  for (const b of buildings) {
    const by = h - b.h;
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, by, b.w, b.h);

    // Neon edge highlight
    ctx.strokeStyle = b.neon;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(b.x, h);
    ctx.lineTo(b.x, by);
    ctx.lineTo(b.x + b.w, by);
    ctx.lineTo(b.x + b.w, h);
    ctx.stroke();

    // Glowing window grid
    ctx.fillStyle = b.neon;
    for (let wy = by + 25; wy < h - 80; wy += 22) {
      for (let wx = b.x + 12; wx < b.x + b.w - 12; wx += 16) {
        if ((wx + wy) % 5 === 0) {
          ctx.fillRect(wx, wy, 6, 9);
        }
      }
    }

    // Holographic Billboard on select buildings
    if (b.w > w * 0.2) {
      const bbY = by + 60;
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(b.x + 15, bbY, b.w - 30, 45);
      ctx.strokeStyle = b.neon;
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x + 15, bbY, b.w - 30, 45);

      ctx.fillStyle = b.neon;
      ctx.font = "bold 16px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("PREMIERS AI", b.x + b.w / 2, bbY + 28);
    }
  }

  // 3. Flying Vehicles / Aerocars with Neon Trails
  const vehicles = [
    { x: w * 0.25, y: h * 0.32, dir: 1, color: "#00ffff" },
    { x: w * 0.65, y: h * 0.24, dir: -1, color: "#ff0077" },
    { x: w * 0.80, y: h * 0.38, dir: -1, color: "#00d4a0" },
  ];

  for (const v of vehicles) {
    ctx.strokeStyle = v.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(v.x - v.dir * 120, v.y);
    ctx.lineTo(v.x, v.y);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = v.color;
    ctx.shadowBlur = 15;
    ctx.fillRect(v.x - 12, v.y - 4, 24, 8);
    ctx.shadowBlur = 0;
  }

  // 4. Wet Street Reflections at Bottom
  const streetY = h * 0.82;
  const streetGrad = ctx.createLinearGradient(0, streetY, 0, h);
  streetGrad.addColorStop(0, "rgba(5, 2, 10, 0.95)");
  streetGrad.addColorStop(1, "#030106");
  ctx.fillStyle = streetGrad;
  ctx.fillRect(0, streetY, w, h - streetY);

  // Vertical light reflection columns
  for (const b of buildings) {
    const refl = ctx.createLinearGradient(0, streetY, 0, h);
    refl.addColorStop(0, b.neon + "66");
    refl.addColorStop(1, "transparent");
    ctx.fillStyle = refl;
    ctx.fillRect(b.x + b.w * 0.2, streetY, b.w * 0.6, h - streetY);
  }

  // 5. Title Header
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 26px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title || "NEO CYBER CITY", w / 2, 55);

  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(subtitle || "FUTURISTIC METROPOLIS • 4K RENDER", w / 2, 80);
  ctx.restore();
}

/**
 * =======================================================================
 * DEEP SPACE, NEBULA & ASTRONAUT ODYSSEY
 * =======================================================================
 */
function drawDeepSpace(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle?: string) {
  // Deep space void
  ctx.fillStyle = "#020108";
  ctx.fillRect(0, 0, w, h);

  // 1. Colorful Nebula Clouds
  const nebulae = [
    { x: w * 0.3, y: h * 0.35, r: w * 0.45, col: "rgba(168, 85, 247, 0.22)" },
    { x: w * 0.7, y: h * 0.45, r: w * 0.50, col: "rgba(6, 182, 212, 0.20)" },
    { x: w * 0.5, y: h * 0.65, r: w * 0.40, col: "rgba(236, 72, 153, 0.18)" },
  ];
  for (const n of nebulae) {
    const ng = ctx.createRadialGradient(n.x, n.y, 10, n.x, n.y, n.r);
    ng.addColorStop(0, n.col);
    ng.addColorStop(1, "transparent");
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Stars
  for (let i = 0; i < 220; i++) {
    const sx = (Math.sin(i * 997) * 0.5 + 0.5) * w;
    const sy = (Math.cos(i * 733) * 0.5 + 0.5) * h;
    const sr = (i % 7 === 0) ? 2.5 : (i % 3 === 0) ? 1.5 : 0.8;
    const sa = 0.3 + (i % 5) * 0.15;
    ctx.fillStyle = `rgba(255, 255, 255, ${sa})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Giant Ringed Planet (Top-Right)
  const px = w * 0.72;
  const py = h * 0.28;
  const pr = Math.min(w, h) * 0.18;

  // Planet body
  const planetGrad = ctx.createRadialGradient(px - pr * 0.4, py - pr * 0.4, 20, px, py, pr);
  planetGrad.addColorStop(0, "#fef08a");
  planetGrad.addColorStop(0.4, "#ea580c");
  planetGrad.addColorStop(0.8, "#7c2d12");
  planetGrad.addColorStop(1, "#180602");
  ctx.fillStyle = planetGrad;
  ctx.beginPath();
  ctx.arc(px, py, pr, 0, Math.PI * 2);
  ctx.fill();

  // Planet rings
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(-Math.PI / 6);
  ctx.strokeStyle = "rgba(253, 224, 71, 0.45)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.ellipse(0, 0, pr * 2.2, pr * 0.45, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(251, 146, 60, 0.3)";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.ellipse(0, 0, pr * 2.5, pr * 0.52, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 4. Astronaut Silhouette with Gold Reflective Visor (Center-Left)
  const ax = w * 0.38;
  const ay = h * 0.60;
  const helmetR = Math.min(w, h) * 0.14;

  ctx.save();
  // White Space Suit Outline
  ctx.fillStyle = "#f1f5f9";
  ctx.beginPath();
  ctx.arc(ax, ay, helmetR, 0, Math.PI * 2);
  ctx.fill();

  // Suit shoulders
  ctx.beginPath();
  ctx.moveTo(ax - helmetR * 1.5, ay + helmetR * 2.2);
  ctx.quadraticCurveTo(ax, ay + helmetR * 0.7, ax + helmetR * 1.5, ay + helmetR * 2.2);
  ctx.lineTo(ax - helmetR * 1.5, ay + helmetR * 2.2);
  ctx.closePath();
  ctx.fillStyle = "#e2e8f0";
  ctx.fill();

  // Gold Mirrored Visor (Reflecting Nebula and Planet)
  const visorGrad = ctx.createLinearGradient(ax - helmetR * 0.7, ay - helmetR * 0.6, ax + helmetR * 0.7, ay + helmetR * 0.6);
  visorGrad.addColorStop(0, "#fde047");
  visorGrad.addColorStop(0.4, "#eab308");
  visorGrad.addColorStop(0.7, "#a855f7");
  visorGrad.addColorStop(1, "#06b6d4");
  ctx.fillStyle = visorGrad;
  ctx.beginPath();
  ctx.ellipse(ax, ay, helmetR * 0.72, helmetR * 0.60, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Visor specular gleam
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.beginPath();
  ctx.ellipse(ax - helmetR * 0.3, ay - helmetR * 0.25, helmetR * 0.25, helmetR * 0.12, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Title
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 24px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title || "COSMIC ODYSSEY", w / 2, 55);

  ctx.fillStyle = "#a855f7";
  ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(subtitle || "DEEP SPACE DISCOVERY • PREMIERS AI", w / 2, 80);
  ctx.restore();
}

/**
 * =======================================================================
 * MAJESTIC ANIMAL & WILDLIFE ARTWORK
 * =======================================================================
 */
function drawMajesticAnimal(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle?: string) {
  const cx = w / 2;
  const cy = h * 0.48;

  // Dark Celestial Background
  const bg = ctx.createRadialGradient(cx, cy, 30, cx, cy, w * 0.7);
  bg.addColorStop(0, "#2a1506");
  bg.addColorStop(0.6, "#140802");
  bg.addColorStop(1, "#070301");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Full Moon / Solar Halo behind beast
  const moonGrad = ctx.createRadialGradient(cx, cy - 20, 20, cx, cy - 20, w * 0.38);
  moonGrad.addColorStop(0, "rgba(255, 215, 0, 0.5)");
  moonGrad.addColorStop(0.5, "rgba(255, 120, 0, 0.25)");
  moonGrad.addColorStop(1, "transparent");
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(cx, cy - 20, w * 0.38, 0, Math.PI * 2);
  ctx.fill();

  // Stylized Lion / Beast Crest
  ctx.save();
  // Mane Flares
  ctx.strokeStyle = "#ffaa00";
  ctx.lineWidth = 3;
  for (let i = 0; i < 18; i++) {
    const ang = (i * Math.PI) / 9;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * 90, cy + Math.sin(ang) * 90);
    ctx.quadraticCurveTo(
      cx + Math.cos(ang + 0.2) * 160,
      cy + Math.sin(ang + 0.2) * 160,
      cx + Math.cos(ang) * 220,
      cy + Math.sin(ang) * 220
    );
    ctx.stroke();
  }

  // Face Silhouette
  ctx.fillStyle = "#1c0d04";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 110);
  ctx.lineTo(cx + 90, cy - 40);
  ctx.lineTo(cx + 70, cy + 80);
  ctx.lineTo(cx, cy + 140);
  ctx.lineTo(cx - 70, cy + 80);
  ctx.lineTo(cx - 90, cy - 40);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Glowing Golden Eyes
  ctx.fillStyle = "#00ffff";
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 20;

  // Left Eye
  ctx.beginPath();
  ctx.moveTo(cx - 45, cy - 10);
  ctx.lineTo(cx - 15, cy - 5);
  ctx.lineTo(cx - 35, cy + 8);
  ctx.closePath();
  ctx.fill();

  // Right Eye
  ctx.beginPath();
  ctx.moveTo(cx + 45, cy - 10);
  ctx.lineTo(cx + 15, cy - 5);
  ctx.lineTo(cx + 35, cy + 8);
  ctx.closePath();
  ctx.fill();

  // Muzzle & Whiskers
  ctx.strokeStyle = "rgba(255, 215, 0, 0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 20, cy + 60);
  ctx.lineTo(cx + 20, cy + 60);
  ctx.lineTo(cx, cy + 85);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();

  // Title Plaque
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 26px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title || "MAJESTIC BEAST", cx, h * 0.88);

  ctx.fillStyle = "#eab308";
  ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(subtitle || "WILDLIFE ARTWORK • PREMIERS AI", cx, h * 0.93);
  ctx.restore();
}

/**
 * =======================================================================
 * ANIME & MANGA CHARACTER ARTWORK
 * =======================================================================
 */
function drawAnimeCharacter(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle?: string) {
  const cx = w / 2;
  const cy = h * 0.48;

  // Dynamic Comic Dark Background
  ctx.fillStyle = "#090a12";
  ctx.fillRect(0, 0, w, h);

  // Speed lines radiating outward
  ctx.strokeStyle = "rgba(0, 212, 160, 0.15)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 36; i++) {
    const ang = (i * Math.PI) / 18;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * 120, cy + Math.sin(ang) * 120);
    ctx.lineTo(cx + Math.cos(ang) * w, cy + Math.sin(ang) * h);
    ctx.stroke();
  }

  // Energy Blade / Katana Slash
  ctx.save();
  const bladeGrad = ctx.createLinearGradient(cx - 200, cy - 150, cx + 200, cy + 150);
  bladeGrad.addColorStop(0, "#00ffff");
  bladeGrad.addColorStop(0.5, "#ffffff");
  bladeGrad.addColorStop(1, "#a855f7");

  ctx.strokeStyle = bladeGrad;
  ctx.lineWidth = 8;
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.moveTo(cx - 220, cy + 160);
  ctx.lineTo(cx + 220, cy - 160);
  ctx.stroke();

  // Hero Silhouette with Spiky Anime Hair
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#131624";
  ctx.beginPath();
  // Spikes
  ctx.moveTo(cx, cy - 180);
  ctx.lineTo(cx + 40, cy - 130);
  ctx.lineTo(cx + 80, cy - 150);
  ctx.lineTo(cx + 60, cy - 90);
  ctx.lineTo(cx + 95, cy - 70);
  ctx.lineTo(cx + 50, cy - 20);
  ctx.lineTo(cx + 55, cy + 60);
  // Chin
  ctx.lineTo(cx, cy + 110);
  ctx.lineTo(cx - 55, cy + 60);
  ctx.lineTo(cx - 50, cy - 20);
  ctx.lineTo(cx - 95, cy - 70);
  ctx.lineTo(cx - 60, cy - 90);
  ctx.lineTo(cx - 80, cy - 150);
  ctx.lineTo(cx - 40, cy - 130);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(0, 212, 160, 0.8)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Expressive Glowing Anime Eyes
  ctx.fillStyle = "#00ffff";
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 20;
  ctx.fillRect(cx - 35, cy - 10, 24, 8);
  ctx.fillRect(cx + 11, cy - 10, 24, 8);

  ctx.restore();

  // Title
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 24px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title || "ANIME CHRONICLES", cx, h * 0.88);

  ctx.fillStyle = "#00d4a0";
  ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(subtitle || "MANGA & ANIME ART • PREMIERS AI", cx, h * 0.93);
  ctx.restore();
}

/**
 * =======================================================================
 * MODERN LUXURY ARCHITECTURE & VILLA AT DUSK
 * =======================================================================
 */
function drawModernArchitecture(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle?: string) {
  // Dusk sky
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
  sky.addColorStop(0, "#0c0a1a");
  sky.addColorStop(0.5, "#21163b");
  sky.addColorStop(1, "#542c4c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Modern Cantilevered Villa
  const vx = w * 0.15;
  const vy = h * 0.32;
  const vw = w * 0.70;
  const vh = h * 0.38;

  // Upper glass cantilever
  ctx.fillStyle = "#1e1e2d";
  ctx.fillRect(vx, vy, vw, vh * 0.55);
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 3;
  ctx.strokeRect(vx, vy, vw, vh * 0.55);

  // Warm interior lighting glowing through glass
  const interior = ctx.createLinearGradient(vx, vy, vx + vw, vy);
  interior.addColorStop(0, "rgba(254, 215, 170, 0.85)");
  interior.addColorStop(0.5, "rgba(253, 186, 116, 0.5)");
  interior.addColorStop(1, "rgba(254, 240, 138, 0.85)");
  ctx.fillStyle = interior;
  ctx.fillRect(vx + 15, vy + 15, vw - 30, vh * 0.55 - 30);

  // Lower Stone Terrace
  ctx.fillStyle = "#0f0f17";
  ctx.fillRect(vx + vw * 0.2, vy + vh * 0.55, vw * 0.8, vh * 0.45);

  // Turquoise Infinity Pool
  const poolY = vy + vh;
  const poolH = h - poolY - 50;
  const pool = ctx.createLinearGradient(0, poolY, 0, poolY + poolH);
  pool.addColorStop(0, "#06b6d4");
  pool.addColorStop(0.6, "#0e7490");
  pool.addColorStop(1, "#082f49");
  ctx.fillStyle = pool;
  ctx.fillRect(0, poolY, w, poolH);

  // Pool water caustics ripples
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 1.5;
  for (let py = poolY + 12; py < poolY + poolH; py += 14) {
    ctx.beginPath();
    ctx.moveTo(w * 0.1, py);
    ctx.quadraticCurveTo(w * 0.5, py + (py % 3) * 3, w * 0.9, py);
    ctx.stroke();
  }

  // Title
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 22px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title || "MODERN VILLA AT DUSK", w / 2, 50);

  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 12px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(subtitle || "LUXURY ARCHITECTURAL DESIGN", w / 2, 75);
  ctx.restore();
}

/**
 * =======================================================================
 * GOURMET CULINARY & MACRO FOOD ARTWORK
 * =======================================================================
 */
function drawGourmetFood(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle?: string) {
  const cx = w / 2;
  const cy = h * 0.50;

  // Dark slate backdrop
  ctx.fillStyle = "#121216";
  ctx.fillRect(0, 0, w, h);

  // Warm culinary spotlight
  const spot = ctx.createRadialGradient(cx, cy, 30, cx, cy, w * 0.45);
  spot.addColorStop(0, "rgba(254, 215, 170, 0.45)");
  spot.addColorStop(0.5, "rgba(217, 119, 6, 0.15)");
  spot.addColorStop(1, "transparent");
  ctx.fillStyle = spot;
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Slate plate
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 60, w * 0.38, w * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#333344";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Gourmet Burger / Dish
  // Bottom Bun
  ctx.fillStyle = "#c28135";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 40, 110, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  // Patty
  ctx.fillStyle = "#3d2110";
  ctx.fillRect(cx - 105, cy + 15, 210, 22);

  // Melted Cheese Drips
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.moveTo(cx - 110, cy + 15);
  ctx.lineTo(cx + 110, cy + 15);
  ctx.lineTo(cx + 90, cy + 32);
  ctx.lineTo(cx + 60, cy + 18);
  ctx.lineTo(cx + 20, cy + 35);
  ctx.lineTo(cx - 20, cy + 18);
  ctx.lineTo(cx - 50, cy + 38);
  ctx.closePath();
  ctx.fill();

  // Fresh Lettuce Green
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(cx - 100, cy - 5, 200, 15);

  // Top Sesame Bun
  ctx.fillStyle = "#d98a3e";
  ctx.beginPath();
  ctx.ellipse(cx, cy - 25, 110, 55, 0, Math.PI, 0);
  ctx.fill();

  // Sesame Seeds
  ctx.fillStyle = "#fef08a";
  for (let i = 0; i < 25; i++) {
    const sx = cx - 80 + (i * 7.5);
    const sy = cy - 45 + Math.sin(i * 0.8) * 18;
    ctx.fillRect(sx, sy, 3, 5);
  }

  // Steam wisps
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 2;
  for (let s = -1; s <= 1; s++) {
    ctx.beginPath();
    ctx.moveTo(cx + s * 40, cy - 90);
    ctx.quadraticCurveTo(cx + s * 55, cy - 130, cx + s * 30, cy - 170);
    ctx.stroke();
  }

  // Title
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 24px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title || "ARTISANAL GOURMET", cx, h * 0.88);

  ctx.fillStyle = "#f59e0b";
  ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(subtitle || "CULINARY EXCELLENCE • PREMIERS AI", cx, h * 0.93);
  ctx.restore();
}

/**
 * =======================================================================
 * ABSTRACT 3D CHROME & HOLOGRAPHIC GEOMETRY
 * =======================================================================
 */
function drawAbstract3D(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle?: string) {
  const cx = w / 2;
  const cy = h / 2;

  // Dark studio gradient
  ctx.fillStyle = "#0a0a12";
  ctx.fillRect(0, 0, w, h);

  // Dual cyan & magenta backlight
  const l1 = ctx.createRadialGradient(cx - 150, cy - 150, 10, cx - 150, cy - 150, 300);
  l1.addColorStop(0, "rgba(0, 212, 160, 0.35)");
  l1.addColorStop(1, "transparent");
  ctx.fillStyle = l1;
  ctx.beginPath();
  ctx.arc(cx - 150, cy - 150, 300, 0, Math.PI * 2);
  ctx.fill();

  const l2 = ctx.createRadialGradient(cx + 150, cy + 150, 10, cx + 150, cy + 150, 300);
  l2.addColorStop(0, "rgba(168, 85, 247, 0.35)");
  l2.addColorStop(1, "transparent");
  ctx.fillStyle = l2;
  ctx.beginPath();
  ctx.arc(cx + 150, cy + 150, 300, 0, Math.PI * 2);
  ctx.fill();

  // Floating Concentric Torus Rings
  ctx.save();
  ctx.lineWidth = 14;
  for (let r = 0; r < 3; r++) {
    const rad = 140 + r * 55;
    ctx.strokeStyle = r === 0 ? "#00d4a0" : r === 1 ? "#38bdf8" : "#a855f7";
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rad, rad * 0.4, (r * Math.PI) / 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Central Chrome Sphere with Liquid Reflections
  const sphereR = 90;
  const sphereGrad = ctx.createRadialGradient(cx - 30, cy - 30, 10, cx, cy, sphereR);
  sphereGrad.addColorStop(0, "#ffffff");
  sphereGrad.addColorStop(0.3, "#00d4a0");
  sphereGrad.addColorStop(0.7, "#a855f7");
  sphereGrad.addColorStop(1, "#090914");
  ctx.fillStyle = sphereGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, sphereR, 0, Math.PI * 2);
  ctx.fill();

  // Title
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 24px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title || "ABSTRACT CHROME", cx, h * 0.88);

  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(subtitle || "3D HOLOGRAPHIC RENDER • PREMIERS AI", cx, h * 0.93);
  ctx.restore();
}

/**
 * =======================================================================
 * MODERN CORPORATE & ENTERPRISE COMPANY LOGO
 * =======================================================================
 */
function drawCompanyLogo(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string,
  subtitle?: string,
  pal: typeof PALETTES.emerald = PALETTES.emerald
) {
  const cx = w / 2;
  const cy = h * 0.42;

  // Dark Minimalist Luxury Slate Background
  const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, w * 0.7);
  bgGrad.addColorStop(0, "#121722");
  bgGrad.addColorStop(0.6, "#0a0c12");
  bgGrad.addColorStop(1, "#050608");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle Corporate Grid Lines
  ctx.strokeStyle = "rgba(0, 212, 160, 0.06)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Central Emblem: Interlocking Modern Hexagonal Delta Monogram
  ctx.save();
  const hexR = Math.min(w, h) * 0.16;

  // Outer Hexagon
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 8;
  ctx.shadowColor = pal.primary;
  ctx.shadowBlur = 25;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const ang = (i * Math.PI) / 3 - Math.PI / 6;
    const hx = cx + Math.cos(ang) * hexR;
    const hy = cy + Math.sin(ang) * hexR;
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke();

  // Inner Geometric Delta Node
  const deltaGrad = ctx.createLinearGradient(cx - hexR * 0.6, cy - hexR * 0.6, cx + hexR * 0.6, cy + hexR * 0.6);
  deltaGrad.addColorStop(0, pal.primary);
  deltaGrad.addColorStop(0.5, pal.accent);
  deltaGrad.addColorStop(1, "#38bdf8");

  ctx.fillStyle = deltaGrad;
  ctx.shadowColor = pal.accent;
  ctx.shadowBlur = 20;

  ctx.beginPath();
  ctx.moveTo(cx, cy - hexR * 0.6);
  ctx.lineTo(cx + hexR * 0.55, cy + hexR * 0.45);
  ctx.lineTo(cx, cy + hexR * 0.2);
  ctx.lineTo(cx - hexR * 0.55, cy + hexR * 0.45);
  ctx.closePath();
  ctx.fill();

  // Center node core
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy - hexR * 0.1, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Bold Corporate Brand Name
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const fontSize = Math.min(Math.floor(w * 0.075), 68);
  ctx.font = `900 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;

  const textGrad = ctx.createLinearGradient(0, h * 0.66, 0, h * 0.74);
  textGrad.addColorStop(0, "#ffffff");
  textGrad.addColorStop(1, "#cbd5e1");
  ctx.fillStyle = textGrad;
  ctx.fillText(title, cx, h * 0.70);

  // Subtitle / Industry Tagline
  ctx.font = "bold 16px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = pal.primary;
  ctx.fillText((subtitle || "GLOBAL INNOVATION & TECHNOLOGY ENTERPRISE").toUpperCase(), cx, h * 0.78);

  // Verified Corporate Monogram Badge
  ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - 180, h * 0.83, 360, 32);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("REGISTERED BRAND IDENTITY • 4K VECTOR READY", cx, h * 0.83 + 16);
  ctx.restore();
}

/**
 * =======================================================================
 * FITNESS & GYM POWERHOUSE ATHLETIC RENDER
 * =======================================================================
 */
function drawFitnessGym(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle?: string) {
  const cx = w / 2;
  const cy = h * 0.42;

  // Intense Dark Iron Atmosphere
  const bgGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, w * 0.8);
  bgGrad.addColorStop(0, "#220c08");
  bgGrad.addColorStop(0.5, "#110604");
  bgGrad.addColorStop(1, "#070202");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Volumetric Overhead Stage Floodlights
  ctx.save();
  const spotGrad = ctx.createRadialGradient(cx, 0, 10, cx, h * 0.5, w * 0.6);
  spotGrad.addColorStop(0, "rgba(255, 77, 0, 0.4)");
  spotGrad.addColorStop(0.6, "rgba(234, 88, 12, 0.08)");
  spotGrad.addColorStop(1, "transparent");
  ctx.fillStyle = spotGrad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Floating Chalk Dust & Energy Sparks
  ctx.save();
  for (let i = 0; i < 45; i++) {
    const px = Math.random() * w;
    const py = Math.random() * (h * 0.75);
    const rad = Math.random() * 2.5 + 0.5;
    ctx.fillStyle = i % 2 === 0 ? "rgba(255, 170, 0, 0.6)" : "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Stylized Olympic Barbell & Diamond Power Emblem
  ctx.save();
  ctx.translate(cx, cy);

  // Outer Glowing Iron Hex Ring
  const hexR = Math.min(w, h) * 0.18;
  ctx.strokeStyle = "#ea580c";
  ctx.lineWidth = 6;
  ctx.shadowColor = "#ff4d00";
  ctx.shadowBlur = 24;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const ang = (i * Math.PI) / 3 - Math.PI / 6;
    const hx = Math.cos(ang) * hexR;
    const hy = Math.sin(ang) * hexR;
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke();

  // Barbell Chrome Shaft
  const barLen = hexR * 1.5;
  const barGrad = ctx.createLinearGradient(-barLen, -6, barLen, 6);
  barGrad.addColorStop(0, "#94a3b8");
  barGrad.addColorStop(0.5, "#ffffff");
  barGrad.addColorStop(1, "#64748b");
  ctx.fillStyle = barGrad;
  ctx.fillRect(-barLen, -8, barLen * 2, 16);

  // Heavy Weight Plates (Left and Right)
  [-barLen * 0.85, barLen * 0.85].forEach((plateX) => {
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#ff4d00";
    ctx.lineWidth = 4;
    ctx.fillRect(plateX - 16, -hexR * 0.65, 32, hexR * 1.3);
    ctx.strokeRect(plateX - 16, -hexR * 0.65, 32, hexR * 1.3);

    // Inner plate rim
    ctx.fillStyle = "#ea580c";
    ctx.fillRect(plateX - 8, -hexR * 0.45, 16, hexR * 0.9);
  });

  // Central Athletic Crest Silhouette (V-Taper Shield)
  ctx.fillStyle = "#ff4d00";
  ctx.shadowColor = "#ea580c";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(0, -hexR * 0.45);
  ctx.lineTo(hexR * 0.45, -hexR * 0.1);
  ctx.lineTo(hexR * 0.25, hexR * 0.5);
  ctx.lineTo(0, hexR * 0.65);
  ctx.lineTo(-hexR * 0.25, hexR * 0.5);
  ctx.lineTo(-hexR * 0.45, -hexR * 0.1);
  ctx.closePath();
  ctx.fill();

  // Inner Bolt / Thunder Power
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(0, -hexR * 0.35);
  ctx.lineTo(hexR * 0.15, -hexR * 0.05);
  ctx.lineTo(0, 0);
  ctx.lineTo(hexR * 0.12, hexR * 0.35);
  ctx.lineTo(-hexR * 0.15, 0.05);
  ctx.lineTo(-0.02, -0.05);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Typography
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = Math.min(Math.floor(w * 0.075), 66);
  ctx.font = `900 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#ff4d00";
  ctx.shadowBlur = 18;
  ctx.fillText(title, cx, h * 0.72);

  ctx.font = "bold 15px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#fb923c";
  ctx.shadowBlur = 0;
  ctx.fillText((subtitle || "ELITE PERFORMANCE & POWER ATHLETICS").toUpperCase(), cx, h * 0.80);
  ctx.restore();
}

/**
 * =======================================================================
 * CRYPTO & BLOCKCHAIN 3D TOKEN
 * =======================================================================
 */
function drawCryptoBlockchain(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle?: string) {
  const cx = w / 2;
  const cy = h * 0.42;

  // Deep Obsidian Web3 Cosmos Background
  const bgGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, w * 0.75);
  bgGrad.addColorStop(0, "#081622");
  bgGrad.addColorStop(0.5, "#040912");
  bgGrad.addColorStop(1, "#020408");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Decentralized Network Grid Lines & Nodes
  ctx.save();
  ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
  ctx.lineWidth = 1;
  const nodes: { x: number; y: number }[] = [];
  for (let i = 0; i < 20; i++) {
    nodes.push({
      x: cx + (Math.random() - 0.5) * w * 0.85,
      y: cy + (Math.random() - 0.5) * h * 0.7,
    });
  }
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (dist < 180) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(nodes[i].x, nodes[i].y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 3D Glowing Holographic Crypto Coin
  ctx.save();
  const coinR = Math.min(w, h) * 0.19;

  // Coin Outer Glow
  const coinAura = ctx.createRadialGradient(cx, cy, coinR * 0.6, cx, cy, coinR * 1.4);
  coinAura.addColorStop(0, "rgba(245, 158, 11, 0.4)");
  coinAura.addColorStop(0.5, "rgba(56, 189, 248, 0.15)");
  coinAura.addColorStop(1, "transparent");
  ctx.fillStyle = coinAura;
  ctx.beginPath();
  ctx.arc(cx, cy, coinR * 1.4, 0, Math.PI * 2);
  ctx.fill();

  // 3D Coin Rim (Beveled Edge)
  ctx.beginPath();
  ctx.arc(cx, cy, coinR, 0, Math.PI * 2);
  const rimGrad = ctx.createLinearGradient(cx - coinR, cy - coinR, cx + coinR, cy + coinR);
  rimGrad.addColorStop(0, "#fbbf24");
  rimGrad.addColorStop(0.3, "#f59e0b");
  rimGrad.addColorStop(0.7, "#d97706");
  rimGrad.addColorStop(1, "#78350f");
  ctx.fillStyle = rimGrad;
  ctx.shadowColor = "#f59e0b";
  ctx.shadowBlur = 30;
  ctx.fill();

  // Inner Coin Face
  ctx.beginPath();
  ctx.arc(cx, cy, coinR * 0.88, 0, Math.PI * 2);
  const faceGrad = ctx.createRadialGradient(cx - coinR * 0.2, cy - coinR * 0.2, 10, cx, cy, coinR * 0.9);
  faceGrad.addColorStop(0, "#1e293b");
  faceGrad.addColorStop(0.7, "#0f172a");
  faceGrad.addColorStop(1, "#020617");
  ctx.fillStyle = faceGrad;
  ctx.fill();

  // Circuit Etchings on Face
  ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, coinR * 0.72, 0, Math.PI * 2);
  ctx.stroke();

  // Geometric Monogram / Blockchain Genesis Diamond Node
  const dGrad = ctx.createLinearGradient(cx - coinR * 0.4, cy - coinR * 0.4, cx + coinR * 0.4, cy + coinR * 0.4);
  dGrad.addColorStop(0, "#38bdf8");
  dGrad.addColorStop(0.5, "#fbbf24");
  dGrad.addColorStop(1, "#f59e0b");
  ctx.fillStyle = dGrad;
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 20;

  ctx.beginPath();
  ctx.moveTo(cx, cy - coinR * 0.5);
  ctx.lineTo(cx + coinR * 0.35, cy);
  ctx.lineTo(cx, cy + coinR * 0.5);
  ctx.lineTo(cx - coinR * 0.35, cy);
  ctx.closePath();
  ctx.fill();

  // Center Core
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Typography
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = Math.min(Math.floor(w * 0.075), 66);
  ctx.font = `900 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 15;
  ctx.fillText(title, cx, h * 0.72);

  ctx.font = "bold 15px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#38bdf8";
  ctx.shadowBlur = 0;
  ctx.fillText((subtitle || "DECENTRALIZED PROTOCOL • WEB3 SMART CORE").toUpperCase(), cx, h * 0.80);
  ctx.restore();
}

/**
 * =======================================================================
 * MEDICAL & HEALTHCARE CLINIC EMBLEM
 * =======================================================================
 */
function drawMedicalClinic(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle?: string) {
  const cx = w / 2;
  const cy = h * 0.42;

  // Clean Deep Cyan Clinical Background
  const bgGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, w * 0.8);
  bgGrad.addColorStop(0, "#06222b");
  bgGrad.addColorStop(0.6, "#03141a");
  bgGrad.addColorStop(1, "#01070a");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle Clinical Tech Grid & Waveform
  ctx.save();
  ctx.strokeStyle = "rgba(0, 212, 160, 0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Heartbeat ECG Wave Across Center
  ctx.strokeStyle = "rgba(0, 212, 160, 0.35)";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#00d4a0";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(0, cy + 120);
  ctx.lineTo(cx - 180, cy + 120);
  ctx.lineTo(cx - 150, cy + 110);
  ctx.lineTo(cx - 120, cy + 150);
  ctx.lineTo(cx - 90, cy + 60);
  ctx.lineTo(cx - 60, cy + 170);
  ctx.lineTo(cx - 30, cy + 120);
  ctx.lineTo(cx + 30, cy + 120);
  ctx.lineTo(cx + 60, cy + 70);
  ctx.lineTo(cx + 90, cy + 160);
  ctx.lineTo(cx + 120, cy + 120);
  ctx.lineTo(w, cy + 120);
  ctx.stroke();
  ctx.restore();

  // Central Medical Cross Shield & Glowing Helix
  ctx.save();
  const shieldR = Math.min(w, h) * 0.18;

  // Shield Silhouette
  ctx.fillStyle = "rgba(0, 212, 160, 0.12)";
  ctx.strokeStyle = "#00d4a0";
  ctx.lineWidth = 5;
  ctx.shadowColor = "#00d4a0";
  ctx.shadowBlur = 24;

  ctx.beginPath();
  ctx.moveTo(cx, cy - shieldR);
  ctx.lineTo(cx + shieldR * 0.8, cy - shieldR * 0.4);
  ctx.lineTo(cx + shieldR * 0.65, cy + shieldR * 0.6);
  ctx.lineTo(cx, cy + shieldR);
  ctx.lineTo(cx - shieldR * 0.65, cy + shieldR * 0.6);
  ctx.lineTo(cx - shieldR * 0.8, cy - shieldR * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Precision White & Cyan Medical Cross
  const crossW = shieldR * 0.36;
  const crossH = shieldR * 1.05;
  const crossGrad = ctx.createLinearGradient(cx - crossW, cy - crossH / 2, cx + crossW, cy + crossH / 2);
  crossGrad.addColorStop(0, "#ffffff");
  crossGrad.addColorStop(0.5, "#38bdf8");
  crossGrad.addColorStop(1, "#00d4a0");

  ctx.fillStyle = crossGrad;
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 18;

  // Vertical bar
  ctx.fillRect(cx - crossW / 2, cy - crossH / 2, crossW, crossH);
  // Horizontal bar
  ctx.fillRect(cx - crossH / 2, cy - crossW / 2, crossH, crossW);

  // Center Core
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Typography
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = Math.min(Math.floor(w * 0.075), 66);
  ctx.font = `900 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#00d4a0";
  ctx.shadowBlur = 15;
  ctx.fillText(title, cx, h * 0.72);

  ctx.font = "bold 15px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#00d4a0";
  ctx.shadowBlur = 0;
  ctx.fillText((subtitle || "ADVANCED HEALTHCARE & BIOMEDICAL PRECISION").toUpperCase(), cx, h * 0.80);
  ctx.restore();
}

/**
 * =======================================================================
 * ROBOTICS & AI ANDROID HUMANITY RENDER
 * =======================================================================
 */
function drawRoboticsAndroid(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle?: string) {
  const cx = w / 2;
  const cy = h * 0.42;

  // Deep Cyan-Indigo Cyber Lab Background
  const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, w * 0.8);
  bgGrad.addColorStop(0, "#081324");
  bgGrad.addColorStop(0.6, "#030814");
  bgGrad.addColorStop(1, "#010308");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Floating Quantum Data Nodes
  ctx.save();
  for (let i = 0; i < 35; i++) {
    const px = Math.random() * w;
    const py = Math.random() * (h * 0.8);
    const rad = Math.random() * 2 + 1;
    ctx.fillStyle = i % 2 === 0 ? "rgba(56, 189, 248, 0.7)" : "rgba(168, 85, 247, 0.7)";
    ctx.beginPath();
    ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Futuristic Android Head / Optical Sensor Core
  ctx.save();
  const faceR = Math.min(w, h) * 0.19;

  // Outer Hex Armor Ring
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 5;
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 24;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const ang = (i * Math.PI) / 3 - Math.PI / 6;
    const hx = cx + Math.cos(ang) * faceR;
    const hy = cy + Math.sin(ang) * faceR;
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke();

  // Metallic Titanium Face Plate
  const plateGrad = ctx.createLinearGradient(cx - faceR * 0.6, cy - faceR * 0.6, cx + faceR * 0.6, cy + faceR * 0.6);
  plateGrad.addColorStop(0, "#1e293b");
  plateGrad.addColorStop(0.5, "#0f172a");
  plateGrad.addColorStop(1, "#020617");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, faceR * 0.82, 0, Math.PI * 2);
  ctx.fill();

  // Cybernetic Optics Visor (Glowing Cyan Arc)
  ctx.strokeStyle = "#00d4a0";
  ctx.lineWidth = 8;
  ctx.shadowColor = "#00d4a0";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(cx, cy - faceR * 0.05, faceR * 0.52, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  // Glowing Optic Lens Core
  const lensGrad = ctx.createRadialGradient(cx, cy - faceR * 0.05, 5, cx, cy - faceR * 0.05, 45);
  lensGrad.addColorStop(0, "#ffffff");
  lensGrad.addColorStop(0.4, "#38bdf8");
  lensGrad.addColorStop(0.8, "#a855f7");
  lensGrad.addColorStop(1, "transparent");
  ctx.fillStyle = lensGrad;
  ctx.beginPath();
  ctx.arc(cx, cy - faceR * 0.05, 45, 0, Math.PI * 2);
  ctx.fill();

  // Circuit Traces Emanating Down
  ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
  ctx.lineWidth = 2;
  [-40, 0, 40].forEach((ox) => {
    ctx.beginPath();
    ctx.moveTo(cx + ox, cy + faceR * 0.2);
    ctx.lineTo(cx + ox, cy + faceR * 0.65);
    ctx.stroke();
  });
  ctx.restore();

  // Typography
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = Math.min(Math.floor(w * 0.075), 66);
  ctx.font = `900 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 15;
  ctx.fillText(title, cx, h * 0.72);

  ctx.font = "bold 15px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#38bdf8";
  ctx.shadowBlur = 0;
  ctx.fillText((subtitle || "AUTONOMOUS CYBERNETICS • ARTIFICIAL GENERAL INTELLIGENCE").toUpperCase(), cx, h * 0.80);
  ctx.restore();
}

/**
 * =======================================================================
 * FANTASY CASTLE & MYTHIC REALM
 * =======================================================================
 */
function drawFantasyCastle(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle?: string) {
  const cx = w / 2;
  const cy = h * 0.42;

  // Twilight Aurora Purple & Indigo Sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, "#080414");
  skyGrad.addColorStop(0.4, "#1d0e3a");
  skyGrad.addColorStop(0.7, "#3b1754");
  skyGrad.addColorStop(1, "#12061e");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Twin Mystic Moons
  ctx.save();
  // Primary Moon
  const moonGrad1 = ctx.createRadialGradient(cx - 160, cy - 140, 10, cx - 160, cy - 140, 70);
  moonGrad1.addColorStop(0, "#ffffff");
  moonGrad1.addColorStop(0.5, "#cbd5e1");
  moonGrad1.addColorStop(1, "rgba(203, 213, 225, 0)");
  ctx.fillStyle = moonGrad1;
  ctx.beginPath();
  ctx.arc(cx - 160, cy - 140, 70, 0, Math.PI * 2);
  ctx.fill();

  // Secondary Pink Crescent
  ctx.fillStyle = "rgba(244, 114, 182, 0.4)";
  ctx.beginPath();
  ctx.arc(cx + 200, cy - 180, 45, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Starlight field
  ctx.save();
  for (let i = 0; i < 60; i++) {
    const sx = Math.random() * w;
    const sy = Math.random() * (h * 0.6);
    ctx.fillStyle = i % 3 === 0 ? "#fef08a" : "#ffffff";
    ctx.beginPath();
    ctx.arc(sx, sy, Math.random() * 2 + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Floating Island Rock with Mystic Citadel
  ctx.save();
  // Castle Spire Silhouette
  ctx.fillStyle = "#0c0617";
  ctx.strokeStyle = "rgba(168, 85, 247, 0.6)";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 20;

  // Central Grand Spire
  ctx.beginPath();
  ctx.moveTo(cx - 35, cy + 50);
  ctx.lineTo(cx - 25, cy - 120);
  ctx.lineTo(cx, cy - 180);
  ctx.lineTo(cx + 25, cy - 120);
  ctx.lineTo(cx + 35, cy + 50);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Left & Right Flanking Watchtowers
  [-80, 80].forEach((tx) => {
    ctx.beginPath();
    ctx.moveTo(cx + tx - 25, cy + 50);
    ctx.lineTo(cx + tx - 18, cy - 70);
    ctx.lineTo(cx + tx, cy - 110);
    ctx.lineTo(cx + tx + 18, cy - 70);
    ctx.lineTo(cx + tx + 25, cy + 50);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Golden Amber Window in Tower
    ctx.fillStyle = "#fde047";
    ctx.fillRect(cx + tx - 5, cy - 40, 10, 20);
    ctx.fillStyle = "#0c0617";
  });

  // Center Castle Amber Rose Window
  ctx.fillStyle = "#fde047";
  ctx.shadowColor = "#fde047";
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(cx, cy - 60, 16, 0, Math.PI * 2);
  ctx.fill();

  // Floating Crag Rock Base
  ctx.fillStyle = "#12061e";
  ctx.beginPath();
  ctx.moveTo(cx - 180, cy + 50);
  ctx.quadraticCurveTo(cx - 120, cy + 130, cx, cy + 150);
  ctx.quadraticCurveTo(cx + 120, cy + 130, cx + 180, cy + 50);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Typography
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = Math.min(Math.floor(w * 0.075), 66);
  ctx.font = `900 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#c084fc";
  ctx.shadowBlur = 15;
  ctx.fillText(title, cx, h * 0.72);

  ctx.font = "bold 15px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#e879f9";
  ctx.shadowBlur = 0;
  ctx.fillText((subtitle || "ETHEREAL CITADEL • MYTHIC HIGH FANTASY ODYSSEY").toUpperCase(), cx, h * 0.80);
  ctx.restore();
}

/**
 * =======================================================================
 * STYLIZED EDITORIAL & CYBER PORTRAIT
 * =======================================================================
 */
function drawStylizedPortrait(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle?: string) {
  const cx = w / 2;
  const cy = h * 0.42;

  // High-Contrast Studio Dark Luxury Background
  const bgGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, w * 0.8);
  bgGrad.addColorStop(0, "#1a1222");
  bgGrad.addColorStop(0.6, "#0d0912");
  bgGrad.addColorStop(1, "#050308");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Dual-Tone Rim Lighting (Cyan left, Magenta right)
  ctx.save();
  const cyanRim = ctx.createRadialGradient(cx - 180, cy, 20, cx - 180, cy, 250);
  cyanRim.addColorStop(0, "rgba(56, 189, 248, 0.45)");
  cyanRim.addColorStop(1, "transparent");
  ctx.fillStyle = cyanRim;
  ctx.fillRect(0, 0, w, h);

  const magentaRim = ctx.createRadialGradient(cx + 180, cy, 20, cx + 180, cy, 250);
  magentaRim.addColorStop(0, "rgba(236, 72, 153, 0.45)");
  magentaRim.addColorStop(1, "transparent");
  ctx.fillStyle = magentaRim;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Expressive Silhouette Face & Prismatic Crown/Glasses
  ctx.save();
  const faceR = Math.min(w, h) * 0.18;

  // Head Contour
  ctx.fillStyle = "#1e1728";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy, faceR * 0.8, faceR * 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cyber Prismatic Visor / Sunglasses
  const visorGrad = ctx.createLinearGradient(cx - faceR * 0.7, cy - 20, cx + faceR * 0.7, cy + 20);
  visorGrad.addColorStop(0, "#38bdf8");
  visorGrad.addColorStop(0.5, "#ec4899");
  visorGrad.addColorStop(1, "#fbbf24");
  ctx.fillStyle = visorGrad;
  ctx.shadowColor = "#ec4899";
  ctx.shadowBlur = 25;

  ctx.beginPath();
  ctx.roundRect(cx - faceR * 0.65, cy - 25, faceR * 1.3, 48, 14);
  ctx.fill();

  // Specular Reflection Streak across Visor
  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - faceR * 0.45, cy + 10);
  ctx.lineTo(cx - faceR * 0.15, cy - 18);
  ctx.stroke();

  // High Collar / Fashion Silhouette Neck
  ctx.fillStyle = "#0d0914";
  ctx.beginPath();
  ctx.moveTo(cx - faceR * 0.45, cy + faceR * 0.8);
  ctx.lineTo(cx - faceR * 0.75, cy + faceR * 1.4);
  ctx.lineTo(cx + faceR * 0.75, cy + faceR * 1.4);
  ctx.lineTo(cx + faceR * 0.45, cy + faceR * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Typography
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = Math.min(Math.floor(w * 0.075), 66);
  ctx.font = `900 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#ec4899";
  ctx.shadowBlur = 15;
  ctx.fillText(title, cx, h * 0.72);

  ctx.font = "bold 15px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#f472b6";
  ctx.shadowBlur = 0;
  ctx.fillText((subtitle || "CINEMATIC FASHION PORTRAIT • 4K HIGH FIDELITY").toUpperCase(), cx, h * 0.80);
  ctx.restore();
}

/**
 * =======================================================================
 * UNIVERSAL PROCEDURAL ART ENGINE
 * Renders exquisite procedural visual art for ANY prompt input!
 * Extracts subject geometry, lighting, particle fields, volumetric glow,
 * and high-contrast editorial typography.
 * =======================================================================
 */
function drawUniversalProceduralArt(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string,
  subtitle?: string,
  _theme = "standard",
  pal: typeof PALETTES.emerald = PALETTES.emerald
) {
  const cx = w / 2;
  const cy = h * 0.42;

  // 1. Dynamic Atmosphere Gradient
  const bgGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, w * 0.85);
  bgGrad.addColorStop(0, pal.bg2 || "#101620");
  bgGrad.addColorStop(0.6, pal.bg1 || "#070b10");
  bgGrad.addColorStop(1, "#030406");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Volumetric Focal Spotlight
  ctx.save();
  const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.min(w, h) * 0.45);
  glow.addColorStop(0, "rgba(0, 212, 160, 0.3)");
  glow.addColorStop(0.5, "rgba(0, 184, 212, 0.1)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.min(w, h) * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Ambient Star / Specular Particle Cloud
  ctx.save();
  for (let i = 0; i < 50; i++) {
    const px = Math.random() * w;
    const py = Math.random() * (h * 0.78);
    const rad = Math.random() * 2.5 + 0.5;
    ctx.fillStyle = i % 2 === 0 ? pal.primary : "#ffffff";
    ctx.globalAlpha = Math.random() * 0.6 + 0.2;
    ctx.beginPath();
    ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 4. Central Procedural Geometric Focal Monolith
  ctx.save();
  const R = Math.min(w, h) * 0.2;

  // Outer Prismatic Ring
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 5;
  ctx.shadowColor = pal.primary;
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();

  // Inner Interlocking Sacred Triangles / Diamond Core
  const triGrad = ctx.createLinearGradient(cx - R * 0.7, cy - R * 0.7, cx + R * 0.7, cy + R * 0.7);
  triGrad.addColorStop(0, pal.primary);
  triGrad.addColorStop(0.5, pal.accent);
  triGrad.addColorStop(1, "#ffffff");
  ctx.fillStyle = triGrad;
  ctx.shadowColor = pal.accent;
  ctx.shadowBlur = 20;

  // Upright Triangle
  ctx.beginPath();
  ctx.moveTo(cx, cy - R * 0.75);
  ctx.lineTo(cx + R * 0.65, cy + R * 0.4);
  ctx.lineTo(cx - R * 0.65, cy + R * 0.4);
  ctx.closePath();
  ctx.fill();

  // Inverted Complementary Triangle Outline
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy + R * 0.75);
  ctx.lineTo(cx + R * 0.65, cy - R * 0.4);
  ctx.lineTo(cx - R * 0.65, cy - R * 0.4);
  ctx.closePath();
  ctx.stroke();

  // Glowing Stellar Heart Center
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fill();

  // Subtle Orbital Rings
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, R * 1.3, R * 0.5, Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy, R * 1.3, R * 0.5, -Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 5. Typography
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = Math.min(Math.floor(w * 0.072), 64);
  ctx.font = `900 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = pal.primary;
  ctx.shadowBlur = 18;
  ctx.fillText(title, cx, h * 0.72);

  ctx.font = "bold 15px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = pal.primary;
  ctx.shadowBlur = 0;
  ctx.fillText((subtitle || "UNIVERSAL CREATIVE ENGINE • 4K ULTRA RESOLUTION").toUpperCase(), cx, h * 0.80);

  // Bottom Authenticity Tag
  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - 160, h * 0.84, 320, 28);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("PREMIERS AI CREATIVE STUDIO • HIGH-PRECISION RENDER", cx, h * 0.84 + 14);
  ctx.restore();
}
