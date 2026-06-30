const express = require('express');
const router = express.Router();
const {
  createSupportRequest,
  getSupportRequests,
  updateSupportStatus,
  subscribeNewsletter,
} = require('../controllers/supportController');
const { protect } = require('../middlewares/auth');
const { adminAuth } = require('../middlewares/adminAuth');

// Public route for submitting requests (can handle optional auth inside controller)
// We use a custom middleware stack here if needed, but for now we'll just parse the token if it exists without rejecting
router.post(
  '/',
  async (req, res, next) => {
    // Optional auth: Try to extract user if token exists, but don't fail if it doesn't
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
      } catch (e) {
        // Ignore token errors for public routes
      }
    }
    next();
  },
  createSupportRequest,
);

// Newsletter subscription endpoint
router.post('/newsletter', subscribeNewsletter);

// Admin only routes
router.use(protect);
router.use(adminAuth);

router.get('/', getSupportRequests);
router.put('/:id/status', updateSupportStatus);

module.exports = router;
