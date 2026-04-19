const SupportRequest = require('../models/SupportRequest');

/**
 * @desc    Submit a new support request
 * @route   POST /api/support
 * @access  Public
 */
exports.createSupportRequest = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const requestData = { name, email, subject, message };
    
    // Attach user ID if logged in
    if (req.user) {
      requestData.userId = req.user._id;
    }

    const supportRequest = await SupportRequest.create(requestData);

    res.status(201).json({
      success: true,
      data: supportRequest,
      message: 'Support request submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all support requests
 * @route   GET /api/support
 * @access  Private/Admin
 */
exports.getSupportRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = {};
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    const total = await SupportRequest.countDocuments(query);
    const requests = await SupportRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: requests.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update support request status
 * @route   PUT /api/support/:id/status
 * @access  Private/Admin
 */
exports.updateSupportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'investigating', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value'});
    }

    const supportRequest = await SupportRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!supportRequest) {
      return res.status(404).json({ success: false, message: 'Support request not found'});
    }

    res.status(200).json({
      success: true,
      data: supportRequest,
      message: `Support request marked as ${status}`
    });
  } catch (error) {
    next(error);
  }
};
