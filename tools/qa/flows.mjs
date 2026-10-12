// End-to-end checks of the storefront's interactive features on a theme (default: the dev theme).
// Each flow runs in a fresh browser context (its own empty cart) and reports pass/fail.
//
// Usage: node tools/qa/flows.mjs [--theme 166898532422] [--only cart-drawer,filters]
import { chromium } from 'playwright';
import { parseArgs } from 'node:util';

const STORE = 'https://pinultimate.myshopify.com';
const { values: args } = parseArgs({
  options: { theme: { type: 'string', default: '166898532422' }, only: { type: 'string' } },
});

const url = (path) => {
  const u = new URL(path, STORE);
  u.searchParams.set('preview_theme_id', args.theme);
  u.searchParams.set('pb', '0');
  return u.href;
};
const cartJs = (page) => page.evaluate(async () => (await fetch('/cart.js')).json());
// Adds one unit of a product that has at least 2 in stock; returns its handle.
async function addStockedProduct(page) {
  await page.goto(url('/'));
  return page.evaluate(async () => {
    const post = (u, body) => fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const { products } = await (await fetch('/collections/all/products.json?limit=60')).json();
    for (const p of products) {
      const v = p.variants.find((x) => x.available);
      if (!v) continue;
      if ((await post('/cart/add.js', { id: v.id, quantity: 2 })).ok) {
        await post('/cart/change.js', { line: 1, quantity: 1 });
        return p.handle;
      }
      await post('/cart/clear.js', {});
    }
  });
}

const expect = (condition, message) => {
  if (!condition) throw new Error(message);
};

const flows = {
  async 'search-drawer'(page) {
    await page.goto(url('/'));
    await page.locator('[aria-controls="search-drawer"]:visible').first().click();
    await page.locator('#search-drawer.show').waitFor();
    await page.locator('#search-drawer-input').fill('pin');
    await page.locator('#predictive-search-results a[href*="/products/"]').first().waitFor({ timeout: 10000 });
    const results = await page.locator('#predictive-search-results a[href*="/products/"]').count();
    expect(results > 0, 'no predictive product results');
    return `${results} product suggestions for "pin"`;
  },

  async 'mobile-menu'(page) {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(url('/'));
    await page.locator('[aria-controls="menu-drawer"]:visible').click();
    await page.locator('#menu-drawer.show').waitFor();
    const links = await page.locator('#menu-drawer nav a').allTextContents();
    expect(links.length >= 5, `only ${links.length} menu links`);
    return links.map((l) => l.trim()).join(', ');
  },

  async 'add-to-cart-and-drawer'(page) {
    await page.goto(url('/products/tbc-boo'));
    await page.locator('form[data-add-to-cart] [type="submit"]').first().click();
    await page.locator('#cart-drawer.show').waitFor();
    await page.waitForFunction(() => document.querySelector('[data-cart-count]')?.textContent.trim() === '1');
    let cart = await cartJs(page);
    expect(cart.item_count === 1, `cart has ${cart.item_count} items after add`);

    // tbc-boo has one in stock: + must show the store's message and keep the quantity at 1.
    await page.locator('#cart-drawer quantity-stepper button[name="plus"]').click();
    await page.locator('#cart-drawer .alert').waitFor({ timeout: 10000 });
    const message = (await page.locator('#cart-drawer .alert').textContent()).trim();
    cart = await cartJs(page);
    expect(cart.item_count === 1, `stock limit ignored (${cart.item_count} items)`);
    const total = (await page.locator('.cart-drawer__total').textContent()).trim();

    await page.locator('#cart-drawer textarea[data-cart-note]').fill('QA gift note');
    await page.waitForTimeout(1200);
    cart = await cartJs(page);
    expect(cart.note === 'QA gift note', `note not saved (${cart.note})`);

    await page.locator('#cart-drawer [data-cart-remove]').first().click();
    await page.waitForFunction(() => document.querySelector('[data-cart-count]')?.textContent.trim() === '0');
    cart = await cartJs(page);
    expect(cart.item_count === 0, 'remove left items in the cart');
    return `add → drawer (total ${total}), + over stock shows "${message}", gift note saved, remove → empty`;
  },

  async 'drawer-quantity'(page) {
    // A product that isn't limited to one in stock: + in the drawer goes to 2.
    const added = await addStockedProduct(page);
    expect(added, 'no product with at least 2 in stock found');
    await page.reload();
    await page.locator('[aria-controls="cart-drawer"]:visible').first().click();
    await page.locator('#cart-drawer.show').waitFor();
    await page.locator('#cart-drawer quantity-stepper button[name="plus"]').click();
    await page.waitForFunction(() => document.querySelector('[data-cart-count]')?.textContent.trim() === '2');
    const cart = await cartJs(page);
    expect(cart.item_count === 2, `cart has ${cart.item_count}`);
    return `${added}: + in the drawer → 2, header count updated`;
  },

  async 'variant-picker'(page) {
    // Find a product with several available variants.
    await page.goto(url('/'));
    const handle = await page.evaluate(async () => {
      const { products } = await (await fetch('/products.json?limit=250')).json();
      return products.find((p) => p.variants.filter((v) => v.available).length > 1)?.handle;
    });
    expect(handle, 'no product with several available variants found');
    await page.goto(url(`/products/${handle}`));
    const select = page.locator('main select').first();
    const options = await select.locator('option:not([disabled])').evaluateAll((o) => o.map((x) => x.value));
    expect(options.length > 1, 'variant select has fewer than 2 options');
    const before = page.url();
    await select.selectOption(options[1]);
    await page.waitForFunction((b) => location.href !== b && location.search.includes('variant='), before, { timeout: 10000 });
    const variantId = new URL(page.url()).searchParams.get('variant');
    const formId = await page.locator('form[data-add-to-cart] input[name="id"]').first().inputValue();
    expect(formId === variantId, `form id ${formId} doesn't match URL variant ${variantId}`);
    await page.locator('form[data-add-to-cart] [type="submit"]').first().click();
    await page.locator('#cart-drawer.show').waitFor();
    const cart = await cartJs(page);
    expect(String(cart.items[0]?.variant_id) === variantId, 'cart has a different variant');
    return `${handle}: chose "${options[1]}", URL + form + cart all variant ${variantId}`;
  },

  async 'cart-page'(page) {
    const handle = await addStockedProduct(page);
    expect(handle, 'no product with at least 2 in stock found');
    await page.goto(url('/cart'));
    await page.locator('main quantity-stepper button[name="plus"]').first().click();
    await page.waitForFunction(async () => (await (await fetch('/cart.js')).json()).item_count === 2, null, { timeout: 10000 });
    const checkout = await page.locator('main [name="checkout"]').count();
    expect(checkout > 0, 'no checkout button');
    await page.locator('main a[href*="/cart/change"], main [data-main-cart-remove], main button:has-text("Remove")').first().click();
    await page.waitForFunction(async () => (await (await fetch('/cart.js')).json()).item_count === 0, null, { timeout: 10000 });
    return `${handle}: + updates quantity, remove empties the cart, checkout button present`;
  },

  async 'collection-filters'(page) {
    await page.goto(url('/collections/amr'));
    const before = await page.locator('main .product-card').count();
    await page.locator('main input[type="checkbox"][name^="filter."]').first().check({ force: true });
    await page.waitForFunction(() => location.search.includes('filter.'), null, { timeout: 10000 });
    await page.waitForTimeout(1500);
    const after = await page.locator('main .product-card').count();
    expect(after > 0 && after <= before, `filter gave ${after} of ${before} products`);
    await page.locator('main select[name="sort_by"]').first().selectOption('price-descending');
    await page.waitForFunction(() => location.search.includes('sort_by=price-descending'), null, { timeout: 10000 });
    return `filter: ${before} → ${after} products, sort by price applied`;
  },

  async 'mobile-filters'(page) {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(url('/collections/amr'));
    await page.locator('main [data-bs-toggle="offcanvas"]:visible').first().click();
    await page.locator('main .offcanvas.show, main .offcanvas-md.show').first().waitFor();
    return 'filter and sort drawer opens';
  },

  async pagination(page) {
    await page.goto(url('/collections/wholesale'));
    const next = page.locator('main a[href*="page=2"]').first();
    expect(await next.count(), 'no link to page 2');
    await next.click();
    await page.waitForURL(/page=2/);
    const cards = await page.locator('main .product-card').count();
    expect(cards > 0, 'page 2 is empty');
    return `page 2 shows ${cards} products`;
  },

  async 'search-page'(page) {
    await page.goto(url('/search?q=pin'));
    const cards = await page.locator('main .product-card').count();
    expect(cards > 0, 'no results');
    return `${cards} results for "pin"`;
  },

  async 'products-set'(page) {
    await page.goto(url('/collections/custom'));
    const button = page.locator('products-set [data-set-submit]').first();
    expect(await button.count(), 'set button missing');
    expect(await button.isDisabled(), 'button enabled before choosing products');
    return `set picker renders, button disabled until products are chosen ("${(await button.textContent()).trim()}")`;
  },

  async 'contact-form'(page) {
    await page.goto(url('/pages/contact'));
    for (const name of ['contact[email]', 'contact[body]']) {
      expect(await page.locator(`form[action*="/contact"] [name="${name}"]`).count(), `${name} missing`);
    }
    return 'contact form fields present (not submitted)';
  },

  async 'klaviyo-footer-form'(page) {
    await page.goto(url('/'));
    await page.locator('.site-footer__signup-form input[type="email"]').waitFor({ timeout: 15000 });
    return 'Klaviyo signup form renders in the footer';
  },

  async 'reviews-widget'(page) {
    await page.goto(url('/products/tbc-boo'));
    await page.waitForFunction(() => /Customer Reviews|Based on/i.test(document.body.innerText), null, { timeout: 15000 });
    return 'Growave reviews render on the product page';
  },

  async localization(page) {
    await page.goto(url('/'));
    await page.locator('.announcement-bar .localization-dropdown summary').click();
    const countries = await page.locator('.announcement-bar .localization-dropdown button[name="country_code"]').count();
    expect(countries > 1, 'no countries listed');
    return `${countries} countries listed`;
  },
};

const browser = await chromium.launch();
const selected = args.only ? args.only.split(',') : Object.keys(flows);
let failures = 0;
for (const name of selected) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    const detail = await flows[name](page);
    console.log(`✓ ${name}: ${detail}${errors.length ? `  (JS errors: ${errors.join('; ')})` : ''}`);
    if (errors.length) failures++;
  } catch (e) {
    failures++;
    console.log(`✗ ${name}: ${e.message.split('\n')[0]}`);
  } finally {
    await context.close();
  }
}
await browser.close();
console.log(failures ? `\n${failures} flow(s) failed` : '\nAll flows passed');
process.exitCode = failures ? 1 : 0;
