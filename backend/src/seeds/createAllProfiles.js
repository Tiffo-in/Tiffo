/**
 * Create All Profiles Seed Script
 * 
 * Run: node src/seeds/createAllProfiles.js
 * Creates: Admin, User, and Partner accounts for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Partner = require('../models/Partner');

const PROFILES = {
    admin: {
        name: process.env.SEED_ADMIN_NAME || 'Admin User',
        email: process.env.SEED_ADMIN_EMAIL,
        password: process.env.SEED_ADMIN_PASSWORD,
        phone: process.env.SEED_ADMIN_PHONE || '+91 99999 99999',
        role: 'admin',
        isVerified: true
    },
    user: {
        name: process.env.SEED_USER_NAME || 'Test Customer',
        email: process.env.SEED_USER_EMAIL,
        password: process.env.SEED_USER_PASSWORD,
        phone: process.env.SEED_USER_PHONE || '+91 88888 88888',
        role: 'user',
        isVerified: true,
        address: {
            street: '123 MG Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
        }
    },
    partner: {
        name: process.env.SEED_PARTNER_NAME || 'Tiffin Partner',
        email: process.env.SEED_PARTNER_EMAIL,
        password: process.env.SEED_PARTNER_PASSWORD,
        phone: process.env.SEED_PARTNER_PHONE || '+91 77777 77777',
        role: 'partner',
        isVerified: true,
        address: {
            street: '456 FC Road',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411001'
        }
    }
};

const PARTNER_BUSINESS = {
    businessName: 'Desi Kitchen',
    description: 'Authentic home-style Indian tiffin service with fresh, healthy meals prepared daily.',
    address: {
        street: '456 FC Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        coordinates: { lat: 18.5204, lng: 73.8567 }
    },
    contact: {
        phone: '+91 77777 77777',
        whatsapp: '+91 77777 77777',
        email: process.env.SEED_PARTNER_EMAIL || 'partner@tiffo.com'
    },
    businessHours: {
        open: '08:00',
        close: '21:00',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    deliveryRadius: 10,
    rating: { average: 4.5, count: 25 },
    verified: true,
    isActive: true
};

const createAllProfiles = async () => {
    try {
        // Validate required environment variables
        const required = ['SEED_ADMIN_EMAIL', 'SEED_ADMIN_PASSWORD', 'SEED_USER_EMAIL', 'SEED_USER_PASSWORD', 'SEED_PARTNER_EMAIL', 'SEED_PARTNER_PASSWORD', 'MONGODB_URI'];
        const missing = required.filter(key => !process.env[key]);
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        const results = { created: [], existing: [] };

        // Create each profile
        for (const [type, data] of Object.entries(PROFILES)) {
            const existing = await User.findOne({ email: data.email });

            if (existing) {
                console.log(`⚠️  ${type.toUpperCase()} already exists: ${data.email}`);
                results.existing.push({ type, email: data.email });

                // If partner exists, ensure Partner record exists too
                if (type === 'partner') {
                    const partnerRecord = await Partner.findOne({ user: existing._id });
                    if (!partnerRecord) {
                        await Partner.create({ ...PARTNER_BUSINESS, user: existing._id });
                        console.log(`   → Created Partner business record`);
                    }
                }
            } else {
                // Create the user
                const hashedPassword = await bcrypt.hash(data.password, 12);
                const user = await User.create({ ...data, password: hashedPassword });

                console.log(`✅ ${type.toUpperCase()} created: ${data.email}`);
                results.created.push({ type, email: data.email });

                // If partner, create Partner business record
                if (type === 'partner') {
                    await Partner.create({ ...PARTNER_BUSINESS, user: user._id });
                    console.log(`   → Created Partner business record: ${PARTNER_BUSINESS.businessName}`);
                }
            }
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📋 SUMMARY');
        console.log('='.repeat(50));

        if (results.created.length > 0) {
            console.log('\n🆕 Created Accounts:');
            results.created.forEach(({ type, email }) => {
                console.log(`   ${type.toUpperCase()}: ${email}`);
            });
        }

        if (results.existing.length > 0) {
            console.log('\n📌 Existing Accounts:');
            results.existing.forEach(({ type, email }) => {
                console.log(`   ${type.toUpperCase()}: ${email}`);
            });
        }

        console.log('\n✅ All profiles ready! You can login at /login');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createAllProfiles();
