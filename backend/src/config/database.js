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
  } catch (error) {
    logger.error('Database connection error:', { stack: error.stack });
    process.exit(1);
  }
};

module.exports = connectDB;
