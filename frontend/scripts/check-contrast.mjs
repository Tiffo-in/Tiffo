#!/usr/bin/env node
//
// Design-system guard: WCAG contrast.
//
// tokens.css annotates many of its values with the ratio they were chosen to
// hit ("--t-500: /* 4.9:1 */"). Those annotations are load-bearing — they are
// why the muted grey was darkened off the original spec value — but a comment
// cannot enforce itself. This script recomputes every documented pairing from
// the actual token values, in BOTH themes, and fails if one regresses below
// its WCAG AA floor.
//
// Scope note: only pairings the design system actually ships are listed. Tokens
// documented as exempt (--t-300 disabled text, --t-400 decorative/icon-only)
// are deliberately absent rather than checked against a lowered bar.
//
// Usage: node scripts/check-contrast.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const TOKENS_CSS = resolve(HERE, '../src/styles/tokens.css');

// WCAG 2.1 AA. Normal text needs 4.5:1; large/bold text and UI component
// boundaries need 3:1.
const AA_TEXT = 4.5;
const AA_LARGE = 3.0;

/**
 * Pairings that must hold in both themes.
 * [foreground, background, minimum, what it is]
 */
const PAIRS = [
  ['t-900', 'bg-primary', AA_TEXT, 'primary body text on the page'],
  ['t-900', 'bg-card', AA_TEXT, 'primary body text on a card'],
  ['t-600', 'bg-primary', AA_TEXT, 'secondary text on the page'],
  ['t-600', 'bg-card', AA_TEXT, 'secondary text on a card'],
  ['t-500', 'bg-primary', AA_TEXT, 'muted text on the page'],
  ['t-500', 'bg-card', AA_TEXT, 'muted text on a card'],
  ['on-brand', 'brand', AA_TEXT, 'label on a brand-orange fill'],
  ['brand-ink', 'bg-primary', AA_TEXT, 'brand-coloured link on the page'],
  ['brand-ink', 'bg-card', AA_TEXT, 'brand-coloured link on a card'],
  ['brand-ink', 'brand-tint', AA_TEXT, 'brand text on its own tint'],
  ['veg-ink', 'veg-bg', AA_TEXT, 'veg label on its tint'],
  ['nonveg-ink', 'nonveg-bg', AA_TEXT, 'non-veg label on its tint'],
  ['brand-hover', 'bg-primary', AA_LARGE, 'brand hover accent on the page'],
];

// Deliberately NOT checked: --brand directly on a light background. Raw brand
// orange is 2.57:1 there, which is why --brand-ink exists — the design system's
// rule is that orange is a FILL (labelled with --on-brand), never text or a
// hairline accent on a light surface. Asserting it here would encode a usage
// the system forbids; the two pairings that matter are --on-brand/--brand and
// --brand-ink/--bg-primary, both above.

/** Parse a `:root {}` / `.dark {}` block into { token: 'r g b' }. */
function themeTokens(css, selector) {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`no ${selector} block in tokens.css`);
  const end = css.indexOf('\n}', start);
  const block = css.slice(start, end);
  const out = {};
  for (const m of block.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    const value = m[2].replace(/\/\*.*$/, '').trim();
    if (/^\d+\s+\d+\s+\d+$/.test(value)) out[m[1]] = value.split(/\s+/).map(Number);
  }
  return out;
}

/** WCAG relative luminance. */
function luminance([r, g, b]) {
  const lin = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrast(fg, bg) {
  const [a, b] = [luminance(fg), luminance(bg)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const css = readFileSync(TOKENS_CSS, 'utf8');
const themes = { light: themeTokens(css, ':root'), dark: themeTokens(css, '.dark') };

const failures = [];
let checked = 0;

for (const [theme, tokens] of Object.entries(themes)) {
  for (const [fgName, bgName, min, description] of PAIRS) {
    const fg = tokens[fgName];
    const bg = tokens[bgName];
    if (!fg || !bg) {
      failures.push(`[${theme}] missing token: ${!fg ? `--${fgName}` : `--${bgName}`}`);
      continue;
    }
    checked++;
    const ratio = contrast(fg, bg);
    if (ratio < min) {
      failures.push(
        `[${theme}] ${description}: --${fgName} on --${bgName} is ` +
          `${ratio.toFixed(2)}:1, below the ${min}:1 floor`
      );
    }
  }
}

if (failures.length) {
  console.error('✗ WCAG contrast failed:\n');
  for (const f of failures) console.error(`  • ${f}`);
  console.error('');
  process.exit(1);
}
console.log(`✓ WCAG contrast: ${checked} pairings pass across light and dark`);
