import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.join(process.cwd(), 'public');
const distDir = path.join(process.cwd(), 'dist');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Master SVG: The official PREMIERS AI brand mark
// Stylized 3D Dual-Ribbon 'P' Emblem with metallic silver-white upper loop and glowing cyan-teal lower fold
const premiersSvgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f5c4" />
      <stop offset="45%" stop-color="#00d4a0" />
      <stop offset="100%" stop-color="#0099b8" />
    </linearGradient>
    <linearGradient id="whiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="70%" stop-color="#f1f5f9" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>
    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00d4a0" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#00d4a0" stop-opacity="0" />
    </radialGradient>
    <filter id="ribbonShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.55" />
    </filter>
  </defs>

  <!-- Deep Obsidian Space Base -->
  <rect width="512" height="512" rx="112" fill="#0a0a0f" />
  
  <!-- Subtle Ambient Glow -->
  <circle cx="256" cy="256" r="220" fill="url(#glowGrad)" />

  <!-- PREMIERS Dual-Ribbon 3D 'P' Monogram -->
  <g filter="url(#ribbonShadow)" transform="translate(10, 0)">
    <!-- Lower / Inner Glowing Cyan-Teal Ribbon Fold -->
    <path d="M 180 370
             C 176 340, 185 270, 222 225
             C 250 190, 298 190, 320 190
             C 290 220, 252 235, 230 270
             C 214 295, 218 335, 180 370
             Z"
          fill="url(#tealGrad)" />

    <!-- Cyan Ribbon Accent Wing -->
    <path d="M 190 240
             C 230 180, 310 180, 340 190
             C 300 230, 240 240, 190 240
             Z"
          fill="#00f5c4" opacity="0.85" />

    <!-- Upper / Outer White Metallic Ribbon Loop -->
    <path d="M 195 130
             L 310 130
             C 380 130, 420 170, 420 230
             C 420 290, 380 330, 310 330
             L 245 330
             C 285 305, 335 295, 335 230
             C 335 180, 305 172, 260 172
             L 235 172
             Z"
          fill="url(#whiteGrad)" />
  </g>
</svg>`;

// Master Logo SVG with Full "PREMIERS AI" Typography
const premiersFullLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f5c4" />
      <stop offset="45%" stop-color="#00d4a0" />
      <stop offset="100%" stop-color="#0099b8" />
    </linearGradient>
    <linearGradient id="whiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="70%" stop-color="#f1f5f9" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>
    <radialGradient id="glowGrad" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#00d4a0" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#00d4a0" stop-opacity="0" />
    </radialGradient>
    <filter id="ribbonShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Deep Obsidian Base -->
  <rect width="512" height="512" fill="#0a0a0f" rx="96" />
  <circle cx="256" cy="210" r="180" fill="url(#glowGrad)" />

  <!-- 3D P Ribbon Emblem -->
  <g filter="url(#ribbonShadow)" transform="translate(18, -25)">
    <!-- Teal Ribbon -->
    <path d="M 180 340
             C 176 315, 185 255, 222 215
             C 250 185, 298 185, 320 185
             C 290 212, 252 225, 230 255
             C 214 278, 218 312, 180 340
             Z"
          fill="url(#tealGrad)" />

    <!-- White Ribbon -->
    <path d="M 195 130
             L 305 130
             C 370 130, 405 165, 405 220
             C 405 275, 370 310, 305 310
             L 245 310
             C 285 288, 325 278, 325 220
             C 325 172, 298 165, 255 165
             L 230 165
             Z"
          fill="url(#whiteGrad)" />
  </g>

  <!-- Typography: PREMIERS AI -->
  <g transform="translate(256, 420)">
    <text text-anchor="middle" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-weight="900" font-size="38" letter-spacing="4">
      <tspan fill="#ffffff">PREMIERS </tspan>
      <tspan fill="#00d4a0">AI</tspan>
    </text>
  </g>
</svg>`;

// Social OG Banner SVG (1200x630)
const premiersOgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#07070a" />
      <stop offset="50%" stop-color="#0a0a14" />
      <stop offset="100%" stop-color="#050508" />
    </linearGradient>
    <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f5c4" />
      <stop offset="45%" stop-color="#00d4a0" />
      <stop offset="100%" stop-color="#0099b8" />
    </linearGradient>
    <linearGradient id="whiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="70%" stop-color="#f1f5f9" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>
    <radialGradient id="centerGlow" cx="50%" cy="38%" r="45%">
      <stop offset="0%" stop-color="#00d4a0" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#00d4a0" stop-opacity="0" />
    </radialGradient>
    <filter id="ogShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6" />
    </filter>
  </defs>

  <!-- Deep Space Canvas -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />
  <rect width="1200" height="630" fill="url(#centerGlow)" />

  <!-- Subtle High-Tech Coordinate Grid -->
  <g stroke="rgba(0, 212, 160, 0.08)" stroke-width="1">
    <line x1="0" y1="105" x2="1200" y2="105" />
    <line x1="0" y1="210" x2="1200" y2="210" />
    <line x1="0" y1="315" x2="1200" y2="315" />
    <line x1="0" y1="420" x2="1200" y2="420" />
    <line x1="0" y1="525" x2="1200" y2="525" />
    <line x1="200" y1="0" x2="200" y2="630" />
    <line x1="400" y1="0" x2="400" y2="630" />
    <line x1="600" y1="0" x2="600" y2="630" />
    <line x1="800" y1="0" x2="800" y2="630" />
    <line x1="1000" y1="0" x2="1000" y2="630" />
  </g>

  <!-- Official PREMIERS AI 3D Ribbon Emblem -->
  <g filter="url(#ogShadow)" transform="translate(460, 60) scale(0.55)">
    <!-- Teal Ribbon -->
    <path d="M 180 370
             C 176 340, 185 270, 222 225
             C 250 190, 298 190, 320 190
             C 290 220, 252 235, 230 270
             C 214 295, 218 335, 180 370
             Z"
          fill="url(#tealGrad)" />

    <!-- White Ribbon -->
    <path d="M 195 130
             L 310 130
             C 380 130, 420 170, 420 230
             C 420 290, 380 330, 310 330
             L 245 330
             C 285 305, 335 295, 335 230
             C 335 180, 305 172, 260 172
             L 235 172
             Z"
          fill="url(#whiteGrad)" />
  </g>

  <!-- Brand Typography -->
  <text x="600" y="300" text-anchor="middle" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-weight="900" font-size="52" fill="#ffffff" letter-spacing="4">
    <tspan fill="#ffffff">PREMIERS </tspan>
    <tspan fill="#00d4a0">AI</tspan>
  </text>
  
  <text x="600" y="348" text-anchor="middle" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-weight="700" font-size="22" fill="#00d4a0" letter-spacing="2">INTELLIGENT AI ASSISTANT</text>

  <!-- Tagline / Value Proposition -->
  <text x="600" y="398" text-anchor="middle" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-weight="400" font-size="19" fill="#cbd5e1" letter-spacing="0.5">Conversations • Creative Design • AI Image Generation • Research • Web Intelligence • Productivity</text>

  <!-- Capability Badges -->
  <g transform="translate(160, 445)">
    <!-- Badge 1 -->
    <rect x="0" y="0" width="190" height="42" rx="21" fill="rgba(0, 212, 160, 0.12)" stroke="rgba(0, 212, 160, 0.3)" stroke-width="1.5" />
    <text x="95" y="27" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#00d4a0">Multilingual AI Chatbot</text>

    <!-- Badge 2 -->
    <rect x="220" y="0" width="200" height="42" rx="21" fill="rgba(0, 212, 160, 0.12)" stroke="rgba(0, 212, 160, 0.3)" stroke-width="1.5" />
    <text x="320" y="27" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#00d4a0">AI Image Creation &amp; Design</text>

    <!-- Badge 3 -->
    <rect x="450" y="0" width="200" height="42" rx="21" fill="rgba(0, 212, 160, 0.12)" stroke="rgba(0, 212, 160, 0.3)" stroke-width="1.5" />
    <text x="550" y="27" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#00d4a0">Real-Time Web Search</text>

    <!-- Badge 4 -->
    <rect x="680" y="0" width="200" height="42" rx="21" fill="rgba(0, 212, 160, 0.12)" stroke="rgba(0, 212, 160, 0.3)" stroke-width="1.5" />
    <text x="780" y="27" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#00d4a0">Code &amp; Productivity</text>
  </g>

  <!-- Canonical URL stamp -->
  <text x="600" y="555" text-anchor="middle" font-family="'Plus Jakarta Sans', monospace" font-weight="500" font-size="16" fill="#64748b">https://premiersaihomepage.ai.studio/</text>
</svg>`;

// Function to construct standard multi-size Windows .ico buffer with PNG images
function createIco(images: { width: number; height: number; buffer: Buffer }[]): Buffer {
  const count = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dataOffsetStart = headerSize + dirEntrySize * count;

  let totalSize = dataOffsetStart;
  for (const img of images) {
    totalSize += img.buffer.length;
  }

  const out = Buffer.alloc(totalSize);

  // ICONDIR header
  out.writeUInt16LE(0, 0); // reserved
  out.writeUInt16LE(1, 2); // type: 1 = icon
  out.writeUInt16LE(count, 4); // count

  let currentOffset = dataOffsetStart;
  for (let i = 0; i < count; i++) {
    const img = images[i];
    const entryOffset = headerSize + i * dirEntrySize;

    out.writeUInt8(img.width >= 256 ? 0 : img.width, entryOffset + 0);
    out.writeUInt8(img.height >= 256 ? 0 : img.height, entryOffset + 1);
    out.writeUInt8(0, entryOffset + 2); // color count (0 for 256+)
    out.writeUInt8(0, entryOffset + 3); // reserved
    out.writeUInt16LE(1, entryOffset + 4); // color planes
    out.writeUInt16LE(32, entryOffset + 6); // bits per pixel
    out.writeUInt32LE(img.buffer.length, entryOffset + 8); // size
    out.writeUInt32LE(currentOffset, entryOffset + 12); // offset

    img.buffer.copy(out, currentOffset);
    currentOffset += img.buffer.length;
  }

  return out;
}

// Utility to write to both public/ and dist/ (if dist exists)
function syncFile(filename: string, content: Buffer | string) {
  fs.writeFileSync(path.join(publicDir, filename), content);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, filename), content);
  }
}

async function generateAll() {
  console.log('Generating official PREMIERS AI brand favicons and SEO assets...');

  // 1. Write vector SVGs
  syncFile('favicon.svg', premiersSvgIcon);
  syncFile('logo.svg', premiersFullLogoSvg);
  syncFile('og-image.svg', premiersOgSvg);

  // Check if master image exists to extract exact emblem
  const masterImagePath = path.join(process.cwd(), 'src/assets/images/premiers_logo_1790356709606.jpg');
  let emblemBuffer: Buffer;
  let fullLogoBuffer: Buffer;

  if (fs.existsSync(masterImagePath)) {
    console.log('Found master image asset, extracting exact emblem...');
    // Crop the centered P emblem (560x560 centered at 512, 437)
    emblemBuffer = await sharp(masterImagePath)
      .extract({ left: 232, top: 157, width: 560, height: 560 })
      .png()
      .toBuffer();

    // Full 512x512 logo with text
    fullLogoBuffer = await sharp(masterImagePath)
      .resize(512, 512, { fit: 'contain', background: '#0a0a0f' })
      .png()
      .toBuffer();
  } else {
    console.log('Using SVG vector rendering for emblem...');
    emblemBuffer = await sharp(Buffer.from(premiersSvgIcon))
      .resize(512, 512)
      .png()
      .toBuffer();

    fullLogoBuffer = await sharp(Buffer.from(premiersFullLogoSvg))
      .resize(512, 512)
      .png()
      .toBuffer();
  }

  // Save full logo.png
  syncFile('logo.png', fullLogoBuffer);

  // 2. Generate multi-resolution PNG favicon icons
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon.png', size: 64 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-precomposed.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
  ];

  const icoBuffers: { width: number; height: number; buffer: Buffer }[] = [];

  for (const { name, size } of sizes) {
    const buffer = await sharp(emblemBuffer)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toBuffer();

    syncFile(name, buffer);
    console.log(`Generated ${name} (${size}x${size})`);

    if (size === 16 || size === 32 || size === 48) {
      icoBuffers.push({ width: size, height: size, buffer });
    }
  }

  // 3. Generate multi-resolution favicon.ico
  const icoData = createIco(icoBuffers);
  syncFile('favicon.ico', icoData);
  console.log(`Generated favicon.ico with 16x16, 32x32, 48x48 resolutions.`);

  // 4. Generate og-image.png (1200x630)
  const ogSvgBuffer = Buffer.from(premiersOgSvg);
  const ogPngBuffer = await sharp(ogSvgBuffer)
    .resize(1200, 630)
    .png()
    .toBuffer();
  syncFile('og-image.png', ogPngBuffer);
  console.log('Generated og-image.png (1200x630)');

  // 5. Generate site.webmanifest
  const manifest = {
    name: "PREMIERS AI — Intelligent AI Assistant",
    short_name: "PREMIERS AI",
    description: "PREMIERS AI is an intelligent AI assistant for conversations, creative design, image generation, research, web intelligence, productivity and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#00d4a0",
    icons: [
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png"
      },
      {
        src: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png"
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
  syncFile('site.webmanifest', JSON.stringify(manifest, null, 2));

  // 6. Generate production robots.txt
  const robotsTxt = `# PREMIERS AI — Official Search Engine Directives
# Canonical: https://premiersaihomepage.ai.studio/

User-agent: *
Allow: /
Allow: /favicon.ico
Allow: /favicon.png
Allow: /favicon-16x16.png
Allow: /favicon-32x32.png
Allow: /favicon-48x48.png
Allow: /apple-touch-icon.png
Allow: /apple-touch-icon-precomposed.png
Allow: /android-chrome-192x192.png
Allow: /android-chrome-512x512.png
Allow: /logo.png
Allow: /logo.svg
Allow: /og-image.png
Allow: /og-image.svg
Allow: /site.webmanifest
Allow: /sitemap.xml

# Protect authenticated and administrative API endpoints
Disallow: /api/admin/
Disallow: /api/auth/
Disallow: /api/payments/

Sitemap: https://premiersaihomepage.ai.studio/sitemap.xml
`;
  syncFile('robots.txt', robotsTxt);

  // 7. Generate production sitemap.xml
  const today = new Date().toISOString().split('T')[0];
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>https://premiersaihomepage.ai.studio/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://premiersaihomepage.ai.studio/#features</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://premiersaihomepage.ai.studio/#creative-studio</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://premiersaihomepage.ai.studio/#marketplace</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://premiersaihomepage.ai.studio/#pricing</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://premiersaihomepage.ai.studio/#about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://premiersaihomepage.ai.studio/#ceo</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
  syncFile('sitemap.xml', sitemapXml);

  console.log('All PREMIERS AI brand favicons, assets, and SEO files generated successfully!');
}

generateAll().catch(console.error);
