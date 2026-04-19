const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const PaymentLog = require('../models/PaymentLog');
const logger = require('../utils/logger'); // Bug 12 fix: use Winston logger throughout
const {
    sendPaymentConfirmation,
    sendPaymentFailure,
    sendPartnerPaymentNotification,
    sendAdminTransferFailureAlert,
    sendRefundConfirmation
} = require('../services/emailService');


/**
 * Handle Razorpay webhooks
 * POST /api/webhooks/razorpay
 */
exports.handleRazorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const webhookSignature = req.headers['x-razorpay-signature'];

        // Verify webhook signature against raw bytes (app.js mounts this route
        // with express.raw() BEFORE express.json() so req.body is a Buffer here)
        const shasum = crypto.createHmac('sha256', webhookSecret);
        shasum.update(req.body); // req.body is raw Buffer — Bug 4 was fixed in app.js
        const digest = shasum.digest('hex');

        if (digest !== webhookSignature) {
            logger.error('Razorpay webhook: invalid signature');
            return res.status(400).json({ error: 'Invalid signature' });
        }

        // Parse body after signature check
        const payload = JSON.parse(req.body.toString());
        const event = payload.event;
        const eventPayload = payload.payload;

        logger.info(`Razorpay webhook received: ${event}`);

        switch (event) {
            case 'payment.captured':
                await handlePaymentCaptured(eventPayload);
                break;

            case 'payment.failed':
                await handlePaymentFailed(eventPayload);
                break;

            case 'transfer.processed':
                await handleTransferProcessed(eventPayload);
                break;

            case 'transfer.failed':
                await handleTransferFailed(eventPayload);
                break;

            case 'refund.processed':
                await handleRefundProcessed(eventPayload);
                break;

            default:
                logger.info(`Razorpay webhook: unhandled event '${event}'`);
        }

        res.json({ status: 'ok' });
    } catch (error) {
        logger.error(`Razorpay webhook error: ${error.message}`, { stack: error.stack });
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

/**
 * Handle payment captured event
 */
async function handlePaymentCaptured(payload) {
    try {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;
        const paymentId = payment.id;

        logger.info(`Payment captured: ${paymentId} for order: ${orderId}`);

        const subscription = await Subscription.findOne({ orderId });

        if (!subscription) {
            logger.error(`Payment captured: subscription not found for order: ${orderId}`);
            return;
        }

        subscription.paymentStatus = 'captured';
        subscription.status = 'active';
        subscription.paidAt = new Date();
        await subscription.save();

        await PaymentLog.findOneAndUpdate(
            { orderId },
            {
                status: 'success',
                paymentId,
                processedAt: new Date(),
                metadata: { ...payment }
            }
        );

        logger.info(`Subscription ${subscription._id} activated after payment ${paymentId}`);

        const populatedSub = await Subscription.findById(subscription._id).populate('user partner tiffin');
        if (populatedSub && populatedSub.user) {
            await sendPaymentConfirmation(populatedSub.user, populatedSub, payment);
        }
    } catch (error) {
        logger.error(`Error handling payment.captured: ${error.message}`, { stack: error.stack });
    }
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(payload) {
    try {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;
        const paymentId = payment.id;

        logger.warn(`Payment failed: ${paymentId} for order: ${orderId}`);

        const subscription = await Subscription.findOne({ orderId });

        if (subscription) {
            subscription.paymentStatus = 'failed';
            await subscription.save();
        }

        await PaymentLog.create({
            type: 'payment',
            status: 'failed',
            orderId,
            paymentId,
            subscriptionId: subscription?._id,
            amount: payment.amount / 100,
            currency: payment.currency,
            errorCode: payment.error_code,
            errorDescription: payment.error_description,
            failedAt: new Date()
        });

        logger.warn(`Payment failed logged for subscription ${subscription?._id}`);

        if (subscription) {
            const populatedSub = await Subscription.findById(subscription._id).populate('user');
            if (populatedSub && populatedSub.user) {
                await sendPaymentFailure(populatedSub.user, populatedSub, {
                    errorCode: payment.error_code,
                    errorDescription: payment.error_description
                });
            }
        }
    } catch (error) {
        logger.error(`Error handling payment.failed: ${error.message}`, { stack: error.stack });
    }
}

/**
 * Handle transfer processed event
 */
async function handleTransferProcessed(payload) {
    try {
        const transfer = payload.transfer.entity;
        const transferId = transfer.id;
        const orderId = transfer.source;

        logger.info(`Transfer processed: ${transferId} for order: ${orderId}`);

        const subscription = await Subscription.findOne({ orderId });

        if (subscription) {
            subscription.transferId = transferId;
            subscription.transferStatus = 'processed';
            subscription.transferredAt = new Date();
            await subscription.save();
        }

        await PaymentLog.create({
            type: 'transfer',
            status: 'success',
            orderId,
            transferId,
            amount: transfer.amount / 100,
            currency: transfer.currency,
            subscriptionId: subscription?._id,
            recipientAccountId: transfer.recipient,
            processedAt: new Date(),
            metadata: { ...transfer }
        });

        logger.info(`Transfer completed for subscription ${subscription?._id}`);

        if (subscription) {
            const populatedSub = await Subscription.findById(subscription._id).populate('partner');
            if (populatedSub && populatedSub.partner) {
                await sendPartnerPaymentNotification(populatedSub.partner, populatedSub, transfer.amount / 100);
            }
        }
    } catch (error) {
        logger.error(`Error handling transfer.processed: ${error.message}`, { stack: error.stack });
    }
}

/**
 * Handle transfer failed event
 */
async function handleTransferFailed(payload) {
    try {
        const transfer = payload.transfer.entity;
        const transferId = transfer.id;
        const orderId = transfer.source;

        logger.error(`Transfer failed: ${transferId} for order: ${orderId}`);

        const subscription = await Subscription.findOne({ orderId });

        if (subscription) {
            subscription.transferStatus = 'failed';
            await subscription.save();
        }

        await PaymentLog.create({
            type: 'transfer',
            status: 'failed',
            orderId,
            transferId,
            amount: transfer.amount / 100,
            subscriptionId: subscription?._id,
            errorCode: transfer.error?.code,
            errorDescription: transfer.error?.description,
            failedAt: new Date()
        });

        logger.error(`Transfer failed for subscription ${subscription?._id}`);

        if (subscription) {
            await sendAdminTransferFailureAlert(subscription, {
                errorCode: transfer.error?.code,
                errorDescription: transfer.error?.description
            });
        }
    } catch (error) {
        logger.error(`Error handling transfer.failed: ${error.message}`, { stack: error.stack });
    }
}

/**
 * Handle refund processed event
 */
async function handleRefundProcessed(payload) {
    try {
        const refund = payload.refund.entity;
        const refundId = refund.id;
        const paymentId = refund.payment_id;

        logger.info(`Refund processed: ${refundId} for payment: ${paymentId}`);

        const subscription = await Subscription.findOne({ paymentId });

        if (subscription) {
            subscription.paymentStatus = 'refunded';
            subscription.status = 'cancelled';
            await subscription.save();
        }

        await PaymentLog.findOneAndUpdate(
            { paymentId, type: 'refund' },
            {
                status: 'success',
                refundId,
                processedAt: new Date(),
                metadata: { ...refund }
            }
        );

        logger.info(`Refund completed for subscription ${subscription?._id}`);

        if (subscription) {
            const populatedSub = await Subscription.findById(subscription._id).populate('user');
            if (populatedSub && populatedSub.user) {
                await sendRefundConfirmation(populatedSub.user, populatedSub, refund.amount / 100);
            }
        }
    } catch (error) {
        logger.error(`Error handling refund.processed: ${error.message}`, { stack: error.stack });
    }
}

module.exports = exports;
