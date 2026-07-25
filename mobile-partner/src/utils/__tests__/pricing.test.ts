import {
  clampDiscount,
  computeEffectivePrice,
  expiryFromDays,
  isDiscountActive,
  MAX_DISCOUNT_PERCENT,
} from '../pricing';

// This math mirrors the server's `effectivePrice` virtual in
// backend/src/models/Tiffin.js. These tests pin the parity — money is the
// highest-consequence thing the partner app computes.
describe('clampDiscount', () => {
  it('caps at the backend maximum of 70', () => {
    expect(clampDiscount(90)).toBe(MAX_DISCOUNT_PERCENT);
    expect(clampDiscount(70)).toBe(70);
  });

  it('floors negatives at zero', () => {
    expect(clampDiscount(-10)).toBe(0);
  });

  it('fails closed on non-finite input', () => {
    // Deliberately 0, not MAX: garbage input must never resolve to the largest
    // possible discount and silently give away margin.
    expect(clampDiscount(NaN)).toBe(0);
    expect(clampDiscount(Infinity)).toBe(0);
  });

  it('rounds fractional percentages', () => {
    expect(clampDiscount(12.4)).toBe(12);
    expect(clampDiscount(12.6)).toBe(13);
  });
});

describe('isDiscountActive', () => {
  const base = { weekly: 10, monthly: 20 };

  it('is inactive when the toggle is off', () => {
    expect(isDiscountActive({ ...base, isActive: false })).toBe(false);
  });

  it('is active with no expiry set', () => {
    expect(isDiscountActive({ ...base, isActive: true, expiresAt: null })).toBe(true);
  });

  it('is inactive once past the expiry', () => {
    const now = new Date('2026-07-25T00:00:00Z');
    const expired = { ...base, isActive: true, expiresAt: '2026-07-24T00:00:00Z' };
    expect(isDiscountActive(expired, now)).toBe(false);
  });

  it('is active before the expiry', () => {
    const now = new Date('2026-07-25T00:00:00Z');
    const live = { ...base, isActive: true, expiresAt: '2026-07-26T00:00:00Z' };
    expect(isDiscountActive(live, now)).toBe(true);
  });

  it('handles a missing discount', () => {
    expect(isDiscountActive(null)).toBe(false);
    expect(isDiscountActive(undefined)).toBe(false);
  });
});

describe('computeEffectivePrice', () => {
  it('uses the server baseline of daily x7 and x30 with no discount', () => {
    const p = computeEffectivePrice(100);
    expect(p.weekly).toBe(700);
    expect(p.monthly).toBe(3000);
    expect(p.weeklyOriginal).toBe(700);
    expect(p.monthlyOriginal).toBe(3000);
  });

  it('applies active discounts and keeps the original for strikethrough', () => {
    const p = computeEffectivePrice(100, { weekly: 10, monthly: 20, isActive: true });
    expect(p.weekly).toBe(630); // 700 - 10%
    expect(p.monthly).toBe(2400); // 3000 - 20%
    expect(p.weeklyOriginal).toBe(700);
    expect(p.monthlyOriginal).toBe(3000);
  });

  it('ignores discounts that are toggled off', () => {
    const p = computeEffectivePrice(100, { weekly: 50, monthly: 50, isActive: false });
    expect(p.weekly).toBe(700);
    expect(p.weeklyDiscountPercent).toBe(0);
  });

  it('ignores expired discounts', () => {
    const now = new Date('2026-07-25T00:00:00Z');
    const p = computeEffectivePrice(
      100,
      { weekly: 50, monthly: 50, isActive: true, expiresAt: '2026-07-01T00:00:00Z' },
      now,
    );
    expect(p.weekly).toBe(700);
  });

  it('clamps an out-of-range discount instead of producing a negative price', () => {
    const p = computeEffectivePrice(100, { weekly: 500, monthly: 500, isActive: true });
    expect(p.weekly).toBe(210); // clamped to 70% off
    expect(p.weekly).toBeGreaterThan(0);
  });

  it('rounds to whole rupees like the server does', () => {
    const p = computeEffectivePrice(99, { weekly: 13, monthly: 0, isActive: true });
    expect(Number.isInteger(p.weekly)).toBe(true);
    expect(p.weekly).toBe(Math.round(99 * 7 * 0.87));
  });

  it('treats an invalid daily price as zero rather than NaN', () => {
    expect(computeEffectivePrice(NaN).weekly).toBe(0);
    expect(computeEffectivePrice(-5).weekly).toBe(0);
  });
});

describe('expiryFromDays', () => {
  it('returns null for no expiry', () => {
    expect(expiryFromDays(null)).toBeNull();
    expect(expiryFromDays(0)).toBeNull();
  });

  it('adds the given number of days', () => {
    const from = new Date('2026-07-25T00:00:00Z');
    expect(expiryFromDays(7, from)).toBe(new Date('2026-08-01T00:00:00Z').toISOString());
  });
});
