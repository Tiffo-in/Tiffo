/**
 * validateEnv.js
 * Fail-fast environment variable validation.
 * Call this at the very top of app.js before any service is initialized.
 * In production, missing any required variable throws immediately and the
 * process exits with code 1 — preventing a partially-booted server from
 * accepting traffic.
 */
const logger = require('./logger');

const REQUIRED_ALWAYS = ['NODE_ENV', 'MONGODB_URI', 'JWT_SECRET', 'JWT_EXPIRE'];

const REQUIRED_IN_PRODUCTION = [
  'FRONTEND_URL',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
];

const RECOMMENDED = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'EMAIL_HOST',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
];

function validateEnv() {
  const missing = [];

  for (const key of REQUIRED_ALWAYS) {
    if (!process.env[key]) missing.push(key);
  }

  if (process.env.NODE_ENV === 'production') {
    for (const key of REQUIRED_IN_PRODUCTION) {
      if (!process.env[key]) missing.push(key);
    }
  }

  if (missing.length > 0) {
    logger.error(
      `FATAL: Missing required environment variable(s): ${missing.join(', ')}. ` +
        `Copy .env.example to .env and populate the missing values.`,
    );
    process.exit(1);
  }

  // Warn about recommended-but-optional vars
  const missingRecommended = RECOMMENDED.filter((k) => !process.env[k]);
  if (missingRecommended.length > 0) {
    logger.warn(
      `Some recommended env vars are not set (non-fatal): ${missingRecommended.join(', ')}`,
    );
  }

  // Safety checks on values
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    logger.warn('JWT_SECRET is less than 32 characters — use a longer secret in production.');
  }

  logger.info('Environment validation passed.');
}

module.exports = validateEnv;
