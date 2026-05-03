const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
    setupPartnerAccount,
    createOrder,
    verifyPayment,
    processRefund,
    getPaymentHistory,
    confirmCodPayment
} = require('../controllers/paymentController');

// Partner account setup
router.post('/setup-partner-account', protect, setupPartnerAccount);

// Create order for subscription
router.post('/create-order', protect, createOrder);

// Verify payment
router.post('/verify', protect, verifyPayment);

// Confirm COD payment
router.post('/cod', protect, confirmCodPayment);

// Process refund
router.post('/refund', protect, processRefund);

// Get payment history
router.get('/history', protect, getPaymentHistory);

module.exports = router;
