// Crop a region out of a screenshot so it can be inspected at full resolution.
// Usage: node tools/visual/crop.mjs <in.png> <out.png> <y> <height> [x] [width]
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';

const [input, output, y, height, x = 0, width] = process.argv.slice(2);
const src = PNG.sync.read(readFileSync(input));
const top = Number(y);
const left = Number(x);
const w = Math.min(Number(width ?? src.width - left), src.width - left);
const h = Math.min(Number(height), src.height - top);

const dst = new PNG({ width: w, height: h });
PNG.bitblt(src, dst, left, top, w, h, 0, 0);
writeFileSync(output, PNG.sync.write(dst));
