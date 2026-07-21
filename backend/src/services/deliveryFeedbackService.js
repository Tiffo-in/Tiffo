const Delivery = require('../models/Delivery');

const httpError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

/**
 * Store the customer's rating/comment for a delivered meal. Idempotent —
 * re-submitting overwrites the previous feedback for that delivery.
 */
exports.submitFeedback = async (deliveryId, userId, { rating, comment, images }) => {
  const numericRating = Number(rating);
  if (!numericRating || numericRating < 1 || numericRating > 5) {
    throw httpError('Rating must be between 1 and 5', 400);
  }

  const delivery = await Delivery.findOne({ _id: deliveryId, user: userId });
  if (!delivery) throw httpError('Delivery not found', 404);
  if (delivery.status !== 'delivered') {
    throw httpError('You can only rate a delivered meal', 400);
  }

  delivery.feedback = {
    rating: numericRating,
    comment: (comment || '').trim(),
    images: Array.isArray(images) ? images.slice(0, 5) : [],
    submittedAt: new Date(),
  };
  await delivery.save();
  return delivery.feedback;
};

/**
 * File a problem report for one delivery. One open report per delivery;
 * flagged for admin review (resolution can grant a make-up day later).
 */
exports.reportIssue = async (deliveryId, userId, { reason, comment }) => {
  const VALID = ['not_delivered', 'late', 'wrong_item', 'quality', 'other'];
  if (!VALID.includes(reason)) throw httpError('Invalid report reason', 400);

  const delivery = await Delivery.findOne({ _id: deliveryId, user: userId });
  if (!delivery) throw httpError('Delivery not found', 404);
  if (['scheduled', 'skipped', 'cancelled'].includes(delivery.status)) {
    throw httpError('This delivery cannot be reported', 400);
  }
  if (delivery.report && delivery.report.status === 'open') {
    throw httpError('A report is already open for this delivery', 409);
  }

  delivery.report = {
    reason,
    comment: (comment || '').trim(),
    status: 'open',
    createdAt: new Date(),
  };
  await delivery.save();
  return delivery.report;
};
