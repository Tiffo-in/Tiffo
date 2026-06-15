const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getPartnerCustomers,
  getCustomerCalendar,
  getCustomerSubscription,
  getCustomerDetails,
  updatePartnerProfile,
  getPartnerProfile,
  getTodayOrders,
  getEarnings,
  getAnalytics,
  getPartnerStats,
} = require('../controllers/partnerController');

// Get all customers for a partner
router.get('/customers', protect, authorize('partner'), getPartnerCustomers);

// Get customer delivery calendar
router.get('/customers/:customerId/calendar', protect, authorize('partner'), getCustomerCalendar);

// Get customer subscription details
router.get(
  '/customers/:customerId/subscription',
  protect,
  authorize('partner'),
  getCustomerSubscription,
);

// Get detailed customer information
router.get('/customers/:customerId/details', protect, authorize('partner'), getCustomerDetails);

// Partner profile management
router.get('/profile', protect, authorize('partner'), getPartnerProfile);
router.put('/profile', protect, authorize('partner'), updatePartnerProfile);

// Get today's orders
router.get('/orders/today', protect, authorize('partner'), getTodayOrders);

// Get earnings data
router.get('/earnings', protect, authorize('partner'), getEarnings);

// Get analytics data
router.get('/analytics', protect, authorize('partner'), getAnalytics);

// Get dashboard stats
router.get('/stats', protect, authorize('partner'), getPartnerStats);

module.exports = router;
