const Razorpay = require('razorpay');
const logger = require('../utils/logger');

// Initialize Razorpay instance (optional - will log warning if keys not configured)
let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
} else {
    logger.warn('⚠️  Razorpay keys not configured. Payment features will be unavailable.');
}

/**
 * Create a Razorpay linked account for partner
 */
const createLinkedAccount = async (partnerData) => {
    try {
        const account = await razorpay.accounts.create({
            email: partnerData.email,
            phone: partnerData.phone,
            type: 'route',
            legal_business_name: partnerData.businessName || partnerData.name,
            business_type: 'individual',
            contact_name: partnerData.name,
            profile: {
                category: 'food',
                subcategory: 'tiffin_service',
                addresses: {
                    registered: {
                        street1: partnerData.address?.street || '',
                        city: partnerData.address?.city || '',
                        state: partnerData.address?.state || '',
                        postal_code: partnerData.address?.pincode || '',
                        country: 'IN'
                    }
                }
            },
            legal_info: {
                pan: partnerData.pan
            }
        });

        return {
            success: true,
            accountId: account.id,
            data: account
        };
    } catch (error) {
        logger.error('Error creating linked account:', { error: error.message });
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Add bank account to linked account
 */
const addBankAccount = async (accountId, bankDetails) => {
    try {
        const bankAccount = await razorpay.accounts.addBankAccount(accountId, {
            ifsc_code: bankDetails.ifscCode,
            account_number: bankDetails.accountNumber,
            beneficiary_name: bankDetails.accountHolderName
        });

        return {
            success: true,
            data: bankAccount
        };
    } catch (error) {
        logger.error('Error adding bank account:', { error: error.message, accountId });
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Create order with automatic transfer to partner
 */
const createOrderWithTransfer = async (orderData) => {
    try {
        const { amount, currency, receipt, partnerAccountId, providerAmount, metadata } = orderData;

        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency: currency || 'INR',
            receipt: receipt,
            transfers: [
                {
                    account: partnerAccountId,
                    amount: providerAmount * 100, // Convert to paise
                    currency: currency || 'INR',
                    notes: metadata || {},
                    linked_account_notes: ['Tiffin subscription payment'],
                    on_hold: 0, // Transfer immediately
                    on_hold_until: null
                }
            ]
        });

        return {
            success: true,
            orderId: order.id,
            data: order
        };
    } catch (error) {
        logger.error('Error creating order:', { error: error.message, receipt: orderData.receipt });
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Verify payment signature
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
    const crypto = require('crypto');

    const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(orderId + '|' + paymentId)
        .digest('hex');

    return generated_signature === signature;
};

/**
 * Create refund
 */
const createRefund = async (paymentId, amount, notes) => {
    try {
        const refund = await razorpay.payments.refund(paymentId, {
            amount: amount ? amount * 100 : undefined, // Partial or full refund
            notes: notes || {},
            reverse_all: 1 // Reverse transfers as well
        });

        return {
            success: true,
            refundId: refund.id,
            data: refund
        };
    } catch (error) {
        logger.error('Error creating refund:', { error: error.message, paymentId });
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Fetch payment details
 */
const fetchPayment = async (paymentId) => {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return {
            success: true,
            data: payment
        };
    } catch (error) {
        logger.error('Error fetching payment:', { error: error.message, paymentId });
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Fetch transfer details
 */
const fetchTransfer = async (transferId) => {
    try {
        const transfer = await razorpay.transfers.fetch(transferId);
        return {
            success: true,
            data: transfer
        };
    } catch (error) {
        logger.error('Error fetching transfer:', { error: error.message, transferId });
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    razorpay,
    createLinkedAccount,
    addBankAccount,
    createOrderWithTransfer,
    verifyPaymentSignature,
    createRefund,
    fetchPayment,
    fetchTransfer
};
