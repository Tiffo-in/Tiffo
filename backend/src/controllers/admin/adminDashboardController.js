const mongoose = require('mongoose');
const User = require('../../models/User');
const Subscription = require('../../models/Subscription');
const Payment = require('../../models/Payment');
const Delivery = require('../../models/Delivery');
const FraudReport = require('../../models/FraudReport');
const SupportRequest = require('../../models/SupportRequest');
const SystemAlert = require('../../models/SystemAlert');
const logger = require('../../utils/logger');

const MONGO_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

const formatUptime = (seconds) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

/**
 * Collect live system health metrics from the running process, the Mongo
 * connection and the recent Payment record — no simulated values.
 */
const collectSystemHealth = async () => {
  const mem = process.memoryUsage();
  const heapUsedMb = Math.round(mem.heapUsed / 1024 / 1024);
  const heapTotalMb = Math.round(mem.heapTotal / 1024 / 1024);
  const heapRatio = mem.heapTotal > 0 ? mem.heapUsed / mem.heapTotal : 0;

  // Database: connection state + a real ping to measure round-trip latency.
  const readyState = mongoose.connection.readyState;
  let dbStatus = readyState === 1 ? 'healthy' : 'critical';
  let pingMs = null;
  if (readyState === 1) {
    try {
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      pingMs = Date.now() - start;
    } catch (err) {
      dbStatus = 'warning';
    }
  }

  // Payments: real success rate + volume over the last 24h.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const paymentAgg = await Payment.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
      },
    },
  ]);
  const pStats = paymentAgg[0] || { total: 0, success: 0, failed: 0 };
  const successRate = pStats.total > 0 ? Math.round((pStats.success / pStats.total) * 100) : 100;
  let paymentStatus = 'healthy';
  if (pStats.total > 0 && successRate < 80) paymentStatus = 'critical';
  else if (pStats.total > 0 && successRate < 95) paymentStatus = 'warning';

  const errorRatePct = pStats.total > 0 ? (pStats.failed / pStats.total) * 100 : 0;

  return {
    server: {
      status: heapRatio > 0.9 ? 'warning' : 'healthy',
      metrics: [
        { label: 'Uptime', value: formatUptime(process.uptime()) },
        { label: 'Memory', value: `${heapUsedMb} / ${heapTotalMb} MB` },
        { label: 'Environment', value: process.env.NODE_ENV || 'development' },
      ],
    },
    database: {
      status: dbStatus,
      metrics: [
        { label: 'State', value: MONGO_STATES[readyState] || 'unknown' },
        { label: 'Ping', value: pingMs === null ? 'n/a' : `${pingMs}ms` },
      ],
    },
    api: {
      status: errorRatePct > 5 ? 'warning' : 'healthy',
      metrics: [
        { label: 'Node', value: process.version },
        { label: 'Error Rate', value: `${errorRatePct.toFixed(1)}%` },
      ],
    },
    payments: {
      status: paymentStatus,
      metrics: [
        { label: 'Success (24h)', value: `${successRate}%` },
        { label: 'Volume (24h)', value: `${pStats.total}` },
      ],
    },
  };
};

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

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
      subsLastMonth,
      partnersThisMonth,
      partnersLastMonth,
      revenueThisMonthAgg,
      revenueLastMonthAgg,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'partner' }),
      Subscription.countDocuments({ status: 'active' }),
      Delivery.countDocuments({ createdAt: { $gte: todayStart } }),
      User.countDocuments({ role: 'partner', isVerified: false }),
      Subscription.aggregate([
        { $match: { paymentStatus: { $in: ['paid', 'captured'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
      User.countDocuments({
        role: 'user',
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      Subscription.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Subscription.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      User.countDocuments({ role: 'partner', createdAt: { $gte: startOfMonth } }),
      User.countDocuments({
        role: 'partner',
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      Subscription.aggregate([
        {
          $match: {
            paymentStatus: { $in: ['paid', 'captured'] },
            createdAt: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Subscription.aggregate([
        {
          $match: {
            paymentStatus: { $in: ['paid', 'captured'] },
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const revenueThisMonth = revenueThisMonthAgg[0]?.total || 0;
    const revenueLastMonth = revenueLastMonthAgg[0]?.total || 0;

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
        partners: growthPct(partnersThisMonth, partnersLastMonth),
        revenue: growthPct(revenueThisMonth, revenueLastMonth),
        subscriptions: growthPct(subsThisMonth, subsLastMonth),
      },
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
      User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(5).lean(),
      Subscription.find().populate('user', 'name').sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    const activities = [
      ...recentUsers.map((u) => ({
        type: 'user_registered',
        message: `${u.name} registered as ${u.role}`,
        timestamp: u.createdAt,
        icon: '👤',
      })),
      ...recentSubscriptions
        .filter((s) => s.paymentStatus === 'paid' || s.paymentStatus === 'captured')
        .map((s) => ({
          type: 'payment',
          message: `₹${s.totalAmount} payment received from ${s.user?.name || 'User'}`,
          timestamp: s.createdAt,
          icon: '💰',
        })),
      ...recentSubscriptions.map((s) => ({
        type: 'subscription',
        message: `New ${s.plan} subscription by ${s.user?.name || 'User'}`,
        timestamp: s.createdAt,
        icon: '📋',
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
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
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        dailyStats,
        period: `${days} days`,
      },
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
    const [health, pendingPartners, openFraudReports, openSupportRequests] = await Promise.all([
      collectSystemHealth(),
      User.countDocuments({ role: 'partner', isVerified: false }),
      FraudReport.countDocuments({ status: { $in: ['open', 'under_investigation'] } }),
      SupportRequest.countDocuments({ status: { $in: ['pending', 'investigating'] } }),
    ]);

    // Derived alerts keyed by a stable natural key. Upsert keeps their
    // message/count fresh while preserving any acknowledgment already recorded;
    // when the underlying count clears we remove the alert so it self-resolves.
    const derived = [
      pendingPartners > 0 && {
        key: 'pending-partners',
        type: 'warning',
        title: 'Pending Partners',
        message: `${pendingPartners} partner(s) waiting for verification`,
        source: 'Partners',
      },
      openFraudReports > 0 && {
        key: 'fraud-reports',
        type: 'critical',
        title: 'Unresolved Fraud Reports',
        message: `${openFraudReports} fraud report(s) require attention`,
        source: 'Security',
      },
      openSupportRequests > 0 && {
        key: 'support-requests',
        type: 'info',
        title: 'Open Support Requests',
        message: `${openSupportRequests} support request(s) waiting for response`,
        source: 'Support',
      },
    ].filter(Boolean);

    const activeKeys = derived.map((d) => d.key);

    await Promise.all([
      // Retire derived alerts whose condition no longer holds.
      SystemAlert.deleteMany({ key: { $nin: activeKeys, $ne: null } }),
      // Upsert current derived alerts without touching acknowledgment state.
      ...derived.map((d) =>
        SystemAlert.updateOne(
          { key: d.key },
          {
            $set: { title: d.title, message: d.message, type: d.type, source: d.source },
            $setOnInsert: { acknowledged: false },
          },
          { upsert: true },
        ),
      ),
    ]);

    const docs = await SystemAlert.find().sort({ createdAt: -1 }).lean();

    const alerts =
      docs.length > 0
        ? docs.map((d) => ({
            id: d._id.toString(),
            type: d.type,
            title: d.title,
            message: d.message,
            source: d.source,
            timestamp: d.updatedAt || d.createdAt,
            acknowledged: d.acknowledged,
          }))
        : [
            {
              id: 'ALT_OK',
              type: 'info',
              title: 'All Clear',
              message: 'No active alerts in the system',
              source: 'System',
              timestamp: new Date(),
              acknowledged: true,
            },
          ];

    res.json({
      success: true,
      data: { health, alerts },
    });
  } catch (error) {
    logger.error('getSystemAlerts error:', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Acknowledge a system alert, persisting who acknowledged it and when.
 * POST /api/admin/alerts/:id/acknowledge
 */
exports.acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;

    // The ephemeral "All Clear" placeholder has no DB document to update.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    const alert = await SystemAlert.findByIdAndUpdate(
      id,
      { acknowledged: true, acknowledgedBy: req.user._id, acknowledgedAt: new Date() },
      { new: true },
    );

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.json({ success: true, data: { id: alert._id.toString(), acknowledged: true } });
  } catch (error) {
    logger.error('acknowledgeAlert error:', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
