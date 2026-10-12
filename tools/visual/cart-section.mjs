// Compare a cart page section between the live site and the development theme, with an
// item in the cart (the same product on both sides) or with an empty cart.
//
// Usage: node tools/visual/cart-section.mjs --key main [--item] [--handle tbc-boo]
//        [--path /cart] [--view dev-utility] [--widths 375,768,1024,1440]
// Writes tools/visual/shots/sections/cart-<key>[-item]@<width>.{old,new,diff}.png.
import { chromium } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const STORE = 'https://pinultimate.myshopify.com';
const DEV_THEME = '166898532422';
const { values: args } = parseArgs({
  options: {
    path: { type: 'string', default: '/cart' },
    key: { type: 'string' },
    item: { type: 'boolean', default: false },
    handle: { type: 'string', default: 'tbc-boo' },
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
  // A fresh context per shot, so each side has its own cart.
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  await page.goto(url.replace(/\/cart(?=[?#]|$)/, `/products/${args.handle}`), { waitUntil: 'load', timeout: 60000 });
  if (args.item) {
    await page.evaluate(async (handle) => {
      const product = await (await fetch(`/products/${handle}.js`)).json();
      const variant = product.variants.find((v) => v.available) || product.variants[0];
      await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: variant.id, quantity: 1 }] }),
      });
    }, args.handle);
  }
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
  await page.waitForTimeout(800);
  const el = page.locator(`[id$="__${args.key}"]`).first();
  const buffer = (await el.count()) ? await el.screenshot() : null;
  await context.close();
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
  const base = `${outDir}cart-${args.key}${args.item ? '-item' : ''}@${width}`;
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
