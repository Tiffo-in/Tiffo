const mongoose = require('mongoose');

const adImpressionSchema = new mongoose.Schema({
  userId: {
    type: String, // Can be ObjectId or IP/Device ID if unauthenticated
    required: true,
    index: true,
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdCampaign',
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // TTL index: document will automatically be deleted after 24 hours
  },
});

module.exports = mongoose.model('AdImpression', adImpressionSchema);
