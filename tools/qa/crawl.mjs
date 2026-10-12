// Load every page in the store's sitemap on the live theme and the development theme, then
// report pages where the development theme has errors or shows different content.
//
// Per page it checks (dev): JavaScript errors, Liquid errors, theme assets that fail to load,
// and an empty <main>. It compares with live: HTTP status, the main heading, the number of
// product cards and the product price.
//
// Usage: node tools/qa/crawl.mjs [--theme 166898532422] [--limit 50] [--concurrency 6]
import { chromium } from 'playwright';
import { parseArgs } from 'node:util';

const STORE = 'https://pinultimate.myshopify.com';
const { values: args } = parseArgs({
  options: {
    theme: { type: 'string', default: '166898532422' },
    limit: { type: 'string' },
    concurrency: { type: 'string', default: '6' },
  },
});

async function sitemapUrls() {
  const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replaceAll('&amp;', '&'));
  const index = await (await fetch(`${STORE}/sitemap.xml`)).text();
  const urls = [];
  for (const sitemap of locs(index).filter((u) => !u.includes('agentic'))) {
    urls.push(...locs(await (await fetch(sitemap)).text()).filter((u) => !/\.(jpe?g|png|webp|gif)/i.test(u)));
  }
  return [...new Set(urls.map((u) => new URL(u).pathname))];
}

// Runs in the page: what the visitor sees, in theme-independent terms.
function snapshot() {
  const visible = (el) => el && el.getBoundingClientRect().height > 0;
  const text = (el) => el?.textContent.replace(/\s+/g, ' ').trim() || '';
  const h1 = [...document.querySelectorAll('main h1, #main h1')].find(visible);
  const cards = [...document.querySelectorAll('.product-card, .product-item')].filter(visible).length;
  const price = text(document.querySelector('.main-product__price .price__current, .product-price--original, .main-product-price .product-price'));
  const main = document.querySelector('main, #main');
  return {
    h1: text(h1),
    cards,
    price: price.match(/\$[\d,.]+/)?.[0] || '',
    mainEmpty: !main || main.getBoundingClientRect().height < 50,
    liquidErrors: (document.body.innerText.match(/Liquid (syntax )?error[^\n]*/gi) || []).slice(0, 3),
  };
}

async function visit(browser, path, dev) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  if (dev) {
    page.on('pageerror', (e) => errors.push(`JS: ${e.message.slice(0, 120)}`));
    page.on('response', (r) => {
      if (r.status() >= 400 && /\/cdn\/shop\/t\/\d+\/assets\//.test(r.url())) errors.push(`${r.status()} ${r.url().split('/assets/')[1]}`);
    });
  }
  const url = new URL(path, STORE);
  if (dev) {
    url.searchParams.set('preview_theme_id', args.theme);
    url.searchParams.set('pb', '0');
  }
  let status = 0;
  try {
    const response = await page.goto(url.href, { waitUntil: 'load', timeout: 60000 });
    status = response?.status() ?? 0;
    await page.waitForTimeout(1200);
    const snap = await page.evaluate(snapshot);
    return { status, errors, ...snap };
  } catch (e) {
    return { status, errors: [...errors, `load failed: ${e.message.split('\n')[0]}`], h1: '', cards: 0, price: '', mainEmpty: true, liquidErrors: [] };
  } finally {
    await page.close();
  }
}

let paths = await sitemapUrls();
paths = ['/', '/cart', '/search?q=pin', '/collections', '/pages/does-not-exist', ...paths.filter((p) => p !== '/')];
if (args.limit) paths = paths.slice(0, Number(args.limit));
console.log(`Checking ${paths.length} pages…`);

const browser = await chromium.launch();
const problems = [];
let done = 0;
const queue = [...paths];
await Promise.all(
  Array.from({ length: Number(args.concurrency) }, async () => {
    while (queue.length) {
      const path = queue.shift();
      const [live, dev] = await Promise.all([visit(browser, path, false), visit(browser, path, true)]);
      const issues = [...dev.errors, ...dev.liquidErrors.map((e) => `Liquid: ${e}`)];
      if (live.status !== dev.status) issues.push(`status live ${live.status} / dev ${dev.status}`);
      if (dev.mainEmpty && !live.mainEmpty) issues.push('main content empty');
      // The homepage hero title is an h2 on purpose (the logo is the homepage's h1).
      if (path !== '/' && live.h1 !== dev.h1) issues.push(`heading live "${live.h1}" / dev "${dev.h1}"`);
      if (live.cards !== dev.cards) issues.push(`product cards live ${live.cards} / dev ${dev.cards}`);
      if (path.startsWith('/products/') && live.price !== dev.price) issues.push(`price live "${live.price}" / dev "${dev.price}"`);
      if (issues.length) problems.push({ path, issues });
      if (++done % 25 === 0) console.log(`  ${done}/${paths.length}`);
    }
  })
);
await browser.close();

console.log(`\n${paths.length} pages checked, ${problems.length} with differences or errors.`);
for (const { path, issues } of problems.sort((a, b) => a.path.localeCompare(b.path))) {
  console.log(`${path}\n  ${issues.join('\n  ')}`);
}
