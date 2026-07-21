const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getUserSubscriptions,
  getSubscriptionDetails,
  getSubscriptionDeliveries,
  getTodayDeliveries,
  getOrderHistory,
  getUserStats,
  pauseSubscription,
  resumeSubscription,
  createSubscription,
  renewSubscription,
} = require('../controllers/subscriptionController');

// Create subscription (discount pricing applied server-side)
router.post('/', protect, createSubscription);

// Get user subscriptions
router.get('/', protect, getUserSubscriptions);

// Get user subscriptions (alias for mobile app compatibility)
router.get('/my', protect, getUserSubscriptions);

// Get order history
router.get('/history', protect, getOrderHistory);

// Get dashboard stats
router.get('/stats', protect, getUserStats);

// Today's deliveries across the user's active subscriptions (static path — before /:id)
router.get('/deliveries/today', protect, getTodayDeliveries);

// Get subscription details
router.get('/:id', protect, getSubscriptionDetails);

// Per-day delivery timeline for one subscription
router.get('/:id/deliveries', protect, getSubscriptionDeliveries);

// Pause subscription
router.put('/:id/pause', protect, pauseSubscription);
router.patch('/:id/pause', protect, pauseSubscription);

// Resume subscription
router.put('/:id/resume', protect, resumeSubscription);
router.patch('/:id/resume', protect, resumeSubscription);

// Renew — create a continuing subscription (drives the normal payment flow)
router.post('/:id/renew', protect, renewSubscription);

module.exports = router;
