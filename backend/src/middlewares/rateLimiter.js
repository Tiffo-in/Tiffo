const { Ratelimit } = require("@upstash/ratelimit");
const { Redis } = require("@upstash/redis");
const logger = require('../utils/logger');

// Initialize Upstash Redis client
const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// General API rate limiter: 100 requests per 15 min (per IP)
const upstashRateLimiter = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(100, "15 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

// Strict auth rate limiter: 10 requests per 15 min (login / register only)
const upstashAuthLimiter = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  analytics: true,
  prefix: "@upstash/ratelimit:auth",
});

/**
 * Build an Express middleware from a given Upstash limiter instance.
 */
const buildLimiterMiddleware = (limiter, bypassCheck) => async (req, res, next) => {
  try {
    if (bypassCheck && bypassCheck()) return next();
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const { success, limit, reset, remaining } = await limiter.limit(ip);

    res.set("X-RateLimit-Limit", limit);
    res.set("X-RateLimit-Remaining", Math.max(0, remaining));
    res.set("X-RateLimit-Reset", reset);

    if (!success) {
      return res.status(429).json({
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes."
      });
    }
    next();
  } catch (error) {
    logger.error('Upstash rate limiter error:', { stack: error.stack });
    next();
  }
};

const noUpstash = () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    logger.warn('Upstash Redis credentials not found. Rate limiting is bypassed.');
    return true;
  }
  return false;
};

const apiLimiter  = buildLimiterMiddleware(upstashRateLimiter,  noUpstash);
const authLimiter = buildLimiterMiddleware(upstashAuthLimiter, noUpstash);

module.exports = { apiLimiter, authLimiter };

