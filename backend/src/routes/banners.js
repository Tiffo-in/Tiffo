const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');

// @desc    Get all active banners sorted by order
// @route   GET /api/banners
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.status(200).json({ success: true, count: banners.length, data: banners });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
