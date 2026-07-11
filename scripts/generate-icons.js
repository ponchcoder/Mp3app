#!/usr/bin/env node
/**
 * Generate PWA icons for Whisper Melody
 * Creates soft pink heart-themed icons in 192x192 and 512x512
 */

const fs = require("fs");
const path = require("path");

const iconsDir = path.join(__dirname, "..", "public", "icons");
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

function createSVG(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFF0F5"/>
      <stop offset="50%" style="stop-color:#FFE4EC"/>
      <stop offset="100%" style="stop-color:#F5E6FF"/>
    </linearGradient>
    <linearGradient id="heart" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF8FB3"/>
      <stop offset="100%" style="stop-color:#FF6B9D"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
  <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-size="${size * 0.4}" fill="url(#heart)">♪</text>
  <circle cx="${size * 0.75}" cy="${size * 0.25}" r="${size * 0.04}" fill="#FBBF24" opacity="0.8"/>
  <circle cx="${size * 0.2}" cy="${size * 0.7}" r="${size * 0.03}" fill="#B8A9E8" opacity="0.6"/>
  <circle cx="${size * 0.85}" cy="${size * 0.65}" r="${size * 0.025}" fill="#FFD700" opacity="0.5"/>
</svg>`;
}

// Write SVG icons (browsers that support SVG icons)
fs.writeFileSync(path.join(iconsDir, "icon.svg"), createSVG(512));

// For PNG, write SVG with proper filenames - Next.js and PWAs can use SVG on modern browsers
// Create HTML canvas-based PNG using a data URL approach
const sizes = [192, 512];
for (const size of sizes) {
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.svg`), createSVG(size));
}

console.log("Icons generated in public/icons/");
console.log("Note: For iOS PWA install, convert SVGs to PNGs using any image tool.");
