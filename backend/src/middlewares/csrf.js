const crypto = require('crypto');

/**
 * Stateless CSRF protection using HMAC double-submit cookie pattern.
 *
 * How it works:
 *  1. On login, the server generates a CSRF token = HMAC-SHA256(userId + timestamp, JWT_SECRET).
 *  2. The token is set as a non-httpOnly cookie so JS can read it.
 *  3. On every mutating request, the frontend reads the cookie and echoes it in X-CSRF-Token header.
 *  4. The server verifies the header value matches the cookie value.
 *
 * This does NOT require storing anything in the database.
 */

/**
 * Generate a CSRF token for a given user id.
 * @param {string} userId - The user's MongoDB id string
 * @returns {string} hex token
 */
const generateCsrfToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET env var is required for CSRF');
  const payload = `${userId}:${Math.floor(Date.now() / 1000 / 3600)}`; // rotates hourly
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
};

/**
 * Express middleware — validates the CSRF double-submit cookie.
 * Skip safe methods (GET, HEAD, OPTIONS).
 * Reads expected token from the signed cookie 'csrf_token',
 * and compares against X-CSRF-Token header.
 */
const csrfProtection = (req, res, next) => {
  // Safe HTTP methods are exempt
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Exempt auth creation routes since there is no session to protect yet
  const exemptRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/register/partner'];
  // Handle paths with or without trailing slashes/query params by checking baseUrl + path
  const reqPath = req.baseUrl ? req.baseUrl + req.path : req.path;
  if (exemptRoutes.includes(reqPath)) {
    return next();
  }

  // If the request uses a Bearer token (mobile apps), it is immune to CSRF.
  // Browsers don't automatically attach Authorization headers to cross-site requests.
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return next();
  }

  // If there is no session cookie, CSRF protection is not needed because there is no authenticated session to protect.
  // This prevents breaking guest/public endpoints (like waitlist, public support, blog view counting, and ad clicks/impressions).
  if (!req.cookies?.token || req.cookies.token === 'none') {
    return next();
  }

  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies?.csrf_token;

  if (!headerToken || !cookieToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing',
    });
  }

  // Constant-time comparison to prevent timing attacks
  const headerBuf = Buffer.from(headerToken, 'hex');
  const cookieBuf = Buffer.from(cookieToken, 'hex');

  if (headerBuf.length !== cookieBuf.length || !crypto.timingSafeEqual(headerBuf, cookieBuf)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
    });
  }

  next();
};

/**
 * Set the CSRF cookie after a user authenticates.
 * Call this from sendTokenResponse in authController.
 * @param {string} userId
 * @param {object} res - Express response
 */
const setCsrfCookie = (userId, res) => {
  const token = generateCsrfToken(userId);
  res.cookie('csrf_token', token, {
    // NOT httpOnly — JS must be able to read this to put it in the header
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  return token;
};

module.exports = { csrfProtection, generateCsrfToken, setCsrfCookie };
