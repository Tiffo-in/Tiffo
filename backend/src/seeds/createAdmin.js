/**
 * Admin User Seed Script
 *
 * Run this script to create an admin user in the database:
 * node src/seeds/createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN_DATA = {
  name: process.env.ADMIN_NAME || 'Admin User',
  email: process.env.ADMIN_EMAIL || 'admin@tiffo.com',
  password: process.env.ADMIN_PASSWORD,
  phone: process.env.ADMIN_PHONE || '+91 99999 99999',
  role: 'admin',
  isVerified: true,
};

const createAdmin = async () => {
  try {
    // Validate required environment variables
    if (!ADMIN_DATA.password) {
      console.error('❌ Error: ADMIN_PASSWORD environment variable is required');
      console.log('   Set it in your .env file or pass it when running the script:');
      console.log('   ADMIN_PASSWORD=your_secure_password node src/seeds/createAdmin.js');
      process.exit(1);
    }

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tiffo';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_DATA.email });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', ADMIN_DATA.email);
      console.log('   Updating to admin role...');
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      await existingAdmin.save();
      console.log('✅ Existing user updated to admin');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, 12);

      // Create admin user
      const admin = await User.create({
        ...ADMIN_DATA,
        password: hashedPassword,
      });

      console.log('✅ Admin user created successfully!');
      console.log('');
      console.log('   📧 Email:', admin.email);
      console.log('   👑 Role:', admin.role);
      console.log('');
      console.log('   ⚠️  Keep your credentials secure!');
    }

    await mongoose.disconnect();
    console.log('');
    console.log('✅ Done! You can now login at /login with these credentials.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
