/* Shared constants and pricing math for the tiffin detail page. */

export const MEAL_COLORS = {
  breakfast: 'from-amber-400 to-orange-400',
  lunch: 'from-green-400 to-emerald-500',
  dinner: 'from-indigo-400 to-purple-500',
  snacks: 'from-pink-400 to-rose-500',
};

export const PLAN_LABELS = {
  daily: { label: 'Daily', desc: '1 day plan', days: 1 },
  weekly: { label: 'Weekly', desc: '7 day plan', days: 7 },
  monthly: { label: 'Monthly', desc: '30 day plan', days: 30 },
};

export const DELIVERY_SLOTS = [
  '8:00 AM',
  '9:00 AM',
  '10:00 AM',
  '12:00 PM',
  '1:00 PM',
  '7:00 PM',
  '8:00 PM',
];

export const GST_RATE = 0.05;

/**
 * Effective per-plan pricing, honouring server-computed values when present
 * and falling back to the same formula the backend uses.
 */
export const computePricing = (tiffin) => {
  const daily = tiffin.price?.daily || 0;

  const effectivePrice = tiffin.effectivePrice || {
    daily,
    weekly: Math.round(daily * 7 * (1 - (tiffin.discount?.weekly || 0) / 100)),
    monthly: Math.round(daily * 30 * (1 - (tiffin.discount?.monthly || 0) / 100)),
    weeklyOriginal: Math.round(daily * 7),
    monthlyOriginal: Math.round(daily * 30),
    weeklyDiscountPercent: tiffin.discount?.weekly || 0,
    monthlyDiscountPercent: tiffin.discount?.monthly || 0,
  };

  return {
    daily,
    planPrice: {
      daily: effectivePrice.daily,
      weekly: effectivePrice.weekly,
      monthly: effectivePrice.monthly,
    },
    planOriginal: {
      daily: effectivePrice.daily,
      weekly: effectivePrice.weeklyOriginal,
      monthly: effectivePrice.monthlyOriginal,
    },
  };
};
