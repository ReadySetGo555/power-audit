// Run once: node scripts/generate-icons.mjs
// Generates public/icons/icon-192.png, icon-512.png, icon-512-maskable.png, apple-touch-icon.png

import sharp from "sharp";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "../public/icons");

// Brand colours
const BG = "#0A0908";
const PURPLE = "#7C5CBF";
const PURPLE_LIGHT = "#9B7FD4";
const WHITE = "#FFFFFF";

function makeSvg(size, maskable = false) {
  // Maskable icons need 10% safe zone padding on all sides
  const pad = maskable ? size * 0.12 : 0;
  const inner = size - pad * 2;
  const cx = size / 2;
  const cy = size / 2;

  // Circle radius: 42% of inner area
  const r = (inner / 2) * 0.88;

  // Font size scales with circle radius
  const fontSize = r * 0.72;
  const letterSpacing = r * 0.04;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${PURPLE}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${BG}" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="circle" cx="40%" cy="35%" r="70%">
      <stop offset="0%" stop-color="${PURPLE_LIGHT}"/>
      <stop offset="100%" stop-color="${PURPLE}"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>

  <!-- Circle -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#circle)"/>

  <!-- PA monogram -->
  <text
    x="${cx}"
    y="${cy + fontSize * 0.35}"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="${fontSize}"
    font-weight="600"
    letter-spacing="${letterSpacing}"
    fill="${WHITE}"
  >PA</text>
</svg>`;
}

async function generate(svgStr, outPath, size) {
  const buf = Buffer.from(svgStr);
  await sharp(buf)
    .resize(size, size)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outPath);
  console.log(`✓ ${outPath.replace(join(__dirname, ".."), "")}`);
}

await generate(makeSvg(512, false), join(iconsDir, "icon-512.png"), 512);
await generate(makeSvg(512, true),  join(iconsDir, "icon-512-maskable.png"), 512);
await generate(makeSvg(192, false), join(iconsDir, "icon-192.png"), 192);
await generate(makeSvg(180, false), join(iconsDir, "apple-touch-icon.png"), 180);

console.log("\nDone. Update manifest.json to reference icon-512-maskable.png.");
