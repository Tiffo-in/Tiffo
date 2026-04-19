const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { adminAuth } = require('../middlewares/adminAuth');
const {
    getDashboardStats,
    getUsers,
    getUserDetails,
    updateUserStatus,
    getPendingPartners,
    updatePartnerStatus,
    getRecentActivity,
    getAnalytics,
    // Payment Management
    getAllPayments,
    getPaymentDetails,
    getRevenueReport,
    getPendingPayouts,
    getPayoutHistory,
    adminProcessRefund,
    getDisputedPayments,
    resolveDispute,
    getSystemAlerts
} = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(protect);
router.use(adminAuth);

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/activity', getRecentActivity);
router.get('/analytics', getAnalytics);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.patch('/users/:id/status', updateUserStatus);

// Partner management
router.get('/partners/pending', getPendingPartners);
router.patch('/partners/:id/status', updatePartnerStatus);

// Payment Management
router.get('/payments', getAllPayments);
router.get('/payments/revenue/report', getRevenueReport);
router.get('/payments/payouts/pending', getPendingPayouts);
router.get('/payments/payouts/history', getPayoutHistory);
router.get('/payments/disputes', getDisputedPayments);
router.get('/payments/:id', getPaymentDetails);
router.post('/payments/:id/refund', adminProcessRefund);
router.patch('/payments/disputes/:id/resolve', resolveDispute);
// Admin Alerts
router.get('/alerts', getSystemAlerts);

module.exports = router;
