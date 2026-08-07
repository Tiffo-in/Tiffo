// Tiffo shared design tokens — the single source of truth for BRAND identity
// across mobile/ (customer) and mobile-partner/ (partner).
//
// Why this file exists: the customer app, partner app, and website each shipped
// a different primary color (Zomato red / amber / orange) because each owned
// its own palette. Brand-level values now live here; each app composes its own
// *surface* palette on top (the customer app is light+dark, the partner app is
// a dark operations console) since those genuinely differ.
//
// Keep BrandColors.primary in sync with frontend/tailwind.config.js `primary`.
//
// IMPORTANT: this module must stay dependency-free (no react-native, no font
// packages). shared-mobile is resolved via Metro watchFolders + TS paths rather
// than a workspace, so anything imported here must also be installed in
// shared-mobile/node_modules or typecheck breaks in both apps.

/** TIFFO brand orange scale, mirroring the web tailwind `primary` scale. */
export const BrandColors = {
  primary50: '#FFF1E5',
  primary100: '#FFE0C2',
  primary200: '#FFD6B8',
  primary300: '#FFA047',
  primary400: '#FF8A1F',
  /** TIFFO Brand Orange — web primary-500. The canonical brand color. */
  primary500: '#FF7A00',
  primary600: '#E86800',
  primary700: '#B84E10',
  primary800: '#8A3B0D',
  primary900: '#5C2708',
} as const;

/** Convenience aliases for the three brand shades apps actually consume. */
export const Brand = {
  primary: BrandColors.primary500,
  primaryDark: BrandColors.primary600,
  primaryLight: BrandColors.primary300,
  /**
   * Text color to place ON a brand-orange fill. Charcoal, not white: white on
   * #FF7A00 is 2.6:1 and fails WCAG AA (it misses even the 3:1 large-text
   * floor), while charcoal is 6.6:1. Applies to CTA labels, filled badges and
   * any orange-backed chip in both themes.
   */
  onPrimary: '#1B1B1F',
  /**
   * Orange as *text* on a light background is 2.6:1. Use this darkened ink for
   * links and inline emphasis in light mode (5.0:1). In dark mode, orange text
   * is 7.2:1 and needs no substitute — see DarkSurfaces.brandInk.
   */
  ink: '#B84E10',
} as const;

/**
 * Semantic colors. These are deliberately NOT brand-colored — an error or a
 * non-veg indicator must stay red even when the brand accent is orange.
 *
 * Each has a bright value (icon/dot fill) and an `*Ink` value (label text).
 * The bright values do not clear AA as text on their own tints — 2DBE60 on
 * EAFBF1 is only 2.4:1 — so labels must use the ink.
 */
export const Semantic = {
  veg: '#2DBE60',
  vegInk: '#257E3E',
  nonVeg: '#FF5B45',
  nonVegInk: '#C0392B',
  success: '#18A957',
  error: '#EF4444',
  warning: '#FDBA21',
  info: '#3B82F6',
  rating: '#FDBA21',
} as const;

/**
 * Surface + text scales shared by the customer app, the partner app and the
 * website. Warm whites and warm dark grays rather than pure black/white, so
 * food photography reads richer against the UI.
 *
 * Keep in sync with frontend/src/styles/tokens.css.
 */
export const LightSurfaces = {
  background: '#FFFDF8', // warm white — page
  surface: '#FFF7EF', // soft cream
  surfaceCard: '#FFFFFF',
  surfaceSection: '#FFF9F3', // ivory
  surfaceElevated: '#FFFFFF',

  textPrimary: '#1B1B1F',
  textSecondary: '#5F6368',
  /** AA: the supplied muted (#8A8F98) is 3.2:1 on warm white. Darkened to 4.9:1. */
  textMuted: '#6B7079',
  textDisabled: '#B4B8BE',

  border: '#ECE8E2',
  borderHover: '#FFD4AF',

  brandTint: '#FFF1E5',
  brandBorder: '#FFD6B8',
  brandInk: '#B84E10',

  vegBg: '#EAFBF1',
  nonVegBg: '#FFECEA',
  successBg: '#EAFBF1',
  warningBg: '#FFF6E2',
  errorBg: '#FFECEA',
  infoBg: '#EAF1FE',
} as const;

export const DarkSurfaces = {
  background: '#0F1015',
  surface: '#151821',
  surfaceCard: '#1B1F2A',
  surfaceSection: '#151821',
  surfaceElevated: '#242938',

  textPrimary: '#FFFFFF',
  textSecondary: '#C5CAD3',
  textMuted: '#9096A4',
  textDisabled: '#6F7482',

  border: '#2A2F3C',
  borderHover: '#4A2C0F',

  brandTint: '#2A1A0A',
  brandBorder: '#4A2C0F',
  /** Orange is 7.2:1 on the warm dark background — usable as text directly. */
  brandInk: '#FF9435',

  // Tints are the spec's 15% overlays composited over the card surface, so
  // they stay opaque (RN has no cascading alpha over an unknown parent).
  vegBg: '#1F3A37',
  nonVegBg: '#3D2A30',
  successBg: '#1F3A37',
  warningBg: '#3A3018',
  errorBg: '#3D2A30',
  infoBg: '#1B2B44',
} as const;

/** Semantic values that shift in dark mode (brighter, lower-saturation). */
export const SemanticDark = {
  veg: '#34D07F',
  vegInk: '#34D07F',
  nonVeg: '#FF6655',
  nonVegInk: '#FF6655',
  success: '#34D07F',
  error: '#FF6655',
  warning: '#FFC93D',
  info: '#60A5FA',
  rating: '#FFC93D',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  display: 34,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

/**
 * Brand font families, matching the website's Poppins-display + Inter-body
 * pairing. These are string identifiers only — the actual font assets are
 * loaded per-app, since @expo-google-fonts is an app-level dependency.
 */
export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Poppins_700Bold',
  extrabold: 'Poppins_800ExtraBold',
} as const;

/**
 * Map a React Native `fontWeight` to the brand font family.
 * Body weights (<=600) use Inter; display weights (>=700) use Poppins.
 *
 * Shared because both apps apply the same global font patch — if this mapping
 * drifted, the two apps would render the brand voice differently.
 */
export function weightToFontFamily(
  weight?: string | number,
  explicitFamily?: string
): string {
  if (explicitFamily) return explicitFamily; // respect an explicit override
  switch (String(weight)) {
    case '500':
      return FontFamily.medium;
    case '600':
      return FontFamily.semibold;
    case '700':
    case 'bold':
      return FontFamily.bold;
    case '800':
    case '900':
      return FontFamily.extrabold;
    default:
      return FontFamily.regular;
  }
}
