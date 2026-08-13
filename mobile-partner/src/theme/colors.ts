// Tiffo Partner — Design System (single source of truth)
//
// The partner app is an intentionally dark "operations console". It keeps a
// slate shell (Tailwind slate scale) but uses the SAME brand accent as the
// customer app and website: TIFFO Brand Orange #FF7A00. That value is owned by
// shared-mobile/src/theme/brand.ts — import it rather than restating the hex,
// so a rebrand touches one file.
//
// Migration note: screens historically hardcode these hex values inline.
// New/edited code should import from this file (Colors / useTheme) instead of
// pasting hex, so a future rebrand only touches this one file.

import { Brand } from 'shared-mobile/src/theme/brand';

const shared = {
  // Brand accent (was amber #F59E0B before the brand alignment). Sourced from
  // shared-mobile so the customer app, partner app, and website stay aligned.
  primary: Brand.primary, // TIFFO Brand Orange (web primary-500)
  primaryDark: Brand.primaryDark,
  primaryLight: Brand.primaryLight,
  // Semantic — the partner console uses the Tailwind-ish scale its shell is
  // built on, so these stay local rather than using the customer app's values.
  success: '#10B981',
  warning: '#FBBF24', // kept distinct from brand orange for true warnings
  error: '#EF4444',
  info: '#3B82F6',
  textInverse: '#FFFFFF',
  shadowColor: '#000000',
};

// Dark "operations console" palette (Tailwind slate scale).
export const DarkColors = {
  ...shared,
  // Backgrounds
  background: '#0F172A', // slate-900 — app + splash background
  surface: '#1E293B', // slate-800 — cards
  surfaceElevated: '#334155', // slate-700 — raised surfaces
  // Text
  textPrimary: '#F8FAFC', // slate-50
  textSecondary: '#94A3B8', // slate-400
  textTertiary: '#64748B', // slate-500
  // Borders / dividers
  border: '#334155', // slate-700
  borderLight: '#475569', // slate-600
  divider: '#1E293B', // slate-800
  // Accent tint
  primaryMuted: '#3A2410', // brand orange tint on dark
  // Tab bar
  tabActive: shared.primary,
  tabInactive: '#64748B',
  tabBackground: '#0F172A',
};

export type ColorScheme = typeof DarkColors;

// The partner app is single-theme (dark) for now. Alias kept so screens can
// migrate to `Colors` today and swap to a themed hook later without churn.
export const Colors = DarkColors;

// Scale tokens are shared across both mobile apps — re-exported here so screens
// can keep importing them from the theme module.
export { Spacing, BorderRadius, FontSize, FontWeight } from 'shared-mobile/src/theme/brand';
