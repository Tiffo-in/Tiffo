const Review = require('../models/Review');
const Subscription = require('../models/Subscription');
const Tiffin = require('../models/Tiffin');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Create a new review
 * POST /api/reviews
 */
exports.createReview = async (req, res) => {
    try {
        const { subscriptionId, rating, comment, categories, images } = req.body;
        const userId = req.user.id;

        // Verify subscription exists and belongs to user
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        if (subscription.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to review this subscription'
            });
        }

        // Check if subscription is completed
        if (subscription.status !== 'completed' && subscription.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Can only review active or completed subscriptions'
            });
        }

        // Check for duplicate review
        const existingReview = await Review.findOne({
            user: new mongoose.Types.ObjectId(userId),
            subscription: new mongoose.Types.ObjectId(subscriptionId)
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this subscription'
            });
        }

        // Create review
        const review = await Review.create({
            user: userId,
            partner: subscription.partner,
            tiffin: subscription.tiffin,
            subscription: subscriptionId,
            rating,
            comment,
            categories,
            images: images || []
        });

        // Populate review with user info
        await review.populate('user', 'name email');

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review
        });
    } catch (error) {
        logger.error('Create review error:', { stack: error.stack });
        res.status(500).json({ success: false, message: 'Failed to create review' });
    }
};

/**
 * Get reviews for a specific tiffin
 * GET /api/reviews/tiffin/:tiffinId
 */
exports.getReviewsByTiffin = async (req, res) => {
    try {
        const { tiffinId } = req.params;
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

        const reviews = await Review.find({ tiffin: tiffinId })
            .populate('user', 'name email')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Review.countDocuments({ tiffin: tiffinId });

        res.json({
            success: true,
            reviews,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (error) {
        logger.error('Get tiffin reviews error:', { stack: error.stack });
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
};

/**
 * Get reviews for a specific partner
 * GET /api/reviews/partner/:partnerId
 */
exports.getReviewsByPartner = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const { page = 1, limit = 10, sort = '-createdAt', tiffinId } = req.query;

        const query = { partner: partnerId };
        if (tiffinId) {
            query.tiffin = tiffinId;
        }

        const reviews = await Review.find(query)
            .populate('user', 'name email')
            .populate('tiffin', 'name')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Review.countDocuments(query);

        res.json({
            success: true,
            reviews,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (error) {
        logger.error('Get partner reviews error:', { stack: error.stack });
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
};

/**
 * Get review statistics for a tiffin
 * GET /api/reviews/tiffin/:tiffinId/stats
 */
exports.getReviewStats = async (req, res) => {
    try {
        const { tiffinId } = req.params;

        const stats = await Review.aggregate([
            { $match: { tiffin: new mongoose.Types.ObjectId(tiffinId) } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    fiveStars: {
                        $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] }
                    },
                    fourStars: {
                        $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] }
                    },
                    threeStars: {
                        $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] }
                    },
                    twoStars: {
                        $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] }
                    },
                    oneStar: {
                        $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] }
                    },
                    avgTaste: { $avg: '$categories.taste' },
                    avgQuality: { $avg: '$categories.quality' },
                    avgDelivery: { $avg: '$categories.delivery' },
                    avgPackaging: { $avg: '$categories.packaging' }
                }
            }
        ]);

        const result = stats[0] || {
            averageRating: 0,
            totalReviews: 0,
            fiveStars: 0,
            fourStars: 0,
            threeStars: 0,
            twoStars: 0,
            oneStar: 0,
            avgTaste: 0,
            avgQuality: 0,
            avgDelivery: 0,
            avgPackaging: 0
        };

        res.json({
            success: true,
            stats: result
        });
    } catch (error) {
        logger.error('Get review stats error:', { stack: error.stack });
        res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
    }
};

/**
 * Update a review
 * PUT /api/reviews/:id
 */
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, categories, images } = req.body;
        const userId = req.user.id;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns the review
        if (review.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to update this review'
            });
        }

        // Update fields
        if (rating !== undefined) review.rating = rating;
        if (comment !== undefined) review.comment = comment;
        if (categories) review.categories = categories;
        if (images !== undefined) review.images = images;

        await review.save();
        await review.populate('user', 'name email');

        res.json({
            success: true,
            message: 'Review updated successfully',
            review
        });
    } catch (error) {
        logger.error('Update review error:', { stack: error.stack });
        res.status(500).json({ success: false, message: 'Failed to update review' });
    }
};

/**
 * Delete a review
 * DELETE /api/reviews/:id
 */
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns the review or is admin
        if (review.user.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to delete this review'
            });
        }

        await review.deleteOne();

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        logger.error('Delete review error:', { stack: error.stack });
        res.status(500).json({ success: false, message: 'Failed to delete review' });
    }
};

/**
 * Mark review as helpful
 * POST /api/reviews/:id/helpful
 */
exports.markReviewHelpful = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        review.helpfulVotes += 1;
        await review.save();

        res.json({
            success: true,
            message: 'Marked as helpful',
            helpfulVotes: review.helpfulVotes
        });
    } catch (error) {
        logger.error('Mark helpful error:', { stack: error.stack });
        res.status(500).json({ success: false, message: 'Failed to mark as helpful' });
    }
};

/**
 * Get user's own reviews
 * GET /api/reviews/my-reviews
 */
exports.getMyReviews = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const reviews = await Review.find({ user: userId })
            .populate('tiffin', 'name price')
            .populate('partner', 'businessName')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Review.countDocuments({ user: userId });

        res.json({
            success: true,
            reviews,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (error) {
        logger.error('Get my reviews error:', { stack: error.stack });
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
};

module.exports = exports;
