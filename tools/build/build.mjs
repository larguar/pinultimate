// Theme build. Compiles everything in src/ into the theme folders:
//
//   src/scss/theme.scss          -> assets/theme.css          (Bootstrap + global styles)
//   src/scss/sections/<name>.scss -> assets/section-<name>.css (loaded by that section)
//   src/js/theme.js              -> assets/theme.js           (Bootstrap JS, Swiper, global components)
//   src/js/sections/<name>.js    -> assets/section-<name>.js  (loaded by that section)
//   src/locales/_base.json + src/locales/<area>.json -> locales/en.default.json ("theme.<area>.*")
//   src/icons.json + src/icons/*.svg                -> snippets/icon.liquid
//
// A section file that fails to compile is reported and skipped; the rest still build.
// Usage: node tools/build/build.mjs [--only css|js|locales|icons]
import * as sass from 'sass';
import * as esbuild from 'esbuild';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import './icons.mjs';

const { values: args } = parseArgs({ options: { only: { type: 'string' } } });
const run = (step) => !args.only || args.only === step;
let failed = false;

const SASS_OPTIONS = {
  loadPaths: ['node_modules', 'src/scss'],
  style: 'compressed',
  quietDeps: true,
  silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
};

const sectionFiles = (dir, ext) =>
  readdirSync(dir)
    .filter((f) => f.endsWith(ext) && !f.startsWith('_'))
    .map((f) => f.slice(0, -ext.length));

if (run('css')) {
  writeFileSync('assets/theme.css', sass.compile('src/scss/theme.scss', SASS_OPTIONS).css);
  for (const name of sectionFiles('src/scss/sections', '.scss')) {
    try {
      writeFileSync(`assets/section-${name}.css`, sass.compile(`src/scss/sections/${name}.scss`, SASS_OPTIONS).css);
    } catch (error) {
      failed = true;
      console.error(`✗ src/scss/sections/${name}.scss\n${error.message}\n`);
    }
  }
}

if (run('js')) {
  await esbuild.build({
    entryPoints: ['src/js/theme.js'],
    outfile: 'assets/theme.js',
    bundle: true,
    minify: true,
    format: 'iife',
    target: 'es2020',
    logLevel: 'warning',
  });
  for (const name of sectionFiles('src/js/sections', '.js')) {
    try {
      await esbuild.build({
        entryPoints: [`src/js/sections/${name}.js`],
        outfile: `assets/section-${name}.js`,
        bundle: true,
        minify: true,
        format: 'iife',
        target: 'es2020',
        logLevel: 'silent',
      });
    } catch (error) {
      failed = true;
      console.error(`✗ src/js/sections/${name}.js\n${error.message}\n`);
    }
  }
}

if (run('locales')) {
  const locale = JSON.parse(readFileSync('src/locales/_base.json'));
  locale.theme = {};
  for (const area of sectionFiles('src/locales', '.json').sort()) {
    locale.theme[area] = JSON.parse(readFileSync(`src/locales/${area}.json`));
  }
  writeFileSync('locales/en.default.json', JSON.stringify(locale, null, 2) + '\n');
}

if (failed) process.exitCode = 1;
