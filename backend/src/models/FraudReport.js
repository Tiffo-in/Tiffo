const mongoose = require('mongoose');

const fraudReportSchema = new mongoose.Schema(
  {
    reporterName: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    reporterEmail: {
      type: String,
      required: [true, 'Please provide your email'],
    },
    reporterPhone: {
      type: String,
      trim: true,
    },
    fraudType: {
      type: String,
      required: [true, 'Please select a fraud type'],
      enum: ['payment', 'fake_partner', 'food_quality', 'delivery', 'identity', 'other'],
    },
    partnerName: {
      type: String,
      trim: true,
    },
    orderId: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description of the fraud'],
      maxLength: [2000, 'Description cannot exceed 2000 characters'],
    },
    evidence: {
      type: String,
      maxLength: [1000, 'Evidence description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['open', 'under_investigation', 'action_taken', 'dismissed'],
      default: 'open',
    },
    reporterUserId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('FraudReport', fraudReportSchema);
