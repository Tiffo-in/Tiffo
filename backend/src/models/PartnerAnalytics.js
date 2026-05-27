const mongoose = require('mongoose');

const partnerAnalyticsSchema = new mongoose.Schema({
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  visits: {
    type: Number,
    default: 0,
  },
});

// Composite unique index to ensure one record per partner per day
partnerAnalyticsSchema.index({ partner: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('PartnerAnalytics', partnerAnalyticsSchema);
