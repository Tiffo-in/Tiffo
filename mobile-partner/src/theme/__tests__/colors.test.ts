import { DarkColors, Colors } from '../colors';

// The website, customer app, and partner app previously shipped three different
// primary colors (orange / Zomato red / amber). These tests pin the shared
// brand accent so that drift cannot silently return.
const TIFFO_BRAND_ORANGE = '#FF7A00';

describe('partner brand tokens', () => {
  it('uses the shared TIFFO brand orange as primary', () => {
    expect(DarkColors.primary).toBe(TIFFO_BRAND_ORANGE);
  });

  it('tints the active tab with the brand accent', () => {
    expect(DarkColors.tabActive).toBe(TIFFO_BRAND_ORANGE);
  });

  it('keeps warning visually distinct from the brand accent', () => {
    // The accent used to BE amber, so a warning equal to primary would make
    // warning states invisible.
    expect(DarkColors.warning).not.toBe(DarkColors.primary);
  });

  it('exposes no legacy amber accent', () => {
    const values = Object.values(DarkColors).map((v) => String(v).toUpperCase());
    expect(values).not.toContain('#F59E0B');
  });

  it('defines the dark operations-console surfaces', () => {
    expect(DarkColors.background).toBe('#0F172A');
    expect(DarkColors.surface).toBeDefined();
    expect(DarkColors.textPrimary).toBeDefined();
  });

  it('aliases Colors to the dark palette', () => {
    expect(Colors).toBe(DarkColors);
  });
});
