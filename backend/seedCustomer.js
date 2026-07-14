const mongoose = require('mongoose');
const User = require('./src/models/User');
const crypto = require('crypto');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  let user = await User.findOne({ email: 'customer@tiffo.com' });
  if (!user) {
    const password = process.env.SEED_PASSWORD || crypto.randomBytes(12).toString('hex');
    user = new User({
      name: 'Rishi Pandey',
      email: 'customer@tiffo.com',
      password: password,
      phone: '9876543211',
      role: 'user',
      isEmailVerified: true
    });
    await user.save();
    console.log('Created Customer User');
    console.log(`Email: customer@tiffo.com`);
    console.log(`Password: ${password}`);
  } else {
    console.log('Customer already exists');
  }

  mongoose.disconnect();
}

seed().catch(console.error);
