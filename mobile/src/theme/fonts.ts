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
import { FontFamily, weightToFontFamily } from 'shared-mobile/src/theme/brand';

// Passed to expo-font's useFonts(). The font assets themselves are an app-level
// dependency (@expo-google-fonts), so they stay here — only the weight->family
// mapping is shared, since that is what determines the brand voice.
export const fontAssets = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
};

// Re-exported so screens can reference families explicitly if needed.
export { FontFamily };

type Weight = string | number | undefined;

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
      const fontFamily = weightToFontFamily(flat.fontWeight, flat.fontFamily);
      return originalRender.call(this, { ...props, style: [{ fontFamily }, props.style] }, ref);
    };
  });
}
