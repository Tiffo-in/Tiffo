// Shared configuration for the design-system scripts.
//
// These lists MUST stay in step with tailwind.config.js — that file declares
// the FULL grid of palette utilities (17 families x 11 shades x 3 roles), so
// every one of those classes is legal in a component and must resolve to a
// token. check-usage.mjs enforces that agreement.

import { createRequire } from 'node:module';

// tailwindcss v3 ships CommonJS with no ESM export map for this subpath.
const twColors = createRequire(import.meta.url)('tailwindcss/colors');

/** Mirrors PALETTE_NAMES in tailwind.config.js. */
export const PALETTE_NAMES = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
];

/** Mirrors PALETTE_SHADES in tailwind.config.js. */
export const PALETTE_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/**
 * The three roles a palette color plays, and which utility prefixes actually
 * resolve to each. A single scale cannot invert correctly for all three — see
 * the generator header.
 *
 * The utility lists mirror how tailwind.config.js wires things up, which is not
 * always the obvious grouping:
 *   - `text-`   -> textColor      -> paletteText  (ct)
 *   - `bg-`     -> backgroundColor-> paletteBg    (cb)
 *   - `border-` -> borderColor    -> paletteLine  (cl)
 *   - `divide-` -> divideColor, which spreads borderColor        (cl)
 *   - everything else (gradient stops, ring, fill, outline...) has no dedicated
 *     key, so it falls through to base `colors` — and that spreads `paletteBg`.
 *     Those are therefore `cb`, not `cl`/`ct`.
 */
export const ROLES = {
  ct: { label: 'text', utilities: ['text'] },
  cb: {
    label: 'bg',
    utilities: ['bg', 'from', 'via', 'to', 'ring', 'fill', 'stroke', 'outline', 'shadow'],
  },
  cl: { label: 'border', utilities: ['border', 'divide'] },
};

/** Light shade <-> dark shade reflection across the middle of the scale. */
const MIRROR = {
  50: 950,
  100: 900,
  200: 800,
  300: 700,
  400: 600,
  500: 500,
  600: 400,
  700: 300,
  800: 200,
  900: 100,
  950: 50,
};

/**
 * Which shade a role's token resolves to under `.dark`.
 *
 * - `ct` (text) mirrors the whole scale: an `amber-600` label must brighten to
 *   `amber-400` on a dark surface or it stops being legible.
 * - `cb`/`cl` mirror the TINTS only (<=200 and >=800). A `green-50` chip
 *   background has to become `green-950`, but an `amber-600` filled block is
 *   an accent, not a tint — flipping it would invert a deliberate emphasis.
 */
export function darkShadeFor(role, shade) {
  if (role === 'ct') return MIRROR[shade];
  return shade <= 200 || shade >= 800 ? MIRROR[shade] : shade;
}

/** '#22c55e' -> '34 197 94' (the `rgb(var(--x) / <alpha-value>)` form). */
export function hexToRgbTriple(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** Authoritative Tailwind hex for a family/shade, straight from the package. */
export function paletteHex(name, shade) {
  const hex = twColors[name]?.[shade];
  if (typeof hex !== 'string' || !hex.startsWith('#')) {
    throw new Error(`tailwindcss/colors has no hex for ${name}-${shade}`);
  }
  return hex;
}
