const User = require('../models/User');
const Partner = require('../models/Partner');
const Subscription = require('../models/Subscription');
const PaymentLog = require('../models/PaymentLog');
const logger = require('../utils/logger');
const {
    createLinkedAccount,
    addBankAccount,
    createOrderWithTransfer,
    verifyPaymentSignature,
    createRefund
} = require('../services/razorpayService');
const { generateDeliveriesForSubscription } = require('../services/deliveryService');
const { emitNotification } = require('../services/socketService');

/**
 * Setup partner Razorpay account
 * POST /api/payments/setup-partner-account
 */
exports.setupPartnerAccount = async (req, res) => {
    try {
        const { bankDetails, taxDetails } = req.body;
        const partnerId = req.user.id;

        // Get user for personal details (email, phone, address)
        const user = await User.findById(partnerId);
        // Get partner business context
        const partner = await Partner.findOne({ user: partnerId }).populate('user');

        if (!user || user.role !== 'partner' || !partner) {
            return res.status(403).json({ message: 'Only partners can setup payment accounts' });
        }

        // Check if account already exists
        if (partner.razorpayAccountId) {
            return res.status(400).json({ message: 'Razorpay account already exists' });
        }

        // Create Razorpay linked account
        const accountResult = await createLinkedAccount({
            email: user.email,
            phone: user.phone,
            name: user.name,
            businessName: req.body.businessName,
            address: user.address || partner.address,
            pan: taxDetails.pan
        });

        if (!accountResult.success) {
            return res.status(500).json({ message: 'Failed to create Razorpay account', error: accountResult.error });
        }

        // Add bank account to linked account
        const bankResult = await addBankAccount(accountResult.accountId, bankDetails);

        if (!bankResult.success) {
            return res.status(500).json({ message: 'Failed to add bank account', error: bankResult.error });
        }

        // Update partner record (not user)
        partner.razorpayAccountId = accountResult.accountId;
        partner.bankDetails = {
            accountNumber: bankDetails.accountNumber,
            ifscCode: bankDetails.ifscCode,
            accountHolderName: bankDetails.accountHolderName,
            verified: false
        };
        partner.documents = {
            ...partner.documents,
            pan: taxDetails.pan,
            gst: taxDetails.gst
        };
        partner.payoutEnabled = true;

        await partner.save();

        res.status(200).json({
            message: 'Partner account setup successful',
            accountId: accountResult.accountId
        });
    } catch (error) {
        logger.error('Setup partner account error:', { stack: error.stack });
        res.status(500).json({ success: false, message: 'Server error' });
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

        // Get subscription details
        const subscription = await Subscription.findById(subscriptionId)
            .populate('partner')
            .populate('tiffin');

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        // Verify subscription belongs to user
        if (subscription.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Check if already paid
        if (subscription.paymentStatus === 'paid' || subscription.paymentStatus === 'captured') {
            return res.status(400).json({ message: 'Subscription already paid' });
        }

        // Check if partner has Razorpay account
        if (!subscription.partner.razorpayAccountId) {
            return res.status(400).json({ message: 'Partner payment account not setup' });
        }

        // Calculate amounts — charge grandTotal (includes GST) to customer
        const totalAmount = subscription.grandTotal || subscription.totalAmount; // fallback for old records
        const commissionRate = subscription.partner.commissionRate || 0.10;
        const platformCommission = Math.round(totalAmount * commissionRate);
        const providerAmount = totalAmount - platformCommission;

        // Create Razorpay order with transfer
        const orderResult = await createOrderWithTransfer({
            amount: totalAmount,
            currency: 'INR',
            receipt: `sub_${subscriptionId}`,
            partnerAccountId: subscription.partner.razorpayAccountId,
            providerAmount: providerAmount,
            metadata: {
                subscription_id: subscriptionId,
                partner_id: subscription.partner._id.toString(),
                user_id: userId
            }
        });

        if (!orderResult.success) {
            return res.status(500).json({ message: 'Failed to create order', error: orderResult.error });
        }

        // Update subscription with order details
        subscription.orderId = orderResult.orderId;
        subscription.platformCommission = platformCommission;
        subscription.providerAmount = providerAmount;
        await subscription.save();

        // Log payment initiation
        await PaymentLog.create({
            type: 'payment',
            status: 'pending',
            orderId: orderResult.orderId,
            amount: totalAmount,
            currency: 'INR',
            subscriptionId: subscriptionId,
            userId: userId,
            partnerId: subscription.partner._id,
            metadata: {
                platformCommission,
                providerAmount
            }
        });

        res.status(200).json({
            orderId: orderResult.orderId,
            amount: totalAmount * 100, // in paise
            currency: 'INR',
            razorpayKey: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        logger.error('Create order error:', { stack: error.stack });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Verify payment
 * POST /api/payments/verify
 */
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            subscriptionId
        } = req.body;

        // Verify signature
        const isValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            // Log failed verification
            await PaymentLog.create({
                type: 'payment',
                status: 'failed',
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                subscriptionId: subscriptionId,
                errorCode: 'SIGNATURE_MISMATCH',
                errorDescription: 'Payment signature verification failed',
                failedAt: new Date()
            });

            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Update subscription
        const subscription = await Subscription.findById(subscriptionId);

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        subscription.paymentId = razorpay_payment_id;
        subscription.razorpaySignature = razorpay_signature;
        subscription.paymentStatus = 'paid';
        subscription.status = 'active';
        subscription.paidAt = new Date();
        await subscription.save();

        // Generate deliveries for this subscription
        const populatedForDeliveries = await Subscription.findById(subscription._id).populate('tiffin partner');
        if (populatedForDeliveries) {
            await generateDeliveriesForSubscription(populatedForDeliveries);
            
            // Notify customer that meal calendar is ready
            if (populatedForDeliveries.user) {
                emitNotification(populatedForDeliveries.user._id, {
                    title: 'Subscription Active 🎉',
                    message: `Your ${populatedForDeliveries.tiffin.title} subscription is active. Your meal calendar has been updated!`,
                    type: 'success'
                });
            }
        }

        // Update payment log
        await PaymentLog.findOneAndUpdate(
            { orderId: razorpay_order_id },
            {
                status: 'success',
                paymentId: razorpay_payment_id,
                processedAt: new Date()
            }
        );

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            subscription: {
                id: subscription._id,
                status: subscription.status,
                paymentStatus: subscription.paymentStatus
            }
        });
    } catch (error) {
        logger.error('Verify payment error:', { stack: error.stack });
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

        const subscription = await Subscription.findById(subscriptionId);

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        // Update subscription
        subscription.paymentMethod = 'cod';
        subscription.paymentStatus = 'pending'; // Stays pending until cash is collected
        subscription.status = 'active';
        await subscription.save();

        // Generate deliveries for this subscription
        const populatedForDeliveries = await Subscription.findById(subscription._id).populate('tiffin partner');
        if (populatedForDeliveries) {
            await generateDeliveriesForSubscription(populatedForDeliveries);
            
            // Notify customer that meal calendar is ready
            if (populatedForDeliveries.user) {
                emitNotification(populatedForDeliveries.user._id, {
                    title: 'Order Confirmed (COD) 🎉',
                    message: `Your ${populatedForDeliveries.tiffin.title} subscription is active. Pay cash upon first delivery!`,
                    type: 'success'
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'COD Payment confirmed successfully',
            subscription: {
                id: subscription._id,
                status: subscription.status,
                paymentStatus: subscription.paymentStatus,
                paymentMethod: subscription.paymentMethod
            }
        });
    } catch (error) {
        logger.error('Confirm COD error:', { stack: error.stack });
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

        const subscription = await Subscription.findById(subscriptionId);

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        if (!subscription.paymentId) {
            return res.status(400).json({ message: 'No payment found for this subscription' });
        }

        // Create refund
        const refundResult = await createRefund(
            subscription.paymentId,
            amount,
            { reason, subscription_id: subscriptionId }
        );

        if (!refundResult.success) {
            return res.status(500).json({ message: 'Refund failed', error: refundResult.error });
        }

        // Update subscription
        subscription.paymentStatus = 'refunded';
        subscription.status = 'cancelled';
        await subscription.save();

        // Log refund
        await PaymentLog.create({
            type: 'refund',
            status: 'success',
            paymentId: subscription.paymentId,
            refundId: refundResult.refundId,
            amount: amount || subscription.totalAmount,
            subscriptionId: subscriptionId,
            metadata: { reason },
            processedAt: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            refundId: refundResult.refundId
        });
    } catch (error) {
        logger.error('Process refund error:', { stack: error.stack });
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
        const { type, status, limit = 20, page = 1 } = req.query;

        const query = { userId };
        if (type) query.type = type;
        if (status) query.status = status;

        const payments = await PaymentLog.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .populate('subscriptionId', 'plan startDate endDate')
            .populate('partnerId', 'name email');

        const total = await PaymentLog.countDocuments(query);

        res.status(200).json({
            payments,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        logger.error('Get payment history error:', { stack: error.stack });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = exports;
