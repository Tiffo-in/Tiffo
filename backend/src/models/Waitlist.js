const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email address']
  },
  source: {
    type: String,
    default: 'home_page'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Waitlist', waitlistSchema);
