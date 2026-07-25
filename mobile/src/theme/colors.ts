// Tiffo customer app palette.
//
// Brand-level values (the orange scale, semantic colors, scale tokens) come
// from shared-mobile so the customer app, partner app, and website cannot drift
// apart again. Only the *surface* palette below is app-specific — the customer
// app is light+dark, while the partner app is a dark operations console.

import { Brand, Semantic } from 'shared-mobile/src/theme/brand';

const shared = {
  primary: Brand.primary, // TIFFO Brand Orange (web primary-500)
  primaryDark: Brand.primaryDark,
  primaryLight: Brand.primaryLight,
  secondary: '#FC8019',
  secondaryDark: '#E06500',
  secondaryLight: '#FFB067',
  veg: Semantic.veg,
  nonVeg: Semantic.nonVeg, // non-veg indicator stays red (food convention)
  success: Semantic.success,
  warning: '#F1A33A',
  error: Semantic.error, // error stays red
  info: Semantic.info,
  ratingBg: Brand.primary,
  ratingText: '#FFFFFF',
  offerBg: Semantic.veg,
  tabActive: Brand.primary,
  skeletonBase: '#3A3A3A', // overridden per mode below
  skeletonHighlight: '#4A4A4A',
  textInverse: '#FFFFFF',
  shadowColor: '#000000',
};

export const LightColors = {
  ...shared,
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F8F8F8',
  surfaceCard: '#FFFFFF',
  surfaceMuted: '#FFF8F7',
  // Text
  textPrimary: '#1C1C1C',
  textSecondary: '#686B78',
  textTertiary: '#93959F',
  // Borders
  border: '#E8E8E8',
  borderLight: '#F5F5F5',
  divider: '#F0F0F0',
  // Muted tints
  primaryMuted: '#FFF3E8', // brand orange tint (web primary-50)
  secondaryMuted: '#FFF3EA',
  successBg: '#E9F5EE',
  warningBg: '#FEF3E2',
  errorBg: '#FFECEE',
  infoBg: '#E8F0FE',
  // Tab
  tabInactive: '#9B9B9B',
  tabBackground: '#FFFFFF',
  // Skeleton
  skeletonBase: '#F0F0F0',
  skeletonHighlight: '#E8E8E8',
};

export const DarkColors = {
  ...shared,
  // Backgrounds
  background: '#111111',
  surface: '#1C1C1C',
  surfaceCard: '#1E1E1E',
  surfaceMuted: '#181818',
  // Text
  textPrimary: '#F2F2F2',
  textSecondary: '#ABABAB',
  textTertiary: '#6E6E6E',
  // Borders
  border: '#2E2E2E',
  borderLight: '#252525',
  divider: '#282828',
  // Muted tints (dark versions)
  primaryMuted: '#2A1600', // brand orange tint (dark)
  secondaryMuted: '#2D1800',
  successBg: '#0A2015',
  warningBg: '#281A00',
  errorBg: '#2D0B0E',
  infoBg: '#0D1C33',
  // Tab
  tabInactive: '#5E5E5E',
  tabBackground: '#1A1A1A',
  // Skeleton
  skeletonBase: '#2A2A2A',
  skeletonHighlight: '#333333',
};

export type ColorScheme = typeof LightColors;

// Aliases kept for backward compat (screens now use useTheme)
export const Colors = LightColors;

// Scale tokens are shared across both mobile apps — re-exported here so screens
// can keep importing them from the theme module.
export { Spacing, BorderRadius, FontSize, FontWeight } from 'shared-mobile/src/theme/brand';

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
};
