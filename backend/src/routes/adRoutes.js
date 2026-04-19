const express = require('express');
const router = express.Router();
const {
  getAdListings,
  getRecommender,
  logImpressions,
  logClick,
  createCampaign,
  getMyCampaigns,
  updateCampaign,
  createWalletOrder,
  verifyWalletPayment
} = require('../controllers/adController');
const { protect } = require('../middlewares/auth');

// Public tracking and retrieval
router.get('/listings', getAdListings);
router.get('/recommender', getRecommender);
// Support optional auth for user id tracking
router.post('/impressions', (req, res, next) => {
  // Try to authenticate but don't fail if no token
  if (req.headers.authorization) {
    protect(req, res, next);
  } else {
    next();
  }
}, logImpressions);
router.post('/clicks/:id', logClick);

// Partner Management endpoints
router.post('/', protect, createCampaign);
router.get('/mine', protect, getMyCampaigns);
router.put('/:id', protect, updateCampaign);

// Razorpay Wallet endpoints
router.post('/wallet/create-order', protect, createWalletOrder);
router.post('/wallet/verify', protect, verifyWalletPayment);

module.exports = router;
