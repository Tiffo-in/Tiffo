/**
 * asyncHandler.js
 * Wraps async route controllers so that any unhandled promise rejection is
 * automatically forwarded to Express's next(error) handler.
 *
 * Without this, async errors thrown inside a controller bypass the global
 * error handler and cause either a 500 response with raw error.message or
 * (in old Express) a silent hang.
 *
 * Usage:
 *   const asyncHandler = require('../utils/asyncHandler');
 *   router.get('/resource', asyncHandler(myController));
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
