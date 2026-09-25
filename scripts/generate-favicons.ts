import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Master SVG: The official PREMIERS AI brand mark
// Beautiful squircle with emerald (#00d4a0) to cyan (#00b8d4) gradient and crisp white 'P' emblem
const premiersSvgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="premiersGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00e6a8" />
      <stop offset="50%" stop-color="#00d4a0" />
      <stop offset="100%" stop-color="#00b4d8" />
    </linearGradient>
    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00d4a0" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#00d4a0" stop-opacity="0" />
    </radialGradient>
    <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Background Base Container -->
  <rect width="512" height="512" rx="112" fill="#0a0a0f" />
  
  <!-- Subtle Outer Brand Glow -->
  <rect x="16" y="16" width="480" height="480" rx="100" fill="url(#glowGrad)" />

  <!-- Vibrant Emerald-Cyan Squircle Brand Emblem -->
  <rect x="36" y="36" width="440" height="440" rx="96" fill="url(#premiersGrad)" filter="url(#subtleShadow)" />

  <!-- Inner High-Tech Highlight Ring -->
  <rect x="42" y="42" width="428" height="428" rx="90" fill="none" stroke="rgba(255, 255, 255, 0.3)" stroke-width="4" />

  <!-- Precision Cutout Brand Mark: The PREMIERS 'P' Monogram -->
  <g fill="#ffffff" filter="url(#subtleShadow)">
    <!-- Main Vertical Stem with angled lower bevel -->
    <path d="M 148 116 
             L 268 116 
             C 328 116, 368 152, 368 212 
             C 368 272, 328 308, 268 308 
             L 218 308 
             L 218 396 
             L 148 396 
             Z 
             M 218 176 
             L 218 248 
             L 262 248 
             C 292 248, 308 232, 308 212 
             C 308 192, 292 176, 262 176 
             Z" />
    <!-- Modern Tech Accent Notch / Cyber Spark -->
    <circle cx="344" cy="360" r="18" fill="#ffffff" opacity="0.95" />
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
    <linearGradient id="premiersGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00e6a8" />
      <stop offset="50%" stop-color="#00d4a0" />
      <stop offset="100%" stop-color="#00b4d8" />
    </linearGradient>
    <radialGradient id="centerGlow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#00d4a0" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#00d4a0" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Deep Obsidian Space Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />
  <rect width="1200" height="630" fill="url(#centerGlow)" />

  <!-- Subtle Tech Grid Lines -->
  <g stroke="rgba(0, 212, 160, 0.07)" stroke-width="1">
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

  <!-- Center Logo Emblem (Squircle) -->
  <g transform="translate(536, 90)">
    <rect width="128" height="128" rx="28" fill="url(#premiersGrad)" />
    <rect x="2" y="2" width="124" height="124" rx="26" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
    <path d="M 42 32 L 74 32 C 90 32, 100 42, 100 58 C 100 74, 90 84, 74 84 L 60 84 L 60 100 L 42 100 Z M 60 48 L 60 68 L 72 68 C 80 68, 84 64, 84 58 C 84 52, 80 48, 72 48 Z" fill="#ffffff" />
    <circle cx="94" cy="94" r="5" fill="#ffffff" />
  </g>

  <!-- Brand Typography -->
  <text x="600" y="278" text-anchor="middle" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-weight="900" font-size="52" fill="#ffffff" letter-spacing="3">PREMIERS AI</text>
  
  <text x="600" y="325" text-anchor="middle" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-weight="700" font-size="22" fill="#00d4a0" letter-spacing="2">INTELLIGENT AI ASSISTANT</text>

  <!-- Tagline / Value Proposition -->
  <text x="600" y="380" text-anchor="middle" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-weight="400" font-size="20" fill="#94a3b8" letter-spacing="0.5">Conversations • Creative Design • AI Image Generation • Research • Web Intelligence</text>

  <!-- Capability Badges -->
  <g transform="translate(190, 435)">
    <!-- Badge 1 -->
    <rect x="0" y="0" width="180" height="42" rx="21" fill="rgba(0, 212, 160, 0.12)" stroke="rgba(0, 212, 160, 0.3)" stroke-width="1.5" />
    <text x="90" y="27" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#00d4a0">Multilingual Chat</text>

    <!-- Badge 2 -->
    <rect x="210" y="0" width="190" height="42" rx="21" fill="rgba(0, 212, 160, 0.12)" stroke="rgba(0, 212, 160, 0.3)" stroke-width="1.5" />
    <text x="305" y="27" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#00d4a0">AI Creative Studio</text>

    <!-- Badge 3 -->
    <rect x="430" y="0" width="180" height="42" rx="21" fill="rgba(0, 212, 160, 0.12)" stroke="rgba(0, 212, 160, 0.3)" stroke-width="1.5" />
    <text x="520" y="27" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#00d4a0">Live Web Grounding</text>

    <!-- Badge 4 -->
    <rect x="640" y="0" width="180" height="42" rx="21" fill="rgba(0, 212, 160, 0.12)" stroke="rgba(0, 212, 160, 0.3)" stroke-width="1.5" />
    <text x="730" y="27" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#00d4a0">Code &amp; Prototyping</text>
  </g>

  <!-- Canonical URL stamp -->
  <text x="600" y="550" text-anchor="middle" font-family="'Plus Jakarta Sans', monospace" font-weight="500" font-size="16" fill="#64748b">https://premiersaihomepage.ai.studio/</text>
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

async function generateAll() {
  console.log('Generating PREMIERS AI brand favicon and SEO assets...');

  // 1. Write SVG masters
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), premiersSvgIcon, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), premiersSvgIcon, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'og-image.svg'), premiersOgSvg, 'utf8');

  const svgBuffer = Buffer.from(premiersSvgIcon);
  const ogSvgBuffer = Buffer.from(premiersOgSvg);

  // 2. Generate PNG sizes
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
    const buffer = await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(publicDir, name), buffer);
    console.log(`Generated public/${name} (${size}x${size})`);

    if (size === 16 || size === 32 || size === 48) {
      icoBuffers.push({ width: size, height: size, buffer });
    }
  }

  // 3. Generate multi-resolution favicon.ico
  const icoData = createIco(icoBuffers);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoData);
  console.log(`Generated public/favicon.ico (${icoBuffers.length} resolutions: 16x16, 32x32, 48x48)`);

  // 4. Generate og-image.png (1200x630)
  const ogPngBuffer = await sharp(ogSvgBuffer)
    .resize(1200, 630)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogPngBuffer);
  console.log('Generated public/og-image.png (1200x630)');

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
  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Generated public/site.webmanifest');

  // 6. Generate production robots.txt
  const robotsTxt = `# PREMIERS AI — Production Search Engine Directives
# https://premiersaihomepage.ai.studio/

User-agent: *
Allow: /
Allow: /favicon.ico
Allow: /favicon.png
Allow: /favicon-32x32.png
Allow: /favicon-48x48.png
Allow: /apple-touch-icon.png
Allow: /android-chrome-192x192.png
Allow: /android-chrome-512x512.png
Allow: /og-image.png
Allow: /site.webmanifest
Allow: /sitemap.xml

# Protect authenticated/administrative/private endpoints
Disallow: /api/admin/
Disallow: /api/auth/
Disallow: /api/payments/

Sitemap: https://premiersaihomepage.ai.studio/sitemap.xml
`;
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');
  console.log('Generated public/robots.txt');

  // 7. Generate production sitemap.xml
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>https://premiersaihomepage.ai.studio/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://premiersaihomepage.ai.studio/#features</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://premiersaihomepage.ai.studio/#creative-studio</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://premiersaihomepage.ai.studio/#marketplace</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://premiersaihomepage.ai.studio/#pricing</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://premiersaihomepage.ai.studio/#about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://premiersaihomepage.ai.studio/#ceo</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log('Generated public/sitemap.xml');

  console.log('All PREMIERS AI brand & SEO assets generated successfully!');
}

generateAll().catch(console.error);
