/**
 * paymentService.js
 * All payment API calls — uses the shared `api` axios instance
 * which automatically sends the httpOnly cookie, so no manual
 * Authorization header or localStorage token lookup needed.
 */
import api from './api';

/**
 * Setup partner Razorpay account
 */
export const setupPartnerAccount = async (bankDetails, taxDetails, businessName) => {
  const response = await api.post('/payments/setup-partner-account', {
    bankDetails, taxDetails, businessName
  });
  return response.data;
};

/**
 * Create Razorpay order
 */
export const createOrder = async (subscriptionId) => {
  const response = await api.post('/payments/create-order', { subscriptionId });
  return response.data;
};

/**
 * Verify payment
 */
export const verifyPayment = async (paymentData) => {
  if (!paymentData || typeof paymentData !== 'object') {
    throw new Error('Invalid payment data');
  }

  // Whitelist expected fields
  const allowed = ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'subscriptionId'];
  const sanitized = {};
  for (const field of allowed) {
    if (paymentData[field] !== undefined) {
      sanitized[field] = String(paymentData[field]);
    }
  }

  const response = await api.post('/payments/verify', sanitized);
  return response.data;
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (params = {}) => {
  const response = await api.get('/payments/history', { params });
  return response.data;
};

/**
 * Process refund
 */
export const processRefund = async (subscriptionId, amount, reason) => {
  const response = await api.post('/payments/refund', { subscriptionId, amount, reason });
  return response.data;
};

/**
 * Load Razorpay script — safe to call multiple times (idempotent)
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load',  () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default {
  setupPartnerAccount,
  createOrder,
  verifyPayment,
  getPaymentHistory,
  processRefund,
  loadRazorpayScript
};
