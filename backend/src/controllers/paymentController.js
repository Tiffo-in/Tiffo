const logger = require('../utils/logger');
const paymentService = require('../services/paymentService');

/**
 * Setup partner Razorpay account
 * POST /api/payments/setup-partner-account
 */
exports.setupPartnerAccount = async (req, res) => {
  try {
    const partnerId = req.user.id;
    const accountId = await paymentService.setupPartnerPaymentAccount(partnerId, req.body);
    res.status(200).json({
      message: 'Partner account setup successful',
      accountId,
    });
  } catch (error) {
    logger.error('Setup partner account error:', { stack: error.stack });
    if (
      error.message === 'Only partners can setup payment accounts' ||
      error.message === 'Razorpay account already exists'
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Create Razorpay order for subscription
 * POST /api/payments/create-order
 */
exports.createOrder = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const userId = req.user.id;

    const orderData = await paymentService.createSubscriptionOrder(userId, subscriptionId);

    res.status(200).json({
      ...orderData,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    logger.error('Create order error:', { stack: error.stack });
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    if (
      error.message === 'Subscription already paid' ||
      error.message === 'Partner payment account not setup'
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Verify payment
 * POST /api/payments/verify
 */
exports.verifyPayment = async (req, res) => {
  try {
    const subscription = await paymentService.verifySubscriptionPayment(req.body);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      subscription: {
        id: subscription._id,
        status: subscription.status,
        paymentStatus: subscription.paymentStatus,
      },
    });
  } catch (error) {
    logger.error('Verify payment error:', { stack: error.stack });
    if (error.message === 'Invalid payment signature') {
      return res.status(400).json({ message: error.message });
    }
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Confirm Cash on Delivery
 * POST /api/payments/cod
 */
exports.confirmCodPayment = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const subscription = await paymentService.confirmCod(subscriptionId);

    res.status(200).json({
      success: true,
      message: 'COD Payment confirmed successfully',
      subscription: {
        id: subscription._id,
        status: subscription.status,
        paymentStatus: subscription.paymentStatus,
        paymentMethod: subscription.paymentMethod,
      },
    });
  } catch (error) {
    logger.error('Confirm COD error:', { stack: error.stack });
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Process refund
 * POST /api/payments/refund
 */
exports.processRefund = async (req, res) => {
  try {
    const { subscriptionId, amount, reason } = req.body;
    const refundId = await paymentService.processRefundForSubscription(
      subscriptionId,
      amount,
      reason,
    );

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      refundId,
    });
  } catch (error) {
    logger.error('Process refund error:', { stack: error.stack });
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.message === 'No payment found for this subscription') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get payment history
 * GET /api/payments/history
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await paymentService.fetchPaymentHistory(userId, req.query);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Get payment history error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = exports;
