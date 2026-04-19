const mongoose = require('mongoose');

const paymentLogSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['payment', 'transfer', 'refund', 'reversal'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        required: true
    },
    // Razorpay IDs
    orderId: String,
    paymentId: String,
    transferId: String,
    refundId: String,

    // Amounts
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },

    // References
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Razorpay account details
    recipientAccountId: String,

    // Additional data
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Error details (if failed)
    errorCode: String,
    errorDescription: String,

    // Timestamps
    processedAt: Date,
    failedAt: Date
}, {
    timestamps: true
});

// Indexes for faster queries
paymentLogSchema.index({ subscriptionId: 1 });
paymentLogSchema.index({ userId: 1 });
paymentLogSchema.index({ partnerId: 1 });
paymentLogSchema.index({ paymentId: 1 });
paymentLogSchema.index({ transferId: 1 });
paymentLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PaymentLog', paymentLogSchema);
