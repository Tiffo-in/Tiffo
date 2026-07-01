const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      required: [true, 'Banner subtitle is required'],
      trim: true,
    },
    bg: {
      type: String,
      default: '#E23744',
    },
    icon: {
      type: String,
      default: 'gift-outline',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Banner', bannerSchema);
