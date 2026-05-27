const User = require('../../models/User');
const Subscription = require('../../models/Subscription');
const Payment = require('../../models/Payment');
const logger = require('../../utils/logger');
const { emitNotification } = require('../../services/socketService');

/**
 * Get all users with pagination and filters
 * GET /api/admin/users
 */
exports.getUsers = async (req, res) => {
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
        { email: { $regex: search, $options: 'i' } },
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

    const [usersData, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const users = await Promise.all(
      usersData.map(async (user) => {
        const [subscriptions, payments] = await Promise.all([
          Subscription.countDocuments({ user: user._id }),
          Payment.aggregate([
            { $match: { user: user._id, status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]),
        ]);
        return {
          ...user,
          subscriptions,
          totalSpent: payments[0]?.total || 0,
        };
      }),
    );

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('getUsers error:', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get detailed user profile including stats
 * GET /api/admin/users/:id
 */
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [subscriptions, payments] = await Promise.all([
      Subscription.countDocuments({ user: user._id }),
      Payment.aggregate([
        { $match: { user: user._id, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        stats: {
          subscriptions,
          totalSpent: payments[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    logger.error('getUserDetails error:', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update user account status (ban/activate)
 * PATCH /api/admin/users/:id/status
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = status === 'active';
    user.banReason = status === 'banned' ? reason : null;
    user.bannedAt = status === 'banned' ? new Date() : null;
    await user.save();

    emitNotification(user._id, {
      title: status === 'banned' ? 'Account Suspended' : 'Account Activated',
      message:
        status === 'banned'
          ? `Your account has been suspended. Reason: ${reason}`
          : 'Your account has been activated',
      type: status === 'banned' ? 'error' : 'success',
    });

    res.json({
      success: true,
      message: `User ${status === 'active' ? 'activated' : 'banned'} successfully`,
    });
  } catch (error) {
    logger.error('updateUserStatus error:', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Perform bulk actions on users (verify, ban, delete, notify)
 * POST /api/admin/users/bulk
 */
exports.bulkUserAction = async (req, res) => {
  try {
    const { userIds, action, message } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No users selected' });
    }

    switch (action) {
      case 'verify':
        await User.updateMany({ _id: { $in: userIds } }, { $set: { isVerified: true } });
        break;
      case 'ban':
        await User.updateMany(
          { _id: { $in: userIds } },
          {
            $set: {
              isActive: false,
              bannedAt: new Date(),
              banReason: message || 'Bulk ban by admin',
            },
          },
        );
        break;
      case 'delete':
        await User.deleteMany({ _id: { $in: userIds } });
        // Also clean up subscriptions and other data associated if needed
        break;
      case 'notify':
        if (!message) {
          return res
            .status(400)
            .json({ success: false, message: 'Notification message is required' });
        }
        userIds.forEach((userId) => {
          emitNotification(userId, {
            title: 'Admin Notification',
            message,
            type: 'info',
          });
        });
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid bulk action' });
    }

    res.json({ success: true, message: `Bulk action '${action}' completed successfully` });
  } catch (error) {
    logger.error('bulkUserAction error:', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
