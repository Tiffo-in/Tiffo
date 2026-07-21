const Delivery = require('../models/Delivery');
const logger = require('../utils/logger');

const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
// JS Date.getDay() (0=Sun) → day name.
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Days a subscription can be delivered on: the intersection of the partner's
 * working days and the tiffin's availability days. Shared by generation and
 * skip make-up scheduling so they never disagree.
 */
const getAvailableDays = (partner, tiffin) => {
  const workingDays = partner.businessHours?.workingDays?.map((d) => d.toLowerCase()) || ALL_DAYS;
  const tiffinDays = tiffin.availability?.days?.map((d) => d.toLowerCase()) || workingDays;
  return workingDays.filter((d) => tiffinDays.includes(d));
};

/** The next date strictly after `date` that falls on one of `availableDays` (date-only). */
const nextAvailableDateAfter = (date, availableDays) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i++) {
    d.setDate(d.getDate() + 1);
    if (availableDays.includes(DAY_NAMES[d.getDay()])) return new Date(d);
  }
  return null; // no available day within two weeks — partner has no working days
};

/**
 * Generate Delivery records for a newly activated subscription.
 * Handles skipping non-working days for the partner and tiffin.
 */
const generateDeliveriesForSubscription = async (subscription, session = null) => {
  try {
    const tiffin = subscription.tiffin;
    const partner = subscription.partner;

    if (!tiffin || !partner) {
      logger.error(
        `generateDeliveries: missing populated tiffin or partner for sub ${subscription._id}`,
      );
      return { success: false, message: 'Populated tiffin and partner required' };
    }

    const availableDays = getAvailableDays(partner, tiffin);

    const deliveriesToCreate = [];
    let currentDate = new Date(subscription.startDate);
    const endDate = new Date(subscription.endDate);

    // Strip time to compare purely by date
    currentDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    while (currentDate <= endDate) {
      if (availableDays.includes(DAY_NAMES[currentDate.getDay()])) {
        deliveriesToCreate.push({
          subscription: subscription._id,
          partner: partner._id._id || partner._id, // Handle populated docs
          user: subscription.user._id || subscription.user,
          deliveryDate: new Date(currentDate),
          mealType: tiffin.mealType,
          deliveryTime: subscription.deliveryTime,
          status: 'scheduled',
          deliveryAddress: subscription.deliveryAddress,
          scheduledAt: new Date(),
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (deliveriesToCreate.length > 0) {
      await Delivery.insertMany(deliveriesToCreate, session ? { session } : {});
      logger.info(
        `Generated ${deliveriesToCreate.length} deliveries for subscription ${subscription._id}`,
      );
    } else {
      logger.warn(
        `No deliveries generated for subscription ${subscription._id}. Check working days/tiffin days.`,
      );
    }

    return { success: true, count: deliveriesToCreate.length };
  } catch (error) {
    logger.error(`Error generating deliveries: ${error.message}`, { stack: error.stack });
    return { success: false, message: error.message };
  }
};

module.exports = {
  generateDeliveriesForSubscription,
  getAvailableDays,
  nextAvailableDateAfter,
  ALL_DAYS,
  DAY_NAMES,
};
