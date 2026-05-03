const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');

/**
 * Get customer analytics data
 * GET /api/analytics/customers
 */
exports.getCustomerAnalytics = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const previousPeriodStart = new Date(startDate);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - days);

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // ── Run all independent queries in parallel ───────────────────────────
        const [
            totalCustomers,
            newCustomers,
            previousCustomers,
            returningCustomers,
            activeSubscriptions,
            inactiveSubscriptions,
            lifetimeValue,
            acquisition,
            topCustomers,
            subscriptionTrends,
            demographics,
            retentionData
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'user', createdAt: { $gte: startDate } }),
            User.countDocuments({
                role: 'user',
                createdAt: { $gte: previousPeriodStart, $lt: startDate }
            }),
            // Returning customers (users with more than one subscription)
            Subscription.aggregate([
                { $group: { _id: '$user', count: { $sum: 1 } } },
                { $match: { count: { $gt: 1 } } },
                { $count: 'total' }
            ]),
            Subscription.countDocuments({ status: 'active' }),
            Subscription.countDocuments({ status: 'cancelled' }),
            // Average Lifetime Value
            Payment.aggregate([
                { $match: { status: 'paid' } },
                { $group: { _id: '$user', totalSpent: { $sum: '$amount' } } },
                { $group: { _id: null, avgLifetimeValue: { $avg: '$totalSpent' } } }
            ]),
            // Customer acquisition — monthly breakdown
            User.aggregate([
                { $match: { role: 'user', createdAt: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        customers: { $sum: 1 },
                        month: { $first: { $dateToString: { format: '%b', date: '$createdAt' } } }
                    }
                },
                { $sort: { _id: 1 } },
                { $project: { month: 1, customers: 1, _id: 0 } }
            ]),
            // Top customers by spending
            Payment.aggregate([
                { $match: { status: 'paid' } },
                { $group: { _id: '$user', spent: { $sum: '$amount' }, orders: { $sum: 1 } } },
                { $sort: { spent: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'userInfo'
                    }
                },
                { $unwind: '$userInfo' },
                {
                    $project: {
                        _id: 1,
                        name: '$userInfo.name',
                        spent: 1,
                        orders: 1
                    }
                }
            ]),
            // Subscription plan distribution
            Subscription.aggregate([
                { $group: { _id: '$plan', count: { $sum: 1 } } }
            ]),
            // Demographics — top cities
            User.aggregate([
                { $match: { role: 'user', 'address.city': { $exists: true } } },
                { $group: { _id: '$address.city', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
                { $project: { city: '$_id', count: 1, _id: 0 } }
            ]),
            // Retention — computed from real subscription cohort data
            Subscription.aggregate([
                { $match: { status: { $in: ['active', 'cancelled'] } } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
                    }
                }
            ])
        ]);

        // Derived calculations
        const churnRate = (activeSubscriptions + inactiveSubscriptions) > 0
            ? ((inactiveSubscriptions / (activeSubscriptions + inactiveSubscriptions)) * 100).toFixed(2)
            : 0;

        const customerGrowth = previousCustomers > 0
            ? (((newCustomers - previousCustomers) / previousCustomers) * 100).toFixed(1)
            : 0;

        // Subscription trends as percentages
        const totalSubs = subscriptionTrends.reduce((sum, s) => sum + s.count, 0);
        const trends = { daily: 0, weekly: 0, monthly: 0 };
        subscriptionTrends.forEach(sub => {
            if (totalSubs > 0) {
                trends[sub._id] = Math.round((sub.count / totalSubs) * 100);
            }
        });

        // Retention based on real active-subscription ratio
        const retentionBase = retentionData[0] || { total: 0, active: 0 };
        const overallRetentionPct = retentionBase.total > 0
            ? Math.round((retentionBase.active / retentionBase.total) * 100)
            : null;
        const retention = overallRetentionPct !== null
            ? { overall: overallRetentionPct }
            : { overall: 0, note: 'No subscription data available.' };

        res.json({
            success: true,
            data: {
                overview: {
                    totalCustomers,
                    newCustomers,
                    returningCustomers: returningCustomers[0]?.total || 0,
                    churnRate: parseFloat(churnRate),
                    avgLifetimeValue: Math.round(lifetimeValue[0]?.avgLifetimeValue || 0),
                    customerGrowth: parseFloat(customerGrowth)
                },
                acquisition,
                retention,
                topCustomers,
                subscriptionTrends: trends,
                demographics: {
                    locations: demographics
                }
            }
        });
    } catch (error) {
        logger.error('Customer analytics error:', { stack: error.stack });
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Export analytics data to CSV
 * GET /api/analytics/export
 */
exports.exportAnalytics = async (req, res) => {
    try {
        const { type } = req.query; // 'customers', 'revenue', 'subscriptions'

        let data = [];
        let filename = 'analytics_export.csv';
        let headers = [];

        if (type === 'customers') {
            const customers = await User.find({ role: 'user' })
                .select('name email phone createdAt address')
                .lean();

            filename = 'customers_export.csv';
            headers = ['Name', 'Email', 'Phone', 'City', 'Joined Date'];

            data = customers.map(c => [
                c.name,
                c.email,
                c.phone || '',
                c.address?.city || '',
                new Date(c.createdAt).toLocaleDateString()
            ]);

        } else if (type === 'revenue') {
            const revenue = await Payment.find({ status: 'paid' })
                .populate('user', 'name email')
                .populate('partner', 'businessName')
                .select('amount createdAt user partner paymentMethod')
                .lean();

            filename = 'revenue_export.csv';
            headers = ['Date', 'Customer', 'Partner', 'Amount', 'Payment Method'];

            data = revenue.map(r => [
                new Date(r.createdAt).toLocaleDateString(),
                r.user?.name || '',
                r.partner?.businessName || '',
                r.amount,
                r.paymentMethod || 'card'
            ]);

        } else if (type === 'subscriptions') {
            const subscriptions = await Subscription.find()
                .populate('user', 'name email')
                .populate('partner', 'businessName')
                .populate('tiffin', 'name')
                .select('user partner tiffin plan status startDate endDate totalAmount')
                .lean();

            filename = 'subscriptions_export.csv';
            headers = ['Customer', 'Partner', 'Tiffin', 'Plan', 'Status', 'Start Date', 'End Date', 'Amount'];

            data = subscriptions.map(s => [
                s.user?.name || '',
                s.partner?.businessName || '',
                s.tiffin?.name || '',
                s.plan,
                s.status,
                new Date(s.startDate).toLocaleDateString(),
                new Date(s.endDate).toLocaleDateString(),
                s.totalAmount
            ]);
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid export type. Use 'customers', 'revenue', or 'subscriptions'."
            });
        }

        // Generate CSV — escape any double-quotes inside field values
        const escapeField = (field) => `"${String(field).replace(/"/g, '""')}"`;
        let csv = headers.map(escapeField).join(',') + '\n';
        data.forEach(row => {
            csv += row.map(escapeField).join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);

    } catch (error) {
        logger.error('Export analytics error:', { stack: error.stack });
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = exports;
