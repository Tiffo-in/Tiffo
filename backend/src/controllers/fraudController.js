const FraudReport = require('../models/FraudReport');

/**
 * @desc    Submit a new fraud report
 * @route   POST /api/fraud
 * @access  Public
 */
exports.createFraudReport = async (req, res, next) => {
  try {
    const reportData = { ...req.body };

    // Attach user ID if logged in
    if (req.user) {
      reportData.reporterUserId = req.user._id;
    }

    const report = await FraudReport.create(reportData);

    res.status(201).json({
      success: true,
      data: report,
      message: 'Fraud report submitted successfully. We will investigate this matter.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all fraud reports
 * @route   GET /api/fraud
 * @access  Private/Admin
 */
exports.getFraudReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = {};
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    if (req.query.type && req.query.type !== 'all') {
      query.fraudType = req.query.type;
    }

    // ⚡ Bolt: Execute paginated find and count queries concurrently
    const [total, reports] = await Promise.all([
      FraudReport.countDocuments(query),
      FraudReport.find(query).sort({ createdAt: -1 }).skip(startIndex).limit(limit),
    ]);

    res.status(200).json({
      success: true,
      count: reports.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update fraud report status
 * @route   PUT /api/fraud/:id/status
 * @access  Private/Admin
 */
exports.updateFraudReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['open', 'under_investigation', 'action_taken', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const report = await FraudReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Fraud report not found' });
    }

    res.status(200).json({
      success: true,
      data: report,
      message: `Fraud report marked as ${status}`,
    });
  } catch (error) {
    next(error);
  }
};
