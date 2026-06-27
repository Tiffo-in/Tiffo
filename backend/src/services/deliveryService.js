const Delivery = require('../models/Delivery');
const logger = require('../utils/logger');

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

    // Get working days of the partner
    // Default to all days if not specified
    const workingDays = partner.businessHours?.workingDays?.map((d) => d.toLowerCase()) || [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];

    // Get tiffin availability days
    const tiffinDays = tiffin.availability?.days?.map((d) => d.toLowerCase()) || workingDays;

    // Intersection of working days and tiffin days
    const availableDays = workingDays.filter((d) => tiffinDays.includes(d));

    const deliveriesToCreate = [];
    let currentDate = new Date(subscription.startDate);
    const endDate = new Date(subscription.endDate);

    // Strip time to compare purely by date
    currentDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Map JS getDay() to string day names
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    while (currentDate <= endDate) {
      const dayOfWeekName = dayNames[currentDate.getDay()];

      if (availableDays.includes(dayOfWeekName)) {
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

      // Move to next day
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
};
