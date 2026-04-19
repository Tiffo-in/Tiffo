const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  tiffin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tiffin',
    required: true
  },
  plan: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    instructions: String
  },
  deliveryTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'completed'],
    default: 'active'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  originalAmount: {
    type: Number,
    default: 0   // pre-discount total, for displaying savings
  },
  discountPercent: {
    type: Number,
    default: 0
  },
  discountLabel: {
    type: String,
    default: ''
  },
  // GST stored at creation time so Razorpay charge and UI always agree
  gstRate: {
    type: Number,
    default: 5     // 5%
  },
  gstAmount: {
    type: Number,
    default: 0
  },
  // Final amount charged = totalAmount + gstAmount
  grandTotal: {
    type: Number,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'captured', 'failed', 'refunded'],
    default: 'pending'
  },
  // Razorpay payment details
  orderId: {
    type: String,
    default: null
  },
  paymentId: {
    type: String,
    default: null
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  platformCommission: {
    type: Number,
    default: 0
  },
  providerAmount: {
    type: Number,
    default: 0
  },
  transferId: {
    type: String,
    default: null
  },
  transferStatus: {
    type: String,
    enum: ['pending', 'processed', 'failed', 'reversed'],
    default: 'pending'
  },
  paidAt: Date,
  transferredAt: Date,
  pausedDates: [Date],
  specialInstructions: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);