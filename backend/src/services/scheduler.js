const cron = require('node-cron');
const { sendRenewalReminders } = require('./renewalService');
const logger = require('../utils/logger');

/**
 * In-process scheduler. Reminder logic is idempotent (renewalReminderSentAt),
 * so running it here is safe even on multiple Cloud Run instances — a
 * duplicate run simply finds nothing left to send. For a single authoritative
 * trigger in production, POST /api/internal/run-renewal-reminders from Cloud
 * Scheduler instead; both call the same idempotent service.
 *
 * Disabled in tests and when DISABLE_CRON is set.
 */
const startScheduler = () => {
  if (process.env.NODE_ENV === 'test' || process.env.DISABLE_CRON === 'true') return;

  // Every day at 09:00 IST.
  cron.schedule(
    '0 9 * * *',
    () => {
      sendRenewalReminders().catch((e) =>
        logger.error(`Scheduled renewal reminders failed: ${e.message}`),
      );
    },
    { timezone: 'Asia/Kolkata' },
  );

  logger.info('Scheduler started: renewal reminders daily at 09:00 IST');
};

module.exports = { startScheduler };
