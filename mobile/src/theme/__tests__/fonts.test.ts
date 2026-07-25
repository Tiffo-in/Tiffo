import { Brand, FontFamily, weightToFontFamily } from 'shared-mobile/src/theme/brand';

// The weight->family mapping lives in shared-mobile because both apps apply the
// same global font patch. If it drifted, the two apps would render the brand
// voice differently — which is the class of bug this whole effort fixed.
describe('shared brand font mapping', () => {
  it('uses Inter for body weights', () => {
    expect(weightToFontFamily('400')).toBe(FontFamily.regular);
    expect(weightToFontFamily('500')).toBe(FontFamily.medium);
    expect(weightToFontFamily('600')).toBe(FontFamily.semibold);
  });

  it('uses Poppins for display weights', () => {
    expect(weightToFontFamily('700')).toBe(FontFamily.bold);
    expect(weightToFontFamily('bold')).toBe(FontFamily.bold);
    expect(weightToFontFamily('800')).toBe(FontFamily.extrabold);
    expect(weightToFontFamily('900')).toBe(FontFamily.extrabold);
  });

  it('falls back to regular for an unset or unknown weight', () => {
    expect(weightToFontFamily(undefined)).toBe(FontFamily.regular);
    expect(weightToFontFamily('not-a-weight')).toBe(FontFamily.regular);
  });

  it('respects an explicit fontFamily override', () => {
    expect(weightToFontFamily('700', 'CustomFont')).toBe('CustomFont');
  });

  it('accepts numeric weights', () => {
    expect(weightToFontFamily(700)).toBe(FontFamily.bold);
  });
});

describe('shared brand tokens', () => {
  it('exposes the canonical brand orange', () => {
    expect(Brand.primary).toBe('#FF7A18');
  });
});
