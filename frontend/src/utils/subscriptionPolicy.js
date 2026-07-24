/**
 * Subscription self-service policy — kept in sync with the backend
 * (skipService.js: SKIP_CUTOFF_BEFORE_DAY_MS / MAX_SKIPS_PER_MONTH). The UI
 * only gates affordances with these; the server is the source of truth and
 * re-validates every request.
 */
export const SKIP_CUTOFF_HOURS = 4; // must skip before 8 PM IST the day before (dayStart − 4h)
export const MAX_SKIPS_PER_MONTH = 4;

/** True if a scheduled delivery is still before its skip cutoff. */
export const isBeforeSkipCutoff = (deliveryDate) => {
  const day = new Date(deliveryDate);
  day.setHours(0, 0, 0, 0);
  return Date.now() < day.getTime() - SKIP_CUTOFF_HOURS * 60 * 60 * 1000;
};
