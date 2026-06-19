const Delivery = require('../models/Delivery');

const { emitDeliveryUpdate } = require('../services/socketService');
const logger = require('../utils/logger');
const escapeRegex = require('../utils/escapeRegex');

/**
 * Update delivery status
 * PUT /api/deliveries/:deliveryId/status
 */
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status, notes } = req.body;

    const delivery = await Delivery.findOneAndUpdate(
      { _id: deliveryId, partner: req.user.id },
      {
        status,
        notes,
        [`${status}At`]: new Date(),
      },
      { new: true },
    )
      .populate('user', 'name phone')
      .populate('subscription');

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    // Emit real-time update
    emitDeliveryUpdate(delivery._id, delivery.user._id, req.user.id, status, { delivery });

    res.json({ success: true, data: delivery });
  } catch (error) {
    logger.error('updateDeliveryStatus error:', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get delivery details
 * GET /api/deliveries/:deliveryId
 */
exports.getDeliveryDetails = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.deliveryId)
      .populate('user', 'name phone address')
      .populate('subscription')
      .populate('partner', 'businessName phone');

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    res.json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get deliveries for partner
 * GET /api/deliveries/partner/my-deliveries
 */
exports.getPartnerDeliveries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { status, date } = req.query;

    const query = { partner: req.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.deliveryDate = { $gte: startDate, $lte: endDate };
    }

    // ⚡ Bolt: Execute paginated find and count queries concurrently
    const [deliveries, total] = await Promise.all([
      Delivery.find(query)
        .populate('user', 'name phone address')
        .populate('subscription', 'plan')
        .sort({ deliveryDate: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Delivery.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: deliveries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get delivery statistics for partner
 * GET /api/deliveries/partner/stats
 */
exports.getDeliveryStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await Delivery.aggregate([
      {
        $match: {
          partner: req.user._id,
          deliveryDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          outForDelivery: { $sum: { $cond: [{ $eq: ['$status', 'out_for_delivery'] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        },
      },
    ]);

    // Today's deliveries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayDeliveries = await Delivery.countDocuments({
      partner: req.user.id,
      deliveryDate: { $gte: today, $lt: tomorrow },
    });

    res.json({
      success: true,
      data: {
        ...(stats[0] || {
          total: 0,
          pending: 0,
          outForDelivery: 0,
          delivered: 0,
          cancelled: 0,
        }),
        todayDeliveries,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Batch update delivery status
 * POST /api/deliveries/batch-update
 */
exports.batchUpdateDeliveries = async (req, res) => {
  try {
    const { deliveryIds, status, notes } = req.body;

    if (!deliveryIds || !Array.isArray(deliveryIds) || deliveryIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Delivery IDs array is required' });
    }

    if (deliveryIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Batch size too large. Maximum 100 IDs per request allowed.',
      });
    }

    const result = await Delivery.updateMany(
      {
        _id: { $in: deliveryIds },
        partner: req.user.id,
      },
      {
        status,
        notes,
        [`${status}At`]: new Date(),
      },
    );

    // Emit updates for each delivery
    const deliveries = await Delivery.find({ _id: { $in: deliveryIds } }).populate('user', '_id');

    deliveries.forEach((delivery) => {
      emitDeliveryUpdate(delivery._id, delivery.user._id, req.user.id, status, { delivery });
    });

    res.json({
      success: true,
      message: `${result.modifiedCount} deliveries updated`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error('batchUpdateDeliveries error:', { error: error.message });
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get admin delivery overview
 * GET /api/admin/deliveries/overview
 */
exports.getAdminDeliveryOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayStats, weekStats] = await Promise.all([
      // Today's stats
      Delivery.aggregate([
        { $match: { deliveryDate: { $gte: today } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      // Weekly stats
      Delivery.aggregate([
        { $match: { deliveryDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const todayByStatus = {};
    todayStats.forEach((stat) => {
      todayByStatus[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        today: todayByStatus,
        week: weekStats[0] || { total: 0, delivered: 0 },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * Get all deliveries for admin
 * GET /api/deliveries/admin
 */
exports.getAdminDeliveries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const { status, date, search } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.deliveryDate = { $gte: startDate, $lte: endDate };
    }

    if (search) {
      // Server-side search via aggregation + $lookup so we can filter on populated fields
      const safeSearch = escapeRegex(search);
      const searchRegex = { $regex: safeSearch, $options: 'i' };
      const searchFilter = {
        $or: [
          { 'userInfo.name': searchRegex },
          { 'userInfo.phone': searchRegex },
          { 'partnerInfo.businessName': searchRegex },
        ],
      };

      const pipeline = [
        { $match: query },
        { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' } },
        { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'partners',
            localField: 'partner',
            foreignField: 'user',
            as: 'partnerInfo',
          },
        },
        { $unwind: { path: '$partnerInfo', preserveNullAndEmptyArrays: true } },
        { $match: searchFilter },
      ];

      const [deliveries, countResult] = await Promise.all([
        Delivery.aggregate([
          ...pipeline,
          { $sort: { deliveryDate: -1, createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ]),
        Delivery.aggregate([...pipeline, { $count: 'total' }]),
      ]);

      const total = countResult[0]?.total || 0;
      return res.json({
        success: true,
        data: deliveries,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    }

    // No search — standard populate query
    const [deliveries, total] = await Promise.all([
      Delivery.find(query)
        .populate('user', 'name phone address')
        .populate('partner', 'businessName phone')
        .populate('subscription', 'plan')
        .sort({ deliveryDate: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Delivery.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: deliveries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
