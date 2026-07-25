// Partner-side pricing math.
//
// This MIRRORS the server's `effectivePrice` virtual in
// backend/src/models/Tiffin.js. It exists so the partner can see an accurate
// live preview of what customers will pay while configuring a discount —
// it is NOT the source of truth. The server recomputes on read, and the
// discount range is enforced server-side in tiffinController.updateDiscount.
//
// If the server virtual changes, change this together with it.

/** Maximum discount the backend accepts (tiffinController validates 0-70). */
export const MAX_DISCOUNT_PERCENT = 70;

export interface DiscountConfig {
  weekly: number;
  monthly: number;
  isActive: boolean;
  expiresAt?: string | Date | null;
}

export interface EffectivePrice {
  daily: number;
  weekly: number;
  monthly: number;
  weeklyOriginal: number;
  monthlyOriginal: number;
  weeklyDiscountPercent: number;
  monthlyDiscountPercent: number;
}

/**
 * Clamp a partner-entered percentage into the range the backend will accept.
 * The server enforces this too — this is for immediate UI feedback, never a
 * substitute for the server check.
 */
export function clampDiscount(value: number): number {
  // Fails closed: non-finite or negative input resolves to no discount rather
  // than the maximum, so bad input can never give away margin.
  if (!Number.isFinite(value) || value < 0) return 0;
  if (value > MAX_DISCOUNT_PERCENT) return MAX_DISCOUNT_PERCENT;
  return Math.round(value);
}

/** True when a discount is configured, enabled, and not past its expiry. */
export function isDiscountActive(
  discount: DiscountConfig | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!discount || !discount.isActive) return false;
  if (!discount.expiresAt) return true;
  return now < new Date(discount.expiresAt);
}

/**
 * Compute what a customer actually pays, mirroring the server virtual.
 * Weekly/monthly baselines are daily x7 and x30 — the server's own convention.
 */
export function computeEffectivePrice(
  dailyPrice: number,
  discount?: DiscountConfig | null,
  now: Date = new Date(),
): EffectivePrice {
  const daily = Number.isFinite(dailyPrice) && dailyPrice > 0 ? dailyPrice : 0;
  const active = isDiscountActive(discount, now);
  const weeklyDiscount = active ? clampDiscount(discount?.weekly ?? 0) : 0;
  const monthlyDiscount = active ? clampDiscount(discount?.monthly ?? 0) : 0;

  return {
    daily,
    weekly: Math.round(daily * 7 * (1 - weeklyDiscount / 100)),
    monthly: Math.round(daily * 30 * (1 - monthlyDiscount / 100)),
    weeklyOriginal: Math.round(daily * 7),
    monthlyOriginal: Math.round(daily * 30),
    weeklyDiscountPercent: weeklyDiscount,
    monthlyDiscountPercent: monthlyDiscount,
  };
}

/** Resolve a preset sale duration (in days) to an ISO expiry, or null. */
export function expiryFromDays(days: number | null, from: Date = new Date()): string | null {
  if (!days || days <= 0) return null;
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
