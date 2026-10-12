// Load every URL in urls.json on a theme and report JavaScript errors and failed theme requests.
// Usage: node tools/visual/errors.mjs [--theme 166898532422] [--widths 375,1440]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
  options: { theme: { type: 'string', default: '166898532422' }, widths: { type: 'string', default: '375,1440' } },
});
const urls = JSON.parse(readFileSync(new URL('./urls.json', import.meta.url)));
const browser = await chromium.launch();
let problems = 0;

for (const width of args.widths.split(',').map(Number)) {
  for (const [key, path] of Object.entries(urls)) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const issues = [];
    page.on('pageerror', (e) => issues.push(`JS error: ${e.message}`));
    page.on('response', (r) => {
      // Theme assets that fail to load (missing section CSS/JS, bad asset names).
      if (r.status() >= 400 && /\/cdn\/shop\/t\/|\/assets\//.test(r.url())) issues.push(`${r.status()} ${r.url()}`);
    });
    const url = new URL(path, 'https://pinultimate.myshopify.com');
    url.searchParams.set('preview_theme_id', args.theme);
    url.searchParams.set('pb', '0');
    await page.goto(url.href, { waitUntil: 'load', timeout: 60000 }).catch((e) => issues.push(e.message));
    await page.waitForTimeout(1500);
    const liquidErrors = await page.evaluate(() => (document.body.innerText.match(/Liquid (syntax )?error[^\n]*/gi) || []));
    issues.push(...liquidErrors.map((e) => `Liquid: ${e}`));
    if (issues.length) {
      problems += issues.length;
      console.log(`${key}@${width}\n  ${[...new Set(issues)].join('\n  ')}`);
    }
    await page.close();
  }
}
await browser.close();
console.log(problems ? `${problems} problem(s)` : 'No errors');
