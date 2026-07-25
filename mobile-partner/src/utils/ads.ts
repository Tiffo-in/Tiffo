// Ad campaign / wallet helpers.
//
// Mirrors constraints enforced in backend/src/controllers/adController.js:
// createWalletOrder rejects anything under ₹100.

/** Minimum wallet top-up the backend accepts (adController.createWalletOrder). */
export const MIN_TOPUP_INR = 100;

/** Whole-rupee currency formatting for budgets and wallet balances. */
export function formatCurrency(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `₹${safe.toLocaleString('en-IN')}`;
}

/** Client-side mirror of the server's minimum top-up rule. */
export function isValidTopUp(amountInr: number): boolean {
  return Number.isFinite(amountInr) && amountInr >= MIN_TOPUP_INR;
}

/** Budget still available today; never negative even if overspent. */
export function remainingBudget(dailyBudget: number, spentToday: number): number {
  const budget = Number.isFinite(dailyBudget) && dailyBudget > 0 ? dailyBudget : 0;
  const spent = Number.isFinite(spentToday) && spentToday > 0 ? spentToday : 0;
  return Math.max(0, budget - spent);
}

/** Fraction of today's budget consumed, clamped to 0-1 for progress bars. */
export function budgetUsedFraction(dailyBudget: number, spentToday: number): number {
  const budget = Number.isFinite(dailyBudget) && dailyBudget > 0 ? dailyBudget : 0;
  if (budget === 0) return 0;
  const spent = Number.isFinite(spentToday) && spentToday > 0 ? spentToday : 0;
  return Math.min(1, spent / budget);
}

/** True when a campaign can actually serve: active, funded, and under budget. */
export function canCampaignServe(campaign: {
  isActive: boolean;
  walletBalance: number;
  dailyBudget: number;
  spentToday: number;
}): boolean {
  if (!campaign.isActive) return false;
  if (!(campaign.walletBalance > 0)) return false;
  return remainingBudget(campaign.dailyBudget, campaign.spentToday) > 0;
}
