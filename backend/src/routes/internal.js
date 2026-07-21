const express = require('express');
const router = express.Router();
const { sendRenewalReminders } = require('../services/renewalService');
const logger = require('../utils/logger');

/**
 * Shared-secret gate for scheduler-driven endpoints (e.g. Cloud Scheduler).
 * Requires CRON_SECRET to be set and matched via the X-Cron-Secret header.
 */
const requireCronSecret = (req, res, next) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return res.status(503).json({ success: false, message: 'Scheduler endpoint not configured' });
  }
  if (req.get('X-Cron-Secret') !== secret) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
};

// POST /api/internal/run-renewal-reminders — idempotent; safe to call repeatedly.
router.post('/run-renewal-reminders', requireCronSecret, async (req, res, next) => {
  try {
    const result = await sendRenewalReminders();
    logger.info(`Renewal reminders triggered via internal endpoint: ${result.sent} sent`);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
