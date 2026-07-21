const Subscription = require('../models/Subscription');
const subscriptionService = require('./subscriptionService');
const { emitNotification } = require('./socketService');
const { sendRenewalReminderEmail } = require('./emailService');
const { DAY_MS } = require('../utils/dateIST');
const logger = require('../utils/logger');

// Remind this many days before a plan ends.
const REMINDER_WINDOW_DAYS = 2;

const httpError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

/**
 * Create a fresh subscription continuing from where an existing one ends,
 * reusing the same tiffin/plan/address. Returns the new (pending-payment)
 * subscription — the caller drives the normal payment flow from there.
 * Idempotent: a subscription can only be renewed once.
 */
exports.renewSubscription = async (subscriptionId, userId) => {
  const source = await Subscription.findOne({ _id: subscriptionId, user: userId });
  if (!source) throw httpError('Subscription not found', 404);
  if (source.renewedToSubscription) {
    throw httpError('This subscription has already been renewed', 409);
  }

  // Start the new plan the day after the current one ends (never in the past).
  const startDate = new Date(Math.max(new Date(source.endDate).getTime() + DAY_MS, Date.now()));

  const renewed = await subscriptionService.createNewSubscription(userId, {
    tiffinId: source.tiffin,
    plan: source.plan,
    startDate,
    deliveryAddress: source.deliveryAddress,
    deliveryTime: source.deliveryTime,
    specialInstructions: source.specialInstructions,
  });

  source.renewedToSubscription = renewed._id;
  await source.save();

  return renewed;
};

/**
 * Notify customers whose active plans end within the reminder window and who
 * haven't already been reminded. Idempotent via renewalReminderSentAt, so it's
 * safe to run from in-process cron and/or an external scheduler on multiple
 * instances. Returns how many reminders were sent.
 */
exports.sendRenewalReminders = async ({ withinDays = REMINDER_WINDOW_DAYS } = {}) => {
  const now = Date.now();
  const windowEnd = new Date(now + withinDays * DAY_MS);

  const due = await Subscription.find({
    status: 'active',
    renewalReminderSentAt: null,
    renewedToSubscription: null,
    endDate: { $gte: new Date(now), $lte: windowEnd },
  })
    .populate('tiffin', 'title')
    .populate('user', 'name email');

  let sent = 0;
  for (const sub of due) {
    try {
      // Mark first so a send failure can't cause an infinite reminder loop.
      sub.renewalReminderSentAt = new Date();
      await sub.save();

      if (sub.user?.email) {
        await sendRenewalReminderEmail(sub.user, sub).catch((e) =>
          logger.error(`Renewal reminder email failed for ${sub._id}: ${e.message}`),
        );
      }
      emitNotification(sub.user?._id || sub.user, {
        type: 'renewal',
        subscriptionId: sub._id,
        title: 'Your tiffin plan is ending soon',
        body: `Renew "${sub.tiffin?.title || 'your plan'}" so your meals keep coming.`,
      });
      sent += 1;
    } catch (e) {
      logger.error(`sendRenewalReminders failed for ${sub._id}: ${e.message}`);
    }
  }

  if (sent > 0) logger.info(`Renewal reminders sent: ${sent}`);
  return { sent };
};

exports.REMINDER_WINDOW_DAYS = REMINDER_WINDOW_DAYS;
