const crypto = require('crypto');

// Simple CSRF token validation middleware
// Tokens should be sent in X-CSRF-Token header
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'];
  const sessionToken = req.user?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }

  next();
};

// Generate CSRF token for authenticated users
const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = { csrfProtection, generateCsrfToken };
