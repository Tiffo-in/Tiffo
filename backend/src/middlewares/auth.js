const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { setCsrfCookie } = require('./csrf');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token && req.cookies.token !== 'none') {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in to continue.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found. Please log in again.',
      });
    }

    // Check if account is active — admin bans take effect on the very next request
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: user.banReason
          ? `Account suspended: ${user.banReason}`
          : 'Your account has been suspended. Please contact support.',
      });
    }

    req.user = user;

    // Set CSRF cookie for cookie-based sessions if it's missing to prevent race conditions on subsequent requests
    if (
      req.cookies &&
      req.cookies.token &&
      req.cookies.token !== 'none' &&
      !req.cookies.csrf_token
    ) {
      setCsrfCookie(user._id.toString(), res, req);
    }

    next();
  } catch (error) {
    logger.warn('Auth token validation failed:', { message: error.message });
    res.status(401).json({
      success: false,
      message: 'Session expired. Please log in again.',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
