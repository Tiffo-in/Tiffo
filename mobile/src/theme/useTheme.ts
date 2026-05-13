import { useColorScheme } from 'react-native';
import { LightColors, DarkColors, ColorScheme } from './colors';

/**
 * Returns the correct color palette based on the device's color scheme.
 * Screens should call this at the top of the component and pass the result
 * into createStyles(C) inside a useMemo.
 *
 * Usage:
 *   const C = useTheme();
 *   const S = useMemo(() => createStyles(C), [C]);
 */
export function useTheme(): ColorScheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DarkColors : LightColors;
}
