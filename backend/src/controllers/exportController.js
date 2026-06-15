const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const Delivery = require('../models/Delivery');
const logger = require('../utils/logger');

/**
 * Generate CSV string from data
 */
const generateCSV = (data, headers) => {
  if (!data || data.length === 0) {
    return headers.join(',') + '\n';
  }

  const headerRow = headers.join(',');
  const rows = data.map((item) => {
    return headers
      .map((header) => {
        let value = item[header] ?? '';
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',');
  });

  return headerRow + '\n' + rows.join('\n');
};

/**
 * Export customers to CSV
 */
const exportCustomersCSV = async (req, res) => {
  try {
    const { role, status, startDate, endDate } = req.query;

    const query = { role: role || 'user' };

    if (status === 'verified') {
      query.isVerified = true;
    } else if (status === 'unverified') {
      query.isVerified = false;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);

      // Safety check: Prevent memory exhaustion from unbounded large queries
      if (startDate && endDate) {
        const diffDays = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
        if (diffDays > 180) {
          return res.status(400).json({
            success: false,
            message: 'Custom export range cannot exceed 180 days. Please refine your dates.',
          });
        }
      }
    }

    const users = await User.find(query)
      .select('name email phone role isVerified createdAt address')
      .lean();

    // Transform data for CSV
    const csvData = users.map((user) => ({
      Name: user.name,
      Email: user.email,
      Phone: user.phone || '',
      Role: user.role,
      Verified: user.isVerified ? 'Yes' : 'No',
      City: user.address?.city || '',
      JoinedDate: new Date(user.createdAt).toLocaleDateString(),
    }));

    const headers = ['Name', 'Email', 'Phone', 'Role', 'Verified', 'City', 'JoinedDate'];
    const csv = generateCSV(csvData, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="customers_' + Date.now() + '.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Export orders to CSV
 */
const exportOrdersCSV = async (req, res) => {
  try {
    const { status, startDate, endDate, partnerId } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (partnerId) {
      query.partner = partnerId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);

      if (startDate && endDate) {
        const diffDays = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
        if (diffDays > 180) {
          return res.status(400).json({
            success: false,
            message: 'Custom export range cannot exceed 180 days.',
          });
        }
      }
    }

    const deliveries = await Delivery.find(query)
      .populate('user', 'name email phone')
      .populate('subscription', 'plan')
      .populate('tiffin', 'name price')
      .lean();

    const csvData = deliveries.map((delivery) => ({
      OrderID: delivery._id.toString().slice(-8).toUpperCase(),
      CustomerName: delivery.user?.name || 'N/A',
      CustomerEmail: delivery.user?.email || 'N/A',
      CustomerPhone: delivery.user?.phone || 'N/A',
      TiffinName: delivery.tiffin?.name || 'N/A',
      Plan: delivery.subscription?.plan || 'N/A',
      Status: delivery.status,
      DeliveryDate: new Date(delivery.deliveryDate).toLocaleDateString(),
      Amount: delivery.tiffin?.price || 0,
    }));

    const headers = [
      'OrderID',
      'CustomerName',
      'CustomerEmail',
      'CustomerPhone',
      'TiffinName',
      'Plan',
      'Status',
      'DeliveryDate',
      'Amount',
    ];
    const csv = generateCSV(csvData, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders_' + Date.now() + '.csv"');
    res.send(csv);
  } catch (error) {
    logger.error('exportOrdersCSV error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Export payments to CSV
 */
const exportPaymentsCSV = async (req, res) => {
  try {
    const { status, startDate, endDate, partnerId } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (partnerId) {
      query.partner = partnerId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);

      if (startDate && endDate) {
        const diffDays = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
        if (diffDays > 180) {
          return res.status(400).json({
            success: false,
            message: 'Custom export range cannot exceed 180 days.',
          });
        }
      }
    }

    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('partner', 'name')
      .lean();

    const csvData = payments.map((payment) => ({
      PaymentID: payment._id.toString().slice(-8).toUpperCase(),
      CustomerName: payment.user?.name || 'N/A',
      CustomerEmail: payment.user?.email || 'N/A',
      PartnerName: payment.partner?.name || 'N/A',
      Amount: payment.amount,
      Status: payment.status,
      Method: payment.method || 'N/A',
      Date: new Date(payment.createdAt).toLocaleDateString(),
    }));

    const headers = [
      'PaymentID',
      'CustomerName',
      'CustomerEmail',
      'PartnerName',
      'Amount',
      'Status',
      'Method',
      'Date',
    ];
    const csv = generateCSV(csvData, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="payments_' + Date.now() + '.csv"');
    res.send(csv);
  } catch (error) {
    logger.error('exportPaymentsCSV error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Export subscriptions to CSV
 */
const exportSubscriptionsCSV = async (req, res) => {
  try {
    const { status, plan, startDate, endDate } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (plan && plan !== 'all') {
      query.plan = plan;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);

      if (startDate && endDate) {
        const diffDays = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
        if (diffDays > 180) {
          return res.status(400).json({
            success: false,
            message: 'Custom export range cannot exceed 180 days.',
          });
        }
      }
    }

    const subscriptions = await Subscription.find(query)
      .populate('user', 'name email phone')
      .populate('tiffin', 'name price')
      .populate('partner', 'name')
      .lean();

    const csvData = subscriptions.map((sub) => ({
      SubscriptionID: sub._id.toString().slice(-8).toUpperCase(),
      CustomerName: sub.user?.name || 'N/A',
      CustomerEmail: sub.user?.email || 'N/A',
      CustomerPhone: sub.user?.phone || 'N/A',
      TiffinName: sub.tiffin?.name || 'N/A',
      PartnerName: sub.partner?.name || 'N/A',
      Plan: sub.plan,
      Status: sub.status,
      StartDate: new Date(sub.startDate).toLocaleDateString(),
      EndDate: new Date(sub.endDate).toLocaleDateString(),
      Amount: sub.amount || sub.tiffin?.price || 0,
    }));

    const headers = [
      'SubscriptionID',
      'CustomerName',
      'CustomerEmail',
      'CustomerPhone',
      'TiffinName',
      'PartnerName',
      'Plan',
      'Status',
      'StartDate',
      'EndDate',
      'Amount',
    ];
    const csv = generateCSV(csvData, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="subscriptions_' + Date.now() + '.csv"',
    );
    res.send(csv);
  } catch (error) {
    logger.error('exportSubscriptionsCSV error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Generate summary report (JSON for frontend PDF generation)
 */
const getSummaryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    const [
      totalUsers,
      totalPartners,
      activeSubscriptions,
      totalRevenue,
      totalDeliveries,
      successfulDeliveries,
    ] = await Promise.all([
      User.countDocuments({ role: 'user', ...dateQuery }),
      User.countDocuments({ role: 'partner', ...dateQuery }),
      Subscription.countDocuments({ status: 'active' }),
      Payment.aggregate([
        { $match: { status: 'paid', ...dateQuery } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Delivery.countDocuments(dateQuery),
      Delivery.countDocuments({ status: 'delivered', ...dateQuery }),
    ]);

    res.json({
      success: true,
      data: {
        period: {
          start: startDate || 'All time',
          end: endDate || 'Present',
        },
        summary: {
          totalUsers,
          totalPartners,
          activeSubscriptions,
          totalRevenue: totalRevenue[0]?.total || 0,
          totalDeliveries,
          successfulDeliveries,
          deliverySuccessRate:
            totalDeliveries > 0
              ? ((successfulDeliveries / totalDeliveries) * 100).toFixed(1) + '%'
              : '0%',
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('getSummaryReport error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  exportCustomersCSV,
  exportOrdersCSV,
  exportPaymentsCSV,
  exportSubscriptionsCSV,
  getSummaryReport,
};
