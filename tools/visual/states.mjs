// Viewport screenshots of interactive states: open drawers, sticky header.
// Usage: node tools/visual/states.mjs --out <name> [--theme <id>] [--legacy]
// --legacy uses the previous theme's drawer ids (to capture the baseline from the live site).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { parseArgs } from 'node:util';

const STORE = 'https://pinultimate.myshopify.com';
const { values: args } = parseArgs({
  options: {
    out: { type: 'string' },
    theme: { type: 'string' },
    legacy: { type: 'boolean', default: false },
  },
});
if (!args.out) throw new Error('--out is required');

const DRAWERS = args.legacy
  ? { search: 'site-search-sidebar', menu: 'site-menu-sidebar', cart: 'site-cart-sidebar' }
  : { search: 'search-drawer', menu: 'menu-drawer', cart: 'cart-drawer' };

const STATES = [
  { name: 'search', widths: [375, 1440], open: 'search' },
  { name: 'menu', widths: [375, 768], open: 'menu' },
  { name: 'cart-empty', widths: [375, 1440], open: 'cart' },
  { name: 'cart-item', widths: [375, 1440], open: 'cart', addToCart: '/products/tbc-boo' },
  { name: 'sticky-header', widths: [375, 1440], scroll: 1500 },
];

const FREEZE_CSS = `
  *, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; caret-color: transparent !important; }
  #preview-bar-iframe, #PBarNextFrameWrapper { display: none !important; }
`;

const outDir = new URL(`./shots/${args.out}/`, import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });

function urlFor(path) {
  const url = new URL(path, STORE);
  if (args.theme) {
    url.searchParams.set('preview_theme_id', args.theme);
    url.searchParams.set('pb', '0');
  }
  return url.href;
}

const browser = await chromium.launch();
for (const state of STATES) {
  for (const width of state.widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(urlFor('/'), { waitUntil: 'load' });
      if (state.addToCart) {
        await page.evaluate(async (handle) => {
          const product = await (await fetch(`${handle}.js`)).json();
          const variant = product.variants.find((v) => v.available) || product.variants[0];
          await fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: [{ id: variant.id, quantity: 1 }] }),
          });
        }, state.addToCart);
        await page.reload({ waitUntil: 'load' });
      }
      await page.addStyleTag({ content: FREEZE_CSS });
      if (state.open) {
        const trigger = page.locator(`[aria-controls="${DRAWERS[state.open]}"]:visible`).first();
        await trigger.click();
        await page.waitForTimeout(1200);
      }
      if (state.scroll) {
        await page.mouse.wheel(0, state.scroll);
        await page.waitForTimeout(1200);
      }
      await page.screenshot({ path: `${outDir}state-${state.name}@${width}.png` });
      console.log('ok  ', state.name, width);
    } catch (e) {
      console.log('FAIL', state.name, width, e.message.split('\n')[0]);
    } finally {
      await context.close();
    }
  }
}
await browser.close();
