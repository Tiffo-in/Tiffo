const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required']
  },
  description: {
    type: String,
    maxlength: 500
  },
  logo: {
    type: String,
    default: ''
  },
  foodImages: {
    type: [String],
    default: []
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contact: {
    phone: String,
    whatsapp: String,
    email: String
  },
  businessHours: {
    open: String,
    close: String,
    workingDays: [String]
  },
  deliveryRadius: {
    type: Number,
    default: 5
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  verified: {
    type: Boolean,
    default: false
  },
  documents: {
    fssai: String,
    gst: String,
    pan: String
  },
  bankDetails: {
    accountNumber: {
      type: String,
      select: false
    },
    ifscCode: String,
    accountHolderName: String,
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date
  },
  razorpayAccountId: {
    type: String,
    default: null
  },
  commissionRate: {
    type: Number,
    default: 0.10 // 10% platform commission
  },
  payoutEnabled: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  hasActiveSubscriptionBadge: {
    type: Boolean,
    default: false
  },
  // Partner approval tracking (set by admin)
  verifiedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // [longitude, latitude]
  }
}, {
  timestamps: true
});

// Create a 2dsphere index on the location field
partnerSchema.index({ location: '2dsphere' });

// Pre-save hook to automatically capture and sync address coordinates into GeoJSON location format
partnerSchema.pre('save', function (next) {
  if (this.address && this.address.coordinates && this.address.coordinates.lat != null && this.address.coordinates.lng != null) {
    this.location = {
      type: 'Point',
      coordinates: [this.address.coordinates.lng, this.address.coordinates.lat]
    };
  }
  next();
});

module.exports = mongoose.model('Partner', partnerSchema);