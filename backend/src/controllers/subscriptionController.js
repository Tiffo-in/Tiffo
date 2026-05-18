const logger = require('../utils/logger');
const subscriptionService = require('../services/subscriptionService');

const getUserSubscriptions = async (req, res) => {
  try {
    const data = await subscriptionService.fetchUserSubscriptions(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Get user subscriptions error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getSubscriptionDetails = async (req, res) => {
  try {
    const data = await subscriptionService.fetchSubscriptionDetails(req.params.id, req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Get subscription details error:', { stack: error.stack });
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const data = await subscriptionService.fetchOrderHistory(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Get order history error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const pauseSubscription = async (req, res) => {
  try {
    const data = await subscriptionService.pauseUserSubscription(req.params.id, req.user.id);
    res.json({ success: true, message: 'Subscription paused successfully', data });
  } catch (error) {
    logger.error('Pause subscription error:', { stack: error.stack });
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const resumeSubscription = async (req, res) => {
  try {
    const data = await subscriptionService.resumeUserSubscription(req.params.id, req.user.id);
    res.json({ success: true, message: 'Subscription resumed successfully', data });
  } catch (error) {
    logger.error('Resume subscription error:', { stack: error.stack });
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getUserStats = async (req, res) => {
  try {
    const data = await subscriptionService.fetchUserStats(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Get user stats error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createSubscription = async (req, res) => {
  try {
    const data = await subscriptionService.createNewSubscription(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data,
    });
  } catch (error) {
    logger.error('Create subscription error:', { stack: error.stack });
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getUserSubscriptions,
  getSubscriptionDetails,
  getOrderHistory,
  getUserStats,
  pauseSubscription,
  resumeSubscription,
  createSubscription,
};
