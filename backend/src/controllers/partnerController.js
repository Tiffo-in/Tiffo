const Subscription = require('../models/Subscription');
const Delivery = require('../models/Delivery');

const Partner = require('../models/Partner');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const PartnerAnalytics = require('../models/PartnerAnalytics');
const logger = require('../utils/logger');

/**
 * Helper: resolve the Partner document for the authenticated user.
 * Throws a 404 response if no partner profile exists.
 */
const resolvePartner = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    res.status(404).json({ success: false, message: 'Partner profile not found' });
    return null;
  }
  return partner;
};

// Get all customers for a partner
exports.getPartnerCustomers = async (req, res) => {
  try {
    const partner = await resolvePartner(req, res);
    if (!partner) return;

    const subscriptions = await Subscription.find({
      partner: partner._id, // Bug 1 fix
      status: 'active',
    })
      .populate('user', 'name email phone')
      .populate('tiffin', 'title') // Bug 6 fix: 'title' not 'name'
      .select('plan startDate endDate deliveryTime user tiffin');

    const customers = subscriptions.map((sub) => ({
      id: sub.user._id,
      name: sub.user.name,
      email: sub.user.email,
      phone: sub.user.phone,
      plan: sub.plan,
      tiffin: sub.tiffin?.title, // Bug 6 fix: .title not .name
      startDate: sub.startDate,
      endDate: sub.endDate,
      deliveryTime: sub.deliveryTime,
      subscriptionId: sub._id,
    }));

    res.json({ success: true, data: customers });
  } catch (error) {
    logger.error('getPartnerCustomers error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get customer delivery calendar
exports.getCustomerCalendar = async (req, res) => {
  try {
    const partner = await resolvePartner(req, res);
    if (!partner) return;

    const { customerId } = req.params;
    const { month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const deliveries = await Delivery.find({
      partner: partner._id, // Bug 1 fix
      user: customerId,
      deliveryDate: {
        $gte: startDate,
        $lte: endDate,
      },
    }).select('deliveryDate status mealType _id');

    const calendar = {};
    deliveries.forEach((delivery) => {
      const dateKey = delivery.deliveryDate.toISOString().split('T')[0];
      if (!calendar[dateKey]) {
        calendar[dateKey] = {};
      }
      calendar[dateKey][delivery.mealType] = {
        status: delivery.status,
        id: delivery._id,
      };
    });

    res.json({ success: true, data: calendar });
  } catch (error) {
    logger.error('getCustomerCalendar error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get customer subscription details
exports.getCustomerSubscription = async (req, res) => {
  try {
    const partner = await resolvePartner(req, res);
    if (!partner) return;

    const subscription = await Subscription.findOne({
      partner: partner._id, // Bug 1 fix
      user: req.params.customerId,
      status: 'active',
    })
      .populate('user', 'name email phone')
      .populate('tiffin', 'title price description slug');

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    res.json({ success: true, data: subscription });
  } catch (error) {
    logger.error('getCustomerSubscription error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get partner profile
exports.getPartnerProfile = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id }).populate('user', 'name email');

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner profile not found' });
    }

    res.json({ success: true, data: partner });
  } catch (error) {
    logger.error('getPartnerProfile error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update partner profile
exports.updatePartnerProfile = async (req, res) => {
  try {
    const { businessName, description, address, contact, businessHours } = req.body;

    let partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      partner = new Partner({ user: req.user.id, businessName });
    }

    if (businessName !== undefined) partner.businessName = businessName;
    if (description !== undefined) partner.description = description;
    if (address !== undefined) partner.address = address;
    if (contact !== undefined) partner.contact = contact;
    if (businessHours !== undefined) partner.businessHours = businessHours;

    await partner.save();

    res.json({ success: true, data: partner });
  } catch (error) {
    logger.error('updatePartnerProfile error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get today's orders
exports.getTodayOrders = async (req, res) => {
  try {
    const partner = await resolvePartner(req, res);
    if (!partner) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const deliveries = await Delivery.find({
      partner: partner._id, // Bug 1 fix
      deliveryDate: {
        $gte: today,
        $lt: tomorrow,
      },
    })
      .populate('user', 'name phone')
      .populate('subscription', 'deliveryAddress plan')
      .sort({ deliveryTime: 1 });

    const orders = deliveries.map((delivery) => ({
      id: delivery._id,
      customerName: delivery.user.name,
      phone: delivery.user.phone,
      address: delivery.subscription.deliveryAddress,
      mealType: delivery.mealType,
      deliveryTime: delivery.deliveryTime,
      status: delivery.status,
      plan: delivery.subscription.plan,
    }));

    res.json({ success: true, data: orders });
  } catch (error) {
    logger.error('getTodayOrders error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get earnings data
// Bug 5 fix: changed paymentDate → transactionDate and status 'paid' → 'success'
exports.getEarnings = async (req, res) => {
  try {
    const partner = await resolvePartner(req, res);
    if (!partner) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

    const [earningsStats] = await Payment.aggregate([
      {
        $match: {
          partner: partner._id,
          status: 'success',
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$amount' },
          todayEarnings: {
            $sum: {
              $cond: [{ $gte: ['$transactionDate', today] }, '$amount', 0],
            },
          },
          yesterdayEarnings: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$transactionDate', yesterday] },
                    { $lt: ['$transactionDate', today] },
                  ],
                },
                '$amount',
                0,
              ],
            },
          },
          thisWeekEarnings: {
            $sum: {
              $cond: [{ $gte: ['$transactionDate', startOfWeek] }, '$amount', 0],
            },
          },
          lastWeekEarnings: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$transactionDate', startOfLastWeek] },
                    { $lt: ['$transactionDate', startOfWeek] },
                  ],
                },
                '$amount',
                0,
              ],
            },
          },
          thisMonthEarnings: {
            $sum: {
              $cond: [{ $gte: ['$transactionDate', startOfMonth] }, '$amount', 0],
            },
          },
          lastMonthEarnings: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$transactionDate', startOfLastMonth] },
                    { $lte: ['$transactionDate', endOfLastMonth] },
                  ],
                },
                '$amount',
                0,
              ],
            },
          },
        },
      },
    ]);

    const stats = earningsStats || {
      todayEarnings: 0,
      yesterdayEarnings: 0,
      thisWeekEarnings: 0,
      lastWeekEarnings: 0,
      thisMonthEarnings: 0,
      lastMonthEarnings: 0,
      totalEarnings: 0,
    };

    const recentPayments = await Payment.find({
      partner: partner._id,
    })
      .populate('user', 'name')
      .populate('subscription', 'plan')
      .sort({ transactionDate: -1 })
      .limit(10);

    const getChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const earnings = {
      today: stats.todayEarnings,
      thisWeek: stats.thisWeekEarnings,
      thisMonth: stats.thisMonthEarnings,
      total: stats.totalEarnings,
      todayChange: getChange(stats.todayEarnings, stats.yesterdayEarnings),
      weekChange: getChange(stats.thisWeekEarnings, stats.lastWeekEarnings),
      monthChange: getChange(stats.thisMonthEarnings, stats.lastMonthEarnings),
    };

    const payments = recentPayments.map((payment) => ({
      id: payment._id,
      customerName: payment.user?.name,
      amount: payment.amount,
      plan: payment.subscription?.plan,
      paymentDate: payment.transactionDate,
      status: payment.status,
      method: payment.paymentMethod,
    }));

    res.json({ success: true, data: { earnings, payments } });
  } catch (error) {
    logger.error('getEarnings error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get customer details with remaining tiffins, payments, and feedback
exports.getCustomerDetails = async (req, res) => {
  try {
    const partner = await resolvePartner(req, res);
    if (!partner) return;

    const { customerId } = req.params;

    // Get customer subscription
    const subscription = await Subscription.findOne({
      partner: partner._id, // Bug 1 fix
      user: customerId,
      status: 'active',
    })
      .populate('user', 'name email phone')
      .populate('tiffin', 'title price description slug');

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Calculate remaining tiffins
    const today = new Date();
    const endDate = new Date(subscription.endDate);
    const remainingDays = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

    // Get payment history
    const payments = await Payment.find({
      subscription: subscription._id,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get reviews/feedback
    const reviews = await Review.find({
      partner: partner._id, // Bug 1 fix
      user: customerId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get delivery status for current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const deliveries = await Delivery.find({
      partner: partner._id, // Bug 1 fix
      user: customerId,
      deliveryDate: { $gte: startOfMonth },
    });

    const deliveredCount = deliveries.filter((d) => d.status === 'delivered').length;
    const totalScheduled = deliveries.length;

    const customerDetails = {
      customer: subscription.user,
      subscription: {
        id: subscription._id,
        tiffin: subscription.tiffin,
        plan: subscription.plan,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        remainingDays,
        deliveryTime: subscription.deliveryTime,
        deliveryAddress: subscription.deliveryAddress,
        totalAmount: subscription.totalAmount,
        paidAmount: subscription.paidAmount,
        paymentStatus: subscription.paymentStatus,
      },
      deliveryStats: {
        delivered: deliveredCount,
        total: totalScheduled,
        percentage: totalScheduled > 0 ? Math.round((deliveredCount / totalScheduled) * 100) : 0,
      },
      payments: payments.map((p) => ({
        id: p._id,
        amount: p.amount,
        status: p.status,
        method: p.paymentMethod,
        date: p.transactionDate, // Bug 5 fix
      })),
      reviews: reviews.map((r) => ({
        id: r._id,
        rating: r.rating,
        comment: r.comment,
        categories: r.categories,
        date: r.createdAt,
      })),
    };

    res.json({ success: true, data: customerDetails });
  } catch (error) {
    logger.error('getCustomerDetails error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const partner = await resolvePartner(req, res);
    if (!partner) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalSubscriptions = await Subscription.countDocuments({ partner: partner._id });
    const todaySubscriptions = await Subscription.countDocuments({
      partner: partner._id,
      createdAt: { $gte: today },
    });

    // Fetch visits from PartnerAnalytics
    const analyticsRecords = await PartnerAnalytics.find({ partner: partner._id });
    const totalVisits = analyticsRecords.reduce((sum, record) => sum + record.visits, 0);
    const todayAnalytics = analyticsRecords.find(
      (record) => record.date.getTime() === today.getTime(),
    );
    const todayVisits = todayAnalytics ? todayAnalytics.visits : 0;

    // Conversion rate
    const conversionRate =
      totalVisits > 0 ? Math.round((totalSubscriptions / totalVisits) * 100) : 0;

    // Last 7 days of real subscription data
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const dailyData = await Subscription.aggregate([
      { $match: { partner: partner._id, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          subscriptions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Merge visits into dailyData
    const last7DaysVisits = analyticsRecords.filter((record) => record.date >= sevenDaysAgo);

    // Convert arrays into lookup objects by date string for O(1) access
    const visitsLookup = last7DaysVisits.reduce((acc, record) => {
      const dateStr = record.date.toISOString().split('T')[0];
      if (!acc[dateStr]) {
        acc[dateStr] = record;
      }
      return acc;
    }, {});

    const subscriptionsLookup = dailyData.reduce((acc, record) => {
      acc[record._id] = record;
      return acc;
    }, {});

    // Generate an array of the last 7 dates as strings (YYYY-MM-DD)
    const chartData = [];
    for (let i = 0; i <= 6; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      const visitRecord = visitsLookup[dateStr];
      const subRecord = subscriptionsLookup[dateStr];

      chartData.push({
        date: dateStr,
        visits: visitRecord ? visitRecord.visits : 0,
        subscriptions: subRecord ? subRecord.subscriptions : 0,
      });
    }

    res.json({
      success: true,
      data: {
        totalSubscriptions,
        todaySubscriptions,
        totalVisits,
        todayVisits,
        conversionRate,
        chartData,
      },
    });
  } catch (error) {
    logger.error('getAnalytics error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get partner dashboard stats (single endpoint for all 4 stat cards)
exports.getPartnerStats = async (req, res) => {
  try {
    const partner = await resolvePartner(req, res);
    if (!partner) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    const startOfLastMonth = new Date(todayStart.getFullYear(), todayStart.getMonth() - 1, 1);
    const endOfLastMonth = new Date(todayStart.getFullYear(), todayStart.getMonth(), 0, 23, 59, 59);

    // ⚡ Bolt: Group independent database queries with Promise.all and replace map/reduce with aggregate
    const [
      activeSubscriptions,
      todayDeliveries,
      pendingDeliveries,
      monthlyEarningsAgg,
      lastMonthEarningsAgg,
      reviewStatsAgg,
    ] = await Promise.all([
      // 1. Active subscriptions count
      Subscription.countDocuments({
        partner: partner._id,
        status: 'active',
      }),

      // 2. Today's deliveries
      Delivery.countDocuments({
        partner: partner._id,
        deliveryDate: { $gte: todayStart, $lte: todayEnd },
      }),

      Delivery.countDocuments({
        partner: partner._id,
        deliveryDate: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ['scheduled', 'preparing', 'out_for_delivery'] },
      }),

      // 3. Monthly earnings — sum totalAmount of paid subscriptions active this month
      Subscription.aggregate([
        {
          $match: {
            partner: partner._id,
            paymentStatus: { $in: ['paid', 'captured'] },
            createdAt: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),

      // Previous month for % change
      Subscription.aggregate([
        {
          $match: {
            partner: partner._id,
            paymentStatus: { $in: ['paid', 'captured'] },
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),

      // 4. Average rating + review count
      Review.aggregate([
        { $match: { partner: partner._id } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            reviewCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const monthlyEarnings = monthlyEarningsAgg[0]?.total || 0;
    const lastMonthEarnings = lastMonthEarningsAgg[0]?.total || 0;

    const earningsChange =
      lastMonthEarnings > 0
        ? Math.round(((monthlyEarnings - lastMonthEarnings) / lastMonthEarnings) * 100)
        : null;

    const reviewCount = reviewStatsAgg[0]?.reviewCount || 0;
    const avgRating = reviewStatsAgg[0]?.avgRating ? reviewStatsAgg[0].avgRating.toFixed(1) : null;

    res.json({
      success: true,
      data: {
        activeSubscriptions,
        todayDeliveries,
        pendingDeliveries,
        monthlyEarnings,
        earningsChange,
        avgRating,
        reviewCount,
      },
    });
  } catch (error) {
    logger.error('getPartnerStats error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
