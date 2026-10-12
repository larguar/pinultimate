// Full-page screenshots of every URL in urls.json at each width.
// Usage: node tools/visual/capture.mjs --out <name> [--theme <id>] [--only <key,key>] [--widths 375,1440]
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { parseArgs } from 'node:util';

const STORE = 'https://pinultimate.myshopify.com';
const { values: args } = parseArgs({
  options: {
    out: { type: 'string' },
    theme: { type: 'string' },
    only: { type: 'string' },
    widths: { type: 'string', default: '375,768,1024,1440' },
  },
});
if (!args.out) throw new Error('--out is required');

const urls = JSON.parse(readFileSync(new URL('./urls.json', import.meta.url)));
const keys = args.only ? args.only.split(',') : Object.keys(urls);
const widths = args.widths.split(',').map(Number);
const outDir = new URL(`./shots/${args.out}/`, import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });

// Freeze motion so two captures of the same page are comparable.
const FREEZE_CSS = `
  *, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }
  [data-aos] { opacity: 1 !important; transform: none !important; }
  #preview-bar-iframe, #PBarNextFrameWrapper, #shopify-pc__banner { display: none !important; }
`;

function urlFor(path) {
  const url = new URL(path, STORE);
  if (args.theme) {
    url.searchParams.set('preview_theme_id', args.theme);
    url.searchParams.set('pb', '0');
  }
  return url.href;
}

async function capture(browser, key, width) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  try {
    await page.goto(urlFor(urls[key]), { waitUntil: 'load', timeout: 60000 });
    await page.addStyleTag({ content: FREEZE_CSS });
    // Scroll through the page so lazy-loaded images and sections render.
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
      for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 200));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.evaluate(() =>
      Promise.race([
        Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; }))),
        new Promise((r) => setTimeout(r, 10000)),
      ])
    );
    await page.waitForTimeout(500);
    // Clip to the viewport width so elements overflowing to the right don't widen the image.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.screenshot({ path: `${outDir}${key}@${width}.png`, fullPage: true, clip: { x: 0, y: 0, width, height } });
    console.log('ok  ', key, width);
  } catch (e) {
    console.log('FAIL', key, width, e.message.split('\n')[0]);
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch();
const jobs = keys.flatMap((k) => widths.map((w) => [k, w]));
const CONCURRENCY = 4;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (jobs.length) await capture(browser, ...jobs.shift());
  })
);
await browser.close();
