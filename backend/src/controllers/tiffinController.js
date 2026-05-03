const Tiffin = require('../models/Tiffin');
const Partner = require('../models/Partner');
const logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');

const getTiffins = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      mealType,
      cuisine,
      dietary,
      minPrice,
      maxPrice,
      lat,
      lng,
      radius = 10
    } = req.query;

    let query = { isActive: true };

    if (mealType) query.mealType = mealType;
    if (cuisine) query.cuisine = new RegExp(cuisine, 'i');
    if (dietary) query.dietary = { $in: dietary.split(',') };
    if (minPrice || maxPrice) {
      query['price.daily'] = {};
      if (minPrice) query['price.daily'].$gte = Number(minPrice);
      if (maxPrice) query['price.daily'].$lte = Number(maxPrice);
    }

    let partnerDistances = {};

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const searchRadius = parseFloat(radius);

      const partners = await Partner.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [userLng, userLat] },
            distanceField: "distance",
            maxDistance: searchRadius * 1000, // MongoDB uses meters for 2dsphere
            distanceMultiplier: 1 / 1000,     // Convert output back to km
            spherical: true
          }
        }
      ]);

      const partnerIds = partners.map(p => p._id);
      partners.forEach(p => {
        partnerDistances[p._id.toString()] = p.distance;
      });

      query.partner = { $in: partnerIds };
    }

    // Since we handle pagination in memory when sorted by distance, we get all matching tiffins first
    let tiffins = await Tiffin.find(query)
      .populate('partner', 'businessName rating address deliveryRadius location');

    if (lat && lng) {
      tiffins = tiffins.map(tiffin => {
        const tiffinObj = tiffin.toObject();
        tiffinObj.distance = parseFloat(partnerDistances[tiffinObj.partner._id.toString()].toFixed(2));
        tiffinObj.withinRadius = true;
        return tiffinObj;
      }).sort((a, b) => a.distance - b.distance);
    } else {
      tiffins = tiffins.sort((a, b) => b.rating.average - a.rating.average);
    }

    const total = tiffins.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedTiffins = tiffins.slice(startIndex, startIndex + Number(limit));

    res.json({
      success: true,
      data: paginatedTiffins,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
        total
      },
      locationFilter: lat && lng ? {
        enabled: true,
        userLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
        radius: parseFloat(radius)
      } : { enabled: false }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getTiffin = async (req, res) => {
  try {
    const tiffin = await Tiffin.findById(req.params.id)
      .populate('partner', 'businessName rating address contact businessHours');

    if (!tiffin) {
      return res.status(404).json({
        success: false,
        message: 'Tiffin not found'
      });
    }

    res.json({
      success: true,
      data: tiffin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const createTiffin = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found'
      });
    }

    const tiffin = await Tiffin.create({
      ...req.body,
      partner: partner._id
    });

    res.status(201).json({
      success: true,
      data: tiffin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateTiffin = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    const tiffin = await Tiffin.findOneAndUpdate(
      { _id: req.params.id, partner: partner._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!tiffin) {
      return res.status(404).json({
        success: false,
        message: 'Tiffin not found'
      });
    }

    res.json({
      success: true,
      data: tiffin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const deleteTiffin = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    const tiffin = await Tiffin.findOneAndDelete({
      _id: req.params.id,
      partner: partner._id
    });

    if (!tiffin) {
      return res.status(404).json({
        success: false,
        message: 'Tiffin not found'
      });
    }

    res.json({
      success: true,
      message: 'Tiffin deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// PATCH /api/tiffins/:id/discount  — partner-only
const updateDiscount = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner profile not found' });
    }

    const { weekly = 0, monthly = 0, isActive = false, label = '', expiresAt = null } = req.body;

    // Validate ranges
    if (weekly < 0 || weekly > 70 || monthly < 0 || monthly > 70) {
      return res.status(400).json({
        success: false,
        message: 'Discount percentages must be between 0 and 70'
      });
    }

    const tiffin = await Tiffin.findOneAndUpdate(
      { _id: req.params.id, partner: partner._id },
      {
        $set: {
          'discount.weekly':    Number(weekly),
          'discount.monthly':   Number(monthly),
          'discount.isActive':  Boolean(isActive),
          'discount.label':     label || '',
          'discount.expiresAt': expiresAt ? new Date(expiresAt) : null
        }
      },
      { new: true, runValidators: true }
    );

    if (!tiffin) {
      return res.status(404).json({ success: false, message: 'Tiffin not found or not yours' });
    }

    res.json({
      success: true,
      message: 'Discount updated successfully',
      data: tiffin
    });
  } catch (error) {
    logger.error(error.message, { stack: error.stack }); res.status(400).json({ success: false, message: error.message });
  }
};

// PATCH /api/tiffins/:id/menu  — partner-only: replace entire menuItems array
const updateMenuItems = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner profile not found' });
    }

    const { menuItems } = req.body;
    if (!Array.isArray(menuItems)) {
      return res.status(400).json({ success: false, message: 'menuItems must be an array' });
    }

    // Validate and sanitize each item
    const sanitized = menuItems.map((item, idx) => {
      if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
        throw new Error(`Item at index ${idx} is missing a name`);
      }
      return {
        name:        item.name.trim(),
        description: (item.description || item.desc || '').trim(),
        image:       item.image || '',
        category:    item.category || 'main',
        tags:        Array.isArray(item.tags)
                       ? item.tags.map(t => String(t).trim()).filter(Boolean)
                       : []
      };
    });

    const tiffin = await Tiffin.findOneAndUpdate(
      { _id: req.params.id, partner: partner._id },
      { $set: { menuItems: sanitized } },
      { new: true, runValidators: true }
    );

    if (!tiffin) {
      return res.status(404).json({ success: false, message: 'Tiffin not found or not yours' });
    }

    res.json({
      success: true,
      message: 'Menu updated successfully',
      data: tiffin
    });
  } catch (error) {
    logger.error(error.message, { stack: error.stack });
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/tiffins/mine  — partner's own tiffins (including inactive)
const getMyTiffins = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner profile not found' });
    }

    const tiffins = await Tiffin.find({ partner: partner._id });
    res.json({ success: true, data: tiffins });
  } catch (error) {
    logger.error(error.message, { stack: error.stack }); res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTiffins:     asyncHandler(getTiffins),
  getTiffin:      asyncHandler(getTiffin),
  createTiffin:   asyncHandler(createTiffin),
  updateTiffin:   asyncHandler(updateTiffin),
  deleteTiffin:   asyncHandler(deleteTiffin),
  updateDiscount: asyncHandler(updateDiscount),
  updateMenuItems:asyncHandler(updateMenuItems),
  getMyTiffins:   asyncHandler(getMyTiffins)
};