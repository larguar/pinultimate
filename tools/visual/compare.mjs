// Pixel-diff two screenshot sets and report the mismatch per page.
// Usage: node tools/visual/compare.mjs [--base baseline] [--target current] [--only home,cart]
// Writes red-highlighted diff images to tools/visual/diff/. Pages of different heights are
// compared over their shared height; the height difference is reported separately.
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
  options: {
    base: { type: 'string', default: 'baseline' },
    target: { type: 'string', default: 'current' },
    only: { type: 'string' },
  },
});

const shots = new URL('./shots/', import.meta.url).pathname;
const diffDir = new URL('./diff/', import.meta.url).pathname;
mkdirSync(diffDir, { recursive: true });

const only = args.only?.split(',');
const files = readdirSync(`${shots}${args.target}`)
  .filter((f) => f.endsWith('.png') && existsSync(`${shots}${args.base}/${f}`))
  .filter((f) => !only || only.some((key) => f.startsWith(`${key}@`) || f.startsWith(`state-${key}@`)))
  .sort();

const rows = [];
for (const file of files) {
  const a = PNG.sync.read(readFileSync(`${shots}${args.base}/${file}`));
  const b = PNG.sync.read(readFileSync(`${shots}${args.target}/${file}`));
  const width = Math.min(a.width, b.width);
  const height = Math.min(a.height, b.height);

  const crop = (img) => {
    const out = new PNG({ width, height });
    PNG.bitblt(img, out, 0, 0, width, height, 0, 0);
    return out;
  };
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(crop(a).data, crop(b).data, diff.data, width, height, { threshold: 0.1 });
  writeFileSync(`${diffDir}${file}`, PNG.sync.write(diff));

  rows.push({
    page: file.replace('.png', ''),
    mismatch: `${((mismatched / (width * height)) * 100).toFixed(2)}%`,
    heightDelta: b.height - a.height,
  });
}
console.table(rows);
