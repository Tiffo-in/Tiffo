import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

/**
 * Setup partner Razorpay account
 */
export const setupPartnerAccount = async (bankDetails, taxDetails, businessName) => {
    const response = await axios.post(
        `${API_URL}/api/payments/setup-partner-account`,
        {
            bankDetails,
            taxDetails,
            businessName
        },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
    return response.data;
};

/**
 * Create Razorpay order
 */
export const createOrder = async (subscriptionId) => {
    const response = await axios.post(
        `${API_URL}/api/payments/create-order`,
        { subscriptionId },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
    return response.data;
};

/**
 * Verify payment
 */
export const verifyPayment = async (paymentData) => {
    // Validate payment data structure to prevent deserialization attacks
    if (!paymentData || typeof paymentData !== 'object') {
        throw new Error('Invalid payment data');
    }
    
    // Whitelist expected fields
    const allowedFields = ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'subscriptionId'];
    const sanitizedData = {};
    
    for (const field of allowedFields) {
        if (paymentData[field] !== undefined) {
            sanitizedData[field] = String(paymentData[field]);
        }
    }
    
    const response = await axios.post(
        `${API_URL}/api/payments/verify`,
        sanitizedData,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
    return response.data;
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (params = {}) => {
    const response = await axios.get(
        `${API_URL}/api/payments/history`,
        {
            params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
    return response.data;
};

/**
 * Process refund
 */
export const processRefund = async (subscriptionId, amount, reason) => {
    const response = await axios.post(
        `${API_URL}/api/payments/refund`,
        {
            subscriptionId,
            amount,
            reason
        },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
    return response.data;
};

/**
 * Load Razorpay script — safe to call multiple times (idempotent)
 */
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        // Already loaded
        if (window.Razorpay) return resolve(true);

        // Script tag already injected but not yet ready
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

const paymentService = {
    setupPartnerAccount,
    createOrder,
    verifyPayment,
    getPaymentHistory,
    processRefund,
    loadRazorpayScript
};

export default paymentService;
