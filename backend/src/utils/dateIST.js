/**
 * India Standard Time (UTC+5:30) date helpers.
 *
 * Deliveries are date-based and the business operates entirely in IST, so all
 * "today" / cutoff / window math must be computed in IST regardless of the
 * server's timezone (Cloud Run runs in UTC). Never derive these from a
 * client-supplied date.
 */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** UTC instants bounding the IST calendar day that `now` falls in. */
function istDayBounds(now = new Date()) {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  const startUtcMs =
    Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - IST_OFFSET_MS;
  return { start: new Date(startUtcMs), end: new Date(startUtcMs + DAY_MS - 1) };
}

/** Bounds for the IST day `days` days from the day `now` is in (days may be negative). */
function istDayBoundsOffset(days, now = new Date()) {
  const base = istDayBounds(now);
  return {
    start: new Date(base.start.getTime() + days * DAY_MS),
    end: new Date(base.end.getTime() + days * DAY_MS),
  };
}

/** Start of the IST calendar month `now` falls in, as a UTC instant. */
function istMonthStart(now = new Date()) {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), 1) - IST_OFFSET_MS);
}

module.exports = { IST_OFFSET_MS, DAY_MS, istDayBounds, istDayBoundsOffset, istMonthStart };
