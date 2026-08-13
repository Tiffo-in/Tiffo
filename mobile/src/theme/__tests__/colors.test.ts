import { LightColors, DarkColors } from '../colors';

// The website, customer app, and partner app previously shipped three different
// primary colors (orange / Zomato red / amber). These tests pin the shared
// brand accent so that drift cannot silently return.
const TIFFO_BRAND_ORANGE = '#FF7A00';
const LEGACY_ZOMATO_RED = '#E23744';

describe('customer brand tokens', () => {
  it('uses the shared TIFFO brand orange as primary in both schemes', () => {
    expect(LightColors.primary).toBe(TIFFO_BRAND_ORANGE);
    expect(DarkColors.primary).toBe(TIFFO_BRAND_ORANGE);
  });

  it('tints the active tab and rating badge with the brand accent', () => {
    expect(LightColors.tabActive).toBe(TIFFO_BRAND_ORANGE);
    expect(LightColors.ratingBg).toBe(TIFFO_BRAND_ORANGE);
  });

  it('keeps semantic reds red', () => {
    // error + the non-veg indicator are semantic, not brand — they must NOT
    // have been swept up in the orange rebrand. They no longer share one hex:
    // non-veg is warmer than error so the two read as different signals.
    expect(LightColors.error).toBe('#EF4444');
    expect(LightColors.nonVeg).toBe('#FF5B45');
    expect(LightColors.error).not.toBe(LightColors.primary);
    expect(LightColors.nonVeg).not.toBe(LightColors.primary);
  });

  it('does not use the legacy red as the brand primary', () => {
    expect(LightColors.primary).not.toBe(LEGACY_ZOMATO_RED);
  });

  it('defines matching keys for light and dark schemes', () => {
    expect(Object.keys(LightColors).sort()).toEqual(Object.keys(DarkColors).sort());
  });
});
