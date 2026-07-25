// Tiffo Design System — brand palette (single source of truth)
// Primary brand orange mirrors the web app's tailwind `primary` scale
// (#FF7A18 = primary-500). Keep these values in sync with
// frontend/tailwind.config.js so web + mobile stay on-brand.

const shared = {
  primary: '#FF7A18', // TIFFO Brand Orange (web primary-500)
  primaryDark: '#E06514', // web primary-600
  primaryLight: '#FFA047', // web primary-300
  secondary: '#FC8019',
  secondaryDark: '#E06500',
  secondaryLight: '#FFB067',
  veg: '#257E3E',
  nonVeg: '#E23744', // non-veg indicator stays red (food convention)
  success: '#257E3E',
  warning: '#F1A33A',
  error: '#E23744', // error stays red
  info: '#1A73E8',
  ratingBg: '#FF7A18',
  ratingText: '#FFFFFF',
  offerBg: '#257E3E',
  tabActive: '#FF7A18',
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

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  display: 34,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

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
