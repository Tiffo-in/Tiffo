const Subscription = require('../models/Subscription');
const Delivery = require('../models/Delivery');
const Tiffin = require('../models/Tiffin');

exports.fetchUserSubscriptions = async (userId) => {
  const subscriptions = await Subscription.find({
    user: userId,
    status: { $in: ['active', 'paused'] },
  })
    .populate('tiffin', 'title price cuisine images slug')
    .populate('partner', 'businessName')
    .sort({ createdAt: -1 });

  const subIds = subscriptions.map((s) => s._id);

  // ⚡ Bolt Optimization: Replace N+1 queries with a single aggregation
  const deliveryStats = await Delivery.aggregate([
    { $match: { subscription: { $in: subIds } } },
    {
      $group: {
        _id: '$subscription',
        totalDeliveries: { $sum: 1 },
        deliveredCount: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
        },
        remainingDeliveries: {
          $sum: {
            $cond: [{ $in: ['$status', ['scheduled', 'preparing', 'out_for_delivery']] }, 1, 0],
          },
        },
      },
    },
  ]);

  const statsMap = deliveryStats.reduce((acc, stat) => {
    acc[stat._id.toString()] = stat;
    return acc;
  }, {});

  return subscriptions.map((subscription) => {
    const stats = statsMap[subscription._id.toString()] || {
      totalDeliveries: 0,
      deliveredCount: 0,
      remainingDeliveries: 0,
    };
    return {
      ...subscription.toObject(),
      deliveryStats: {
        totalDeliveries: stats.totalDeliveries,
        deliveredCount: stats.deliveredCount,
        remainingDeliveries: stats.remainingDeliveries,
      },
    };
  });
};

exports.fetchSubscriptionDetails = async (subscriptionId, userId) => {
  const subscription = await Subscription.findOne({
    _id: subscriptionId,
    user: userId,
  })
    .populate('tiffin', 'title price cuisine images description slug')
    .populate('partner', 'businessName phone email');

  if (!subscription) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }

  const deliveries = await Delivery.find({ subscription: subscription._id }).sort({
    deliveryDate: -1,
  });

  const deliveryStats = {
    totalDeliveries: deliveries.length,
    deliveredCount: deliveries.filter((d) => d.status === 'delivered').length,
    pendingCount: deliveries.filter((d) =>
      ['scheduled', 'preparing', 'out_for_delivery'].includes(d.status),
    ).length,
    remainingDeliveries: deliveries.filter((d) =>
      ['scheduled', 'preparing', 'out_for_delivery'].includes(d.status),
    ).length,
  };

  return {
    subscription,
    deliveries,
    deliveryStats,
  };
};

exports.fetchOrderHistory = async (userId) => {
  const pastSubscriptions = await Subscription.find({
    user: userId,
    status: { $in: ['completed', 'cancelled'] },
  })
    .populate('tiffin', 'title price cuisine images slug')
    .populate('partner', 'businessName')
    .sort({ endDate: -1 });

  const subIds = pastSubscriptions.map((s) => s._id);

  // ⚡ Bolt Optimization: Replace N+1 queries with a single aggregation
  const deliveryStats = await Delivery.aggregate([
    { $match: { subscription: { $in: subIds }, status: 'delivered' } },
    {
      $group: {
        _id: '$subscription',
        deliveredCount: { $sum: 1 },
      },
    },
  ]);

  const statsMap = deliveryStats.reduce((acc, stat) => {
    acc[stat._id.toString()] = stat.deliveredCount;
    return acc;
  }, {});

  return pastSubscriptions.map((subscription) => {
    return {
      ...subscription.toObject(),
      deliveredCount: statsMap[subscription._id.toString()] || 0,
      totalAmount: subscription.totalAmount,
      duration: Math.ceil(
        (new Date(subscription.endDate) - new Date(subscription.startDate)) / (1000 * 60 * 60 * 24),
      ),
    };
  });
};

exports.pauseUserSubscription = async (subscriptionId, userId) => {
  const subscription = await Subscription.findOne({
    _id: subscriptionId,
    user: userId,
  });

  if (!subscription) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }

  if (subscription.status !== 'active') {
    const error = new Error('Only active subscriptions can be paused');
    error.status = 400;
    throw error;
  }

  subscription.status = 'paused';
  subscription.pausedDates.push(new Date());
  await subscription.save();

  return subscription;
};

exports.resumeUserSubscription = async (subscriptionId, userId) => {
  const subscription = await Subscription.findOne({
    _id: subscriptionId,
    user: userId,
  });

  if (!subscription) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }

  if (subscription.status !== 'paused') {
    const error = new Error('Only paused subscriptions can be resumed');
    error.status = 400;
    throw error;
  }

  subscription.status = 'active';
  await subscription.save();

  return subscription;
};

exports.fetchUserStats = async (userId) => {
  const activeSubscriptions = await Subscription.countDocuments({
    user: userId,
    status: { $in: ['active', 'paused'] },
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const userSubIds = await Subscription.find({ user: userId }).distinct('_id');

  const mealsThisMonth = await Delivery.countDocuments({
    subscription: { $in: userSubIds },
    status: 'delivered',
    deliveryDate: { $gte: startOfMonth, $lte: endOfMonth },
  });

  const paidSubs = await Subscription.find({
    user: userId,
    paymentStatus: { $in: ['paid', 'captured'] },
  }).select('totalAmount');

  const totalSpent = paidSubs.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  const completedOrders = await Subscription.countDocuments({
    user: userId,
    status: 'completed',
  });
  const loyaltyPoints = completedOrders * 10 + activeSubscriptions * 5;

  return {
    activeSubscriptions,
    mealsThisMonth,
    totalSpent,
    loyaltyPoints,
  };
};

exports.createNewSubscription = async (userId, data) => {
  const { tiffinId, plan, startDate, deliveryAddress, deliveryTime, specialInstructions } = data;

  if (!tiffinId || !plan || !startDate || !deliveryAddress || !deliveryTime) {
    const error = new Error(
      'Missing required fields: tiffinId, plan, startDate, deliveryAddress, deliveryTime',
    );
    error.status = 400;
    throw error;
  }

  const tiffin = await Tiffin.findById(tiffinId).populate('partner');
  if (!tiffin || !tiffin.isActive) {
    const error = new Error('Tiffin not found or inactive');
    error.status = 404;
    throw error;
  }

  const partner = tiffin.partner;
  if (!partner) {
    const error = new Error('Partner not found for this tiffin');
    error.status = 404;
    throw error;
  }

  const effective = tiffin.effectivePrice;
  let totalAmount, originalAmount, discountPercent, discountLabel;
  const start = new Date(startDate);
  let endDate;

  if (plan === 'daily') {
    totalAmount = effective.daily;
    originalAmount = effective.daily;
    discountPercent = 0;
    discountLabel = '';
    endDate = new Date(start);
    endDate.setDate(endDate.getDate() + 1);
  } else if (plan === 'weekly') {
    totalAmount = effective.weekly;
    originalAmount = effective.weeklyOriginal;
    discountPercent = effective.weeklyDiscountPercent;
    discountLabel =
      discountPercent > 0 ? tiffin.discount.label || `${discountPercent}% Weekly Discount` : '';
    endDate = new Date(start);
    endDate.setDate(endDate.getDate() + 7);
  } else if (plan === 'monthly') {
    totalAmount = effective.monthly;
    originalAmount = effective.monthlyOriginal;
    discountPercent = effective.monthlyDiscountPercent;
    discountLabel =
      discountPercent > 0 ? tiffin.discount.label || `${discountPercent}% Monthly Discount` : '';
    endDate = new Date(start);
    endDate.setDate(endDate.getDate() + 30);
  } else {
    const error = new Error('Invalid plan. Must be daily, weekly, or monthly');
    error.status = 400;
    throw error;
  }

  const GST_RATE = 5;
  const gstAmount = Math.round((totalAmount * GST_RATE) / 100);
  const grandTotal = totalAmount + gstAmount;

  const subscription = await Subscription.create({
    user: userId,
    partner: partner._id,
    tiffin: tiffin._id,
    plan,
    startDate: start,
    endDate,
    deliveryAddress,
    deliveryTime,
    specialInstructions: specialInstructions || '',
    totalAmount,
    originalAmount,
    discountPercent,
    discountLabel,
    gstRate: GST_RATE,
    gstAmount,
    grandTotal,
    status: 'active',
    paymentStatus: 'pending',
  });

  return subscription;
};
