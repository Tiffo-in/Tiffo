const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getUserSubscriptions,
  getSubscriptionDetails,
  getOrderHistory,
  getUserStats,
  pauseSubscription,
  resumeSubscription,
  createSubscription,
} = require('../controllers/subscriptionController');

// Create subscription (discount pricing applied server-side)
router.post('/', protect, createSubscription);

// Get user subscriptions
router.get('/', protect, getUserSubscriptions);

// Get order history
router.get('/history', protect, getOrderHistory);

// Get dashboard stats
router.get('/stats', protect, getUserStats);

// Get subscription details
router.get('/:id', protect, getSubscriptionDetails);

// Pause subscription
router.put('/:id/pause', protect, pauseSubscription);

// Resume subscription
router.put('/:id/resume', protect, resumeSubscription);

module.exports = router;
