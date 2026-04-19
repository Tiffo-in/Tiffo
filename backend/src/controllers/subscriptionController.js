const Subscription = require('../models/Subscription');
const Delivery = require('../models/Delivery');
const Tiffin = require('../models/Tiffin');
const Partner = require('../models/Partner');
const logger = require('../utils/logger');

// Get user subscriptions with delivery stats
const getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ 
      user: req.user.id,
      status: { $in: ['active', 'paused'] }
    })
      .populate('tiffin', 'title price cuisine images')
      .populate('partner', 'businessName')
      .sort({ createdAt: -1 });

    // Calculate delivery stats for each subscription
    const subscriptionsWithStats = await Promise.all(
      subscriptions.map(async (subscription) => {
        const totalDeliveries = await Delivery.countDocuments({
          subscription: subscription._id
        });
        
        const deliveredCount = await Delivery.countDocuments({
          subscription: subscription._id,
          status: 'delivered'
        });

        const remainingDeliveries = Math.max(0, getTotalExpectedDeliveries(subscription) - deliveredCount);

        return {
          ...subscription.toObject(),
          deliveryStats: {
            totalDeliveries,
            deliveredCount,
            remainingDeliveries
          }
        };
      })
    );

    res.json({
      success: true,
      data: subscriptionsWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single subscription with detailed delivery info
const getSubscriptionDetails = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.user.id
    })
      .populate('tiffin', 'title price cuisine images description')
      .populate('partner', 'businessName phone email');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const deliveries = await Delivery.find({ subscription: subscription._id })
      .sort({ deliveryDate: -1 });

    const deliveryStats = {
      totalDeliveries: deliveries.length,
      deliveredCount: deliveries.filter(d => d.status === 'delivered').length,
      pendingCount: deliveries.filter(d => ['scheduled', 'preparing', 'out_for_delivery'].includes(d.status)).length,
      remainingDeliveries: Math.max(0, getTotalExpectedDeliveries(subscription) - deliveries.filter(d => d.status === 'delivered').length)
    };

    res.json({
      success: true,
      data: {
        subscription,
        deliveries,
        deliveryStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to calculate expected deliveries
const getTotalExpectedDeliveries = (subscription) => {
  const start = new Date(subscription.startDate);
  const end = new Date(subscription.endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  switch (subscription.plan) {
    case 'daily':
      return diffDays;
    case 'weekly':
      return Math.ceil(diffDays / 7);
    case 'monthly':
      return Math.ceil(diffDays / 30);
    default:
      return diffDays;
  }
};

// Get user order history (past subscriptions)
const getOrderHistory = async (req, res) => {
  try {
    const pastSubscriptions = await Subscription.find({ 
      user: req.user.id,
      status: { $in: ['completed', 'cancelled'] }
    })
      .populate('tiffin', 'title price cuisine images')
      .populate('partner', 'businessName')
      .sort({ endDate: -1 });

    const historyWithStats = await Promise.all(
      pastSubscriptions.map(async (subscription) => {
        const deliveredCount = await Delivery.countDocuments({
          subscription: subscription._id,
          status: 'delivered'
        });

        return {
          ...subscription.toObject(),
          deliveredCount,
          totalAmount: subscription.totalAmount,
          duration: Math.ceil((new Date(subscription.endDate) - new Date(subscription.startDate)) / (1000 * 60 * 60 * 24))
        };
      })
    );

    res.json({
      success: true,
      data: historyWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Pause subscription
const pauseSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Only active subscriptions can be paused' });
    }

    subscription.status = 'paused';
    subscription.pausedDates.push(new Date());
    await subscription.save();

    res.json({ success: true, message: 'Subscription paused successfully', data: subscription });
  } catch (error) {
    logger.error(error.message, { stack: error.stack }); res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Resume subscription
const resumeSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (subscription.status !== 'paused') {
      return res.status(400).json({ success: false, message: 'Only paused subscriptions can be resumed' });
    }

    subscription.status = 'active';
    await subscription.save();

    res.json({ success: true, message: 'Subscription resumed successfully', data: subscription });
  } catch (error) {
    logger.error(error.message, { stack: error.stack }); res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get dashboard stats for the logged-in user
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Active subscriptions count
    const activeSubscriptions = await Subscription.countDocuments({
      user: userId,
      status: { $in: ['active', 'paused'] }
    });

    // 2. Meals delivered this calendar month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get all user subscription IDs
    const userSubIds = await Subscription.find({ user: userId }).distinct('_id');

    const mealsThisMonth = await Delivery.countDocuments({
      subscription: { $in: userSubIds },
      status: 'delivered',
      deliveryDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // 3. Total amount spent (sum of paid subscriptions)
    const paidSubs = await Subscription.find({
      user: userId,
      paymentStatus: { $in: ['paid', 'captured'] }
    }).select('totalAmount');
    const totalSpent = paidSubs.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

    // 4. Completed orders count (acts as loyalty indicator — 10 pts per order)
    const completedOrders = await Subscription.countDocuments({
      user: userId,
      status: 'completed'
    });
    const loyaltyPoints = completedOrders * 10 + activeSubscriptions * 5;

    res.json({
      success: true,
      data: {
        activeSubscriptions,
        mealsThisMonth,
        totalSpent,
        loyaltyPoints
      }
    });
  } catch (error) {
    logger.error(error.message, { stack: error.stack }); res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new subscription (with discount applied)
const createSubscription = async (req, res) => {
  try {
    const {
      tiffinId,
      plan,
      startDate,
      deliveryAddress,
      deliveryTime,
      specialInstructions
    } = req.body;

    if (!tiffinId || !plan || !startDate || !deliveryAddress || !deliveryTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tiffinId, plan, startDate, deliveryAddress, deliveryTime'
      });
    }

    // Fetch tiffin (uses virtual effectivePrice)
    const tiffin = await Tiffin.findById(tiffinId).populate('partner');
    if (!tiffin || !tiffin.isActive) {
      return res.status(404).json({ success: false, message: 'Tiffin not found or inactive' });
    }

    const partner = tiffin.partner;
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found for this tiffin' });
    }

    // Compute pricing using effectivePrice virtual
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
      discountLabel = discountPercent > 0 ? (tiffin.discount.label || `${discountPercent}% Weekly Discount`) : '';
      endDate = new Date(start);
      endDate.setDate(endDate.getDate() + 7);
    } else if (plan === 'monthly') {
      totalAmount = effective.monthly;
      originalAmount = effective.monthlyOriginal;
      discountPercent = effective.monthlyDiscountPercent;
      discountLabel = discountPercent > 0 ? (tiffin.discount.label || `${discountPercent}% Monthly Discount`) : '';
      endDate = new Date(start);
      endDate.setDate(endDate.getDate() + 30);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid plan. Must be daily, weekly, or monthly' });
    }

    const GST_RATE = 5;
    const gstAmount  = Math.round(totalAmount * GST_RATE / 100);
    const grandTotal = totalAmount + gstAmount;

    const subscription = await Subscription.create({
      user:                req.user.id,
      partner:             partner._id,
      tiffin:              tiffin._id,
      plan,
      startDate:           start,
      endDate,
      deliveryAddress,
      deliveryTime,
      specialInstructions: specialInstructions || '',
      totalAmount,
      originalAmount,
      discountPercent,
      discountLabel,
      gstRate:      GST_RATE,
      gstAmount,
      grandTotal,
      status:        'active',
      paymentStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    logger.error(error.message, { stack: error.stack }); res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getUserSubscriptions,
  getSubscriptionDetails,
  getOrderHistory,
  getUserStats,
  pauseSubscription,
  resumeSubscription,
  createSubscription
};