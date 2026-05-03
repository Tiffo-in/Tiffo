const Payment = require('../../models/Payment');
const Subscription = require('../../models/Subscription');
const logger = require('../../utils/logger');
const { emitNotification } = require('../../services/socketService');

/**
 * Get all platform payments with elaborate filtering and pagination
 * GET /api/admin/payments
 */
exports.getAllPayments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { status, startDate, endDate, partnerId, userId, minAmount, maxAmount } = req.query;

        const query = {};
        if (status && status !== 'all') query.status = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        if (partnerId) query.partner = partnerId;
        if (userId) query.user = userId;
        if (minAmount || maxAmount) {
            query.amount = {};
            if (minAmount) query.amount.$gte = parseFloat(minAmount);
            if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
        }

        const [payments, total, summary] = await Promise.all([
            Payment.find(query)
                .populate('user', 'name email phone')
                .populate('partner', 'name email businessName')
                .populate('subscription', 'plan startDate endDate')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Payment.countDocuments(query),
            Payment.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                        successfulPayments: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
                        failedPayments: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
                        refundedAmount: { $sum: '$refundAmount' }
                    }
                }
            ])
        ]);

        res.json({
            success: true,
            data: payments,
            summary: summary[0] || { totalAmount: 0, successfulPayments: 0, failedPayments: 0, refundedAmount: 0 },
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        logger.error('getAllPayments error:', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get deep payment details
 * GET /api/admin/payments/:id
 */
exports.getPaymentDetails = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('user', 'name email phone address')
            .populate('partner', 'name email businessName phone razorpayAccountId')
            .populate({
                path: 'subscription',
                populate: { path: 'tiffin', select: 'name price description' }
            });

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        res.json({ success: true, data: payment });
    } catch (error) {
        logger.error('getPaymentDetails error:', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get revenue report with parallelized aggregations
 * GET /api/admin/payments/revenue/report
 */
exports.getRevenueReport = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const [dailyRevenue, revenueByPartner, revenueByMethod, totalStats] = await Promise.all([
            Payment.aggregate([
                { $match: { createdAt: { $gte: startDate }, status: 'success' } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            Payment.aggregate([
                { $match: { createdAt: { $gte: startDate }, status: 'success' } },
                { $group: { _id: '$partner', revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
                { $sort: { revenue: -1 } },
                { $limit: 10 },
                { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'partnerInfo' } },
                { $unwind: { path: '$partnerInfo', preserveNullAndEmptyArrays: true } },
                { $project: { revenue: 1, count: 1, partnerName: '$partnerInfo.name', businessName: '$partnerInfo.businessName' } }
            ]),
            Payment.aggregate([
                { $match: { createdAt: { $gte: startDate }, status: 'success' } },
                { $group: { _id: '$paymentMethod', revenue: { $sum: '$amount' }, count: { $sum: 1 } } }
            ]),
            Payment.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                { $group: { _id: null, totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, '$amount', 0] } }, totalRefunds: { $sum: '$refundAmount' }, successCount: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } }, failedCount: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }, refundedCount: { $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] } } } }
            ])
        ]);

        res.json({
            success: true,
            data: { period: `${days} days`, dailyRevenue, revenueByPartner, revenueByMethod, totals: totalStats[0] || { totalRevenue: 0, totalRefunds: 0, successCount: 0, failedCount: 0, refundedCount: 0 } }
        });
    } catch (error) {
        logger.error('getRevenueReport error:', { error: error.message, stack: error.stack });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get pending payouts to partners
 * GET /api/admin/payments/payouts/pending
 */
exports.getPendingPayouts = async (req, res) => {
    try {
        const pendingPayouts = await Payment.aggregate([
            { $match: { status: 'success', payoutStatus: { $ne: 'completed' } } },
            { $group: { _id: '$partner', pendingAmount: { $sum: '$amount' }, transactionCount: { $sum: 1 }, oldestTransaction: { $min: '$createdAt' } } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'partners', localField: 'userInfo._id', foreignField: 'user', as: 'partnerInfo' } },
            { $unwind: { path: '$partnerInfo', preserveNullAndEmptyArrays: true } },
            { $project: { partnerId: '$_id', pendingAmount: 1, transactionCount: 1, oldestTransaction: 1, partnerName: '$userInfo.name', email: '$userInfo.email', businessName: '$partnerInfo.businessName', razorpayAccountId: '$partnerInfo.razorpayAccountId', payoutEnabled: '$partnerInfo.payoutEnabled' } },
            { $sort: { pendingAmount: -1 } }
        ]);

        res.json({ success: true, data: pendingPayouts, summary: { totalPendingAmount: pendingPayouts.reduce((sum, p) => sum + p.pendingAmount, 0), partnersWithPending: pendingPayouts.length } });
    } catch (error) {
        logger.error('getPendingPayouts error:', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get payout history
 * GET /api/admin/payments/payouts/history
 */
exports.getPayoutHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { partnerId, startDate, endDate } = req.query;

        const query = { payoutStatus: 'completed' };
        if (partnerId) query.partner = partnerId;
        if (startDate || endDate) {
            query.payoutDate = {};
            if (startDate) query.payoutDate.$gte = new Date(startDate);
            if (endDate) query.payoutDate.$lte = new Date(endDate);
        }

        const [payouts, total, totalAmount] = await Promise.all([
            Payment.find(query).populate('partner', 'name email businessName').select('partner amount payoutDate payoutId payoutStatus').sort({ payoutDate: -1 }).skip((page - 1) * limit).limit(limit),
            Payment.countDocuments(query),
            Payment.aggregate([{ $match: query }, { $group: { _id: null, total: { $sum: '$amount' } } }])
        ]);

        res.json({ success: true, data: payouts, summary: { totalPayouts: total, totalAmount: totalAmount[0]?.total || 0 }, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) {
        logger.error('getPayoutHistory error:', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Process a refund as an administrator
 * POST /api/admin/payments/:id/refund
 */
exports.adminProcessRefund = async (req, res) => {
    try {
        const { amount, reason } = req.body;
        const payment = await Payment.findById(req.params.id);

        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        if (payment.status === 'refunded') return res.status(400).json({ success: false, message: 'Payment already refunded' });
        if (payment.status !== 'success') return res.status(400).json({ success: false, message: 'Only successful payments can be refunded' });

        const refundAmount = amount || payment.amount;
        payment.status = 'refunded';
        payment.refundAmount = refundAmount;
        payment.refundReason = reason;
        payment.refundedAt = new Date();
        payment.refundedBy = req.user.id;
        await payment.save();

        if (payment.subscription) {
            await Subscription.findByIdAndUpdate(payment.subscription, { status: 'cancelled', paymentStatus: 'refunded', cancelledAt: new Date(), cancellationReason: `Refund processed: ${reason}` });
        }

        emitNotification(payment.user, { title: 'Refund Processed', message: `Your payment of ₹${refundAmount} has been refunded. Reason: ${reason || 'N/A'}`, type: 'info' });
        res.json({ success: true, message: 'Refund processed successfully', data: { paymentId: payment._id, refundAmount, reason } });
    } catch (error) {
        logger.error('adminProcessRefund error:', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get all disputed payments
 * GET /api/admin/payments/disputes
 */
exports.getDisputedPayments = async (req, res) => {
    try {
        const { status } = req.query;
        const query = { isDisputed: true };
        if (status && status !== 'all') query.disputeStatus = status;

        const disputes = await Payment.find(query).populate('user', 'name email phone').populate('partner', 'name email businessName').sort({ disputeCreatedAt: -1 });

        res.json({ success: true, data: disputes, summary: { total: disputes.length, pending: disputes.filter(d => d.disputeStatus === 'pending').length, resolved: disputes.filter(d => d.disputeStatus === 'resolved').length, escalated: disputes.filter(d => d.disputeStatus === 'escalated').length } });
    } catch (error) {
        logger.error('getDisputedPayments error:', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Resolve a payment dispute
 * PATCH /api/admin/payments/disputes/:id/resolve
 */
exports.resolveDispute = async (req, res) => {
    try {
        const { resolution, notes, action } = req.body;
        const payment = await Payment.findById(req.params.id);

        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        if (!payment.isDisputed) return res.status(400).json({ success: false, message: 'This payment is not disputed' });

        payment.disputeStatus = 'resolved';
        payment.disputeResolution = resolution;
        payment.disputeNotes = notes;
        payment.disputeResolvedAt = new Date();
        payment.disputeResolvedBy = req.user.id;

        if (action === 'refund') {
            payment.status = 'refunded';
            payment.refundAmount = payment.amount;
            payment.refundReason = `Dispute resolution: ${resolution}`;
            payment.refundedAt = new Date();
        }

        await payment.save();
        emitNotification(payment.user, { title: 'Dispute Resolved', message: `Your payment dispute has been resolved. Resolution: ${resolution}`, type: 'info' });
        res.json({ success: true, message: 'Dispute resolved successfully', data: { paymentId: payment._id, resolution, action } });
    } catch (error) {
        logger.error('resolveDispute error:', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
