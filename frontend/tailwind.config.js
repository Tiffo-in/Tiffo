/** @type {import('tailwindcss').Config} */

// Every color resolves through a CSS custom property defined in
// src/styles/tokens.css, using the `rgb(var(--x) / <alpha-value>)` form so
// opacity modifiers (`bg-surface/80`, `text-neutral-500/60`) keep working.
// Dark mode is a variable flip on `.dark` — there is no `dark:` override sheet.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const scale = (prefix, shades) =>
  Object.fromEntries(shades.map((s) => [s, token(`${prefix}-${s}`)]));

const NEUTRAL_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const LINE_SHADES = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const BRAND_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

// The brand scale, shared by `primary` and the legacy `maroon`/`zomato`
// aliases so any un-migrated class still renders on-brand.
const primary = scale('p', BRAND_SHADES);

// Text, surface and line each get their OWN neutral scale. A single scale
// cannot invert correctly for all three: `text-neutral-900` must become white
// in dark mode while `bg-neutral-900` must stay dark, and `bg-neutral-100`
// wants cream while `border-neutral-100` wants a hairline. Wiring them to
// Tailwind's textColor/backgroundColor/borderColor keys keeps the ~1,700
// existing utility classes in the codebase working, with correct values.
const textNeutral = scale('t', NEUTRAL_SHADES);
const surfaceNeutral = scale('s', NEUTRAL_SHADES);
const lineNeutral = scale('line', LINE_SHADES);

// Status / category palettes. These resolve through src/styles/palette-tokens.css
// (generated — see scripts/generate-palette-tokens.mjs), which mirrors each
// scale in dark mode. Without this, the ~1,000 raw `bg-green-50` /
// `text-amber-700` style utilities in the app keep their light-mode hex in dark
// mode and render as bright blocks on the warm dark surfaces.
// Split the same three ways as the neutrals, because a single scale inverts
// wrongly: `amber-600` as label text must brighten in dark mode, but the same
// shade used as a filled accent block must hold. See the generator's header.
const PALETTE_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const PALETTE_NAMES = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal',
  'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
];
const paletteFamily = (family) =>
  Object.fromEntries(
    PALETTE_NAMES.map((name) => [
      name,
      Object.fromEntries(PALETTE_SHADES.map((s) => [s, token(`${family}-${name}-${s}`)])),
    ])
  );
const paletteText = paletteFamily('ct');
const paletteBg = paletteFamily('cb');
const paletteLine = paletteFamily('cl');

const semantic = {
  brand: token('brand'),
  'brand-hover': token('brand-hover'),
  'brand-tint': token('brand-tint'),
  'brand-border': token('brand-border'),
  // Orange as small text on light backgrounds is 2.6:1 — use `brand-ink`.
  'brand-ink': token('brand-ink'),
  // Charcoal, for labels sitting ON an orange fill (6.6:1 vs white's 2.6:1).
  'on-brand': token('on-brand'),

  surface: token('bg-card'),
  'surface-page': token('bg-primary'),
  'surface-alt': token('bg-secondary'),
  'surface-section': token('bg-section'),
  'surface-elevated': token('bg-elevated'),

  veg: token('veg'),
  'veg-bg': token('veg-bg'),
  'veg-ink': token('veg-ink'),
  nonveg: token('nonveg'),
  'nonveg-bg': token('nonveg-bg'),
  'nonveg-ink': token('nonveg-ink'),

  success: token('success'),
  warning: token('warning'),
  error: token('error'),
  info: token('info'),
  rating: token('rating'),
};

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base `colors` feeds anything without its own key (gradients, shadows,
        // fills). The bg family is the right default for those.
        ...paletteBg,
        ...semantic,
        primary,
        secondary: primary,
        // Legacy aliases from the pre-rebrand palette. Kept pointing at the
        // brand scale so stragglers render on-brand rather than maroon/red.
        maroon: primary,
        zomato: primary,
        accent: {
          green: { 500: token('veg'), 600: token('veg-ink'), 700: token('veg-ink') },
          orange: primary,
          gold: { 400: token('rating'), 500: token('rating'), 600: token('rating') },
        },
        neutral: textNeutral,
      },
      // `white` stays literally white for textColor/borderColor (labels on dark
      // or orange surfaces must not shift), but `bg-white` — 241 usages, all of
      // them card surfaces — resolves to the card token so it darkens correctly.
      // `zinc`, `slate` and `stone` are aliased onto the same three scales as
      // `neutral`/`gray`. The app had accumulated FOUR interchangeable gray
      // scales (1,079 neutral-*, 365 gray-*, 332 zinc-*, plus slate/stone), and
      // only the first two were themed — which is why dark mode looked
      // inconsistent page to page.
      backgroundColor: ({ theme }) => ({
        ...theme('colors'),
        ...paletteBg,
        white: token('bg-card'),
        neutral: surfaceNeutral,
        gray: surfaceNeutral,
        zinc: surfaceNeutral,
        slate: surfaceNeutral,
        stone: surfaceNeutral,
      }),
      textColor: ({ theme }) => ({
        ...theme('colors'),
        ...paletteText,
        neutral: textNeutral,
        gray: textNeutral,
        zinc: textNeutral,
        slate: textNeutral,
        stone: textNeutral,
      }),
      borderColor: ({ theme }) => ({
        ...theme('colors'),
        ...paletteLine,
        DEFAULT: token('line-100'),
        neutral: lineNeutral,
        gray: lineNeutral,
        zinc: lineNeutral,
        slate: lineNeutral,
        stone: lineNeutral,
      }),
      divideColor: ({ theme }) => ({
        ...theme('borderColor'),
      }),
      ringColor: ({ theme }) => ({
        ...theme('colors'),
        DEFAULT: token('brand'),
      }),
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.625rem',
        '3xl': '1.953rem',
        '4xl': '2.441rem',
        '5xl': '3.052rem',
      },
      spacing: {
        128: '32rem',
        144: '36rem',
      },
      borderRadius: {
        card: '20px',
        media: '14px',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        // Warm, wide, low-opacity — the reference look. Both values flip in
        // dark mode via the token.
        card: 'var(--shadow-sm)',
        'card-hover': 'var(--shadow-lg)',
        premium: 'var(--shadow-sm)',
        'premium-lg': 'var(--shadow-lg)',
        modal: 'var(--shadow-lg)',
        dropdown: 'var(--shadow-sm)',
        glow: '0 0 0 4px var(--brand-glow)',
        'glow-lg': '0 12px 32px var(--brand-glow)',
        focus: '0 0 0 3px var(--focus-ring)',
        'inner-premium': 'inset 0 2px 4px rgba(24, 24, 27, 0.06)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--grad-cta)',
        'gradient-secondary': 'var(--grad-cta)',
        'gradient-premium': 'var(--grad-cta)',
        'gradient-warm': 'var(--grad-cta)',
        'gradient-cta': 'var(--grad-cta)',
        'gradient-hero': 'var(--grad-hero)',
        'gradient-featured': 'var(--grad-featured)',
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
