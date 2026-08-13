#!/usr/bin/env node
//
// Design-system guard: token usage.
//
// palette/contrast check that the tokens are right. This checks that components
// actually go through them. Three rules:
//
//   1. Every palette utility class in src/ resolves to a token that exists.
//      Tailwind fails silently here: `text-emerald-600` with no --ct-emerald-600
//      compiles fine and renders as an unset color. (Exactly this had happened
//      to emerald and teal before the generator emitted the full grid.)
//
//   2. No `dark:` colour overrides. Dark mode in this app is a *variable flip*
//      on `.dark` — tokens.css redefines the same custom properties. A
//      `dark:bg-*` utility bypasses that and then has to be maintained by hand,
//      which is how a palette drifts apart theme to theme.
//
//   3. No raw brand hex in components. The brand scale lives in tokens.css (and
//      is owned by shared-mobile/src/theme/brand.ts). A literal `#FF7A00` in a
//      component silently survives a rebrand. Where a literal is genuinely
//      unavoidable — a third-party SDK that takes a hex string, not a CSS var —
//      mark the line `design-system-ok` with a reason.
//
// Usage: node scripts/check-usage.mjs

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative, join } from 'node:path';
import { PALETTE_NAMES, ROLES } from './palette-config.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, '../src');
const STYLES = resolve(HERE, '../src/styles');
const ROOT = resolve(HERE, '..');

const ESCAPE = 'design-system-ok';

/** Utility prefix -> token prefix, derived from ROLES so the two cannot drift. */
const UTILITY_ROLE = Object.fromEntries(
  Object.entries(ROLES).flatMap(([role, { utilities }]) => utilities.map((u) => [u, role]))
);

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, acc);
    else if (/\.(jsx?|tsx?)$/.test(entry)) acc.push(path);
  }
  return acc;
}

/** Custom properties defined in any :root/.dark block across the stylesheets. */
function definedTokens() {
  const defined = new Set();
  for (const file of ['tokens.css', 'palette-tokens.css']) {
    const css = readFileSync(join(STYLES, file), 'utf8');
    for (const m of css.matchAll(/--([\w-]+):/g)) defined.add(m[1]);
  }
  return defined;
}

/** Strip // and /* *​/ comments so annotations aren't mistaken for code. */
function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const defined = definedTokens();
const files = walk(SRC).filter((f) => !f.startsWith(STYLES));
const violations = [];

const paletteRe = new RegExp(
  `\\b(?:hover|focus|active|group-hover|focus-visible|disabled|peer-focus)?:?` +
    `(${Object.keys(UTILITY_ROLE).join('|')})-(${PALETTE_NAMES.join('|')})-(\\d{2,3})\\b`,
  'g'
);
const darkRe = /\bdark:(bg|text|border|from|via|to|ring|divide|fill|outline)-[a-z0-9-]+/g;
const BRAND_HEX = /#(?:FF7A00|E86800|B84E10|FFF1E5|FFE0C2|FFD6B8|FFA047|FF8A1F|8A3B0D|5C2708)\b/gi;

for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const code = stripComments(raw);
  const rel = relative(ROOT, file);
  const lineOf = (index) => code.slice(0, index).split('\n').length;
  const rawLines = raw.split('\n');

  // Rule 1 — palette classes resolve to a real token.
  for (const m of code.matchAll(paletteRe)) {
    const [, utility, name, shade] = m;
    const tokenName = `${UTILITY_ROLE[utility]}-${name}-${shade}`;
    if (!defined.has(tokenName)) {
      violations.push(
        `${rel}:${lineOf(m.index)}  ${m[0]} has no --${tokenName} ` +
          `(run \`npm run generate:palette\`)`
      );
    }
  }

  // Rule 2 — no dark: colour overrides.
  for (const m of code.matchAll(darkRe)) {
    violations.push(
      `${rel}:${lineOf(m.index)}  ${m[0]} — dark mode is a token flip, not a ` +
        `\`dark:\` override; use the semantic token instead`
    );
  }

  // Rule 3 — no raw brand hex (comments already stripped).
  for (const m of code.matchAll(BRAND_HEX)) {
    const line = lineOf(m.index);
    if (rawLines[line - 1]?.includes(ESCAPE)) continue;
    violations.push(
      `${rel}:${line}  raw brand hex ${m[0]} — use a token (\`text-brand\`, ` +
        `\`var(--brand)\`); if a literal is unavoidable, append \`${ESCAPE}: <reason>\``
    );
  }
}

if (violations.length) {
  console.error(`✗ token usage: ${violations.length} violation(s)\n`);
  for (const v of violations) console.error(`  • ${v}`);
  console.error('');
  process.exit(1);
}
console.log(`✓ token usage: ${files.length} files clean`);
