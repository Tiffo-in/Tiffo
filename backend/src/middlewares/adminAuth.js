/**
 * Admin authentication middleware
 * Verifies that the user has admin role
 */
const adminAuth = (req, res, next) => {
  // Check if user is authenticated (from previous auth middleware)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  next();
};

/**
 * Super admin authentication (for critical operations)
 */
const superAdminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'admin' || !req.user.isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required',
    });
  }

  next();
};

module.exports = { adminAuth, superAdminAuth };
