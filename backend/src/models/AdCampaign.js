const mongoose = require('mongoose');

const adCampaignSchema = new mongoose.Schema(
  {
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
    },
    tiffin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tiffin',
    },
    slot: {
      type: String,
      enum: ['Lunch', 'Dinner', 'AllDay'],
      required: true,
    },
    maxBidPerClick: {
      type: Number,
      required: true,
      min: 0.5, // minimum bid
    },
    dailyBudget: {
      type: Number,
      required: true,
      min: 10,
    },
    spentToday: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    // Wallet / Balance specific to ads
    walletBalance: {
      type: Number,
      default: 0,
    },
    // Partner Features Upsell
    hasTrialMealBoost: {
      type: Boolean,
      default: false,
    },
    trialMealPrice: {
      type: Number,
      default: null,
    },
    menuOfTheDay: {
      type: String,
      default: '',
    },
    // Ad Fatigue & Metrics
    freeImpressions: {
      type: Number,
      default: 500, // New Kitchen Boost
    },
    impressionsCount: {
      type: Number,
      default: 0,
    },
    clicksCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Tracks the last date spentToday was reset — used for lazy daily reset
    lastSpentDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Reset spentToday if necessary based on cron or lazy evaluation (e.g. at request time)
// Could add a `lastSpentDate` to compare against today's date

module.exports = mongoose.model('AdCampaign', adCampaignSchema);
