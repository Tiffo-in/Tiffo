const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner'],
      required: true,
    },
    deliveryTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'preparing', 'out_for_delivery', 'delivered', 'skipped', 'cancelled'],
      default: 'scheduled',
    },
    // Set on the make-up delivery generated when a day is skipped, pointing at
    // the delivery that was skipped — lets unskip reverse the make-up cleanly.
    makeupForDelivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
      default: null,
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    deliveryPerson: {
      name: String,
      phone: String,
    },
    trackingInfo: {
      estimatedTime: Date,
      actualTime: Date,
      route: [
        {
          lat: Number,
          lng: Number,
          timestamp: Date,
        },
      ],
    },
    feedback: {
      rating: Number,
      comment: String,
      images: [String],
      submittedAt: Date,
    },
    // Customer-reported problem with a specific day's delivery (missed, late,
    // quality). Reviewed by an admin; resolution may grant a make-up day.
    report: {
      reason: {
        type: String,
        enum: ['not_delivered', 'late', 'wrong_item', 'quality', 'other'],
      },
      comment: String,
      status: {
        type: String,
        enum: ['open', 'resolved', 'dismissed'],
        default: 'open',
      },
      createdAt: Date,
      resolvedAt: Date,
    },
    specialInstructions: String,
    notes: String,
    // Status timestamps — set dynamically by deliveryController
    scheduledAt: Date,
    preparingAt: Date,
    outForDeliveryAt: Date,
    deliveredAt: Date,
    skippedAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
  },
);

// Database indexing for frequent queries
deliverySchema.index({ partner: 1, deliveryDate: 1, status: 1 });
deliverySchema.index({ subscription: 1, status: 1 });
deliverySchema.index({ user: 1, deliveryDate: -1 });

module.exports = mongoose.model('Delivery', deliverySchema);
