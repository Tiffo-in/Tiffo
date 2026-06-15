const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { getCustomerAnalytics, exportAnalytics } = require('../controllers/analyticsController');

// Admin-only routes
router.get('/customers', protect, authorize('admin'), getCustomerAnalytics);
router.get('/export', protect, authorize('admin'), exportAnalytics);

module.exports = router;
