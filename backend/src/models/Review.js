const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
    },
    tiffin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tiffin',
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    images: [String],
    categories: {
      taste: Number,
      quality: Number,
      delivery: Number,
      packaging: Number,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    // Tracks user IDs who have voted helpful — prevents duplicate votes
    helpfulBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Set to true only after at least one delivery has been confirmed
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
reviewSchema.index({ tiffin: 1, createdAt: -1 }); // tiffin reviews, newest first
reviewSchema.index({ user: 1, subscription: 1 }, { unique: true }); // prevent duplicate reviews
reviewSchema.index({ partner: 1, createdAt: -1 }); // partner analytics

module.exports = mongoose.model('Review', reviewSchema);
