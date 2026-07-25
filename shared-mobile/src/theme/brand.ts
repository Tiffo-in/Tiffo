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
  primary50: '#FFF3E8',
  primary100: '#FFE0C2',
  primary200: '#FFC085',
  primary300: '#FFA047',
  primary400: '#FF8A24',
  /** TIFFO Brand Orange — web primary-500. The canonical brand color. */
  primary500: '#FF7A18',
  primary600: '#E06514',
  primary700: '#B84E10',
  primary800: '#8A3B0D',
  primary900: '#5C2708',
} as const;

/** Convenience aliases for the three brand shades apps actually consume. */
export const Brand = {
  primary: BrandColors.primary500,
  primaryDark: BrandColors.primary600,
  primaryLight: BrandColors.primary300,
} as const;

/**
 * Semantic colors. These are deliberately NOT brand-colored — an error or a
 * non-veg indicator must stay red even when the brand accent is orange.
 */
export const Semantic = {
  veg: '#257E3E',
  nonVeg: '#E23744',
  success: '#257E3E',
  error: '#E23744',
  info: '#1A73E8',
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
