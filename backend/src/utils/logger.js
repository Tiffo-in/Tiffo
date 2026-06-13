const { createLogger, format, transports } = require('winston');

const Sentry = require('@sentry/node');

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, stack }) =>
          stack
            ? `${timestamp} [${level}]: ${message}\n${stack}`
            : `${timestamp} [${level}]: ${message}`,
        ),
      ),
    }),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'backend.log' }),
  ],
});

// ── Sentry Integration ────────────────────────────────────────────────────────
// Overload the logger.error method to also send exceptions to Sentry
const originalError = logger.error;
logger.error = function (message, meta) {
  if (process.env.SENTRY_DSN && meta && (meta instanceof Error || meta.stack)) {
    Sentry.captureException(meta instanceof Error ? meta : new Error(message));
  }
  return originalError.apply(this, arguments);
};

module.exports = logger;
