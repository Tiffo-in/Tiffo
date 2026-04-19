const User = require('../models/User');
const Partner = require('../models/Partner');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const Delivery = require('../models/Delivery');
const logger = require('../utils/logger');
const { emitToAdmins, emitNotification } = require('../services/socketService');

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth     = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const todayStart       = new Date(now); todayStart.setHours(0,0,0,0);

        const [
            totalUsers,
            totalPartners,
            activeSubscriptions,
            todayDeliveries,
            pendingPartners,
            // Revenue: sum of paid subscription amounts (Payment collection may be empty)
            revenueAgg,
            // Growth: this month vs last month new users
            usersThisMonth,
            usersLastMonth,
            subsThisMonth,
            subsLastMonth
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'partner' }),
            Subscription.countDocuments({ status: 'active' }),
            Delivery.countDocuments({ createdAt: { $gte: todayStart } }),
            User.countDocuments({ role: 'partner', isVerified: false }),
            // Use Subscription.totalAmount for revenue (real seeded data)
            Subscription.aggregate([
                { $match: { paymentStatus: { $in: ['paid', 'captured'] } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
            User.countDocuments({ role: 'user', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
            Subscription.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Subscription.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
        ]);

        // Compute growth %
        const growthPct = (current, previous) => {
            if (previous === 0) return current > 0 ? '+100%' : '0%';
            const pct = Math.round(((current - previous) / previous) * 100);
            return `${pct >= 0 ? '+' : ''}${pct}%`;
        };

        const stats = {
            totalUsers,
            totalPartners,
            activeSubscriptions,
            totalRevenue: revenueAgg[0]?.total || 0,
            pendingPartners,
            todayDeliveries,
            growth: {
                users: growthPct(usersThisMonth, usersLastMonth),
                partners: '+0%',   // can be computed the same way if needed
                revenue: '+0%',    // would need time-indexed payment data
                subscriptions: growthPct(subsThisMonth, subsLastMonth)
            }
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        logger.error(error.message, { stack: error.stack }); res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get all users with pagination
 */
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const role = req.query.role || '';
        const status = req.query.status || '';

        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role && role !== 'all') {
            query.role = role;
        }

        if (status === 'verified') {
            query.isVerified = true;
        } else if (status === 'unverified') {
            query.isVerified = false;
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get single user details
 */
const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get additional stats
        const [subscriptions, payments] = await Promise.all([
            Subscription.countDocuments({ user: user._id }),
            Payment.aggregate([
                { $match: { user: user._id, status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        res.json({
            success: true,
            data: {
                ...user.toObject(),
                stats: {
                    subscriptions,
                    totalSpent: payments[0]?.total || 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update user status (ban/activate)
 */
const updateUserStatus = async (req, res) => {
    try {
        const { status, reason } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = status === 'active';
        user.banReason = status === 'banned' ? reason : null;
        user.bannedAt = status === 'banned' ? new Date() : null;
        await user.save();

        // Notify the user
        emitNotification(user._id, {
            title: status === 'banned' ? 'Account Suspended' : 'Account Activated',
            message: status === 'banned'
                ? `Your account has been suspended. Reason: ${reason}`
                : 'Your account has been activated',
            type: status === 'banned' ? 'error' : 'success'
        });

        res.json({
            success: true,
            message: `User ${status === 'active' ? 'activated' : 'banned'} successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get pending partner applications
 */
const getPendingPartners = async (req, res) => {
    try {
        const partners = await User.find({
            role: 'partner',
            isVerified: false
        })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: partners
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Approve/reject partner
 */
const updatePartnerStatus = async (req, res) => {
    try {
        const { status, reason } = req.body;

        const partner = await User.findOne({
            _id: req.params.id,
            role: 'partner'
        });

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found'
            });
        }

        const partnerProfile = await Partner.findOne({ user: partner._id });

        if (status === 'approved') {
            partner.isVerified = true;
            if (partnerProfile) {
                partnerProfile.verified = true;
                partnerProfile.verifiedAt = new Date();
                partnerProfile.payoutEnabled = true;
                await partnerProfile.save();
            }
        } else if (status === 'rejected') {
            partner.isVerified = false;
            if (partnerProfile) {
                partnerProfile.verified = false;
                partnerProfile.rejectionReason = reason;
                partnerProfile.rejectedAt = new Date();
                await partnerProfile.save();
            }
        }

        await partner.save();

        // Notify partner
        emitNotification(partner._id, {
            title: status === 'approved' ? 'Application Approved! 🎉' : 'Application Update',
            message: status === 'approved'
                ? 'Congratulations! Your partner application has been approved. You can now start listing your tiffins.'
                : `Your application was not approved. Reason: ${reason}`,
            type: status === 'approved' ? 'success' : 'warning'
        });

        res.json({
            success: true,
            message: `Partner ${status} successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get recent activity
 */
const getRecentActivity = async (req, res) => {
    try {
        // Payment collection may be empty; use Subscription payment events instead
        const [recentUsers, recentSubscriptions] = await Promise.all([
            User.find()
                .select('name email role createdAt')
                .sort({ createdAt: -1 })
                .limit(5),
            Subscription.find()
                .populate('user', 'name')
                .sort({ createdAt: -1 })
                .limit(8)
        ]);

        // Combine and sort by date
        const activities = [
            ...recentUsers.map(u => ({
                type: 'user_registered',
                message: `${u.name} registered as ${u.role}`,
                timestamp: u.createdAt,
                icon: '👤'
            })),
            // Split subscriptions into payment + subscription events
            ...recentSubscriptions
                .filter(s => s.paymentStatus === 'paid' || s.paymentStatus === 'captured')
                .map(s => ({
                    type: 'payment',
                    message: `₹${s.totalAmount} payment received from ${s.user?.name || 'User'}`,
                    timestamp: s.createdAt,
                    icon: '💰'
                })),
            ...recentSubscriptions.map(s => ({
                type: 'subscription',
                message: `New ${s.plan} subscription by ${s.user?.name || 'User'}`,
                timestamp: s.createdAt,
                icon: '📋'
            }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        res.json({ success: true, data: activities });
    } catch (error) {
        logger.error(error.message, { stack: error.stack }); res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get platform analytics
 */
const getAnalytics = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Daily stats
        const dailyStats = await Payment.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: 'paid' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                dailyStats,
                period: `${days} days`
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ADMIN PAYMENT MANAGEMENT
// ============================================

/**
 * Get all platform payments with filters
 * GET /api/admin/payments
 */
const getAllPayments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { status, startDate, endDate, partnerId, userId, minAmount, maxAmount } = req.query;

        const query = {};

        // Status filter
        if (status && status !== 'all') {
            query.status = status;
        }

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Partner filter
        if (partnerId) {
            query.partner = partnerId;
        }

        // User filter
        if (userId) {
            query.user = userId;
        }

        // Amount range filter
        if (minAmount || maxAmount) {
            query.amount = {};
            if (minAmount) query.amount.$gte = parseFloat(minAmount);
            if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
        }

        const payments = await Payment.find(query)
            .populate('user', 'name email phone')
            .populate('partner', 'name email businessName')
            .populate('subscription', 'plan startDate endDate')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Payment.countDocuments(query);

        // Get summary stats for the filtered results
        const summary = await Payment.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    successfulPayments: {
                        $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
                    },
                    failedPayments: {
                        $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                    },
                    refundedAmount: { $sum: '$refundAmount' }
                }
            }
        ]);

        res.json({
            success: true,
            data: payments,
            summary: summary[0] || {
                totalAmount: 0,
                successfulPayments: 0,
                failedPayments: 0,
                refundedAmount: 0
            },
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get single payment details
 * GET /api/admin/payments/:id
 */
const getPaymentDetails = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('user', 'name email phone address')
            .populate('partner', 'name email businessName phone razorpayAccountId')
            .populate({
                path: 'subscription',
                populate: {
                    path: 'tiffin',
                    select: 'name price description'
                }
            });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            data: payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get revenue report with breakdown
 * GET /api/admin/payments/revenue/report
 */
const getRevenueReport = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Daily revenue
        const dailyRevenue = await Payment.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: 'success' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Revenue by partner
        const revenueByPartner = await Payment.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: 'success' } },
            {
                $group: {
                    _id: '$partner',
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'partnerInfo'
                }
            },
            { $unwind: { path: '$partnerInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    revenue: 1,
                    count: 1,
                    partnerName: '$partnerInfo.name',
                    businessName: '$partnerInfo.businessName'
                }
            }
        ]);

        // Revenue by payment method
        const revenueByMethod = await Payment.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: 'success' } },
            {
                $group: {
                    _id: '$paymentMethod',
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Total stats
        const totalStats = await Payment.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: { $cond: [{ $eq: ['$status', 'success'] }, '$amount', 0] }
                    },
                    totalRefunds: { $sum: '$refundAmount' },
                    successCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
                    },
                    failedCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                    },
                    refundedCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                period: `${days} days`,
                dailyRevenue,
                revenueByPartner,
                revenueByMethod,
                totals: totalStats[0] || {
                    totalRevenue: 0,
                    totalRefunds: 0,
                    successCount: 0,
                    failedCount: 0,
                    refundedCount: 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get pending payouts to partners
 * GET /api/admin/payments/payouts/pending
 */
const getPendingPayouts = async (req, res) => {
    try {
        // Calculate pending payouts per partner
        const pendingPayouts = await Payment.aggregate([
            { $match: { status: 'success', payoutStatus: { $ne: 'completed' } } },
            {
                $group: {
                    _id: '$partner',
                    pendingAmount: { $sum: '$amount' },
                    transactionCount: { $sum: 1 },
                    oldestTransaction: { $min: '$createdAt' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'partners',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'partnerInfo'
                }
            },
            { $unwind: { path: '$partnerInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    partnerId: '$_id',
                    pendingAmount: 1,
                    transactionCount: 1,
                    oldestTransaction: 1,
                    partnerName: '$userInfo.name',
                    email: '$userInfo.email',
                    businessName: '$partnerInfo.businessName',
                    razorpayAccountId: '$partnerInfo.razorpayAccountId',
                    payoutEnabled: '$partnerInfo.payoutEnabled'
                }
            },
            { $sort: { pendingAmount: -1 } }
        ]);

        const totalPendingAmount = pendingPayouts.reduce((sum, p) => sum + p.pendingAmount, 0);

        res.json({
            success: true,
            data: pendingPayouts,
            summary: {
                totalPendingAmount,
                partnersWithPending: pendingPayouts.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get payout history
 * GET /api/admin/payments/payouts/history
 */
const getPayoutHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { partnerId, startDate, endDate } = req.query;

        const query = { payoutStatus: 'completed' };

        if (partnerId) {
            query.partner = partnerId;
        }

        if (startDate || endDate) {
            query.payoutDate = {};
            if (startDate) query.payoutDate.$gte = new Date(startDate);
            if (endDate) query.payoutDate.$lte = new Date(endDate);
        }

        const payouts = await Payment.find(query)
            .populate('partner', 'name email businessName')
            .select('partner amount payoutDate payoutId payoutStatus')
            .sort({ payoutDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Payment.countDocuments(query);

        // Calculate total payout amount
        const totalAmount = await Payment.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            success: true,
            data: payouts,
            summary: {
                totalPayouts: total,
                totalAmount: totalAmount[0]?.total || 0
            },
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Admin process refund
 * POST /api/admin/payments/:id/refund
 */
const adminProcessRefund = async (req, res) => {
    try {
        const { amount, reason } = req.body;
        const paymentId = req.params.id;

        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (payment.status === 'refunded') {
            return res.status(400).json({
                success: false,
                message: 'Payment already refunded'
            });
        }

        if (payment.status !== 'success') {
            return res.status(400).json({
                success: false,
                message: 'Only successful payments can be refunded'
            });
        }

        const refundAmount = amount || payment.amount;

        // Update payment record
        payment.status = 'refunded';
        payment.refundAmount = refundAmount;
        payment.refundReason = reason;
        payment.refundedAt = new Date();
        payment.refundedBy = req.user.id;
        await payment.save();

        // Update subscription if exists
        if (payment.subscription) {
            await Subscription.findByIdAndUpdate(payment.subscription, {
                status: 'cancelled',
                paymentStatus: 'refunded',
                cancelledAt: new Date(),
                cancellationReason: `Refund processed: ${reason}`
            });
        }

        // Notify user
        emitNotification(payment.user, {
            title: 'Refund Processed',
            message: `Your payment of ₹${refundAmount} has been refunded. ${reason ? `Reason: ${reason}` : ''}`,
            type: 'info'
        });

        res.json({
            success: true,
            message: 'Refund processed successfully',
            data: {
                paymentId: payment._id,
                refundAmount,
                reason
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get disputed payments
 * GET /api/admin/payments/disputes
 */
const getDisputedPayments = async (req, res) => {
    try {
        const { status } = req.query;

        const query = { isDisputed: true };
        if (status && status !== 'all') {
            query.disputeStatus = status;
        }

        const disputes = await Payment.find(query)
            .populate('user', 'name email phone')
            .populate('partner', 'name email businessName')
            .sort({ disputeCreatedAt: -1 });

        const summary = {
            total: disputes.length,
            pending: disputes.filter(d => d.disputeStatus === 'pending').length,
            resolved: disputes.filter(d => d.disputeStatus === 'resolved').length,
            escalated: disputes.filter(d => d.disputeStatus === 'escalated').length
        };

        res.json({
            success: true,
            data: disputes,
            summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Resolve dispute
 * PATCH /api/admin/payments/disputes/:id/resolve
 */
const resolveDispute = async (req, res) => {
    try {
        const { resolution, notes, action } = req.body;

        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (!payment.isDisputed) {
            return res.status(400).json({
                success: false,
                message: 'This payment is not disputed'
            });
        }

        payment.disputeStatus = 'resolved';
        payment.disputeResolution = resolution;
        payment.disputeNotes = notes;
        payment.disputeResolvedAt = new Date();
        payment.disputeResolvedBy = req.user.id;

        // If action is refund, process refund
        if (action === 'refund') {
            payment.status = 'refunded';
            payment.refundAmount = payment.amount;
            payment.refundReason = `Dispute resolution: ${resolution}`;
            payment.refundedAt = new Date();
        }

        await payment.save();

        // Notify user
        emitNotification(payment.user, {
            title: 'Dispute Resolved',
            message: `Your payment dispute has been resolved. Resolution: ${resolution}`,
            type: 'info'
        });

        res.json({
            success: true,
            message: 'Dispute resolved successfully',
            data: {
                paymentId: payment._id,
                resolution,
                action
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ALERTS & SYSTEM HEALTH
// ============================================

/**
 * Get system health and active alerts
 * GET /api/admin/alerts
 */
const getSystemAlerts = async (req, res) => {
    try {
        // In a real application, these would be fetched from monitoring services 
        // like Datadog, NewRelic, AWS CloudWatch, or a custom logs DB.
        // For this implementation, we return a simulated real-time response.
        
        const systemHealth = {
            server: { status: 'healthy', uptime: '99.9%', latency: '45ms' },
            database: { status: 'healthy', connections: 24, queryTime: '12ms' },
            api: { status: 'warning', requests: '1.2k/min', errorRate: '2.1%' },
            payments: { status: 'healthy', successRate: '98.5%', avgTime: '1.2s' }
        };

        const alerts = [
            {
                id: 'ALT001',
                type: 'critical',
                title: 'High API Error Rate',
                message: 'API error rate has exceeded 2% threshold. Current rate: 2.1%',
                source: 'API Gateway',
                timestamp: new Date(),
                acknowledged: false
            },
            {
                id: 'ALT002',
                type: 'warning',
                title: 'Database Connection Pool',
                message: 'Connection pool usage at 80%. Consider scaling resources.',
                source: 'Database',
                timestamp: new Date(Date.now() - 1800000),
                acknowledged: false
            },
            {
                id: 'ALT003',
                type: 'info',
                title: 'Scheduled Maintenance',
                message: 'System maintenance scheduled for tonight at 2:00 AM IST.',
                source: 'System',
                timestamp: new Date(Date.now() - 3600000),
                acknowledged: true
            },
            {
                id: 'ALT004',
                type: 'warning',
                title: 'Payment Gateway Latency',
                message: 'Payment processing time increased to 1.5s average.',
                source: 'Payments',
                timestamp: new Date(Date.now() - 7200000),
                acknowledged: false
            },
            {
                id: 'ALT005',
                type: 'info',
                title: 'New Partner Registration',
                message: '5 new partner applications pending review.',
                source: 'Partners',
                timestamp: new Date(Date.now() - 10800000),
                acknowledged: true
            },
            {
                id: 'ALT006',
                type: 'critical',
                title: 'Failed Login Attempts',
                message: 'Multiple failed login attempts detected from IP 192.168.1.x',
                source: 'Security',
                timestamp: new Date(Date.now() - 14400000),
                acknowledged: true
            }
        ];

        res.json({
            success: true,
            data: {
                health: systemHealth,
                alerts: alerts
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getUsers,
    getUserDetails,
    updateUserStatus,
    getPendingPartners,
    updatePartnerStatus,
    getRecentActivity,
    getAnalytics,
    // Payment Management
    getAllPayments,
    getPaymentDetails,
    getRevenueReport,
    getPendingPayouts,
    getPayoutHistory,
    adminProcessRefund,
    getDisputedPayments,
    resolveDispute,
    getSystemAlerts
};
