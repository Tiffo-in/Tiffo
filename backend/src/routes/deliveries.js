const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  updateDeliveryStatus,
  getDeliveryDetails,
  getPartnerDeliveries,
  getDeliveryStats,
  batchUpdateDeliveries,
  getAdminDeliveryOverview,
  getAdminDeliveries,
} = require('../controllers/deliveryController');

// Partner routes
router.get('/partner/my-deliveries', protect, authorize('partner'), getPartnerDeliveries);
router.get('/partner/stats', protect, authorize('partner'), getDeliveryStats);
router.put('/:deliveryId/status', protect, authorize('partner'), updateDeliveryStatus);
router.post('/batch-update', protect, authorize('partner'), batchUpdateDeliveries);

// Admin routes — MUST come before /:deliveryId to avoid route shadowing
router.get('/admin', protect, authorize('admin'), getAdminDeliveries);
router.get('/admin/overview', protect, authorize('admin'), getAdminDeliveryOverview);

// Common routes — wildcard last so it doesn't swallow /admin
router.get('/:deliveryId', protect, getDeliveryDetails);

module.exports = router;
