const Banner = require('../../models/Banner');
const logger = require('../../utils/logger');

// @desc    Get all banners (active or inactive, sorted by order)
// @route   GET /api/admin/banners
// @access  Private/Admin
exports.getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.status(200).json({ success: true, count: banners.length, data: banners });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new banner
// @route   POST /api/admin/banners
// @access  Private/Admin
exports.createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, bg, icon, isActive, order } = req.body;
    const banner = await Banner.create({ title, subtitle, bg, icon, isActive, order });
    logger.info(`Admin: Banner created: ${title}`);
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a banner
// @route   PUT /api/admin/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    logger.info(`Admin: Banner updated: ${banner.title}`);
    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a banner
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    logger.info(`Admin: Banner deleted: ${banner.title}`);
    res.status(200).json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    next(error);
  }
};
