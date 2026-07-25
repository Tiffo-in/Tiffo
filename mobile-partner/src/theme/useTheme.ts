import { DarkColors, ColorScheme } from './colors';

/**
 * Returns the partner app color palette. The partner app is a single-theme
 * (dark "operations console") experience today, so this always returns the
 * dark palette. It exists so screens can consume colors through a hook now and
 * gain light/dark switching later without changing call sites.
 *
 * Usage:
 *   const C = useTheme();
 *   const S = useMemo(() => createStyles(C), [C]);
 */
export function useTheme(): ColorScheme {
  return DarkColors;
}
