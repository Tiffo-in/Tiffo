const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { adminAuth } = require('../middlewares/adminAuth');
const {
    exportCustomersCSV,
    exportOrdersCSV,
    exportPaymentsCSV,
    exportSubscriptionsCSV,
    getSummaryReport
} = require('../controllers/exportController');

// All export routes require authentication
router.use(protect);

// Admin-only exports
router.get('/customers', adminAuth, exportCustomersCSV);
router.get('/payments', adminAuth, exportPaymentsCSV);
router.get('/subscriptions', adminAuth, exportSubscriptionsCSV);
router.get('/summary', adminAuth, getSummaryReport);

// Partner can export their own orders
router.get('/orders', exportOrdersCSV);

module.exports = router;
