const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    enum: ['order', 'payment', 'delivery', 'account', 'other'],
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
    maxLength: [1000, 'Message cannot exceed 1000 characters'],
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'closed'],
    default: 'pending',
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false // Optional, in case non-logged in users can submit
  }
}, { timestamps: true });

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
