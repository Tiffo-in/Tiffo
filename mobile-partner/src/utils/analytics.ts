// Chart data helpers for the partner analytics screen.
//
// Consumes GET /partner/analytics (backend/src/controllers/partnerController.js
// getAnalytics), which returns 7 days of { date, visits, subscriptions } plus
// totals and a server-computed conversion rate.
//
// The chart itself is rendered with plain Views rather than a native charting
// library: a 7-bar dual-series chart does not justify pulling in react-native-svg
// and a native rebuild. Keeping the math here makes it unit-testable regardless
// of how it is drawn.

export interface AnalyticsPoint {
  date: string; // YYYY-MM-DD
  visits: number;
  subscriptions: number;
}

export interface AnalyticsSummary {
  totalSubscriptions: number;
  todaySubscriptions: number;
  totalVisits: number;
  todayVisits: number;
  conversionRate: number;
  chartData: AnalyticsPoint[];
}

const EMPTY_SUMMARY: AnalyticsSummary = {
  totalSubscriptions: 0,
  todaySubscriptions: 0,
  totalVisits: 0,
  todayVisits: 0,
  conversionRate: 0,
  chartData: [],
};

function toCount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

/** Normalize the API payload, tolerating missing or malformed fields. */
export function normalizeSummary(raw: unknown): AnalyticsSummary {
  if (!raw || typeof raw !== 'object') return EMPTY_SUMMARY;
  const d = raw as Record<string, unknown>;
  const points = Array.isArray(d.chartData) ? d.chartData : [];

  return {
    totalSubscriptions: toCount(d.totalSubscriptions),
    todaySubscriptions: toCount(d.todaySubscriptions),
    totalVisits: toCount(d.totalVisits),
    todayVisits: toCount(d.todayVisits),
    conversionRate: toCount(d.conversionRate),
    chartData: points.map((p) => {
      const point = (p ?? {}) as Record<string, unknown>;
      return {
        date: typeof point.date === 'string' ? point.date : '',
        visits: toCount(point.visits),
        subscriptions: toCount(point.subscriptions),
      };
    }),
  };
}

/**
 * Largest value across both series — the bar chart's y-axis ceiling.
 * Returns 1 rather than 0 for an all-zero dataset so callers can divide safely.
 */
export function chartMax(points: AnalyticsPoint[]): number {
  const max = points.reduce((m, p) => Math.max(m, p.visits, p.subscriptions), 0);
  return max > 0 ? max : 1;
}

/** Bar height as a 0-1 fraction of the chart ceiling. */
export function barFraction(value: number, max: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const ceiling = max > 0 ? max : 1;
  return Math.min(1, value / ceiling);
}

/** Short weekday label (e.g. "Mon") for an ISO date, or '' if unparseable. */
export function dayLabel(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
}

/**
 * Conversion percentage from raw counts. The server already sends one; this is
 * for deriving a rate over an arbitrary window (e.g. the visible 7 days).
 */
export function conversionRate(subscriptions: number, visits: number): number {
  if (!visits || visits <= 0) return 0;
  return Math.round((subscriptions / visits) * 100);
}

/** True when there is nothing meaningful to plot. */
export function isEmptyDataset(points: AnalyticsPoint[]): boolean {
  return points.every((p) => p.visits === 0 && p.subscriptions === 0);
}
