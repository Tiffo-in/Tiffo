const Subscription = require('../models/Subscription');
const Tiffin = require('../models/Tiffin');

// A subscription occupies one of a tiffin's kitchen slots while it is running
// (active or paused) and has not yet passed its end date. Expired-but-not-yet-
// swept subscriptions therefore free their slot automatically, so the count
// never drifts even though there is no expiry sweep transitioning them to
// 'completed'.
const OCCUPYING_STATUSES = ['active', 'paused'];

const resolveId = (tiffin) => (tiffin && tiffin._id ? tiffin._id : tiffin);

/** Count subscriptions currently holding a slot on this tiffin. */
const countOccupyingSubscriptions = (tiffinId, session) =>
  Subscription.countDocuments({
    tiffin: tiffinId,
    status: { $in: OCCUPYING_STATUSES },
    endDate: { $gte: new Date() },
  }).session(session || null);

/**
 * Throw 409 if activating one more subscription would exceed the tiffin's
 * `availability.maxOrders` cap. A cap of 0 / null means uncapped. Callers pass
 * `skip: true` for an idempotent re-activation (the subscription already holds
 * its slot) so a webhook re-firing after the client already verified never
 * false-trips the limit.
 */
async function assertCapacityForActivation(tiffin, { skip = false, session } = {}) {
  if (skip) return;
  const max = tiffin && tiffin.availability && tiffin.availability.maxOrders;
  if (!max || max <= 0) return; // uncapped, or tiffin not populated (nothing to enforce)

  const current = await countOccupyingSubscriptions(resolveId(tiffin), session);
  if (current >= max) {
    const error = new Error('This tiffin has reached its maximum number of active orders');
    error.status = 409;
    throw error;
  }
}

/**
 * Recompute and persist `availability.currentOrders` from the live slot count,
 * keeping the denormalized display counter accurate without ever drifting.
 */
async function syncCurrentOrders(tiffin, session) {
  const tiffinId = resolveId(tiffin);
  if (!tiffinId) return 0;
  const current = await countOccupyingSubscriptions(tiffinId, session);
  await Tiffin.updateOne(
    { _id: tiffinId },
    { $set: { 'availability.currentOrders': current } },
    session ? { session } : {},
  );
  return current;
}

module.exports = {
  OCCUPYING_STATUSES,
  countOccupyingSubscriptions,
  assertCapacityForActivation,
  syncCurrentOrders,
};
