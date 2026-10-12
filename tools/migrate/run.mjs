// Rebuilds templates/*.json from the previous (Combine) theme's templates on `master`.
//
// Each old section type is converted by tools/migrate/sections/<old-type>.mjs, whose default
// export receives the old section and returns the new one (or null to drop it). Section keys,
// order and `disabled` flags are kept, so the merchant's content and arrangement carry over.
// Old section types without a mapping are skipped and listed at the end.
//
// Usage: node tools/migrate/run.mjs [--only templates/index.json,templates/product.json]
//
// Development mode, for checking a group of sections without touching the real templates:
//   node tools/migrate/run.mjs --dev hero --types shape,marquee
// writes templates/<type>.dev-hero[-<suffix>].json containing only those old section types,
// viewable at e.g. /?view=dev-hero or /collections/custom?view=dev-hero-custom.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseArgs } from 'node:util';

const SOURCE = 'master';
const { values: args } = parseArgs({
  options: { only: { type: 'string' }, dev: { type: 'string' }, types: { type: 'string' } },
});
const devTypes = args.types?.split(',');
if (args.dev && !devTypes) throw new Error('--dev needs --types');

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const readOld = (path) => JSON.parse(git('show', `${SOURCE}:${path}`).replace(/^\s*\/\*[\s\S]*?\*\//, ''));

const templates = git('ls-tree', '-r', '--name-only', SOURCE, 'templates')
  .split('\n')
  .filter((p) => p.endsWith('.json'))
  .filter((p) => !args.only || args.only.split(',').includes(p));

const mappings = new Map();
async function mappingFor(type) {
  if (!mappings.has(type)) {
    const file = new URL(`./sections/${type}.mjs`, import.meta.url);
    mappings.set(type, existsSync(file) ? (await import(file)).default : null);
  }
  return mappings.get(type);
}

const missing = new Map();
const written = [];
for (const path of templates) {
  const old = readOld(path);
  const out = { ...old, sections: {}, order: [] };

  for (const key of old.order) {
    const section = old.sections[key];
    if (devTypes && !devTypes.includes(section.type)) continue;
    const map = await mappingFor(section.type);
    if (!map) {
      missing.set(section.type, [...(missing.get(section.type) || []), path]);
      continue;
    }
    const converted = map(structuredClone(section), { key, template: path });
    if (!converted) continue;
    if (section.disabled) converted.disabled = true;
    out.sections[key] = converted;
    out.order.push(key);
  }

  let outPath = path;
  if (args.dev) {
    if (!out.order.length) continue;
    // templates/collection.custom.json -> templates/collection.dev-hero-custom.json
    const [, dir, type, suffix] = path.match(/^(.*\/)([^/.]+)(?:\.([^/]+))?\.json$/);
    outPath = `${dir}${type}.dev-${args.dev}${suffix ? `-${suffix}` : ''}.json`;
  }
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
  written.push(outPath);
}

console.log(`Wrote ${written.length} templates:\n  ${written.join('\n  ')}`);
if (missing.size) {
  console.log('\nOld section types without a mapping (skipped):');
  for (const [type, paths] of [...missing].sort()) console.log(`  ${type.padEnd(32)} ${[...new Set(paths)].join(', ')}`);
}
