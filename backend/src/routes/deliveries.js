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
  skipDelivery,
  unskipDelivery,
  submitDeliveryFeedback,
  reportDeliveryIssue,
} = require('../controllers/deliveryController');

// Partner routes
router.get('/partner/my-deliveries', protect, authorize('partner'), getPartnerDeliveries);
router.get('/partner/stats', protect, authorize('partner'), getDeliveryStats);
router.put('/:deliveryId/status', protect, authorize('partner'), updateDeliveryStatus);
router.post('/batch-update', protect, authorize('partner'), batchUpdateDeliveries);

// Customer self-service — skip / un-skip a scheduled day (owner-scoped in service)
router.patch('/:deliveryId/skip', protect, skipDelivery);
router.patch('/:deliveryId/unskip', protect, unskipDelivery);

// Customer feedback + issue report on a delivery (owner-scoped in service)
router.post('/:deliveryId/feedback', protect, submitDeliveryFeedback);
router.post('/:deliveryId/report', protect, reportDeliveryIssue);

// Admin routes — MUST come before /:deliveryId to avoid route shadowing
router.get('/admin', protect, authorize('admin'), getAdminDeliveries);
router.get('/admin/overview', protect, authorize('admin'), getAdminDeliveryOverview);

// Common routes — wildcard last so it doesn't swallow /admin
router.get('/:deliveryId', protect, getDeliveryDetails);

module.exports = router;
