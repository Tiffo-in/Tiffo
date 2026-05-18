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
      enum: ['scheduled', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'scheduled',
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
    },
    specialInstructions: String,
    notes: String,
    // Status timestamps — set dynamically by deliveryController
    scheduledAt: Date,
    preparingAt: Date,
    outForDeliveryAt: Date,
    deliveredAt: Date,
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
