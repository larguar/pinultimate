// Compare one section between the live site (previous theme) and the development theme.
// Sections keep their template keys through the migration, so the same key finds both.
//
// Usage: node tools/visual/section.mjs --path / --key featured_collection_more_yjFJEm [--widths 375,1440]
//        [--view dev-hero]   (alternate template to render on the development theme only)
// Writes tools/visual/shots/sections/<page>--<key>@<width>.{old,new,diff}.png and prints the mismatch
// (<page> is the path + view, so comparing the same key on different pages doesn't overwrite).
import { chromium } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const STORE = 'https://pinultimate.myshopify.com';
const DEV_THEME = '166898532422';
const { values: args } = parseArgs({
  options: {
    path: { type: 'string', default: '/' },
    key: { type: 'string' },
    widths: { type: 'string', default: '375,768,1024,1440' },
    view: { type: 'string' },
  },
});
if (!args.key) throw new Error('--key is required (the section key from the template JSON)');

const FREEZE_CSS = `
  *, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }
  [data-aos] { opacity: 1 !important; transform: none !important; }
  #preview-bar-iframe, #PBarNextFrameWrapper { display: none !important; }
  .section-header { position: relative !important; }
`;
const outDir = new URL('./shots/sections/', import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });

async function shoot(browser, url, width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.addStyleTag({ content: FREEZE_CSS });
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
    for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);
  const el = page.locator(`[id$="__${args.key}"]`).first();
  const buffer = (await el.count()) ? await el.screenshot() : null;
  await page.close();
  return buffer;
}

const browser = await chromium.launch();
for (const width of args.widths.split(',').map(Number)) {
  const devUrl = new URL(args.path, STORE);
  devUrl.searchParams.set('preview_theme_id', DEV_THEME);
  devUrl.searchParams.set('pb', '0');
  if (args.view) devUrl.searchParams.set('view', args.view);

  const [oldShot, newShot] = await Promise.all([
    shoot(browser, new URL(args.path, STORE).href, width),
    shoot(browser, devUrl.href, width),
  ]);
  const page = `${args.path}${args.view ? `-${args.view}` : ''}`.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';
  const base = `${outDir}${page}--${args.key}@${width}`;
  if (!oldShot || !newShot) {
    console.log(`${width}: section not found on ${!oldShot ? 'live site' : 'dev theme'}`);
    continue;
  }
  writeFileSync(`${base}.old.png`, oldShot);
  writeFileSync(`${base}.new.png`, newShot);

  const a = PNG.sync.read(oldShot);
  const b = PNG.sync.read(newShot);
  const w = Math.min(a.width, b.width);
  const h = Math.min(a.height, b.height);
  const crop = (img) => {
    const out = new PNG({ width: w, height: h });
    PNG.bitblt(img, out, 0, 0, w, h, 0, 0);
    return out;
  };
  const diff = new PNG({ width: w, height: h });
  const mismatched = pixelmatch(crop(a).data, crop(b).data, diff.data, w, h, { threshold: 0.1 });
  writeFileSync(`${base}.diff.png`, PNG.sync.write(diff));
  console.log(
    `${width}: old ${a.width}x${a.height}, new ${b.width}x${b.height}, mismatch ${((mismatched / (w * h)) * 100).toFixed(2)}%  -> ${base}.{old,new,diff}.png`
  );
}
await browser.close();
