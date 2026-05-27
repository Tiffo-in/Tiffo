const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { adminAuth } = require('../middlewares/adminAuth');

// Domain-specific Controllers
const dashboardController = require('../controllers/admin/adminDashboardController');
const userController = require('../controllers/admin/adminUserController');
const partnerController = require('../controllers/admin/adminPartnerController');
const financeController = require('../controllers/admin/adminFinanceController');

// All routes require authentication and admin role verification
router.use(protect);
router.use(adminAuth);

// ── Dashboard & Platforms Analytics ──────────────────────────────────────────
router.get('/dashboard', dashboardController.getDashboardStats);
router.get('/activity', dashboardController.getRecentActivity);
router.get('/analytics', dashboardController.getAnalytics);
router.get('/alerts', dashboardController.getSystemAlerts);

// ── User Management ────────────────────────────────────────────────────────
router.post('/users/bulk', userController.bulkUserAction);
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserDetails);
router.patch('/users/:id/status', userController.updateUserStatus);

// ── Partner Management ─────────────────────────────────────────────────────
router.get('/partners/pending', partnerController.getPendingPartners);
router.patch('/partners/:id/status', partnerController.updatePartnerStatus);

// ── Financial & Payment Management ─────────────────────────────────────────
router.get('/payments', financeController.getAllPayments);
router.get('/payments/revenue/report', financeController.getRevenueReport);
router.get('/payments/payouts/pending', financeController.getPendingPayouts);
router.get('/payments/payouts/history', financeController.getPayoutHistory);
router.get('/payments/:id', financeController.getPaymentDetails);
router.post('/payments/:id/refund', financeController.adminProcessRefund);

// Dispute Resolution
router.get('/payments/disputes', financeController.getDisputedPayments);
router.patch('/payments/disputes/:id/resolve', financeController.resolveDispute);

module.exports = router;
