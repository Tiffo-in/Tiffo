const mongoose = require('mongoose');
const User = require('./src/models/User');
const Partner = require('./src/models/Partner');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Check if partner exists
  let user = await User.findOne({ email: 'partner@tiffo.com' });
  if (!user) {
    user = new User({
      name: 'Sharma Kitchen',
      email: 'partner@tiffo.com',
      password: 'password123',
      phone: '9876543210',
      role: 'partner',
      isEmailVerified: true
    });
    await user.save();
    console.log('Created User');
  }

  let partner = await Partner.findOne({ user: user._id });
  if (!partner) {
    partner = new Partner({
      user: user._id,
      businessName: 'Sharma Authentic Kitchen',
      status: 'active',
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716] // Bangalore
      },
      address: {
        street: '123 Main St',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001'
      }
    });
    await partner.save();
    console.log('Created Partner Profile');
  } else {
    console.log('Partner already exists');
  }

  mongoose.disconnect();
}

seed().catch(console.error);
