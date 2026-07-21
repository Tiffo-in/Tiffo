import { Ionicons } from '@expo/vector-icons';

import { ColorScheme } from './colors';

type Meta = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string; // text/icon colour
  bg: string; // badge background
};

/**
 * Presentation for each delivery status, resolved against the active theme —
 * the mobile counterpart of the web `deliveryStatus` config so a status reads
 * the same on every surface.
 */
export const deliveryStatusMeta = (status: string, C: ColorScheme): Meta => {
  switch (status) {
    case 'preparing':
      return { label: 'Preparing', icon: 'flame-outline', color: C.warning, bg: C.primaryMuted };
    case 'out_for_delivery':
      return { label: 'On the way', icon: 'bicycle-outline', color: C.primary, bg: C.primaryMuted };
    case 'delivered':
      return { label: 'Delivered', icon: 'checkmark-circle', color: C.veg, bg: C.successBg };
    case 'skipped':
      return {
        label: 'Skipped',
        icon: 'play-skip-forward-outline',
        color: C.secondary,
        bg: C.secondaryMuted,
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        icon: 'close-circle-outline',
        color: C.error,
        bg: C.surfaceCard,
      };
    case 'scheduled':
    default:
      return {
        label: 'Scheduled',
        icon: 'calendar-outline',
        color: C.textSecondary,
        bg: C.surfaceCard,
      };
  }
};
