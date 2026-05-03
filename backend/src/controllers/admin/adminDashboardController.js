const User = require('../../models/User');
const Subscription = require('../../models/Subscription');
const Payment = require('../../models/Payment');
const Delivery = require('../../models/Delivery');
const logger = require('../../utils/logger');

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard
 */
exports.getDashboardStats = async (req, res) => {
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
            revenueAgg,
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
            Subscription.aggregate([
                { $match: { paymentStatus: { $in: ['paid', 'captured'] } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
            User.countDocuments({ role: 'user', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
            Subscription.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Subscription.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
        ]);

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
                partners: '+0%',
                revenue: '+0%',
                subscriptions: growthPct(subsThisMonth, subsLastMonth)
            }
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        logger.error('getDashboardStats error:', { error: error.message, stack: error.stack });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get recent activity across the platform
 * GET /api/admin/activity
 */
exports.getRecentActivity = async (req, res) => {
    try {
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

        const activities = [
            ...recentUsers.map(u => ({
                type: 'user_registered',
                message: `${u.name} registered as ${u.role}`,
                timestamp: u.createdAt,
                icon: '👤'
            })),
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
        logger.error('getRecentActivity error:', { error: error.message, stack: error.stack });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get simple platform analytics for charts
 * GET /api/admin/analytics
 */
exports.getAnalytics = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

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
        logger.error('getAnalytics error:', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get system health and active alerts
 * GET /api/admin/alerts
 */
exports.getSystemAlerts = async (req, res) => {
    try {
        // Simulated real-time response for system health
        const systemHealth = {
            server: { status: 'healthy', uptime: '99.9%', latency: '45ms' },
            database: { status: 'healthy', connections: 24, queryTime: '12ms' },
            api: { status: 'warning', requests: '1.2k/min', errorRate: '2.1%' },
            payments: { status: 'healthy', successRate: '98.5%', avgTime: '1.2s' }
        };

        const alerts = [
            { id: 'ALT001', type: 'critical', title: 'High API Error Rate', message: 'API error rate exceeded 2%', source: 'API Gateway', timestamp: new Date(), acknowledged: false },
            { id: 'ALT002', type: 'warning', title: 'Database Pool', message: 'Connection pool usage at 80%', source: 'Database', timestamp: new Date(Date.now() - 1800000), acknowledged: false },
            { id: 'ALT003', type: 'info', title: 'Maintenance', message: 'Maintenance scheduled for 2:00 AM', source: 'System', timestamp: new Date(Date.now() - 3600000), acknowledged: true }
        ];

        res.json({
            success: true,
            data: { health: systemHealth, alerts }
        });
    } catch (error) {
        logger.error('getSystemAlerts error:', { error: error.message });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
