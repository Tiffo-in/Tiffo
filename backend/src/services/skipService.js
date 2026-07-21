const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');
const Subscription = require('../models/Subscription');
const { getAvailableDays, nextAvailableDateAfter } = require('./deliveryService');
const { istDayBounds, istMonthStart } = require('../utils/dateIST');

// A customer may skip at most this many delivered days per IST calendar month
// per subscription (prevents abuse of the free make-up-day policy).
const MAX_SKIPS_PER_MONTH = 4;
// Skips must happen before 8 PM IST the day before delivery (kitchen cutoff).
const SKIP_CUTOFF_BEFORE_DAY_MS = 4 * 60 * 60 * 1000; // 20:00 IST prev day = dayStart − 4h

const httpError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const countSkipsThisMonth = (subscriptionId, session) =>
  Delivery.countDocuments({
    subscription: subscriptionId,
    status: 'skipped',
    skippedAt: { $gte: istMonthStart() },
  }).session(session || null);

/**
 * Skip one scheduled delivery. Policy: extend the plan by one make-up day
 * (no refund/credit accounting) — the customer never loses a meal.
 * Runs in a transaction so the skip, the make-up delivery, and the endDate
 * bump are all-or-nothing.
 */
exports.skipDelivery = async (deliveryId, userId) => {
  const delivery = await Delivery.findOne({ _id: deliveryId, user: userId });
  if (!delivery) throw httpError('Delivery not found', 404);
  if (delivery.status !== 'scheduled') {
    throw httpError('Only scheduled deliveries can be skipped', 400);
  }

  // Cutoff: before 8 PM IST the day before the delivery.
  const { start: deliveryDayStart } = istDayBounds(delivery.deliveryDate);
  const cutoff = new Date(deliveryDayStart.getTime() - SKIP_CUTOFF_BEFORE_DAY_MS);
  if (Date.now() >= cutoff.getTime()) {
    throw httpError('Too late to skip — the cutoff for this delivery has passed', 400);
  }

  const usedBefore = await countSkipsThisMonth(delivery.subscription);
  if (usedBefore >= MAX_SKIPS_PER_MONTH) {
    throw httpError(`Skip limit reached (${MAX_SKIPS_PER_MONTH} per month)`, 400);
  }

  const subscription = await Subscription.findById(delivery.subscription)
    .populate('tiffin', 'mealType availability')
    .populate('partner', 'businessHours');
  if (!subscription) throw httpError('Subscription not found', 404);

  const availableDays = getAvailableDays(subscription.partner, subscription.tiffin);
  const makeupDate = nextAvailableDateAfter(subscription.endDate, availableDays);
  if (!makeupDate) throw httpError('Cannot schedule a make-up day for this plan', 409);

  const session = await mongoose.startSession();
  try {
    let makeup;
    await session.withTransaction(async () => {
      delivery.status = 'skipped';
      delivery.skippedAt = new Date();
      await delivery.save({ session });

      [makeup] = await Delivery.create(
        [
          {
            subscription: subscription._id,
            partner: delivery.partner,
            user: delivery.user,
            deliveryDate: makeupDate,
            mealType: delivery.mealType,
            deliveryTime: delivery.deliveryTime,
            status: 'scheduled',
            deliveryAddress: delivery.deliveryAddress,
            makeupForDelivery: delivery._id,
            scheduledAt: new Date(),
          },
        ],
        { session },
      );

      const endOfMakeupDay = istDayBounds(makeupDate).end;
      subscription.endDate = endOfMakeupDay;
      await subscription.save({ session });
    });

    return {
      delivery,
      makeupDelivery: makeup,
      skipsUsed: usedBefore + 1,
      skipsRemaining: MAX_SKIPS_PER_MONTH - (usedBefore + 1),
    };
  } finally {
    session.endSession();
  }
};

/**
 * Reverse a skip before its cutoff: delete the make-up delivery, restore the
 * original to scheduled, and roll the subscription endDate back.
 */
exports.unskipDelivery = async (deliveryId, userId) => {
  const delivery = await Delivery.findOne({ _id: deliveryId, user: userId });
  if (!delivery) throw httpError('Delivery not found', 404);
  if (delivery.status !== 'skipped') {
    throw httpError('Only skipped deliveries can be un-skipped', 400);
  }

  const { start: deliveryDayStart } = istDayBounds(delivery.deliveryDate);
  const cutoff = new Date(deliveryDayStart.getTime() - SKIP_CUTOFF_BEFORE_DAY_MS);
  if (Date.now() >= cutoff.getTime()) {
    throw httpError('Too late to un-skip — the cutoff for this delivery has passed', 400);
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const makeup = await Delivery.findOne({
        makeupForDelivery: delivery._id,
        status: 'scheduled',
      }).session(session);

      if (makeup) {
        await Delivery.deleteOne({ _id: makeup._id }).session(session);
        // Roll endDate back to the latest remaining non-cancelled delivery.
        const [latest] = await Delivery.find({
          subscription: delivery.subscription,
          status: { $ne: 'cancelled' },
          _id: { $ne: makeup._id },
        })
          .sort({ deliveryDate: -1 })
          .limit(1)
          .session(session);
        if (latest) {
          await Subscription.updateOne(
            { _id: delivery.subscription },
            { endDate: istDayBounds(latest.deliveryDate).end },
            { session },
          );
        }
      }

      delivery.status = 'scheduled';
      delivery.skippedAt = null;
      await delivery.save({ session });
    });

    const skipsUsed = await countSkipsThisMonth(delivery.subscription);
    return { delivery, skipsUsed, skipsRemaining: MAX_SKIPS_PER_MONTH - skipsUsed };
  } finally {
    session.endSession();
  }
};

exports.MAX_SKIPS_PER_MONTH = MAX_SKIPS_PER_MONTH;
