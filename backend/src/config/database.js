const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Migration: Set isEmailVerified: true for all existing users that do not have this field
    const User = require('../models/User');
    const updateResult = await User.updateMany(
      { isEmailVerified: { $exists: false } },
      { $set: { isEmailVerified: true } },
    );
    if (updateResult.modifiedCount > 0) {
      logger.info(
        `Database Migration: Marked ${updateResult.modifiedCount} existing users as email-verified`,
      );
    }

    // Migration: Generate slugs for all existing tiffins that don't have one
    const Tiffin = require('../models/Tiffin');
    const tiffinsWithoutSlug = await Tiffin.find({ slug: { $exists: false } });
    if (tiffinsWithoutSlug.length > 0) {
      logger.info(
        `Database Migration: Found ${tiffinsWithoutSlug.length} tiffins without slug. Generating slugs...`,
      );
      for (const tiffin of tiffinsWithoutSlug) {
        await tiffin.save(); // triggers pre-save hook to generate unique slug
      }
      logger.info('Database Migration: Slugs generated successfully.');
    }

    // Migration: Seed default banners if empty
    const Banner = require('../models/Banner');
    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      await Banner.create([
        {
          title: '50% OFF',
          subtitle: 'On your first subscription',
          bg: '#E23744',
          icon: 'gift-outline',
          order: 1,
        },
        {
          title: 'FREE delivery',
          subtitle: 'On all monthly plans',
          bg: '#FC8019',
          icon: 'bicycle-outline',
          order: 2,
        },
        {
          title: 'Authentic Taste',
          subtitle: 'Prepared by home chefs',
          bg: '#2D9A47',
          icon: 'restaurant-outline',
          order: 3,
        },
      ]);
      logger.info('Database Migration: Default banners auto-seeded successfully.');
    }
  } catch (error) {
    logger.error('Database connection error:', { stack: error.stack });
    process.exit(1);
  }
};

module.exports = connectDB;
