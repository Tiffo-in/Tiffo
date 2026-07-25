import {
  MIN_TOPUP_INR,
  budgetUsedFraction,
  canCampaignServe,
  formatCurrency,
  isValidTopUp,
  remainingBudget,
} from '../ads';

describe('formatCurrency', () => {
  it('formats whole rupees with Indian grouping', () => {
    expect(formatCurrency(1000)).toBe('₹1,000');
    expect(formatCurrency(0)).toBe('₹0');
  });

  it('rounds fractional paise values', () => {
    expect(formatCurrency(99.6)).toBe('₹100');
  });

  it('does not render NaN to the partner', () => {
    expect(formatCurrency(NaN)).toBe('₹0');
  });
});

describe('isValidTopUp', () => {
  it('mirrors the backend minimum of 100', () => {
    expect(isValidTopUp(MIN_TOPUP_INR)).toBe(true);
    expect(isValidTopUp(99)).toBe(false);
  });

  it('rejects non-finite amounts', () => {
    expect(isValidTopUp(NaN)).toBe(false);
  });
});

describe('remainingBudget', () => {
  it('subtracts spend from budget', () => {
    expect(remainingBudget(200, 50)).toBe(150);
  });

  it('never goes negative when overspent', () => {
    expect(remainingBudget(100, 250)).toBe(0);
  });

  it('treats invalid input as zero', () => {
    expect(remainingBudget(NaN, 10)).toBe(0);
    expect(remainingBudget(100, NaN)).toBe(100);
  });
});

describe('budgetUsedFraction', () => {
  it('reports the consumed share', () => {
    expect(budgetUsedFraction(200, 50)).toBe(0.25);
  });

  it('clamps at 1 when overspent', () => {
    expect(budgetUsedFraction(100, 300)).toBe(1);
  });

  it('does not divide by zero', () => {
    expect(budgetUsedFraction(0, 50)).toBe(0);
  });
});

describe('canCampaignServe', () => {
  const base = { isActive: true, walletBalance: 500, dailyBudget: 200, spentToday: 0 };

  it('serves when active, funded, and under budget', () => {
    expect(canCampaignServe(base)).toBe(true);
  });

  it('does not serve when paused', () => {
    expect(canCampaignServe({ ...base, isActive: false })).toBe(false);
  });

  it('does not serve on an empty wallet', () => {
    expect(canCampaignServe({ ...base, walletBalance: 0 })).toBe(false);
  });

  it('does not serve once the daily budget is exhausted', () => {
    expect(canCampaignServe({ ...base, spentToday: 200 })).toBe(false);
  });
});
