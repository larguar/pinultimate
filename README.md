# Pinultimate theme

Shopify theme for [Pinultimate](https://pinultimate.co), built on Bootstrap 5.3 and Swiper.
It started from Shopify's Dawn 16 (see `LICENSE-dawn.md`) and replaces the previous
Combine theme, matching its design.

- Live theme: GitHub-connected to `master`. **Merging to `master` publishes.**
- Development theme: `166898532422` ("Bootstrap Conversion"). Preview:
  https://pinultimate.myshopify.com/?preview_theme_id=166898532422

## Setup

```sh
npm install
npm run build        # compile src/ into the theme folders
npm run push:dev     # build and push changed files to the development theme
```

Compiled files (`assets/theme.*`, `assets/section-*`, `locales/en.default.json`,
`snippets/icon.liquid`) are committed, because Shopify's GitHub integration deploys the
repository as-is. Always run `npm run build` before committing; never edit those files by hand.

## Layout of the repo

| Path | What it is |
| --- | --- |
| `src/scss/theme.scss` | Bootstrap (only the parts we use) + global styles → `assets/theme.css` |
| `src/scss/_config.scss` | Bootstrap variable overrides: brand colors, spacing scale, buttons |
| `src/scss/sections/<name>.scss` | One section's styles → `assets/section-<name>.css` |
| `src/js/theme.js` | Bootstrap JS (Collapse, Modal, Offcanvas), Swiper, global components → `assets/theme.js` |
| `src/js/sections/<name>.js` | One section's script → `assets/section-<name>.js` |
| `src/locales/<area>.json` | Storefront strings, merged into `locales/en.default.json` as `theme.<area>.*` |
| `src/icons.json`, `src/icons/` | Icons → `snippets/icon.liquid` |
| `tools/migrate/` | Converts the previous theme's templates (on `master`) into this theme's sections |
| `tools/visual/` | Screenshot and pixel-diff tools for comparing against the previous theme |

## Conventions

### Sections

Every section is wrapped `container-fluid` → `container` → `row` → `col`:

```liquid
{{ 'section-example.css' | asset_url | stylesheet_tag }}

<section class="example container-fluid px-0 {% render 'section-spacing' %}">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-12 col-lg-6">…</div>
    </div>
  </div>
</section>
```

- `container-fluid px-0` is the full-width band and carries the background
  (`bg-light`, `bg-primary`, …). Use `container-fluid` instead of `container` inside it
  for full-bleed content.
- Prefer Bootstrap classes for layout, spacing, type and color. Write CSS only for what
  utilities can't express, in the section's own `src/scss/sections/<name>.scss` (start it
  with `@import "section-base";` to get Bootstrap's variables and mixins).
- Vertical rhythm: `{% render 'section-spacing' %}` outputs the standard top margin
  (48 / 72 / 96 / 120px at xs / md / lg / xl). With a background, use padding:
  `{% render 'section-spacing', property: 'p', side: 'y' %}`. Sizes: `default`, `small`, `none`.
- Schemas use plain English labels (no `t:` keys). Give sections a `class` of
  `section-<name>` in the schema.
- Storefront text goes through `{{ 'theme.<area>.<key>' | t }}` with the strings in
  `src/locales/<area>.json`.

### Breakpoints and spacing

Bootstrap defaults: sm 576, md 768, lg 992, xl 1200, xxl 1400. `.container` is fluid with
15 / 30 / 40px side padding and a 1360px max width. The spacing scale adds `6` (72px),
`7` (96px) and `8` (120px) to Bootstrap's `0–5`.

### Colors

Theme settings → CSS custom properties → Bootstrap utilities, so `bg-primary`,
`text-yellow`, `text-bg-purple` etc. follow the colors set in the theme editor.
Brand colors: `primary` (dark green), `secondary`/`green`, `red`, `yellow`, `blue`,
`purple`, `light`, `dark`, `white`.

### Shared snippets

| Snippet | Use |
| --- | --- |
| `product-card` | Every product grid / carousel item |
| `product-badges` | Tag- and inventory-driven badges |
| `price` | Price with compare-at and "From" |
| `section-heading` | Script-font subheading + heading |
| `section-spacing` | Standard vertical spacing classes |
| `icon` | `{% render 'icon', name: 'cart' %}` |
| `quantity-stepper` | Minus / input / plus |

### JavaScript

- Carousels: `<swiper-slider data-options='{…Swiper options…}'>` (no section JS needed).
- Drawers, accordions, modals: Bootstrap data attributes (`data-bs-toggle="offcanvas"` …).
- Add to cart: a `<form action="{{ routes.cart_add_url }}" data-add-to-cart>`; the cart drawer
  opens and refreshes itself (`src/js/components/cart.js`).
- Section scripts are custom elements, so they re-initialise when the theme editor re-renders a
  section.
- Fade-up on scroll: add `data-reveal` to an element (`src/js/components/reveal.js`); it respects
  reduced motion and shows everything immediately in the theme editor.

## Migrating content from the previous theme

`node tools/migrate/run.mjs` rebuilds `templates/*.json` from `master`'s templates. Each old
section type has a mapping in `tools/migrate/sections/<old-type>.mjs` that converts its
settings and blocks. Keys and order are kept, so the merchant's content carries over.

## Comparing against the previous theme

```sh
node tools/visual/section.mjs --path / --key <section key>   # one section, live vs dev
node tools/visual/capture.mjs --out current --theme 166898532422
node tools/visual/compare.mjs                                  # whole pages vs the baseline
node tools/visual/states.mjs --out current --theme 166898532422 # drawers, sticky header
```
