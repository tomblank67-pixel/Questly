/**
 * Generates the PNG app icons from Funke.
 *   1. vite-node renders the React component to SVG (scripts/render-icon.tsx)
 *   2. Playwright/Chromium rasterises the SVGs to PNG
 * The PNGs are committed, so this only needs to run when the icon changes.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// Use a local playwright if installed, otherwise a globally installed one.
async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    const root = execSync('npm root -g').toString().trim();
    return createRequire(`${root}/`)('playwright');
  }
}
const { chromium } = await loadPlaywright();

execSync('npx vite-node scripts/render-icon.tsx', { stdio: 'inherit' });

const targets = [
  ['icon.svg', 'icon-192.png', 192],
  ['icon.svg', 'icon-512.png', 512],
  ['icon.svg', 'apple-touch-icon.png', 180],
  ['icon-maskable.svg', 'icon-maskable-512.png', 512],
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [src, out, size] of targets) {
  const svg = readFileSync(`public/icons/${src}`, 'utf8');
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><body style="margin:0">${svg.replace('width="512" height="512"', `width="${size}" height="${size}"`)}</body></html>`,
  );
  await page.screenshot({ path: `public/icons/${out}`, clip: { x: 0, y: 0, width: size, height: size } });
  console.log('wrote', out);
}
await browser.close();
