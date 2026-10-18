/**
 * Captures the demo screens (src/mock) step by step and packs them into one texture atlas per demo:
 * public/mock/<demo>.webp, 3 columns x 4 rows of 1280x800 frames (3840x3200, within the 4096px limit phones allow).
 *
 * Needs the dev server (npm run dev) and, outside the project: npm i --no-save playwright sharp
 * Run:  node scripts/mocks/render.mjs [http://localhost:5173] [transactions|fit]
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] ?? 'http://localhost:5173';
const only = process.argv[3];
const W = 1280;
const H = 800;
const COLS = 3;
const ROWS = 4;
const DEMOS = { transactions: 'transactions', fit: 'fit' };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await mkdir('public/mock', { recursive: true });
for (const demo of Object.keys(DEMOS).filter((d) => !only || d === only)) {
  const frames = [];
  for (let step = 0; step < COLS * ROWS; step++) {
    await page.goto(`${base}/mock.html?demo=${demo}&step=${step}`);
    await page.waitForSelector('body[data-ready="1"]');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    frames.push(await page.screenshot());
  }
  await sharp({ create: { width: W * COLS, height: H * ROWS, channels: 3, background: '#ffffff' } })
    .composite(frames.map((input, i) => ({ input, left: (i % COLS) * W, top: Math.floor(i / COLS) * H })))
    .webp({ quality: 84, effort: 5 })
    .toFile(`public/mock/${demo}.webp`);
  console.log('wrote', `public/mock/${demo}.webp`);
}
await browser.close();
