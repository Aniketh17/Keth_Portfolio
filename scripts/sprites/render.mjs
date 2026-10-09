/**
 * Renders Milo's phone sprite strips: public/sprites/<state>.webp, 8 frames each, 288px per frame.
 *
 * Needs the dev server running (npm run dev) plus two tools that are not project dependencies:
 *   npm i --no-save playwright sharp   (then: npx playwright install chromium)
 * Run:  node scripts/sprites/render.mjs [http://localhost:5173] [state ...]
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] ?? 'http://localhost:5173';
const FRAMES = 8;
const SIZE = 288;
const ALL = ['idle', 'walk', 'run', 'sit', 'happy'];
const STATES = process.argv.length > 3 ? process.argv.slice(3) : ALL;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });
page.on('pageerror', (e) => console.error('page error:', e.message));
await page.goto(`${base}/scripts/sprites/stage.html`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
await mkdir('public/sprites', { recursive: true });

for (const state of STATES) {
  const frames = [];
  for (let i = 0; i < FRAMES; i++) {
    const url = await page.evaluate(([s, f, n]) => window.capture(s, f, n), [state, i, FRAMES]);
    frames.push(Buffer.from(url.split(',')[1], 'base64'));
  }
  const strip = sharp({
    create: { width: SIZE * FRAMES, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite(frames.map((input, i) => ({ input, left: i * SIZE, top: 0 })));
  const out = `public/sprites/${state}.webp`;
  await strip.webp({ quality: 82, alphaQuality: 90, effort: 5 }).toFile(out);
  console.log('wrote', out);
}
await browser.close();
