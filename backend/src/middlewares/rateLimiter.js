const { Ratelimit } = require('@upstash/ratelimit');
const { Redis } = require('@upstash/redis');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const hasUpstash = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

let apiLimiter;
let authLimiter;

if (hasUpstash) {
  // ── Production: distributed, per-IP, stored in Upstash Redis ──────────────
  const redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const apiLimit = process.env.NODE_ENV === 'production' ? 100 : 5000;
  const authLimit = process.env.NODE_ENV === 'production' ? 5 : 500;

  const upstashApiLimiter = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(apiLimit, '15 m'),
    analytics: true,
    prefix: '@upstash/ratelimit',
  });

  const upstashAuthLimiter = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(authLimit, '15 m'),
    analytics: true,
    prefix: '@upstash/ratelimit:auth',
  });

  const buildUpstashMiddleware = (limiter) => async (req, res, next) => {
    try {
      const ip =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        '127.0.0.1';
      const { success, limit, reset, remaining } = await limiter.limit(ip);

      res.set('X-RateLimit-Limit', limit);
      res.set('X-RateLimit-Remaining', Math.max(0, remaining));
      res.set('X-RateLimit-Reset', reset);

      if (!success) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests from this IP, please try again after 15 minutes.',
        });
      }
      next();
    } catch (error) {
      // If Redis is temporarily unavailable, fail open rather than blocking all users.
      logger.error('Upstash rate limiter error — failing open:', { stack: error.stack });
      next();
    }
  };

  if (process.env.NODE_ENV !== 'production') {
    logger.warn('Development mode: Upstash rate limiting bypassed.');
    apiLimiter = (req, res, next) => next();
    authLimiter = (req, res, next) => next();
  } else {
    apiLimiter = buildUpstashMiddleware(upstashApiLimiter);
    authLimiter = buildUpstashMiddleware(upstashAuthLimiter);
  }
} else {
  // ── Development / local fallback: in-memory rate limter ───────────────────
  logger.warn(
    'Upstash Redis credentials not configured. Falling back to in-memory rate limiter. ' +
      'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production.',
  );

  apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 5000, // Relaxed in dev
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes.',
    },
  });

  authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 5 : 500, // Relaxed in dev
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many login attempts. Please try again after 15 minutes.',
    },
  });
}

module.exports = { apiLimiter, authLimiter };
