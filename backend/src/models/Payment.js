const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner', // fixed: was 'User', businessName lives on Partner
      required: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'stripe', 'wallet', 'cash'],
      required: true,
    },
    paymentId: String,
    orderId: String,
    signature: String,
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },

    // Refund fields
    refundId: String,
    refundAmount: Number,
    refundReason: String,
    refundedAt: Date,
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    failureReason: String,

    // Payout tracking fields
    payoutStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    payoutDate: Date,
    payoutId: String,
    payoutAmount: Number,

    // Dispute fields
    isDisputed: {
      type: Boolean,
      default: false,
    },
    disputeStatus: {
      type: String,
      enum: ['pending', 'under_review', 'escalated', 'resolved'],
      default: 'pending',
    },
    disputeReason: String,
    disputeCreatedAt: Date,
    disputeResolution: String,
    disputeNotes: String,
    disputeResolvedAt: Date,
    disputeResolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ partner: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ payoutStatus: 1 });
paymentSchema.index({ isDisputed: 1, disputeStatus: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
