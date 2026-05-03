const Waitlist = require('../models/Waitlist');
const logger = require('../utils/logger');

/**
 * POST /api/waitlist
 * Adds an email to the app launch waitlist.
 * Idempotent — returns success even if email is already on the list.
 */
exports.joinWaitlist = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Upsert — silently succeeds if already subscribed
    await Waitlist.findOneAndUpdate(
      { email },
      { email, source: req.body.source || 'home_page' },
      { upsert: true, new: true, runValidators: true }
    );

    logger.info(`Waitlist signup: ${email}`);
    res.status(200).json({ success: true, message: 'You have been added to the waitlist!' });
  } catch (error) {
    if (error.code === 11000) {
      // Already exists — treat as success to avoid email enumeration
      return res.status(200).json({ success: true, message: 'You are already on the waitlist!' });
    }
    logger.error('Waitlist signup error:', { stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to join waitlist. Please try again.' });
  }
};
