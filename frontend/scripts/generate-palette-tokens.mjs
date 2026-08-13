#!/usr/bin/env node
//
// Generates src/styles/palette-tokens.css — the theme-aware status/category
// palettes (red/amber/green/... ) that back the ~1,000 raw `bg-green-50` /
// `text-amber-700` utilities still in the app.
//
// Why this file exists at all: every color in tailwind.config.js resolves
// through `rgb(var(--x) / <alpha-value>)`, and dark mode is a *variable flip*
// on `.dark` — there is no `dark:` override sheet. Without these tokens the
// palette utilities would keep their light-mode hex on the warm dark surfaces
// and render as bright blocks.
//
// Why three scales instead of one: a single mirrored scale inverts wrongly for
// at least one role. `text-amber-600` as label text must brighten in dark mode
// to stay legible, but `bg-amber-600` used as a filled accent must hold — it is
// emphasis, not a tint. So text mirrors the full scale while bg/border mirror
// only the tints. See darkShadeFor() in palette-config.mjs.
//
// The full grid is emitted (not just the shades currently used) because
// tailwind.config.js declares the full grid: every one of those classes is
// legal in a component, and a missing token fails silently as an unresolved
// var(). Generating only observed usage is what let this file drift out of
// sync with src/ in the first place.
//
// Usage:
//   node scripts/generate-palette-tokens.mjs            # write the file
//   node scripts/generate-palette-tokens.mjs --check    # exit 1 if stale

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  PALETTE_NAMES,
  PALETTE_SHADES,
  ROLES,
  darkShadeFor,
  hexToRgbTriple,
  paletteHex,
} from './palette-config.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const OUTPUT_PATH = resolve(HERE, '../src/styles/palette-tokens.css');

const RULE = '═'.repeat(75);

const HEADER = `/* ${RULE}
   GENERATED FILE — do not edit by hand.
   Run \`npm run generate:palette\` (scripts/generate-palette-tokens.mjs).

   Theme-aware status/category palettes, split three ways so each role inverts
   correctly in dark mode:
     --ct-*  text    full mirror   (amber-600 label -> amber-400, stays legible)
     --cb-*  bg      tints only    (green-50 chip -> green-950; amber-600 fill holds)
     --cl-*  border  tints only

   Values come straight from tailwindcss/colors, so they cannot drift from the
   framework. See the script header for why one mirrored scale is not enough.
   ${RULE} */`;

/** Emit the declarations for one theme block. */
function declarations(theme) {
  const lines = [];
  for (const [role] of Object.entries(ROLES)) {
    for (const name of PALETTE_NAMES) {
      for (const shade of PALETTE_SHADES) {
        const source = theme === 'dark' ? darkShadeFor(role, shade) : shade;
        lines.push(`  --${role}-${name}-${shade}: ${hexToRgbTriple(paletteHex(name, source))};`);
      }
    }
  }
  return lines.join('\n');
}

/** The full stylesheet as a string. Pure — used by both write and --check. */
export function renderPaletteTokens() {
  return [
    HEADER,
    '',
    ':root {',
    declarations('light'),
    '}',
    '',
    '.dark {',
    declarations('dark'),
    '}',
    '',
  ].join('\n');
}

function main() {
  const expected = renderPaletteTokens();
  const checkOnly = process.argv.includes('--check');

  if (checkOnly) {
    let actual;
    try {
      actual = readFileSync(OUTPUT_PATH, 'utf8');
    } catch {
      console.error('✗ src/styles/palette-tokens.css is missing. Run: npm run generate:palette');
      process.exit(1);
    }
    if (actual !== expected) {
      console.error(
        '✗ src/styles/palette-tokens.css is out of date.\n' +
          '  It is generated — edit scripts/generate-palette-tokens.mjs, then run:\n' +
          '    npm run generate:palette'
      );
      process.exit(1);
    }
    console.log('✓ palette-tokens.css is up to date');
    return;
  }

  writeFileSync(OUTPUT_PATH, expected);
  const count = PALETTE_NAMES.length * PALETTE_SHADES.length * Object.keys(ROLES).length;
  console.log(`✓ wrote src/styles/palette-tokens.css (${count} tokens x 2 themes)`);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
