// Tiffo brand typography for the customer app.
//
// Mirrors the website's pairing (frontend: Poppins display + Inter body):
//   - body / lighter weights (<=600)  -> Inter
//   - bold / display weights (>=700)  -> Poppins
//
// `applyGlobalFont()` patches the base <Text>/<TextInput> render so every
// screen picks up the brand font by its existing `fontWeight` — no per-screen
// edits, and no regression to the bold hierarchy. Only the 5 families the
// mapping actually uses are bundled.

import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Poppins_700Bold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins';
import { Text as RNText, TextInput as RNTextInput, StyleSheet } from 'react-native';

// Passed to expo-font's useFonts().
export const fontAssets = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
};

// Exposed so screens/theme can reference families explicitly if needed.
export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Poppins_700Bold',
  extrabold: 'Poppins_800ExtraBold',
} as const;

type Weight = string | number | undefined;

function familyForWeight(weight: Weight, explicit?: string): string {
  if (explicit) return explicit; // respect a style that sets its own fontFamily
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

let applied = false;

/**
 * Patch the default Text/TextInput components so all text renders in the brand
 * font, mapped from its fontWeight. Call once, before the first render.
 */
export function applyGlobalFont(): void {
  if (applied) return;
  applied = true;

  [RNText, RNTextInput].forEach((Component) => {
    const comp = Component as unknown as {
      render?: (props: any, ref: any) => any;
    };
    const originalRender = comp.render;
    if (typeof originalRender !== 'function') return;
    comp.render = function patchedRender(props: any, ref: any) {
      const flat = (StyleSheet.flatten(props?.style) || {}) as {
        fontWeight?: Weight;
        fontFamily?: string;
      };
      const fontFamily = familyForWeight(flat.fontWeight, flat.fontFamily);
      return originalRender.call(this, { ...props, style: [{ fontFamily }, props.style] }, ref);
    };
  });
}
