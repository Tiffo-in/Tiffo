const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
    createReview,
    getReviewsByTiffin,
    getReviewsByPartner,
    getReviewStats,
    updateReview,
    deleteReview,
    markReviewHelpful,
    getMyReviews
} = require('../controllers/reviewController');

// Public routes
router.get('/tiffin/:tiffinId', getReviewsByTiffin);
router.get('/tiffin/:tiffinId/stats', getReviewStats);
router.get('/partner/:partnerId', getReviewsByPartner);

// Protected routes (require authentication)
router.post('/', protect, createReview);
router.get('/my-reviews', protect, getMyReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/helpful', protect, markReviewHelpful);

module.exports = router;
