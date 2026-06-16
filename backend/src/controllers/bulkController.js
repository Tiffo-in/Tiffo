const User = require('../models/User');
const { emitNotification } = require('../services/socketService');
const logger = require('../utils/logger');

/**
 * Bulk update user status (ban/activate multiple users)
 */
const bulkUpdateStatus = async (req, res) => {
  try {
    const { userIds, status, reason } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required',
      });
    }

    if (userIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Batch size too large. Maximum 100 IDs per request allowed.',
      });
    }

    if (!['active', 'banned'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Use "active" or "banned"',
      });
    }

    const updateData = {
      isActive: status === 'active',
      banReason: status === 'banned' ? reason : null,
      bannedAt: status === 'banned' ? new Date() : null,
    };

    const result = await User.updateMany({ _id: { $in: userIds } }, updateData);

    // Notify each affected user
    userIds.forEach((userId) => {
      emitNotification(userId, {
        title: status === 'banned' ? 'Account Suspended' : 'Account Activated',
        message:
          status === 'banned'
            ? `Your account has been suspended. ${reason ? `Reason: ${reason}` : ''}`
            : 'Your account has been activated',
        type: status === 'banned' ? 'error' : 'success',
      });
    });

    res.json({
      success: true,
      message: `${result.modifiedCount} users ${status === 'active' ? 'activated' : 'banned'} successfully`,
    });
  } catch (error) {
    logger.error('bulkUpdateStatus error:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Bulk delete users (soft delete)
 */
const bulkDelete = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required',
      });
    }

    if (userIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Batch size too large. Maximum 100 IDs per request allowed.',
      });
    }

    // Soft delete by marking as deleted
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      {
        isDeleted: true,
        deletedAt: new Date(),
        email: null, // Clear email to allow re-registration
      },
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} users deleted successfully`,
    });
  } catch (error) {
    logger.error('bulkDelete error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Bulk send notification
 */
const bulkNotify = async (req, res) => {
  try {
    const { userIds, title, message, type } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required',
      });
    }

    if (userIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Batch size too large. Maximum 100 IDs per request allowed.',
      });
    }

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required',
      });
    }

    // Send notification to each user
    let sentCount = 0;
    userIds.forEach((userId) => {
      emitNotification(userId, {
        title,
        message,
        type: type || 'info',
      });
      sentCount++;
    });

    res.json({
      success: true,
      message: `Notification sent to ${sentCount} users`,
    });
  } catch (error) {
    logger.error('bulkNotify error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Bulk verify users
 */
const bulkVerify = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required',
      });
    }

    if (userIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Batch size too large. Maximum 100 IDs per request allowed.',
      });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      {
        isVerified: true,
        verifiedAt: new Date(),
      },
    );

    // Notify each user
    userIds.forEach((userId) => {
      emitNotification(userId, {
        title: 'Account Verified! ✅',
        message: 'Your account has been verified successfully',
        type: 'success',
      });
    });

    res.json({
      success: true,
      message: `${result.modifiedCount} users verified successfully`,
    });
  } catch (error) {
    logger.error('bulkVerify error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Get bulk operation statistics
 */
const getBulkStats = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required',
      });
    }

    if (userIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Batch size too large. Maximum 100 IDs per request allowed.',
      });
    }

    const users = await User.find({ _id: { $in: userIds } }).select('role isVerified isActive');

    const stats = {
      total: users.length,
      byRole: {
        users: users.filter((u) => u.role === 'user').length,
        partners: users.filter((u) => u.role === 'partner').length,
        admins: users.filter((u) => u.role === 'admin').length,
      },
      verified: users.filter((u) => u.isVerified).length,
      unverified: users.filter((u) => !u.isVerified).length,
      active: users.filter((u) => u.isActive !== false).length,
      banned: users.filter((u) => u.isActive === false).length,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('getBulkStats error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  bulkUpdateStatus,
  bulkDelete,
  bulkNotify,
  bulkVerify,
  getBulkStats,
};
