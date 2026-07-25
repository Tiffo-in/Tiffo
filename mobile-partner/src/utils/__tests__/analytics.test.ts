import {
  barFraction,
  chartMax,
  conversionRate,
  dayLabel,
  isEmptyDataset,
  normalizeSummary,
} from '../analytics';

describe('normalizeSummary', () => {
  it('maps a well-formed payload', () => {
    const s = normalizeSummary({
      totalSubscriptions: 10,
      todaySubscriptions: 2,
      totalVisits: 100,
      todayVisits: 8,
      conversionRate: 10,
      chartData: [{ date: '2026-07-20', visits: 5, subscriptions: 1 }],
    });
    expect(s.totalSubscriptions).toBe(10);
    expect(s.chartData).toHaveLength(1);
    expect(s.chartData[0]).toEqual({ date: '2026-07-20', visits: 5, subscriptions: 1 });
  });

  it('returns an empty summary for null or non-object input', () => {
    expect(normalizeSummary(null).chartData).toEqual([]);
    expect(normalizeSummary('nope').totalVisits).toBe(0);
  });

  it('coerces missing and negative counts to zero rather than NaN', () => {
    const s = normalizeSummary({ totalVisits: undefined, conversionRate: -5 });
    expect(s.totalVisits).toBe(0);
    expect(s.conversionRate).toBe(0);
  });

  it('survives malformed chart points', () => {
    const s = normalizeSummary({ chartData: [null, { visits: 'x' }] });
    expect(s.chartData).toHaveLength(2);
    expect(s.chartData[0]).toEqual({ date: '', visits: 0, subscriptions: 0 });
    expect(s.chartData[1].visits).toBe(0);
  });

  it('ignores a chartData that is not an array', () => {
    expect(normalizeSummary({ chartData: 'nope' }).chartData).toEqual([]);
  });
});

describe('chartMax', () => {
  it('takes the largest value across both series', () => {
    expect(
      chartMax([
        { date: 'a', visits: 4, subscriptions: 9 },
        { date: 'b', visits: 7, subscriptions: 2 },
      ]),
    ).toBe(9);
  });

  it('returns 1 for an all-zero dataset so callers can divide safely', () => {
    expect(chartMax([{ date: 'a', visits: 0, subscriptions: 0 }])).toBe(1);
    expect(chartMax([])).toBe(1);
  });
});

describe('barFraction', () => {
  it('scales a value against the ceiling', () => {
    expect(barFraction(5, 10)).toBe(0.5);
    expect(barFraction(10, 10)).toBe(1);
  });

  it('clamps above the ceiling instead of overflowing the chart', () => {
    expect(barFraction(20, 10)).toBe(1);
  });

  it('floors at zero for empty or invalid values', () => {
    expect(barFraction(0, 10)).toBe(0);
    expect(barFraction(-4, 10)).toBe(0);
    expect(barFraction(NaN, 10)).toBe(0);
  });

  it('does not divide by zero', () => {
    expect(barFraction(5, 0)).toBe(1);
  });
});

describe('dayLabel', () => {
  it('returns a short weekday name', () => {
    expect(dayLabel('2026-07-25')).toBe('Sat');
  });

  it('returns empty string for missing or unparseable dates', () => {
    expect(dayLabel('')).toBe('');
    expect(dayLabel('not-a-date')).toBe('');
  });
});

describe('conversionRate', () => {
  it('computes a whole-percent rate', () => {
    expect(conversionRate(10, 100)).toBe(10);
    expect(conversionRate(1, 3)).toBe(33);
  });

  it('returns zero when there are no visits, rather than dividing by zero', () => {
    expect(conversionRate(5, 0)).toBe(0);
  });
});

describe('isEmptyDataset', () => {
  it('detects an all-zero week so the UI can show an empty state', () => {
    expect(isEmptyDataset([{ date: 'a', visits: 0, subscriptions: 0 }])).toBe(true);
  });

  it('is false when any value is present', () => {
    expect(isEmptyDataset([{ date: 'a', visits: 0, subscriptions: 3 }])).toBe(false);
  });
});
