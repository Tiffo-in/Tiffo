const mongoose = require('mongoose');

/**
 * Billable ad-click log, used to deduplicate clicks per viewer per campaign.
 * A viewer (authenticated user id, or IP for guests) is billed at most once
 * per campaign per cooldown window — repeat clicks inside the window are
 * acknowledged but not billed, which blunts click-fraud scripts.
 */
const adClickSchema = new mongoose.Schema({
  userId: {
    type: String, // ObjectId string for logged-in users, IP for guests
    required: true,
    index: true,
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdCampaign',
    required: true,
    index: true,
  },
  billed: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // TTL: click logs only matter for same-day dedupe
  },
});

adClickSchema.index({ userId: 1, campaignId: 1, createdAt: -1 });

module.exports = mongoose.model('AdClick', adClickSchema);
