#!/usr/bin/env node
//
// Design-system guard: palette conformance.
//
// Three things must agree, or a color silently breaks somewhere:
//
//   1. palette-tokens.css is regen-clean — it is a generated file, so a
//      hand-edit (or a stale checkout after the generator changed) means the
//      committed CSS no longer matches its source of truth.
//
//   2. The brand scale in tokens.css matches shared-mobile/src/theme/brand.ts.
//      The website, customer app and partner app have shipped three different
//      "brand orange" values before; brand.ts owns the value and the web
//      tokens must mirror it. This is the check that catches that class of bug.
//
//   3. Every `var(--x)` that tailwind.config.js resolves a color to is
//      actually defined in :root. A missing definition is invisible at build
//      time and renders as an unset color at runtime.
//
// Usage: node scripts/check-palette.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { renderPaletteTokens, OUTPUT_PATH } from './generate-palette-tokens.mjs';
import { hexToRgbTriple } from './palette-config.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const TOKENS_CSS = resolve(HERE, '../src/styles/tokens.css');
const BRAND_TS = resolve(HERE, '../../shared-mobile/src/theme/brand.ts');
const TW_CONFIG = resolve(HERE, '../tailwind.config.js');

const failures = [];
const fail = (msg) => failures.push(msg);

/** Declarations inside the first `:root { ... }` block of a stylesheet. */
function rootDeclarations(css) {
  const start = css.indexOf(':root {');
  if (start === -1) return {};
  const end = css.indexOf('}', start);
  const block = css.slice(start, end);
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])
  );
}

// ── 1. palette-tokens.css is regen-clean ────────────────────────────────────
let paletteCss = '';
try {
  paletteCss = readFileSync(OUTPUT_PATH, 'utf8');
  if (paletteCss !== renderPaletteTokens()) {
    fail('palette-tokens.css is out of date — run `npm run generate:palette`');
  }
} catch {
  fail('palette-tokens.css is missing — run `npm run generate:palette`');
}

// ── 2. Brand scale mirrors shared-mobile/src/theme/brand.ts ─────────────────
const tokensCss = readFileSync(TOKENS_CSS, 'utf8');
const tokenRoot = rootDeclarations(tokensCss);
const brandTs = readFileSync(BRAND_TS, 'utf8');

const brandBlock = brandTs.match(/export const BrandColors = \{([\s\S]*?)\}/);
if (!brandBlock) {
  fail(`could not parse BrandColors out of ${BRAND_TS}`);
} else {
  const entries = [...brandBlock[1].matchAll(/primary(\d+):\s*'(#[0-9a-fA-F]{6})'/g)];
  if (entries.length === 0) fail('BrandColors parsed but contained no primary shades');

  for (const [, shade, hex] of entries) {
    const cssVar = `p-${shade}`;
    const expected = hexToRgbTriple(hex);
    // tokens.css annotates values with a trailing /* #HEX */ comment.
    const actual = (tokenRoot[cssVar] ?? '').replace(/\/\*.*$/, '').trim();
    if (!actual) {
      fail(`tokens.css is missing --${cssVar} (brand.ts defines primary${shade} = ${hex})`);
    } else if (actual !== expected) {
      fail(
        `brand drift: --${cssVar} is "${actual}" but brand.ts primary${shade} = ${hex} ` +
          `("${expected}"). shared-mobile/src/theme/brand.ts owns this value.`
      );
    }
  }
}

// ── 3. Every token tailwind.config.js references is defined ─────────────────
const twConfig = createRequire(import.meta.url)(TW_CONFIG);
const referenced = new Set();
(function collect(node) {
  if (typeof node === 'string') {
    const m = node.match(/var\(--([\w-]+)\)/);
    if (m) referenced.add(m[1]);
  } else if (node && typeof node === 'object') {
    Object.values(node).forEach(collect);
  }
})(twConfig.theme?.extend?.colors ?? {});

const defined = new Set([...Object.keys(tokenRoot), ...Object.keys(rootDeclarations(paletteCss))]);
const undefinedTokens = [...referenced].filter((t) => !defined.has(t)).sort();
if (undefinedTokens.length) {
  const shown = undefinedTokens.slice(0, 15);
  fail(
    `tailwind.config.js references ${undefinedTokens.length} token(s) that no :root block ` +
      `defines:\n    ${shown.join(', ')}${undefinedTokens.length > shown.length ? ', …' : ''}`
  );
}

// ── Report ──────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error('✗ palette conformance failed:\n');
  for (const f of failures) console.error(`  • ${f}`);
  console.error('');
  process.exit(1);
}
console.log(
  `✓ palette conformance: brand scale matches brand.ts, ` +
    `${referenced.size} tailwind tokens defined, generated CSS current`
);
